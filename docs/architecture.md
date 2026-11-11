# Byte Force System Architecture

## 1. High-Level Architecture Overview

```
                      +-----------------------------+
                      |     Client Layer            |
                      |  - React.js Web App (Vite)  |
                      |  - Capacitor Android APK    |
                      +--------------+--------------+
                                     |
                                     | JSON / HTTPS
                                     v
                      +-----------------------------+
                      |     PHP REST API Gateway    |
                      |  - Router & CORS Controller |
                      |  - JWT Middleware & RBAC    |
                      |  - Business Logic & PDO     |
                      +-------+-------------+-------+
                              |             |
           Internal HTTP Call |             | SQL Queries
                              v             v
       +-------------------------+   +-------------------------+
       |   Python FastAPI AI/ML  |   |    Relational Database  |
       |  - NLP Diagnosis (TFIDF)|   |  - MySQL 8.0 / MariaDB  |
       |  - FairPrice (GBM)      |   |  - SQLite (Fallback)    |
       |  - Health Scoring (RF)  |   |  - 21 Normalized Tables |
       |  - Satisfaction (RF)    |   +-------------------------+
       +-------------------------+
```

## 2. Key Subsystems

### 2.1 Web & Mobile Frontend
- **Framework:** React 18 with TypeScript and Vite bundler.
- **Styling:** Tailwind CSS with deep navy (`#101828`), electric cyan (`#06B6D4`), and royal blue (`#2563EB`) identity tokens.
- **State & Auth:** React Context with persistent localStorage tokens and automatic Axios request/response interceptors.
- **Mobile Packaging:** Capacitor 6 bridge targeting Android API 34.

### 2.2 Backend Gateway & Controller Layer
- Pure PHP 8.2+ stateless router utilizing URL rewriting.
- **Security Middleware:** Strict CORS origin checks, Content-Type enforcement, HMAC-SHA256 JWT decoding.
- **Database Abstraction:** Generic PDO interface supporting both MySQL and SQLite drivers without application-level logic alteration.
- **Proxying:** Transparently proxies AI requests to the FastAPI microservice and falls back to deterministic rule sets if offline.

### 2.3 Machine Learning Microservice
- FastAPI standalone service on port 8000.
- Serves 4 serialized Scikit-learn models persisted via Joblib.
- Endpoints return structured JSON schemas with confidence scores and explainability factors.

### 2.4 Database Design
- 21 fully normalized tables with primary keys, foreign key constraints (`ON DELETE CASCADE`), indexes on lookup attributes, and automatic timestamp tracking.
- Schema covers Users, Profiles, Services, Bookings, Appliances, Maintenance History, Reviews, Payments, AI Predictions, and Activity Logs.
