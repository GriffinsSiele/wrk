# Olynixx Praxis

Full-stack specialisation, certification, and coach placement platform.

**Learn → Certify → Deploy**

| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router) |
| Backend | FastAPI |
| Database | PostgreSQL 15 |
| Local run | Docker Compose |

Demo frontend (hosted): [olynixx-academy.vercel.app](https://olynixx-academy.vercel.app/)

---

## Run the whole system (recommended)

This is the supported local path. One command starts **Postgres + API + frontend**.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running (4.x+)
- Git

### 1. Open the project

```bash
cd olynixx_academy
```

### 2. Create your env file

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

For local Docker you can keep the defaults in `.env.example`. Change secrets before any shared or production deploy.

### 3. Start everything

```bash
docker compose up -d --build
```

Wait until containers are up (first build can take a few minutes).

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |
| PostgreSQL | `localhost:5432` |

### 4. Apply database migrations

Required on first run (and after pulling new migrations):

```bash
docker compose exec backend alembic upgrade head
```

### 5. Seed demo data (local only)

```bash
docker compose exec backend python seed.py --force
```

That creates demo users, courses, exam config, and sample activity so the portals have data to show.

| Mode | Command | Use |
|------|---------|-----|
| `demo` (default) | `docker compose exec -e SEED_MODE=demo backend python seed.py --force` | Local / staging — full demo cohort |
| `minimal` | `docker compose exec -e SEED_MODE=minimal backend python seed.py` | Admin bootstrap only — safer for production |

**Do not run demo seed against a real production database.**

### 6. Log in

Open http://localhost:3000/login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@olynixx.com` | `admin123` |
| Coach | `coach@olynixx.com` | `coach123` |
| Learner | `learner@olynixx.com` | `learner123` |

These exist only after seeding. Never ship them in production UI.

---

## Everyday commands

```bash
# Start (if already built)
docker compose up -d

# Restart all services
docker compose restart db backend frontend

# Follow logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down

# Stop and wipe the database volume (destructive)
docker compose down -v
```

After `down -v`, run migrations + seed again (steps 4–5).

---

## Verify it is healthy

```bash
docker compose ps
curl http://localhost:8000/health
```

Expect backend JSON like `{"status":"ok",...}` and frontend at http://localhost:3000 returning 200.

On Windows PowerShell:

```powershell
Invoke-WebRequest http://localhost:8000/health -UseBasicParsing
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

---

## What you can do in each portal

### Public site
Marketing pages, login, certificate verification.

### Learner (`/learner`)
Course player, quizzes, Phase 1 online exam (90s/question, one-way, resume on disconnect), dual-gate certificate status.

### Coach (`/coach`)
Assignments board, profile, NDA / Code of Conduct, CEC, placement eligibility.

### Admin (`/admin`)
Users, talent pool, project dispatch, **content management** (courses → modules → lessons + Bunny video IDs), exams (including anomaly flags), practical assessments, agreements.

### Course content & video

1. Admin → **Content management**
2. Create **course** → **module** → **lesson**
3. Upload the video in **Bunny Stream**, paste the video GUID into the lesson
4. Set `BUNNY_*` and `NEXT_PUBLIC_BUNNY_LIBRARY_ID` in `.env` for playback (optional locally; without Bunny keys, video APIs return 503 / player shows a placeholder)

Videos are **not** uploaded to this app’s server — only the Bunny GUID is stored.

---

## Production hosting gate (Jef / PDPL)

**Railway is demo/engineering only.** Production primary data must reside in **Azure UAE North** with encrypted, geographically redundant backups (confirm in Azure — [`docs/PRODUCTION_BACKUPS.md`](docs/PRODUCTION_BACKUPS.md)). Do not place real learner/coach PII on Railway ([`docs/RAILWAY_PII_CONFIRMATION.md`](docs/RAILWAY_PII_CONFIRMATION.md)).

| Target | Value |
|--------|--------|
| API hostname | `https://api.olynixx.com` |
| Site canonical | `https://olynixx.com` (set `NEXT_PUBLIC_SITE_URL`) |
| Region | Azure `uaenorth` — see [`docs/PRODUCTION_AZURE.md`](docs/PRODUCTION_AZURE.md) |

Scratch hosts like `*.up.railway.app` must not appear where partners or accreditors can see them.

---

## Certification path (dual-gate)

1. Study — enrol and complete lessons  
2. Written exam — attempt + **admin approval**  
3. Practical — admin records **PASS**  
4. Certificate issued when **both** gates pass  
5. Learner may be upgraded to coach; placement needs active cert + signed NDA & Code of Conduct  

---

## How the pieces talk to each other

```
Browser  →  http://localhost:3000  (Next.js)
                │
                │  /api/proxy/...  (httpOnly cookie → Bearer)
                ▼
         http://backend:8000/api/...  (FastAPI, Docker network)
                │
                ▼
         PostgreSQL (db:5432)
```

- Browser-facing API URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- Server-side proxy inside Docker: `INTERNAL_API_URL` (default `http://backend:8000`)
- Interactive API reference: http://localhost:8000/docs

---

## Environment variables

Full template: **`.env.example`**. Copy to `.env` and edit.

| Variable | Purpose | Local default |
|----------|---------|---------------|
| `POSTGRES_*` | Postgres user / password / db name | `postgres` / `postgres` / `olynixx` |
| `SECRET_KEY` | JWT access signing | change for shared envs |
| `REFRESH_SECRET_KEY` | JWT refresh signing | change for shared envs |
| `CORS_ORIGINS` | Allowed browser origins | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Browser → API | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site (SEO) | `http://localhost:3000` |
| `INTERNAL_API_URL` | Next container → API | `http://backend:8000` |
| `BUNNY_LIBRARY_ID` | Bunny Stream library | empty |
| `NEXT_PUBLIC_BUNNY_LIBRARY_ID` | Same ID for iframe player | empty |
| `BUNNY_API_KEY` / `BUNNY_CDN_HOSTNAME` / `BUNNY_TOKEN_AUTH_KEY` | Signed streaming | empty |
| `EXAM_PASS_MARK` | Fallback pass mark if no ExamConfig | `78` (admin-configurable) |
| `EXAM_QUESTION_COUNT` | Fallback question count if no ExamConfig | `40` (admin-configurable) |
| `EXAM_SECONDS_PER_QUESTION` | Phase 1 per-question timer | `90` |
| `EXAM_TIME_LIMIT_MINUTES` | Overall exam ceiling | `60` |
| `RESET_TOKEN_RETURN_IN_RESPONSE` | Return raw reset token in API (demo only) | `false` |
| `CERTIFICATE_STORAGE_DIR` | Generated PDF path | `storage/certificates` |

Production refuses weak default secrets and SQLite. See deployment docs below.

---

## Optional: run without Docker

Use this only if you already run Postgres yourself (or accept SQLite fallback).

**Backend**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
# Point DATABASE_URL at Postgres (see .env.example)
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` and `INTERNAL_API_URL=http://localhost:8000` in the frontend env when not using Compose.

---

## Project layout

```
olynixx_academy/
├── .env.example          # copy → .env
├── docker-compose.yml    # db + backend + frontend
├── docs/
│   ├── ARCHITECTURE.md             # system map for a second developer
│   ├── AZURE_MIGRATION_PLAN.md     # sequence, dependencies, Railway cutover
│   ├── PRODUCTION_BACKUPS.md       # encryption / geo-redundancy / residency
│   ├── RAILWAY_PII_CONFIRMATION.md # demo data vs operator Railway checks
│   ├── PRODUCTION_BACKEND.md       # Railway API + Vercel frontend (demo)
│   └── PRODUCTION_AZURE.md         # Azure UAE North resource steps
├── backend/
│   ├── app/              # FastAPI app, models, services, APIs
│   ├── alembic/          # migrations
│   ├── scripts/          # create_admin.py, etc.
│   ├── seed.py
│   └── storage/certificates/
└── frontend/
    ├── public/brand/
    └── src/app/          # public + /learner + /coach + /admin
```

---

## Production

| Goal | Doc |
|------|-----|
| Understand the system cold | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Azure UAE North migration (sequence + cutover) | [`docs/AZURE_MIGRATION_PLAN.md`](docs/AZURE_MIGRATION_PLAN.md) |
| Production backup encryption and residency | [`docs/PRODUCTION_BACKUPS.md`](docs/PRODUCTION_BACKUPS.md) |
| Railway PII confirmation (demo only) | [`docs/RAILWAY_PII_CONFIRMATION.md`](docs/RAILWAY_PII_CONFIRMATION.md) |
| Keep Vercel demo frontend, host API elsewhere | [`docs/PRODUCTION_BACKEND.md`](docs/PRODUCTION_BACKEND.md) |
| Azure resource create steps | [`docs/PRODUCTION_AZURE.md`](docs/PRODUCTION_AZURE.md) |

Production checklist (short):

1. Strong unique `SECRET_KEY` and `REFRESH_SECRET_KEY`
2. Real Postgres (`DATABASE_URL` with `postgresql+asyncpg://…`)
3. `ENVIRONMENT=production`
4. `CORS_ORIGINS` = your live frontend origin(s)
5. Point Vercel `INTERNAL_API_URL` / `NEXT_PUBLIC_API_URL` at the live API
6. Create an admin with `backend/scripts/create_admin.py` — **do not** demo-seed production
7. Configure Bunny if learners need video

---

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Frontend 401s calling API | Use `/api/proxy/...` (cookie → Bearer). Hard refresh after login. |
| `docker compose` build fails | Ensure Docker Desktop is running; retry `docker compose up -d --build`. |
| Empty portals / no login users | Run migrations, then `python seed.py --force`. |
| Video missing / 503 | Set Bunny env vars; paste GUID on the lesson; set `NEXT_PUBLIC_BUNNY_LIBRARY_ID`. |
| DB connection errors | Wait for `olynixx_db` healthy (`docker compose ps`), then restart backend. |
| Port already in use | Stop other apps on `3000` / `8000` / `5432`, or change ports in `docker-compose.yml`. |

---

## License / ownership

Private RiseUp / Olynixx Praxis project. Do not commit `.env`, certificate PDFs, or local `venv` directories.
