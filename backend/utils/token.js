/**
 * utils/token.js
 * Single source of truth for JWT generation & verification.
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const generateToken = (userId) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id: userId.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
