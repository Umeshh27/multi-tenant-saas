# API Documentation

## Authentication

### 1. Tenant Registration
- **Endpoint**: `POST /api/auth/register-tenant`
- **Auth**: Public
- **Body**:
  ```json
  {
    "tenantName": "Company Name",
    "subdomain": "company",
    "adminEmail": "admin@company.com",
    "adminPassword": "password123",
    "adminFullName": "Admin Name"
  }
  ```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "user@company.com",
    "password": "password123",
    "tenantSubdomain": "company"
  }
  ```

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Bearer Token
- **Response**: User and Tenant details.

### 4. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Bearer Token

---

## Tenant Management

### 5. Get Tenant Details
- **Endpoint**: `GET /api/tenants/:tenantId`
- **Auth**: Tenant Member or Super Admin

### 6. Update Tenant
- **Endpoint**: `PUT /api/tenants/:tenantId`
- **Auth**: Tenant Admin (Name only) or Super Admin (All fields)

### 7. List All Tenants
- **Endpoint**: `GET /api/tenants`
- **Auth**: Super Admin Only

---

## User Management

### 8. Add User to Tenant
- **Endpoint**: `POST /api/tenants/:tenantId/users`
- **Auth**: Tenant Admin

### 9. List Tenant Users
- **Endpoint**: `GET /api/tenants/:tenantId/users`
- **Auth**: Tenant Member

### 10. Update User
- **Endpoint**: `PUT /api/users/:userId`
- **Auth**: Tenant Admin

### 11. Delete User
- **Endpoint**: `DELETE /api/users/:userId`
- **Auth**: Tenant Admin

---

## Project Management

### 12. Create Project
- **Endpoint**: `POST /api/projects`
- **Auth**: Tenant Member

### 13. List Projects
- **Endpoint**: `GET /api/projects`
- **Auth**: Tenant Member

### 14. Update Project
- **Endpoint**: `PUT /api/projects/:projectId`
- **Auth**: Admin or Creator

### 15. Delete Project
- **Endpoint**: `DELETE /api/projects/:projectId`
- **Auth**: Admin or Creator

---

## Task Management

### 16. Create Task
- **Endpoint**: `POST /api/projects/:projectId/tasks`
- **Auth**: Tenant Member

### 17. List Project Tasks
- **Endpoint**: `GET /api/projects/:projectId/tasks`
- **Auth**: Tenant Member

### 18. Update Task Status
- **Endpoint**: `PATCH /api/tasks/:taskId/status`
- **Auth**: Tenant Member

### 19. Update Task
- **Endpoint**: `PUT /api/tasks/:taskId`
- **Auth**: Tenant Member
