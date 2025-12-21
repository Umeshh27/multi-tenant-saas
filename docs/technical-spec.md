## **Technical Specification**

**Project:** Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Overview

This document describes the technical implementation details of the Multi-Tenant SaaS Platform, including project structure, development setup, environment configuration, and execution steps. It serves as a reference for developers and evaluators to understand how the system is organized and how it should be run.

---

## 2. Technology Stack

### **Backend**

- Node.js (v18+)
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

### **Frontend**

- React.js (with Vite)
- Axios for API communication
- React Router for routing
- Context API for state management

### **DevOps**

- Docker
- Docker Compose

---

## 3. Backend Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handling logic
│   ├── routes/           # API route definitions
│   ├── models/           # Database models / queries
│   ├── middleware/       # Auth, RBAC, tenant isolation
│   ├── services/         # Business logic (audit logs, auth)
│   ├── utils/            # Helper functions
│   ├── config/           # DB & app configuration
│   └── app.js            # Express app entry point
│
├── migrations/           # Database migration files
├── seeds/                # Seed data scripts
├── Dockerfile            # Backend container config
├── package.json
└── .env
```

### **Key Backend Components**

- **Controllers:** Handle request/response
- **Middleware:** JWT verification, role checks, tenant filtering
- **Services:** Reusable logic like audit logging
- **Config:** Environment-based configuration

---

## 4. Frontend Project Structure

```
frontend/
├── src/
│   ├── pages/            # Route-based pages
│   ├── components/       # Reusable UI components
│   ├── services/         # API service layer
│   ├── context/          # Auth & global state
│   ├── routes/           # Protected routes
│   └── main.jsx          # Application entry point
│
├── Dockerfile
└── package.json
```

### **Key Frontend Components**

- **Pages:** Dashboard, Projects, Users, Login, Register
- **Context:** Authentication and role state
- **Services:** Centralized API calls
- **Routes:** Role-protected routing

---

## 5. Environment Variables

### **Backend (.env)**

```
DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=dev_secret_key_12345678901234567890
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://frontend:3000
```

### **Frontend (Docker Environment)**

```
REACT_APP_API_URL=http://backend:5000/api
```

---

## 6. Development Setup Guide

### **Prerequisites**

- Node.js v18+
- Docker & Docker Compose
- Git

---

### **Local Development (Without Docker)**

1. Install backend dependencies
2. Configure `.env`
3. Run database manually
4. Run migrations and seeds
5. Start backend server
6. Start frontend dev server

---

### **Docker-Based Setup (Recommended)**

1. Clone repository
2. Navigate to project root
3. Run:

   ```
   docker-compose up -d
   ```

4. Access:

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)
   - Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. Database Migrations & Seeds

- Migrations create tables in correct order
- Seeds insert:

  - Super admin
  - Demo tenant
  - Tenant admin
  - Users
  - Projects
  - Tasks

- All migrations and seeds run **automatically** on backend startup in Docker

---

## 8. Error Handling Strategy

- Centralized error middleware
- Standard HTTP status codes
- Consistent error response format:

```
{
  success: false,
  message: "Error description"
}
```

---

## 9. Logging & Monitoring

- Audit logs stored in `audit_logs` table
- Logs for:

  - User actions
  - Project updates
  - Task updates
  - Tenant changes

---

## 10. Health Check Endpoint

**Endpoint:** `GET /api/health`

**Purpose:**

- Verify API availability
- Confirm database connectivity
- Signal readiness to Docker and evaluation scripts
