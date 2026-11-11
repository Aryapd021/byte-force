"""
Byte Force - AI Model Training Suite
Trains real Scikit-Learn models on generated datasets and exports evaluated Joblib pipelines:
1. Diagnosis NLP Classifier (TF-IDF + Random Forest)
2. FairPrice Regression Model (Gradient Boosting Regressor)
3. Customer Satisfaction Classifier (Random Forest Classifier)
4. HomeCare Passport Appliance Health Model (Random Forest Regressor)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, classification_report
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "datasets")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
EVAL_DIR = os.path.join(BASE_DIR, "..", "evaluation")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(EVAL_DIR, exist_ok=True)

evaluation_results = {}

def train_diagnosis_model():
    print("--- 1. Training NLP Problem Diagnosis Model ---")
    data_path = os.path.join(DATA_DIR, "diagnosis_dataset.csv")
    df = pd.read_csv(data_path)
    
    X = df["text"]
    y = df["category"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=1000, lowercase=True)),
        ("clf", RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    print(f"Diagnosis Model Accuracy: {acc:.4f}, F1-Score: {f1:.4f}")
    
    model_path = os.path.join(MODELS_DIR, "diagnosis_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Saved: {model_path}")
    
    evaluation_results["diagnosis"] = {
        "model_type": "TF-IDF + RandomForestClassifier",
        "sample_count": len(df),
        "test_size": len(X_test),
        "accuracy": round(float(acc), 4),
        "f1_score": round(float(f1), 4),
        "categories": list(df["category"].unique())
    }

def train_fairprice_model():
    print("\n--- 2. Training FairPrice AI Regression Model ---")
    data_path = os.path.join(DATA_DIR, "fairprice_dataset.csv")
    df = pd.read_csv(data_path)
    
    features = ['category', 'zone', 'complexity', 'parts_needed', 'labor_hours', 'urgency_surge']
    X = df[features]
    y = df['final_price']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    categorical_cols = ['category', 'zone', 'complexity']
    numeric_cols = ['parts_needed', 'labor_hours', 'urgency_surge']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
            ('num', StandardScaler(), numeric_cols)
        ]
    )
    
    pipeline = Pipeline([
        ('prep', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=4, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"FairPrice Model - MAE: {mae:.2f} INR, RMSE: {rmse:.2f} INR, R²: {r2:.4f}")
    
    model_path = os.path.join(MODELS_DIR, "fairprice_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Saved: {model_path}")
    
    evaluation_results["fairprice"] = {
        "model_type": "GradientBoostingRegressor",
        "sample_count": len(df),
        "test_size": len(X_test),
        "mae_inr": round(float(mae), 2),
        "rmse_inr": round(float(rmse), 2),
        "r2_score": round(float(r2), 4)
    }

def train_satisfaction_model():
    print("\n--- 3. Training Customer Satisfaction Prediction Model ---")
    data_path = os.path.join(DATA_DIR, "satisfaction_dataset.csv")
    df = pd.read_csv(data_path)
    
    features = ['category', 'tech_rating', 'tech_experience', 'delay_mins', 'price_dev_pct']
    X = df[features]
    y = df['is_satisfied']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    categorical_cols = ['category']
    numeric_cols = ['tech_rating', 'tech_experience', 'delay_mins', 'price_dev_pct']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
            ('num', StandardScaler(), numeric_cols)
        ]
    )
    
    pipeline = Pipeline([
        ('prep', preprocessor),
        ('clf', RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted")
    rec = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    print(f"Satisfaction Model - Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")
    
    model_path = os.path.join(MODELS_DIR, "satisfaction_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Saved: {model_path}")
    
    evaluation_results["satisfaction"] = {
        "model_type": "RandomForestClassifier",
        "sample_count": len(df),
        "test_size": len(X_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4)
    }

def train_appliance_health_model():
    print("\n--- 4. Training HomeCare Passport Appliance Health Model ---")
    data_path = os.path.join(DATA_DIR, "appliance_health_dataset.csv")
    df = pd.read_csv(data_path)
    
    features = ['category', 'age_years', 'usage_intensity', 'prev_repairs', 'days_since_service', 'has_symptoms']
    X = df[features]
    y = df['health_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    categorical_cols = ['category', 'usage_intensity']
    numeric_cols = ['age_years', 'prev_repairs', 'days_since_service', 'has_symptoms']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
            ('num', StandardScaler(), numeric_cols)
        ]
    )
    
    pipeline = Pipeline([
        ('prep', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"Appliance Health Model - MAE: {mae:.2f} score points, R²: {r2:.4f}")
    
    model_path = os.path.join(MODELS_DIR, "appliance_health_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Saved: {model_path}")
    
    evaluation_results["appliance_health"] = {
        "model_type": "RandomForestRegressor",
        "sample_count": len(df),
        "test_size": len(X_test),
        "mae_points": round(float(mae), 2),
        "r2_score": round(float(r2), 4)
    }

def save_evaluation_report():
    report_path = os.path.join(EVAL_DIR, "model_evaluation_report.json")
    with open(report_path, "w") as f:
        json.dump(evaluation_results, f, indent=2)
    print(f"\nAll models trained and verified! Evaluation report saved to {report_path}")

if __name__ == '__main__':
    train_diagnosis_model()
    train_fairprice_model()
    train_satisfaction_model()
    train_appliance_health_model()
    save_evaluation_report()
