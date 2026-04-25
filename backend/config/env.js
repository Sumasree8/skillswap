/**
 * config/env.js
 * Loads and validates all environment variables in ONE place.
 * Import this FIRST in server.js before any other module.
 */
require('dotenv').config();

const required = ['JWT_SECRET', 'MONGO_URI'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`);
    console.error('    Copy backend/.env.example → backend/.env and fill in values.');
    process.exit(1);
  }
}

module.exports = {
  PORT:           process.env.PORT          || '5000',
  MONGO_URI:      process.env.MONGO_URI,
  JWT_SECRET:     process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL:     process.env.CLIENT_URL     || 'http://localhost:5173',
  NODE_ENV:       process.env.NODE_ENV       || 'development',
};
