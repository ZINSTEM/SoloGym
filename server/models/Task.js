import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['task', 'goal', 'activity', 'daily'], default: 'task' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'extreme'], default: 'medium' },
  xpReward: { type: Number, required: true, min: 0 },
  deadline: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Task', taskSchema);
