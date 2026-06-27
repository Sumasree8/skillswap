/**
 * app.js
 * Builds and configures the Express application.
 *
 * Kept separate from server.js so tests can import a fully-wired app without
 * opening a network port, connecting to a real DB, or starting Socket.IO.
 *
 * `createApp(io)` accepts an optional Socket.IO server. When omitted (e.g. in
 * tests), a no-op stub is injected so controllers can safely call req.io.
 */
const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { applySecurity, authLimiter } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const swipeRoutes   = require('./routes/swipes');
const swapRoutes    = require('./routes/swaps');
const creditRoutes  = require('./routes/credits');
const sessionRoutes = require('./routes/sessions');
const reviewRoutes  = require('./routes/reviews');
const circleRoutes  = require('./routes/circles');
const messageRoutes = require('./routes/messages');

// Safe stand-in so `req.io.to(...).emit(...)` never throws when there's no
// live Socket.IO server (tests, scripts).
const noopIo = { to: () => ({ emit: () => {} }) };

function createApp(io = noopIo) {
  const app = express();

  // ── CORS — only allow configured origins ──────────────────────────
  app.use(cors({
    origin(origin, cb) {
      // Allow same-origin / non-browser clients (curl, mobile, health checks).
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }));

  // ── Security hardening (helmet, sanitize, rate limit, logging) ─────
  applySecurity(app);

  // ── Body parsing ───────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Make io available to controllers ───────────────────────────────
  app.use((req, _res, next) => { req.io = io; next(); });

  // ── Health check ───────────────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

  // ── API routes ─────────────────────────────────────────────────────
  app.use('/api/auth',     authLimiter, authRoutes);
  app.use('/api/users',    userRoutes);
  app.use('/api/swipes',   swipeRoutes);
  app.use('/api/swaps',    swapRoutes);
  app.use('/api/credits',  creditRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/reviews',  reviewRoutes);
  app.use('/api/circles',  circleRoutes);
  app.use('/api/messages', messageRoutes);

  // ── 404 ────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

  // ── Centralised error handler (MUST be last) ───────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
