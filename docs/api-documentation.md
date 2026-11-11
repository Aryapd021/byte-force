# Byte Force REST API Documentation

Base URL: `http://127.0.0.1:8080/api`

All protected endpoints require the header:
```
Authorization: Bearer <jwt-token>
```

---

## 1. Authentication Endpoints

### POST `/api/auth/register`
Creates a new customer or technician user account.
- **Payload:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "phone": "+91 9876543210",
    "role": "customer"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": 9, "name": "John Doe", "email": "john@example.com", "role": "customer" }
  }
  ```

### POST `/api/auth/login`
Authenticates existing credentials.
- **Payload:**
  ```json
  { "email": "customer.rahul@gmail.com", "password": "Password@123" }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": 2, "name": "Rahul Verma", "email": "customer.rahul@gmail.com", "role": "customer" }
  }
  ```

---

## 2. Services & Catalog

### GET `/api/categories`
Returns all service categories with icons and slugs.

### GET `/api/services`
Query parameters: `category_id`, `search`. Returns list of active services with pricing and duration.

### GET `/api/services/{id}`
Returns detailed specification and pricing for an individual service.

---

## 3. Booking Management

### POST `/api/bookings` *(Protected: Customer)*
Creates a new appointment.
- **Payload:**
  ```json
  {
    "service_id": 1,
    "scheduled_date": "2026-11-15",
    "scheduled_time": "14:00",
    "address": "402 Palm Heights",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "notes": "Please call before arrival"
  }
  ```

### GET `/api/bookings` *(Protected)*
Returns booking history scoped to the caller's role (Customer gets personal bookings; Technician gets assigned tasks; Admin gets all).

### PUT `/api/bookings/{id}/status` *(Protected)*
Updates booking workflow state (`assigned`, `in_progress`, `completed`, `cancelled`).

### GET `/api/bookings/{id}/trust-report` *(Protected)*
Calculates FairFix transparency metrics and itemized cost breakdown for a booking.

---

## 4. Appliance & Health Passport

### GET `/api/appliances` *(Protected: Customer)*
Lists registered appliances for the customer.

### POST `/api/appliances` *(Protected: Customer)*
Registers a new appliance with brand, model, and purchase details.

### GET `/api/appliances/{id}/health` *(Protected: Customer)*
Triggers AI inference engine to evaluate health score (0-100), risk status, and maintenance advice.

### POST `/api/appliances/{id}/maintenance` *(Protected: Customer)*
Appends a physical maintenance or repair event to the appliance log.

---

## 5. AI Intelligence Endpoints

### POST `/api/ai/diagnose`
Analyzes natural language complaint text.
- **Payload:** `{ "description": "My AC is running but blowing warm air" }`
- **Response:**
  ```json
  {
    "category": "air-conditioner",
    "confidence": 1.0,
    "urgency": "High",
    "possible_issues": ["Refrigerant leak", "Dirty condenser coils"],
    "recommended_services": ["AC Deep Cleaning", "Refrigerant Top-up"],
    "troubleshooting_steps": ["Check thermostat setting", "Clean air filters"],
    "disclaimer": "Preliminary AI diagnosis; physical inspection required."
  }
  ```

### POST `/api/ai/estimate-price`
Predicts fair pricing using Gradient Boosting Regressor.
- **Payload:** `{ "service_category": "air-conditioner", "problem_type": "Cooling Issue", "complexity": "medium", "location": "urban" }`

---

## 6. Admin & Analytics

### GET `/api/admin/analytics` *(Protected: Admin)*
Returns system KPI metrics (customers, technicians, bookings, revenue, monthly revenue trends, status distribution).
