"""Train and compare time-aware Energy Consumption regression models."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

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

    candidates = {
        "LinearRegression": LinearRegression(),
        # One worker keeps training reproducible on constrained Windows hosts
        # and does not alter the chronological split or model parameters.
        "RandomForestRegressor": RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=1),
        "GradientBoostingRegressor": GradientBoostingRegressor(random_state=42),
    }
    comparison = {}
    fitted_pipelines = {}
    for name, regressor in candidates.items():
        pipeline = make_pipeline(regressor)
        pipeline.fit(x_train, y_train)
        comparison[name] = metrics_for(pipeline, x_validation, y_validation)
        fitted_pipelines[name] = pipeline

    selected_algorithm = min(comparison, key=lambda name: comparison[name]["rmse"])
    metadata = {
        "model_version": "1.0.0",
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_path": str(DATASET_PATH.relative_to(BASE_DIR.parent)),
        "dataset_rows": int(len(prepared)),
        "duplicates_removed": duplicate_rows,
        "missing_values": {column: int(raw[column].isna().sum()) for column in REQUIRED_COLUMNS},
        "feature_columns": MODEL_FEATURE_COLUMNS,
        "selected_algorithm": selected_algorithm,
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
