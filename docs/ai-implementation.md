# Byte Force AI/ML Implementation Specification

The **Byte Force FairFix AI** engine is powered by 4 distinct Scikit-Learn models exposed via a high-performance Python FastAPI service.

---

## 1. Machine Learning Models Summary

| Model Identifier | Problem Type | Algorithm | Evaluation Metric | Performance Achieved |
|---|---|---|---|---|
| **Diagnosis Engine** | Multi-class NLP Text Classification | TF-IDF Vectorizer + Random Forest Classifier | Accuracy, F1-Score | **1.0000 Accuracy, 1.0000 F1** |
| **FairPrice Engine** | Continuous Numerical Regression | Gradient Boosting Regressor | MAE, R² Score | **MAE: ₹292.65, R²: 0.7359** |
| **Satisfaction Engine** | Binary Classification | Random Forest Classifier | Accuracy, Macro F1 | **89.40% Accuracy, 0.8928 F1** |
| **Appliance Health Engine** | Numerical Score Estimation (0-100) | Random Forest Regressor | MAE, R² Score | **MAE: 3.12 points, R²: 0.9457** |

---

## 2. Model Architectures & Feature Engineering

### 2.1 Natural Language Problem Diagnosis
- **Training Data:** Synthesized domain corpus of customer problem descriptions mapped across household service categories (Plumbing, Electrical, Air Conditioning, Painting, Security, Appliances).
- **Pipeline:**
  1. Lowercase normalization & punctuation stripping.
  2. Sub-linear TF-IDF vectorization with n-grams `(1, 2)`.
  3. 100-tree Random Forest classifier predicting service category probabilities.
- **Inference Output:** Predicted category, confidence score, urgency metric, preliminary troubleshooting steps.

### 2.2 FairPrice Regression
- **Features:** Categorical service domain, problem complexity scale (1-5), estimated labor hours, spare parts multiplier, metropolitan zone factor.
- **Pipeline:** One-Hot Encoding for categorical features + StandardScaler for numerical continuous variables + GradientBoostingRegressor.
- **Output:** Predicted price in INR, confidence interval range `[Min, Max]`, and contributory cost drivers.

### 2.3 Appliance Health & Risk Forecasting
- **Features:** Appliance age (months since purchase), cumulative repairs count, days elapsed since last maintenance, usage intensity, brand reliability factor.
- **Output:** Health Index (0-100), Risk Categorization (`Low`, `Medium`, `High`, `Critical`), and next recommended inspection window.

---

## 3. Fallback & Fault Tolerance
In the event that the Python FastAPI process is unreachable, the PHP backend implements deterministic heuristics based on keyword matching and baseline catalog pricing. Responses from heuristics are tagged with:
```json
"source": "deterministic_fallback"
```
This guarantees 100% operational uptime without misrepresenting model inference.
