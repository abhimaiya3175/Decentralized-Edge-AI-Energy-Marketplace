"""Shared feature preparation for Energy Consumption training and inference."""

from __future__ import annotations

from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd


REQUIRED_COLUMNS = [
    "Timestamp",
    "Temperature",
    "Humidity",
    "SquareFootage",
    "Occupancy",
    "HVACUsage",
    "LightingUsage",
    "RenewableEnergy",
    "DayOfWeek",
    "Holiday",
    "EnergyConsumption",
]

RAW_FEATURE_COLUMNS = REQUIRED_COLUMNS[:-1]
NUMERIC_COLUMNS = [
    "Temperature",
    "Humidity",
    "SquareFootage",
    "Occupancy",
    "RenewableEnergy",
    "hour",
    "day",
    "month",
    "is_weekend",
]
CATEGORICAL_COLUMNS = ["HVACUsage", "LightingUsage", "DayOfWeek", "Holiday"]
MODEL_FEATURE_COLUMNS = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS
DAY_NAMES = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")


def _normalise_on_off(value: Any, field: str) -> str:
    text = str(value).strip().lower()
    mapping = {"on": "On", "1": "On", "true": "On", "off": "Off", "0": "Off", "false": "Off"}
    if text not in mapping:
        raise ValueError(f"{field} must be On/Off or 1/0.")
    return mapping[text]


def _normalise_holiday(value: Any) -> str:
    text = str(value).strip().lower()
    mapping = {"yes": "Yes", "1": "Yes", "true": "Yes", "no": "No", "0": "No", "false": "No"}
    if text not in mapping:
        raise ValueError("Holiday must be Yes/No or 1/0.")
    return mapping[text]


def prepare_features(frame: pd.DataFrame, include_target: bool = False) -> pd.DataFrame:
    """Validate raw fields and create the exact model features used by both paths."""
    expected = REQUIRED_COLUMNS if include_target else RAW_FEATURE_COLUMNS
    missing = [column for column in expected if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    prepared = frame.copy()
    timestamp = pd.to_datetime(prepared["Timestamp"], errors="coerce")
    if timestamp.isna().any():
        raise ValueError("Timestamp values must be valid datetimes.")

    for column in ["Temperature", "Humidity", "SquareFootage", "Occupancy", "RenewableEnergy"]:
        prepared[column] = pd.to_numeric(prepared[column], errors="coerce")
        if prepared[column].isna().any() or not np.isfinite(prepared[column]).all():
            raise ValueError(f"{column} must contain finite numeric values.")

    if (prepared["Humidity"] < 0).any() or (prepared["Humidity"] > 100).any():
        raise ValueError("Humidity must be between 0 and 100.")
    if (prepared["SquareFootage"] <= 0).any():
        raise ValueError("SquareFootage must be greater than zero.")
    if (prepared["Occupancy"] < 0).any() or (prepared["RenewableEnergy"] < 0).any():
        raise ValueError("Occupancy and RenewableEnergy cannot be negative.")

    prepared["HVACUsage"] = prepared["HVACUsage"].map(lambda value: _normalise_on_off(value, "HVACUsage"))
    prepared["LightingUsage"] = prepared["LightingUsage"].map(lambda value: _normalise_on_off(value, "LightingUsage"))
    prepared["Holiday"] = prepared["Holiday"].map(_normalise_holiday)
    prepared["DayOfWeek"] = prepared["DayOfWeek"].astype(str).str.strip().str.title()
    invalid_days = sorted(set(prepared.loc[~prepared["DayOfWeek"].isin(DAY_NAMES), "DayOfWeek"]))
    if invalid_days:
        raise ValueError(f"DayOfWeek contains invalid values: {', '.join(invalid_days)}")

    prepared["hour"] = timestamp.dt.hour
    prepared["day"] = timestamp.dt.day
    prepared["month"] = timestamp.dt.month
    prepared["is_weekend"] = (timestamp.dt.dayofweek >= 5).astype(int)

    if include_target:
        prepared["EnergyConsumption"] = pd.to_numeric(prepared["EnergyConsumption"], errors="coerce")
        if prepared["EnergyConsumption"].isna().any() or not np.isfinite(prepared["EnergyConsumption"]).all():
            raise ValueError("EnergyConsumption must contain finite numeric values.")

    return prepared


def request_to_frame(payload: dict[str, Any]) -> pd.DataFrame:
    """Convert the public camelCase API request into one validated source row."""
    required = [
        "temperature", "humidity", "squareFootage", "occupancy", "hvacUsage",
        "lightingUsage", "renewableEnergy", "dayOfWeek", "holiday", "timestamp",
    ]
    missing = [field for field in required if payload.get(field) is None or payload.get(field) == ""]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    try:
        datetime.fromisoformat(str(payload["timestamp"]).replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("timestamp must be an ISO-8601 datetime.") from error

    return pd.DataFrame([{
        "Timestamp": payload["timestamp"],
        "Temperature": payload["temperature"],
        "Humidity": payload["humidity"],
        "SquareFootage": payload["squareFootage"],
        "Occupancy": payload["occupancy"],
        "HVACUsage": payload["hvacUsage"],
        "LightingUsage": payload["lightingUsage"],
        "RenewableEnergy": payload["renewableEnergy"],
        "DayOfWeek": payload["dayOfWeek"],
        "Holiday": payload["holiday"],
    }])
