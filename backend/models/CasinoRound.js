import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  roundId: { type: String, required: true },
  status: { type: String, enum: ['betting', 'suspended', 'settled'], default: 'betting' },
  bettingEndsAt: Date,
  result: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

roundSchema.index({ slug: 1, roundId: 1 }, { unique: true });

export default mongoose.models.CasinoRound || mongoose.model('CasinoRound', roundSchema);