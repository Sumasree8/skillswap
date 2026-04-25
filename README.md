# SkillSwap — Peer-to-Peer Skill Economy Platform

> Exchange skills, earn credits, grow together.

---

## 🚨 Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `secretOrPrivateKey must have a value` | `.env` file missing or not loaded | See Step 2 below — copy `.env.example` → `.env` |
| `500 on /api/auth/register` | JWT_SECRET undefined | Add `JWT_SECRET=...` to `backend/.env` |
| `409 Conflict` on register | Email already in DB | Use a different email, or drop the collection |
| Frontend can't reach API | Wrong baseURL | Vite proxy handles `/api` → port 5000 automatically |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

---

### Step 1 — Clone

```bash
git clone <repo-url>
cd skillswap
```

---

### Step 2 — Backend setup ⚠️ (do this first)

```bash
cd backend

# Create your .env file from the example
cp .env.example .env
```

Now open `backend/.env` and set:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=any_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> Generate a secure JWT_SECRET:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

```bash
npm install
npm run dev
# ✅  Server → http://localhost:5000  [development]
# ✅  MongoDB connected
```

---

### Step 3 — Frontend setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
# ✅  App → http://localhost:5173
```

> No `.env` needed for frontend in development — Vite's proxy forwards `/api` to port 5000.

---

## ✨ Features

| Module | What it does |
|--------|-------------|
| 🔄 Swap Engine | Request → Accept → Chat → Complete lifecycle |
| 💰 Credit Engine | Earn 30 ◈ per completed swap; spend to join sessions |
| ⚡ Micro-Sessions | 15-min mentor sessions, instant or scheduled |
| 🧠 Matching Engine | Skill-overlap scoring algorithm |
| ⭐ Trust Engine | Ratings, reviews, completion tracking |
| 🔒 Skill Verification | GitHub / portfolio link or quiz badge |
| 👥 Learning Circles | Group sessions, credits distributed to host |
| 💬 Real-time Chat | Socket.io chat per swap/session |

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

### Credits / Sessions / Reviews / Circles / Messages — see full README in `/docs`

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
- Centralised `config/env.js` — server exits immediately if `JWT_SECRET` or `MONGO_URI` missing
- Auth middleware uses `utils/token.js` — never reads `process.env` directly in controllers
- CORS locked to `CLIENT_URL`

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
