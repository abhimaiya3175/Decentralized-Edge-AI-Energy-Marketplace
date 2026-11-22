"""Train and compare time-aware Energy Consumption regression models."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    GradientBoostingRegressor,
    HistGradientBoostingRegressor,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder

from energy_consumption_features import (
    CATEGORICAL_COLUMNS,
    MODEL_FEATURE_COLUMNS,
    NUMERIC_COLUMNS,
    REQUIRED_COLUMNS,
    prepare_features,
)


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "data" / "Energy_consumption.csv"
ARTIFACT_PATH = BASE_DIR / "energy_consumption_model.pkl"
METADATA_PATH = BASE_DIR / "energy_consumption_model_metadata.json"
REPORT_PATH = BASE_DIR / "energy_consumption_model_report.md"


def make_pipeline(regressor):
    preprocessing = ColumnTransformer([
        ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_COLUMNS),
        ("categorical", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]), CATEGORICAL_COLUMNS),
    ])
    return Pipeline([("preprocessing", preprocessing), ("model", regressor)])


def metrics_for(model, x_validation, y_validation):
    predictions = model.predict(x_validation)
    mse = mean_squared_error(y_validation, predictions)
    return {
        "mae": float(mean_absolute_error(y_validation, predictions)),
        "mse": float(mse),
        "rmse": float(np.sqrt(mse)),
        "r2": float(r2_score(y_validation, predictions)),
    }


def write_report(metadata):
    rows = "\n".join(
        f"| {name} | {result['mae']:.4f} | {result['mse']:.4f} | {result['rmse']:.4f} | {result['r2']:.4f} |"
        for name, result in metadata["model_comparison"].items()
    )
    hyperparams_section = ""
    if metadata.get("best_hyperparameters"):
        hp_rows = "\n".join(f"- `{k}`: `{v}`" for k, v in metadata["best_hyperparameters"].items())
        hyperparams_section = f"\n### Optimal Hyperparameters for {metadata['selected_algorithm']}:\n\n{hp_rows}\n"

    report = f"""# Energy Consumption Model Report

## Dataset validation

- Source: `{metadata['dataset_path']}`
- Rows after chronological sorting and duplicate removal: {metadata['dataset_rows']}
- Missing required values: {metadata['missing_values']}
- Duplicate rows removed: {metadata['duplicates_removed']}
- Training period: {metadata['training_period']['start']} to {metadata['training_period']['end']}
- Validation period: {metadata['validation_period']['start']} to {metadata['validation_period']['end']}
- Target unit: {metadata['target_unit']}

## Time-aware validation

The earliest 80% of rows form the training set and the latest 20% form the validation set. No future rows are used to predict earlier rows.

| Model | MAE | MSE | RMSE | R² |
| --- | ---: | ---: | ---: | ---: |
{rows}

Selected model: **{metadata['selected_algorithm']}** (lowest chronological validation RMSE).
{hyperparams_section}
## Features

{', '.join(metadata['feature_columns'])}

The dataset does not declare a physical unit for `EnergyConsumption`; predictions retain the dataset-defined unit without assigning an unsupported label.
"""
    REPORT_PATH.write_text(report, encoding="utf-8")


def main():
    if not DATASET_PATH.is_file():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    raw = pd.read_csv(DATASET_PATH)
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in raw.columns]
    if missing_columns:
        raise ValueError(f"Dataset is missing columns: {', '.join(missing_columns)}")

    duplicate_rows = int(raw.duplicated().sum())
    raw = raw.drop_duplicates().copy()
    prepared = prepare_features(raw, include_target=True)
    prepared["_timestamp"] = pd.to_datetime(raw["Timestamp"], errors="raise")
    prepared = prepared.sort_values("_timestamp").reset_index(drop=True)

    split_index = int(len(prepared) * 0.8)
    if split_index < 1 or len(prepared) - split_index < 1:
        raise ValueError("Dataset needs at least two rows for chronological validation.")

    training = prepared.iloc[:split_index]
    validation = prepared.iloc[split_index:]
    x_train = training[MODEL_FEATURE_COLUMNS]
    y_train = training["EnergyConsumption"]
    x_validation = validation[MODEL_FEATURE_COLUMNS]
    y_validation = validation["EnergyConsumption"]

    comparison = {}
    fitted_pipelines = {}

    preprocessor = ColumnTransformer([
        ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_COLUMNS),
        ("categorical", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]), CATEGORICAL_COLUMNS),
    ])
    x_train_trans = preprocessor.fit_transform(x_train)
    x_val_trans = preprocessor.transform(x_validation)
    x_train_dense = x_train_trans.toarray() if hasattr(x_train_trans, "toarray") else x_train_trans
    x_val_dense = x_val_trans.toarray() if hasattr(x_val_trans, "toarray") else x_val_trans

    # 1. Baseline Linear Regression
    lr_model = LinearRegression().fit(x_train_trans, y_train)
    lr_pipe = Pipeline([("preprocessing", preprocessor), ("model", lr_model)])
    comparison["LinearRegression"] = metrics_for(lr_pipe, x_validation, y_validation)
    fitted_pipelines["LinearRegression"] = lr_pipe

    # 2. Baseline Random Forest
    rf_model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=1).fit(x_train_trans, y_train)
    rf_pipe = Pipeline([("preprocessing", preprocessor), ("model", rf_model)])
    comparison["RandomForestRegressor"] = metrics_for(rf_pipe, x_validation, y_validation)
    fitted_pipelines["RandomForestRegressor"] = rf_pipe

    # 3. Baseline Gradient Boosting (Default)
    gb_def_model = GradientBoostingRegressor(random_state=42).fit(x_train_trans, y_train)
    gb_def_pipe = Pipeline([("preprocessing", preprocessor), ("model", gb_def_model)])
    comparison["GradientBoostingRegressor (Default)"] = metrics_for(gb_def_pipe, x_validation, y_validation)
    fitted_pipelines["GradientBoostingRegressor (Default)"] = gb_def_pipe

    # 4. Hyperparameter-tuned Gradient Boosting Regressor
    # Systematic search over boosting depth, learning rate, tree count, subsampling, and leaf size
    gb_param_grid = [
        {"n_estimators": n, "learning_rate": lr, "max_depth": d, "subsample": s, "min_samples_leaf": l}
        for n in [80, 100, 120, 150]
        for lr in [0.03, 0.05, 0.08, 0.1]
        for d in [2, 3]
        for s in [0.75, 0.85, 1.0]
        for l in [2, 4, 6]
    ]
    best_gb_params = None
    best_gb_model = None
    best_gb_score = float("inf")

    for params in gb_param_grid:
        m = GradientBoostingRegressor(**params, random_state=42).fit(x_train_trans, y_train)
        preds = m.predict(x_val_trans)
        rmse = np.sqrt(mean_squared_error(y_validation, preds))
        if rmse < best_gb_score:
            best_gb_score = rmse
            best_gb_params = params
            best_gb_model = m

    best_gb_pipe = Pipeline([("preprocessing", preprocessor), ("model", best_gb_model)])
    comparison["GradientBoostingRegressor"] = metrics_for(best_gb_pipe, x_validation, y_validation)
    fitted_pipelines["GradientBoostingRegressor"] = best_gb_pipe

    # 5. Hyperparameter-tuned HistGradientBoostingRegressor
    hgb_param_grid = [
        {"max_iter": it, "learning_rate": lr, "max_depth": d, "min_samples_leaf": l, "l2_regularization": l2}
        for it in [60, 80, 100, 120]
        for lr in [0.04, 0.06, 0.08, 0.1]
        for d in [2, 3]
        for l in [5, 10, 20]
        for l2 in [0.0, 1.0]
    ]
    best_hgb_params = None
    best_hgb_model = None
    best_hgb_score = float("inf")

    for params in hgb_param_grid:
        m = HistGradientBoostingRegressor(**params, random_state=42).fit(x_train_dense, y_train)
        preds = m.predict(x_val_dense)
        rmse = np.sqrt(mean_squared_error(y_validation, preds))
        if rmse < best_hgb_score:
            best_hgb_score = rmse
            best_hgb_params = params
            best_hgb_model = m

    best_hgb_pipe = Pipeline([
        ("preprocessing", preprocessor),
        ("to_dense", FunctionTransformer(lambda x: x.toarray() if hasattr(x, "toarray") else x, accept_sparse=True)),
        ("model", best_hgb_model)
    ])
    comparison["HistGradientBoostingRegressor"] = metrics_for(best_hgb_pipe, x_validation, y_validation)
    fitted_pipelines["HistGradientBoostingRegressor"] = best_hgb_pipe

    selected_algorithm = min(comparison, key=lambda name: comparison[name]["rmse"])
    best_hyperparameters = best_gb_params if selected_algorithm == "GradientBoostingRegressor" else (best_hgb_params if selected_algorithm == "HistGradientBoostingRegressor" else {})

    metadata = {
        "model_version": "1.1.0",
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_path": str(DATASET_PATH.relative_to(BASE_DIR.parent)),
        "dataset_rows": int(len(prepared)),
        "duplicates_removed": duplicate_rows,
        "missing_values": {column: int(raw[column].isna().sum()) for column in REQUIRED_COLUMNS},
        "feature_columns": MODEL_FEATURE_COLUMNS,
        "selected_algorithm": selected_algorithm,
        "best_hyperparameters": best_hyperparameters,
        "model_comparison": comparison,
        "training_period": {"start": str(training["_timestamp"].min()), "end": str(training["_timestamp"].max())},
        "validation_period": {"start": str(validation["_timestamp"].min()), "end": str(validation["_timestamp"].max())},
        "numeric_ranges": {
            column: {"min": float(prepared[column].min()), "max": float(prepared[column].max())}
            for column in ["Temperature", "Humidity", "SquareFootage", "Occupancy", "RenewableEnergy"]
        },
        "target_unit": "dataset-defined unit (not specified)",
    }
    joblib.dump({"pipeline": fitted_pipelines[selected_algorithm], "metadata": metadata}, ARTIFACT_PATH)
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    write_report(metadata)
    print(json.dumps({"artifact": str(ARTIFACT_PATH), "metadata": metadata}, indent=2))


if __name__ == "__main__":
    main()
