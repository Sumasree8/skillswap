const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

/**
 * GET /api/messages/:room
 */
router.get('/:room', protect, async (req, res) => {
  try {
    // Match rooms encode both participant ids (match_<idA>_<idB>); only let the
    // two people in that match read it.
    if (req.params.room.startsWith('match_')) {
      const ids = req.params.room.replace('match_', '').split('_');
      if (!ids.includes(req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
