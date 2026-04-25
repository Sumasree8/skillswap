const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

/**
 * Add credits to a user (earn)
 */
const earnCredits = async (userId, amount, description, referenceId, referenceModel) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.creditBalance += amount;
  await user.save();

  const tx = await CreditTransaction.create({
    user: userId,
    type: 'earn',
    amount,
    balanceAfter: user.creditBalance,
    description,
    reference: referenceId || null,
    referenceModel: referenceModel || null,
  });

  return { newBalance: user.creditBalance, transaction: tx };
};

/**
 * Deduct credits from a user (spend)
 */
const spendCredits = async (userId, amount, description, referenceId, referenceModel) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.creditBalance < amount) throw new Error('Insufficient credits');

  user.creditBalance -= amount;
  await user.save();

  const tx = await CreditTransaction.create({
    user: userId,
    type: 'spend',
    amount,
    balanceAfter: user.creditBalance,
    description,
    reference: referenceId || null,
    referenceModel: referenceModel || null,
  });

  return { newBalance: user.creditBalance, transaction: tx };
};

/**
 * Apply penalty credits
 */
const penalizeCredits = async (userId, amount, description, referenceId, referenceModel) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.creditBalance = Math.max(0, user.creditBalance - amount);
  await user.save();

  const tx = await CreditTransaction.create({
    user: userId,
    type: 'penalty',
    amount,
    balanceAfter: user.creditBalance,
    description,
    reference: referenceId || null,
    referenceModel: referenceModel || null,
  });

  return { newBalance: user.creditBalance, transaction: tx };
};

/**
 * Get credit history for a user
 */
const getCreditHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    CreditTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CreditTransaction.countDocuments({ user: userId }),
  ]);
  return { transactions, total, pages: Math.ceil(total / limit) };
};

module.exports = { earnCredits, spendCredits, penalizeCredits, getCreditHistory };
