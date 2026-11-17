import axios from 'axios';

import betHistoryModel from '../models/betHistoryModel.js';
import Bet from '../models/CasinoBet.js';
import Round from '../models/CasinoRound.js';
import User from '../models/subAdminModel.js'; // existing User model (numeric `balance`) - adjust path
import * as engine from '../services/casinoEngine.js';
import { saveCasinoRoundSnapshot } from '../services/casinoRoundSync.js';
import { getCasinoTable } from '../services/casinoTableCache.js';

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const DEBUG = process.env.CASINO_DEBUG === '1';

// Itni der (minutes) se pending bet ko auto-refund kar diya jayega
// (result API sirf latest rounds deta hai, purane round ka result nahi milta). 0 = band.
const STALE_BET_MINUTES = Number(process.env.STALE_BET_MINUTES ?? 30);

const getUid = (req) => req.id ?? req.user?._id; // placeBet used req.id, others req.user._id

// Provider kabhi ACTIVE bhejta hai, kabhi OPEN
const isActive = (s) =>
  ['ACTIVE', 'OPEN'].includes(String(s ?? '').toUpperCase());

// ======================================================================
// Provider API helpers  (direct-casino endpoints)
// ======================================================================

// Live round object nikalo. Provider response kabhi { data: {mid,...} } hota hai,
// kabhi wrapped { data: { success, data: {mid,...} } }. Dono handle hote hain.
const pickLive = (body) => {
  const candidates = [body?.data, body?.data?.data, body];
  for (const c of candidates) {
    if (c && typeof c === 'object' && c.mid !== undefined && c.mid !== null)
      return c;
  }
  return null;
};

// Result rows ka array nikalo (newest first). Wrapped aur plain dono shapes handle.
const pickResultRows = (body) => {
  const candidates = [body?.data?.res, body?.data?.data?.res, body?.res];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return null;
};

// LIVE DATA API  -> used for placing bets (current round / betting status)
export const fetchCasinoData = async (slug) => {
  // worli family round-based hy: shared cache wala assembler (tabdata + batched
  // mid data + sections) use karo, base route sirf rounds-list deta hy.
  if (['worli', 'worli2', 'worli3'].includes(slug)) {
    return getCasinoTable(slug);
  }
  const url = `${API_URL}/diamond/direct-casino/data/${encodeURIComponent(slug)}?key=${API_KEY}`;
  try {
    const response = await axios.get(url, { timeout: 15000 });
    if (DEBUG)
      console.log('Casino DATA API:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('CASINO DATA API ERROR:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
    });
    throw error;
  }
};

// RESULT API -> used for settling
// Response: { success, data: { res: [{ mid, win }, ...newest first], res1: { cname } } }
export const fetchCasinoResult = async (slug) => {
  const url = `${API_URL}/diamond/direct-casino/result/${encodeURIComponent(slug)}?key=${API_KEY}`;
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    if (DEBUG) console.log('Casino RESULT API:', JSON.stringify(data, null, 2));
    const rows = pickResultRows(data);
    if (!data || data.success === false || !rows) {
      throw new Error('Bad result API response');
    }
    return rows;
  } catch (error) {
    console.error('CASINO RESULT API ERROR:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });
    throw error;
  }
};

// Matka family ka nodate result sirf bazaar legend hy ({mid:1,win:'Diamond'});
// real round results dated endpoint pe hy: rows [{mid, nat:'257  -  4  -  GULF CLOSE'}].
const fetchDatedCasinoResult = async (slug) => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const url = `${API_URL}/diamond/direct-casino/result/${date}/${encodeURIComponent(slug)}?key=${API_KEY}`;
  const { data } = await axios.get(url, { timeout: 15000 });
  return Array.isArray(data?.data) ? data.data : [];
};

// Provider result row -> engine result object (winCode path).
// Result API sirf {mid, win} deta hy: side codes per family, roulette me number,
// dolidana me per-die sibling rows (<mid>001/002/003), sicbo me total.
// Card-dependent selections (red/black/even/odd/card:N/pairs...) win code se
// decidable nahi hy — engine unhe throw karta hy aur bet pending rehti hy.
const normalizeResult = (slug, row, list = []) => {
  const fam = engine.familyOf(slug);
  const w = String(row?.win);
  if (fam === 'matka' && typeof row?.nat === 'string') {
    // dated row: "257  -  4  -  GULF CLOSE" = pana - single digit - bazaar
    const parts = row.nat.split('-').map((p) => p.trim());
    const pana = parts[0];
    const digit = Number(parts[1]);
    if (/^\d{3}$/.test(pana) && Number.isFinite(digit)) {
      return { open: digit, openPana: pana };
    }
    throw new Error(`unparseable matka result: ${row.nat}`);
  }
  const rc = { winCode: w, win: w };
  if (fam === 'roulette') {
    rc.number = Number(w);
  } else if (fam === 'sicbo') {
    const base = String(row?.mid);
    const dice = [1, 2, 3]
      .map((i) => list.find((r) => String(r.mid) === `${base}00${i}`))
      .map((r) => Number(r?.win));
    if (dice.every((d) => Number.isFinite(d) && d >= 1 && d <= 6))
      rc.dice = dice;
    else rc.total = Number(w);
  }
  return rc;
};

// fetchCasinoResult wrapped shapes return karta hy ({success,data:{res}} /
// {res} / bare array) — poller aur settle endpoint dono ko flat rows chahiye.
const resultRows = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.res)) return resp.res;
  if (Array.isArray(resp?.data?.res)) return resp.data.res;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

// Provider market label (nat) -> engine selection key. Frontend selection me
// sid bhejta hy, engine family keys ('dragon', 'pairplus:A', 'split:1-2'...)
// expect karta hy — placement par hi canonical key store karte hy.
const natKey = (fam, nat, market = null) => {
  if (fam === 'matka') {
    // sub sid 1-10 = digits (display order sr%10), 11-14 Line/ODD/EVEN (engine me nahi)
    const sid = Number(market?.sid ?? market?.i);
    const sr = Number(market?.sr);
    if (sid >= 1 && sid <= 10 && Number.isFinite(sr)) {
      return `single:${sr % 10}`;
    }
    return null;
  }
  const n = String(nat ?? '')
    .trim()
    .toLowerCase();
  if (!n || n === 'undefined') return null;
  const cardM = n.match(/^card ([a-z0-9]+)$/);
  switch (fam) {
    case 'lucky7':
      if (n === 'low card') return 'low';
      if (n === 'high card') return 'high';
      if (['even', 'odd', 'red', 'black'].includes(n)) return n;
      if (cardM) return `card:${cardM[1] === 'a' ? 1 : Number(cardM[1])}`;
      return null;
    case 'aaa':
      if (
        ['amar', 'akbar', 'anthony', 'even', 'odd', 'red', 'black'].includes(n)
      )
        return n;
      if (n === 'under 7' || n === 'under7') return 'under7';
      if (n === 'over 7' || n === 'over7') return 'over7';
      if (cardM) return `card:${cardM[1] === 'a' ? 1 : Number(cardM[1])}`;
      return null;
    case 'dt':
      if (['dragon', 'tiger', 'tie'].includes(n)) return n;
      return null;
    case 'baccarat':
      if (['player', 'banker', 'tie'].includes(n)) return n;
      if (n === 'player pair') return 'playerPair';
      if (n === 'banker pair') return 'bankerPair';
      if (n === 'either pair') return 'eitherPair';
      return null;
    case 'teen':
    case 'muflis': {
      const m = n.match(
        /^(player|pair plus|total|3 baccarat|m baccarat|black|red)\s+([ab])$/
      );
      if (!m) return null;
      const who = m[2].toUpperCase();
      if (m[1] === 'player') return who === 'A' ? 'playerA' : 'playerB';
      if (m[1] === 'pair plus') return `pairplus:${who}`;
      if (m[1] === 'total') return `total:${who}`;
      if (m[1] === '3 baccarat' || m[1] === 'm baccarat')
        return `baccarat:${who}`;
      if (m[1] === 'black') return `redblack:black`;
      if (m[1] === 'red') return `redblack:red`;
      return null;
    }
    case 'sicbo': {
      if (n === 'small') return 'small';
      if (n === 'big') return 'big';
      if (n === 'any triple') return 'anytriple';
      if (n === 'odd' || n === 'even') return n;
      const dm = n.match(/^double (\d)$/);
      if (dm) return `double:${dm[1]}`;
      const tm = n.match(/^triple (\d)$/);
      if (tm) return `triple:${tm[1]}`;
      const sm = n.match(/^sum (\d+)$/);
      if (sm) return `sum:${sm[1]}`;
      return null;
    }
    case 'card32': {
      const pm = n.match(/^player (\d+)$/);
      return pm ? `player${pm[1]}` : null;
    }
    case 'roulette': {
      const nums = n
        .split(',')
        .map((x) => x.trim())
        .filter((x) => /^\d+$/.test(x));
      if (nums.length === 1) return `straight:${nums[0]}`;
      if (nums.length === 2) return `split:${nums.join('-')}`;
      if (nums.length === 3) return `street:${nums.join('-')}`;
      if (nums.length === 4) return `corner:${nums.join('-')}`;
      if (nums.length === 6) return `sixline:${nums.join('-')}`;
      if (n === '1st 12') return 'dozen:1';
      if (n === '2nd 12') return 'dozen:2';
      if (n === '3rd 12') return 'dozen:3';
      if (n === '1st column') return 'column:1';
      if (n === '2nd column') return 'column:2';
      if (n === '3rd column') return 'column:3';
      if (n === '1 to 18') return 'low';
      if (n === '19 to 36') return 'high';
      if (n === 'red') return 'red';
      if (n === 'black') return 'black';
      if (n === 'odd') return 'odd';
      if (n === 'even') return 'even';
      return null;
    }
    default:
      return null;
  }
};

// Bet ka user-facing result label: win / lose / push / void / pending
const betResult = (b) => {
  if (b.status === 'pending') return 'pending';
  if (b.status === 'void') return 'void';
  if (b.net > 0) return 'win';
  if (b.net < 0) return 'lose';
  return 'push';
};

// ======================================================================
// placeBet
// ======================================================================

// Controller ke andar hi helpers, taaki casinoEngine me mogambo na ho tab bhi chale
const localValidateBet = ({ side, selection, odds, stake }) => {
  const errors = [];
  if (!['back', 'lay'].includes(String(side || '').toLowerCase())) {
    errors.push('side must be back or lay');
  }
  if (
    selection === undefined ||
    selection === null ||
    String(selection).trim() === ''
  ) {
    errors.push('selection is required');
  }
  if (!Number.isFinite(odds) || odds <= 1)
    errors.push('odds must be greater than 1');
  if (!Number.isFinite(stake) || stake <= 0)
    errors.push('stake must be greater than 0');
  return errors;
};

// back: stake | lay: stake * (odds - 1)
const localCalcExposure = ({ side, stake, odds }) => {
  const exposure =
    String(side || '').toLowerCase() === 'lay' ? stake * (odds - 1) : stake;
  return Math.round(exposure * 100) / 100;
};

export const placeBet = async (req, res) => {
  const slug = String(req.params.slug || '')
    .trim()
    .toLowerCase();
  const userId = getUid(req);
  const { roundId, side, selection } = req.body || {};
  const odds = Number(req.body?.odds);
  const stake = Number(req.body?.stake);

  console.log('placeBet request:', {
    slug,
    userId,
    roundId,
    side,
    selection,
    odds,
    stake,
  });

  try {
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized user' });
    }

    if (!slug) {
      return res
        .status(400)
        .json({ success: false, message: 'Game slug is required' });
    }

    // engine.familyOf par block nahi karte. Provider hi decide karta hai
    // ki game valid hai ya nahi (fetchCasinoData + gtype check neeche).
    let family = null;
    try {
      family = engine.familyOf?.(slug) || null;
    } catch (e) {
      console.warn('engine.familyOf failed:', e.message);
    }
    console.log('family:', family || 'generic');

    if (selection === undefined || selection === null) {
      return res.status(400).json({
        success: false,
        message: 'selection is required',
      });
    }

    if (!Number.isFinite(odds) || !Number.isFinite(stake) || stake <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid odds or stake' });
    }

    // Engine validation use karo, par "Game not supported" error ignore karo
    let errors = localValidateBet({ side, selection, odds, stake });
    if (family && typeof engine.validateBet === 'function') {
      try {
        const engineErrors =
          engine.validateBet(slug, { side, selection, odds, stake }) || [];
        errors = engineErrors.filter((e) => !/not supported/i.test(String(e)));
      } catch (e) {
        console.warn('engine.validateBet failed:', e.message);
      }
    }
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: errors.join(', ') });
    }

    // Provider ka CURRENT round: { message, data: { mid, gtype, sub } }
    let providerResponse;
    try {
      providerResponse = await fetchCasinoData(slug);
    } catch (error) {
      console.error('Casino API error:', error);
      return res.status(503).json({
        success: false,
        message: 'Casino server unavailable. Please try again.',
      });
    }

    const liveData = pickLive(providerResponse);
    if (!liveData) {
      return res.status(503).json({
        success: false,
        message: 'Provider returned invalid casino data',
      });
    }

    if (liveData.gtype && String(liveData.gtype).toLowerCase() !== slug) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid casino game type' });
    }

    // Snapshot background me save hota hai (stats ke liye). Bet iske result par depend nahi karta.
    saveCasinoRoundSnapshot(slug, liveData).catch((e) =>
      console.warn('saveCasinoRoundSnapshot failed:', e.message)
    );

    // Bet hamesha provider ke CURRENT round par store hoti hai.
    // Client ka roundId ignore hota hai, isliye stale roundId se error nahi aata.
    const currentRoundId = String(liveData.mid);
    if (roundId && String(roundId) !== currentRoundId) {
      console.log('placeBet: client roundId stale, using live mid', {
        clientRoundId: String(roundId),
        currentRoundId,
      });
    }

    // Market live data se hi lo (Round collection ki zarurat nahi)
    const selectedMarket = liveData.sub?.find(
      (item) => String(item.sid ?? item.i) === String(selection)
    );

    if (!selectedMarket) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid selection for this round' });
    }

    // Sirf explicit band status reject hota hai. Unknown/missing gstatus allow hai.
    // Testing ke liye .env mein ALLOW_SUSPENDED_BETS=1 se ye check skip ho jata hai.
    const gs = String(selectedMarket.gstatus ?? '')
      .trim()
      .toUpperCase();
    const BLOCKED = ['SUSPENDED', 'CLOSED', 'INACTIVE', 'BALL RUNNING'];
    if (process.env.ALLOW_SUSPENDED_BETS !== '1' && BLOCKED.includes(gs)) {
      return res.status(400).json({
        success: false,
        message: 'This selection is suspended',
        selection: selectedMarket.nat || selectedMarket.sid,
        status: selectedMarket.gstatus || 'UNKNOWN',
      });
    }

    const minStake = Number(selectedMarket.min ?? 0);
    const maxStake = Number(selectedMarket.max ?? Infinity);

    if (stake < minStake || stake > maxStake) {
      return res.status(400).json({
        success: false,
        message: `Stake must be between ${minStake} and ${maxStake}`,
      });
    }

    // Production me client odds par bharosa mat karo; provider odds feed se verify karo.
    // await oddsService.assertOdds(slug, roundId, selection, side, odds);

    // Client sid bhejta hy; engine ko canonical selection key chahiye.
    const providerNat = selectedMarket.nat ?? selectedMarket.n;
    const selKey =
      natKey(family, providerNat, selectedMarket) || String(selection);

    let exposure = NaN;
    if (family && typeof engine.calcExposure === 'function') {
      try {
        exposure = engine.calcExposure({ side, stake, odds });
      } catch (e) {
        console.warn('engine.calcExposure failed:', e.message);
      }
    }
    if (!Number.isFinite(exposure) || exposure <= 0) {
      exposure = localCalcExposure({ side, stake, odds });
    }
    if (!Number.isFinite(exposure) || exposure <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid bet exposure' });
    }

    // Atomic debit
    const debited = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: exposure } },
      { $inc: { balance: -exposure } },
      { new: true }
    );

    if (!debited) {
      return res
        .status(400)
        .json({ success: false, message: 'Insufficient balance' });
    }

    let bet;
    try {
      bet = await Bet.create({
        userId,
        slug,
        roundId: currentRoundId,
        side,
        selection: selKey,
        sid: String(selection),
        nation: String(
          providerNat ||
            (family === 'matka'
              ? `Single ${Number(selectedMarket.sr) % 10}`
              : selKey)
        ),
        odds,
        stake,
        exposure,
        status: 'pending',
      });
    } catch (error) {
      // Bet insert fail hua to balance wapas
      await User.updateOne({ _id: userId }, { $inc: { balance: exposure } });
      throw error;
    }

    // Account statement (betHistoryModel, gameName 'Casino') me mirror row —
    // statement isi model se padhta hy, CasinoBet model se nahi.
    await betHistoryModel
      .create({
        betId: bet._id.toString(),
        userId: String(userId),
        userName: debited.userName ?? String(userId),
        gameId: slug,
        roundId: String(currentRoundId),
        otype: side,
        price: odds,
        xValue: 0,
        betAmount: stake,
        status: 0,
        eventName: slug,
        marketName: selKey,
        teamName: String(providerNat ?? selKey),
        gameType: 'casino',
        gameName: 'Casino',
      })
      .catch((e) => console.error('casino history mirror create:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet,
      balance: debited.balance,
      roundId: currentRoundId,
      latestProviderRoundId: currentRoundId,
    });
  } catch (error) {
    console.error('placeBet error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ======================================================================
// settle core (shared by manual, API and poller)
//
// Round pe koi "settled" lock nahi hai. Double-credit se bachav per-bet hai:
// pending -> settled claim sirf ek baar succeed hota hai. Isse agar crash ya
// kisi bet ka settle fail ho, to agli poll me wo bet dobara try hoti hai.
// ======================================================================
const settleCore = async (slug, roundId, result) => {
  roundId = String(roundId);

  // Round ka result save karo (void round ko overwrite nahi karte)
  await Round.updateOne(
    { slug, roundId, 'result.void': { $ne: true } },
    { $set: { status: 'settled', result }, $setOnInsert: { slug, roundId } },
    { upsert: true }
  ).catch((e) => {
    if (e.code !== 11000) throw e; // duplicate (void round already exists) -> ignore
  });

  const cursor = Bet.find({ slug, roundId, status: 'pending' }).cursor();
  let settled = 0;
  let failed = 0;

  for await (const bet of cursor) {
    try {
      const selOutcome = engine.evaluateSelection(slug, bet.selection, result);
      const s = engine.settleBet(bet, selOutcome);

      // pending -> settled is the idempotency guard (credit only once)
      const claimed = await Bet.findOneAndUpdate(
        { _id: bet._id, status: 'pending' },
        {
          status: 'settled',
          outcome: s.outcome,
          payout: s.payout,
          net: s.net,
          settledAt: new Date(),
        }
      );
      if (claimed && s.payout > 0) {
        await User.updateOne(
          { _id: bet.userId },
          { $inc: { balance: s.payout } }
        );
      }
      if (claimed) {
        await betHistoryModel
          .updateOne(
            { betId: bet._id.toString() },
            {
              $set: {
                status: s.net > 0 ? 1 : s.net < 0 ? 2 : 1,
                betResult:
                  s.outcome === 'win'
                    ? 'WON'
                    : s.outcome === 'push'
                      ? 'PUSH'
                      : s.outcome === 'half_loss'
                        ? 'HALF LOSS'
                        : 'LOST',
                profitLossChange: s.net,
                resultAmount: Math.abs(s.net),
                settledBy: 'api',
                settledAt: new Date(),
              },
            }
          )
          .catch((e) =>
            console.error('casino history mirror settle:', e.message)
          );
      }
      settled++;
    } catch (e) {
      failed++;
      console.error(`settle failed for bet ${bet._id}:`, e.message);
    }
  }
  return { settled, failed };
};

// Ek bet ko void karke exposure refund (voidRound aur stale refund dono use karte hain)
const voidBet = async (bet) => {
  const claimed = await Bet.findOneAndUpdate(
    { _id: bet._id, status: 'pending' },
    { status: 'void', payout: bet.exposure, net: 0, settledAt: new Date() }
  );
  if (claimed) {
    await User.updateOne(
      { _id: bet.userId },
      { $inc: { balance: bet.exposure } }
    );
    await betHistoryModel
      .updateOne(
        { betId: bet._id.toString() },
        {
          $set: {
            status: 3,
            betResult: 'VOID',
            profitLossChange: 0,
            resultAmount: 0,
            settledBy: 'api',
            settledAt: new Date(),
          },
        }
      )
      .catch((e) => console.error('casino history mirror void:', e.message));
    return true;
  }
  return false;
};

// Manual settle: body { roundId, result }
export const settleRound = async (req, res) => {
  const { slug } = req.params;
  const { roundId, result } = req.body;
  try {
    if (!roundId || !result) {
      return res
        .status(400)
        .json({ success: false, message: 'roundId and result required' });
    }
    const out = await settleCore(slug, roundId, result);
    return res.json({ success: true, ...out });
  } catch (err) {
    console.error('settleRound error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Auto settle from RESULT API: body { roundId }
export const settleRoundFromApi = async (req, res) => {
  const { slug } = req.params;
  const { roundId } = req.body;
  try {
    if (!roundId)
      return res
        .status(400)
        .json({ success: false, message: 'roundId required' });

    let list;
    try {
      list = await fetchCasinoResult(slug);
    } catch {
      return res
        .status(503)
        .json({ success: false, message: 'Result API unavailable' });
    }

    const rows = resultRows(list);
    const row = rows.find((r) => String(r.mid) === String(roundId));
    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: 'Result not available yet' });
    }

    const out = await settleCore(
      slug,
      roundId,
      normalizeResult(slug, row, rows)
    );
    return res.json({ success: true, ...out });
  } catch (err) {
    console.error('settleRoundFromApi error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ======================================================================
// Auto poller: har 1 minute, saare games (slugs) jinki pending bets hain.
// Server start par ek baar call karo: startResultPoller();
// ======================================================================
export const startResultPoller = (everyMs = 60 * 1000) => {
  let busy = false;

  const tick = async () => {
    if (busy) return;
    busy = true;
    try {
      const slugs = await Bet.distinct('slug', { status: 'pending' });

      for (const slug of slugs) {
        try {
          const pending = (
            await Bet.distinct('roundId', { slug, status: 'pending' })
          ).map(String);
          if (!pending.length) continue;

          const list =
            engine.familyOf(slug) === 'matka'
              ? await fetchDatedCasinoResult(slug).catch(() => [])
              : resultRows(await fetchCasinoResult(slug)); // newest first
          for (const row of list) {
            if (!pending.includes(String(row.mid))) continue;
            try {
              await settleCore(slug, row.mid, normalizeResult(slug, row, list));
            } catch (e) {
              console.error(`poller settle ${slug}/${row.mid}:`, e.message);
            }
          }
        } catch (e) {
          // ek slug fail ho to baaki chalte rahein
          console.error(`poller ${slug}:`, e.message);
        }
      }

      // Result API me jo round ab nahi dikhta uski purani pending bets refund
      if (STALE_BET_MINUTES > 0) {
        const cutoff = new Date(Date.now() - STALE_BET_MINUTES * 60 * 1000);
        const stale = await Bet.find({
          status: 'pending',
          createdAt: { $lt: cutoff },
        });
        let refunded = 0;
        for (const bet of stale) {
          if (await voidBet(bet)) refunded++;
        }
        if (refunded)
          console.log(`poller: auto-refunded ${refunded} stale bets`);
      }
    } catch (e) {
      console.error('poller error:', e.message);
    } finally {
      busy = false;
    }
  };

  tick(); // start par ek baar turant
  return setInterval(tick, everyMs);
};

// ======================================================================
// void / refund round
// ======================================================================
export const voidRound = async (req, res) => {
  const { slug } = req.params;
  const roundId = String(req.body.roundId ?? '');
  try {
    if (!roundId)
      return res
        .status(400)
        .json({ success: false, message: 'roundId required' });

    const bets = await Bet.find({ slug, roundId, status: 'pending' });
    let refunded = 0;
    for (const bet of bets) {
      if (await voidBet(bet)) refunded++;
    }
    await Round.updateOne(
      { slug, roundId },
      {
        $set: { status: 'settled', result: { void: true } },
        $setOnInsert: { slug, roundId },
      },
      { upsert: true }
    );
    return res.json({ success: true, refunded });
  } catch (err) {
    console.error('voidRound error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ======================================================================
// nation book / my bets / stats
// ======================================================================
export const getNationBook = async (req, res) => {
  try {
    const { slug, roundId } = req.params;
    const bets = await Bet.find({
      slug,
      roundId: String(roundId),
      userId: getUid(req),
      status: 'pending',
    }).lean();
    const book = engine.nationBook(slug, bets, engine.defaultScenarios(slug));
    res.json({ success: true, book });
  } catch (err) {
    console.error('getNationBook error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Frontend isko har 30-60 sec me poll kare. Har bet me `result` aata hai:
// pending | win | lose | push | void
export const myBets = async (req, res) => {
  try {
    const { slug } = req.params;
    const bets = await Bet.find({ userId: getUid(req), slug })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({
      success: true,
      bets: bets.map((b) => ({
        ...b,
        teamName: b.nation || b.selection,
        result: betResult(b),
      })),
    });
  } catch (err) {
    console.error('myBets error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStats = async (req, res) => {
  try {
    const { slug } = req.params;
    const rounds = await Round.find({
      slug,
      status: 'settled',
      'result.void': { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const fam = engine.familyOf(slug);
    const rs = rounds.map((r) => r.result);

    if (fam === 'baccarat') {
      return res.json(
        engine.baccaratStats(
          rs.map((r) =>
            r.playerPoints > r.bankerPoints
              ? 'p'
              : r.playerPoints < r.bankerPoints
                ? 'b'
                : 't'
          )
        )
      );
    }
    if (fam === 'dt') {
      return res.json(
        engine.dragonTigerStats(
          rs
            .reverse()
            .map((r) =>
              r.dragon.rank > r.tiger.rank
                ? 'D'
                : r.dragon.rank < r.tiger.rank
                  ? 'T'
                  : 'TIE'
            )
        )
      );
    }
    if (fam === 'lucky7') {
      // result API gives win codes (no card) -> use side if rank missing
      return res.json(
        engine.lucky7Stats(rs.map((r) => r.card?.rank ?? r.side))
      );
    }
    if (fam === 'roulette')
      return res.json(engine.rouletteStats(rs.map((r) => r.number)));
    res.json({});
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ======================================================================
// GET ALL BETS (ADMIN)
// ======================================================================

export const getAllBets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      slug,
      status,
      roundId,
      userId,
      side,
      search,
      startDate,
      endDate,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (currentPage - 1) * perPage;

    // Dynamic filters
    const filter = {};

    if (slug) {
      filter.slug = String(slug).trim().toLowerCase();
    }

    if (status) {
      filter.status = String(status).trim().toLowerCase();
    }

    if (roundId) {
      filter.roundId = String(roundId);
    }

    if (userId) {
      filter.userId = userId;
    }

    if (side) {
      filter.side = String(side).toLowerCase();
    }

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by bet ID, round ID, user ID or selection
    if (search) {
      const searchRegex = new RegExp(
        String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter.$or = [
        { roundId: searchRegex },
        { slug: searchRegex },
        { selection: searchRegex },
      ];

      if (/^[a-f\d]{24}$/i.test(String(search))) {
        filter.$or.push({ _id: search });
        filter.$or.push({ userId: search });
      }
    }

    const [bets, totalBets, summary] = await Promise.all([
      Bet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),

      Bet.countDocuments(filter),

      Bet.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalStake: { $sum: '$stake' },
            totalExposure: { $sum: '$exposure' },
            totalPayout: { $sum: '$payout' },
            totalNet: { $sum: '$net' },
            totalBets: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = summary[0] || {
      totalStake: 0,
      totalExposure: 0,
      totalPayout: 0,
      totalNet: 0,
      totalBets: 0,
    };

    return res.status(200).json({
      success: true,
      message: 'All bets fetched successfully',
      data: bets.map((b) => ({ ...b, result: betResult(b) })),
      pagination: {
        totalBets,
        currentPage,
        limit: perPage,
        totalPages: Math.ceil(totalBets / perPage),
        hasNextPage: currentPage < Math.ceil(totalBets / perPage),
        hasPrevPage: currentPage > 1,
      },
      summary: stats,
    });
  } catch (error) {
    console.error('getAllBets error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bets',
      error: error.message,
    });
  }
};
