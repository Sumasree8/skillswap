const mongoose = require('mongoose');

const learningCircleSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skill: { type: String, required: true },
  maxMembers: { type: Number, default: 10 },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['open', 'active', 'completed', 'cancelled'], default: 'open' },
  creditCostPerMember: { type: Number, default: 10 },
  scheduledAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  chatRoom: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

learningCircleSchema.pre('save', function (next) {
  if (!this.chatRoom) {
    this.chatRoom = `circle_${this._id}`;
  }
  next();
});

module.exports = mongoose.model('LearningCircle', learningCircleSchema);
