import axios from 'axios';

import redis, { connectRedis } from '../config/redis.js';
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
// "257  -  4  -  GULF CLOSE" -> { pana:'257', digit:4, bazaar:'GULF', kind:'CLOSE' }
const parseMatkaNat = (nat) => {
  if (typeof nat !== 'string') return null;
  const parts = nat.split('-').map((p) => p.trim());
  const pana = parts[0];
  const digit = Number(parts[1]);
  const rest = parts.slice(2).join(' ');
  const kindM = rest.match(/^(.*)\s+(OPEN|CLOSE)$/i);
  if (!/^\d{3}$/.test(pana) || !Number.isFinite(digit) || !kindM) return null;
  return {
    pana,
    digit,
    bazaar: kindM[1].trim() || rest,
    kind: kindM[2].toUpperCase(),
  };
};

const normalizeResult = (slug, row, list = []) => {
  const fam = engine.familyOf(slug);
  const w = String(row?.win);
  if (fam === 'matka') {
    const m = parseMatkaNat(row?.nat);
    if (!m) throw new Error(`unparseable matka result: ${row?.nat}`);
    return m.kind === 'OPEN'
      ? { open: m.digit, openPana: m.pana }
      : { close: m.digit, closePana: m.pana };
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
// Matka local markets: provider sids nahi deta, payout table hamari taraf se
// (reference sections boards: single 9.5, sp 140, dp 240, tp 700; jodi 95).
const LOCAL_MATKA_ODDS = {
  single: 9.5,
  jodi: 95,
  sp: 140,
  pana: 140,
  dp: 240,
  tp: 700,
  trio: 700,
  cycle: 9.5,
  motor: 9.5,
  chart56: 9.5,
  chart64: 9.5,
  abr: 9.5,
  commonsp: 9.5,
  commondp: 9.5,
  colordp: 9.5,
};
const LOCAL_MATKA_LABEL = (sel) => {
  const [k, arg] = String(sel).split(':');
  const names = {
    single: 'Single',
    jodi: 'Jodi',
    sp: 'SP',
    dp: 'DP',
    tp: 'Triple Patti',
    trio: 'Trio',
    pana: 'SP Patti',
    cycle: 'Cycle',
    motor: 'Motor SP',
    chart56: '56 Charts',
    chart64: '64 Charts',
    abr: 'ABR',
    commonsp: 'Common SP',
    commondp: 'Common DP',
    colordp: 'Color DP',
  };
  return `${names[k] || k} ${arg ?? ''}`.trim();
};
const parseCardRank = (tok) => {
  const t = String(tok ?? '')
    .trim()
    .toLowerCase();
  if (t === 'a' || t === 'ace') return 1;
  if (t === 'j' || t === 'jack') return 11;
  if (t === 'q' || t === 'queen') return 12;
  if (t === 'k' || t === 'king') return 13;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const natKey = (fam, nat, market = null) => {
  if (fam === 'matka') {
    const sid = Number(market?.sid ?? market?.i);
    const sr = Number(market?.sr);
    if (sid >= 1 && sid <= 10 && Number.isFinite(sr)) {
      return `single:${sr % 10}`;
    }
    if (sid === 11) return 'single:line1';
    if (sid === 12) return 'single:line2';
    if (sid === 13) return 'single:odd';
    if (sid === 14) return 'single:even';
    return null;
  }
  const n = String(nat ?? '')
    .trim()
    .toLowerCase();
  if (!n || n === 'undefined') return null;
  const cardM = n.match(/^card\s+([a-z0-9]+)$/);
  switch (fam) {
    case 'lucky7': {
      if (n === 'low card') return 'low';
      if (n === 'high card') return 'high';
      if (n === 'card 7') return 'seven';
      if (['even', 'odd', 'red', 'black'].includes(n)) return n;
      const lm = n.match(/^line\s*([1-4])$/);
      if (lm) return `group:${lm[1]}`;
      if (cardM) {
        const r = parseCardRank(cardM[1]);
        return r ? `card:${r}` : null;
      }
      return null;
    }
    case 'aaa': {
      if (
        ['amar', 'akbar', 'anthony', 'even', 'odd', 'red', 'black'].includes(n)
      )
        return n;
      if (n === 'under 7' || n === 'under7') return 'under7';
      if (n === 'over 7' || n === 'over7') return 'over7';
      if (cardM) {
        const r = parseCardRank(cardM[1]);
        return r ? `card:${r}` : null;
      }
      return null;
    }
    case 'dt': {
      if (['dragon', 'tiger', 'tie', 'pair'].includes(n)) return n;
      if (n === 'suited tie') return 'suitedtie';
      const dtm = n.match(
        /^(dragon|tiger)\s+(even|odd|red|black|spade|heart|diamond|club)$/
      );
      if (dtm) {
        const [, who, prop] = dtm;
        if (prop === 'even' || prop === 'odd') return `parity:${who}:${prop}`;
        if (prop === 'red' || prop === 'black') return `color:${who}:${prop}`;
        return `suit:${who}:${prop}`;
      }
      return null;
    }
    case 'baccarat':
      if (['player', 'banker', 'tie'].includes(n)) return n;
      if (n === 'player pair') return 'playerPair';
      if (n === 'banker pair') return 'bankerPair';
      if (n === 'either pair') return 'eitherPair';
      if (n === 'perfect pair') return 'perfectPair';
      if (n === 'big') return 'big';
      if (n === 'small') return 'small';
      return null;
    case 'teen':
    case 'muflis': {
      const m = n.match(
        /^(player|pair plus|total|3 baccarat|m baccarat|top 9|black|red)\s+([ab])$/
      );
      if (m) {
        const who = m[2].toUpperCase();
        if (m[1] === 'player') return who === 'A' ? 'playerA' : 'playerB';
        if (m[1] === 'pair plus') return `pairplus:${who}`;
        if (m[1] === 'total') return `total:${who}`;
        if (m[1] === '3 baccarat' || m[1] === 'm baccarat')
          return `baccarat:${who}`;
        if (m[1] === 'top 9') return `top9:${who}`;
        if (m[1] === 'black') return `redblack:black`;
        if (m[1] === 'red') return `redblack:red`;
      }
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
  const { roundId, side } = req.body || {};
  let selection = req.body?.selection;
  let odds = Number(req.body?.odds);
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
        errors = engineErrors.filter(
          (e) =>
            !/not supported/i.test(String(e)) &&
            !/stake must be between/i.test(String(e))
        );
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
    if (family === 'matka') {
      const s = String(selection).trim();
      if (/^\d+\s*single$/i.test(s) || /^single\s*[-:]?\s*\d+$/i.test(s)) {
        selection = `single:${s.replace(/\D/g, '')}`;
      } else if (/line\s*1/i.test(s)) {
        selection = 'single:line1';
      } else if (/line\s*2/i.test(s)) {
        selection = 'single:line2';
      } else if (/odd/i.test(s)) {
        selection = 'single:odd';
      } else if (/even/i.test(s)) {
        selection = 'single:even';
      } else if (/jodi\s*[-:]?\s*(\d+)/i.test(s)) {
        selection = `jodi:${s.replace(/\D/g, '')}`;
      } else if (
        /pana\s*[-:]?\s*(\d+)/i.test(s) ||
        /sp\s*[-:]?\s*(\d+)/i.test(s)
      ) {
        selection = `sp:${s.replace(/\D/g, '')}`;
      } else if (/dp\s*[-:]?\s*(\d+)/i.test(s)) {
        selection = `dp:${s.replace(/\D/g, '')}`;
      } else if (
        /trio\s*[-:]?\s*(\d+)/i.test(s) ||
        /tp\s*[-:]?\s*(\d+)/i.test(s)
      ) {
        selection = `tp:${s.replace(/\D/g, '')}`;
      }
    }

    const normNat = (v) =>
      String(v || '')
        .trim()
        .toLowerCase();
    const reqNation = req.body?.nation;
    let selectedMarket =
      (reqNation &&
        liveData.sub?.find(
          (item) =>
            String(item.sid ?? item.i) === String(selection) &&
            normNat(item.nat ?? item.n ?? item.name) === normNat(reqNation)
        )) ||
      liveData.sub?.find(
        (item) => String(item.sid ?? item.i) === String(selection)
      );

    // Matka local markets (jodi/pana/sp/dp/trio/cycle/motor/charts/abr): selection logic hamare end pe —
    // provider sub me inke sids nahi hote, odds/limits local payout table se.
    const localMatka =
      !selectedMarket &&
      family === 'matka' &&
      /^(single|jodi|sp|dp|tp|trio|pana|cycle|motor|chart56|chart64|abr|commonsp|commondp|colordp):/.test(
        String(selection)
      );
    if (localMatka) {
      const key = String(selection).split(':')[0];
      odds = LOCAL_MATKA_ODDS[key] || 9.5; // server-authoritative payout rate
      selectedMarket = {
        sid: String(selection),
        nat: LOCAL_MATKA_LABEL(String(selection)),
        b: odds,
        gstatus: 'OPEN',
        min: 10,
        max: 20000,
      };
    }

    if (!selectedMarket) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid selection for this round' });
    }

    // D247 exact open/suspend gate (provider open markets on dt6/vdt6/aaa send visible:0, so only gstatus + odds gate)
    const rawGs = selectedMarket.gstatus ?? selectedMarket.status;
    const marketOpen = isActive(rawGs);
    if (process.env.ALLOW_SUSPENDED_BETS !== '1' && !marketOpen) {
      return res.status(400).json({
        success: false,
        message: 'This selection is suspended',
        selection: selectedMarket.nat || selectedMarket.sid,
        status: rawGs || 'SUSPENDED',
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

    // Client sid/nat bhejta hy; engine ko canonical selection key chahiye.
    const providerNat = selectedMarket.nat ?? selectedMarket.n;
    const selKey =
      natKey(family, providerNat, selectedMarket) || String(selection);

    // Authoritative live odds check (D247 rule: no bet on 0/missing rate;
    // no Lay on Back-only or half-loss markets)
    const sideLower = String(side || '').toLowerCase();
    const rawProviderOdds =
      sideLower === 'lay'
        ? (selectedMarket.l ?? selectedMarket.lay)
        : (selectedMarket.b ?? selectedMarket.back ?? selectedMarket.odds);
    const providerOdds = Number(rawProviderOdds);
    if (sideLower === 'lay') {
      if (!Number.isFinite(providerOdds) || providerOdds <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Lay betting is not available on this selection',
        });
      }
      if (engine.isHalfLossMarket?.(slug, selKey)) {
        return res.status(400).json({
          success: false,
          message: 'Lay not allowed on half-loss markets',
        });
      }
      odds = providerOdds;
    } else if (!localMatka) {
      // worli3 live feed sends b:0 with OPEN status (Matka local rate 9.5)
      if (family === 'matka' && !(providerOdds > 1)) {
        odds = LOCAL_MATKA_ODDS.single;
      } else if (!Number.isFinite(providerOdds) || providerOdds <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Betting odds are currently closed',
        });
      } else {
        odds = providerOdds;
      }
    }

    let exposure = NaN;
    if (family && typeof engine.calcExposure === 'function') {
      try {
        exposure = engine.calcExposure({ side: sideLower, stake, odds });
      } catch (e) {
        console.warn('engine.calcExposure failed:', e.message);
      }
    }
    if (!Number.isFinite(exposure) || exposure <= 0) {
      exposure = localCalcExposure({ side: sideLower, stake, odds });
    }
    if (!Number.isFinite(exposure) || exposure <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid bet exposure' });
    }

    // D247 Exchange Back/Lay hedging: same round ke existing pending bets ke saath
    // worst-case round exposure calculate karo aur sirf delta balance se adjust karo.
    const existingRoundBets = await Bet.find({
      userId,
      slug,
      roundId: currentRoundId,
      status: 'pending',
    })
      .select('slug roundId side selection odds stake exposure')
      .lean();
    const oldRoundExposure = engine.calcRoundExposure(slug, existingRoundBets);
    const newRoundExposure = engine.calcRoundExposure(slug, [
      ...existingRoundBets,
      {
        slug,
        roundId: currentRoundId,
        side: sideLower,
        selection: selKey,
        odds,
        stake,
        exposure,
      },
    ]);
    const deltaExposure =
      Math.round((newRoundExposure - oldRoundExposure + Number.EPSILON) * 100) /
      100;

    // Atomic wallet update: agar hedge hone se risk ghat raha hy (delta <= 0)
    // to main balance nahi katta balki locked exposure wapas avbalance me release hota hy.
    const balanceFilter =
      deltaExposure > 0
        ? {
            _id: userId,
            $or: [
              { avbalance: { $gte: deltaExposure } },
              {
                avbalance: { $exists: false },
                balance: { $gte: deltaExposure },
              },
            ],
          }
        : { _id: userId };

    const debited = await User.findOneAndUpdate(
      balanceFilter,
      { $inc: { avbalance: -deltaExposure, exposure: deltaExposure } },
      { new: true }
    );

    if (!debited) {
      return res
        .status(400)
        .json({ success: false, message: 'Insufficient balance' });
    }

    const nationLabel = String(
      providerNat ||
        (family === 'matka'
          ? `Single ${Number(selectedMarket.sr) % 10}`
          : req.body?.nation || selKey)
    );

    let bet;
    try {
      bet = await Bet.create({
        userId,
        slug,
        roundId: currentRoundId,
        side: sideLower,
        selection: selKey,
        sid: String(selection),
        nation: nationLabel,
        odds,
        stake,
        exposure,
        status: 'pending',
      });
    } catch (error) {
      // Bet insert fail hua to avbalance/exposure delta wapas
      await User.updateOne(
        { _id: userId },
        { $inc: { avbalance: deltaExposure, exposure: -deltaExposure } }
      );
      throw error;
    }

    // Account statement & CurrentBets (betHistoryModel, gameName 'Casino') mirror row
    await betHistoryModel
      .create({
        betId: bet._id.toString(),
        userId: String(userId),
        userName: debited.userName ?? String(userId),
        gameId: slug,
        roundId: String(currentRoundId),
        otype: side,
        price: stake,
        xValue: odds,
        betAmount: exposure,
        status: 0,
        eventName: slug,
        marketName: String(selectedMarket.mname || 'WINNER'),
        teamName: nationLabel,
        gameType: 'casino',
        gameName: 'Casino',
      })
      .catch((e) => console.error('casino history mirror create:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet,
      balance: debited.avbalance ?? debited.balance,
      exposure: debited.exposure ?? 0,
      roundId: currentRoundId,
      latestProviderRoundId: currentRoundId,
    });
  } catch (error) {
    console.error('placeBet error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + (error?.message || error),
    });
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

  const existingRound = await Round.findOne({ slug, roundId }).lean();
  const enrichedResult = {
    ...result,
    card: result?.card || existingRound?.marketData?.card || '',
    rdesc: result?.rdesc || existingRound?.marketData?.rdesc || '',
  };

  // Round ka result save karo (void round ko overwrite nahi karte)
  await Round.updateOne(
    { slug, roundId, 'result.void': { $ne: true } },
    {
      $set: { status: 'settled', result: enrichedResult },
      $setOnInsert: { slug, roundId },
    },
    { upsert: true }
  ).catch((e) => {
    if (e.code !== 11000) throw e; // duplicate (void round already exists) -> ignore
  });

  const pendingAll = await Bet.find({
    slug,
    roundId,
    status: 'pending',
  }).lean();
  const byUser = new Map();
  for (const bet of pendingAll) {
    const uid = String(bet.userId);
    if (!byUser.has(uid)) byUser.set(uid, []);
    byUser.get(uid).push(bet);
  }

  const r2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
  let settled = 0;
  let failed = 0;

  for (const [uid, userBets] of byUser.entries()) {
    const roundExpBefore = engine.calcRoundExposure(slug, userBets);
    const settledEntries = [];
    const settledIds = new Set();

    for (const bet of userBets) {
      try {
        const selOutcome = engine.evaluateSelection(
          slug,
          bet.selection,
          enrichedResult
        );
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
        if (claimed) {
          settledIds.add(String(bet._id));
          settledEntries.push({ bet, s });
          settled++;
        }
      } catch (e) {
        failed++;
        console.error(`settle failed for bet ${bet._id}:`, e.message);
      }
    }

    if (!settledEntries.length) continue;

    const remainingPending = userBets.filter(
      (b) => !settledIds.has(String(b._id))
    );
    const roundExpAfter = engine.calcRoundExposure(slug, remainingPending);
    const exposureRelease = r2(roundExpBefore - roundExpAfter);
    const totalNet = r2(
      settledEntries.reduce((sum, entry) => sum + Number(entry.s.net || 0), 0)
    );
    const avbalanceDelta = r2(totalNet + exposureRelease);

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $inc: {
          balance: totalNet,
          exposure: -exposureRelease,
          avbalance: avbalanceDelta,
        },
      },
      { new: true }
    );

    const finalBal = Number(updatedUser?.balance ?? 0);
    let runningBal = r2(finalBal - totalNet);
    for (const { bet, s } of settledEntries) {
      const beforeBal = runningBal;
      runningBal = r2(runningBal + Number(s.net || 0));
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
              balanceBeforeSettlement: beforeBal,
              balanceAfterSettlement: runningBal,
              settledBy: 'api',
              settledAt: new Date(),
            },
          }
        )
        .catch((e) =>
          console.error('casino history mirror settle:', e.message)
        );
    }
  }
  return { settled, failed };
};

// Ek bet ko void karke netted exposure refund (voidRound aur stale refund dono use karte hain)
const voidBet = async (bet) => {
  const roundPendingBefore = await Bet.find({
    userId: bet.userId,
    slug: bet.slug,
    roundId: bet.roundId,
    status: 'pending',
  })
    .select('slug roundId side selection odds stake exposure')
    .lean();
  const expBefore = engine.calcRoundExposure(bet.slug, roundPendingBefore);

  const claimed = await Bet.findOneAndUpdate(
    { _id: bet._id, status: 'pending' },
    { status: 'void', payout: bet.exposure, net: 0, settledAt: new Date() }
  );
  if (claimed) {
    const remaining = roundPendingBefore.filter(
      (b) => String(b._id) !== String(bet._id)
    );
    const expAfter = engine.calcRoundExposure(bet.slug, remaining);
    const exposureRelease =
      Math.round((expBefore - expAfter + Number.EPSILON) * 100) / 100;

    await User.updateOne(
      { _id: bet.userId },
      { $inc: { exposure: -exposureRelease, avbalance: exposureRelease } }
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
// Redis-backed result helpers + fast per-slug settlement
// ======================================================================
const CASINO_RESULT_TTL = Number(process.env.CASINO_RESULT_TTL) || 5;
const CASINO_SETTLE_POLL_MS =
  Number(process.env.CASINO_SETTLE_POLL_MS) || 5 * 1000;
const slugSettleInflight = new Map();

const getTodayDateStr = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
};

const readRedisJson = async (key) => {
  try {
    await connectRedis();
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeRedisJson = async (key, data, ttl = CASINO_RESULT_TTL) => {
  try {
    if (data === undefined || data === null) return;
    await connectRedis();
    await redis.set(key, JSON.stringify(data), { EX: ttl });
  } catch {
    // ignore redis errors — live settlement still continues
  }
};

const getCachedOrFetchCasinoResult = async (slug) => {
  const key = `casino:result:${slug}`;
  const cached = await readRedisJson(key);
  const cachedRows = resultRows(cached);
  if (cachedRows.length) return cachedRows;

  const rows = await fetchCasinoResult(slug);
  await writeRedisJson(key, { res: rows }, CASINO_RESULT_TTL);
  return rows;
};

const getCachedOrFetchDatedResult = async (slug) => {
  const date = getTodayDateStr();
  const key = `casino:direct-result-by-date:${date}:${slug}`;
  const cached = await readRedisJson(key);
  const cachedRows = Array.isArray(cached?.data)
    ? cached.data
    : Array.isArray(cached)
      ? cached
      : null;
  if (cachedRows) return cachedRows;

  const rows = await fetchDatedCasinoResult(slug);
  await writeRedisJson(
    key,
    { date, eventName: slug, data: rows },
    CASINO_RESULT_TTL
  );
  return rows;
};

/**
 * Check if `slug` has any pending CasinoBet rows; if yes, settle matching rounds
 * immediately using any passed WS/REST result hints or 5s Redis result cache.
 */
export const settlePendingForSlug = (
  slug,
  { resultRowsHint = null, datedRowsHint = null } = {}
) => {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase();
  if (!cleanSlug) return Promise.resolve({ settled: 0, skipped: true });
  if (slugSettleInflight.has(cleanSlug))
    return slugSettleInflight.get(cleanSlug);

  const task = (async () => {
    try {
      const pending = (
        await Bet.distinct('roundId', { slug: cleanSlug, status: 'pending' })
      ).map(String);
      if (!pending.length) return { settled: 0, skipped: true };

      let settledCount = 0;
      const isMatka = engine.familyOf(cleanSlug) === 'matka';

      if (isMatka) {
        const rows = Array.isArray(datedRowsHint)
          ? datedRowsHint
          : await getCachedOrFetchDatedResult(cleanSlug).catch(() => []);
        const byBazaar = {};
        for (const row of rows) {
          const m = parseMatkaNat(row?.nat);
          if (!m) continue;
          byBazaar[m.bazaar] = byBazaar[m.bazaar] || {};
          byBazaar[m.bazaar][m.kind] = { mid: String(row.mid), ...m };
        }
        for (const pair of Object.values(byBazaar)) {
          const result = {
            open: pair.OPEN?.digit,
            close: pair.CLOSE?.digit,
            openPana: pair.OPEN?.pana,
            closePana: pair.CLOSE?.pana,
          };
          for (const kind of ['OPEN', 'CLOSE']) {
            const mid = pair[kind]?.mid;
            if (!mid || !pending.includes(mid)) continue;
            try {
              const out = await settleCore(cleanSlug, mid, result);
              settledCount += out.settled;
            } catch (e) {
              console.error(`poller settle ${cleanSlug}/${mid}:`, e.message);
            }
          }
        }
        return { settled: settledCount };
      }

      // Refresh live snapshot while bets are pending so final dealt cards/rdesc are captured
      try {
        const liveResp = await getCasinoTable(cleanSlug, 0);
        const liveD = pickLive(liveResp);
        if (liveD?.mid) await saveCasinoRoundSnapshot(cleanSlug, liveD);
      } catch {
        /* best-effort snapshot refresh */
      }

      const [listRaw, datedRows] = await Promise.all([
        Array.isArray(resultRowsHint)
          ? Promise.resolve(resultRowsHint)
          : getCachedOrFetchCasinoResult(cleanSlug).catch(() => []),
        Array.isArray(datedRowsHint)
          ? Promise.resolve(datedRowsHint)
          : getCachedOrFetchDatedResult(cleanSlug).catch(() => []),
      ]);
      const list = resultRows(listRaw);

      for (const row of list) {
        const midStr = String(row?.mid ?? '');
        if (!midStr || !pending.includes(midStr)) continue;
        try {
          const norm = normalizeResult(cleanSlug, row, list);
          const datedMatch = datedRows.find((d) => String(d.mid) === midStr);
          if (datedMatch?.nat) norm.datedNat = datedMatch.nat;
          const out = await settleCore(cleanSlug, midStr, norm);
          settledCount += out.settled;
        } catch (e) {
          console.error(`poller settle ${cleanSlug}/${midStr}:`, e.message);
        }
      }

      return { settled: settledCount };
    } catch (e) {
      console.error(`settlePendingForSlug ${cleanSlug}:`, e.message);
      return { settled: 0, error: e.message };
    } finally {
      slugSettleInflight.delete(cleanSlug);
    }
  })();

  slugSettleInflight.set(cleanSlug, task);
  return task;
};

// ======================================================================
// Auto poller: har 5 seconds, saare games (slugs) jinki pending bets hain.
// Redis result cache reuse karta hai + WS/REST updates par turant bhi trigger hota hai.
// ======================================================================
export const startResultPoller = (everyMs = CASINO_SETTLE_POLL_MS) => {
  let busy = false;
  let lastStaleSweepAt = 0;

  const tick = async () => {
    if (busy) return;
    busy = true;
    try {
      const slugs = await Bet.distinct('slug', { status: 'pending' });
      if (slugs.length) {
        await Promise.all(slugs.map((slug) => settlePendingForSlug(slug)));
      }

      // Result API me jo round ab nahi dikhta uski purani pending bets refund (every 60s)
      const now = Date.now();
      if (STALE_BET_MINUTES > 0 && now - lastStaleSweepAt >= 60 * 1000) {
        lastStaleSweepAt = now;
        const cutoff = new Date(now - STALE_BET_MINUTES * 60 * 1000);
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
