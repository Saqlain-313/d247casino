/**
 * casinoEngine.js
 * Pure betting logic (no DB, no Express) - easy to unit test.
 *
 * Outcome strings: 'win' | 'lose' | 'push' | 'half_loss'
 * Bet shape: { side: 'back'|'lay', selection: string, odds: number, stake: number }
 */

// ---------------------------------------------------------------- constants
const RED_SET = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const LIMITS = {
  default: { min: 100, max: 50000 },
  dt: { min: 100, max: 100000 },
  baccarat: { min: 100, max: 100000 },
  roulette: { min: 25, max: 100000 },
};

const GAME_FAMILY = {
  lucky7: ['lucky7', 'lucky7eu', 'lucky7eu2', 'plucky7', 'vlucky7'],
  aaa: ['aaa', 'aaa2', 'vaaa'],
  dt: ['dt20', 'dt202', 'dt6', 'pdt20', 'pdt6', 'vdt6'],
  baccarat: ['baccarat', 'baccarat2', 'pbaccarat'],
  teen: [
    'teen',
    'teen20',
    'teen20b',
    'teen20c',
    'teen3',
    'teen32',
    'teen33',
    'teen6',
    'teen8',
    'teen9',
    'pteen',
    'pteen20',
    'vteen',
    'vteen20',
    'poison',
    'poison20',
    'joker1',
    'joker20',
    'joker120',
    'teenunique',
    'teen41',
    'teen42',
  ],
  muflis: ['teenmuf', 'vteenmuf'],
  roulette: ['roulette11', 'roulette12', 'roulette13', 'ourroullete'],
  sicbo: ['sicbo', 'sicbo2', 'dolidana'],
  card32: ['card32', 'card32eu', 'pcard32'],
  andarbahar: ['ab20', 'abj', 'ab3', 'ab4'],
  matka: ['worli', 'worli2', 'worli3'],
};

const familyOf = (slug) =>
  Object.keys(GAME_FAMILY).find((f) => GAME_FAMILY[f].includes(slug)) || null;

// ------------------------------------------------------------ money helpers
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function getLimits(slug) {
  const fam = familyOf(slug);
  return LIMITS[fam] || LIMITS.default;
}

/** Back = stake, Lay = liability = stake * (odds - 1) */
function calcExposure({ side, stake, odds }) {
  if (side === 'lay') return round2(stake * (odds - 1));
  return round2(stake);
}

function validateBet(slug, bet, { allowLay = true } = {}) {
  const errors = [];
  const { min, max } = getLimits(slug);
  if (!['back', 'lay'].includes(bet.side))
    errors.push('side must be back or lay');
  if (!bet.selection) errors.push('selection required');
  if (!(bet.odds > 1)) errors.push('odds must be > 1');
  if (!Number.isFinite(bet.stake)) errors.push('stake must be a number');
  else if (bet.stake < min || bet.stake > max)
    errors.push(`stake must be between ${min} and ${max}`);
  if (bet.side === 'lay' && !allowLay)
    errors.push('lay not allowed on this market');
  // half-loss markets cannot be laid (no clean lay settlement)
  if (bet.side === 'lay' && isHalfLossMarket(slug, bet.selection))
    errors.push('lay not allowed on this market');
  return errors;
}

function isHalfLossMarket(slug, selection) {
  const fam = familyOf(slug);
  const sel = String(selection || '').toLowerCase();
  if (fam === 'lucky7')
    return ['low', 'high', 'lowcard', 'highcard'].includes(sel);
  if (fam === 'aaa') return ['under7', 'over7'].includes(sel);
  if (fam === 'dt') return ['dragon', 'tiger'].includes(sel);
  return false;
}

// --------------------------------------------------------------- settlement
/**
 * @returns {{ payout:number, net:number, exposure:number, outcome:string }}
 * payout = gross amount credited back to balance
 * net    = payout - exposure (final P&L)
 */
function settleBet(bet, selectionOutcome) {
  const exposure = calcExposure(bet);
  let payout = 0;
  let outcome = selectionOutcome;

  if (bet.side === 'back') {
    if (selectionOutcome === 'win') payout = bet.stake * bet.odds;
    else if (selectionOutcome === 'push') payout = bet.stake;
    else if (selectionOutcome === 'half_loss')
      payout = Math.round(bet.stake * 0.5);
    else payout = 0;
  } else {
    // lay: wins when the laid selection loses
    if (selectionOutcome === 'lose') {
      payout = exposure + bet.stake;
      outcome = 'win';
    } else if (selectionOutcome === 'win') {
      payout = 0;
      outcome = 'lose';
    } else if (selectionOutcome === 'push') payout = exposure;
    else payout = exposure; // half_loss on lay is blocked at validation
  }
  payout = round2(payout);
  return { payout, net: round2(payout - exposure), exposure, outcome };
}

// ----------------------------------------------------- card / rank helpers
const isRed = (c) => c.suit === 'H' || c.suit === 'D';
const rankVal = (c) => c.rank; // 1..13 (A=1, J=11, Q=12, K=13)
const bool = (v) => (v ? 'win' : 'lose');

// ------------------------------------------------------------ Lucky 7 family
// result: { card:{rank,suit} }
function evalLucky7(sel, { card }) {
  const r = card.rank;
  const [key, arg] = sel.split(':');
  switch (key) {
    case 'low':
      return r === 7 ? 'half_loss' : bool(r < 7);
    case 'high':
      return r === 7 ? 'half_loss' : bool(r > 7);
    case 'seven':
      return bool(r === 7);
    case 'even':
      return bool(r % 2 === 0);
    case 'odd':
      return bool(r % 2 === 1);
    case 'red':
      return bool(isRed(card));
    case 'black':
      return bool(!isRed(card));
    case 'card':
      return bool(r === Number(arg));
    case 'group': {
      // group:1 (A-3) 2 (4-6) 3 (8-10) 4 (J-K)
      const g = { 1: [1, 3], 2: [4, 6], 3: [8, 10], 4: [11, 13] }[arg];
      return bool(g && r >= g[0] && r <= g[1]);
    }
    default:
      throw new Error(`Unknown lucky7 selection: ${sel}`);
  }
}

// --------------------------------------------------- Amar Akbar Anthony family
function evalAAA(sel, { card }) {
  const r = card.rank;
  const [key, arg] = sel.split(':');
  switch (key) {
    case 'amar':
      return bool(r >= 1 && r <= 6);
    case 'akbar':
      return bool(r >= 7 && r <= 10);
    case 'anthony':
      return bool(r >= 11);
    case 'even':
      return bool(r % 2 === 0);
    case 'odd':
      return bool(r % 2 === 1);
    case 'red':
      return bool(isRed(card));
    case 'black':
      return bool(!isRed(card));
    case 'under7':
      return r === 7 ? 'half_loss' : bool(r < 7);
    case 'over7':
      return r === 7 ? 'half_loss' : bool(r > 7);
    case 'card':
      return bool(r === Number(arg));
    default:
      throw new Error(`Unknown aaa selection: ${sel}`);
  }
}

// ---------------------------------------------------------- Dragon Tiger
// result: { dragon:{rank,suit}, tiger:{rank,suit} }   (Ace low, King high)
function evalDragonTiger(sel, { dragon, tiger }) {
  const tie = dragon.rank === tiger.rank;
  const [key, who, arg] = sel.split(':'); // e.g. "dragon", "pair:dragon", "color:tiger:red"
  const pick = (w) => (w === 'dragon' ? dragon : tiger);
  switch (key) {
    case 'dragon':
      return tie ? 'half_loss' : bool(dragon.rank > tiger.rank);
    case 'tiger':
      return tie ? 'half_loss' : bool(tiger.rank > dragon.rank);
    case 'tie':
      return bool(tie);
    case 'suitedtie':
      return bool(tie && dragon.suit === tiger.suit);
    case 'pair':
      return bool(tie); // spec: pair payout 11 on equal rank
    case 'color':
      return bool(arg === 'red' ? isRed(pick(who)) : !isRed(pick(who)));
    case 'parity':
      return bool(
        arg === 'even' ? pick(who).rank % 2 === 0 : pick(who).rank % 2 === 1
      );
    default:
      throw new Error(`Unknown dt selection: ${sel}`);
  }
}

// ---------------------------------------------------------------- Baccarat
// result: { playerPoints, bankerPoints, playerPair, bankerPair }
function evalBaccarat(sel, r) {
  const tie = r.playerPoints === r.bankerPoints;
  switch (sel) {
    case 'player':
      return tie ? 'push' : bool(r.playerPoints > r.bankerPoints);
    case 'banker':
      return tie ? 'push' : bool(r.bankerPoints > r.playerPoints); // odds 1.95 => 5% commission
    case 'tie':
      return bool(tie);
    case 'playerPair':
      return bool(r.playerPair);
    case 'bankerPair':
      return bool(r.bankerPair);
    case 'eitherPair':
      return bool(r.playerPair || r.bankerPair);
    default:
      throw new Error(`Unknown baccarat selection: ${sel}`);
  }
}

// ------------------------------------------------------------- Teen Patti
// 3-card hand ranking. hand = [{rank,suit} x3]
function rankHand(hand) {
  const rs = hand.map((c) => c.rank).sort((a, b) => a - b);
  const flush = hand.every((c) => c.suit === hand[0].suit);
  const trio = rs[0] === rs[2];
  const pair = rs[0] === rs[1] || rs[1] === rs[2];
  // straight: consecutive, plus A-2-3 and Q-K-A valid, K-A-2 invalid
  let straight = false;
  let high = [...rs].map((r) => (r === 1 ? 14 : r)).sort((a, b) => b - a);
  if (new Set(rs).size === 3) {
    if (rs[2] - rs[0] === 2) straight = true;
    else if (rs[0] === 1 && rs[1] === 12 && rs[2] === 13)
      straight = true; // Q K A
    else if (rs[0] === 1 && rs[1] === 2 && rs[2] === 3) {
      straight = true;
      high = [3, 2, 1];
    }
  }
  let cat = 1;
  if (trio) cat = 6;
  else if (straight && flush) cat = 5;
  else if (straight) cat = 4;
  else if (flush) cat = 3;
  else if (pair) {
    cat = 2;
    const p = rs[0] === rs[1] ? rs[0] : rs[1];
    const k = rs[0] === rs[1] ? rs[2] : rs[0];
    high = [p === 1 ? 14 : p, k === 1 ? 14 : k];
  }
  return { cat, high };
}

function compareHands(a, b) {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1;
  for (let i = 0; i < Math.max(a.high.length, b.high.length); i++) {
    const x = a.high[i] || 0,
      y = b.high[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

const PAIR_PLUS_ODDS = { 2: 2, 3: 5, 4: 7, 6: 31, 5: 41 }; // cat -> odds (1:1,4:1,6:1,30:1,40:1)

const baccaratValue = (h) =>
  h.reduce((s, c) => s + (c.rank >= 10 ? 0 : c.rank), 0) % 10;
const sumTotal = (h) => h.reduce((s, c) => s + c.rank, 0);

// result: { A:[3 cards], B:[3 cards] }  muflis=true inverts the winner
function evalTeen(sel, { A, B }, { muflis = false } = {}) {
  const ra = rankHand(A),
    rb = rankHand(B);
  let cmp = compareHands(ra, rb);
  if (muflis) cmp = -cmp;
  const [key, who] = sel.split(':'); // "playerA", "pairplus:A", "total:A", "baccarat:A", "redblack:red"
  const hand = who === 'B' ? B : A;
  switch (key) {
    case 'playerA':
      return cmp === 0 ? 'push' : bool(cmp > 0);
    case 'playerB':
      return cmp === 0 ? 'push' : bool(cmp < 0);
    case 'pairplus':
      return bool(rankHand(hand).cat >= 2); // payout via bet.odds
    case 'total': {
      const ta = sumTotal(A),
        tb = sumTotal(B);
      if (ta === tb) return 'half_loss';
      return bool(who === 'A' ? ta > tb : tb > ta);
    }
    case 'baccarat': {
      const va = baccaratValue(A),
        vb = baccaratValue(B);
      if (va === vb) return 'push';
      return bool(who === 'A' ? va > vb : vb > va);
    }
    case 'redblack': {
      const all = [...A, ...B];
      const reds = all.filter(isRed).length;
      return bool(who === 'red' ? reds >= 3 : all.length - reds >= 3);
    }
    default:
      throw new Error(`Unknown teen selection: ${sel}`);
  }
}

// ---------------------------------------------------------------- Roulette
function evalRoulette(sel, { number: n }) {
  const [key, arg] = sel.split(':');
  const x = Number(arg);
  if (key === 'straight') return bool(n === x);
  if (
    key === 'split' ||
    key === 'street' ||
    key === 'corner' ||
    key === 'sixline'
  ) {
    return bool(arg.split('-').map(Number).includes(n));
  }
  if (n === 0) return 'lose'; // zero kills all outside bets
  switch (key) {
    case 'red':
      return bool(RED_SET.has(n));
    case 'black':
      return bool(!RED_SET.has(n));
    case 'even':
      return bool(n % 2 === 0);
    case 'odd':
      return bool(n % 2 === 1);
    case 'low':
      return bool(n >= 1 && n <= 18);
    case 'high':
      return bool(n >= 19 && n <= 36);
    case 'dozen':
      return bool(n > (x - 1) * 12 && n <= x * 12);
    case 'column':
      return bool(n % 3 === (x === 3 ? 0 : x));
    default:
      throw new Error(`Unknown roulette selection: ${sel}`);
  }
}

// ----------------------------------------------------------- Sic Bo / dice
// result: { dice:[d1,d2,d3] }
function evalSicBo(sel, { dice }) {
  const sum = dice.reduce((a, b) => a + b, 0);
  const triple = dice[0] === dice[1] && dice[1] === dice[2];
  const [key, arg] = sel.split(':');
  const x = Number(arg);
  switch (key) {
    case 'small':
      return bool(!triple && sum >= 4 && sum <= 10);
    case 'big':
      return bool(!triple && sum >= 11 && sum <= 17);
    case 'even':
      return bool(sum % 2 === 0);
    case 'odd':
      return bool(sum % 2 === 1);
    case 'anytriple':
      return bool(triple);
    case 'triple':
      return bool(triple && dice[0] === x);
    case 'double':
      return bool(dice.filter((d) => d === x).length >= 2);
    case 'sum':
      return bool(sum === x);
    case 'single':
      return bool(dice.includes(x));
    default:
      throw new Error(`Unknown sicbo selection: ${sel}`);
  }
}

// ------------------------------------------------------------------ 32 Cards
// result: { cards:{8:rank,9:rank,10:rank,11:rank} }  base points + card value
function evalCard32(sel, { cards }) {
  const score = {};
  [8, 9, 10, 11].forEach((p) => {
    score[p] = p + cards[p];
  });
  const max = Math.max(...Object.values(score));
  const winners = Object.keys(score).filter((p) => score[p] === max);
  const p = sel.split(':')[1] || sel.replace('player', '');
  if (!winners.includes(String(p))) return 'lose';
  return winners.length > 1 ? 'push' : 'win';
}

// ------------------------------------------------------------- Andar Bahar
// result: { winner:'andar'|'bahar', cardsDealt:number }
function evalAndarBahar(sel, { winner, cardsDealt }) {
  if (sel === 'andar' || sel === 'bahar') return bool(winner === sel);
  const m = sel.match(/^cards:(\d+)-(\d+)$/); // cards:1-5 ... cards:41-999
  if (m) return bool(cardsDealt >= Number(m[1]) && cardsDealt <= Number(m[2]));
  throw new Error(`Unknown andar bahar selection: ${sel}`);
}

// -------------------------------------------------------------------- Matka
// result: { open:digit, close:digit, openPana:'147', closePana:'258' }
function evalMatka(sel, r) {
  let key = '';
  let arg = '';
  const selStr = String(sel || '').trim();
  if (selStr.includes(':')) {
    [key, arg] = selStr.split(':');
  } else if (
    /^\d+\s*single$/i.test(selStr) ||
    /^single\s*[-:]?\s*\d+$/i.test(selStr)
  ) {
    key = 'single';
    arg = selStr.replace(/\D/g, '');
  } else if (/line\s*1/i.test(selStr)) {
    key = 'line1';
  } else if (/line\s*2/i.test(selStr)) {
    key = 'line2';
  } else if (/odd/i.test(selStr)) {
    key = 'odd';
  } else if (/even/i.test(selStr)) {
    key = 'even';
  } else if (/jodi\s*(\d+)/i.test(selStr) || /^\d{2}$/.test(selStr)) {
    key = 'jodi';
    arg = selStr.replace(/\D/g, '');
  } else if (
    /pana\s*(\d+)/i.test(selStr) ||
    /sp\s*[-:]?\s*(\d+)/i.test(selStr) ||
    /^\d{3}$/.test(selStr)
  ) {
    key = 'sp';
    arg = selStr.replace(/\D/g, '');
  } else if (/dp\s*[-:]?\s*(\d+)/i.test(selStr)) {
    key = 'dp';
    arg = selStr.replace(/\D/g, '');
  } else if (
    /trio\s*[-:]?\s*(\d+)/i.test(selStr) ||
    /tp\s*[-:]?\s*(\d+)/i.test(selStr)
  ) {
    key = 'trio';
    arg = selStr.replace(/\D/g, '');
  } else {
    key = selStr.toLowerCase();
  }

  const sortedOpen = String(r.openPana ?? '')
    .split('')
    .sort()
    .join('');
  const sortedClose = String(r.closePana ?? '')
    .split('')
    .sort()
    .join('');
  switch (key) {
    case 'single':
      return bool(Number(arg) === r.open || Number(arg) === r.close);
    case 'line1':
      return bool(
        [1, 2, 3, 4, 5].includes(r.open) || [1, 2, 3, 4, 5].includes(r.close)
      );
    case 'line2':
      return bool(
        [6, 7, 8, 9, 0].includes(r.open) || [6, 7, 8, 9, 0].includes(r.close)
      );
    case 'odd':
      return bool(Number(r.open) % 2 === 1 || Number(r.close) % 2 === 1);
    case 'even':
      return bool(Number(r.open) % 2 === 0 || Number(r.close) % 2 === 0);
    case 'jodi':
      // open+close dono rounds ka result chahiye; adha result ho to pending rho
      if (r.open === undefined || r.close === undefined) {
        throw new Error('jodi needs both open and close results');
      }
      return bool(arg === `${r.open}${r.close}`);
    case 'pana':
    case 'sp': {
      const t = String(arg).split('').sort().join('');
      return bool(t === sortedOpen || t === sortedClose);
    }
    case 'dp': {
      // 2-digit combo: pana me exactly do same + ek different (x,x,y / y,y,x)
      const [x, y] = String(arg).split('');
      const combos = [
        [x, x, y],
        [y, y, x],
      ].map((c) => [...c].sort().join(''));
      return bool(combos.includes(sortedOpen) || combos.includes(sortedClose));
    }
    case 'tp':
    case 'trio': {
      const t = String(arg).repeat(3);
      return bool(t === String(r.openPana) || t === String(r.closePana));
    }
    default:
      throw new Error(`Unknown matka selection: ${sel}`);
  }
}

// ------------------------------------------- win-code settlement (result API)
// Provider result rows carry only {mid, win}: a family-specific win code
// (roulette: the number itself, dolidana: per-die sibling rows). Selections
// whose outcome is a pure function of that code settle here; everything else
// throws so the bet stays pending instead of settling on guessed data.
const WIN_SIDE = {
  lucky7: { 1: 'low', 2: 'high', 0: 'seven', 3: 'seven' },
  aaa: { 1: 'amar', 2: 'akbar', 3: 'anthony' },
  dt: { 1: 'dragon', 2: 'tiger', 3: 'tie' },
  baccarat: { 1: 'player', 2: 'banker', 3: 'tie' },
  teen: { 1: 'playerA', 2: 'playerB', 0: 'tie' },
  muflis: { 1: 'playerA', 2: 'playerB', 0: 'tie' },
  card32: { 1: '8', 2: '9', 3: '10', 4: '11' },
};
const TRIPLE_SUMS = new Set([3, 6, 9, 12, 15, 18]);

const parseCardCode = (code) => {
  const s = String(code ?? '')
    .trim()
    .toUpperCase();
  if (!s || s === '1') return null;
  const m = s.match(/^(10|[2-9AJQK])([SHDC])/);
  if (!m) return null;
  const rMap = { A: 1, J: 11, Q: 12, K: 13 };
  const rank = rMap[m[1]] || Number(m[1]);
  return { rank, suit: m[2] };
};

const parseCardList = (cardStr) =>
  String(cardStr ?? '')
    .split(/[|,]/)
    .map(parseCardCode);

const SUIT_NAME = { S: 'spade', H: 'heart', D: 'diamond', C: 'club' };

function evalDtFromCards(sel, d, t) {
  const [key, who, arg] = sel.split(':');
  if (key === 'suit') {
    const c = who === 'dragon' ? d : t;
    return bool(SUIT_NAME[c.suit] === arg);
  }
  return evalDragonTiger(sel, { dragon: d, tiger: t });
}

function evaluateFromWinCode(slug, sel, rc) {
  const fam = familyOf(slug);
  if (fam === 'roulette') {
    if (!Number.isFinite(rc.number)) throw new Error('roulette number missing');
    return evalRoulette(sel, { number: rc.number });
  }
  if (fam === 'sicbo') {
    if (Array.isArray(rc.dice) && rc.dice.length === 3) {
      return evalSicBo(sel, { dice: rc.dice });
    }
    const sum = Number(rc.total);
    if (!Number.isFinite(sum)) throw new Error('sicbo total missing');
    const [key, arg] = sel.split(':');
    if (key === 'sum') return bool(sum === Number(arg));
    if (key === 'even') return bool(sum % 2 === 0);
    if (key === 'odd') return bool(sum % 2 === 1);
    if (key === 'small') {
      if (sum < 4 || sum > 10) return 'lose';
      if (TRIPLE_SUMS.has(sum)) throw new Error('triple ambiguity');
      return 'win';
    }
    if (key === 'big') {
      if (sum < 11 || sum > 17) return 'lose';
      if (TRIPLE_SUMS.has(sum)) throw new Error('triple ambiguity');
      return 'win';
    }
    if (key === 'anytriple') {
      if (sum === 3 || sum === 18) return 'win';
      if (TRIPLE_SUMS.has(sum)) throw new Error('triple ambiguity');
      return 'lose';
    }
    throw new Error(`selection ${sel} needs dice`);
  }

  // Try card-level evaluation when Round snapshot saved dealt cards
  const cards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
  if (fam === 'lucky7' && cards.length >= 1) {
    try {
      return evalLucky7(sel, { card: cards[0] });
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'aaa' && cards.length >= 1) {
    try {
      return evalAAA(sel, { card: cards[0] });
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'dt' && cards.length >= 2) {
    try {
      return evalDtFromCards(sel, cards[0], cards[1]);
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if ((fam === 'teen' || fam === 'muflis') && cards.length >= 6) {
    try {
      return evalTeen(
        sel,
        {
          A: [cards[0], cards[2], cards[4]],
          B: [cards[1], cards[3], cards[5]],
        },
        { muflis: fam === 'muflis' }
      );
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'baccarat' && cards.length >= 4) {
    const pCards = [cards[0], cards[2], cards[4]].filter(Boolean);
    const bCards = [cards[1], cards[3], cards[5]].filter(Boolean);
    const pts = (arr) =>
      arr.reduce((s, c) => s + (c.rank >= 10 ? 0 : c.rank), 0) % 10;
    const pPair = pCards[0] && pCards[1] && pCards[0].rank === pCards[1].rank;
    const bPair = bCards[0] && bCards[1] && bCards[0].rank === bCards[1].rank;
    if (sel === 'perfectPair')
      return bool(
        (pPair && pCards[0].suit === pCards[1].suit) ||
          (bPair && bCards[0].suit === bCards[1].suit)
      );
    if (sel === 'big') return bool(pCards.length + bCards.length >= 5);
    if (sel === 'small') return bool(pCards.length + bCards.length === 4);
    try {
      return evalBaccarat(sel, {
        playerPoints: pts(pCards),
        bankerPoints: pts(bCards),
        playerPair: Boolean(pPair),
        bankerPair: Boolean(bPair),
      });
    } catch {
      /* fall back to win-code lookup */
    }
  }

  const side = (WIN_SIDE[fam] || {})[Number(rc.win)];
  if (side) {
    const [key] = sel.split(':');
    switch (fam) {
      case 'lucky7':
        if (key === 'low' || key === 'high') {
          return side === 'seven' ? 'half_loss' : bool(side === key);
        }
        break;
      case 'aaa':
        if (key === 'amar' || key === 'akbar' || key === 'anthony') {
          return bool(side === key);
        }
        if (key === 'under7') return bool(side === 'amar');
        break;
      case 'dt':
        if (key === 'dragon' || key === 'tiger') {
          return side === 'tie' ? 'half_loss' : bool(side === key);
        }
        if (key === 'tie' || key === 'pair') return bool(side === 'tie');
        break;
      case 'baccarat':
        if (key === 'player' || key === 'banker') {
          return side === 'tie' ? 'push' : bool(side === key);
        }
        if (key === 'tie') return bool(side === 'tie');
        break;
      case 'teen':
      case 'muflis':
        if (key === 'playerA' || key === 'playerB') return bool(side === key);
        break;
      case 'card32': {
        const p = sel.split(':')[1] || sel.replace('player', '');
        if (['8', '9', '10', '11'].includes(p)) return bool(p === side);
        break;
      }
      default:
        break;
    }
  }

  // Fallback generic settlement via datedNat (e.g., Goal2 "Robert Lewandowski", Bollywood "Don", Poker "Player A")
  const dn = String(rc.datedNat ?? '')
    .trim()
    .toLowerCase();
  if (dn) {
    const cleanSel = String(sel ?? '')
      .trim()
      .toLowerCase();
    if (dn === cleanSel || dn.includes(cleanSel) || cleanSel.includes(dn)) {
      return 'win';
    }
    return 'lose';
  }

  if (!side) throw new Error(`unknown win code ${rc.win} for ${slug}`);
  throw new Error(`selection ${sel} not decidable from win code`);
}

// ------------------------------------------------------------- dispatcher
function evaluateSelection(slug, selection, result) {
  if (result && result.winCode !== undefined) {
    return evaluateFromWinCode(slug, selection, result);
  }
  switch (familyOf(slug)) {
    case 'lucky7':
      return evalLucky7(selection, result);
    case 'aaa':
      return evalAAA(selection, result);
    case 'dt':
      return evalDragonTiger(selection, result);
    case 'baccarat':
      return evalBaccarat(selection, result);
    case 'teen':
      return evalTeen(selection, result);
    case 'muflis':
      return evalTeen(selection, result, { muflis: true });
    case 'roulette':
      return evalRoulette(selection, result);
    case 'sicbo':
      return evalSicBo(selection, result);
    case 'card32':
      return evalCard32(selection, result);
    case 'andarbahar':
      return evalAndarBahar(selection, result);
    case 'matka':
      return evalMatka(selection, result);
    default:
      throw new Error(`Game not supported yet: ${slug}`);
  }
}

const MAIN_RUNNER_PREFIXES = {
  dt: new Set(['dragon', 'tiger', 'tie']),
  baccarat: new Set(['player', 'banker', 'tie']),
  teen: new Set(['playerA', 'playerB']),
  muflis: new Set(['playerA', 'playerB']),
  lucky7: new Set(['low', 'seven', 'high']),
  aaa: new Set(['amar', 'akbar', 'anthony']),
  card32: new Set(['player8', 'player9', 'player10', 'player11']),
};

/**
 * Worst-case exposure for a user's pending bets in ONE (slug, roundId).
 * Properly nets Back + Lay hedges:
 *   1) Mutually-exclusive main runners (plus tie/half-loss rules) via defaultScenarios
 *   2) Roulette numbers 0..36 via exact evalRoulette
 *   3) Any same-selection Back + Lay pair on fancy/side/non-family markets
 */
function calcRoundExposure(slug, bets) {
  if (!Array.isArray(bets) || bets.length === 0) return 0;

  const fam = familyOf(slug);
  const normalizeSel = (s) =>
    String(s ?? '')
      .trim()
      .toLowerCase();

  // Roulette shares the 0..36 wheel across all inside/outside bets
  if (fam === 'roulette') {
    let worstNet = 0;
    for (let n = 0; n <= 36; n++) {
      let scNet = 0;
      let valid = true;
      for (const bet of bets) {
        try {
          const out = evalRoulette(bet.selection, { number: n });
          scNet += settleBet(bet, out).net;
        } catch {
          valid = false;
          break;
        }
      }
      if (valid && scNet < worstNet) worstNet = scNet;
    }
    if (worstNet < 0) return round2(-worstNet);
    // Fallback if any bet used non-canonical selection string
    const fallbackGroups = new Map();
    for (const bet of bets) {
      const k = normalizeSel(bet.selection);
      if (!fallbackGroups.has(k)) fallbackGroups.set(k, []);
      fallbackGroups.get(k).push(bet);
    }
    let exp = 0;
    for (const group of fallbackGroups.values()) {
      let wNet = 0;
      let lNet = 0;
      for (const b of group) {
        wNet += settleBet(b, 'win').net;
        lNet += settleBet(b, 'lose').net;
      }
      exp += Math.max(0, -Math.min(wNet, lNet));
    }
    return round2(exp);
  }

  const mainSet = MAIN_RUNNER_PREFIXES[fam] || null;
  const mainBets = [];
  const otherGroups = new Map();

  for (const bet of bets) {
    const rawSel = String(bet.selection ?? '').trim();
    if (mainSet && mainSet.has(rawSel)) {
      mainBets.push(bet);
    } else {
      const k = rawSel.toLowerCase();
      if (!otherGroups.has(k)) otherGroups.set(k, []);
      otherGroups.get(k).push(bet);
    }
  }

  let totalExp = 0;

  // 1. Mutually exclusive main runners bucket
  if (mainBets.length > 0) {
    const scenarios = defaultScenarios(slug);
    if (scenarios.length > 0) {
      let worstNet = 0;
      for (const sc of scenarios) {
        let scNet = 0;
        for (const bet of mainBets) {
          const out = evaluateSelection(slug, bet.selection, sc.result);
          scNet += settleBet(bet, out).net;
        }
        if (scNet < worstNet) worstNet = scNet;
      }
      totalExp += Math.max(0, -worstNet);
    } else {
      for (const b of mainBets) {
        totalExp += calcExposure(b);
      }
    }
  }

  // 2. Per-selection Back/Lay hedging buckets (covers all side/fancy/generic markets)
  for (const group of otherGroups.values()) {
    let winNet = 0;
    let loseNet = 0;
    for (const bet of group) {
      winNet += settleBet(bet, 'win').net;
      loseNet += settleBet(bet, 'lose').net;
    }
    totalExp += Math.max(0, -Math.min(winNet, loseNet));
  }

  return round2(totalExp);
}

/**
 * Total casino exposure across all pending CasinoBet docs of a user,
 * grouped by (slug, roundId) so hedged positions net accurately.
 */
function calcTotalCasinoExposure(allPendingBets) {
  if (!Array.isArray(allPendingBets) || allPendingBets.length === 0) return 0;
  const byRound = new Map();
  for (const bet of allPendingBets) {
    const key = `${bet.slug || ''}::${bet.roundId || ''}`;
    if (!byRound.has(key)) byRound.set(key, []);
    byRound.get(key).push(bet);
  }
  let total = 0;
  for (const group of byRound.values()) {
    total += calcRoundExposure(group[0]?.slug, group);
  }
  return round2(total);
}

// -------------------------------------------------------------- nation book
/**
 * Live P&L per scenario. scenarios = [{ id, result }]
 * pnl(scenario) = sum over bets of (payout - exposure)  -> works for every market
 * incl. half-loss, push and lay, so no hand-written formula can drift.
 */
function nationBook(slug, bets, scenarios) {
  const book = {};
  const fam = familyOf(slug);
  const mainSet = MAIN_RUNNER_PREFIXES[fam] || null;
  const mainBets = mainSet
    ? bets.filter((b) => mainSet.has(String(b.selection ?? '')))
    : [];

  for (const sc of scenarios) {
    let pnl = 0;
    for (const bet of mainBets) {
      const o = evaluateSelection(slug, bet.selection, sc.result);
      pnl += settleBet(bet, o).net;
    }
    book[sc.id] = round2(pnl);
  }

  // Add per-selection hedged P&L if won (covers side bets & non-family markets)
  const bySel = new Map();
  for (const b of bets) {
    const k = String(b.selection ?? '').trim();
    if (!k || (mainSet && mainSet.has(k))) continue;
    if (!bySel.has(k)) bySel.set(k, []);
    bySel.get(k).push(b);
  }
  for (const [k, group] of bySel.entries()) {
    let winPnl = 0;
    for (const b of group) winPnl += settleBet(b, 'win').net;
    const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    book[k] = round2(winPnl);
    if (normKey && normKey !== k) book[normKey] = round2(winPnl);
  }
  return book;
}

const c = (rank, suit = 'S') => ({ rank, suit });
/** Main-runner scenarios for the live book (cards are representative). */
function defaultScenarios(slug) {
  switch (familyOf(slug)) {
    case 'dt':
      return [
        { id: 'dragon', result: { dragon: c(10), tiger: c(3) } },
        { id: 'tiger', result: { dragon: c(3), tiger: c(10) } },
        { id: 'tie', result: { dragon: c(7), tiger: c(7) } },
      ];
    case 'teen':
    case 'muflis':
      return [
        {
          id: 'A',
          result: {
            A: [c(13), c(13, 'H'), c(2)],
            B: [c(9), c(5, 'H'), c(2, 'C')],
          },
        },
        {
          id: 'B',
          result: {
            A: [c(9), c(5, 'H'), c(2, 'C')],
            B: [c(13), c(13, 'H'), c(2)],
          },
        },
      ];
    case 'lucky7':
      return [
        { id: 'low', result: { card: c(3) } },
        { id: 'seven', result: { card: c(7) } },
        { id: 'high', result: { card: c(10) } },
      ];
    case 'aaa':
      return [
        { id: 'amar', result: { card: c(3) } },
        { id: 'akbar', result: { card: c(8) } },
        { id: 'anthony', result: { card: c(12) } },
      ];
    case 'baccarat':
      return [
        { id: 'player', result: { playerPoints: 8, bankerPoints: 3 } },
        { id: 'banker', result: { playerPoints: 3, bankerPoints: 8 } },
        { id: 'tie', result: { playerPoints: 5, bankerPoints: 5 } },
      ];
    case 'card32':
      return [
        { id: 'player8', result: { cards: { 8: 10, 9: 1, 10: 1, 11: 1 } } },
        { id: 'player9', result: { cards: { 8: 1, 9: 10, 10: 1, 11: 1 } } },
        { id: 'player10', result: { cards: { 8: 1, 9: 1, 10: 10, 11: 1 } } },
        { id: 'player11', result: { cards: { 8: 1, 9: 1, 10: 1, 11: 10 } } },
      ];
    default:
      return [];
  }
}

// -------------------------------------------------------------- statistics
const pct = (n, total) => (total ? round2((n / total) * 100) : 0);

function baccaratStats(history) {
  // history: ['p'|'b'|'t']
  const n = history.length;
  const cnt = (k) => history.filter((x) => x === k).length;
  return { p: pct(cnt('p'), n), b: pct(cnt('b'), n), t: pct(cnt('t'), n) };
}

function dragonTigerStats(history) {
  // history: ['D'|'T'|'TIE']
  const n = history.length;
  const cnt = (k) => history.filter((x) => x === k).length;
  let streak = 0;
  for (let i = n - 1; i >= 0 && history[i] === history[n - 1]; i--) streak++;
  return {
    dragon: pct(cnt('D'), n),
    tiger: pct(cnt('T'), n),
    tie: pct(cnt('TIE'), n),
    streak: { side: history[n - 1] || null, length: streak },
  };
}

function lucky7Stats(ranks) {
  const n = ranks.length;
  return {
    low: pct(ranks.filter((r) => r < 7).length, n),
    high: pct(ranks.filter((r) => r > 7).length, n),
    seven: pct(ranks.filter((r) => r === 7).length, n),
  };
}

function rouletteStats(numbers) {
  const n = numbers.length;
  const freq = Array(37).fill(0);
  numbers.forEach((x) => {
    freq[x]++;
  });
  const order = [...freq.keys()].sort((a, b) => freq[b] - freq[a]);
  const nz = numbers.filter((x) => x > 0);
  return {
    dozen: [1, 2, 3].map((d) =>
      pct(nz.filter((x) => x > (d - 1) * 12 && x <= d * 12).length, n)
    ),
    column: [1, 2, 3].map((k) =>
      pct(nz.filter((x) => x % 3 === (k === 3 ? 0 : k)).length, n)
    ),
    red: pct(nz.filter((x) => RED_SET.has(x)).length, n),
    black: pct(nz.filter((x) => !RED_SET.has(x)).length, n),
    odd: pct(nz.filter((x) => x % 2 === 1).length, n),
    even: pct(nz.filter((x) => x % 2 === 0).length, n),
    low: pct(nz.filter((x) => x <= 18).length, n),
    high: pct(nz.filter((x) => x >= 19).length, n),
    hot: order.slice(0, 5),
    cold: order.slice(-5).reverse(),
  };
}

export {
  baccaratStats,
  calcExposure,
  calcRoundExposure,
  calcTotalCasinoExposure,
  compareHands,
  defaultScenarios,
  dragonTigerStats,
  evaluateSelection,
  familyOf,
  GAME_FAMILY,
  getLimits,
  isHalfLossMarket,
  lucky7Stats,
  nationBook,
  PAIR_PLUS_ODDS,
  rankHand,
  rouletteStats,
  settleBet,
  validateBet,
};
