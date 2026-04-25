const Review = require('../models/Review');
const User = require('../models/User');

/**
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const { revieweeId, referenceId, referenceModel, rating, comment, tags = [] } = req.body;
    if (!revieweeId || !referenceId || !referenceModel || !rating) {
      return res.status(400).json({ success: false, message: 'revieweeId, referenceId, referenceModel, rating required' });
    }
    if (revieweeId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot review yourself' });
    }

    const existing = await Review.findOne({ reviewer: req.user._id, reference: referenceId });
    if (existing) return res.status(409).json({ success: false, message: 'Already reviewed this' });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      reference: referenceId,
      referenceModel,
      rating,
      comment,
      tags,
    });

    // Update user rating aggregate
    const reviewee = await User.findById(revieweeId);
    reviewee.rating += rating;
    reviewee.ratingCount += 1;
    await reviewee.save();

    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/reviews/:userId
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createReview, getUserReviews };
