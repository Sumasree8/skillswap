module.exports = {
  testEnvironment: 'node',
  // Set required env vars before any module (config/env) is imported.
  setupFiles: ['<rootDir>/tests/env.js'],
  // Spin up the in-memory MongoDB and manage its lifecycle around tests.
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  clearMocks: true,
};
