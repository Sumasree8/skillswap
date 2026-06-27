/**
 * tests/helpers.js
 * Small utilities shared across test suites.
 */
const request = require('supertest');
const { createApp } = require('../app');

const app = createApp();   // no live Socket.IO — controllers get the no-op stub

let counter = 0;

/** Register a user and return { token, user, agent-friendly headers }. */
async function registerUser(overrides = {}) {
  counter += 1;
  const payload = {
    name: `Test User ${counter}`,
    email: `user${counter}_${Date.now()}@test.dev`,
    password: 'password123',
    skillsOffered: [],
    skillsWanted: [],
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  if (res.status !== 201) {
    throw new Error(`registerUser failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, user: res.body.user };
}

/** Authorization header for a token. */
const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { app, request, registerUser, auth };
