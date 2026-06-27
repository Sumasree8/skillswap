/**
 * middleware/security.js
 * Production-grade hardening, applied in one place.
 *
 *  - helmet ............ secure HTTP response headers
 *  - mongo-sanitize .... strips `$`/`.` operators to block NoSQL injection
 *  - rate limiting ..... a general limiter + a stricter limiter for auth
 *  - morgan ............ request logging (concise in prod, verbose in dev)
 *
 * Usage in server.js:
 *   const { applySecurity, authLimiter } = require('./middleware/security');
 *   applySecurity(app);                 // before routes
 *   app.use('/api/auth', authLimiter, authRoutes);
 */
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { isProd } = require('../config/env');

/* General API limiter — generous enough for real use, blocks abuse/scraping. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 300,                   // per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please slow down.' },
});

/* Stricter limiter for auth endpoints to blunt credential-stuffing/brute force. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,   // only count failed attempts
  message: { success: false, message: 'Too many auth attempts — try again later.' },
});

function applySecurity(app) {
  // Behind a reverse proxy / load balancer (Render, Railway, Nginx), trust it
  // so rate limiting and req.ip use the real client address.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(mongoSanitize());
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use('/api', apiLimiter);
}

module.exports = { applySecurity, apiLimiter, authLimiter };
