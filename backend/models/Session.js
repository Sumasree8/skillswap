const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  skill: { type: String, required: true },
  type: { type: String, enum: ['instant', 'scheduled'], default: 'instant' },
  status: {
    type: String,
    enum: ['open', 'active', 'completed', 'cancelled', 'expired'],
    default: 'open',
  },
  creditCost: { type: Number, default: 20 },
  duration: { type: Number, default: 15 },
  scheduledAt: { type: Date, default: null },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  chatRoom: { type: String },
  description: { type: String, default: '' },
  isDemo: { type: Boolean, default: false },   // seeded demo content; hidden from real users
}, { timestamps: true });

sessionSchema.pre('save', function (next) {
  if (!this.chatRoom) {
    this.chatRoom = `session_${this._id}`;
  }
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
