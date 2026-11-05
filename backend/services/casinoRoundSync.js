import Round from '../models/CasinoRound.js';

export const saveCasinoRoundSnapshot = async (slug, data) => {
  if (!data?.mid) return null;

  const roundId = String(data.mid);

  const hasActiveMarket = data.sub?.some(
    item => String(item.gstatus).toUpperCase() === 'ACTIVE'
  );

  return Round.findOneAndUpdate(
    { slug, roundId },
    {
      $set: {
        marketData: data,
        lastSyncedAt: new Date(),
      },
      $setOnInsert: {
        slug,
        roundId,
        status: hasActiveMarket ? 'betting' : 'closed',
        providerClosed: !hasActiveMarket,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
};