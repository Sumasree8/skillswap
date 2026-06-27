/**
 * server.js
 * Entry point — MUST import config/env FIRST to load .env before anything else.
 * App configuration lives in app.js; this file owns the network + DB lifecycle.
 */
const env = require('./config/env');   // ← loads dotenv + validates JWT_SECRET/MONGO_URI

const http       = require('http');
const { Server } = require('socket.io');

const connectDB       = require('./config/db');
const { initSockets } = require('./sockets');
const { createApp }   = require('./app');

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: { origin: env.ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true },
});

// Wire the configured Express app (with the live io) onto the HTTP server.
httpServer.on('request', createApp(io));

initSockets(io);

// Connect to MongoDB, then start listening.
connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`🚀 SkillSwap server → http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
  });
});

// ── Graceful shutdown ──────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  httpServer.close(() => process.exit(0));
  // Force-exit if connections linger.
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = httpServer;
