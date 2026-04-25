const Session = require('../models/Session');
const User = require('../models/User');
const { spendCredits, earnCredits } = require('../services/creditService');

/**
 * POST /api/sessions/create
 */
const createSession = async (req, res) => {
  try {
    const { skill, type = 'instant', scheduledAt, description, creditCost = 20 } = req.body;
    if (!skill) return res.status(400).json({ success: false, message: 'Skill is required' });

    const session = await Session.create({
      mentor: req.user._id,
      skill,
      type,
      scheduledAt: scheduledAt || null,
      description,
      creditCost,
    });

    await session.populate('mentor', 'name avatar rating ratingCount skillsOffered');
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/sessions/join
 */
const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId).populate('mentor');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status !== 'open') return res.status(400).json({ success: false, message: 'Session not available' });
    if (session.mentor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot join your own session' });
    }

    // Deduct credits from learner
    await spendCredits(req.user._id, session.creditCost, `Joined session: ${session.skill}`, session._id, 'Session');

    session.learner = req.user._id;
    session.status = 'active';
    session.startedAt = new Date();
    await session.save();
    await session.populate(['mentor', 'learner']);

    req.io.to(`user_${session.mentor._id}`).emit('session:learner_joined', { session });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/sessions/:id/complete
 */
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate(['mentor', 'learner']);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.mentor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only mentor can complete session' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Earn credits for mentor
    await earnCredits(session.mentor._id, session.creditCost, `Session completed: ${session.skill}`, session._id, 'Session');

    await User.findByIdAndUpdate(session.mentor._id, { $inc: { sessionsCompleted: 1 } });
    if (session.learner) {
      await User.findByIdAndUpdate(session.learner._id, { $inc: { sessionsCompleted: 1 } });
    }

    req.io.to(session.chatRoom).emit('session:completed', { session });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/sessions/open
 */
const getOpenSessions = async (req, res) => {
  try {
    const { skill } = req.query;
    const query = { status: 'open', mentor: { $ne: req.user._id } };
    if (skill) query.skill = { $regex: skill, $options: 'i' };
    const sessions = await Session.find(query)
      .populate('mentor', 'name avatar rating ratingCount')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/sessions/my
 */
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentor: req.user._id }, { learner: req.user._id }],
    })
      .populate('mentor', 'name avatar rating ratingCount')
      .populate('learner', 'name avatar rating ratingCount')
      .sort({ updatedAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name avatar bio rating ratingCount skillsOffered')
      .populate('learner', 'name avatar rating ratingCount');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createSession, joinSession, completeSession, getOpenSessions, getMySessions, getSessionById };
