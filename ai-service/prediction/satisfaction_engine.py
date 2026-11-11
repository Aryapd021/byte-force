import os
import joblib
import pandas as pd
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "satisfaction_model.joblib")

class SatisfactionEngine:
    def __init__(self):
        self.model = None
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)

    def predict_satisfaction(self, category: str, tech_rating: float, tech_experience: int,
                             delay_mins: int = 0, price_dev_pct: float = 0.0):
        df_input = pd.DataFrame([{
            'category': category.lower(),
            'tech_rating': float(tech_rating),
            'tech_experience': int(tech_experience),
            'delay_mins': int(delay_mins),
            'price_dev_pct': float(price_dev_pct)
        }])

        if self.model:
            is_satisfied = int(self.model.predict(df_input)[0])
            probs = self.model.predict_proba(df_input)[0]
            satisfied_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            satisfied_prob = 0.88
            is_satisfied = 1

        satisfied_pct = round(satisfied_prob * 100, 1)

        if satisfied_pct >= 85:
            tier = "VERY_SATISFIED"
            risk_level = "LOW"
        elif satisfied_pct >= 70:
            tier = "SATISFIED"
            risk_level = "MEDIUM"
        else:
            tier = "AT_RISK"
            risk_level = "HIGH"

        contributing_factors = []
        if tech_rating >= 4.8:
            contributing_factors.append(f"High technician historical rating ({tech_rating}★)")
        if delay_mins > 15:
            contributing_factors.append(f"Potential arrival delay of {delay_mins} mins negatively impacts sentiment")
        if price_dev_pct > 10:
            contributing_factors.append(f"Price deviation exceeds baseline by {price_dev_pct}%")
        if tech_experience >= 5:
            contributing_factors.append(f"Seasoned professional ({tech_experience} yrs field experience)")

        recommendations = []
        if risk_level == "HIGH":
            recommendations.append("Proactively notify customer via SMS of technician ETA to alleviate wait friction.")
            recommendations.append("Provide a transparent digital parts quote before commencing repair.")
        else:
            recommendations.append("Standard automated Byte Force service milestone notifications.")

        return {
            "satisfaction_probability": satisfied_pct,
            "satisfaction_tier": tier,
            "risk_level": risk_level,
            "contributing_factors": contributing_factors,
            "improvement_recommendations": recommendations,
            "disclaimer": "Predictive quality estimation based on historical customer sentiment metrics."
        }
