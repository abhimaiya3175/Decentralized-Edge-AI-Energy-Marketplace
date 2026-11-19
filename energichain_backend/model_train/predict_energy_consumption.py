"""JSON entry point for the serialised Energy Consumption prediction pipeline."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib

from energy_consumption_features import MODEL_FEATURE_COLUMNS, prepare_features, request_to_frame


ARTIFACT_PATH = Path(__file__).resolve().parent / "energy_consumption_model.pkl"


def response_error(message, code):
    return {"success": False, "error": message, "code": code}


def main(payload):
    if not ARTIFACT_PATH.is_file():
        return response_error("Energy consumption model artifact is unavailable. Run train_energy_consumption.py first.", "MODEL_UNAVAILABLE")
    try:
        bundle = joblib.load(ARTIFACT_PATH)
        pipeline = bundle["pipeline"]
        metadata = bundle["metadata"]
    except Exception as error:
        return response_error(f"Unable to load energy consumption model: {error}", "MODEL_LOAD_FAILED")

    try:
        row = request_to_frame(payload)
        features = prepare_features(row)[MODEL_FEATURE_COLUMNS]
    except (TypeError, ValueError) as error:
        return response_error(str(error), "VALIDATION_ERROR")

    warnings = []
    for api_name, model_name in {
        "temperature": "Temperature",
        "humidity": "Humidity",
        "squareFootage": "SquareFootage",
        "occupancy": "Occupancy",
        "renewableEnergy": "RenewableEnergy",
    }.items():
        value = float(row.iloc[0][model_name])
        limits = metadata["numeric_ranges"][model_name]
        if value < limits["min"] or value > limits["max"]:
            warnings.append(f"{api_name} is outside the training range ({limits['min']:.2f}–{limits['max']:.2f}).")

    try:
        prediction = max(0.0, float(pipeline.predict(features)[0]))
    except Exception as error:
        return response_error(f"Energy consumption inference failed: {error}", "INFERENCE_FAILED")

    return {
        "success": True,
        "model": metadata["selected_algorithm"],
        "prediction": {"energyConsumption": round(prediction, 4), "unit": metadata["target_unit"]},
        "warnings": warnings,
    }


if __name__ == "__main__":
    try:
        payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
        result = main(payload)
    except Exception as error:
        result = response_error(f"Invalid prediction input: {error}", "VALIDATION_ERROR")
    print(json.dumps(result))
