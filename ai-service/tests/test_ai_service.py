"""
Byte Force - AI Microservice Unit & Integration Test Suite
Executes comprehensive assertions against all 5 ML engines and their outputs.
"""

import os
import sys
import unittest

# Ensure prediction module is reachable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from prediction.diagnosis_engine import DiagnosisEngine
from prediction.fairprice_engine import FairPriceEngine
from prediction.matching_engine import TechnicianMatchingEngine
from prediction.satisfaction_engine import SatisfactionEngine
from prediction.health_engine import ApplianceHealthEngine

class TestAIEngines(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.diagnosis = DiagnosisEngine()
        cls.fairprice = FairPriceEngine()
        cls.matching = TechnicianMatchingEngine()
        cls.satisfaction = SatisfactionEngine()
        cls.health = ApplianceHealthEngine()

    def test_diagnosis_engine_ac(self):
        """Test NLP diagnosis model for AC complaint."""
        result = self.diagnosis.diagnose("AC blowing hot air and not cooling properly")
        self.assertIn("predicted_category", result)
        self.assertIn("confidence_score", result)
        self.assertEqual(result["predicted_category"], "air-conditioner")
        self.assertGreater(result["confidence_score"], 50.0)
        self.assertIn(result["urgency"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertTrue(len(result["troubleshooting_advice"]) > 0)
        self.assertTrue(len(result["recommended_service"]) > 0)
        self.assertIn("disclaimer", result)

    def test_diagnosis_engine_plumbing(self):
        """Test NLP diagnosis model for Plumbing complaint."""
        result = self.diagnosis.diagnose("Kitchen sink drain is completely clogged with standing greasy water")
        self.assertIn("predicted_category", result)
        self.assertEqual(result["predicted_category"], "plumbing")
        self.assertGreater(result["confidence_score"], 50.0)

    def test_fairprice_engine(self):
        """Test FairPrice AI regression model and INR estimations."""
        result = self.fairprice.estimate_price(
            category="air-conditioner",
            zone="South Delhi",
            complexity="MEDIUM",
            parts_needed=1,
            labor_hours=1.5,
            urgency_surge=0.0
        )
        self.assertIn("recommended_price", result)
        self.assertGreater(float(result["recommended_price"]), 300.0)
        self.assertLess(float(result["min_price"]), float(result["recommended_price"]))
        self.assertGreater(float(result["max_price"]), float(result["recommended_price"]))
        self.assertIn("pricing_explanation", result)
        self.assertEqual(result["pricing_factors"]["currency"], "INR")

    def test_technician_matching_engine(self):
        """Test multi-factor technician ranking and distance calculation."""
        techs = [
            {
                "id": 1,
                "name": "Amit Sharma",
                "skills": ["air-conditioner", "electrical"],
                "latitude": 28.5670,
                "longitude": 77.2200,
                "rating": 4.9,
                "experience_years": 6,
                "completed_jobs": 150,
                "active_jobs": 0,
                "is_available": True
            },
            {
                "id": 2,
                "name": "Ramesh Gupta",
                "skills": ["plumbing"],
                "latitude": 28.7000,
                "longitude": 77.1000,
                "rating": 4.1,
                "experience_years": 2,
                "completed_jobs": 30,
                "active_jobs": 2,
                "is_available": True
            }
        ]
        ranked = self.matching.rank_technicians(
            category_slug="air-conditioner",
            cust_lat=28.5670,
            cust_lon=77.2200,
            technicians=techs
        )
        self.assertEqual(len(ranked), 2)
        self.assertEqual(ranked[0]["technician_id"], 1)
        self.assertEqual(ranked[0]["technician_name"], "Amit Sharma")
        self.assertGreater(ranked[0]["matching_score"], ranked[1]["matching_score"])
        self.assertTrue(len(ranked[0]["reasons"]) > 0)

    def test_satisfaction_engine(self):
        """Test customer satisfaction prediction model."""
        result = self.satisfaction.predict_satisfaction(
            category="air-conditioner",
            tech_rating=4.9,
            tech_experience=7,
            delay_mins=5,
            price_dev_pct=0.0
        )
        self.assertIn("satisfaction_probability", result)
        self.assertIn("satisfaction_tier", result)
        self.assertIn(result["satisfaction_tier"], ["VERY_SATISFIED", "SATISFIED", "NEUTRAL", "AT_RISK"])
        self.assertGreaterEqual(float(result["satisfaction_probability"]), 70.0)
        self.assertTrue(len(result["contributing_factors"]) > 0)

    def test_appliance_health_engine(self):
        """Test HomeCare Passport appliance health score model (0-100)."""
        result = self.health.evaluate_health(
            category="air-conditioner",
            age_years=2.0,
            usage_intensity="MODERATE",
            prev_repairs=1,
            days_since_service=150,
            has_symptoms=0
        )
        self.assertIn("health_score", result)
        self.assertGreaterEqual(result["health_score"], 0)
        self.assertLessEqual(result["health_score"], 100)
        self.assertIn(result["maintenance_risk"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertIn("recommended_action", result)
        self.assertIn("recommended_service", result)
        self.assertIn("estimated_cost_range_inr", result)
        self.assertIn("explanation", result)

if __name__ == "__main__":
    unittest.main()
