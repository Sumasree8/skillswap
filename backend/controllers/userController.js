const User = require('../models/User');
const { findMatches } = require('../services/matchingService');

/**
 * GET /api/users/match
 */
const getMatches = async (req, res) => {
  try {
    const matches = await findMatches(req.user._id, 30);
    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, avatar, skillsOffered, skillsWanted } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (avatar !== undefined) updates.avatar = avatar;
    if (skillsOffered) updates.skillsOffered = skillsOffered.map((s) => (typeof s === 'string' ? { name: s } : s));
    if (skillsWanted) updates.skillsWanted = skillsWanted.map((s) => (typeof s === 'string' ? { name: s } : s));

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/users/verify-skill
 */
const verifySkill = async (req, res) => {
  try {
    const { skillName, method, portfolioLink } = req.body;
    const user = await User.findById(req.user._id);

    const skill = user.skillsOffered.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found in offered skills' });

    // Simple verification: accept portfolio/github link
    if (method === 'portfolio' || method === 'github') {
      if (!portfolioLink) return res.status(400).json({ success: false, message: 'Portfolio link required' });
      skill.verified = true;
      skill.verificationMethod = method;
      skill.portfolioLink = portfolioLink;
    } else if (method === 'quiz') {
      // In production: check quiz results here
      skill.verified = true;
      skill.verificationMethod = 'quiz';
    }

    await user.save();
    res.json({ success: true, user, message: `Skill "${skillName}" verified!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/users — search users
 */
const searchUsers = async (req, res) => {
  try {
    const { q, skill } = req.query;
    const query = { _id: { $ne: req.user._id } };
    if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { bio: { $regex: q, $options: 'i' } }];
    if (skill) query['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    const users = await User.find(query).limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMatches, getUserById, updateProfile, verifySkill, searchUsers };
