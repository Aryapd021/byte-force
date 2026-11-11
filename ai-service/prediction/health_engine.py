import os
import joblib
import pandas as pd
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "appliance_health_model.joblib")

RECOMMENDATIONS = {
    "air-conditioner": {
        "action": "AC Deep Jet Cleaning & Coil De-choking",
        "service": "AC Deep Jet Cleaning & Sanitization",
        "cost_range": [499, 799]
    },
    "electrical": {
        "action": "Distribution Board Terminal Torque & Insulation Audit",
        "service": "Switchboard & Circuit Breaker Repair",
        "cost_range": [299, 499]
    },
    "plumbing": {
        "action": "Pressure Balancing & Hydrostatic Valve Flange Inspection",
        "service": "Bathroom Tap & Drain Pipe Fitting",
        "cost_range": [349, 699]
    },
    "refrigerator": {
        "action": "Defrost Timer Calibration & Condenser Fin Dusting",
        "service": "Refrigerator Cooling Repair & Thermostat",
        "cost_range": [599, 999]
    },
    "washing-machine": {
        "action": "Drum Spider Bearing Calibration & Descaling",
        "service": "Washing Machine Drum & Motor Service",
        "cost_range": [699, 1199]
    },
    "water-purifier": {
        "action": "RO Sediment & Carbon Filter Replacement with TDS Calibration",
        "service": "RO Complete Filter & Membrane Overhaul",
        "cost_range": [899, 1599]
    }
}

class ApplianceHealthEngine:
    def __init__(self):
        self.model = None
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)

    def evaluate_health(self, category: str, age_years: float, usage_intensity: str = "MODERATE",
                        prev_repairs: int = 1, days_since_service: int = 120, has_symptoms: int = 0):
        category = category.lower()
        usage_intensity = usage_intensity.upper()
        if usage_intensity not in ["LIGHT", "MODERATE", "HEAVY", "EXTREME"]:
            usage_intensity = "MODERATE"

        df_input = pd.DataFrame([{
            'category': category,
            'age_years': float(age_years),
            'usage_intensity': usage_intensity,
            'prev_repairs': int(prev_repairs),
            'days_since_service': int(days_since_service),
            'has_symptoms': int(has_symptoms)
        }])

        if self.model:
            score = float(self.model.predict(df_input)[0])
        else:
            score = max(20, 100 - (age_years * 5 + days_since_service * 0.05 + has_symptoms * 20))

        score = int(min(100, max(10, round(score))))

        if score >= 80:
            risk = "LOW"
            status = "HEALTHY"
        elif score >= 65:
            risk = "MEDIUM"
            status = "NEEDS_ATTENTION"
        elif score >= 45:
            risk = "HIGH"
            status = "NEEDS_ATTENTION"
        else:
            risk = "CRITICAL"
            status = "CRITICAL"

        rec = RECOMMENDATIONS.get(category, RECOMMENDATIONS["air-conditioner"])

        # Explain degradation factors
        degradation_reasons = []
        if age_years > 4.0:
            degradation_reasons.append(f"Operating age of {age_years} years places components past mid-lifecycle.")
        if usage_intensity in ["HEAVY", "EXTREME"]:
            degradation_reasons.append(f"Heavy duty operational profile accelerates mechanical fatigue.")
        if days_since_service > 180:
            degradation_reasons.append(f"{days_since_service} days since last certified maintenance.")
        if has_symptoms:
            degradation_reasons.append("Active reported operational anomalies indicate internal stress.")

        return {
            "health_score": score,
            "maintenance_risk": risk,
            "status": status,
            "failure_probability": round((100 - score) / 100.0, 2),
            "recommended_action": rec["action"],
            "recommended_service": rec["service"],
            "estimated_cost_range_inr": rec["cost_range"],
            "degradation_factors": degradation_reasons,
            "explanation": f"Health score {score}/100 with {risk} risk. Preventive action: {rec['action']}."
        }
