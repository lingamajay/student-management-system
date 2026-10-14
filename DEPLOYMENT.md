# 🚀 Deployment Guide

> **Frontend → Vercel** | **Backend → Render** | **Database → Render PostgreSQL**

---

## Architecture Overview

```
┌─────────────────────┐       HTTPS/Proxy        ┌──────────────────────────┐
│   Vercel (Frontend)  │ ──────────────────────▶ │   Render (Backend)        │
│   Static HTML/CSS/JS │   /api/* rewrites        │   Spring Boot + Docker    │
│   CDN + Edge Network │                          │   Port 8080               │
└─────────────────────┘                           └────────────┬─────────────┘
                                                               │ JDBC
                                                               ▼
                                                  ┌──────────────────────────┐
                                                  │  Render PostgreSQL       │
                                                  │  (Managed Free Tier)     │
                                                  └──────────────────────────┘
```

---

## Files Created / Modified for Deployment

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel config — serves frontend, proxies `/api/*` to Render |
| `render.yaml` | Render blueprint — defines backend service + PostgreSQL DB |
| `backend/Dockerfile` | Multi-stage Docker build for Spring Boot |
| `backend/.dockerignore` | Excludes unnecessary files from Docker context |
| `backend/src/main/resources/application-prod.properties` | Production Spring profile (PostgreSQL, no H2) |
| `.env.example` | Template for all environment variables |
| `.github/workflows/deploy.yml` | CI/CD: builds backend, deploys frontend to Vercel |
| `frontend/js/config.js` | Updated to auto-detect production vs local |
| `backend/.../CorsConfig.java` | CORS origins from env variable |
| `backend/.../SecurityConfig.java` | Actuator health endpoint access |
| `backend/pom.xml` | Added PostgreSQL driver + Spring Actuator |
| `backend/src/main/resources/application.properties` | Added Actuator + CORS defaults |

---

## Step-by-Step Deployment

### 1️⃣ Push Code to GitHub

```bash
git add -A
git commit -m "feat: add deployment configuration for Vercel + Render"
git push origin main
```

---

### 2️⃣ Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **"New +"** → **"Blueprint"**.
3. Connect your GitHub repository.
4. Render will auto-detect `render.yaml` and create:
   - A **Web Service** (`learnpredict-backend`) using Docker
   - A **PostgreSQL Database** (`learnpredict-db`)
5. **Important**: Before deploying, update `render.yaml`:
   - Replace `<YOUR_USERNAME>` in the `repo` field with your GitHub username.
   - Update `CORS_ALLOWED_ORIGINS` after you know your Vercel URL.

> [!TIP]
> **Alternative (Manual Setup)**:
> - Click **"New +"** → **"Web Service"** → connect your repo
> - Set **Root Directory**: `backend`
> - Set **Runtime**: Docker
> - Add environment variables manually from `.env.example`
> - Then create a **PostgreSQL** database separately and link it

6. After deployment, note your backend URL (e.g., `https://learnpredict-backend.onrender.com`).

---

### 3️⃣ Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (project root)
   - **Output Directory**: `frontend`
5. Click **Deploy**.

6. **After deploying**, update the API proxy URL:
   - Open `vercel.json`
   - Replace `https://learnpredict-backend.onrender.com` with your actual Render backend URL
   - Commit and push — Vercel will auto-redeploy.

7. **Then update Render CORS**:
   - Go to your Render backend service → **Environment**
   - Set `CORS_ALLOWED_ORIGINS` to your Vercel URL (e.g., `https://your-project.vercel.app`)

---

### 4️⃣ Set GitHub Secrets (for CI/CD)

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Get from [Vercel Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after `vercel link` |

---

## Environment Variables Reference

### Render (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | ✅ | Set to `prod` |
| `PORT` | ✅ | Set to `8080` |
| `DATABASE_URL` | ✅ | Auto-filled if using Render Blueprint |
| `DATABASE_USERNAME` | ✅ | Auto-filled if using Render Blueprint |
| `DATABASE_PASSWORD` | ✅ | Auto-filled if using Render Blueprint |
| `CORS_ALLOWED_ORIGINS` | ✅ | Your Vercel frontend URL |
| `JAVA_TOOL_OPTIONS` | Optional | JVM flags (default: `-XX:MaxRAMPercentage=75.0`) |

---

## Verifying the Deployment

1. **Backend Health Check**:
   ```
   https://learnpredict-backend.onrender.com/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Frontend**: Open your Vercel URL — it should load the landing page and be able to log in.

3. **API Connectivity**: Log in with a demo account. If the dashboard loads data, the proxy is working.

---

## Local Development (Unchanged)

Your local dev workflow remains exactly the same:

```bash
# Backend (Spring Boot + H2)
cd backend
mvn spring-boot:run

# Frontend (separate dev server, optional)
cd frontend
node server.js
```

- Backend runs at `http://localhost:8080` with H2 database
- Frontend auto-detects localhost and hits `http://localhost:8080/api`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend shows "Network Error" | Check `vercel.json` rewrite URL matches your Render backend URL |
| Render deploy fails | Check Docker build logs in Render dashboard |
| Database connection error | Verify `DATABASE_URL` format: `jdbc:postgresql://host:port/db` |
| CORS errors in browser | Ensure `CORS_ALLOWED_ORIGINS` on Render includes your Vercel domain |
| Render free tier sleeps | First request after sleep takes ~30-60s (cold start) |

> [!NOTE]
> Render's free tier spins down after 15 minutes of inactivity. The first request after sleep will take 30-60 seconds. Consider upgrading to a paid plan for always-on availability.
