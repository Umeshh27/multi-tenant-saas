## **Multi-Tenant SaaS Platform – Research Document**

## 1. Multi-Tenancy Analysis

Multi-tenancy is an architectural approach where a single software application serves multiple customers (tenants) while ensuring strict data isolation, security, and performance fairness. Each tenant represents an independent organization using the same system but with completely separated data and access boundaries.

There are three commonly used multi-tenancy models in modern SaaS systems.

---

### **Approach 1: Shared Database + Shared Schema (tenant_id based)**

**Description:**
All tenants share a single database and the same set of tables. Each table contains a `tenant_id` column, which is used to identify which tenant owns a particular record.

**Example:**

```
projects
- id
- tenant_id
- name
- description
```

**Pros:**

- Cost-effective and easy to scale
- Simple database management
- Easy to onboard new tenants
- Works well with containerized deployments
- Suitable for small to medium SaaS platforms

**Cons:**

- Requires very careful query filtering
- A bug in filtering logic may expose data
- Schema changes affect all tenants
- Complex queries if tenant isolation is not enforced properly

---

### **Approach 2: Shared Database + Separate Schema (schema per tenant)**

**Description:**
All tenants share the same database server, but each tenant has its own schema. Tables are duplicated per tenant under different schemas.

**Pros:**

- Better isolation than shared schema
- Easier to backup or restore a single tenant
- Reduced risk of accidental data leaks

**Cons:**

- Schema management becomes complex
- Difficult to scale with many tenants
- Database migrations must be applied to all schemas
- Higher operational complexity

---

### **Approach 3: Separate Database per Tenant**

**Description:**
Each tenant has its own dedicated database.

**Pros:**

- Maximum data isolation
- Easy compliance with enterprise requirements
- Independent scaling per tenant

**Cons:**

- Very high infrastructure cost
- Complex database provisioning
- Difficult to manage thousands of tenants
- Not suitable for early-stage SaaS products

---

### **Chosen Approach & Justification**

✅ **Chosen Model: Shared Database + Shared Schema with tenant_id**

**Reasons for selection:**

- Matches the project scope and evaluation expectations
- Easy to containerize using Docker
- Simple onboarding for new tenants
- Scales well for hundreds of tenants
- Industry-standard approach used by platforms like Slack (early), Notion, and GitHub (logical isolation)

**Data Isolation Strategy:**

- Every table (except super_admin users) includes `tenant_id`
- Tenant ID is extracted only from JWT
- Client-provided tenant_id is never trusted
- Super admin users have `tenant_id = NULL`

This approach balances **simplicity, scalability, and cost**, making it ideal for this SaaS project.

---

## 2. Technology Stack Justification

### **Backend**

**Node.js + Express.js**

- Lightweight and fast
- Large ecosystem
- Easy JWT authentication
- Well-suited for REST APIs
- Simple integration with PostgreSQL

**Alternatives considered:**

- Django (Python): heavier for simple REST APIs
- Spring Boot (Java): too complex for project scope

---

### **Frontend**

**React.js**

- Component-based architecture
- Excellent for dashboards
- Strong ecosystem
- Easy role-based UI rendering
- Works well with REST APIs

**Alternatives considered:**

- Angular (steeper learning curve)
- Vue (smaller ecosystem)

---

### **Database**

**PostgreSQL**

- Strong relational integrity
- Excellent indexing support
- ACID compliant
- Widely used in SaaS platforms

**Alternatives considered:**

- MySQL (less strict constraints)
- MongoDB (not ideal for relational multi-tenant data)

---

### **Authentication**

**JWT (JSON Web Tokens)**

- Stateless
- Scales well
- Works perfectly with microservices
- No session storage required

**Alternatives considered:**

- Session-based auth (harder to scale)

---

### **Containerization**

**Docker + Docker Compose**

- Consistent environments
- One-command deployment
- Easy evaluation
- Industry-standard DevOps practice

---

## 3. Security Considerations

Security is critical in multi-tenant systems because a single vulnerability can affect multiple organizations.

### **1. Data Isolation**

- All queries are filtered using `tenant_id`
- Tenant ID is extracted from JWT, not request body
- Super admin bypasses tenant filter safely

---

### **2. Authentication & Authorization**

- JWT tokens signed with secret key
- Token expiry: 24 hours
- Role-based access control (RBAC)
- Middleware enforces role permissions

---

### **3. Password Security**

- Passwords are hashed using bcrypt
- Plain text passwords are never stored
- Secure comparison during login

---

### **4. API Security**

- Input validation on all endpoints
- Proper HTTP status codes
- No sensitive data in responses
- CORS configured strictly

---

### **5. Audit Logging**

- All CREATE, UPDATE, DELETE actions logged
- Helps detect suspicious activity
- Supports compliance and debugging
