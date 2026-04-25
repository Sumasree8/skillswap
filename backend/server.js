/**
 * server.js
 * Entry point — MUST import config/env FIRST to load .env before anything else.
 */
const env = require('./config/env');   // ← loads dotenv + validates JWT_SECRET/MONGO_URI

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const { Server } = require('socket.io');

const connectDB      = require('./config/db');
const { initSockets }= require('./sockets');
const errorHandler   = require('./middleware/errorHandler');

// ── Routes ──────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const swapRoutes    = require('./routes/swaps');
const creditRoutes  = require('./routes/credits');
const sessionRoutes = require('./routes/sessions');
const reviewRoutes  = require('./routes/reviews');
const circleRoutes  = require('./routes/circles');
const messageRoutes = require('./routes/messages');

// ── App setup ────────────────────────────────────────────────────────
const app        = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

connectDB();

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { req.io = io; next(); });

// ── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/swaps',    swapRoutes);
app.use('/api/credits',  creditRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/circles',  circleRoutes);
app.use('/api/messages', messageRoutes);

// ── Health ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ── 404 ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Centralised error handler (MUST be last) ──────────────────────────
app.use(errorHandler);

// ── Sockets ───────────────────────────────────────────────────────────
initSockets(io);

// ── Start ─────────────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`🚀 SkillSwap server → http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
});
