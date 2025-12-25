# Multi-Tenant SaaS Application

A production-ready, multi-tenant SaaS application where multiple organizations (tenants) can independently register, manage their teams, create projects, and track tasks.

## Features

- **Multi-Tenancy**: Complete data isolation with unique subdomains per tenant.
- **Authentication**: Secure JWT-based auth with Role-Based Access Control (RBAC).
- **Three Roles**: Super Admin, Tenant Admin, and User.
- **Subscription Plans**: Free, Pro, and Enterprise tiers with varying limits.
- **Project Management**: Create projects, assign tasks, and track status.
- **Dashboard**: Real-time statistics and recent activity.
- **Responsive UI**: Built with React and optimized for all devices.
- **Dockerized**: Fully containerized backend, frontend, and database.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Docker Desktop installed
- Node.js (v18+) (optional, for local dev without Docker)

## Getting Started (Docker)

The easiest way to run the application is using Docker.

1.  **Clone the repository**
2.  **Start the services**
    ```bash
    docker-compose up -d --build
    ```
    This command will:
    - Start PostgreSQL database on port 5432.
    - Start Backend API on port 5000.
    - Start Frontend on port 3000.
    - **Automatically run database migrations and seed data.**

3.  **Access the Application**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Default Credentials (Seed Data)

**Super Admin**
- Email: `superadmin@system.com`
- Password: `Admin@123`

**Tenant Admin**
- Email: `admin@demo.com`
- Password: `Demo@123`
- Subdomain: `demo`

**Regular User**
- Email: `user1@demo.com`
- Password: `User@123`
- Tenant Subdomain: `demo`

## API Documentation

The backend provides a RESTful API with 19 endpoints.
Detailed documentation can be found in [docs/API.md](docs/API.md).

## Project Structure

- `backend/` - Node.js API server
- `frontend/` - React application
- `database/` - Migrations and Seed data
- `docs/` - Project documentation
- `docker-compose.yml` - Docker orchestration config
