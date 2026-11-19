import betHistoryModel from '../models/betHistoryModel.js';
import betModel from '../models/betModel.js';
import SubAdmin from '../models/subAdminModel.js';
import { fetchMatchData } from '../services/matchApi/index.js';
import {
  cachedData,
  sendBalanceUpdates,
  sendExposureUpdates,
  sendOpenBetsUpdates,
} from '../socket/bettingSocket.js';
import {
  calculateCashoutValue,
  isCashoutEligible,
} from '../utils/cashoutUtils.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';
import { updateAllUplines } from './admin/subAdminController.js';

const resolveSportContext = (gameName = '', sid = null) => {
  const lower = String(gameName || '').toLowerCase();
  if (lower.includes('tennis'))
    return { apitype: 'tennis', sid: Number(sid) || 2 };
  if (lower.includes('soccer') || lower.includes('football')) {
    return { apitype: 'soccer', sid: Number(sid) || 1 };
  }
  if (lower.includes('horse')) {
    return { apitype: 'horse-racing', sid: Number(sid) || 10 };
  }
  return { apitype: 'cricket', sid: Number(sid) || 4 };
};

const normalizeMarketName = (value = '') => {
  const norm = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (norm === 'match_odds' || norm === 'match odds') return 'match_odds';
  if (norm === 'tied_match' || norm === 'tied match') return 'tied_match';
  return norm;
};

const pickTopOdds = (oddsList = [], otype) => {
  const filtered = oddsList.filter(
    (o) => o && o.otype === otype && parseFloat(o.odds) > 0
  );
  if (!filtered.length) return null;
  const top =
    filtered.find((o) => Number(o.tno) === 0) ||
    filtered.find((o) => String(o.oname || '').toLowerCase() === `${otype}1`) ||
    (otype === 'back'
      ? filtered.reduce((best, o) =>
          parseFloat(o.odds) > parseFloat(best.odds) ? o : best
        )
      : filtered.reduce((best, o) =>
          parseFloat(o.odds) < parseFloat(best.odds) ? o : best
        ));
  const val = parseFloat(top?.odds);
  return Number.isFinite(val) && val > 0 ? val : null;
};

// Extract best decimal back/lay odds + D247 liveMarket metadata for the exact
// bet market & runner. Pure D247 schema: gtype === 'match1' converts bhav ->
// (1 + bhav / 100); gscode === 1 required on both market and runner.
export function getBestOddsForTeam(
  gameId,
  gameName,
  teamName,
  { marketName, gType } = {}
) {
  const { apitype } = resolveSportContext(gameName);
  const cacheKey = `${gameId}_${apitype}`;
  const cached = cachedData[cacheKey];

  if (!cached || !cached.data) {
    return { bestLay: null, bestBack: null, liveMarket: null };
  }

  const markets = Array.isArray(cached.data)
    ? cached.data
    : cached.data.data || cached.data;

  if (!Array.isArray(markets)) {
    return { bestLay: null, bestBack: null, liveMarket: null };
  }

  const teamLower = (teamName || '').trim().toLowerCase();
  const targetMarketNorm = normalizeMarketName(marketName || '');

  // Strictly match the bet's exact market when marketName is provided (never
  // leak odds from another market).
  const candidateMarkets = targetMarketNorm
    ? markets.filter((m) => normalizeMarketName(m?.mname) === targetMarketNorm)
    : markets;

  for (const market of candidateMarkets) {
    if (!market?.section || !Array.isArray(market.section)) continue;

    for (const runner of market.section) {
      const runnerName = (runner.nat || '').trim().toLowerCase();
      if (runnerName !== teamLower) continue;

      const odds = runner.odds;
      if (!Array.isArray(odds) || odds.length === 0) continue;

      let bestBack = pickTopOdds(odds, 'back');
      let bestLay = pickTopOdds(odds, 'lay');

      const liveGtype = String(market.gtype || gType || '')
        .trim()
        .toLowerCase();
      if (liveGtype === 'match1') {
        if (bestBack !== null) bestBack = 1 + bestBack / 100;
        if (bestLay !== null) bestLay = 1 + bestLay / 100;
      }

      // D247 reference: gscode === 1 on both market and runner means open
      const marketOpen = Number(market.gscode) === 1;
      const runnerOpen = Number(runner.gscode) === 1;

      return {
        bestLay: bestLay && bestLay >= 1.01 ? bestLay : null,
        bestBack: bestBack && bestBack >= 1.01 ? bestBack : null,
        liveMarket: {
          gtype: liveGtype || null,
          runnerCount: market.section.length,
          isOpen: marketOpen && runnerOpen,
        },
      };
    }
  }

  return { bestLay: null, bestBack: null, liveMarket: null };
}

async function getFreshBestOddsForBet(bet) {
  const { apitype, sid } = resolveSportContext(bet.gameName, bet.sid);
  const cacheKey = `${bet.gameId}_${apitype}`;
  try {
    const fresh = await fetchMatchData(bet.gameId, sid);
    if (fresh?.success && Array.isArray(fresh.data)) {
      cachedData[cacheKey] = {
        data: fresh.data,
        raw: fresh,
        lastUpdated: Date.now(),
      };
    }
  } catch {
    // Fall back to fresh polling cache if available
  }
  return getBestOddsForTeam(bet.gameId, bet.gameName, bet.teamName, {
    marketName: bet.marketName,
    gType: bet.gType,
  });
}

export const getCashoutQuote = async (req, res) => {
  try {
    const { betId } = req.body;
    const userId = req.id;

    if (!betId) {
      return res.status(400).json({ message: 'betId is required' });
    }

    const bet = await betModel.findOne({ _id: betId, userId, status: 0 });
    if (!bet) {
      return res
        .status(404)
        .json({ message: 'Bet not found or already settled' });
    }

    const { bestLay, bestBack, liveMarket } = await getFreshBestOddsForBet(bet);

    if (!liveMarket || !isCashoutEligible(bet, liveMarket)) {
      return res.status(400).json({
        cashoutAvailable: false,
        message: 'Cashout not available for this market',
      });
    }

    // Reference D247 rule: both market gscode and runner gscode must be 1 (open)
    if (!liveMarket.isOpen) {
      return res.json({
        cashoutAvailable: false,
        message: 'Market is suspended',
      });
    }

    if ((!bestLay || bestLay < 1.01) && (!bestBack || bestBack < 1.01)) {
      return res.json({
        cashoutAvailable: false,
        message: 'No liquidity available',
      });
    }
    const cashoutValue = calculateCashoutValue([bet], bestLay, bestBack);

    if (cashoutValue === null) {
      return res.json({
        cashoutAvailable: false,
        message: 'Cannot calculate cashout',
      });
    }

    return res.json({
      cashoutAvailable: true,
      betId: bet._id.toString(),
      cashoutValue,
      currentOdds: bet.otype === 'lay' ? bestBack : bestLay,
    });
  } catch (error) {
    console.error('Cashout quote error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const executeCashout = async (req, res) => {
  try {
    const { betId } = req.body;
    const userId = req.id;

    if (!betId) {
      return res.status(400).json({ message: 'betId is required' });
    }

    // 1. Load the bet (must be open and not already cashed out)
    const bet = await betModel.findOne({
      _id: betId,
      userId,
      status: 0,
      isCashedOut: { $ne: true },
    });
    if (!bet) {
      return res
        .status(400)
        .json({ message: 'Bet already settled/cashed out or not found' });
    }

    // 2. Always verify fresh live odds & D247 market metadata before executing cashout
    const { bestLay, bestBack, liveMarket } = await getFreshBestOddsForBet(bet);

    if (!liveMarket || !isCashoutEligible(bet, liveMarket)) {
      return res
        .status(400)
        .json({ message: 'Cashout not available for this market' });
    }

    if (!liveMarket.isOpen) {
      return res
        .status(400)
        .json({ message: 'Market is suspended. Cannot cashout.' });
    }

    // 3. Calculate cashout value (net guaranteed P/L)
    const cashoutValue = calculateCashoutValue([bet], bestLay, bestBack);
    if (cashoutValue === null) {
      return res
        .status(400)
        .json({ message: 'Cannot calculate cashout. No liquidity.' });
    }

    // 4. Mark bet as cashed out — status stays 0 (still pending/open)
    //    Settlement cron will use cashoutValue for P/L instead of match result
    const claimedBet = await betModel.findOneAndUpdate(
      { _id: betId, status: 0, isCashedOut: { $ne: true } },
      {
        $set: {
          isCashedOut: true,
          cashoutValue: cashoutValue,
          settledBy: 'cashout',
          settledAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claimedBet) {
      return res
        .status(400)
        .json({ message: 'Bet already cashed out by another process' });
    }

    // 5. Recalculate exposure — cashed-out bets with negative cashoutValue
    //    contribute |cashoutValue| as exposure; positive cashout = 0 exposure
    //    Balance and bettingProfitLoss are NOT touched here — P/L is applied at settlement
    const allOpenBets = await betModel.find({
      userId,
      status: 0,
    });
    const newExposure = calculateAllExposure(allOpenBets);

    // 6. Update user exposure and avbalance
    const updatedUser = await SubAdmin.findByIdAndUpdate(
      userId,
      [
        {
          $set: {
            exposure: newExposure,
            avbalance: { $subtract: ['$balance', newExposure] },
          },
        },
      ],
      { new: true }
    );

    // 7. Push WebSocket updates
    sendBalanceUpdates(userId, updatedUser.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    // 8. Update upline balances
    await updateAllUplines([userId]);

    console.log(
      `[CASHOUT] Bet ${betId} cashed out: value=${cashoutValue}, newBalance=${updatedUser.avbalance}, newExposure=${newExposure}`
    );

    return res.json({
      success: true,
      cashoutValue,
      newBalance: updatedUser.avbalance,
      newExposure,
      message: `Cashout successful: locked ₹${cashoutValue}`,
    });
  } catch (error) {
    console.error('Cashout execution error:', error);
    return res.status(500).json({ message: 'Server error during cashout' });
  }
};
