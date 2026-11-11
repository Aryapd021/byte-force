"""
Byte Force - AI Microservice (FastAPI)
Provides high-performance REST APIs for all 5 AI modules:
1. NLP Problem Diagnosis
2. FairPrice AI
3. Intelligent Technician Matching
4. Customer Satisfaction Prediction
5. HomeCare Passport Appliance Health Prediction
"""

import os
import sys
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure prediction module is reachable
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from prediction.diagnosis_engine import DiagnosisEngine
from prediction.fairprice_engine import FairPriceEngine
from prediction.matching_engine import TechnicianMatchingEngine
from prediction.satisfaction_engine import SatisfactionEngine
from prediction.health_engine import ApplianceHealthEngine

app = FastAPI(
    title="Byte Force HomeGenie AI Service",
    description="High-performance predictive microservice powering Home Health Intelligence, FairPrice AI and Intelligent Allocation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
diagnosis_engine = DiagnosisEngine()
fairprice_engine = FairPriceEngine()
matching_engine = TechnicianMatchingEngine()
satisfaction_engine = SatisfactionEngine()
health_engine = ApplianceHealthEngine()

# Pydantic Schemas
class DiagnosisRequest(BaseModel):
    query: str = Field(..., example="My AC is running but blowing warm air and not cooling")

class FairPriceRequest(BaseModel):
    category: str = Field(..., example="air-conditioner")
    zone: str = Field("South Delhi", example="South Delhi")
    complexity: str = Field("MEDIUM", example="MEDIUM")
    parts_needed: int = Field(1, example=1)
    labor_hours: float = Field(1.5, example=1.5)
    urgency_surge: float = Field(0.0, example=0.0)

class TechnicianCandidate(BaseModel):
    id: int
    name: str
    skills: List[str] = []
    latitude: float = 28.6139
    longitude: float = 77.2090
    rating: float = 4.8
    experience_years: int = 5
    completed_jobs: int = 50
    active_jobs: int = 0
    is_available: bool = True

class AllocationRequest(BaseModel):
    category_slug: str = Field(..., example="air-conditioner")
    customer_latitude: float = Field(28.5670, example=28.5670)
    customer_longitude: float = Field(77.2200, example=77.2200)
    technicians: List[TechnicianCandidate]

class SatisfactionRequest(BaseModel):
    category: str = Field(..., example="air-conditioner")
    tech_rating: float = Field(4.9, example=4.9)
    tech_experience: int = Field(7, example=7)
    delay_mins: int = Field(5, example=5)
    price_dev_pct: float = Field(0.0, example=0.0)

class ApplianceHealthRequest(BaseModel):
    category: str = Field(..., example="air-conditioner")
    age_years: float = Field(2.5, example=2.5)
    usage_intensity: str = Field("HEAVY", example="HEAVY")
    prev_repairs: int = Field(1, example=1)
    days_since_service: int = Field(240, example=240)
    has_symptoms: int = Field(1, example=1)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "byte-force-ai",
        "version": "1.0.0",
        "models_loaded": {
            "diagnosis": diagnosis_engine.model is not None,
            "fairprice": fairprice_engine.model is not None,
            "satisfaction": satisfaction_engine.model is not None,
            "health": health_engine.model is not None
        }
    }

@app.post("/api/ai/diagnose")
def diagnose_problem(req: DiagnosisRequest):
    return diagnosis_engine.diagnose(req.query)

@app.post("/api/ai/estimate-price")
def estimate_service_price(req: FairPriceRequest):
    return fairprice_engine.estimate_price(
        category=req.category,
        zone=req.zone,
        complexity=req.complexity,
        parts_needed=req.parts_needed,
        labor_hours=req.labor_hours,
        urgency_surge=req.urgency_surge
    )

@app.post("/api/ai/allocate-technician")
def allocate_technician(req: AllocationRequest):
    raw_candidates = [t.dict() for t in req.technicians]
    ranked = matching_engine.rank_technicians(
        category_slug=req.category_slug,
        cust_lat=req.customer_latitude,
        cust_lon=req.customer_longitude,
        technicians=raw_candidates
    )
    best_match = ranked[0] if ranked else None
    return {
        "best_match": best_match,
        "all_ranked_candidates": ranked
    }

@app.post("/api/ai/predict-satisfaction")
def predict_satisfaction(req: SatisfactionRequest):
    return satisfaction_engine.predict_satisfaction(
        category=req.category,
        tech_rating=req.tech_rating,
        tech_experience=req.tech_experience,
        delay_mins=req.delay_mins,
        price_dev_pct=req.price_dev_pct
    )

@app.post("/api/ai/predict-maintenance")
def predict_maintenance(req: ApplianceHealthRequest):
    return health_engine.evaluate_health(
        category=req.category,
        age_years=req.age_years,
        usage_intensity=req.usage_intensity,
        prev_repairs=req.prev_repairs,
        days_since_service=req.days_since_service,
        has_symptoms=req.has_symptoms
    )

@app.get("/api/ai/metrics")
def get_model_metrics():
    eval_path = os.path.join(os.path.dirname(__file__), "..", "evaluation", "model_evaluation_report.json")
    if os.path.exists(eval_path):
        with open(eval_path, "r") as f:
            return json.load(f)
    return {"message": "Metrics report currently generating"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
