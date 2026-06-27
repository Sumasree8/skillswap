/**
 * tests/env.js
 * Runs before any module is imported (jest `setupFiles`), so config/env's
 * required-variable checks pass. The real DB URI is provided by the
 * in-memory server in tests/setup.js; this MONGO_URI is just a placeholder
 * to satisfy the import-time validation.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_at_least_32_chars_long_xxxxxxxx';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/skillswap_test_placeholder';
process.env.CLIENT_URL = 'http://localhost:5173';
// Test real mutual-match logic, not the demo's simulated like-back.
process.env.DEMO_AUTO_MATCH = 'false';
