# Production go-live, Azure (UAE North) + secrets

This guide takes Olynixx Praxis from local Docker to a production deployment on **Azure UAE North**, with secrets stored in **Key Vault** (not in Git or plain Container App env UI long-term).

What is already hardened in code (this repo):

- `ENVIRONMENT=production` turns off OpenAPI docs (unless `ENABLE_DOCS=true`)
- SQL echo forced off in production
- `/health` probe for Container Apps
- Login / register / leads rate limits
- Soft-deleted / inactive users rejected
- Coach portal routes require coach role
- Exam booking respects session **capacity**
- Exam submit enforces **time limit + grace** (`EXAM_SUBMIT_GRACE_MINUTES`)
- Certificates require written pass **and** `approved_at`
- Bunny video tokens fail closed (**503**) when keys are missing
- `Dockerfile.prod` + `docker-compose.prod.yml` for prod-shaped builds

What you still do manually in Azure / vendor consoles: create resources, generate secrets, wire Key Vault, DNS, Bunny, first admin user (do **not** run `seed.py` in production).

---

## 0. Prerequisites

1. Azure subscription with permission to create resources in **UAE North**
2. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed locally
3. Docker Desktop (to build/push images)
4. Domain ready (e.g. `olynixx.com`), or temporary `*.azurecontainerapps.io` hostnames for staging
5. Bunny.net account (for lesson video)

Login and set defaults:

```bash
az login
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"
az config set defaults.location=uaenorth
```

Suggested names (change if taken):

| Resource | Suggested name |
|----------|----------------|
| Resource group | `rg-olynixx-prod` |
| Key Vault | `kv-olynixx-prod` |
| ACR | `acrolynixx` |
| Postgres | `psql-olynixx-prod` |
| Storage account | `stolynixxprod` |
| Container Apps env | `cae-olynixx-prod` |
| Backend app | `ca-olynixx-api` |
| Frontend app | `ca-olynixx-web` |

---

## 1. Create the resource group

```bash
az group create --name rg-olynixx-prod --location uaenorth
```

---

## 2. Generate application secrets (do this first)

Run on your machine (Git Bash / WSL / macOS / Linux). On Windows PowerShell without OpenSSL:

```powershell
# PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]:Create().GetBytes($bytes)
([System.BitConverter]:ToString($bytes) -replace '-','').ToLower()
```

Or with OpenSSL:

```bash
openssl rand -hex 32   # → SECRET_KEY
openssl rand -hex 32   # → REFRESH_SECRET_KEY
openssl rand -hex 24   # → strong Postgres password (store safely)
```

Save these in a password manager. You will paste them into Key Vault next, **never commit them**.

Also decide:

- `POSTGRES_USER` (e.g. `olynixx_admin`)
- `POSTGRES_DB` (e.g. `olynixx`)
- Public URLs once DNS exists:
  - `https://olynixx.com` (frontend)
  - `https://api.olynixx.com` (backend), or one hostname with path routing

---

## 3. Azure Key Vault (source of truth for secrets)

```bash
az keyvault create \
  --name kv-olynixx-prod \
  --resource-group rg-olynixx-prod \
  --location uaenorth \
  --enable-rbac-authorization true
```

Store secrets (replace values):

```bash
az keyvault secret set --vault-name kv-olynixx-prod --name SECRET-KEY --value "<paste>"
az keyvault secret set --vault-name kv-olynixx-prod --name REFRESH-SECRET-KEY --value "<paste>"
az keyvault secret set --vault-name kv-olynixx-prod --name POSTGRES-PASSWORD --value "<paste>"
az keyvault secret set --vault-name kv-olynixx-prod --name BUNNY-API-KEY --value "<from Bunny>"
az keyvault secret set --vault-name kv-olynixx-prod --name BUNNY-TOKEN-AUTH-KEY --value "<from Bunny>"
```

Key Vault secret names use hyphens; map them to env vars (`SECRET_KEY`, etc.) when wiring Container Apps.

Grant yourself (and later the Container Apps managed identity) access:

```bash
# Your user Object ID
az ad signed-in-user show --query id -o tsv

az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee "<YOUR_OBJECT_ID>" \
  --scope $(az keyvault show -n kv-olynixx-prod -g rg-olynixx-prod --query id -o tsv)
```

---

## 4. PostgreSQL Flexible Server (UAE North)

```bash
az postgres flexible-server create \
  --resource-group rg-olynixx-prod \
  --name psql-olynixx-prod \
  --location uaenorth \
  --admin-user olynixx_admin \
  --admin-password "<POSTGRES_PASSWORD>" \
  --sku-name Standard_B2s \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --public-access 0.0.0.0 \
  --yes
```

> Prefer private access + VNet integration for real production. `public-access 0.0.0.0` is only for first bring-up; lock firewall to Container Apps outbound IPs / private endpoint ASAP.

Create the database:

```bash
az postgres flexible-server db create \
  --resource-group rg-olynixx-prod \
  --server-name psql-olynixx-prod \
  --database-name olynixx
```

Connection string format used by the app:

```text
postgresql+asyncpg://olynixx_admin:<PASSWORD>@psql-olynixx-prod.postgres.database.azure.com:5432/olynixx?ssl=require
```

Store it:

```bash
az keyvault secret set --vault-name kv-olynixx-prod --name DATABASE-URL \
  --value "postgresql+asyncpg://olynixx_admin:<PASSWORD>@psql-olynixx-prod.postgres.database.azure.com:5432/olynixx?ssl=require"
```

Allow Azure services temporarily (tighten later):

```bash
az postgres flexible-server firewall-rule create \
  --resource-group rg-olynixx-prod \
  --name psql-olynixx-prod \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## 5. Azure Container Registry

```bash
az acr create \
  --resource-group rg-olynixx-prod \
  --name acrolynixx \
  --sku Basic \
  --admin-enabled false

az acr login --name acrolynixx
```

Build and push from the repo root (PowerShell / bash):

```bash
# Backend
docker build -f backend/Dockerfile.prod -t acrolynixx.azurecr.io/olynixx-api:v1 ./backend
docker push acrolynixx.azurecr.io/olynixx-api:v1

# Frontend (set real public URLs as build args)
docker build -f frontend/Dockerfile.prod \
  --build-arg NEXT_PUBLIC_API_URL=https://api.olynixx.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://olynixx.com \
  -t acrolynixx.azurecr.io/olynixx-web:v1 ./frontend
docker push acrolynixx.azurecr.io/olynixx-web:v1
```

---

## 6. Container Apps environment + apps

```bash
az extension add --name containerapp --upgrade

az containerapp env create \
  --name cae-olynixx-prod \
  --resource-group rg-olynixx-prod \
  --location uaenorth
```

Grant ACR pull via managed identity (recommended):

```bash
az containerapp registry set \
  --name ca-olynixx-api \
  --resource-group rg-olynixx-prod \
  --server acrolynixx.azurecr.io \
  --identity system
```

(Do this after creating the apps below, or create apps with `--registry-server` and identity in one shot via Portal.)

### Backend Container App

```bash
az containerapp create \
  --name ca-olynixx-api \
  --resource-group rg-olynixx-prod \
  --environment cae-olynixx-prod \
  --image acrolynixx.azurecr.io/olynixx-api:v1 \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --registry-server acrolynixx.azurecr.io \
  --system-assigned \
  --env-vars \
    ENVIRONMENT=production \
    ENABLE_DOCS=false \
    ACCESS_TOKEN_EXPIRE_MINUTES=1440 \
    CORS_ORIGINS=https://olynixx.com \
    EXAM_DELIVERY_MODE=online \
    BUNNY_LIBRARY_ID="<id>" \
    BUNNY_CDN_HOSTNAME="<cdn-host>" \
    CERTIFICATE_STORAGE_DIR=/app/storage/certificates
```

Then attach Key Vault secrets as env (Portal → Container App → Secrets → Key Vault reference, or CLI):

Map:

| Env var | Key Vault secret |
|---------|------------------|
| `SECRET_KEY` | `SECRET-KEY` |
| `REFRESH_SECRET_KEY` | `REFRESH-SECRET-KEY` |
| `DATABASE_URL` | `DATABASE-URL` |
| `BUNNY_API_KEY` | `BUNNY-API-KEY` |
| `BUNNY_TOKEN_AUTH_KEY` | `BUNNY-TOKEN-AUTH-KEY` |

Give the app’s system-assigned identity **Key Vault Secrets User** on the vault:

```bash
APP_ID=$(az containerapp show -n ca-olynixx-api -g rg-olynixx-prod --query identity.principalId -o tsv)
VAULT_ID=$(az keyvault show -n kv-olynixx-prod -g rg-olynixx-prod --query id -o tsv)

az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $APP_ID \
  --scope $VAULT_ID
```

Health probe path: `/health`

### Frontend Container App

```bash
az containerapp create \
  --name ca-olynixx-web \
  --resource-group rg-olynixx-prod \
  --environment cae-olynixx-prod \
  --image acrolynixx.azurecr.io/olynixx-web:v1 \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --registry-server acrolynixx.azurecr.io \
  --env-vars \
    INTERNAL_API_URL=https://<backend-fqdn> \
    NEXT_PUBLIC_SITE_URL=https://olynixx.com
```

`INTERNAL_API_URL` should point at the **backend FQDN** (Container App URL or custom `api.olynixx.com`) so the Next.js server proxy can call the API.

---

## 7. Run database migrations (required)

Do **not** rely on auto-create tables in production. Run Alembic once per release:

Option A, one-shot Container Apps Job / temporary revision command:

```bash
# Locally against Azure Postgres (firewall must allow your IP)
cd backend
export DATABASE_URL="postgresql+asyncpg://..."
alembic upgrade head
```

Option B, Azure Container Apps Job using the same backend image:

```text
Command: alembic upgrade head
Env: DATABASE_URL from Key Vault
```

Confirm:

```bash
alembic current
```

**Do not run `python seed.py` in production.** Seed creates demo passwords (`admin123`, etc.). Create a real admin via a controlled script or SQL + hashed password after go-live.

---

## 8. Bunny.net video keys (how to get them)

1. Sign up / log in at [bunny.net](https://bunny.net)
2. **Stream** → create a **Video Library** (e.g. `olynixx-praxis`)
3. Library settings → copy:
   - **Library ID** → `BUNNY_LIBRARY_ID`
   - **API key** (library or account) → `BUNNY_API_KEY`
   - **CDN hostname** (e.g. `vz-xxxxx.b-cdn.net`) → `BUNNY_CDN_HOSTNAME`
4. Enable **Token Authentication** on the pull zone / Stream CDN:
   - Copy **Token authentication key** → `BUNNY_TOKEN_AUTH_KEY`
5. Upload lesson videos; put each video’s Bunny GUID into `lessons.bunny_video_id` in admin / DB
6. Store API + token keys in Key Vault; put library ID + CDN hostname as non-secret env vars (or also in Key Vault)

Until these are set, `GET /api/video/{lesson_id}/token` returns **503** (intentional, no placeholder CDN).

---

## 9. Custom domain + HTTPS + CORS

1. In Container Apps → custom domains:
   - `olynixx.com` / `www` → frontend app
   - `api.olynixx.com` → backend app
2. Add DNS CNAME / TXT as Azure instructs; managed certificates are usually free for Container Apps
3. Set backend:

```text
CORS_ORIGINS=https://olynixx.com,https://www.olynixx.com
```

4. Rebuild frontend with matching `NEXT_PUBLIC_*` build args after domains are final
5. Set `NEXT_PUBLIC_SITE_URL=https://olynixx.com` for sitemap / Open Graph

---

## 10. Optional: Blob storage for certificate PDFs

Today certificates write under `CERTIFICATE_STORAGE_DIR` (container filesystem / volume). For multi-replica production:

1. Create Storage Account `stolynixxprod` in UAE North
2. Create container `certificates`
3. Later: wire Azure Blob SDK (not yet in this Phase 1 codebase) **or** mount Azure Files into `/app/storage/certificates` on the backend Container App

Minimum viable now: single replica + Azure Files mount so PDFs survive restarts.

---

## 11. Production checklist (before traffic)

- [ ] `ENVIRONMENT=production`
- [ ] Docs disabled (`/docs` 404)
- [ ] `SECRET_KEY` / `REFRESH_SECRET_KEY` are random 32+ byte hex, not defaults
- [ ] Postgres password is strong; firewall locked down
- [ ] `alembic upgrade head` applied
- [ ] No demo seed / change all default accounts
- [ ] Bunny keys live; sample lesson plays
- [ ] CORS matches real frontend origin only
- [ ] `/health` returns `ok`
- [ ] Login rate limit verified (hammer login → 429)
- [ ] Exam: book until capacity full → error; submit after time limit → error
- [ ] Written exam must be **admin-approved** before certificate dual-gate
- [ ] Custom domain HTTPS green
- [ ] Backups enabled on Flexible Server
- [ ] Budget alert on the resource group

---

## 12. Local rehearsal (optional, before Azure spend)

```bash
cp .env.example .env.prod
# Edit: strong SECRET_KEY, REFRESH_SECRET_KEY, POSTGRES_PASSWORD, CORS_ORIGINS, URLs

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm migrate
```

Visit `http://localhost:3000` and `http://localhost:8000/health`.

---

## 13. First real admin (after empty migrate)

Use a one-off secure process, for example:

1. Temporarily enable a locked-down register endpoint / invite-only flow, **or**
2. Run a small trusted script inside the backend container that hashes a password with the same `passlib` scheme the app uses and inserts `role=admin`

Never reuse demo credentials from `seed.py`.

---

## 14. What stays out of Phase 1 (known follow-ups)

- Learner exam attempt UI completeness
- Config-driven proctoring enforcement
- Full agreement legal body / evidence hash
- Celery workers (PDF is sync today)
- Canonical Azure Blob certificate pipeline
- Refresh-token rotation in the frontend cookie flow

---

## Quick secret map

| Secret | Where to get it | Where it lives |
|--------|-----------------|----------------|
| `SECRET_KEY` | `openssl rand -hex 32` | Key Vault → backend |
| `REFRESH_SECRET_KEY` | `openssl rand -hex 32` | Key Vault → backend |
| `DATABASE_URL` | Azure Postgres create | Key Vault → backend |
| `BUNNY_API_KEY` | Bunny Stream library | Key Vault → backend |
| `BUNNY_TOKEN_AUTH_KEY` | Bunny token auth | Key Vault → backend |
| `BUNNY_LIBRARY_ID` | Bunny library | Env (non-secret OK) |
| `BUNNY_CDN_HOSTNAME` | Bunny CDN hostname | Env (non-secret OK) |
| `POSTGRES_PASSWORD` | You generate | Key Vault (+ Flexible Server) |

If anything in Azure CLI fails with “name already taken”, append a short unique suffix (`olynixxprod07`, etc.). ACR and Key Vault names are globally unique.
