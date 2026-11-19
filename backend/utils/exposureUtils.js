import {
  calculateMarketExposure,
  calculateOutcomeScenarios,
  groupBetsByMarket,
} from './marketCalculationUtils.js';

export const FANCY_GAME_TYPES = ['Normal', 'meter', 'line', 'ball', 'khado'];

export function isFancyBet(bet) {
  return FANCY_GAME_TYPES.includes(bet.gameType);
}
export function calculateFancyExposure(fancyBets) {
  if (!Array.isArray(fancyBets) || fancyBets.length === 0) return 0;

  const marketMap = {};
  for (const bet of fancyBets) {
    if (!bet.teamName) continue;
    const key = `${bet.gameId}_${bet.teamName}`;
    if (!marketMap[key]) marketMap[key] = [];
    marketMap[key].push(bet);
  }

  let exposure = 0;
  for (const bets of Object.values(marketMap)) {
    // Collect unique integer boundary points across all bets in this market:
    // - Standard fancy (Normal/meter/line/ball): hits on [s, +Infinity) -> boundary at s
    // - D247 Khado with khadoLayOdds > 0: hits on [s, s + range - 1] -> boundaries at s and s + range
    const boundarySet = new Set();
    for (const b of bets) {
      const s = parseFloat(b.fancyScore);
      const start = isNaN(s) ? 0 : s;
      boundarySet.add(start);
      const range =
        b.gameType === 'khado' ? parseFloat(b.khadoLayOdds) : Number.NaN;
      if (Number.isFinite(range) && range > 0) {
        boundarySet.add(start + range);
      }
    }
    const boundaries = [...boundarySet].sort((a, b) => a - b);

    // Build one representative test score per zone:
    // zone 0: boundaries[0] - 1 (below all starts)
    // zone i (1..n-1): boundaries[i-1] (in [boundaries[i-1], boundaries[i]))
    // zone n: boundaries[n-1] (at/above highest boundary)
    const testScores = [boundaries[0] - 1, ...boundaries];

    let worstNet = Infinity;

    for (const testScore of testScores) {
      let zoneNet = 0;

      for (const bet of bets) {
        const s = parseFloat(bet.fancyScore);
        const start = isNaN(s) ? 0 : s;
        const range =
          bet.gameType === 'khado' ? parseFloat(bet.khadoLayOdds) : Number.NaN;
        const hits =
          Number.isFinite(range) && range > 0
            ? testScore >= start && testScore <= start + range - 1
            : testScore >= start;

        if (bet.otype === 'back') {
          zoneNet += hits ? bet.betAmount : -bet.price;
        } else {
          zoneNet += hits ? -bet.price : bet.betAmount;
        }
      }

      if (zoneNet < worstNet) worstNet = zoneNet;
    }

    exposure += Math.abs(Math.min(0, worstNet));
  }

  return exposure;
}

export function calculateNonFancyMarketExposure(nonFancyBets) {
  if (!Array.isArray(nonFancyBets) || nonFancyBets.length === 0) return 0;

  const markets = groupBetsByMarket(nonFancyBets);
  let totalExposure = 0;

  for (const [, marketBets] of Object.entries(markets)) {
    const scenarios = calculateOutcomeScenarios(marketBets);
    totalExposure += calculateMarketExposure(scenarios);
  }

  return totalExposure;
}

export function calculateAllExposure(pendingBets) {
  if (!Array.isArray(pendingBets) || pendingBets.length === 0) return 0;

  // Separate cashed-out bets from active bets
  const activeBets = pendingBets.filter((b) => !b.isCashedOut);
  const cashedOutBets = pendingBets.filter((b) => b.isCashedOut);

  const fancyBets = activeBets.filter((b) => isFancyBet(b));
  const nonFancyBets = activeBets.filter((b) => !isFancyBet(b));

  const activeExposure =
    calculateFancyExposure(fancyBets) +
    calculateNonFancyMarketExposure(nonFancyBets);

  // Cashed-out bets with negative cashoutValue contribute their locked-in loss as exposure
  const cashoutExposure = cashedOutBets.reduce((sum, b) => {
    return sum + (b.cashoutValue < 0 ? Math.abs(b.cashoutValue) : 0);
  }, 0);

  return activeExposure + cashoutExposure;
}

export function validateFancyBetBalance(
  avbalance,
  balance,
  currentMarketBets,
  newBet
) {
  const safeAvbalance = Math.min(avbalance, balance);
  avbalance = Math.max(0, safeAvbalance);

  const currentMarketExposure =
    Array.isArray(currentMarketBets) && currentMarketBets.length > 0
      ? calculateFancyExposure(currentMarketBets)
      : 0;
  const combinedBets = [...(currentMarketBets || []), newBet];
  const newMarketExposure = calculateFancyExposure(combinedBets);

  const totalCurrentExposure = balance - avbalance;
  const otherMarketsExposure = Math.max(
    0,
    totalCurrentExposure - currentMarketExposure
  );
  const newTotalExposure = otherMarketsExposure + newMarketExposure;
  const newAvbalance = parseFloat((balance - newTotalExposure).toFixed(2));

  const allowed = newAvbalance >= 0;

  return {
    allowed,
    reason: allowed
      ? 'Sufficient balance: post-bet exposure within limits'
      : `Insufficient balance: post-bet avbalance would be ${newAvbalance.toFixed(2)}`,
    newAvbalance,
    currentMarketExposure,
    newMarketExposure,
    otherMarketsExposure,
    newTotalExposure,
  };
}

export function calculateBetExposure(bet) {
  if (!bet) return 0;

  const price = bet.price || 0;
  const betAmount = bet.betAmount || 0;

  if (price < 0) {
    return 0;
  }
  if (betAmount < 0) {
    return Math.max(Math.abs(betAmount), price);
  }

  return price;
}

export function calculateTotalExposure(pendingBets) {
  if (!Array.isArray(pendingBets) || pendingBets.length === 0) return 0;

  return pendingBets.reduce((sum, bet) => {
    return sum + calculateBetExposure(bet);
  }, 0);
}

export default {
  calculateBetExposure,
  calculateTotalExposure,
  FANCY_GAME_TYPES,
  isFancyBet,
  calculateFancyExposure,
  calculateNonFancyMarketExposure,
  calculateAllExposure,
  validateFancyBetBalance,
};
