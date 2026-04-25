/**
 * controllers/authController.js
 * Handles register, login, getMe, logout.
 * Uses token util (not process.env.JWT_SECRET directly).
 */
const User              = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { generateToken } = require('../utils/token');
const { validateEmail, validatePassword } = require('../utils/validate');

/* ------------------------------------------------------------------ */
/*  POST /api/auth/register                                            */
/* ------------------------------------------------------------------ */
const register = async (req, res, next) => {
  try {
    const {
      name = '',
      email = '',
      password = '',
      bio = '',
      location = '',
      skillsOffered = [],
      skillsWanted  = [],
    } = req.body;

    // ── Validation ──────────────────────────────────────────────────
    if (!name.trim())               return res.status(400).json({ success: false, message: 'Name is required' });
    if (!validateEmail(email))      return res.status(400).json({ success: false, message: 'Valid email is required' });
    if (!validatePassword(password)) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    // ── Duplicate check ──────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists' });
    }

    // ── Create user ──────────────────────────────────────────────────
    const toSkill = (s) => (typeof s === 'string' ? { name: s } : s);
    const user = await User.create({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      password,                               // hashed by User pre-save hook
      bio:           bio.trim(),
      location:      location.trim(),
      skillsOffered: skillsOffered.map(toSkill),
      skillsWanted:  skillsWanted.map(toSkill),
      creditBalance: 100,
    });

    // ── Record welcome credit ────────────────────────────────────────
    await CreditTransaction.create({
      user:         user._id,
      type:         'bonus',
      amount:       100,
      balanceAfter: 100,
      description:  'Welcome bonus — 100 credits to get started',
    });

    const token = generateToken(user._id);
    return res.status(201).json({ success: true, token, user });

  } catch (err) {
    // Mongoose duplicate key (race condition safety)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists' });
    }
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/login                                               */
/* ------------------------------------------------------------------ */
const login = async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update online status
    await User.findByIdAndUpdate(user._id, { isOnline: true, lastSeen: new Date() });

    const token = generateToken(user._id);
    return res.json({ success: true, token, user });

  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/auth/me                                                   */
/* ------------------------------------------------------------------ */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/auth/logout                                              */
/* ------------------------------------------------------------------ */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout };
