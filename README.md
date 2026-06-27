<div align="center">

# 🔄 SkillSwap

### Peer-to-Peer Skill Economy Platform

**_Exchange skills, earn credits, grow together._**

A full-stack marketplace where people **trade what they know** instead of money —
request a swap, chat in real time, complete it, and earn credits you can spend on
micro-mentoring sessions and learning circles. A complete economy with its own currency,
trust system, and live messaging.

<br/>

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Tested_with_Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

---

## ⚡ The 30-Second Pitch

Most "learn a skill" apps are just course catalogs. **SkillSwap is an economy.**

Everyone is both a teacher and a learner. You teach what you know to **earn credits**,
then spend those credits to learn from someone else — in a **swap**, a **15-minute
micro-session**, or a **learning circle**. A matching engine pairs you by skill overlap,
a trust system keeps it honest, and **Socket.io** powers live chat and presence so the
whole thing feels alive.

> **Why it's interesting to build:** it's a closed-loop virtual currency with real
> earn/spend rules, a request→accept→complete state machine, real-time messaging, and
> a trust layer — the kind of system where the *business logic* is the hard part.

---

## 🧑‍💻 What This Project Demonstrates

> *For reviewers skimming: this is a production-shaped full-stack app, not a tutorial clone.*

| Area | What's in here |
|---|---|
| **Full-stack ownership** | React 18 SPA + Express REST API + MongoDB + Socket.io, end to end |
| **Clean architecture** | Layered backend: `routes → controllers → services → models`, with isolated `sockets/` and `services/` for business logic |
| **Real-time systems** | Socket.io chat, typing indicators, online presence, and live swap/session events |
| **Domain modeling** | A credit economy with explicit earn/spend rules and a swap lifecycle state machine |
| **Security in depth** | JWT (HS256), bcrypt (12 rounds), helmet, global + auth-scoped rate limiting, NoSQL-injection sanitization, CORS allowlist |
| **Config discipline** | Centralized `config/env.js` that validates env vars and **refuses to boot** on a missing/weak secret |
| **Testing** | Jest + Supertest against an **in-memory MongoDB** — fast, isolated, no external DB needed |
| **Ops-ready** | Dockerized (`docker compose up`), GitHub Actions CI, a realistic seed script, graceful shutdown |

---

## ✨ Features

| Module | What it does |
|--------|-------------|
| 🔄 **Swap Engine** | Request → Accept → Chat → Complete lifecycle |
| 💰 **Credit Engine** | Earn 30 ◈ per completed swap; spend to join sessions |
| ⚡ **Micro-Sessions** | 15-min mentor sessions, instant or scheduled |
| 🧠 **Matching Engine** | Skill-overlap scoring algorithm |
| ⭐ **Trust Engine** | Ratings, reviews, completion tracking |
| 🔒 **Skill Verification** | GitHub / portfolio link or quiz badge |
| 👥 **Learning Circles** | Group sessions, credits distributed to host |
| 💬 **Real-time Chat** | Socket.io chat per swap/session |

---

## 🚀 Quick Start (Local)

**Prerequisites:** Node.js 18+ · MongoDB locally **or** a MongoDB Atlas connection string

### Step 1 — Clone

```bash
git clone https://github.com/Sumasree8/skillswap.git
cd skillswap
```

### Step 2 — Backend setup ⚠️ (do this first)

```bash
cd backend
cp .env.example .env          # create your .env from the example
```

Open `backend/.env` and set:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=any_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> Generate a secure `JWT_SECRET`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

```bash
npm install
npm run dev
# ✅  Server → http://localhost:5000  [development]
# ✅  MongoDB connected
```

### Step 3 — Frontend setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
# ✅  App → http://localhost:5173
```

> No `.env` needed for the frontend in development — Vite's proxy forwards `/api` and `/socket.io` to port 5000.

### Step 4 — Seed demo data (recommended)

A fresh database is empty, so the app looks bare. Seed a realistic community
(~25 users, swaps, sessions, circles, reviews, credit histories, and chat) so it's
demoable to stakeholders:

```bash
cd backend
npm run seed
```

Every seeded account shares one password (`demo@1234`, override with `SEED_PASSWORD`).
Log in with `demo@gmail.com` / `demo@1234` (or any seeded account, e.g.
`ava@skillswap.app`, same password).

> 🐳 **Prefer Docker?** `cp .env.example .env`, set `JWT_SECRET`, then
> `docker compose up --build` runs Mongo + backend + frontend together.
> See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full guide.

### Run the tests

```bash
cd backend && npm test     # Jest + Supertest against an in-memory MongoDB
```

---

## 🏗️ Architecture

```
skillswap/
├── backend/
│   ├── config/
│   │   ├── env.js          ← loads & validates ALL env vars (imported first)
│   │   └── db.js           ← MongoDB connection
│   ├── controllers/        ← request handlers
│   ├── middleware/
│   │   ├── auth.js         ← JWT protect guard
│   │   └── errorHandler.js ← centralised error handler (registered last)
│   ├── models/             ← Mongoose schemas
│   ├── routes/             ← Express routers
│   ├── services/           ← business logic (credit, matching)
│   ├── sockets/            ← Socket.io event handlers
│   ├── utils/
│   │   ├── token.js        ← generateToken / verifyToken (single source of truth)
│   │   └── validate.js     ← email / password validators
│   ├── seed/               ← realistic demo-data seeder
│   ├── server.js           ← entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── chat/       ← ChatUI (real-time)
    │   │   ├── layout/     ← Navbar, AppLayout
    │   │   ├── swap/       ← UserCard
    │   │   └── ui/         ← Avatar, Badge, Modal, Toast…
    │   ├── context/        ← AuthContext (user state + register/login/logout)
    │   ├── hooks/          ← useChat, useSwaps
    │   ├── pages/          ← 10 page components
    │   ├── services/
    │   │   ├── api.js      ← Axios instance (auto-token, 401 handler)
    │   │   └── socket.js   ← Socket.io client manager
    │   └── utils/helpers.js
    ├── vite.config.js      ← proxies /api and /socket.io to :5000
    └── .env.example
```

**Stack** — React 18 · Vite · Tailwind CSS · React Router v6 · Socket.io-client · Axios · date-fns
on the frontend; Node.js · Express · Mongoose · Socket.io · JWT · bcryptjs · helmet on the backend;
MongoDB for storage; Jest · Supertest · mongodb-memory-server for tests.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password, ...}` | Register |
| POST | `/api/auth/login` | `{email, password}` | Login |
| GET | `/api/auth/me` | — | Current user |
| POST | `/api/auth/logout` | — | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/match` | Matched users (by skill overlap) |
| GET | `/api/users/search?q=&skill=` | Search users |
| GET | `/api/users/:id` | User profile |
| PUT | `/api/users/profile` | Update own profile |
| POST | `/api/users/verify-skill` | Verify a skill |

### Swaps
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/swaps/request` | Create swap request |
| GET | `/api/swaps/my` | My swaps |
| GET | `/api/swaps/:id` | Swap detail |
| PUT | `/api/swaps/:id/accept` | Accept |
| PUT | `/api/swaps/:id/reject` | Reject |
| PUT | `/api/swaps/:id/complete` | Complete (+30 ◈ each) |
| PUT | `/api/swaps/:id/cancel` | Cancel |

> Credits / Sessions / Reviews / Circles / Messages — see the full reference in `/docs`.

---

## 💰 Credit Economy

| Event | Credits |
|-------|---------|
| Sign up | +100 ◈ |
| Complete swap | +30 ◈ each user |
| Teach a session | +session cost |
| Join a session | −session cost |
| Join a circle | −circle cost per member |
| Host completes circle | +(cost × members) |

---

## 🔴 Real-time Events

```
Client → Server         Server → Client
─────────────────       ─────────────────────────
chat:join               chat:message
chat:leave              chat:typing
chat:message            swap:new_request
chat:typing             swap:accepted / rejected / completed
                        session:learner_joined / completed
                        user:online / offline
```

---

## 🛡️ Security

- JWT auth (HS256, configurable expiry)
- Bcrypt password hashing (12 rounds)
- **helmet** secure HTTP headers
- **Rate limiting** — global limiter + a stricter limiter on `/api/auth` (brute-force protection)
- **express-mongo-sanitize** — blocks NoSQL operator injection
- CORS locked to an allowlist (`CLIENT_URL`, comma-separated for multiple origins)
- Refuses to boot in production with a weak/placeholder `JWT_SECRET`
- Centralised `config/env.js` — server exits immediately if `JWT_SECRET` or `MONGO_URI` is missing
- Graceful shutdown on SIGTERM/SIGINT

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for Docker, CI, and managed-host deployment.

---

## 🚢 Production Deployment

**Backend** (Railway / Render / Fly.io)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillswap
JWT_SECRET=<long random secret>
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend** (Vercel / Netlify)

```env
VITE_API_URL=https://your-backend.railway.app
```

```bash
cd frontend && npm run build   # outputs dist/
```

---

## 🩺 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `secretOrPrivateKey must have a value` | `.env` missing or not loaded | See Step 2 — copy `.env.example` → `.env` |
| `500 on /api/auth/register` | `JWT_SECRET` undefined | Add `JWT_SECRET=...` to `backend/.env` |
| `409 Conflict` on register | Email already in DB | Use a different email, or drop the collection |
| Frontend can't reach API | Wrong baseURL | Vite proxy handles `/api` → port 5000 automatically |

---

<div align="center">

**An economy, not a catalog.** ◈

</div>
