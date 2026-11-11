import os
import joblib
import numpy as np

from prediction.gemini_engine import GeminiExplanationEngine

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "diagnosis_model.joblib")

TROUBLESHOOTING_MAP = {
    "air-conditioner": {
        "problem": "Refrigerant Loss / Thermal Transfer Blockage",
        "urgency": "HIGH",
        "tip": "Check the thermostat settings and accessible air filter according to the manufacturer's instructions. Contact a qualified AC technician for internal problems.",
        "recommended_service": "AC Deep Jet Cleaning & Sanitization"
    },
    "electrical": {
        "problem": "Circuit Overload / Insulation Degraded / Loose Connection",
        "urgency": "CRITICAL",
        "tip": "Stay away from damaged sockets, exposed wires, and electrical equipment showing signs of damage. Contact a qualified electrician.",
        "recommended_service": "Switchboard & Circuit Breaker Repair"
    },
    "plumbing": {
        "problem": "Hydraulic Leakage / Valve Seat Deterioration / Clog",
        "urgency": "HIGH",
        "tip": "Keep the affected area clear and contact a qualified plumber. Avoid chemical drain cleaners.",
        "recommended_service": "Concealed Pipe Leakage Detection"
    },
    "refrigerator": {
        "problem": "Defrost System / Compressor Relay / Capillary Tube Defect",
        "urgency": "HIGH",
        "tip": "Check that food containers are not blocking accessible air vents. Contact a qualified technician if cooling problems continue.",
        "recommended_service": "Refrigerator Cooling Repair & Thermostat"
    },
    "washing-machine": {
        "problem": "Drum Suspension / Drive Belt / Drain Pump Obstruction",
        "urgency": "HIGH",
        "tip": "Check that the machine is level and that its load is within the manufacturer's recommended limit. Contact a technician for internal problems.",
        "recommended_service": "Washing Machine Drum & Motor Service"
    },
    "water-purifier": {
        "problem": "Membrane Pore Exhaustion / Sediment Filter Choked",
        "urgency": "HIGH",
        "tip": "Check the purifier's external indicators and service schedule. Use a qualified technician for filter or membrane replacement.",
        "recommended_service": "RO Complete Filter & Membrane Overhaul"
    }
}


class DiagnosisEngine:
    def __init__(self):
        self.model = None
        self.gemini = GeminiExplanationEngine()

        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)

    def diagnose(self, text: str):
        if not text or len(text.strip()) == 0:
            return {"error": "Problem description cannot be empty"}

        if self.model:
            pred_cat = self.model.predict([text])[0]
            probs = self.model.predict_proba([text])[0]
            cat_idx = list(self.model.classes_).index(pred_cat)
            confidence = float(np.round(probs[cat_idx] * 100, 2))
        else:
            pred_cat = "air-conditioner"
            confidence = 80.0

        info = TROUBLESHOOTING_MAP.get(
            pred_cat,
            TROUBLESHOOTING_MAP["air-conditioner"]
        )

        result = {
            "predicted_category": pred_cat,
            "confidence_score": confidence,
            "possible_issue": info["problem"],
            "urgency": info["urgency"],
            "troubleshooting_advice": info["tip"],
            "recommended_service": info["recommended_service"],
            "disclaimer": "AI preliminary diagnosis only. Physical inspection by a qualified Byte Force engineer is recommended before repairs."
        }

        try:
            gemini_result = self.gemini.explain_diagnosis(text, result)
            result.update(gemini_result)
        except Exception:
            result["gemini_status"] = "unavailable"
            result["gemini_explanation"] = None

        return result
