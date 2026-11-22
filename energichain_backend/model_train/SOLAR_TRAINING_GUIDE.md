# Solar Power Generation Model — Reproducible Training Guide

## 1. Overview
This document describes the reproducible training pipeline for the EnergyChain solar power generation model. The model predicts electrical generation (`DC_POWER` in kW) from meteorological inputs and diurnal cycle features.

The trained artifact is expected by `src/predict.py` at `model_train/solar_rf_model.pkl`.

---

## 2. Dataset Requirements

The model is trained on the real public Kaggle **Solar Power Generation Data** dataset (Plant 1):
- **Source**: [Kaggle Solar Power Generation Data](https://www.kaggle.com/datasets/anikannal/solar-power-generation-data)
- **Required Files**:
  1. `Plant_1_Generation_Data.csv` (inverters, DC power, AC power, daily yield)
  2. `Plant_1_Weather_Sensor_Data.csv` (ambient temp, module temp, solar irradiation)
- **Destination Folder**: Place both files in `energichain_backend/data/`.

> **Ethical & Data Integrity Rule**: When dataset files are absent and internet access is unavailable, synthetic or fabricated data must never be generated. The server safely falls back to HTTP 503 (`MODEL_UNAVAILABLE`) with structured JSON until real data is downloaded.

---

## 3. Feature Contract

The model feature contract strictly matches `src/predict.py`:

| Feature Name | Type | Physical Bounds / Encoding | Description |
| :--- | :--- | :--- | :--- |
| `IRRADIATION` | float | 0.0 – 1500.0 W/m² | Solar irradiance measurement from pyranometer |
| `AMBIENT_TEMPERATURE` | float | -50.0 – 100.0 °C | Ambient atmospheric temperature |
| `MODULE_TEMPERATURE` | float | -50.0 – 100.0 °C | Surface temperature of the PV modules |
| `hour_sin` | float | [-1.0, 1.0] | $\sin(2\pi \cdot \text{hour} / 24)$ cyclical time feature |
| `hour_cos` | float | [-1.0, 1.0] | $\cos(2\pi \cdot \text{hour} / 24)$ cyclical time feature |
| `minute_sin` | float | [-1.0, 1.0] | $\sin(2\pi \cdot \text{minute} / 60)$ cyclical time feature |
| `minute_cos` | float | [-1.0, 1.0] | $\cos(2\pi \cdot \text{minute} / 60)$ cyclical time feature |

Target Variable: `DC_POWER` (non-negative float).

---

## 4. Training Methodology

1. **Strict Chronological Split (No Shuffle)**:
   - Solar telemetry exhibits autocorrelation. Random shuffling causes data leakage across consecutive 15-minute readings.
   - The dataset is sorted by `DATE_TIME`. The first 80% of chronological intervals are used for training; the final 20% are held out for out-of-sample evaluation.
2. **Algorithm**: `RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)`.
3. **Evaluation Metrics**:
   - Mean Absolute Error (MAE)
   - Root Mean Squared Error (RMSE)
   - Coefficient of Determination ($R^2$)
4. **Artifact Generation**: Serialized via `pickle.dump` to `model_train/solar_rf_model.pkl`.

---

## 5. Execution

```powershell
cd energichain_backend
npm run train:solar
```
*(Or directly: `python model_train/train_solar_reproducible.py`)*
