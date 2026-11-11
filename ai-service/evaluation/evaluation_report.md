# BYTE FORCE AI ENGINE – MODEL EVALUATION REPORT

Generated automatically following rigorous training and validation split (80/20 & 75/25).

## 1. Problem Diagnosis NLP Classifier
- **Model**: TF-IDF Vectorizer (ngram 1-2) + Logistic Regression (C=2.0)
- **Training Samples**: 112
- **Test Accuracy**: 100.00%
- **Weighted F1-Score**: 1.0000
- **Target Categories**: AC & HVAC (1), Electrical (2), Appliances (3), Plumbing (4), Water Purifiers (5)

## 2. FairPrice AI Regressor
- **Model**: Random Forest Regressor (n_estimators=100, max_depth=10)
- **Training Samples**: 1200
- **Mean Absolute Error (MAE)**: ₹81.33
- **Root Mean Squared Error (RMSE)**: ₹138.09
- **Coefficient of Determination (R²)**: 0.9828
- **Features Evaluated**: Category ID, Complexity, Labour Hours, Parts Required, Parts Cost, Service Zone, Urgency

## 3. Customer Satisfaction Prediction Model
- **Model**: Random Forest Classifier (n_estimators=80, max_depth=8)
- **Training Samples**: 1000
- **Test Accuracy**: 71.00%
- **Weighted F1-Score**: 0.6981
- **Target Classes**: HIGH, MEDIUM, LOW

## 4. Home Health & Appliance Maintenance Risk Model
- **Model**: Dual Random Forest (Regressor for Health Score + Classifier for Risk Level)
- **Training Samples**: 1200
- **Health Score MAE**: 4.85 points (Scale 0-100)
- **Health Score R²**: 0.8854
- **Risk Classification Accuracy**: 87.08%
- **Risk Categories**: LOW, MEDIUM, HIGH, CRITICAL

---
*All models persisted via Joblib in `ai-service/models/` for sub-millisecond production inference.*
