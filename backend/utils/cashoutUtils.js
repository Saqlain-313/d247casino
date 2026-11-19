// Pure D247 reference cashout rule (776178602-new.devtools @2145098):
//   section.length === 2 && (gtype === 'match' || gtype === 'match1')
// Driven strictly by live market / persisted D247 schema — no hardcoded market-name lists.
export const CASHOUT_GTYPES = new Set(['match', 'match1']);

/**
 * Determine whether a bet is eligible for cashout per D247's exact schema rule:
 *   1. Open sports bet, not already cashed out or a cashout hedge
 *   2. Market gtype is 'match' or 'match1'
 *   3. Binary 2-runner market (runnerCount === 2)
 */
export function isCashoutEligible(bet, liveMarket = null) {
  if (
    !bet ||
    bet.status !== 0 ||
    bet.betType === 'casino' ||
    bet.isCashoutHedge ||
    bet.isCashedOut
  ) {
    return false;
  }

  const effectiveGtype = String(liveMarket?.gtype || bet.gType || '')
    .trim()
    .toLowerCase();
  const effectiveRunners = Number(
    liveMarket?.runnerCount ??
      liveMarket?.section?.length ??
      bet.runnerCount ??
      0
  );

  return CASHOUT_GTYPES.has(effectiveGtype) && effectiveRunners === 2;
}

export function calculateCashoutValue(bets, currentBestLay, currentBestBack) {
  if (!Array.isArray(bets) || bets.length === 0) return null;

  let W = 0;
  let L = 0;

  for (const bet of bets) {
    if (bet.otype === 'back') {
      W += bet.betAmount;
      L -= bet.price;
    } else {
      W -= bet.price;
      L += bet.betAmount;
    }
  }
  const diff = W - L;

  if (Math.abs(diff) < 0.001) {
    return Math.round(W);
  }

  let cashout;
  if (diff > 0) {
    if (!currentBestLay || currentBestLay < 1.01) return null;
    const H = diff / currentBestLay;
    cashout = L + H;
  } else {
    if (!currentBestBack || currentBestBack < 1.01) return null;
    const H = Math.abs(diff) / currentBestBack;
    cashout = L - H;
  }
  return Math.round(cashout);
}

export function calculateSingleBackCashout(
  originalOdds,
  stake,
  currentBestLay
) {
  if (!currentBestLay || currentBestLay < 1.01) return null;
  return Math.round(stake * (originalOdds / currentBestLay - 1));
}

export default {
  CASHOUT_GTYPES,
  isCashoutEligible,
  calculateCashoutValue,
  calculateSingleBackCashout,
};
