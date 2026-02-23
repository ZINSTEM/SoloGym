import mongoose from 'mongoose';

const attributeHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  strength: { type: Number, default: 0 },
  endurance: { type: Number, default: 0 },
  agility: { type: Number, default: 0 },
  vitality: { type: Number, default: 0 },
  recordedAt: { type: Date, default: Date.now },
});

attributeHistorySchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model('AttributeHistory', attributeHistorySchema);
