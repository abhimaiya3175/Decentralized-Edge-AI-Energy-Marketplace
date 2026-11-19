import pickle
import pandas as pd
import numpy as np
import sys
import json
from datetime import datetime
from pathlib import Path

# The legacy training script writes this artifact into model_train/, while
# earlier backend builds expected it beside this script. Support either
# location without fabricating a prediction when no compatible model exists.
MODEL_PATHS = (
    Path(__file__).resolve().parent / "solar_rf_model.pkl",
    Path(__file__).resolve().parent.parent / "model_train" / "solar_rf_model.pkl",
)
model = None
model_error = None

for model_path in MODEL_PATHS:
    if not model_path.is_file():
        continue
    try:
        model = pickle.load(model_path.open("rb"))
        break
    except Exception as error:
        model_error = f"Unable to load solar model artifact: {error}"

if model is None and model_error is None:
    model_error = "Solar model artifact is unavailable. Train and place solar_rf_model.pkl in model_train/ before using /predict."

def calculate_time_features(date_time_str):
    """Calculate sinusoidal time features from datetime string."""
    dt = datetime.fromisoformat(date_time_str.replace("T", " "))
    hour = dt.hour
    minute = dt.minute
    return {
        "hour_sin": np.sin(2 * np.pi * hour / 24),
        "hour_cos": np.cos(2 * np.pi * hour / 24),
        "minute_sin": np.sin(2 * np.pi * minute / 60),
        "minute_cos": np.cos(2 * np.pi * minute / 60)
    }

def predict(data):
    try:
        if model is None:
            return {"error": model_error, "code": "MODEL_UNAVAILABLE"}

        date_time = data["dateTime"]
        irradiation = float(data["irradiation"])
        ambient_temp = float(data["ambientTemp"])
        module_temp = float(data["moduleTemp"])

        # Validate inputs
        if irradiation < 0 or irradiation > 1500:
            return {"error": "Irradiation should be between 0-1500 W/m²"}
        if ambient_temp < -50 or ambient_temp > 100:
            return {"error": "Ambient temperature out of range"}
        if module_temp < -50 or module_temp > 100:
            return {"error": "Module temperature out of range"}

        # Calculate time features
        time_features = calculate_time_features(date_time)

        # Prepare features
        features = pd.DataFrame([{
            "IRRADIATION": irradiation,
            "AMBIENT_TEMPERATURE": ambient_temp,
            "MODULE_TEMPERATURE": module_temp,
            "hour_sin": time_features["hour_sin"],
            "hour_cos": time_features["hour_cos"],
            "minute_sin": time_features["minute_sin"],
            "minute_cos": time_features["minute_cos"]
        }])

        # Make prediction
        predicted_power = model.predict(features)[0]
        predicted_power = max(0, float(predicted_power))  # Ensure non-negative

        return {
            "predictedPower": round(predicted_power, 2),
            "irradiation": irradiation,
            "ambientTemp": ambient_temp,
            "moduleTemp": module_temp,
            "time": date_time
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    try:
        # PythonShell supplies JSON through argv when its `args` option is
        # used; retain stdin support for direct command-line use.
        input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
        result = predict(input_data)
    except Exception as error:
        result = {"error": f"Invalid prediction input: {error}", "code": "INVALID_INPUT"}
    # Output result as JSON to stdout
    print(json.dumps(result))
