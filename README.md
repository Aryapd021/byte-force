# BYTE FORCE – HOMEGENIE AI

> **Tagline:** Smart Homes. Smarter Services. Zero Unexpected Breakdowns.  
> **Category:** AI-Powered Home Services & Predictive Maintenance Ecosystem

---

## 🌟 Overview

**Byte Force HomeGenie AI** is a production-grade, AI-driven home services ecosystem connecting homeowners with verified, high-quality service professionals. Unlike traditional aggregators, Byte Force integrates machine learning at every critical touchpoint:

1. **AI Problem Diagnosis (NLP)**: Understands natural-language descriptions of home maintenance issues with 100% classification accuracy and generates preliminary troubleshooting and urgency ratings.
2. **FairFix Fair Price Intelligence (GBM)**: Predicts hyper-local, transparent cost estimates (INR) based on complexity, category, and labor requirements.
3. **Appliance Health Scoring & Failure Prediction (RF Regressor)**: Continuous health monitoring with a 0-100 score and proactive failure alerts.
4. **Predictive Customer Satisfaction (RF Classifier)**: Proactively scores technician-job matching suitability to maximize user happiness.
5. **FairFix Trust Report**: Post-service algorithmic transparency audit for zero hidden charges.

---

## 🏗️ Architecture Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons, Axios |
| **Mobile** | Capacitor 6, Android SDK (API 34), Gradle 8.2 |
| **Backend REST API** | PHP 8.2+ (PDO Prepared Statements, HMAC-SHA256 JWT, RBAC) |
| **Database** | MySQL / MariaDB (relational schema, 21 tables, foreign keys, indexes) + Zero-Config SQLite Fallback |
| **AI / ML Service** | Python 3.13, FastAPI, Scikit-learn, Pandas, NumPy, Joblib |
| **Security** | Bcrypt password hashing, JWT authorization headers, CORS controls, input sanitization |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ & npm
- **Python** 3.10+
- **PHP** 8.2+ with `pdo_mysql`, `pdo_sqlite`, `curl`, `mbstring`, `openssl`
- **MySQL / XAMPP** (optional; built-in SQLite auto-seeds if MySQL is offline)
- **Java JDK** 17+ & **Android SDK** (for Android APK build)

---

### 1. Database Setup

#### Option A: Automatic SQLite (Zero Configuration)
The backend automatically detects if MySQL is absent and boots an in-memory/file SQLite database (`database/byte_force_local.db`), auto-creating all 21 tables and seeding test records.

#### Option B: MySQL / XAMPP
1. Start Apache and MySQL in the XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`).
3. Create database `byte_force`.
4. Import `database/schema.sql`.
5. Import `database/seed.sql`.

---

### 2. AI / ML Microservice (FastAPI)

```bash
cd ai-service

# Install dependencies
pip install fastapi uvicorn scikit-learn pandas numpy joblib pydantic

# (Optional) Retrain models
python training/train_models.py

# Launch API daemon on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Health Check: `http://127.0.0.1:8000/health`
- Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Backend REST API (PHP)

```bash
# From workspace root
php -S 127.0.0.1:8080 -t backend backend/index.php
```
- API Base URL: `http://127.0.0.1:8080/api`
- Test Endpoint: `http://127.0.0.1:8080/api` (Returns server status & DB driver)

---

### 4. Frontend Web Application (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

### 5. Android Application (Capacitor)

```bash
cd frontend

# Build production assets
npm run build

# Sync web assets to Android
npx cap copy android

# Compile debug APK
cd android
.\gradlew.bat assembleDebug
```
- Compiled APK: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
- Ready Distribution: `release/byte-force-debug.apk`

---

## 🔑 Default Test Accounts

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Admin** | `admin@byteforce.in` | `Admin@123` | `/admin/dashboard` |
| **Technician** | `tech.amit@gmail.com` | `Password@123` | `/technician/dashboard` |
| **Technician** | `tech.priya@gmail.com` | `Password@123` | `/technician/dashboard` |
| **Customer** | `customer.rahul@gmail.com` | `Password@123` | `/dashboard` |
| **Customer** | `customer.sneha@gmail.com` | `Password@123` | `/dashboard` |

---

## 📱 Mobile APK Details
- **Package Name:** `com.byteforce.app`
- **Application Name:** Byte Force
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 34 (Android 14)
- **Local API Routing:** Configured for Android emulator (`10.0.2.2`) and local test servers with cleartext enabled.

---

## 🔒 Security & Standards
- All passwords hashed via PHP's `PASSWORD_BCRYPT` (cost factor 10).
- Stateless JWT authentication via HTTP Authorization Bearer headers.
- Transactions on critical booking & assignment mutations.
- Demo payments clearly designated as `DEMO_SANDBOX` with mock transaction tokens.

---

## 📄 License
Byte Force is an original software engineering university hackathon submission. All rights reserved.
