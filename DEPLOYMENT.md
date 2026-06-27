# Deployment Guide

SkillSwap is a MERN app: an Express/MongoDB API (`backend/`) and a React/Vite
SPA (`frontend/`). This guide covers seeding demo data, running the whole stack
with Docker, and deploying to a managed host.

---

## 1. Demo data (for stakeholder demos)

The app has no users on a fresh database. Seed a realistic community —
~25 users, skill swaps, live sessions, learning circles, reviews, credit
histories, and chat messages — so the product looks alive.

```bash
cd backend
npm install
cp .env.example .env          # set MONGO_URI + JWT_SECRET
npm run seed
```

Every seeded account shares one password (default `demo@1234`, override with
`SEED_PASSWORD`). Log in as anyone, e.g.:

| Email                  | Password    |
|------------------------|-------------|
| `demo@gmail.com`       | `demo@1234` |
| `ava@skillswap.app`    | `demo@1234` |
| `nina@skillswap.app`   | `demo@1234` |

The seed is **reproducible** (fixed random seed) and **idempotent** — it wipes
and rebuilds the collections each run. It refuses to run when
`NODE_ENV=production` unless you pass `-- --force`.

---

## 2. Run the full stack with Docker (recommended)

Requires Docker + Docker Compose.

```bash
cp .env.example .env
# set JWT_SECRET in .env:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

docker compose up --build
# optional — load demo data into the running stack:
docker compose exec backend npm run seed
```

- Frontend → http://localhost:8080
- The frontend container (nginx) proxies `/api` and `/socket.io` to the backend,
  so everything is same-origin in the browser.
- MongoDB data persists in the `mongo_data` volume.

---

## 3. Local development (without Docker)

```bash
# Terminal 1 — backend
cd backend && npm install && cp .env.example .env   # fill in values
npm run dev

# Terminal 2 — frontend
cd frontend && npm install
npm run dev          # http://localhost:5173 (proxies /api → :5000)
```

---

## 4. Deploying to a managed host

The two services deploy independently.

### Backend (Render / Railway / Fly.io / any Node host)
- Build/start: `npm ci` then `npm start`.
- Set environment variables:
  - `NODE_ENV=production`
  - `MONGO_URI` — a **MongoDB Atlas** connection string
  - `JWT_SECRET` — long random string (the server refuses to boot in
    production with a weak/placeholder secret)
  - `CLIENT_URL` — your frontend's public origin(s), comma-separated
- The app trusts one proxy hop (`trust proxy`), so rate limiting and client IPs
  work correctly behind the platform's load balancer.
- Health check path: `/health`.

### Frontend (Vercel / Netlify / Render Static / nginx)
- Build: `npm ci && npm run build` → static output in `frontend/dist`.
- Set `VITE_API_URL` to your backend origin (e.g. `https://api.skillswap.app`)
  **at build time**. Leave blank only if the frontend and API share an origin
  via a reverse proxy.

---

## 5. Tests & CI

```bash
cd backend && npm test          # Jest + Supertest, in-memory MongoDB
```

GitHub Actions (`.github/workflows/ci.yml`) runs the backend test suite and a
frontend production build on every push and pull request.

---

## 6. Production hardening already in place

- **helmet** — secure HTTP headers
- **express-rate-limit** — global limiter + stricter limiter on `/api/auth`
- **express-mongo-sanitize** — blocks NoSQL operator injection
- **CORS allowlist** — only configured origins are accepted
- **Strong-secret enforcement** — refuses to start in production with a weak JWT secret
- **bcrypt** password hashing (already present) and JSON responses that never include the password
- **Graceful shutdown** on SIGTERM/SIGINT
- **Non-root** Docker runtime user + container health checks

### Recommended next steps
- Move the JWT from `localStorage` to an httpOnly cookie to reduce XSS risk
  (requires updating the socket auth handshake and the axios interceptor).
- Add structured logging/monitoring (e.g. pino + a log drain) and error tracking
  (e.g. Sentry).
- Add a refresh-token flow if you want sessions longer-lived than the access token.
