/**
 * casinoController.js  (Express + Mongoose)
 *
 * Routes (example wiring at bottom):
 *  POST /casino/:slug/bet            -> placeBet
 *  POST /casino/:slug/settle         -> settleRound   (admin / game-server only)
 *  GET  /casino/:slug/book/:roundId  -> getNationBook
 *  GET  /casino/:slug/my-bets        -> myBets
 */
import * as engine from '../services/casinoEngine.js';
import Bet from '../models/CasinoBet.js';
import Round from '../models/CasinoRound.js';
import User from '../models/subAdminModel.js'; // apna existing User model (numeric `balance` field) - path adjust kar lena

// --------------------------------------------------------------- placeBet
export const placeBet = async (req, res) => {
  const { slug } = req.params;
  const userId = req.user._id;                 // from your auth middleware
  const { roundId, side, selection } = req.body;
  const odds = Number(req.body.odds);
  const stake = Number(req.body.stake);

  try {
    if (!engine.familyOf(slug)) return res.status(400).json({ success: false, message: 'Game not supported' });

    const errors = engine.validateBet(slug, { side, selection, odds, stake });
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });

    const round = await Round.findOne({ slug, roundId });
    if (!round || round.status !== 'betting' || (round.bettingEndsAt && round.bettingEndsAt < new Date())) {
      return res.status(400).json({ success: false, message: 'Betting closed' });
    }

    // IMPORTANT: server must verify `odds` against its own odds feed here
    // (never trust client odds): e.g. await oddsService.assertOdds(slug, roundId, selection, side, odds)

    const exposure = engine.calcExposure({ side, stake, odds });

    // atomic debit - fails if balance < exposure, no race condition
    const debited = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: exposure } },
      { $inc: { balance: -exposure } },
      { new: true }
    );
    if (!debited) return res.status(400).json({ success: false, message: 'Insufficient balance' });

    let bet;
    try {
      bet = await Bet.create({ userId, slug, roundId, side, selection, odds, stake, exposure });
    } catch (e) {
      await User.updateOne({ _id: userId }, { $inc: { balance: exposure } }); // refund
      throw e;
    }

    return res.json({ success: true, bet, balance: debited.balance });
  } catch (err) {
    console.error('placeBet error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
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