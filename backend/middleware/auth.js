/**
 * middleware/auth.js
 * JWT authentication guard for protected routes.
 */
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);          // throws if invalid/expired

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token has expired' :
      err.name === 'JsonWebTokenError' ? 'Invalid token' :
      'Authentication failed';
    return res.status(401).json({ success: false, message });
  }
};

module.exports = { protect };
