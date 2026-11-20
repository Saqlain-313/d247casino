import axios from 'axios';

import redis, { connectRedis } from '../config/redis.js';
import betHistoryModel from '../models/betHistoryModel.js';
import Bet from '../models/CasinoBet.js';
import Round from '../models/CasinoRound.js';
import User from '../models/subAdminModel.js'; // existing User model (numeric `balance`) - adjust path
import * as engine from '../services/casinoEngine.js';
import {
  findStoredResultsForSlug,
  saveCasinoResults,
} from '../services/casinoResultStore.js';
import { saveCasinoRoundSnapshot } from '../services/casinoRoundSync.js';
import { getCasinoTable } from '../services/casinoTableCache.js';

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const DEBUG = process.env.CASINO_DEBUG === '1';

// Itni der (minutes) se pending bet ko auto-refund kar diya jayega
// (result API sirf latest rounds deta hai, purane round ka result nahi milta). 0 = band.
const STALE_BET_MINUTES = Number(process.env.STALE_BET_MINUTES ?? 30);

const getUid = (req) => req.id ?? req.user?._id; // placeBet used req.id, others req.user._id

// Provider kabhi ACTIVE bhejta hai, kabhi OPEN, aur Roulette me numeric s: 1 (0 = suspended)
const isActive = (s, numericS = undefined) => {
  if (s !== undefined && s !== null && String(s).trim() !== '') {
    return ['ACTIVE', 'OPEN'].includes(String(s).trim().toUpperCase());
  }
  if (numericS !== undefined && numericS !== null) {
    return Number(numericS) === 1;
  }
  return false;
};

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
  // worli family (tabdata + sections) aur t1/t2 cricket casino family (superover/cricketv3)
  // shared table cache assembler use karti hy jo canonical { mid, sub, mgroups } return karta hy.
  if (
    [
      'worli',
      'worli2',
      'worli3',
      'superover',
      'superover2',
      'superover3',
      'cricketv3',
    ].includes(slug)
  ) {
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

// Matka family ka nodate result worli3 me sirf bazaar legend hy ({mid:1,win:'Diamond'});
// real round results dated endpoint pe hy (worli/worli2: "440", worli3: "257 - 4 - GULF CLOSE").
// Midnight rollover ke liye today + yesterday dono merge karte hy.
const formatYmd = (d) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');

const fetchDatedCasinoResult = async (slug) => {
  const now = new Date();
  const dates = [formatYmd(now), formatYmd(new Date(now.getTime() - 86400000))];
  const seen = new Set();
  const out = [];
  for (const date of dates) {
    try {
      const url = `${API_URL}/diamond/direct-casino/result/${date}/${encodeURIComponent(slug)}?key=${API_KEY}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      const rows = Array.isArray(data?.data) ? data.data : [];
      for (const row of rows) {
        const key = String(row?.mid ?? '');
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ ...row, _resultDate: date });
      }
    } catch {
      /* e.g. 404 before first round of the day */
    }
  }
  return out;
};

// Provider result row -> engine result object (winCode path).
// - worli / worli2 dated nat: "440" -> { pana:'440', digit:8, bazaar:null, kind:'SINGLE_ROUND' }
// - worli3 dated nat: "257  -  4  -  GULF CLOSE" -> { pana:'257', digit:4, bazaar:'GULF', kind:'CLOSE' }
const parseMatkaNat = (nat) => {
  if (typeof nat !== 'string') return null;
  const trimmed = nat.trim();
  if (/^\d{3}$/.test(trimmed)) {
    const digit =
      (Number(trimmed[0]) + Number(trimmed[1]) + Number(trimmed[2])) % 10;
    return { pana: trimmed, digit, bazaar: null, kind: 'SINGLE_ROUND' };
  }
  const parts = trimmed.split('-').map((p) => p.trim());
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

// Reverse-map dated `nat` (e.g. "Player A", "Dragon", "Banker", "17") to winCode
// when settling a missed round from a dated-only stored CasinoResult row.
const inferWinCodeFromNat = (slug, nat) => {
  const s = String(slug || '').toLowerCase();
  const n = String(nat || '')
    .trim()
    .toLowerCase();
  if (!n) return '';
  const fam = engine.familyOf(s);
  if (fam === 'roulette') {
    const numM = n.match(/\d+/);
    return numM ? numM[0] : '';
  }
  if (fam === 'dt') {
    if (n === 'dragon') return '1';
    if (n === 'tiger') return '2';
    if (n === 'tie') return '3';
  }
  if (fam === 'dtl20') {
    if (n === 'dragon') return '21';
    if (n === 'tiger') return '22';
    if (n === 'lion') return '23';
  }
  if (fam === 'baccarat') {
    if (n === 'player') return '1';
    if (n === 'banker') return '2';
    if (n === 'tie') return '3';
  }
  if (fam === 'lucky7' || fam === 'lucky5') {
    if (n.includes('low')) return '1';
    if (n.includes('high')) return '2';
    if (n === 'tie' || n === 'card 7') return '0';
  }
  if (fam === 'aaa') {
    if (n === 'amar') return '1';
    if (n === 'akbar') return '2';
    if (n === 'anthony') return '3';
  }
  if (fam === 'card32') {
    if (n === 'player 8') return '1';
    if (n === 'player 9') return '2';
    if (n === 'player 10') return '3';
    if (n === 'player 11') return '4';
  }
  if (fam === 'teen9') {
    if (n === 'tiger') return '1';
    if (n === 'lion') return '2';
    if (n === 'dragon') return '3';
  }
  if (fam === 'teen1') {
    if (n === 'player') return '1';
    if (n === 'dealer') return '2';
    if (n === 'tie') return '3';
  }
  if (fam === 'andarbahar') {
    if (n === 'andar') return '1';
    if (n === 'bahar') return '2';
  }
  if (n === 'player a' || n === 'fighter a' || n === 'eng' || n === 'ind')
    return '1';
  if (n === 'player b' || n === 'fighter b' || n === 'rsa' || n === 'aus')
    return '2';
  if (n === 'tie') return '0';
  return '';
};

const normalizeResult = (slug, row, list = []) => {
  const fam = engine.familyOf(slug);
  const w = String(row?.win);
  if (fam === 'matka') {
    const m = parseMatkaNat(row?.nat);
    if (m) {
      return m.kind === 'CLOSE'
        ? { close: m.digit, closePana: m.pana }
        : { open: m.digit, openPana: m.pana };
    }
    if (/^[0-9]$/.test(w)) {
      return { open: Number(w) };
    }
    throw new Error(`unparseable matka result: ${row?.nat ?? row?.win}`);
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
    return engine.normalizeMatkaSelection(market?.canonicalSelection ?? nat);
  }
  if (market?.canonicalSelection) {
    return String(market.canonicalSelection);
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
    case 'lucky5': {
      if (n === 'low card') return 'low';
      if (n === 'high card') return 'high';
      if (['even', 'odd', 'red', 'black'].includes(n)) return n;
      if (cardM) {
        const r = parseCardRank(cardM[1]);
        return r ? `card:${r}` : null;
      }
      return null;
    }
    case 'lucky15': {
      const rm = n.match(/^([01246])\s*runs?$/);
      if (rm) return `runs:${rm[1]}`;
      if (n === 'wicket') return 'wicket';
      return null;
    }
    case 'mogambo': {
      if (n === 'mogambo') return 'mogambo';
      if (n.includes('daga') || n.includes('teja')) return 'dagateja';
      if (n.includes('3 card total') || n.includes('total')) {
        const line = Number(
          market?.sessionLine ?? market?.b ?? market?.l ?? 21
        );
        return Number.isFinite(line) ? `total:${line}` : 'total:21';
      }
      return null;
    }
    case 'lottcard': {
      if (/^lott:(single|double|triple):\d{1,3}$/.test(n)) return n;
      return null;
    }
    case 'andarbahar': {
      const subType = String(market?.subtype || '').toLowerCase();
      const sidNum = Number(market?.sid ?? market?.i);
      if (
        subType === 'abj' ||
        (sidNum >= 1 &&
          sidNum <= 25 &&
          (n === 'sa' ||
            n === 'sb' ||
            n.includes('bet') ||
            n.startsWith('joker')))
      ) {
        if (sidNum === 1 || n === 'sa') return 'abj:sa';
        if (sidNum === 2) return 'abj:a1';
        if (sidNum === 3) return 'abj:a2';
        if (sidNum === 4 || n === 'sb') return 'abj:sb';
        if (sidNum === 5) return 'abj:b1';
        if (sidNum === 6) return 'abj:b2';
        if (n === 'joker odd') return 'joker:odd';
        if (n === 'joker even') return 'joker:even';
        const jSuit = n.match(/^joker\s+(spade|club|heart|diamond)$/);
        if (jSuit) return `joker:suit:${jSuit[1]}`;
        const jCard = n.match(/^joker\s+([a-z0-9]+)$/);
        if (jCard) {
          const r = parseCardRank(jCard[1]);
          return r ? `joker:card:${r}` : null;
        }
      }
      const ab20M = n.match(/^(andar|bahar)\s+([a-z0-9]+)$/);
      if (ab20M) {
        const r = parseCardRank(ab20M[2]);
        return r ? `ab20:${ab20M[1]}:${r}` : null;
      }
      if (n === 'andar' || n === 'bahar') return n;
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
      const dtc = n.match(/^(dragon|tiger)\s+card\s+([a-z0-9]+)$/);
      if (dtc) {
        const r = parseCardRank(dtc[2]);
        return r ? `card:${dtc[1]}:${r}` : null;
      }
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
    case 'dtl20': {
      const letterMap = { d: 'dragon', t: 'tiger', l: 'lion' };
      const wm = n.match(/^(winner|black|red|odd|even)\s+([dtl])$/);
      if (wm) {
        const [, kind, code] = wm;
        const who = letterMap[code];
        if (kind === 'winner') return `winner:${who}`;
        if (kind === 'black' || kind === 'red') return `color:${who}:${kind}`;
        return `parity:${who}:${kind}`;
      }
      const cm = n.match(/^(dragon|tiger|lion)\s+([a-z0-9]+)$/);
      if (cm) {
        const r = parseCardRank(cm[2]);
        return r ? `card:${cm[1]}:${r}` : null;
      }
      return null;
    }
    case 'trio': {
      if (n === 'session') {
        const line = Number(
          market?.sessionLine ?? market?.b ?? market?.l ?? 21
        );
        return Number.isFinite(line) ? `session:${line}` : 'session:21';
      }
      if (/1\s*2\s*4/.test(n)) return 'judge:124';
      if (/j\s*q\s*k/.test(n)) return 'judge:jqk';
      if (n === 'two red only') return 'twored';
      if (n === 'two black only') return 'twoblack';
      if (n === 'two odd only') return 'twoodd';
      if (n === 'two even only') return 'twoeven';
      if (n === 'pair') return 'pair';
      if (n === 'flush') return 'flush';
      if (n === 'straight') return 'straight';
      if (n === 'trio') return 'trio';
      if (n === 'straight flush') return 'straightflush';
      return null;
    }
    case 'bollywood': {
      if (n === 'don' || n === 'a.don') return 'don';
      if (n === 'amar akbar anthony' || n === 'b.amar akbar anthony')
        return 'aaa';
      if (n === 'sahib bibi aur ghulam' || n === 'c.sahib bibi aur ghulam')
        return 'sbg';
      if (n === 'dharam veer' || n === 'd.dharam veer') return 'dv';
      if (n === 'kis kis ko pyaar karoon' || n === 'e.kis kis ko pyaar karoon')
        return 'kkpk';
      if (n === 'ghulam' || n === 'f.ghulam') return 'ghulam';
      if (n === 'odd' || n === 'red' || n === 'black') return n;
      if (n.includes('dulha dulhan')) return 'dulhadulhan';
      if (n.includes('barati')) return 'barati';
      if (cardM) {
        const r = parseCardRank(cardM[1]);
        return r ? `card:${r}` : null;
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
      if (n === 'score 1-4') return 'score:1-4';
      if (n === 'score 5-6') return 'score:5-6';
      if (n === 'score 7') return 'score:7';
      if (n === 'score 8') return 'score:8';
      if (n === 'score 9') return 'score:9';
      return null;
    case 'teen':
    case 'muflis': {
      const subType = String(market?.subtype || '').toLowerCase();
      if (subType === 'vcon' || subType === 'con') {
        if (n.includes('player a')) return 'consec:A';
        if (n.includes('player b')) return 'consec:B';
      }
      if (/^unique:\d-\d-\d$/.test(n)) return n;
      const cpM = n.match(/^card\s*([1-6])\s+(odd|even)$/);
      if (cpM) return `cardparity:${cpM[1]}:${cpM[2]}`;
      const psM = n.match(/^player\s+([ab])\s+(spade|heart|club|diamond)$/);
      if (psM) return `playersuit:${psM[1].toUpperCase()}:${psM[2]}`;
      const uoM = n.match(/^player\s+([ab])\s+(under|over)\s*2[12]$/);
      if (uoM) return `${uoM[2]}21:${uoM[1].toUpperCase()}`;
      if (n === 'lucky 9') return 'lucky9';
      const pjM = n.match(
        /^(poison|joker)\s+(even|odd|red|black|spade|heart|diamond|club)$/
      );
      if (pjM) return `special:${pjM[2]}`;
      const m = n.match(
        /^(player|pair plus|total|3 baccarat|m baccarat|top 9|black|red|high card|pair|color plus)\s+([ab])$/
      );
      if (m) {
        const who = m[2].toUpperCase();
        if (m[1] === 'player') return who === 'A' ? 'playerA' : 'playerB';
        if (m[1] === 'pair plus') return `pairplus:${who}`;
        if (m[1] === 'total') return `total:${who}`;
        if (m[1] === '3 baccarat' || m[1] === 'm baccarat')
          return `baccarat:${who}`;
        if (m[1] === 'top 9') return `top9:${who}`;
        if (m[1] === 'black') return `redblack:${who}:black`;
        if (m[1] === 'red') return `redblack:${who}:red`;
        if (m[1] === 'high card') return `highcard:${who}`;
        if (m[1] === 'pair') return `pair:${who}`;
        if (m[1] === 'color plus') return `colorplus:${who}`;
      }
      return null;
    }
    case 'teen1': {
      if (['player', 'dealer', 'tie', 'pair'].includes(n)) return n;
      const ud = n.match(/^7\s+(up|down)\s+(player|dealer)$/);
      if (ud) return `${ud[1]}7:${ud[2]}`;
      return null;
    }
    case 'teen8': {
      const p8 = n.match(/^player\s+([1-8])$/);
      if (p8) return `player:${p8[1]}`;
      const pp8 = n.match(/^pair plus\s+([1-8])$/);
      if (pp8) return `pairplus:${pp8[1]}`;
      const t8 = n.match(/^total\s+([1-8])$/);
      if (t8) return `total:${t8[1]}`;
      if (n === 'any colour' || n === 'any color') return 'anycolour';
      if (n === 'any straight') return 'anystraight';
      if (n === 'any trio') return 'anytrio';
      if (n === 'any straight flush') return 'anystraightflush';
      return null;
    }
    case 'teen9': {
      const t9 = n.match(
        /^(tiger|lion|dragon)\s+(winner|pair|flush|straight|trio|straight flush)$/
      );
      if (t9) {
        if (t9[2] === 'winner') return `winner:${t9[1]}`;
        return `cat:${t9[1]}:${t9[2].replace(/\s+/g, '')}`;
      }
      return null;
    }
    case 'patti2': {
      if (n === 'player a') return 'playerA';
      if (n === 'player b') return 'playerB';
      if (n === 'mini baccarat a') return 'minibacc:A';
      if (n === 'mini baccarat b') return 'minibacc:B';
      if (n === 'color plus') return 'colorplus';
      const p2t = n.match(/^total\s+([ab])$/);
      if (p2t) {
        const line = Number(
          market?.sessionLine ?? market?.b ?? market?.l ?? 15
        );
        return `total:${p2t[1].toUpperCase()}:${line}`;
      }
      return null;
    }
    case 'sicbo': {
      if (n === 'small') return 'small';
      if (n === 'big') return 'big';
      if (n === 'any triple') return 'anytriple';
      if (n === 'odd' || n === 'even') return n;
      const dm = n.match(/^double\s+(\d)$/);
      if (dm) return `double:${dm[1]}`;
      const tm = n.match(/^triple\s+(\d)$/);
      if (tm) return `triple:${tm[1]}`;
      const sm = n.match(/^(?:sum|total)\s+(\d+)$/);
      if (sm) return `sum:${sm[1]}`;
      const cm = n.match(/^combination\s+(\d)\s+and\s+(\d)$/);
      if (cm) return `combo:${cm[1]}-${cm[2]}`;
      const sg = n.match(/^single\s+(\d)$/);
      if (sg) return `single:${sg[1]}`;
      return null;
    }
    case 'dolidana': {
      if (n === 'player a') return 'playerA';
      if (n === 'player b') return 'playerB';
      if (n === 'any pair') return 'anypair';
      const pm = n.match(/^(\d)-\1\s+pair$/);
      if (pm) return `pair:${pm[1]}`;
      const sm = n.match(/^sum total\s+(\d+)$/);
      if (sm) return `sum:${sm[1]}`;
      if (n === 'odd' || n === 'even') return n;
      if (n === 'less than 7' || n === '< 7') return 'lt7';
      if (n === 'greater than 7' || n === '> 7') return 'gt7';
      if (n === 'lucky 7') return 'lucky7';
      return null;
    }
    case 'ballbyball': {
      const rm = n.match(/^([0-6])\s*runs?$/);
      if (rm) return `runs:${rm[1]}`;
      if (n === 'boundary') return 'boundary';
      if (n === 'wicket') return 'wicket';
      if (n.includes('extra')) return 'extra';
      return null;
    }
    case 'cmatch20': {
      const rm = n.match(/^run\s*(\d+)$/);
      if (rm) return `run:${rm[1]}`;
      return null;
    }
    case 'goal': {
      const st = String(market?.subtype || '').toLowerCase();
      const sidNum = market?.sid ?? market?.i;
      if (st === 'combo' || n.includes(' and ')) {
        const [pPart, mPart] = n.split(' and ');
        return `combo:${(pPart || '').replace(/[^a-z0-9]/g, '')}+${(mPart || '').replace(/[^a-z0-9]/g, '')}`;
      }
      if (st === 'goal' || st === 'method') {
        return `method:${n.replace(/[^a-z0-9]/g, '')}`;
      }
      if (sidNum != null && /^\d+$/.test(String(sidNum))) {
        return `player:${sidNum}`;
      }
      return `player:${n}`;
    }
    case 'race2': {
      if (n === 'player a') return 'playerA';
      if (n === 'player b') return 'playerB';
      if (n === 'player c') return 'playerC';
      if (n === 'player d') return 'playerD';
      return null;
    }
    case 'race17': {
      if (n === 'race to 17') return 'race17';
      const bm = n.match(/big card.*?-\s*(\d+)/);
      if (bm) return `bigcard:${bm[1]}`;
      const zm = n.match(/zero card.*?-\s*(\d+)/);
      if (zm) return `zerocard:${zm[1]}`;
      if (n === 'any zero') return 'anyzero';
      return null;
    }
    case 'race20': {
      const km = n.match(/^k of (spade|heart|club|diamond)$/);
      if (km) return `king:${km[1]}`;
      const wm = n.match(/^win with\s*(\d+)$/);
      if (wm) return `winwith:${wm[1]}`;
      if (n === 'total points') return `totalpoints:${Number(market?.b || 0)}`;
      if (n === 'total cards') return `totalcards:${Number(market?.b || 0)}`;
      return null;
    }
    case 'superover': {
      const sidStr = String(market?.sid ?? market?.i ?? '');
      if (sidStr === '1') return 'team1';
      if (sidStr === '2') return 'team2';
      if (n === 'tie') return 'tie';
      return null;
    }
    case 'card32': {
      const pm = n.match(/^player (\d+)$/);
      if (pm) return `player${pm[1]}`;
      const oem = n.match(/^player (\d+)\s+(odd|even)$/);
      if (oem) return `parity:${oem[1]}:${oem[2]}`;
      if (n === 'any three card black' || n === 'any 3 card black')
        return 'any3black';
      if (n === 'any three card red' || n === 'any 3 card red')
        return 'any3red';
      if (n === 'two black two red') return 'twoblacktwored';
      if (n === '8 & 9 total') return 'total89';
      if (n === '10 & 11 total') return 'total1011';
      const sg = n.match(/^single\s+(\d)$/);
      if (sg) return `single:${sg[1]}`;
      return null;
    }
    case 'poker': {
      const sidNum = Number(market?.sid ?? market?.i);
      const st = String(market?.subtype || '').toLowerCase();
      if (st === 'poker6') {
        const p6 = n.match(/^player\s+([1-6])$/);
        if (p6) return `player:${p6[1]}`;
        const pat = n.replace(/[^a-z]/g, '');
        if (pat) return `pattern:${pat}`;
        return null;
      }
      if (st === 'poker20') {
        const who = sidNum >= 21 ? 'B' : 'A';
        if (n === 'winner') return `winner:${who}`;
        const clean = n.replace(/[^a-z]/g, '');
        return clean ? `hand:${who}:${clean}` : null;
      }
      if (n === 'player a') return 'playerA';
      if (n === 'player b') return 'playerB';
      if (n.includes('player a') && n.includes('2 card')) return 'bonus2:A';
      if (n.includes('player b') && n.includes('2 card')) return 'bonus2:B';
      if (n.includes('player a') && n.includes('7 card')) return 'bonus7:A';
      if (n.includes('player b') && n.includes('7 card')) return 'bonus7:B';
      return null;
    }
    case '3cardj': {
      if (/^3cj:(yes|no):\d+-\d+-\d+$/.test(n)) return n;
      return null;
    }
    case 'queen': {
      const qm = n.match(/^total\s+([0-3])$/);
      return qm ? `total${qm[1]}` : null;
    }
    case 'trap': {
      if (n === 'player a') return 'playerA';
      if (n === 'player b') return 'playerB';
      return null;
    }
    case 'notenum': {
      if (n === 'baccarat 1') return 'bacc1';
      if (n === 'baccarat 2') return 'bacc2';
      const nm = n.match(/^(odd|even|black|red|low|high)\s+card\s+(\d+)$/);
      if (nm) return `card:${nm[2]}:${nm[1]}`;
      return null;
    }
    case 'dum10': {
      if (n.startsWith('next total')) return 'nexttotal';
      if (['red', 'black', 'even', 'odd'].includes(n)) return n;
      return null;
    }
    case 'cmeter1': {
      if (n === 'fighter a') return 'fighterA';
      if (n === 'fighter b') return 'fighterB';
      return null;
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

    // For worli3 (multi-bazaar), honor the specific open bazaar roundId selected by the user;
    // for all other games, bets always attach to the provider's current live round mid.
    let activeRoundData = liveData;
    if (slug === 'worli3' && roundId) {
      const subRound = liveData.subs?.[String(roundId)];
      if (!subRound) {
        return res.status(400).json({
          success: false,
          message: 'Selected bazaar round is closed or unavailable',
        });
      }
      activeRoundData = subRound;
    }
    const currentRoundId = String(activeRoundData.mid);
    if (roundId && String(roundId) !== currentRoundId) {
      return res.status(400).json({
        success: false,
        message:
          'Round has closed or changed. Please place bet on the current round.',
      });
    }

    const clientOdds = odds;
    const normNat = (v) =>
      String(v || '')
        .trim()
        .toLowerCase();
    const reqNation = req.body?.nation;
    let selectedMarket = null;
    let matkaPricing = null;

    if (family === 'matka') {
      matkaPricing = engine.getMatkaBetPricing(
        slug,
        selection,
        liveData.sections || {}
      );
      if (!matkaPricing) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Matka selection',
        });
      }
      // Validate against the REAL live provider section (sid 1..14) for gstatus, min & max
      const sectionSub = activeRoundData.sub?.find(
        (item) => Number(item.sid ?? item.i) === matkaPricing.sectionSid
      );
      if (!sectionSub) {
        return res.status(400).json({
          success: false,
          message: 'This Matka market is not available on this table',
        });
      }
      if (Math.abs(clientOdds - matkaPricing.effectiveOdds) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Odds changed. Current: ${matkaPricing.effectiveOdds.toFixed(2)}. Please re-select.`,
          currentOdds: matkaPricing.effectiveOdds,
        });
      }
      selection = matkaPricing.selection;
      odds = matkaPricing.effectiveOdds;
      selectedMarket = {
        ...sectionSub,
        sid: matkaPricing.selection,
        canonicalSelection: matkaPricing.selection,
        nat: matkaPricing.label,
        b: matkaPricing.effectiveOdds,
      };
    } else if (slug === 'lottcard') {
      const lottM = String(selection).match(
        /^lott:(single|double|triple):(\d{1,3})$/i
      );
      if (!lottM) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Lottery selection format',
        });
      }
      const mode = lottM[1].toLowerCase();
      const digits = lottM[2];
      const expectedLen = mode === 'single' ? 1 : mode === 'double' ? 2 : 3;
      if (digits.length !== expectedLen) {
        return res.status(400).json({
          success: false,
          message: `${mode} requires exactly ${expectedLen} digit(s)`,
        });
      }
      const sidByMode = { single: '1', double: '2', triple: '3' };
      const secSub = activeRoundData.sub?.find(
        (item) => String(item.sid ?? item.i) === sidByMode[mode]
      );
      if (secSub) {
        const canonical = `lott:${mode}:${digits}`;
        selectedMarket = {
          ...secSub,
          sid: canonical,
          canonicalSelection: canonical,
          nat: `${mode[0].toUpperCase() + mode.slice(1)} ${digits}`,
        };
      }
    } else if (slug === 'ab3' || slug === 'ab4') {
      const abChildM = String(selection).match(
        /^abchild:(\d+):(andar|bahar):(\d{1,2})$/i
      );
      if (abChildM) {
        const cardNum = abChildM[1];
        const abSide = abChildM[2].toLowerCase();
        const rankNum = Number(abChildM[3]);
        const activeSub = activeRoundData.sub?.find(
          (item) => String(item.sid ?? item.i) === cardNum
        );
        const childSid = abSide === 'andar' ? rankNum : 20 + rankNum;
        const childEntry = activeRoundData.child?.find(
          (c) => Number(c.sid) === childSid
        );
        if (!activeSub) {
          return res.status(400).json({
            success: false,
            message: 'Active Andar Bahar card slot has changed',
          });
        }
        if (
          childEntry &&
          (Number(childEntry.b) !== 1 || Number(childEntry.l) <= 0)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Selected card side is currently closed',
          });
        }
        const rankLbl =
          { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[rankNum] || String(rankNum);
        const canonical = `abchild:${cardNum}:${abSide}:${rankNum}`;
        selectedMarket = {
          ...activeSub,
          sid: canonical,
          canonicalSelection: canonical,
          nat: `${abSide === 'andar' ? 'Andar' : 'Bahar'} ${rankLbl} (Card ${cardNum})`,
        };
      }
    } else if (slug === 'teenunique') {
      const uM = String(selection).match(/^unique:([1-6])-([1-6])-([1-6])$/i);
      if (!uM) {
        return res.status(400).json({
          success: false,
          message:
            'Please select 3 distinct card slots (1-6) for Unique Teenpatti',
        });
      }
      const picks = [Number(uM[1]), Number(uM[2]), Number(uM[3])];
      if (new Set(picks).size !== 3) {
        return res.status(400).json({
          success: false,
          message: '3 distinct card positions are required',
        });
      }
      const baseSub = activeRoundData.sub?.[0];
      if (baseSub) {
        const canonical = `unique:${picks.join('-')}`;
        selectedMarket = {
          ...baseSub,
          sid: canonical,
          canonicalSelection: canonical,
          nat: `Unique Cards (${picks.join(', ')})`,
        };
      }
    } else if (
      slug === 'teen6' &&
      /^(\d+):(suit|card):([a-z0-9]+)$/i.test(String(selection))
    ) {
      const t6m = String(selection).match(/^(\d+):(suit|card):([a-z0-9]+)$/i);
      const parentSid = t6m[1];
      const kind = t6m[2].toLowerCase();
      const arg = t6m[3].toLowerCase();
      const parent = activeRoundData.sub?.find(
        (item) =>
          String(item.sid ?? item.i) === parentSid && Array.isArray(item.odds)
      );
      const child =
        kind === 'suit'
          ? parent?.odds?.find(
              (o) =>
                String(o?.nat || '')
                  .trim()
                  .toLowerCase() === arg
            )
          : parent?.odds?.find(
              (o) =>
                Number(o?.sid ?? o?.sno) === Number(arg) ||
                String(o?.nat || '')
                  .trim()
                  .toLowerCase() === arg
            );
      if (parent && child) {
        const cardNumM = String(parent.nat || '').match(/(\d+)/);
        const cardNum = cardNumM ? cardNumM[1] : parentSid;
        const rNum =
          kind === 'card' ? parseCardRank(child.nat) || Number(arg) : null;
        selectedMarket = {
          ...parent,
          sid: `${parentSid}:${kind}:${arg}`,
          nat: `${parent.nat || `Card ${cardNum}`} ${child.nat}`,
          canonicalSelection:
            kind === 'suit'
              ? `cardsuit:${cardNum}:${arg}`
              : `cardrank:${cardNum}:${rNum}`,
          b: Number(child.b ?? 0),
          l: Number(child.l ?? 0),
        };
      }
    } else if (slug === '3cardj') {
      const j3m = String(selection).match(/^3cj:(yes|no):(\d+)-(\d+)-(\d+)$/i);
      if (!j3m) {
        return res.status(400).json({
          success: false,
          message: 'Please select 3 distinct cards for 3 Cards Judgement',
        });
      }
      const mode = j3m[1].toLowerCase();
      const picks = [Number(j3m[2]), Number(j3m[3]), Number(j3m[4])];
      if (
        new Set(picks).size !== 3 ||
        picks.some((r) => !Number.isFinite(r) || r < 1 || r > 13)
      ) {
        return res.status(400).json({
          success: false,
          message: '3 distinct valid cards (A-K) are required',
        });
      }
      const secSub = activeRoundData.sub?.find(
        (item) => String(item.sid ?? item.i) === (mode === 'yes' ? '1' : '2')
      );
      if (secSub) {
        const rName = (r) =>
          ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[r] || String(r);
        const canonical = `3cj:${mode}:${picks.join('-')}`;
        selectedMarket = {
          ...secSub,
          sid: canonical,
          canonicalSelection: canonical,
          nat: `${mode === 'yes' ? 'Yes' : 'No'} (${picks.map(rName).join(', ')})`,
        };
      }
    } else if (
      slug === 'trap' &&
      /^(\d+):(high|low|jqk)$/i.test(String(selection))
    ) {
      const tm = String(selection).match(/^(\d+):(high|low|jqk)$/i);
      const parentSid = tm[1];
      const subChoice = tm[2].toLowerCase();
      const parent = activeRoundData.sub?.find(
        (item) =>
          String(item.sid ?? item.i) === parentSid && Array.isArray(item.odds)
      );
      const child = parent?.odds?.find(
        (o) =>
          String(o?.nat || '')
            .trim()
            .toLowerCase() === subChoice
      );
      if (parent && child) {
        const cardNumM = String(parent.nat || '').match(/(\d+)/);
        const cardNum = cardNumM ? cardNumM[1] : parentSid;
        selectedMarket = {
          ...parent,
          sid: `${parentSid}:${subChoice}`,
          nat: `${parent.nat || `Card ${cardNum}`} ${child.nat}`,
          canonicalSelection:
            subChoice === 'jqk'
              ? `jqk:${cardNum}`
              : `highlow:${cardNum}:${subChoice}`,
          b: Number(child.b ?? 0),
          l: Number(child.l ?? 0),
        };
      }
    } else if (
      slug === 'notenum' &&
      /^(\d+):card:(\d+)$/i.test(String(selection))
    ) {
      const nm = String(selection).match(/^(\d+):card:(\d+)$/i);
      const parentSid = nm[1];
      const rankNum = Number(nm[2]);
      const parent = activeRoundData.sub?.find(
        (item) =>
          String(item.sid ?? item.i) === parentSid && Array.isArray(item.odds)
      );
      const child = parent?.odds?.find(
        (o) => Number(o?.ssid ?? o?.sno) === rankNum
      );
      if (parent && child) {
        const cardNumM = String(parent.nat || '').match(/(\d+)/);
        const cardNum = cardNumM ? cardNumM[1] : parentSid;
        selectedMarket = {
          ...parent,
          sid: `${parentSid}:card:${rankNum}`,
          nat: `${parent.nat || `Card ${cardNum}`} - ${child.nat}`,
          canonicalSelection: `card:${cardNum}:rank:${rankNum}`,
          b: Number(child.b ?? 0),
          l: Number(child.l ?? 0),
        };
      }
    } else {
      const nestedM = String(selection).match(/^(\d+):(odd|even)$/i);
      if (nestedM) {
        const parentSid = nestedM[1];
        const parity = nestedM[2].toLowerCase();
        const parent = activeRoundData.sub?.find(
          (item) =>
            String(item.sid ?? item.i) === parentSid && Array.isArray(item.odds)
        );
        const child = parent?.odds?.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === parity
        );
        if (parent && child) {
          const cardNumM = String(parent.nat || '').match(/(\d+)/);
          const cardNum = cardNumM ? cardNumM[1] : parentSid;
          const prettyParity = parity === 'odd' ? 'Odd' : 'Even';
          selectedMarket = {
            ...parent,
            sid: `${parentSid}:${parity}`,
            nat: `${parent.nat || `Card ${cardNum}`} ${prettyParity}`,
            canonicalSelection: `cardparity:${cardNum}:${parity}`,
            b: Number(child.b ?? 0),
            l: Number(child.l ?? 0),
          };
        }
      }
      if (!selectedMarket) {
        selectedMarket =
          (reqNation &&
            activeRoundData.sub?.find(
              (item) =>
                String(item.sid ?? item.i) === String(selection) &&
                normNat(item.nat ?? item.n ?? item.name) === normNat(reqNation)
            )) ||
          activeRoundData.sub?.find(
            (item) => String(item.sid ?? item.i) === String(selection)
          );
      }
    }

    if (!selectedMarket) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid selection for this round' });
    }

    // D247 exact open/suspend gate (provider open markets on dt6/vdt6/aaa send visible:0,
    // and roulette11/12/13/ourroullete send numeric s: 1/0 instead of gstatus)
    const rawGs = selectedMarket.gstatus ?? selectedMarket.status;
    const marketOpen = isActive(rawGs, selectedMarket.s);
    if (process.env.ALLOW_SUSPENDED_BETS !== '1' && !marketOpen) {
      return res.status(400).json({
        success: false,
        message: 'This selection is suspended',
        selection:
          selectedMarket.nat ||
          selectedMarket.n ||
          selectedMarket.sid ||
          selectedMarket.i,
        status: rawGs || (selectedMarket.s === 0 ? 'SUSPENDED' : 'SUSPENDED'),
      });
    }

    const minStake = Number(selectedMarket.min ?? activeRoundData.min ?? 0);
    const maxStake = Number(
      selectedMarket.max ?? activeRoundData.max ?? Infinity
    );

    if (stake < minStake || stake > maxStake) {
      return res.status(400).json({
        success: false,
        message: `Stake must be between ${minStake} and ${maxStake}`,
      });
    }

    // Authoritative live odds check (D247 rule: no bet on 0/missing rate;
    // no Lay on Back-only or half-loss markets; Fancy2 Session uses bbhav/lbhav;
    // Sic Bo sends profit-to-1 ratio X -> decimal = X + 1!)
    const sideLower = String(side || '').toLowerCase();
    const isFancy2Session =
      String(selectedMarket.etype || '').toLowerCase() === 'fancy2' &&
      (Number(selectedMarket.bbhav) > 0 || Number(selectedMarket.lbhav) > 0);
    const isSicboRatio = family === 'sicbo' || family === 'baccarat';
    if (isFancy2Session) {
      const line = Number(
        sideLower === 'lay' ? selectedMarket.l : selectedMarket.b
      );
      if (
        req.body?.sessionLine !== undefined &&
        req.body?.sessionLine !== null &&
        Math.abs(Number(req.body.sessionLine) - line) > 0.01
      ) {
        return res.status(400).json({
          success: false,
          message: `Line changed. Current: ${line}. Please re-select.`,
          currentLine: line,
        });
      }
      selectedMarket = { ...selectedMarket, sessionLine: line };
    }

    // Client sid/nat bhejta hy; engine ko canonical selection key chahiye.
    const providerNat = selectedMarket.nat ?? selectedMarket.n;
    const selKey =
      natKey(family, providerNat, selectedMarket) || String(selection);

    const rawProviderOdds = isFancy2Session
      ? sideLower === 'lay'
        ? Number(selectedMarket.lbhav) > 0
          ? Math.round((1 + Number(selectedMarket.lbhav) / 100) * 100) / 100
          : 0
        : Number(selectedMarket.bbhav) > 0
          ? Math.round((1 + Number(selectedMarket.bbhav) / 100) * 100) / 100
          : 0
      : sideLower === 'lay'
        ? (selectedMarket.l ?? selectedMarket.lay)
        : isSicboRatio
          ? Number(selectedMarket.b ?? 0) > 0
            ? Number(selectedMarket.b) + 1
            : 0
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
      if (Math.abs(clientOdds - providerOdds) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Odds changed. Current: ${providerOdds.toFixed(2)}. Please re-select.`,
          currentOdds: providerOdds,
        });
      }
      odds = providerOdds;
    } else if (!matkaPricing) {
      if (!Number.isFinite(providerOdds) || providerOdds <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Betting odds are currently closed',
        });
      }
      if (Math.abs(clientOdds - providerOdds) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Odds changed. Current: ${providerOdds.toFixed(2)}. Please re-select.`,
          currentOdds: providerOdds,
        });
      }
      odds = providerOdds;
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
      String(selectedMarket.subtype || '').toLowerCase() === 'vcon'
        ? `${providerNat} Consecutive`
        : isFancy2Session
          ? `${providerNat} (${selectedMarket.sessionLine})`
          : providerNat ||
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
        const dynamicOdds =
          selOutcome === 'win'
            ? engine.getDynamicSettlementOdds?.(
                slug,
                bet.selection,
                enrichedResult
              )
            : null;
        const betForSettle =
          dynamicOdds && dynamicOdds > 1 ? { ...bet, odds: dynamicOdds } : bet;
        const s = engine.settleBet(betForSettle, selOutcome);

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
        const [datedRows, listRaw] = await Promise.all([
          Array.isArray(datedRowsHint)
            ? Promise.resolve(datedRowsHint)
            : getCachedOrFetchDatedResult(cleanSlug).catch(() => []),
          cleanSlug === 'worli2'
            ? Array.isArray(resultRowsHint)
              ? Promise.resolve(resultRowsHint)
              : getCachedOrFetchCasinoResult(cleanSlug).catch(() => [])
            : Promise.resolve([]),
        ]);

        // Persist fetched Matka dated results into our 4-day CasinoResult store
        if (Array.isArray(datedRows) && datedRows.length) {
          saveCasinoResults(cleanSlug, datedRows, { source: 'dated' }).catch(
            () => {}
          );
        }

        // Also merge any stored 4-day Matka results for missed rounds
        const storedMatka = await findStoredResultsForSlug(
          cleanSlug,
          pending
        ).catch(() => []);
        const mergedMatkaRows = [...datedRows];
        const seenMatkaMids = new Set(
          datedRows.map((r) => String(r?.mid ?? ''))
        );
        for (const s of storedMatka) {
          if (s.roundId && !seenMatkaMids.has(s.roundId) && s.nat) {
            mergedMatkaRows.push({
              mid: s.roundId,
              nat: s.nat,
              _resultDate: s.date,
            });
          }
        }

        // 1. Single-round Matka games (worli & worli2): dated nat is 3-digit pana ("440", "356")
        const settledMids = new Set();
        const byBazaar = {};
        for (const row of mergedMatkaRows) {
          const midStr = String(row?.mid ?? '');
          const m = parseMatkaNat(row?.nat);
          if (!m || !midStr) continue;
          if (m.kind === 'SINGLE_ROUND') {
            if (!pending.includes(midStr)) continue;
            try {
              const out = await settleCore(cleanSlug, midStr, {
                open: m.digit,
                openPana: m.pana,
              });
              settledCount += out.settled;
              settledMids.add(midStr);
            } catch (e) {
              console.error(`poller settle ${cleanSlug}/${midStr}:`, e.message);
            }
          } else {
            const bKey = `${row._resultDate || ''}|${m.bazaar}`;
            byBazaar[bKey] = byBazaar[bKey] || {};
            byBazaar[bKey][m.kind] = { mid: midStr, ...m };
          }
        }

        // 2. worli3 OPEN / CLOSE bazaar pairs (OPEN single/pana only checks open; jodi uses open + jodiClose)
        for (const pair of Object.values(byBazaar)) {
          if (pair.OPEN?.mid && pending.includes(pair.OPEN.mid)) {
            try {
              const out = await settleCore(cleanSlug, pair.OPEN.mid, {
                open: pair.OPEN.digit,
                openPana: pair.OPEN.pana,
                ...(pair.CLOSE?.digit !== undefined
                  ? { jodiClose: pair.CLOSE.digit }
                  : {}),
              });
              settledCount += out.settled;
              settledMids.add(pair.OPEN.mid);
            } catch (e) {
              console.error(
                `poller settle ${cleanSlug}/${pair.OPEN.mid}:`,
                e.message
              );
            }
          }
          if (pair.CLOSE?.mid && pending.includes(pair.CLOSE.mid)) {
            try {
              const out = await settleCore(cleanSlug, pair.CLOSE.mid, {
                close: pair.CLOSE.digit,
                closePana: pair.CLOSE.pana,
              });
              settledCount += out.settled;
              settledMids.add(pair.CLOSE.mid);
            } catch (e) {
              console.error(
                `poller settle ${cleanSlug}/${pair.CLOSE.mid}:`,
                e.message
              );
            }
          }
        }

        // 3. worli2 fast fallback from /result/worli2 ({ mid, win: "4" }) when dated pana hasn't published yet
        if (cleanSlug === 'worli2') {
          for (const row of resultRows(listRaw)) {
            const midStr = String(row?.mid ?? '');
            const w = String(row?.win ?? '');
            if (!midStr || settledMids.has(midStr) || !pending.includes(midStr))
              continue;
            if (!/^[0-9]$/.test(w)) continue;
            try {
              const out = await settleCore(cleanSlug, midStr, {
                open: Number(w),
              });
              settledCount += out.settled;
            } catch (e) {
              console.error(`poller settle ${cleanSlug}/${midStr}:`, e.message);
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

      // Persist fetched results into our 4-day CasinoResult store (dated primary, live fallback)
      if (Array.isArray(datedRows) && datedRows.length) {
        saveCasinoResults(cleanSlug, datedRows, { source: 'dated' }).catch(
          () => {}
        );
      }
      if (list.length) {
        saveCasinoResults(cleanSlug, list, { source: 'live' }).catch(() => {});
      }

      const settledMids = new Set();
      for (const row of list) {
        const midStr = String(row?.mid ?? '');
        if (!midStr || !pending.includes(midStr)) continue;
        try {
          const norm = normalizeResult(cleanSlug, row, list);
          const datedMatch = datedRows.find((d) => String(d.mid) === midStr);
          if (datedMatch?.nat) norm.datedNat = datedMatch.nat;
          const out = await settleCore(cleanSlug, midStr, norm);
          settledCount += out.settled;
          if (out.settled > 0) settledMids.add(midStr);
        } catch (e) {
          console.error(`poller settle ${cleanSlug}/${midStr}:`, e.message);
        }
      }

      // Fallback lookup in our 4-day stored CasinoResult DB for any round that scrolled off the live feed
      const remainingPending = pending.filter((mid) => !settledMids.has(mid));
      if (remainingPending.length) {
        const storedDocs = await findStoredResultsForSlug(
          cleanSlug,
          remainingPending
        ).catch(() => []);
        for (const doc of storedDocs) {
          const midStr = String(doc.roundId || '');
          const inferredWin =
            String(doc.win || '').trim() ||
            inferWinCodeFromNat(cleanSlug, doc.nat);
          if (!midStr || (!inferredWin && !doc.nat)) continue;
          try {
            const norm = normalizeResult(
              cleanSlug,
              { mid: midStr, win: inferredWin, nat: doc.nat },
              list
            );
            if (doc.nat) norm.datedNat = doc.nat;
            if (doc.card) norm.card = doc.card;
            if (doc.rdesc) norm.rdesc = doc.rdesc;
            const out = await settleCore(cleanSlug, midStr, norm);
            settledCount += out.settled;
          } catch (e) {
            console.error(
              `poller stored-fallback settle ${cleanSlug}/${midStr}:`,
              e.message
            );
          }
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
