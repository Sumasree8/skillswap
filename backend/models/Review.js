const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel', required: true },
  referenceModel: { type: String, enum: ['Swap', 'Session'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 500 },
  tags: [{ type: String }],
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, reference: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
