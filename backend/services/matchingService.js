const User = require('../models/User');

/**
 * Calculate match score between two users
 * Score based on mutual skill overlap
 */
const calculateMatchScore = (userA, userB) => {
  const offeredA = userA.skillsOffered.map((s) => s.name.toLowerCase());
  const wantedA = userA.skillsWanted.map((s) => s.name.toLowerCase());
  const offeredB = userB.skillsOffered.map((s) => s.name.toLowerCase());
  const wantedB = userB.skillsWanted.map((s) => s.name.toLowerCase());

  // A offers what B wants
  const aOffersWhatBWants = offeredA.filter((s) => wantedB.includes(s)).length;
  // B offers what A wants
  const bOffersWhatAWants = offeredB.filter((s) => wantedA.includes(s)).length;

  const maxPossible = Math.max(wantedA.length, wantedB.length, 1);
  const rawScore = ((aOffersWhatBWants + bOffersWhatAWants) / (maxPossible * 2)) * 100;

  // Bonus for verified skills
  const verifiedBonus = userB.skillsOffered.filter(
    (s) => s.verified && wantedA.includes(s.name.toLowerCase())
  ).length * 5;

  return Math.min(100, Math.round(rawScore + verifiedBonus));
};

/**
 * Find matches for a given user
 */
const findMatches = async (userId, limit = 20) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) throw new Error('User not found');

  const wantedSkills = currentUser.skillsWanted.map((s) => s.name.toLowerCase());
  const offeredSkills = currentUser.skillsOffered.map((s) => s.name.toLowerCase());

  if (wantedSkills.length === 0 && offeredSkills.length === 0) {
    // Return random users if no skills set
    const users = await User.find({ _id: { $ne: userId } }).limit(limit);
    return users.map((u) => ({ user: u, matchScore: 0, matchedSkills: [] }));
  }

  // Find users who offer what we want OR want what we offer
  const candidates = await User.find({
    _id: { $ne: userId },
    $or: [
      { 'skillsOffered.name': { $in: currentUser.skillsWanted.map((s) => s.name) } },
      { 'skillsWanted.name': { $in: currentUser.skillsOffered.map((s) => s.name) } },
    ],
  }).limit(100);

  const scored = candidates
    .map((candidate) => {
      const score = calculateMatchScore(currentUser, candidate);
      const matchedSkills = candidate.skillsOffered
        .filter((s) => wantedSkills.includes(s.name.toLowerCase()))
        .map((s) => s.name);
      return { user: candidate, matchScore: score, matchedSkills };
    })
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

module.exports = { findMatches, calculateMatchScore };
