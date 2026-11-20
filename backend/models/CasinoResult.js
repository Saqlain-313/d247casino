import mongoose from 'mongoose';

export const CASINO_RESULT_RETENTION_DAYS = 4;
export const CASINO_RESULT_TTL_SECONDS =
  CASINO_RESULT_RETENTION_DAYS * 24 * 60 * 60;

const casinoResultSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    roundId: {
      type: String,
      required: true,
      trim: true,
    },
    // Local YYYY-MM-DD bucket for fast /casino-results queries
    date: {
      type: String,
      required: true,
      trim: true,
    },
    // Raw provider win code (e.g. "1", "2", "1,4,6", "17")
    win: {
      type: String,
      default: '',
      trim: true,
    },
    // Human-readable winner / Matka pana / Goal scorer label
    nat: {
      type: String,
      default: '',
      trim: true,
    },
    // 'dated' (primary) always takes precedence over 'live' (non-dated fallback)
    source: {
      type: String,
      enum: ['dated', 'live'],
      default: 'dated',
    },
    card: {
      type: String,
      default: '',
    },
    rdesc: {
      type: String,
      default: '',
    },
    // Actual round/result timestamp — drives sorting AND 4-day TTL auto-cleanup
    resultAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Zero duplicate entries per game + round
casinoResultSchema.index({ slug: 1, roundId: 1 }, { unique: true });
// Fast /casino-results queries by game & date (newest first)
casinoResultSchema.index({ slug: 1, date: 1, resultAt: -1, roundId: -1 });
// Automatic MongoDB 4-day retention cleanup (no trash buildup)
casinoResultSchema.index(
  { resultAt: 1 },
  { expireAfterSeconds: CASINO_RESULT_TTL_SECONDS }
);

export default mongoose.models.CasinoResult ||
  mongoose.model('CasinoResult', casinoResultSchema);
