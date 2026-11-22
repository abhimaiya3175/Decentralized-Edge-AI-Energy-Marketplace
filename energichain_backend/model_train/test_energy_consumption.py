"""Focused tests for the independent Energy Consumption ML module."""

from __future__ import annotations

import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import predict_energy_consumption as inference
from energy_consumption_features import prepare_features, request_to_frame


VALID_PAYLOAD = {
    "temperature": 28.5,
    "humidity": 55,
    "squareFootage": 1500,
    "occupancy": 5,
    "hvacUsage": 1,
    "lightingUsage": "On",
    "renewableEnergy": 12.5,
    "dayOfWeek": "Monday",
    "holiday": 0,
    "timestamp": "2022-02-10T10:00:00",
}


class EnergyConsumptionModelTests(unittest.TestCase):
    def test_valid_request_returns_prediction(self):
        result = inference.main(VALID_PAYLOAD)
        self.assertTrue(result["success"])
        self.assertGreaterEqual(result["prediction"]["energyConsumption"], 0)
        self.assertEqual(result["model"], "GradientBoostingRegressor")

    def test_missing_field_is_validation_error(self):
        payload = dict(VALID_PAYLOAD)
        del payload["humidity"]
        result = inference.main(payload)
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "VALIDATION_ERROR")

    def test_out_of_training_range_returns_warning(self):
        payload = dict(VALID_PAYLOAD, temperature=50)
        result = inference.main(payload)
        self.assertTrue(result["success"])
        self.assertTrue(result["warnings"])

    def test_missing_artifact_is_safe(self):
        original_path = inference.ARTIFACT_PATH
        try:
            inference.ARTIFACT_PATH = Path("__missing_energy_consumption_model__.pkl")
            result = inference.main(VALID_PAYLOAD)
        finally:
            inference.ARTIFACT_PATH = original_path
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "MODEL_UNAVAILABLE")

    def test_feature_normalisation_accepts_binary_api_values(self):
        frame = prepare_features(request_to_frame(VALID_PAYLOAD))
        self.assertEqual(frame.iloc[0]["HVACUsage"], "On")
        self.assertEqual(frame.iloc[0]["Holiday"], "No")


if __name__ == "__main__":
    unittest.main()
