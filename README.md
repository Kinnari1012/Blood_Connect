# BloodConnect 🩸

**Connecting Donors. Saving Lives.**

A secure, multilingual, production-ready blood donation platform built with React, Node.js, and MongoDB.

---

## Features

- **4 User Roles**: Super Admin → Admin → Donor → Seeker
- **Multilingual**: English, Gujarati (ગુજરાતી), Hindi (हिन्दी)
- **Fully Responsive**: Mobile (bottom nav), Tablet (adaptive), Desktop (sidebar + multi-column)
- **Blood Request System**: Normal + Emergency requests with automatic donor matching
- **Admin Dashboard**: Charts, analytics, user management, audit logs
- **Security**: JWT + httpOnly refresh tokens, bcrypt, RBAC, rate limiting, Helmet
- **i18n**: i18next with complete translations for all 27 screens

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|----------------------------------------------|
| Frontend  | React 18, TypeScript, Tailwind CSS v4, Vite  |
| Backend   | Node.js, Express 5, TypeScript               |
| Database  | MongoDB 7 via Mongoose 9                     |
| Auth      | JWT (access + refresh), bcryptjs             |
| Charts    | Recharts                                     |
| Forms     | React Hook Form + Zod validation             |
| i18n      | i18next + react-i18next                      |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Community Server 7+ **or** Docker

### 1. Database Setup

**Option A — MongoDB Community (no Docker required):**

Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).  
The default connection `mongodb://localhost:27017` works out of the box — no credentials needed for local development.

**Option B — Docker:**

```bash
docker run -d --name bloodconnect-db \
  -p 27017:27017 \
  mongo:7-jammy
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
# Edit .env — set JWT_SECRET, JWT_REFRESH_SECRET (and optionally MONGODB_URI)

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend runs at http://localhost:5000.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173 and proxies API calls to the backend at http://localhost:5000.

---

## Docker Compose (all services)

```bash
docker compose up --build
```

This starts MongoDB, the backend API (port 5000), and the frontend (port 80).

---

## Project Structure

```
bloodconnect/
├── frontend/          # React 18 + TypeScript SPA
│   └── src/
│       ├── components/   # Reusable UI (Button, Input, Card, Modal…)
│       ├── pages/        # 27 screens (public, donor, seeker, admin, shared)
│       ├── store/        # AuthContext (JWT + role state)
│       ├── services/     # API client (axios + auto-refresh interceptor)
│       ├── i18n/         # en.json, gu.json, hi.json
│       ├── types/        # TypeScript interfaces
│       └── constants/    # Blood groups, routes, permissions
│
└── backend/           # Node.js + Express 5 + TypeScript API
    └── src/
        ├── models/       # Mongoose models (User, DonorProfile, BloodRequest…)
        ├── modules/      # auth, donors, requests, notifications, reports, admin, analytics, audit
        ├── middleware/   # verifyToken, requireRole, requirePermission, errorHandler
        ├── services/     # matching, notification, audit
        ├── config/       # database (Mongoose), env
        └── types/        # TypeScript types, blood compatibility matrix
```

---

## API Endpoints

| Group          | Base Path              | Auth Required    |
|----------------|------------------------|-----------------|
| Auth           | `/api/auth`            | Partial          |
| Donors         | `/api/donors`          | JWT              |
| Blood Requests | `/api/requests`        | JWT              |
| Notifications  | `/api/notifications`   | JWT              |
| Reports        | `/api/reports`         | JWT              |
| Admin          | `/api/admin`           | JWT + Role       |
| Analytics      | `/api/analytics`       | JWT + Permission |
| Audit Logs     | `/api/audit-logs`      | JWT + Permission |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# MongoDB (defaults to local; no credentials needed for local dev)
MONGODB_URI=mongodb://localhost:27017/bloodconnect

# JWT — generate strong random secrets (min 32 chars)
JWT_SECRET=<min-32-char-secret>
JWT_REFRESH_SECRET=<min-32-char-secret>

# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Donor eligibility gap in days (default: 90)
ELIGIBILITY_GAP_DAYS=90

# Max donors to notify per request (default: 10)
MAX_DONOR_NOTIFY_COUNT=10
```

---

## Running Tests

```bash
cd backend
npm test
```

9 tests covering:
- Blood group compatibility matrix (7 tests)
- Donor eligibility date calculation (2 tests)

---

## Screens (27 total)

| # | Screen | Role |
|---|--------|------|
| 1 | Splash Screen | Public |
| 2 | Onboarding + Language Selection | Public |
| 3 | Login | Public |
| 4 | Register | Public |
| 5 | Home | All |
| 6 | Find Blood | All |
| 7 | Donor Registration | Donor |
| 8 | Donor Dashboard | Donor |
| 9 | Donation History | Donor |
| 10 | Seeker Dashboard | Seeker |
| 11 | Blood Request Form | Seeker |
| 12 | Emergency Request | Seeker |
| 13 | Request Details | Auth |
| 14 | Notifications | Auth |
| 15 | Settings | Auth |
| 16 | Profile | Auth |
| 17 | Admin Dashboard | Admin |
| 18 | User Management | Admin |
| 19 | Admin Management | Super Admin |
| 20 | Reports | Admin |
| 21 | Audit Logs | Admin |
| 22 | Privacy Policy | Public |
| 23 | Terms & Conditions | Public |
| 24 | Help & Support | Public |

---

## Security Architecture

- bcrypt (cost 12) password hashing
- JWT access tokens (15 min) + httpOnly cookie refresh tokens (7 days)
- Account lockout after 5 failed login attempts
- Rate limiting: 100 req/15 min general, 10 req/15 min on auth routes
- Helmet security headers + strict CORS
- Backend RBAC enforced on every protected endpoint — never frontend-only
- Complete home address never exposed in public donor search API
- Audit logging for all admin actions
- Input validation via Zod on all API routes

---

*BloodConnect — Connecting Donors. Saving Lives.*
