const User = require('../models/User');
const { getCreditHistory } = require('../services/creditService');

/**
 * GET /api/credits/balance
 */
const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('creditBalance');
    res.json({ success: true, balance: user.creditBalance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/credits/history
 */
const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getCreditHistory(req.user._id, Number(page), Number(limit));
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBalance, getHistory };
