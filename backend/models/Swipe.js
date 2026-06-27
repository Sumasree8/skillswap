const mongoose = require('mongoose');

/**
 * A single swipe decision by one user on another.
 *  - action 'like' = swiped right (interested in swapping skills)
 *  - action 'pass' = swiped left (not interested / skip)
 *
 * A mutual 'like' between two users constitutes a match.
 */
const swipeSchema = new mongoose.Schema({
  swiper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: ['like', 'pass'], required: true },
}, { timestamps: true });

// A user can only have one active swipe decision per target.
swipeSchema.index({ swiper: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
