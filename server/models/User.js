import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const attributeSchema = new mongoose.Schema({
  strength: { type: Number, default: 0 },
  endurance: { type: Number, default: 0 },
  agility: { type: Number, default: 0 },
  vitality: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  displayName: { type: String, default: 'Hunter', trim: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  attributes: { type: attributeSchema, default: () => ({ strength: 0, endurance: 0, agility: 0, vitality: 0 }) },
  availablePoints: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// XP needed for level N: 100 * (1.5 ^ (level - 1))
userSchema.statics.xpForLevel = function (level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export default mongoose.model('User', userSchema);
