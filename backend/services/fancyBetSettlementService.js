/**
 * Fancy Bet Settlement Service
 * Complete settlement with WebSocket updates, upline updates, and history tracking
 * Handles fancy/score-based bets: Normal, meter, line, ball, khado
 *
 * See: BETTING_SETTLEMENT_LOGIC.md for detailed rules
 */

import { updateAllUplines } from '../controllers/admin/subAdminController.js';
import betHistoryModel from '../models/betHistoryModel.js';
import {
  sendBalanceUpdates,
  sendExposureUpdates,
  sendOpenBetsUpdates,
} from '../socket/bettingSocket.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';

/**
 * Settle a single fancy bet (score-based)
 * @param {Object} bet - Bet document
 * @param {Object} user - User document
 * @param {String|Number} actualScore - Actual final score
 * @returns {Object} { success, betUpdates, userUpdates }
 */
async function settleFancyBet(bet, user, actualScore) {
  try {
    const fancyScore = parseFloat(bet.fancyScore);
    const score = parseFloat(actualScore);

    if (isNaN(fancyScore) || isNaN(score)) {
      return {
        success: false,
        message: `Invalid fancy score: fancyScore=${bet.fancyScore}, actualScore=${actualScore}`,
      };
    }

    // Determine win:
    // - D247 Khado with khadoLayOdds > 0: range bet [fancyScore, fancyScore + khadoLayOdds - 1]
    // - Standard fancy (Normal/meter/line/ball): back wins if score >= fancyScore, lay wins if score < fancyScore
    const khadoRange =
      bet.gameType === 'khado' ? parseFloat(bet.khadoLayOdds) : Number.NaN;
    const scoreHits =
      Number.isFinite(khadoRange) && khadoRange > 0
        ? score >= fancyScore && score <= fancyScore + khadoRange - 1
        : score >= fancyScore;
    const isWin = bet.otype === 'back' ? scoreHits : !scoreHits;

    // Unified P&L handles normal, hedged/green-book (price < 0), and red-book (betAmount < 0):
    // win -> +betAmount; lose -> -price.
    const rawPnl = isWin ? Number(bet.betAmount || 0) : -Number(bet.price || 0);
    const pnl = rawPnl === 0 ? 0 : rawPnl;
    const status = pnl >= 0 ? 1 : 2;
    const balanceChange = pnl;
    const profitLossChange = pnl;
    const resultAmount = Math.abs(pnl);
    const avBalanceChange =
      pnl >= 0 ? Math.max(0, pnl) + Math.max(0, Number(bet.price || 0)) : pnl;

    // NOTE: User updates are applied via atomic $inc in the controller, not here
    // This prevents lost updates from concurrent cron jobs

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult: score.toString(),
        settledBy: 'api',
        settledAt: new Date(),
      },
      userUpdates: {
        balanceChange,
        avBalanceChange,
        profitLossChange,
      },
    };
  } catch (error) {
    console.error(`Error settling fancy bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export function normalizeFancy1Result(rawResult) {
  const normalized = String(rawResult).trim().toLowerCase();

  if (['1', 'yes', 'y', 'true'].includes(normalized)) return '1';
  if (['0', 'no', 'n', 'false'].includes(normalized)) return '0';

  return null;
}

async function settleFancy1Bet(bet, user, rawResult) {
  try {
    const normalized = normalizeFancy1Result(rawResult);
    if (!normalized) {
      return {
        success: false,
        message: `Invalid fancy1 result: ${rawResult}`,
      };
    }

    const yesHappened = normalized === '1';
    const isWin = bet.otype === 'back' ? yesHappened : !yesHappened;

    const rawPnl = isWin ? Number(bet.betAmount || 0) : -Number(bet.price || 0);
    const pnl = rawPnl === 0 ? 0 : rawPnl;
    const status = pnl >= 0 ? 1 : 2;
    const balanceChange = pnl;
    const profitLossChange = pnl;
    const resultAmount = Math.abs(pnl);
    const avBalanceChange =
      pnl >= 0 ? Math.max(0, pnl) + Math.max(0, Number(bet.price || 0)) : pnl;

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult: normalized,
        settledBy: 'api',
        settledAt: new Date(),
      },
      userUpdates: {
        balanceChange,
        avBalanceChange,
        profitLossChange,
      },
    };
  } catch (error) {
    console.error(`Error settling fancy1 bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/** Parse manual/API result into winning side for oddeven markets. */
export function normalizeOddEvenResult(rawResult) {
  const normalized = String(rawResult).trim().toLowerCase();

  if (['odd', 'odds'].includes(normalized)) {
    return { winningSide: 'odd', betResult: 'odd' };
  }
  if (['even', 'evens'].includes(normalized)) {
    return { winningSide: 'even', betResult: 'even' };
  }

  const n = parseInt(normalized, 10);
  if (Number.isFinite(n)) {
    const winningSide = n % 2 === 0 ? 'even' : 'odd';
    return { winningSide, betResult: winningSide, sourceScore: n };
  }

  return null;
}

export function isOddEvenHistoryWin(historyRecord, betResult) {
  const winningSide = (betResult || '').trim().toLowerCase();
  const historySide = (historyRecord.teamName || '').trim().toLowerCase();
  return Boolean(winningSide && historySide && historySide === winningSide);
}

async function settleOddEvenBet(bet, user, rawResult) {
  try {
    const parsed = normalizeOddEvenResult(rawResult);
    if (!parsed) {
      return {
        success: false,
        message: `Invalid oddeven result: ${rawResult} (use odd, even, or a numeric score)`,
      };
    }

    const { winningSide, betResult } = parsed;
    const betSide = (bet.teamName || '').trim().toLowerCase();
    const isWin = betSide === winningSide;

    const rawPnl = isWin ? Number(bet.betAmount || 0) : -Number(bet.price || 0);
    const pnl = rawPnl === 0 ? 0 : rawPnl;
    const status = pnl >= 0 ? 1 : 2;
    const balanceChange = pnl;
    const profitLossChange = pnl;
    const resultAmount = Math.abs(pnl);
    const avBalanceChange =
      pnl >= 0 ? Math.max(0, pnl) + Math.max(0, Number(bet.price || 0)) : pnl;

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult,
        settledBy: 'api',
        settledAt: new Date(),
      },
      userUpdates: {
        balanceChange,
        avBalanceChange,
        profitLossChange,
      },
    };
  } catch (error) {
    console.error(`Error settling oddeven bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

async function voidFancyBet(bet) {
  try {
    return {
      success: true,
      betUpdates: {
        status: 3, // VOID
        resultAmount: Math.abs(bet.price), // Show refunded amount
        profitLossChange: 0,
        betResult: 'VOID',
        settledBy: 'api',
        settledAt: new Date(),
      },
    };
  } catch (error) {
    console.error(`Error voiding fancy bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

//Calculate exposure from pending bets using market-based scenario analysis
function calculateExposure(pendingBets) {
  return calculateAllExposure(pendingBets);
}

function recalculateAvbalance(user, exposure) {
  user.avbalance = user.balance - exposure;
}

async function sendSettlementUpdates(
  userId,
  user,
  newExposure,
  gameId,
  resultData
) {
  try {
    // Recalculate avbalance based on new exposure
    recalculateAvbalance(user, newExposure);

    // Send WebSocket updates to user
    sendBalanceUpdates(userId, user.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    console.log(
      ` [FANCY] WebSocket updates sent: balance=${user.avbalance}, exposure=${newExposure}`
    );
  } catch (error) {
    console.error(
      ` Error sending settlement updates for user ${userId}:`,
      error.message
    );
  }
}

async function propagateUplineUpdates(userIds) {
  try {
    await updateAllUplines(userIds);
    console.log(` [FANCY] Updated uplines for ${userIds.length} users`);
  } catch (error) {
    console.error(` Error updating uplines:`, error.message);
  }
}

async function recordBetHistory(
  gameId,
  finalScore,
  gameData,
  betsCount,
  stats
) {
  try {
    await betHistoryModel.create({
      gameId,
      final_result: finalScore,
      eventName: gameData.eventName,
      marketName: gameData.marketName,
      gameType: gameData.gameType || 'fancy',
      gameName: gameData.gameName,
      sport_id: gameData.sport_id,
      betsSettled: betsCount,
      totalAmount: (stats?.totalPaidOut || 0) + (stats?.totalCollected || 0),
      settledBy: 'api',
      settlementDate: new Date(),
    });

    console.log(` [FANCY] Bet history recorded for game ${gameId}`);
  } catch (error) {
    console.error(`Error recording bet history:`, error.message);
  }
}

/** Whether a betHistory row won for a settled fancy1 parent (yes/no result). */
export function isFancy1HistoryWin(historyRecord, betResult) {
  const normalized = normalizeFancy1Result(betResult);
  if (!normalized) return false;
  const yesHappened = normalized === '1';
  return historyRecord.otype === 'back' ? yesHappened : !yesHappened;
}

export {
  calculateExposure,
  propagateUplineUpdates,
  recalculateAvbalance,
  recordBetHistory,
  sendSettlementUpdates,
  settleFancy1Bet,
  settleFancyBet,
  settleOddEvenBet,
  voidFancyBet,
};
