/**
 * middleware/errorHandler.js
 * Centralised error handler — must be registered LAST in server.js.
 */
const { NODE_ENV } = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (NODE_ENV !== 'production') {
    console.error(`[${status}] ${message}`);
    if (status === 500) console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && status === 500 ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
