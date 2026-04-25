// routes/credits.js
const express = require('express');
const creditRouter = express.Router();
const { getBalance, getHistory } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');
creditRouter.get('/balance', protect, getBalance);
creditRouter.get('/history', protect, getHistory);
module.exports = creditRouter;
