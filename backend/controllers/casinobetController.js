/**
 * casinoController.js  (Express + Mongoose)
 *
 * Routes (example wiring at bottom):
 *  POST /casino/:slug/bet            -> placeBet
 *  POST /casino/:slug/settle         -> settleRound   (admin / game-server only)
 *  GET  /casino/:slug/book/:roundId  -> getNationBook
 *  GET  /casino/:slug/my-bets        -> myBets
 */
import Bet from '../models/CasinoBet.js';
import Round from '../models/CasinoRound.js';
import User from '../models/subAdminModel.js'; // apna existing User model (numeric `balance` field) - path adjust kar lena
import * as engine from '../services/casinoEngine.js';
import axios from "axios";


// --------------------------------------------------------------- placeBet
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Fetch live casino data
const fetchCasinoData = async (eventName) => {
  try {
    const url = `${API_URL}/diamond/casino/data/${encodeURIComponent(eventName)}?key=${API_KEY}`;

    console.log("Casino API URL:", url.replace(API_KEY, "HIDDEN"));

    const response = await axios.get(url, {
      timeout: 15000,
    });

    console.log("Casino API Status:", response.status);
    console.log("Casino API Response:", JSON.stringify(response.data, null, 2));

    return response.data;

  } catch (error) {
    console.error("CASINO API ERROR:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
    });

    throw error;
  }
};

export const placeBet = async (req, res) => {
  const { slug } = req.params;
  const userId = req.id;

  const { roundId, side, selection } = req.body;

  const odds = Number(req.body.odds);
  const stake = Number(req.body.stake);

  try {
    // 1. Validate game
    if (!engine.familyOf(slug)) {
      return res.status(400).json({
        success: false,
        message: "Game not supported",
      });
    }

    // 2. Validate request
    const errors = engine.validateBet(slug, {
      side,
      selection,
      odds,
      stake,
    });

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    // 3. Fetch live casino data
    let casinoResponse;

    try {
      casinoResponse = await fetchCasinoData(slug);
    } catch (error) {
      console.error("Casino API Error:", error.message);

      return res.status(503).json({
        success: false,
        message: "Casino server unavailable. Please try again.",
      });
    }

    // 4. Check API response
    if (!casinoResponse || casinoResponse.success === false) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch casino data",
      });
    }

    // 5. Extract live data
    // IMPORTANT: Update these fields according to your actual API response.
    const casinoData = casinoResponse.data;

    if (!casinoData) {
      return res.status(400).json({
        success: false,
        message: "Casino data not found",
      });
    }

    // 6. Verify round ID from live API
    const liveRoundId = String(
      casinoData.roundId ?? casinoData.mid ?? ""
    );

    if (!liveRoundId || liveRoundId !== String(roundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired round",
      });
    }

    // 7. Verify betting status
    const bettingStatus =
      casinoData.status ??
      casinoData.gameStatus ??
      casinoData.betStatus;

    if (
      bettingStatus &&
      !["open", "betting", "active"].includes(
        String(bettingStatus).toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Betting closed",
      });
    }

    // 8. Verify odds using server-side odds feed
    // Never trust client odds.
    // await oddsService.assertOdds(slug, roundId, selection, side, odds);

    // 9. Calculate exposure
    const exposure = engine.calcExposure({
      side,
      stake,
      odds,
    });

    if (!Number.isFinite(exposure) || exposure <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bet exposure",
      });
    }

    // 10. Atomic balance debit
    const debited = await User.findOneAndUpdate(
      {
        _id: userId,
        balance: { $gte: exposure },
      },
      {
        $inc: { balance: -exposure },
      },
      {
        new: true,
      }
    );

    if (!debited) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // 11. Create bet
    let bet;

    try {
      bet = await Bet.create({
        userId,
        slug,
        roundId,
        side,
        selection,
        odds,
        stake,
        exposure,
      });
    } catch (error) {
      // Refund if bet creation fails
      await User.updateOne(
        { _id: userId },
        { $inc: { balance: exposure } }
      );

      throw error;
    }

    // 12. Success response
    return res.status(201).json({
      success: true,
      message: "Bet placed successfully",
      bet,
      balance: debited.balance,
    });

  } catch (error) {
    console.error("placeBet error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ------------------------------------------------------------ settleRound
/**
 * body: { roundId, result }  - result shape depends on game family, e.g.
 *  lucky7/aaa : { card:{rank:1..13,suit:'S|H|C|D'} }
 *  dt         : { dragon:{..}, tiger:{..} }
 *  baccarat   : { playerPoints, bankerPoints, playerPair, bankerPair }
 *  teen       : { A:[3 cards], B:[3 cards] }
 *  roulette   : { number: 0..36 }
 *  sicbo      : { dice:[a,b,c] }
 */
export const settleRound = async (req, res) => {
  const { slug } = req.params;
  const { roundId, result } = req.body;
  try {
    // lock the round so it can't be settled twice
    const round = await Round.findOneAndUpdate(
      { slug, roundId, status: { $ne: 'settled' } },
      { status: 'settled', result },
      { new: true }
    );
    if (!round) return res.status(409).json({ success: false, message: 'Round not found or already settled' });

    const bets = await Bet.find({ slug, roundId, status: 'pending' }).cursor();
    let settled = 0, failed = 0;

    for await (const bet of bets) {
      try {
        const selOutcome = engine.evaluateSelection(slug, bet.selection, result);
        const s = engine.settleBet(bet, selOutcome);

        // pending -> settled is the idempotency guard (credit happens only once)
        const claimed = await Bet.findOneAndUpdate(
          { _id: bet._id, status: 'pending' },
          { status: 'settled', outcome: s.outcome, payout: s.payout, net: s.net, settledAt: new Date() }
        );
        if (claimed && s.payout > 0) {
          await User.updateOne({ _id: bet.userId }, { $inc: { balance: s.payout } });
        }
        settled++;
      } catch (e) {
        failed++;
        console.error(`settle failed for bet ${bet._id}:`, e.message);
      }
    }
    return res.json({ success: true, settled, failed });
  } catch (err) {
    console.error('settleRound error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ------------------------------------------------------- void / refund round
export const voidRound = async (req, res) => {
  const { slug } = req.params;
  const { roundId } = req.body;
  const bets = await Bet.find({ slug, roundId, status: 'pending' });
  for (const bet of bets) {
    const claimed = await Bet.findOneAndUpdate({ _id: bet._id, status: 'pending' }, { status: 'void', payout: bet.exposure, net: 0, settledAt: new Date() });
    if (claimed) await User.updateOne({ _id: bet.userId }, { $inc: { balance: bet.exposure } });
  }
  await Round.updateOne({ slug, roundId }, { status: 'settled', result: { void: true } });
  res.json({ success: true, refunded: bets.length });
};

// ------------------------------------------------------------- nation book
export const getNationBook = async (req, res) => {
  const { slug, roundId } = req.params;
  const bets = await Bet.find({ slug, roundId, userId: req.user._id, status: 'pending' }).lean();
  const book = engine.nationBook(slug, bets, engine.defaultScenarios(slug));
  res.json({ success: true, book }); // e.g. { dragon: +980, tiger: -1000, tie: -1000 }
};

// ---------------------------------------------------------------- my bets
export const myBets = async (req, res) => {
  const { slug } = req.params;
  const bets = await Bet.find({ userId: req.user._id, slug }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, bets });
};

// ----------------------------------------------------------------- stats
export const getStats = async (req, res) => {
  const { slug } = req.params;
  const rounds = await Round.find({ slug, status: 'settled', 'result.void': { $ne: true } }).sort({ createdAt: -1 }).limit(100).lean();
  const fam = engine.familyOf(slug);
  const rs = rounds.map((r) => r.result);

  if (fam === 'baccarat') {
    return res.json(engine.baccaratStats(rs.map((r) => (r.playerPoints > r.bankerPoints ? 'p' : r.playerPoints < r.bankerPoints ? 'b' : 't'))));
  }
  if (fam === 'dt') {
    return res.json(engine.dragonTigerStats(rs.reverse().map((r) => (r.dragon.rank > r.tiger.rank ? 'D' : r.dragon.rank < r.tiger.rank ? 'T' : 'TIE'))));
  }
  if (fam === 'lucky7') return res.json(engine.lucky7Stats(rs.map((r) => r.card.rank)));
  if (fam === 'roulette') return res.json(engine.rouletteStats(rs.map((r) => r.number)));
  res.json({});
};