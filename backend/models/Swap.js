const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterSkill: { type: String, required: true },
  receiverSkill: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  matchScore: { type: Number, default: 0 },
  message: { type: String, default: '' },
  scheduledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  requesterRated: { type: Boolean, default: false },
  receiverRated: { type: Boolean, default: false },
  chatRoom: { type: String },
}, { timestamps: true });

// Auto-generate chatRoom on create
swapSchema.pre('save', function (next) {
  if (!this.chatRoom) {
    this.chatRoom = `swap_${this._id}`;
  }
  next();
});

module.exports = mongoose.model('Swap', swapSchema);
