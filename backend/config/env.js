/**
 * config/env.js
 * Loads and validates all environment variables in ONE place.
 * Import this FIRST in server.js before any other module.
 */
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const required = ['JWT_SECRET', 'MONGO_URI'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`);
    console.error('    Copy backend/.env.example → backend/.env and fill in values.');
    process.exit(1);
  }
}

// ── Production-only safety checks ────────────────────────────────────
// A weak or placeholder JWT secret in production is a critical vulnerability,
// so fail fast rather than boot with an insecure configuration.
if (isProd) {
  const secret = process.env.JWT_SECRET;
  if (secret.length < 32 || secret.includes('CHANGE_ME')) {
    console.error('❌  JWT_SECRET is too weak for production (need a random string ≥ 32 chars).');
    console.error('    Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  }
}

// CLIENT_URL may be a comma-separated list of allowed origins (for CORS).
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  PORT:           process.env.PORT          || '5000',
  MONGO_URI:      process.env.MONGO_URI,
  JWT_SECRET:     process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL,
  ALLOWED_ORIGINS,
  NODE_ENV,
  isProd,

  // Demo aid: simulate the other person liking you back so matches form during
  // a live demo (the seeded users can't swipe in real time). Real mutual
  // matching applies whenever this is off. Defaults on outside production.
  DEMO_AUTO_MATCH: process.env.DEMO_AUTO_MATCH
    ? process.env.DEMO_AUTO_MATCH === 'true'
    : !isProd,
};
