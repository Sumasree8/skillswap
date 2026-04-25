/**
 * utils/validate.js
 * Simple reusable validators.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => emailRegex.test(email);

const validatePassword = (pw) => typeof pw === 'string' && pw.length >= 6;

module.exports = { validateEmail, validatePassword };
