"""
Reproducible Solar Power Generation Model Training Script
==========================================================
Trains a RandomForestRegressor model on the real public Kaggle
"Solar Power Generation Data" (Plant 1 Generation & Weather Sensor data).

Methodology:
- Strictly chronological train/test split (no random shuffling)
- Feature engineering: sinusoidal diurnal cyclical features (hour_sin, hour_cos, minute_sin, minute_cos)
- Feature contract matching src/predict.py:
    ['IRRADIATION', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'hour_sin', 'hour_cos', 'minute_sin', 'minute_cos']
- Target: DC_POWER
- Evaluated on holdout test set with MAE, RMSE, and R^2 metrics.
- Output artifact: model_train/solar_rf_model.pkl
"""

import os
import sys
import pickle
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ARTIFACT_DIR = Path(__file__).resolve().parent

GEN_FILE = DATA_DIR / "Plant_1_Generation_Data.csv"
WEATHER_FILE = DATA_DIR / "Plant_1_Weather_Sensor_Data.csv"
OUTPUT_MODEL = ARTIFACT_DIR / "solar_rf_model.pkl"

def check_dataset():
    missing = []
    if not GEN_FILE.is_file():
        missing.append(str(GEN_FILE))
    if not WEATHER_FILE.is_file():
        missing.append(str(WEATHER_FILE))
    
    if missing:
        banner = "=" * 78
        error_msg = (
            f"\n{banner}\n"
            "MISSING SOLAR DATASET ERROR — DATA FABRICATION IS STRICTLY PROHIBITED\n"
            f"{banner}\n"
            "The reproducible solar training pipeline requires the real public Kaggle\n"
            "'Solar Power Generation Data' dataset.\n\n"
            f"Missing required file(s):\n"
            + "\n".join(f"  - {f}" for f in missing)
            + "\n\nDownload instructions:\n"
            "1. Visit: https://www.kaggle.com/datasets/anikannal/solar-power-generation-data\n"
            "2. Download 'Plant_1_Generation_Data.csv' and 'Plant_1_Weather_Sensor_Data.csv'\n"
            f"3. Place both CSV files into: {DATA_DIR}\n"
            "4. Re-run: npm run train:solar (or python model_train/train_solar_reproducible.py)\n"
            f"{banner}\n"
        )
        print(error_msg, file=sys.stderr)
        raise FileNotFoundError(f"Missing solar dataset: {', '.join(missing)}")

def add_time_features(df, dt_col="DATE_TIME"):
    df["hour"] = df[dt_col].dt.hour
    df["minute"] = df[dt_col].dt.minute
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["minute_sin"] = np.sin(2 * np.pi * df["minute"] / 60)
    df["minute_cos"] = np.cos(2 * np.pi * df["minute"] / 60)
    return df

def train_model():
    check_dataset()

    print(f"Loading generation data from {GEN_FILE}...")
    df_gen = pd.read_csv(GEN_FILE)
    print(f"Loading weather data from {WEATHER_FILE}...")
    df_weather = pd.read_csv(WEATHER_FILE)

    # Standardize datetime formats (handle DD-MM-YYYY vs YYYY-MM-DD)
    df_gen["DATE_TIME"] = pd.to_datetime(df_gen["DATE_TIME"], dayfirst=True)
    df_weather["DATE_TIME"] = pd.to_datetime(df_weather["DATE_TIME"], dayfirst=True)

    # Aggregate plant-level generation
    gen_agg = df_gen.groupby("DATE_TIME")["DC_POWER"].sum().reset_index()

    # Weather readings are per sensor; group by time taking mean
    weather_agg = df_weather.groupby("DATE_TIME")[
        ["AMBIENT_TEMPERATURE", "MODULE_TEMPERATURE", "IRRADIATION"]
    ].mean().reset_index()

    # Merge on chronological timestamp
    df = pd.merge(gen_agg, weather_agg, on="DATE_TIME", how="inner")
    df = df.sort_values("DATE_TIME").reset_index(drop=True)
    print(f"Merged dataset shape: {df.shape[0]} chronological observation intervals.")

    # Time feature engineering
    df = add_time_features(df, "DATE_TIME")

    feature_cols = [
        "IRRADIATION",
        "AMBIENT_TEMPERATURE",
        "MODULE_TEMPERATURE",
        "hour_sin",
        "hour_cos",
        "minute_sin",
        "minute_cos",
    ]
    target_col = "DC_POWER"

    X = df[feature_cols]
    y = df[target_col]

    # STRICT CHRONOLOGICAL TIME SPLIT (80% train, 20% test — NO SHUFFLE)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    train_dates = (df["DATE_TIME"].iloc[0], df["DATE_TIME"].iloc[split_idx - 1])
    test_dates = (df["DATE_TIME"].iloc[split_idx], df["DATE_TIME"].iloc[-1])
    print(f"Training split: {len(X_train)} rows ({train_dates[0]} to {train_dates[1]})")
    print(f"Test split:     {len(X_test)} rows ({test_dates[0]} to {test_dates[1]})")

    print("\nTraining RandomForestRegressor (n_estimators=100, random_state=42)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_pred = np.clip(y_pred, 0, None) # physical lower bound

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n" + "=" * 50)
    print("REPRODUCIBLE EVALUATION METRICS (Chronological Holdout)")
    print("=" * 50)
    print(f"Mean Absolute Error (MAE):    {mae:.4f} kW")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f} kW")
    print(f"Coefficient of Determination (R^2): {r2:.4f}")
    print("=" * 50)

    with open(OUTPUT_MODEL, "wb") as f:
        pickle.dump(model, f)
    print(f"\nModel artifact successfully saved to: {OUTPUT_MODEL}")

if __name__ == "__main__":
    try:
        train_model()
    except Exception as e:
        print(f"Execution terminated: {e}", file=sys.stderr)
        sys.exit(1)
