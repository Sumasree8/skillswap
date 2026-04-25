const LearningCircle = require('../models/LearningCircle');
const { spendCredits, earnCredits } = require('../services/creditService');

/**
 * POST /api/circles/create
 */
const createCircle = async (req, res) => {
  try {
    const { title, description, skill, maxMembers = 10, creditCostPerMember = 10, scheduledAt, tags = [] } = req.body;
    if (!title || !skill || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'title, skill, scheduledAt required' });
    }
    const circle = await LearningCircle.create({
      host: req.user._id,
      title, description, skill, maxMembers, creditCostPerMember,
      scheduledAt, tags,
      members: [],
    });
    await circle.populate('host', 'name avatar rating ratingCount');
    res.status(201).json({ success: true, circle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/circles/:id/join
 */
const joinCircle = async (req, res) => {
  try {
    const circle = await LearningCircle.findById(req.params.id);
    if (!circle) return res.status(404).json({ success: false, message: 'Circle not found' });
    if (circle.status !== 'open') return res.status(400).json({ success: false, message: 'Circle is not open' });
    if (circle.members.length >= circle.maxMembers) {
      return res.status(400).json({ success: false, message: 'Circle is full' });
    }
    if (circle.members.includes(req.user._id)) {
      return res.status(409).json({ success: false, message: 'Already joined' });
    }
    if (circle.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Host cannot join their own circle' });
    }

    await spendCredits(req.user._id, circle.creditCostPerMember, `Joined circle: ${circle.title}`, circle._id, 'LearningCircle');

    circle.members.push(req.user._id);
    await circle.save();
    await circle.populate(['host', 'members']);

    req.io.to(`user_${circle.host}`).emit('circle:member_joined', { circle, userId: req.user._id });

    res.json({ success: true, circle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/circles/:id/complete
 */
const completeCircle = async (req, res) => {
  try {
    const circle = await LearningCircle.findById(req.params.id);
    if (!circle) return res.status(404).json({ success: false, message: 'Circle not found' });
    if (circle.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can complete the circle' });
    }

    circle.status = 'completed';
    circle.completedAt = new Date();
    await circle.save();

    // Host earns credits from all members
    const totalEarned = circle.members.length * circle.creditCostPerMember;
    await earnCredits(circle.host, totalEarned, `Circle completed: ${circle.title}`, circle._id, 'LearningCircle');

    res.json({ success: true, circle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/circles
 */
const getCircles = async (req, res) => {
  try {
    const { skill, status = 'open' } = req.query;
    const query = { status };
    if (skill) query.skill = { $regex: skill, $options: 'i' };
    const circles = await LearningCircle.find(query)
      .populate('host', 'name avatar rating ratingCount')
      .sort({ scheduledAt: 1 })
      .limit(30);
    res.json({ success: true, circles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/circles/my
 */
const getMyCircles = async (req, res) => {
  try {
    const circles = await LearningCircle.find({
      $or: [{ host: req.user._id }, { members: req.user._id }],
    })
      .populate('host', 'name avatar rating ratingCount')
      .sort({ updatedAt: -1 });
    res.json({ success: true, circles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createCircle, joinCircle, completeCircle, getCircles, getMyCircles };
