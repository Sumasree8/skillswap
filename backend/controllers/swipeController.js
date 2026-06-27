const Swipe = require('../models/Swipe');
const User = require('../models/User');
const env = require('../config/env');
const { findMatches, calculateMatchScore } = require('../services/matchingService');

const FEED_SIZE = 40;

/** Deterministic 1:1 chat room id for a pair of users. */
const matchRoom = (a, b) => `match_${[a.toString(), b.toString()].sort().join('_')}`;

/**
 * GET /api/swipes/feed
 * Profiles the current user hasn't swiped yet — skill matches first,
 * then other people to keep the deck from running dry.
 */
const getFeed = async (req, res) => {
  try {
    const meId = req.user._id;

    // Everyone I've already swiped on (like or pass) — never show them again.
    const swiped = await Swipe.find({ swiper: meId }).distinct('target');
    const exclude = new Set([meId.toString(), ...swiped.map((id) => id.toString())]);

    // Demo accounts only see the demo pool; real users only see real users.
    const realm = req.user.isDemo;

    // 1. Skill-based matches, best first (same pool only).
    const matches = (await findMatches(meId, FEED_SIZE))
      .filter((m) => !exclude.has(m.user._id.toString()) && m.user.isDemo === realm);

    matches.forEach((m) => exclude.add(m.user._id.toString()));

    // 2. Top up with other unseen people (score 0) so there's always more to swipe.
    const feed = [...matches];
    if (feed.length < FEED_SIZE) {
      const fillers = await User.find({ _id: { $nin: [...exclude] }, isDemo: realm })
        .limit(FEED_SIZE - feed.length);
      feed.push(...fillers.map((user) => ({ user, matchScore: 0, matchedSkills: [] })));
    }

    res.json({ success: true, feed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/swipes  { targetId, action: 'like' | 'pass' }
 * Records a decision. A like that the target already returned is a match.
 */
const swipe = async (req, res) => {
  try {
    const meId = req.user._id;
    const { targetId, action } = req.body;

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be 'like' or 'pass'" });
    }
    if (!targetId || targetId === meId.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid target' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Upsert so re-swiping just updates the decision.
    await Swipe.findOneAndUpdate(
      { swiper: meId, target: targetId },
      { action },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // A match only happens on a mutual like.
    let match = false;
    if (action === 'like') {
      let reciprocal = await Swipe.findOne({ swiper: targetId, target: meId, action: 'like' });

      // Demo mode: seeded users can't swipe live, so simulate a like-back
      // (more likely the better the skill match) to make matches happen.
      // Only for demo accounts — real users get genuine mutual matching.
      if (!reciprocal && env.DEMO_AUTO_MATCH && req.user.isDemo) {
        const score = calculateMatchScore(req.user, target);
        // Only people you actually overlap with might like you back, and even
        // then it's far from guaranteed — a believable ~15–55% rate, not 90%.
        const chance = score > 0 ? Math.min(0.55, 0.15 + score / 250) : 0;
        if (chance > 0 && Math.random() < chance) {
          reciprocal = await Swipe.findOneAndUpdate(
            { swiper: targetId, target: meId },
            { action: 'like' },
            { upsert: true, new: true, setDefaultsOnInsert: true },
          );
        }
      }

      if (reciprocal) {
        match = true;
        // Notify the other person in real time.
        req.io.to(`user_${targetId}`).emit('swipe:match', {
          user: req.user,
          chatRoom: matchRoom(meId, targetId),
        });
      }
    }

    res.json({
      success: true,
      match,
      ...(match ? { user: target, chatRoom: matchRoom(meId, targetId) } : {}),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/swipes/matches
 * Users I liked who also liked me back.
 */
const getMatches = async (req, res) => {
  try {
    const meId = req.user._id;

    const iLiked = await Swipe.find({ swiper: meId, action: 'like' }).distinct('target');
    const mutual = await Swipe.find({
      swiper: { $in: iLiked },
      target: meId,
      action: 'like',
    }).distinct('swiper');

    const users = await User.find({ _id: { $in: mutual } });
    const matches = users.map((user) => ({ user, chatRoom: matchRoom(meId, user._id) }));

    res.json({ success: true, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/swipes/reset
 * Clears the user's swipe history so the deck fills up again — except swipes
 * toward people they've matched with, so existing matches are preserved.
 */
const resetFeed = async (req, res) => {
  try {
    const meId = req.user._id;

    const iLiked = await Swipe.find({ swiper: meId, action: 'like' }).distinct('target');
    const matched = await Swipe.find({
      swiper: { $in: iLiked },
      target: meId,
      action: 'like',
    }).distinct('swiper');

    const result = await Swipe.deleteMany({ swiper: meId, target: { $nin: matched } });
    res.json({ success: true, cleared: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFeed, swipe, getMatches, resetFeed };
