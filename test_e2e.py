"""
End-to-End Verification Test Suite for SalaryAI
Tests all REST endpoints, live ML inference, model activation switching,
and prediction stream synchronization.
"""

import sys
import os
import json
import unittest

# Ensure server folder is importable
SERVER_DIR = os.path.join(os.path.dirname(__file__), "server")
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from app import app
from database import db
from models import User, PredictionLog

class TestSalaryAIE2E(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        print("✓ Health check passed")

    def test_02_metadata(self):
        res = self.client.get("/api/ml/metadata")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("active_model_key", data)
        self.assertIn("models", data)
        self.assertIn("bell_curve", data)
        self.assertIn("feature_importances", data)
        print(f"✓ Metadata passed (Active model: {data['active_model_name']}, R2: {data['active_r2']})")

    def test_03_prediction_and_stream_sync(self):
        # 1. Run inference for Senior AI Engineer
        payload = {
            "candidate_role": "ML / AI Engineer",
            "experience_years": 10.5,
            "skill_rank": 88,
            "education_level": "Bachelor's",
            "workloads_count": 14,
            "location_tier": "Tier 1 Metro (BLR/MUM/NCR)",
            "company_tier": "Growth Mid-Market ($50M-$250M ARR)"
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        pred = res.get_json()
        self.assertIn("predicted_ctc", pred)
        self.assertGreater(pred["predicted_ctc"], 3000000)
        self.assertIn("package_breakdown", pred)
        self.assertIn("market_position", pred)
        self.assertIn("feature_weights", pred)
        print(f"✓ Prediction inference passed: INR {pred['predicted_ctc']:,} ({pred['market_position']['percentile_label']})")

        # 2. Verify that this prediction immediately appeared in the Admin Prediction Stream
        logs_res = self.client.get("/api/admin/logs")
        self.assertEqual(logs_res.status_code, 200)
        logs_data = logs_res.get_json()
        self.assertGreater(len(logs_data["logs"]), 0)
        latest = logs_data["logs"][0]
        self.assertEqual(latest["candidate_role"], "ML / AI Engineer")
        self.assertEqual(latest["predicted_ctc"], pred["predicted_ctc"])
        print("✓ Live stream sync verified: prediction appeared in Admin logs")

    def test_04_model_activation_switch(self):
        # Activate Gradient Boosting
        res = self.client.post("/api/admin/models/activate", json={"model_key": "gradient_boosting"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["active_model"]["key"], "gradient_boosting")
        print("✓ Successfully activated Gradient Boosting model")

        # Switch back to Random Forest
        res2 = self.client.post("/api/admin/models/activate", json={"model_key": "random_forest"})
        self.assertEqual(res2.status_code, 200)
        print("✓ Successfully activated Random Forest model")

    def test_05_admin_auth(self):
        # Super admin login
        res = self.client.post("/api/auth/login", json={
            "email": "admin@salaryai.in",
            "password": "Admin@123"
        })
        self.assertEqual(res.status_code, 200)
        auth = res.get_json()
        self.assertIn("token", auth)
        self.assertEqual(auth["user"]["role"], "super_admin")
        print("✓ Admin authentication passed (Super Admin verified)")

    def test_06_benchmarks(self):
        res = self.client.get("/api/benchmarks?role=ML%20/%20AI%20Engineer&limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["total"], 0)
        self.assertEqual(len(data["records"]), 5)
        print(f"✓ Benchmarks endpoint passed ({data['total']} records matching filter)")

if __name__ == "__main__":
    unittest.main()
