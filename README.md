# Olynixx Academy — Platform Source Code

Full-stack certification & coaching platform built with **Next.js** (Frontend), **FastAPI** (Backend), and **PostgreSQL** (Database), orchestrated via **Docker Compose**.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 4.x+ |
| Node.js *(local dev only)* | 18+ |
| Python *(local dev only)* | 3.11+ |

### 1. Clone & Configure

```bash
git clone <repo-url> && cd olynixx_academy
cp .env.example .env        # ← edit secrets before going to production
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

This launches:

| Service | URL |
|---------|-----|
| PostgreSQL | `localhost:5432` |
| FastAPI Backend | `http://localhost:8000` |
| Next.js Frontend | `http://localhost:3000` |

### 3. Apply Migrations & Seed Data

```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend python seed.py
```

### 4. Local Dev (without Docker)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install && npm run dev
```

> **Note:** When running locally without Docker, the backend defaults to SQLite (`olynixx.db`). Set `DATABASE_URL` in `.env` to point to your Postgres instance for full compatibility.

---

## 🔐 Environment Variables

All variables are defined in `.env.example`. Copy it to `.env` and fill in production values.

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `olynixx` |
| `DATABASE_URL` | Full async DB connection string | `postgresql+asyncpg://...` |
| `SECRET_KEY` | JWT signing key — **change in production** | — |
| `REFRESH_SECRET_KEY` | Refresh token signing key | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `7` |
| `NEXT_PUBLIC_API_URL` | API URL for the frontend | `http://localhost:8000` |
| `BUNNY_LIBRARY_ID` | Bunny.net Stream library ID | — |
| `BUNNY_API_KEY` | Bunny.net API key | — |
| `BUNNY_CDN_HOSTNAME` | Bunny CDN hostname | — |
| `BUNNY_TOKEN_AUTH_KEY` | Bunny token authentication key | — |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `CELERY_BROKER_URL` | Celery broker URL | `redis://localhost:6379/0` |
| `EXAM_PASS_MARK` | Default exam pass percentage | `70` |
| `EXAM_TIME_LIMIT_MINUTES` | Default exam duration | `60` |
| `EXAM_MAX_ATTEMPTS` | Maximum exam attempts | `3` |
| `EXAM_RANDOMISE` | Randomise exam questions | `true` |
| `EXAM_DELIVERY_MODE` | Exam delivery mode (`online` or `in_person`) | `online` |

---

## 📡 API Endpoint Summary

Base path: `/api`

### Auth
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | Public | Login & get JWT |
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/refresh` | User | Refresh access token |

### Users & Profiles
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users/me` | User | Current user profile |
| PATCH | `/users/me` | User | Update profile |

### Courses
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/courses/` | Public | List published courses |
| GET | `/courses/all` | Admin | List all courses |
| GET | `/courses/{id}` | Public | Course detail with modules |
| POST | `/courses/` | Admin | Create course |
| PATCH | `/courses/{id}` | Admin | Update course |
| POST | `/courses/{id}/enroll` | User | Enroll in course |
| POST | `/courses/{id}/progress` | User | Update lesson progress |
| GET | `/courses/my/enrollments` | User | My enrollments |

### Modules & Lessons
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/courses/{id}/modules` | Admin | Create module |
| PATCH | `/modules/{id}` | Admin | Update module |
| DELETE | `/modules/{id}` | Admin | Delete module |
| POST | `/modules/{id}/lessons` | Admin | Create lesson |
| PATCH | `/lessons/{id}` | Admin | Update lesson |
| DELETE | `/lessons/{id}` | Admin | Delete lesson |

### Quizzes
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/modules/{id}/quiz` | User | Get module quiz |
| POST | `/modules/{id}/quiz` | Admin | Create/update quiz |
| POST | `/quizzes/{id}/submit` | User | Submit quiz answers |

### Exams
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/exams/sessions` | User | List exam sessions |
| POST | `/exams/sessions` | Admin | Create exam session |
| POST | `/exams/register/{session_id}` | User | Register for exam |
| POST | `/exams/start/{session_id}` | User | Start exam attempt |
| POST | `/exams/submit/{attempt_id}` | User | Submit exam answers |
| GET | `/exams/results/{attempt_id}` | User | View attempt results |

### Coaches
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/coaches/` | Admin | List all coaches |
| GET | `/coaches/pool` | Admin | Filtered coach pool |
| PATCH | `/coaches/{id}` | Admin | Update coach attributes |

### Projects
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/projects/` | Admin | List projects |
| POST | `/projects/` | Admin | Create project |
| POST | `/projects/{id}/assign` | Admin | Assign coach to project |

### Certificates
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/certificates/` | User | My certificates |
| GET | `/certificates/verify/{code}` | Public | Verify certificate |

### Admin
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard stats |

### Leads
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/leads/` | Public | Submit lead form |
| GET | `/leads/` | Admin | List leads |

---

## 🏗️ Project Structure

```
olynixx_academy/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── seed.py
│   └── app/
│       ├── main.py
│       ├── core/config.py
│       ├── db/
│       │   ├── base.py
│       │   ├── models.py
│       │   └── session.py
│       ├── api/
│       │   ├── api.py           # Router aggregation
│       │   ├── deps.py          # Auth dependencies
│       │   └── endpoints/
│       │       ├── auth.py
│       │       ├── users.py
│       │       ├── courses.py
│       │       ├── modules.py   # NEW — Module & Lesson CRUD
│       │       ├── quizzes.py   # NEW — Quiz endpoints
│       │       ├── exams.py
│       │       ├── coaches.py
│       │       ├── projects.py
│       │       ├── certificates.py
│       │       ├── admin.py
│       │       ├── leads.py
│       │       └── video.py
│       ├── schemas/
│       │   ├── module.py        # NEW
│       │   ├── quiz.py          # NEW
│       │   └── ...
│       └── workers/
│           └── tasks/
│               └── certificates.py  # Stub for PDF generation
└── frontend/
    ├── package.json
    └── src/
```

---

## 👔 Default Credentials (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@olynixx.com` | `admin123` |
| Coach | `coach@olynixx.com` | `coach123` |
| Learner | `learner@olynixx.com` | `learner123` |

---

## 🚢 Deployment Guidance

| Component | Recommended Host |
|-----------|------------------|
| **Application** (FastAPI + Next.js) | Azure App Service / Container Apps (**UAE North**) |
| **Database** (PostgreSQL) | Azure Database for PostgreSQL (**UAE North**) |
| **File Storage** (materials / certificates) | Azure Blob Storage (**UAE North**) |
| **Video** | Bunny.net Stream (global CDN with UAE edge) |
| **Task Queue** | Celery + Redis |

> Phase 1 architecture requires sensitive data residency in **UAE North** for PDPL compliance.

---

## 🔮 Phase 2 Extensibility

- **Commerce / Stripe**: Add `/checkout` route + Stripe Webhooks → auto-create `CourseEnrollment` on payment.
- **Client Portal**: New `UserRole.CLIENT` + `/organisations` protected route (middleware already structured for this).
- **Self-Service Onboarding**: Coach profile models already support user-editable data → feeds into Admin matching pool.
- **Video Hosting**: Bunny Stream integration is wired; supply `BUNNY_*` env vars and upload via the `/video` endpoints.
- **Certificate PDFs**: Stub task exists at `workers/tasks/certificates.py` — implement with reportlab/weasyprint + Azure Blob.

---

## ✅ Current Compliance Baseline

### Theme (strict)

- Brand palette is enforced through tokens and component styling with only:
  - `#25C0D2` (primary accent)
  - `#3E80CC` (secondary accent)
  - `#2E3C8E` (deep accent)
  - `#0A0A0A` (near-black)

### Scope (Phase 1 — Architecture + Schema aligned)

- Public portal + learner/coach/admin areas are active.
- Configurable online exam engine (`exam_configs` + attempts with JSONB snapshots).
- **Dual-gate certification**: written exam pass **and** practical assessment PASS required before certificate issuance.
- Automatic Learner → Coach upgrade on successful dual-gate certification.
- Linear level prerequisites (L2 requires active L1, L3 requires active L2).
- Placement gate: `placement_eligible` + signed `coach_agreements` (NDA + Code of Conduct) before project assignment.
- Soft-delete / anonymisation for users (preserves exam/certificate audit trail).
- Operators + projects + project assignments for coach pool dispatch.
- Certificate lifecycle status: `ACTIVE` / `EXPIRED` / `REVOKED`.

### Deferred (Phase 2+)

- Online payment and self-service enrolment
- Full client portal workflows
- Expanded commerce and deployment automation
- Production Azure UAE North cutover (local Docker remains the default for development)
