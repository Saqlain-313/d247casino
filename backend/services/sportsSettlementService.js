/**
 * Sports Bet Settlement Service
 * Complete settlement with WebSocket updates, upline updates, and history tracking
 * Handles: Match Odds, Bookmaker, Toss, 1st 6 over, OVER_UNDER
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

async function settleSportsBet(bet, user, winner) {
  try {
    const betTeam = (bet.teamName || '').trim().toLowerCase();
    const winnerNorm = (winner || '').trim().toLowerCase();
    const isWin = betTeam === winnerNorm;

    // Net P&L handles both normal and reduced/green/red offset positions accurately:
    // back: win -> betAmount, lose -> -price; lay: win(selection won) -> -price, lose -> betAmount.
    const rawPnl =
      bet.otype === 'back'
        ? isWin
          ? Number(bet.betAmount || 0)
          : -Number(bet.price || 0)
        : isWin
          ? -Number(bet.price || 0)
          : Number(bet.betAmount || 0);
    const pnl = rawPnl === 0 ? 0 : rawPnl;

    const status = pnl >= 0 ? 1 : 2; // WIN / break-even when >= 0, LOSS when < 0
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
        betResult: winner,
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
    console.error(`Error settling sports bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Void a sports bet (match cancelled/no result)
 * Returns stake to user via exposure recalculation - no direct balance changes
 * @param {Object} bet - Bet document
 * @returns {Object} { success, betUpdates }
 */
async function voidSportsBet(bet) {
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
    console.error(`Error voiding sports bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

async function tiedSportsBet(bet, user) {
  try {
    const rawPnl =
      bet.otype === 'back'
        ? -Number(bet.price || 0)
        : Number(bet.betAmount || 0);
    const pnl = rawPnl === 0 ? 0 : rawPnl;
    const status = pnl >= 0 ? 1 : 2;
    const balanceChange = pnl;
    const profitLossChange = pnl;
    const resultAmount = Math.abs(pnl);
    const avBalanceChange =
      pnl >= 0 ? pnl + Math.max(0, Number(bet.price || 0)) : pnl;

    // NOTE: User updates are applied via atomic $inc in the controller, not here
    // This prevents lost updates from concurrent cron jobs

    return {
      success: true,
      betUpdates: {
        status,
        resultAmount,
        profitLossChange,
        betResult: 'TIED',
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
    console.error(`Error settling tied bet ${bet._id}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Calculate exposure from pending bets
 * Handles all edge cases:
 * - Normal bets (betAmount >= 0): exposure = price
 * - Offset bets (betAmount < 0): exposure = MAX(|betAmount|, price)
 * - Guaranteed profit (price < 0): exposure = 0
 *
 * @param {Array} pendingBets - Unsettled bets
 * @returns {Number} Total exposure
 */

//Calculate exposure from pending bets using market-based scenario analysis
function calculateExposure(pendingBets) {
  return calculateAllExposure(pendingBets);
}

/**
 * Recalculate avbalance: balance - exposure
 * MUST be called after settlement and exposure recalculation
 * @param {Object} user - User document
 * @param {Number} exposure - Current exposure value
 */
function recalculateAvbalance(user, exposure) {
  user.avbalance = user.balance - exposure;
}

/**
 * Complete settlement with WebSocket, upline, and history updates
 * Called from controllers after settlement logic
 * @param {String} userId - User ID who placed bet
 * @param {Object} user - Updated user object
 * @param {Number} newExposure - Recalculated exposure
 * @param {String} gameId - Game ID being settled
 * @param {Object} resultData - API result data
 */
async function sendSettlementUpdates(userId, user, newExposure) {
  try {
    // Recalculate avbalance based on new exposure
    recalculateAvbalance(user, newExposure);

    // Send WebSocket updates to user
    sendBalanceUpdates(userId, user.avbalance);
    sendExposureUpdates(userId, newExposure);
    sendOpenBetsUpdates(userId, null);

    console.log(
      `[SPORTS] WebSocket updates sent: balance=${user.avbalance}, exposure=${newExposure}`
    );
  } catch (error) {
    console.error(
      ` Error sending settlement updates for user ${userId}:`,
      error.message
    );
  }
}

/**
 * Update uplines after sport settlement
 * @param {Array} userIds - User IDs to update uplines for
 */
async function propagateUplineUpdates(userIds) {
  try {
    await updateAllUplines(userIds);
    console.log(` [SPORTS] Updated uplines for ${userIds.length} users`);
  } catch (error) {
    console.error(` Error updating uplines:`, error.message);
  }
}

/**
 * Create history record for settled bets
 * @param {String} gameId - Game ID
 * @param {String} winner - Winner/result
 * @param {Object} gameData - Game details (eventName, marketName, gameType, etc)
 * @param {Number} betsCount - Number of bets settled
 * @param {Object} stats - Settlement stats { totalPaidOut, totalCollected }
 */
async function recordBetHistory(gameId, winner, gameData, betsCount, stats) {
  try {
    await betHistoryModel.create({
      gameId,
      final_result: winner,
      eventName: gameData.eventName,
      marketName: gameData.marketName,
      gameType: gameData.gameType,
      gameName: gameData.gameName,
      sport_id: gameData.sport_id,
      betsSettled: betsCount,
      totalAmount: (stats?.totalPaidOut || 0) + (stats?.totalCollected || 0),
      settledBy: 'api',
      settlementDate: new Date(),
    });

    console.log(` [SPORTS] Bet history recorded for game ${gameId}`);
  } catch (error) {
    console.error(` Error recording bet history:`, error.message);
  }
}

export {
  calculateExposure,
  propagateUplineUpdates,
  recalculateAvbalance,
  recordBetHistory,
  sendSettlementUpdates,
  settleSportsBet,
  tiedSportsBet,
  voidSportsBet,
};
