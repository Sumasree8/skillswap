const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
  verified: { type: Boolean, default: false },
  verificationMethod: { type: String, enum: ['quiz', 'portfolio', 'github', null], default: null },
  portfolioLink: { type: String, default: null },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: null },
  bio: { type: String, default: '', maxlength: 500 },
  location: { type: String, default: '' },
  skillsOffered: [skillSchema],
  skillsWanted: [{ name: String, level: String }],
  creditBalance: { type: Number, default: 100 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  completionRate: { type: Number, default: 100 },
  swapsCompleted: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Virtual: average rating
userSchema.virtual('avgRating').get(function () {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : null;
});

module.exports = mongoose.model('User', userSchema);
