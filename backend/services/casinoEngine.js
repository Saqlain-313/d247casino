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
  lucky5: ['lucky5'],
  lucky15: ['lucky15'],
  aaa: ['aaa', 'aaa2', 'vaaa'],
  dt: ['dt20', 'dt202', 'dt6', 'pdt20', 'pdt6', 'vdt6'],
  dtl20: ['dtl20', 'vdtl20'],
  trio: ['trio', 'vtrio'],
  bollywood: ['btable', 'btable2', 'vbtable'],
  mogambo: ['mogambo'],
  lottcard: ['lottcard'],
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
    'teensin',
  ],
  teen1: ['teen1', 'teen120'],
  teen8: ['teen8'],
  teen9: ['teen9'],
  patti2: ['patti2'],
  muflis: ['teenmuf', 'vteenmuf'],
  roulette: ['roulette11', 'roulette12', 'roulette13', 'ourroullete'],
  sicbo: ['sicbo', 'sicbo2'],
  dolidana: ['dolidana'],
  ballbyball: ['ballbyball'],
  cmatch20: ['cmatch20'],
  goal: ['goal', 'goal2'],
  race2: ['race2'],
  race17: ['race17'],
  race20: ['race20'],
  superover: ['superover', 'superover2', 'superover3', 'cricketv3'],
  card32: ['card32', 'card32eu', 'pcard32'],
  poker: ['poker', 'poker20', 'poker6'],
  '3cardj': ['3cardj'],
  queen: ['queen'],
  trap: ['trap'],
  notenum: ['notenum'],
  dum10: ['dum10'],
  cmeter1: ['cmeter1'],
  andarbahar: ['ab20', 'abj', 'ab3', 'ab4'],
  matka: ['worli', 'worli2', 'worli3'],
};

const ONE_DAY_DT_SLUGS = new Set(['dt6', 'vdt6', 'pdt6']);
const SUIT_RANK = { S: 4, H: 3, C: 2, D: 1 }; // D247: Spade > Heart > Club > Diamond

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
  const s = String(slug || '').toLowerCase();
  const fam = familyOf(s);
  const sel = String(selection || '').toLowerCase();
  if (fam === 'lucky7' || fam === 'lucky5')
    return ['low', 'high', 'lowcard', 'highcard'].includes(sel);
  if (fam === 'aaa') return ['under7', 'over7'].includes(sel);
  // 1-day Dragon Tiger (dt6/vdt6/pdt6) uses 1 deck with suit tiebreak -> Back+Lay allowed, NO half-loss.
  if (fam === 'dt' && !ONE_DAY_DT_SLUGS.has(s)) {
    return ['dragon', 'tiger'].includes(sel);
  }
  if (fam === 'teen' && (sel === 'total:a' || sel === 'total:b')) return true;
  if (fam === 'teen1') {
    if (s === 'teen120' && ['player', 'dealer'].includes(sel)) return true;
    if (sel.startsWith('up7:') || sel.startsWith('down7:')) return true;
  }
  if (
    fam === 'dolidana' &&
    ['lt7', 'gt7', 'lessthan7', 'greaterthan7'].includes(sel)
  )
    return true;
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

// ------------------------------------------------------------ Lucky 5 (11-card deck, pivot 6)
// Deck: A(1)..10, J(11). Low=1..5, High=7..11, Card 6 = half_loss on Low/High.
function evalLucky5(sel, { card }) {
  const r = card.rank;
  const [key, arg] = sel.split(':');
  switch (key) {
    case 'low':
      return r === 6 ? 'half_loss' : bool(r < 6);
    case 'high':
      return r === 6 ? 'half_loss' : bool(r > 6);
    case 'six':
      return bool(r === 6);
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
    default:
      throw new Error(`Unknown lucky5 selection: ${sel}`);
  }
}

// ------------------------------------------------------------ Lucky 15 (Runs market)
// 1: 0 Runs, 2: 1 Runs, 3: 2 Runs, 4: 4 Runs, 5: 6 Runs, 6: Wicket
function evalLucky15(sel, r) {
  const map = {
    1: 'runs:0',
    2: 'runs:1',
    3: 'runs:2',
    4: 'runs:4',
    5: 'runs:6',
    6: 'wicket',
  };
  const outcome = r.outcome || map[Number(r.win)];
  if (!outcome) throw new Error('lucky15 outcome missing');
  if (
    ['runs:0', 'runs:1', 'runs:2', 'runs:4', 'runs:6', 'wicket'].includes(sel)
  ) {
    return bool(outcome === sel);
  }
  throw new Error(`Unknown lucky15 selection: ${sel}`);
}

// ------------------------------------------------------------ Mogambo
// Daga/Teja gets 2 cards (cards[0], cards[1]), Mogambo gets 1 card (cards[2]).
// High card wins (A=14 high, S>H>C>D). 3 Card Total uses A=1..K=13; <3 cards -> push.
function evalMogambo(sel, r) {
  const [key, arg] = String(sel).split(':');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (key === 'mogambo' || key === 'dagateja') {
    const side = r.winner || { 1: 'mogambo', 2: 'dagateja' }[Number(r.win)];
    if (side) return bool(side === key);
    if (cards.length >= 3) {
      const score = (c) =>
        (c.rank === 1 ? 14 : c.rank) * 10 + (SUIT_RANK[c.suit] || 0);
      const dagaBest = Math.max(score(cards[0]), score(cards[1]));
      const mogScore = score(cards[2]);
      return bool(
        key === 'mogambo' ? mogScore > dagaBest : dagaBest > mogScore
      );
    }
    throw new Error('mogambo winner missing');
  }
  if (key === 'total') {
    const line = Number(arg);
    if (!Number.isFinite(line))
      throw new Error(`Invalid mogambo total: ${sel}`);
    if (cards.length === 0) throw new Error('mogambo cards missing for total');
    if (cards.length < 3) return 'push'; // Official D247 rule: <3 cards revealed -> returned
    const sum = cards.slice(0, 3).reduce((s, c) => s + c.rank, 0);
    return bool(sum >= line);
  }
  throw new Error(`Unknown mogambo selection: ${sel}`);
}

// ------------------------------------------------------------ Lottcard (Lottery Card)
// 3 cards A..10 -> digits 1..9, 0 (10 -> 0). Single=1st, Double=1st+2nd, Triple=1st+2nd+3rd.
function parseLottDigits(r) {
  if (Array.isArray(r.digits) && r.digits.length >= 3) {
    return r.digits.slice(0, 3).map((d) => String(Number(d) % 10));
  }
  if (r.win !== undefined && r.win !== null) {
    const digs = String(r.win).match(/\d/g);
    if (digs && digs.length >= 3) return digs.slice(0, 3);
  }
  if (Array.isArray(r.cards) && r.cards.length >= 3) {
    return r.cards.slice(0, 3).map((c) => String(c.rank === 10 ? 0 : c.rank));
  }
  return null;
}

function evalLottcard(sel, r) {
  const digits = parseLottDigits(r);
  if (!digits) throw new Error('lottcard 3-digit result missing');
  const m = String(sel).match(/^lott:(single|double|triple):(\d{1,3})$/);
  if (!m) throw new Error(`Unknown lottcard selection: ${sel}`);
  const [, mode, pick] = m;
  if (mode === 'single') return bool(pick === digits[0]);
  if (mode === 'double') return bool(pick === `${digits[0]}${digits[1]}`);
  if (mode === 'triple')
    return bool(pick === `${digits[0]}${digits[1]}${digits[2]}`);
  throw new Error(`Unknown lottcard mode: ${sel}`);
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
// suitTiebreak=true for 1-day single-deck games (dt6/vdt6/pdt6): Spade>Heart>Club>Diamond
function evalDragonTiger(
  sel,
  { dragon, tiger },
  { suitTiebreak = false } = {}
) {
  const tie = dragon.rank === tiger.rank;
  const [key, who, arg] = sel.split(':'); // e.g. "dragon", "pair", "color:tiger:red", "suit:dragon:spade"
  const pick = (w) => (w === 'dragon' ? dragon : tiger);
  switch (key) {
    case 'dragon':
      if (!tie) return bool(dragon.rank > tiger.rank);
      if (suitTiebreak) {
        return bool(
          (SUIT_RANK[dragon.suit] || 0) > (SUIT_RANK[tiger.suit] || 0)
        );
      }
      return 'half_loss';
    case 'tiger':
      if (!tie) return bool(tiger.rank > dragon.rank);
      if (suitTiebreak) {
        return bool(
          (SUIT_RANK[tiger.suit] || 0) > (SUIT_RANK[dragon.suit] || 0)
        );
      }
      return 'half_loss';
    case 'tie':
      return bool(tie);
    case 'suitedtie':
      return bool(tie && dragon.suit === tiger.suit);
    case 'pair':
      return bool(tie); // spec: pair payout on equal rank
    case 'color':
      return bool(arg === 'red' ? isRed(pick(who)) : !isRed(pick(who)));
    case 'parity':
      return bool(
        arg === 'even' ? pick(who).rank % 2 === 0 : pick(who).rank % 2 === 1
      );
    case 'suit':
      return bool(SUIT_NAME[pick(who).suit] === arg);
    case 'card':
      return bool(pick(who).rank === Number(arg));
    default:
      throw new Error(`Unknown dt selection: ${sel}`);
  }
}

// --------------------------------------------------- 20-20 Dragon Tiger Lion
// result: { dragon:{rank,suit}, tiger:{rank,suit}, lion:{rank,suit} }
// Single 52-card deck: Ace=1..King=13, tiebreak Spade>Heart>Club>Diamond
function compareCardAsc(a, b) {
  if (a.rank !== b.rank) return a.rank > b.rank ? 1 : -1;
  const sa = SUIT_RANK[a.suit] || 0;
  const sb = SUIT_RANK[b.suit] || 0;
  return sa === sb ? 0 : sa > sb ? 1 : -1;
}

function evalDtl20(sel, { dragon, tiger, lion }) {
  const [key, who, arg] = sel.split(':');
  const map = { dragon, tiger, lion };
  const pick = (w) => map[w];
  switch (key) {
    case 'winner': {
      const target = pick(who);
      if (!target) throw new Error(`Unknown dtl20 runner: ${sel}`);
      const others = ['dragon', 'tiger', 'lion']
        .filter((k) => k !== who)
        .map((k) => map[k]);
      return bool(others.every((o) => compareCardAsc(target, o) > 0));
    }
    case 'color': {
      const c = pick(who);
      if (!c) throw new Error(`Unknown dtl20 color: ${sel}`);
      return bool(arg === 'red' ? isRed(c) : !isRed(c));
    }
    case 'parity': {
      const c = pick(who);
      if (!c) throw new Error(`Unknown dtl20 parity: ${sel}`);
      return bool(arg === 'even' ? c.rank % 2 === 0 : c.rank % 2 === 1);
    }
    case 'card': {
      const c = pick(who);
      if (!c) throw new Error(`Unknown dtl20 card: ${sel}`);
      return bool(c.rank === Number(arg));
    }
    default:
      throw new Error(`Unknown dtl20 selection: ${sel}`);
  }
}

// ---------------------------------------------------------------------- Trio
// result: { cards: [{rank,suit} x3] }
function isThreeCardStraight(cards) {
  const rs = cards.map((c) => c.rank).sort((a, b) => a - b);
  if (new Set(rs).size !== 3) return false;
  if (rs[2] - rs[0] === 2) return true; // includes A-2-3 (1,2,3)
  if (rs[0] === 1 && rs[1] === 12 && rs[2] === 13) return true; // Q-K-A
  return false; // K-A-2 invalid
}

function evalTrio(sel, { cards }) {
  if (!Array.isArray(cards) || cards.length < 3) {
    throw new Error('trio needs 3 dealt cards');
  }
  const three = cards.slice(0, 3);
  const [key, arg] = sel.split(':');
  switch (key) {
    case 'session': {
      const line = Number(arg);
      if (!Number.isFinite(line))
        throw new Error(`Invalid trio session: ${sel}`);
      const total = three.reduce((s, c) => s + c.rank, 0);
      return bool(total >= line);
    }
    case 'judge': {
      if (arg === '124')
        return bool(three.some((c) => [1, 2, 4].includes(c.rank)));
      if (arg === 'jqk')
        return bool(three.some((c) => [11, 12, 13].includes(c.rank)));
      throw new Error(`Unknown trio judgement: ${sel}`);
    }
    case 'twored':
      return bool(three.filter(isRed).length === 2);
    case 'twoblack':
      return bool(three.filter((c) => !isRed(c)).length === 2);
    case 'twoodd':
      return bool(three.filter((c) => c.rank % 2 === 1).length === 2);
    case 'twoeven':
      return bool(three.filter((c) => c.rank % 2 === 0).length === 2);
    case 'pair':
      // Official D247 rule: Trio is also valid for Pair
      return bool(new Set(three.map((c) => c.rank)).size <= 2);
    case 'flush':
      // Official D247 rule: Straight Flush is also valid for Flush
      return bool(three.every((c) => c.suit === three[0].suit));
    case 'straight':
      // Official D247 rule: Straight Flush is also valid for Straight
      return bool(isThreeCardStraight(three));
    case 'trio':
      return bool(
        three[0].rank === three[1].rank && three[1].rank === three[2].rank
      );
    case 'straightflush':
      return bool(
        three.every((c) => c.suit === three[0].suit) &&
          isThreeCardStraight(three)
      );
    default:
      throw new Error(`Unknown trio selection: ${sel}`);
  }
}

// ----------------------------------------------------------- Bollywood Table
// 16-card deck (J, Q, K, A x 4 suits):
// A.Don=ASS | B.AAA=AHH,ACC,ADD | C.SBG=KSS,QSS,JSS | D.DV=KDD,KCC
// E.KKPK=KHH,QCC,QDD,QHH | F.Ghulam=JHH,JCC,JDD
function bollywoodWinnerForCard(card) {
  if (!card) return null;
  const { rank: r, suit: s } = card;
  if (r === 1 && s === 'S') return 'don';
  if (r === 1) return 'aaa';
  if ([11, 12, 13].includes(r) && s === 'S') return 'sbg';
  if (r === 13 && (s === 'D' || s === 'C')) return 'dv';
  if ((r === 13 && s === 'H') || (r === 12 && s !== 'S')) return 'kkpk';
  if (r === 11 && s !== 'S') return 'ghulam';
  return null;
}

function evalBollywood(sel, { card }) {
  const [key, arg] = sel.split(':');
  const winner = bollywoodWinnerForCard(card);
  switch (key) {
    case 'don':
    case 'aaa':
    case 'sbg':
    case 'dv':
    case 'kkpk':
    case 'ghulam':
      return bool(winner === key);
    case 'odd':
      return bool([1, 11, 13].includes(card.rank)); // A, J, K
    case 'dulhadulhan':
      return bool(card.rank === 12 || card.rank === 13); // Q, K
    case 'barati':
      return bool(card.rank === 11 || card.rank === 1); // J, A
    case 'red':
      return bool(isRed(card));
    case 'black':
      return bool(!isRed(card));
    case 'card':
      return bool(card.rank === Number(arg));
    default:
      throw new Error(`Unknown bollywood selection: ${sel}`);
  }
}

// ---------------------------------------------------------------- Baccarat
// result: { playerPoints, bankerPoints, playerPair, bankerPair, perfectPair?, totalCards? }
function evalBaccarat(sel, r) {
  const tie = r.playerPoints === r.bankerPoints;
  const winPts = Math.max(
    Number(r.playerPoints || 0),
    Number(r.bankerPoints || 0)
  );
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
    case 'perfectPair':
      return bool(r.perfectPair);
    case 'big':
      return bool(Number(r.totalCards || 0) >= 5);
    case 'small':
      return bool(Number(r.totalCards || 0) === 4);
    case 'score:1-4':
      return bool(!tie && winPts >= 1 && winPts <= 4);
    case 'score:5-6':
      return bool(!tie && (winPts === 5 || winPts === 6));
    case 'score:7':
      return bool(!tie && winPts === 7);
    case 'score:8':
      return bool(!tie && winPts === 8);
    case 'score:9':
      return bool(!tie && winPts === 9);
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
const TOP9_ODDS = { 9: 4, 8: 5, 7: 6, 6: 9, 5: 31 }; // highest card -> odds (1:3,1:4,1:5,1:8,1:30)

const baccaratValue = (h) =>
  h.reduce((s, c) => s + (c.rank >= 10 ? 0 : c.rank), 0) % 10;
const sumTotal = (h) => h.reduce((s, c) => s + c.rank, 0);

const isFaceCard = (c) => c.rank >= 11 && c.rank <= 13; // J, Q, K
const faceKey = (c) => c.rank * 10 + (SUIT_RANK[c.suit] || 0);
const pointVal3Bac = (c) => (c.rank >= 10 ? 0 : c.rank);
const pointKey3Bac = (c) => pointVal3Bac(c) * 10 + (SUIT_RANK[c.suit] || 0);

// Official D247 3 Baccarat comparison (vteen20/teen20):
// 1. Trio (A > K > ... > 2)  2. All 3 face cards (highest face + suit)
// 3. Higher baccarat value; tie -> (C1) more face cards, (C2) highest face + suit,
//    (C3/C4) highest point card (9..1..10=0) + suit (S>H>C>D).
function compare3Baccarat(A, B) {
  const trioRank = (h) =>
    h[0].rank === h[1].rank && h[1].rank === h[2].rank
      ? h[0].rank === 1
        ? 14
        : h[0].rank
      : 0;
  const ta = trioRank(A),
    tb = trioRank(B);
  if (ta !== tb) return ta > tb ? 1 : -1;

  const fa = A.filter(isFaceCard),
    fb = B.filter(isFaceCard);
  const allFa = fa.length === 3 ? 1 : 0,
    allFb = fb.length === 3 ? 1 : 0;
  if (allFa !== allFb) return allFa > allFb ? 1 : -1;
  if (allFa === 1) {
    const ka = Math.max(...fa.map(faceKey));
    const kb = Math.max(...fb.map(faceKey));
    if (ka !== kb) return ka > kb ? 1 : -1;
  }

  const va = baccaratValue(A),
    vb = baccaratValue(B);
  if (va !== vb) return va > vb ? 1 : -1;

  // C1: more face cards
  if (fa.length !== fb.length) return fa.length > fb.length ? 1 : -1;
  // C2: equal face cards (> 0) -> highest face card + suit
  if (fa.length > 0) {
    const ka = Math.max(...fa.map(faceKey));
    const kb = Math.max(...fb.map(faceKey));
    if (ka !== kb) return ka > kb ? 1 : -1;
  }
  // C3 & C4: highest point card (9..1, 10=0) + suit (S>H>C>D)
  const pa = Math.max(...A.map(pointKey3Bac));
  const pb = Math.max(...B.map(pointKey3Bac));
  if (pa !== pb) return pa > pb ? 1 : -1;
  return 0;
}

// Official D247 M (Muflis) Baccarat comparison (vteenmuf/teenmuf):
// Lower baccarat value wins; tie -> hand with lowest card (2 lowest..A=14 highest);
// tie -> lowest suit (Diamond=1 < Club=2 < Heart=3 < Spade=4).
function compareMBaccarat(A, B) {
  const va = baccaratValue(A),
    vb = baccaratValue(B);
  if (va !== vb) return va < vb ? 1 : -1;
  const lowKey = (h) =>
    Math.min(
      ...h.map(
        (c) => (c.rank === 1 ? 14 : c.rank) * 10 + (SUIT_RANK[c.suit] || 0)
      )
    );
  const la = lowKey(A),
    lb = lowKey(B);
  if (la !== lb) return la < lb ? 1 : -1;
  return 0;
}

// Official D247 Consecutive Cards (vteen/teen): 2 or more consecutive ranks in hand
// (e.g. 2-3, 9-10, Q-K, A-2, A-K).
function hasConsecutivePair(hand) {
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      const a = hand[i].rank;
      const b = hand[j].rank;
      if (Math.abs(a - b) === 1) return true;
      if ((a === 1 && b === 13) || (a === 13 && b === 1)) return true;
    }
  }
  return false;
}

function top9MaxRank(hand) {
  if (rankHand(hand).cat !== 1) return null; // must be high-card only
  const maxR = Math.max(...hand.map((c) => (c.rank === 1 ? 14 : c.rank)));
  return maxR <= 9 ? maxR : null;
}

// result: { A:[3 cards], B:[3 cards], rawCards?:[6 cards] }  muflis=true inverts the winner
function evalTeen(sel, { A, B, rawCards }, { muflis = false } = {}) {
  const ra = rankHand(A),
    rb = rankHand(B);
  let cmp = compareHands(ra, rb);
  if (muflis) cmp = -cmp;
  const [key, who, arg] = sel.split(':'); // "playerA", "pairplus:A", "total:A", "baccarat:A", "redblack:A:red", "top9:A", "consec:A", "cardparity:5:odd"
  const hand = who === 'B' ? B : A;
  switch (key) {
    case 'playerA':
      return cmp === 0 ? 'push' : bool(cmp > 0);
    case 'playerB':
      return cmp === 0 ? 'push' : bool(cmp < 0);
    case 'pairplus':
      return bool(rankHand(hand).cat >= 2); // variable odds via getDynamicSettlementOdds
    case 'top9':
      return bool(top9MaxRank(hand) !== null); // variable odds via getDynamicSettlementOdds
    case 'total': {
      const ta = sumTotal(A),
        tb = sumTotal(B);
      if (ta === tb) return 'half_loss';
      return bool(who === 'A' ? ta > tb : tb > ta);
    }
    case 'baccarat': {
      const bcmp = muflis ? compareMBaccarat(A, B) : compare3Baccarat(A, B);
      if (bcmp === 0) return 'push';
      return bool(who === 'A' ? bcmp > 0 : bcmp < 0);
    }
    case 'redblack': {
      // New per-player form: redblack:A:red | redblack:B:black (2+ of 3 cards)
      if ((who === 'A' || who === 'B') && (arg === 'red' || arg === 'black')) {
        const targetHand = who === 'B' ? B : A;
        const reds = targetHand.filter(isRed).length;
        return bool(arg === 'red' ? reds >= 2 : targetHand.length - reds >= 2);
      }
      // Legacy fallback: redblack:red | redblack:black
      const all = [...A, ...B];
      const reds = all.filter(isRed).length;
      return bool(who === 'red' ? reds >= 3 : all.length - reds >= 3);
    }
    case 'consec':
      return bool(hasConsecutivePair(hand));
    case 'cardparity': {
      const idx = Number(who) - 1;
      const seq =
        Array.isArray(rawCards) && rawCards.length >= 6
          ? rawCards
          : [A[0], B[0], A[1], B[1], A[2], B[2]];
      const card = seq[idx];
      if (!card) throw new Error(`Missing card ${who} for ${sel}`);
      return bool(arg === 'even' ? card.rank % 2 === 0 : card.rank % 2 === 1);
    }
    case 'cardsuit': {
      const idx = Number(who) - 1;
      const seq =
        Array.isArray(rawCards) && rawCards.length >= 6
          ? rawCards
          : [A[0], B[0], A[1], B[1], A[2], B[2]];
      const card = seq[idx];
      if (!card) throw new Error(`Missing card ${who} for ${sel}`);
      return bool(SUIT_NAME[card.suit] === arg);
    }
    case 'cardrank': {
      const idx = Number(who) - 1;
      const seq =
        Array.isArray(rawCards) && rawCards.length >= 6
          ? rawCards
          : [A[0], B[0], A[1], B[1], A[2], B[2]];
      const card = seq[idx];
      if (!card) throw new Error(`Missing card ${who} for ${sel}`);
      return bool(card.rank === Number(arg));
    }
    case 'playersuit': {
      return bool(hand.some((c) => SUIT_NAME[c.suit] === arg));
    }
    case 'under21': {
      const tot = sumTotal(hand);
      return tot === 21 ? 'push' : bool(tot < 21);
    }
    case 'over21': {
      const tot = sumTotal(hand);
      return tot === 21 ? 'push' : bool(tot > 21);
    }
    case 'highcard': {
      return bool(rankHand(hand).cat === 1);
    }
    case 'pair': {
      return bool(rankHand(hand).cat >= 2);
    }
    case 'colorplus': {
      return bool(rankHand(hand).cat >= 3);
    }
    case 'lucky9': {
      const all = [...A, ...B];
      return bool(all.some((c) => c.rank === 9));
    }
    case 'special': {
      // Poison / Joker card is rawCards[0]
      const sp = Array.isArray(rawCards) ? rawCards[0] : null;
      if (!sp) throw new Error(`Missing poison/joker card for ${sel}`);
      if (who === 'even') return bool(sp.rank % 2 === 0);
      if (who === 'odd') return bool(sp.rank % 2 === 1);
      if (who === 'red') return bool(isRed(sp));
      if (who === 'black') return bool(!isRed(sp));
      return bool(SUIT_NAME[sp.suit] === who);
    }
    case 'unique': {
      const picks = String(who || '')
        .split('-')
        .map((x) => Number(x) - 1);
      if (
        picks.length !== 3 ||
        !Array.isArray(rawCards) ||
        rawCards.length < 6
      ) {
        throw new Error(`Invalid teenunique selection/cards: ${sel}`);
      }
      const pSet = new Set(picks);
      const myHand = picks.map((i) => rawCards[i]);
      const oppHand = [0, 1, 2, 3, 4, 5]
        .filter((i) => !pSet.has(i))
        .map((i) => rawCards[i]);
      const uCmp = compareHands(rankHand(myHand), rankHand(oppHand));
      return uCmp === 0 ? 'push' : bool(uCmp > 0);
    }
    default:
      throw new Error(`Unknown teen selection: ${sel}`);
  }
}

// -------------------------------------------------- 1-Card Teenpatti (teen1 / teen120)
function evalTeen1(sel, r, slug = 'teen1') {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  const is2020 = slug === 'teen120';
  if (s === 'player' || s === 'dealer' || s === 'tie' || s === 'pair') {
    if (cards.length >= 2) {
      const [p, d] = cards;
      const pr = p.rank === 1 ? 14 : p.rank;
      const dr = d.rank === 1 ? 14 : d.rank;
      if (s === 'tie' || s === 'pair') return bool(pr === dr);
      if (pr === dr) {
        if (is2020) return 'half_loss';
        const ps = SUIT_RANK[p.suit] || 0;
        const ds = SUIT_RANK[d.suit] || 0;
        return bool(s === 'player' ? ps > ds : ds > ps);
      }
      return bool(s === 'player' ? pr > dr : dr > pr);
    }
    const side = { 1: 'player', 2: 'dealer', 3: 'tie', 0: 'tie' }[
      Number(r.win)
    ];
    if (!side) throw new Error('teen1 result missing');
    if (s === 'tie' || s === 'pair') return bool(side === 'tie');
    if (side === 'tie') return is2020 ? 'half_loss' : 'push';
    return bool(side === s);
  }
  const udM = s.match(/^(up7|down7):(player|dealer)$/);
  if (udM) {
    const card = udM[2] === 'player' ? cards[0] : cards[1];
    if (!card) throw new Error(`teen1 card missing for ${sel}`);
    if (card.rank === 7) return 'half_loss';
    return bool(udM[1] === 'up7' ? card.rank > 7 : card.rank < 7);
  }
  throw new Error(`Unknown teen1 selection: ${sel}`);
}

// ---------------------------------------------------- Open Teenpatti (teen8: 8 players vs dealer)
function evalTeen8(sel, r) {
  const s = String(sel || '');
  const pm = s.match(/^player:([1-8])$/);
  if (pm) {
    const winStr = String(r.win ?? '').trim();
    if (winStr === '0') return 'lose';
    if (winStr) {
      const winners = winStr.split(',').map((x) => x.trim());
      return bool(winners.includes(pm[1]));
    }
    throw new Error('teen8 winner list missing');
  }
  const cards = Array.isArray(r.cards) ? r.cards : [];
  const getHand = (pNum) => {
    const i = Number(pNum) - 1;
    // Open Teenpatti deals 8x2 open cards (0..15) + 3rd card per player (16..23) + dealer (24..26)
    if (cards.length >= 24)
      return [cards[i * 2], cards[i * 2 + 1], cards[16 + i]];
    return null;
  };
  const ppM = s.match(/^pairplus:([1-8])$/);
  if (ppM) {
    const h = getHand(ppM[1]);
    if (!h) throw new Error('teen8 cards missing for pairplus');
    return bool(rankHand(h).cat >= 2);
  }
  const totM = s.match(/^total:([1-8])$/);
  if (totM) {
    const h = getHand(totM[1]);
    if (!h || cards.length < 27)
      throw new Error('teen8 cards missing for total');
    const dealerH = [cards[24], cards[25], cards[26]];
    const hp = sumTotal(h);
    const dp = sumTotal(dealerH);
    if (hp === dp) return 'push';
    return bool(hp > dp);
  }
  if (['anycolour', 'anystraight', 'anytrio', 'anystraightflush'].includes(s)) {
    if (cards.length < 24) throw new Error('teen8 cards missing for any-hand');
    const hands = [1, 2, 3, 4, 5, 6, 7, 8].map(getHand);
    const minCat = {
      anycolour: 3,
      anystraight: 4,
      anytrio: 6,
      anystraightflush: 5,
    }[s];
    return bool(
      hands.some(
        (h) =>
          rankHand(h).cat === minCat ||
          (s === 'anycolour' && rankHand(h).cat === 5)
      )
    );
  }
  throw new Error(`Unknown teen8 selection: ${sel}`);
}

// -------------------------------------------------- Teenpatti Test (teen9: Tiger/Lion/Dragon)
function evalTeen9(sel, r) {
  const s = String(sel || '');
  const sideMap = { 1: 'tiger', 2: 'lion', 3: 'dragon' };
  const wM = s.match(/^winner:(tiger|lion|dragon)$/);
  if (wM) {
    const w = r.winner || sideMap[Number(r.win)];
    if (!w) throw new Error('teen9 winner missing');
    return bool(w === wM[1]);
  }
  const catM = s.match(
    /^cat:(tiger|lion|dragon):(pair|flush|straight|trio|straightflush)$/
  );
  if (catM) {
    const cards = Array.isArray(r.cards) ? r.cards : [];
    if (cards.length < 9) throw new Error('teen9 needs 9 cards');
    const off = { tiger: 0, lion: 1, dragon: 2 }[catM[1]];
    const hand = [cards[off], cards[off + 3], cards[off + 6]];
    const cat = rankHand(hand).cat;
    const target = {
      pair: 2,
      flush: 3,
      straight: 4,
      straightflush: 5,
      trio: 6,
    }[catM[2]];
    return bool(cat === target);
  }
  throw new Error(`Unknown teen9 selection: ${sel}`);
}

// ---------------------------------------------------- 2 Cards Teenpatti (patti2)
function evalPatti2(sel, r) {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (s === 'playerA' || s === 'playerB') {
    const w =
      r.winner || { 1: 'playerA', 2: 'playerB', 0: 'tie' }[Number(r.win)];
    if (w === 'tie') return 'push';
    if (w) return bool(w === s);
    throw new Error('patti2 winner missing');
  }
  if (cards.length < 4) throw new Error('patti2 needs 4 cards');
  const A = [cards[0], cards[2]];
  const B = [cards[1], cards[3]];
  const totM = s.match(/^total:(A|B):(\d+(?:\.\d+)?)$/);
  if (totM) {
    const h = totM[1] === 'A' ? A : B;
    return bool(sumTotal(h) >= Number(totM[2]));
  }
  const mbM = s.match(/^minibacc:(A|B)$/);
  if (mbM) {
    const va = baccaratValue(A);
    const vb = baccaratValue(B);
    if (va === vb) return 'push';
    return bool(mbM[1] === 'A' ? va > vb : vb > va);
  }
  if (s === 'colorplus') {
    return bool(A[0].suit === A[1].suit || B[0].suit === B[1].suit);
  }
  throw new Error(`Unknown patti2 selection: ${sel}`);
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
    case 'combo': {
      const [a, b] = String(arg || '')
        .split('-')
        .map(Number);
      return bool(dice.includes(a) && dice.includes(b));
    }
    default:
      throw new Error(`Unknown sicbo selection: ${sel}`);
  }
}

// ------------------------------------------------------------- Doli Dana (2 dice)
// result: { dice:[d1,d2], winner?:'playerA'|'playerB' }
function evalDolidana(sel, r) {
  const [key, arg] = sel.split(':');
  if (key === 'playerA' || key === 'playerB') {
    if (r.winner) return bool(r.winner === key);
    throw new Error('dolidana main winner not resolved yet');
  }
  const dice = Array.isArray(r.dice) ? r.dice : [];
  if (dice.length < 2) throw new Error('dolidana needs 2 dice');
  const [d1, d2] = dice;
  const sum = d1 + d2;
  switch (key) {
    case 'anypair':
      return bool(d1 === d2);
    case 'pair':
      return bool(d1 === Number(arg) && d2 === Number(arg));
    case 'sum':
      return bool(sum === Number(arg));
    case 'odd':
      return bool(sum % 2 === 1);
    case 'even':
      return bool(sum % 2 === 0);
    case 'lt7':
      return sum === 7 ? 'half_loss' : bool(sum < 7);
    case 'gt7':
      return sum === 7 ? 'half_loss' : bool(sum > 7);
    case 'lucky7':
      return bool(sum === 7);
    default:
      throw new Error(`Unknown dolidana selection: ${sel}`);
  }
}

// -------------------------------------------------------------- Ball By Ball
// winCode: 1=0 Runs, 2=1 Runs, 3=2 Runs, 4=3 Runs, 5=4 Runs, 6=6 Runs, 18=Wicket, 19=Extra Runs
function evalBallbyball(sel, r) {
  const runMap = {
    1: '0',
    2: '1',
    3: '2',
    4: '3',
    5: '4',
    6: '6',
    18: 'wicket',
    19: 'extra',
  };
  let outcome = r.outcome || runMap[Number(r.win)];
  if (!outcome && r.datedNat) {
    const dn = String(r.datedNat).toLowerCase();
    if (/wicket/.test(dn)) outcome = 'wicket';
    else if (/extra|wide|no\s*ball|bye/.test(dn)) outcome = 'extra';
    else {
      const m = dn.match(/\b([0-6])\b/);
      if (m) outcome = m[1];
    }
  }
  if (!outcome) throw new Error('ballbyball outcome missing');
  const [key, arg] = sel.split(':');
  if (key === 'runs') return bool(outcome === String(arg));
  if (key === 'boundary') return bool(outcome === '4' || outcome === '6');
  if (key === 'wicket') return bool(outcome === 'wicket');
  if (key === 'extra') return bool(outcome === 'extra');
  throw new Error(`Unknown ballbyball selection: ${sel}`);
}

// ------------------------------------------------------- Cricket Match 20-20
// Official D247 rule: Team B needs 12 runs from shot (2..10) + dealt card (1..10);
// tie (>= 12) wins!
function evalCmatch20(sel, r) {
  let cardVal = Number(r.cardVal ?? r.win);
  if (!Number.isFinite(cardVal) || cardVal < 1 || cardVal > 10) {
    if (r.card) {
      const c0 = parseCardCode(String(r.card).split(',')[0]);
      if (c0) cardVal = c0.rank;
    }
  }
  if (!Number.isFinite(cardVal) || cardVal < 1 || cardVal > 10) {
    throw new Error('cmatch20 card value missing');
  }
  const m = String(sel).match(/^run:(\d+)$/);
  if (!m) throw new Error(`Unknown cmatch20 selection: ${sel}`);
  const shot = Number(m[1]);
  return bool(shot + cardVal >= 12);
}

// ------------------------------------------------------------- Goal / Goal 2
function evalGoal(sel, r) {
  const [key, arg] = String(sel).split(':');
  const winSid = Number(r.win);
  const dn = String(r.datedNat || '')
    .trim()
    .toLowerCase();
  const rdesc = String(r.rdesc || '')
    .trim()
    .toLowerCase();
  if (key === 'player') {
    if (Number.isFinite(winSid) && winSid > 0 && /^\d+$/.test(arg)) {
      return bool(winSid === Number(arg));
    }
    if (dn) return bool(dn === arg || dn.includes(arg));
    throw new Error('goal player result missing');
  }
  if (key === 'method') {
    if (arg === 'nogoal' && dn === 'no goal') return 'win';
    if (rdesc) {
      const cleanDesc = rdesc.replace(/[^a-z0-9]/g, '');
      return bool(cleanDesc.includes(arg));
    }
    throw new Error('goal method result needs rdesc');
  }
  if (key === 'combo') {
    if (rdesc) {
      const [pNorm, mNorm] = String(arg || '').split('+');
      const cleanDesc = rdesc.replace(/[^a-z0-9]/g, '');
      return bool(cleanDesc.includes(pNorm) && cleanDesc.includes(mNorm));
    }
    throw new Error('goal2 combo result needs rdesc');
  }
  throw new Error(`Unknown goal selection: ${sel}`);
}

// ------------------------------------------------------------------ Race 2
// 4 players (A,B,C,D), 2nd HIGHEST card wins (A=14 high .. 2 low; S>H>C>D)
function evalRace2(sel, r) {
  const sideMap = { 1: 'playerA', 2: 'playerB', 3: 'playerC', 4: 'playerD' };
  let winner = r.winner || sideMap[Number(r.win)];
  if (!winner && Array.isArray(r.cards) && r.cards.length >= 4) {
    const scored = ['playerA', 'playerB', 'playerC', 'playerD'].map((id, i) => {
      const card = r.cards[i];
      const rk = card.rank === 1 ? 14 : card.rank;
      return { id, score: rk * 10 + (SUIT_RANK[card.suit] || 0) };
    });
    scored.sort((a, b) => b.score - a.score);
    winner = scored[1].id; // 2nd highest!
  }
  if (!winner) throw new Error('race2 winner missing');
  if (['playerA', 'playerB', 'playerC', 'playerD'].includes(sel)) {
    return bool(winner === sel);
  }
  throw new Error(`Unknown race2 selection: ${sel}`);
}

// ----------------------------------------------------------------- Race 17
// 5 cards dealt; A=1..9=9, 10/J/Q/K=0; Race to 17 wins if sum >= 17
function evalRace17(sel, r) {
  const [key, arg] = String(sel).split(':');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (key === 'race17') {
    if (cards.length >= 5) {
      const sum = cards
        .slice(0, 5)
        .reduce((s, c) => s + (c.rank >= 10 ? 0 : c.rank), 0);
      return bool(sum >= 17);
    }
    if (r.win === '1' || r.win === 1) return 'win';
    if (r.win === '0' || r.win === 0) return 'lose';
    throw new Error('race17 result missing');
  }
  if (key === 'bigcard') {
    const idx = Number(arg) - 1;
    const card = cards[idx];
    if (!card) throw new Error(`race17 card ${arg} missing`);
    return bool(card.rank >= 7 && card.rank <= 9);
  }
  if (key === 'zerocard') {
    const idx = Number(arg) - 1;
    const card = cards[idx];
    if (!card) throw new Error(`race17 card ${arg} missing`);
    return bool(card.rank >= 10);
  }
  if (key === 'anyzero') {
    if (cards.length < 5) throw new Error('race17 needs 5 cards for anyzero');
    return bool(cards.slice(0, 5).some((c) => c.rank >= 10));
  }
  throw new Error(`Unknown race17 selection: ${sel}`);
}

// ----------------------------------------------------------------- Race 20
// 4 Kings race: 1=Spade, 2=Heart, 3=Club, 4=Diamond
function evalRace20(sel, r) {
  const [key, arg] = String(sel).split(':');
  const suitWinMap = { 1: 'spade', 2: 'heart', 3: 'club', 4: 'diamond' };
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (key === 'king') {
    const winner = r.winner || suitWinMap[Number(r.win)];
    if (!winner) throw new Error('race20 winner missing');
    return bool(winner === arg);
  }
  if (key === 'winwith') {
    if (!cards.length) throw new Error('race20 dealt cards missing');
    return bool(cards.length === Number(arg));
  }
  if (key === 'totalcards') {
    if (!cards.length) throw new Error('race20 dealt cards missing');
    return bool(cards.length >= Number(arg));
  }
  if (key === 'totalpoints') {
    if (!cards.length) throw new Error('race20 dealt cards missing');
    const pts = cards.reduce((s, c) => s + c.rank, 0);
    return bool(pts >= Number(arg));
  }
  throw new Error(`Unknown race20 selection: ${sel}`);
}

// --------------------------------------------------- Super Over / Cricket V3
function evalSuperover(sel, r) {
  const sideMap = { 1: 'team1', 2: 'team2', 3: 'tie', 0: 'tie' };
  const winner = r.winner || sideMap[Number(r.win)];
  if (!winner) throw new Error('superover winner missing');
  if (sel === 'team1' || sel === 'team2') {
    return winner === 'tie' ? 'push' : bool(winner === sel);
  }
  if (sel === 'tie') return bool(winner === 'tie');
  throw new Error(`Unknown superover selection: ${sel}`);
}

// ------------------------------------------------------------------ 32 Cards
// result: { cards:{8:rank,9:rank,10:rank,11:rank}, rawCards?:[{rank,suit}...] }
function evalCard32(sel, r) {
  const { cards, rawCards } = r;
  const s = String(sel || '');
  // card32eu side bets
  if (s === 'any3black' || s === 'any3red' || s === 'twoblacktwored') {
    const first4 = Array.isArray(rawCards) ? rawCards.slice(0, 4) : [];
    if (first4.length < 4)
      throw new Error('card32eu needs 4 first-round cards');
    const reds = first4.filter(isRed).length;
    const blacks = 4 - reds;
    if (s === 'any3black') return bool(blacks >= 3);
    if (s === 'any3red') return bool(reds >= 3);
    return bool(reds === 2 && blacks === 2);
  }
  const scores = {};
  if (cards) {
    [8, 9, 10, 11].forEach((p) => {
      scores[p] = p + cards[p];
    });
  } else if (Array.isArray(rawCards) && rawCards.length >= 4) {
    [8, 9, 10, 11].forEach((p, idx) => {
      scores[p] = p + rawCards[idx].rank;
    });
  }
  const parM = s.match(/^parity:(8|9|10|11):(odd|even)$/);
  if (parM) {
    const sc = scores[Number(parM[1])];
    if (!Number.isFinite(sc)) throw new Error('card32eu player score missing');
    return bool(parM[2] === 'even' ? sc % 2 === 0 : sc % 2 === 1);
  }
  if (s === 'total89' || s === 'total1011') {
    if (!Number.isFinite(scores[8])) throw new Error('card32eu totals missing');
    const t89 = scores[8] + scores[9];
    const t1011 = scores[10] + scores[11];
    if (t89 === t1011) return 'push';
    return bool(s === 'total89' ? t89 > t1011 : t1011 > t89);
  }
  const sglM = s.match(/^single:([0-9])$/);
  if (sglM) {
    const list = Array.isArray(rawCards) ? rawCards : [];
    if (!list.length) throw new Error('card32eu last card missing');
    const last = list[list.length - 1];
    return bool(last.rank % 10 === Number(sglM[1]));
  }
  if (!Number.isFinite(scores[8])) throw new Error('card32 scores missing');
  const max = Math.max(...Object.values(scores));
  const winners = Object.keys(scores).filter((p) => scores[p] === max);
  const p = s.split(':')[1] || s.replace('player', '');
  if (!winners.includes(String(p))) return 'lose';
  return winners.length > 1 ? 'push' : 'win';
}

// --------------------------------------------------- Texas Hold'em Poker (poker / poker20 / poker6)
// Category: 0=HighCard, 1=OnePair, 2=TwoPair, 3=ThreeOfAKind, 4=Straight,
//           5=Flush, 6=FullHouse, 7=FourOfAKind, 8=StraightFlush
const POKER_CAT_KEY = {
  0: 'highcard',
  1: 'onepair',
  2: 'twopair',
  3: 'threeofakind',
  4: 'straight',
  5: 'flush',
  6: 'fullhouse',
  7: 'fourofakind',
  8: 'straightflush',
};

function evalPoker5(five) {
  const rs = five
    .map((c) => (c.rank === 1 ? 14 : c.rank))
    .sort((a, b) => b - a);
  const flush = five.every((c) => c.suit === five[0].suit);
  const counts = new Map();
  for (const r of rs) counts.set(r, (counts.get(r) || 0) + 1);
  const groups = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || b[0] - a[0]
  );
  const uniq = [...new Set(rs)];
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq[0] === 14 && uniq[1] === 5 && uniq[4] === 2) straightHigh = 5; // A-2-3-4-5
  }
  if (flush && straightHigh) return { cat: 8, tie: [straightHigh] };
  if (groups[0][1] === 4) return { cat: 7, tie: [groups[0][0], groups[1][0]] };
  if (groups[0][1] === 3 && groups[1][1] === 2)
    return { cat: 6, tie: [groups[0][0], groups[1][0]] };
  if (flush) return { cat: 5, tie: rs };
  if (straightHigh) return { cat: 4, tie: [straightHigh] };
  if (groups[0][1] === 3)
    return { cat: 3, tie: [groups[0][0], groups[1][0], groups[2][0]] };
  if (groups[0][1] === 2 && groups[1][1] === 2)
    return { cat: 2, tie: [groups[0][0], groups[1][0], groups[2][0]] };
  if (groups[0][1] === 2)
    return { cat: 1, tie: [groups[0][0], ...groups.slice(1).map((g) => g[0])] };
  return { cat: 0, tie: rs };
}

function cmpPoker(a, b) {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1;
  for (let i = 0; i < Math.max(a.tie.length, b.tie.length); i++) {
    const x = a.tie[i] || 0;
    const y = b.tie[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

function best5Of7(cards) {
  let best = null;
  const n = cards.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        for (let l = k + 1; l < n; l++)
          for (let m = l + 1; m < n; m++) {
            const cur = evalPoker5([
              cards[i],
              cards[j],
              cards[k],
              cards[l],
              cards[m],
            ]);
            if (!best || cmpPoker(cur, best) > 0) best = cur;
          }
  return best;
}

function evalPoker(sel, r, slug = 'poker') {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  const winNum = Number(r.win);

  // poker6 (6 players: 12 hole cards + 5 board = 17 cards; win = 11..16 or 0 tie)
  if (slug === 'poker6') {
    const pm = s.match(/^player:([1-6])$/);
    if (pm) {
      if (winNum === 0) return 'push';
      if (winNum >= 11 && winNum <= 16)
        return bool(winNum - 10 === Number(pm[1]));
      if (cards.length >= 17) {
        const board = cards.slice(12, 17);
        const evals = [0, 1, 2, 3, 4, 5].map((idx) =>
          best5Of7([cards[idx * 2], cards[idx * 2 + 1], ...board])
        );
        let best = evals[0];
        for (const ev of evals) if (cmpPoker(ev, best) > 0) best = ev;
        const winners = evals
          .map((ev, i) => (cmpPoker(ev, best) === 0 ? i + 1 : null))
          .filter(Boolean);
        if (winners.length > 1)
          return winners.includes(Number(pm[1])) ? 'push' : 'lose';
        return bool(winners[0] === Number(pm[1]));
      }
      throw new Error('poker6 result missing');
    }
    const patM = s.match(/^pattern:([a-z]+)$/);
    if (patM) {
      if (cards.length < 17)
        throw new Error('poker6 needs 17 cards for pattern');
      const board = cards.slice(12, 17);
      const evals = [0, 1, 2, 3, 4, 5].map((idx) =>
        best5Of7([cards[idx * 2], cards[idx * 2 + 1], ...board])
      );
      let best = evals[0];
      for (const ev of evals) if (cmpPoker(ev, best) > 0) best = ev;
      const key = POKER_CAT_KEY[best.cat];
      const target = patM[1] === 'pair' ? 'onepair' : patM[1];
      return bool(key === target);
    }
    throw new Error(`Unknown poker6 selection: ${sel}`);
  }

  // poker (1-day) & poker20 (9 cards: A=[0,1], B=[2,3], board=[4..8])
  if (
    s === 'playerA' ||
    s === 'playerB' ||
    s === 'winner:A' ||
    s === 'winner:B'
  ) {
    const isA = s === 'playerA' || s === 'winner:A';
    if (winNum === 0) return 'push';
    if (winNum === 1 || winNum === 2)
      return bool(isA ? winNum === 1 : winNum === 2);
    if (cards.length >= 9) {
      const board = cards.slice(4, 9);
      const cmp = cmpPoker(
        best5Of7([cards[0], cards[1], ...board]),
        best5Of7([cards[2], cards[3], ...board])
      );
      if (cmp === 0) return 'push';
      return bool(isA ? cmp > 0 : cmp < 0);
    }
    throw new Error('poker winner missing');
  }

  const b2M = s.match(/^bonus2:(A|B)$/);
  if (b2M) {
    if (cards.length < 4)
      throw new Error('poker 2-card bonus needs hole cards');
    const [c1, c2] =
      b2M[1] === 'A' ? [cards[0], cards[1]] : [cards[2], cards[3]];
    const pair = c1.rank === c2.rank;
    const suitedAceHigh =
      c1.suit === c2.suit &&
      ((c1.rank === 1 && c2.rank >= 11) || (c2.rank === 1 && c1.rank >= 11));
    return bool(pair || suitedAceHigh);
  }

  const b7M = s.match(/^bonus7:(A|B)$/);
  if (b7M) {
    if (cards.length < 9) throw new Error('poker 7-card bonus needs 9 cards');
    const hole = b7M[1] === 'A' ? [cards[0], cards[1]] : [cards[2], cards[3]];
    const ev = best5Of7([...hole, ...cards.slice(4, 9)]);
    return bool(ev.cat >= 3); // Three of a Kind or higher
  }

  const handM = s.match(/^hand:(A|B):([a-z]+)$/);
  if (handM) {
    if (cards.length < 9) throw new Error('poker20 hand bet needs 9 cards');
    const hole = handM[1] === 'A' ? [cards[0], cards[1]] : [cards[2], cards[3]];
    const ev = best5Of7([...hole, ...cards.slice(4, 9)]);
    const target = handM[2] === 'pair' ? 'onepair' : handM[2];
    return bool(POKER_CAT_KEY[ev.cat] === target);
  }

  throw new Error(`Unknown poker selection: ${sel}`);
}

// --------------------------------------------------- 3 Cards Judgement (3cardj)
// Pick 3 distinct ranks (1..13) on Yes (at least 1 appears) or No (none appears)
function parse3CardJRanks(r) {
  if (Array.isArray(r.cards) && r.cards.length >= 3) {
    return r.cards.slice(0, 3).map((c) => c.rank);
  }
  if (r.win !== undefined && r.win !== null) {
    const tokens = String(r.win)
      .toUpperCase()
      .match(/10|[2-9AJQK]/g);
    if (tokens && tokens.length >= 3) {
      const rm = { A: 1, J: 11, Q: 12, K: 13 };
      return tokens.slice(0, 3).map((t) => rm[t] || Number(t));
    }
  }
  return null;
}

function eval3CardJ(sel, r) {
  const m = String(sel).match(/^3cj:(yes|no):(\d+)-(\d+)-(\d+)$/);
  if (!m) throw new Error(`Unknown 3cardj selection: ${sel}`);
  const dealt = parse3CardJRanks(r);
  if (!dealt) throw new Error('3cardj dealt cards missing');
  const picks = [Number(m[2]), Number(m[3]), Number(m[4])];
  const anyHit = picks.some((p) => dealt.includes(p));
  return bool(m[1] === 'yes' ? anyHit : !anyHit);
}

// ------------------------------------------------------------------ Queen
function evalQueen(sel, r) {
  const map = { 1: 'total0', 2: 'total1', 3: 'total2', 4: 'total3' };
  const winner = r.winner || map[Number(r.win)];
  if (!winner) throw new Error('queen winner missing');
  if (['total0', 'total1', 'total2', 'total3'].includes(sel)) {
    return bool(winner === sel);
  }
  throw new Error(`Unknown queen selection: ${sel}`);
}

// ------------------------------------------------------------------ The Trap
function evalTrap(sel, r) {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (s === 'playerA' || s === 'playerB') {
    const w = r.winner || { 1: 'playerA', 2: 'playerB' }[Number(r.win)];
    if (!w) throw new Error('trap winner missing');
    return bool(w === s);
  }
  const hlM = s.match(/^highlow:(\d+):(high|low)$/);
  if (hlM) {
    const card = cards[Number(hlM[1]) - 1];
    if (!card) throw new Error(`trap card ${hlM[1]} missing`);
    if (card.rank === 7) return 'push';
    return bool(hlM[2] === 'high' ? card.rank > 7 : card.rank < 7);
  }
  const jqkM = s.match(/^jqk:(\d+)$/);
  if (jqkM) {
    const card = cards[Number(jqkM[1]) - 1];
    if (!card) throw new Error(`trap card ${jqkM[1]} missing`);
    return bool(card.rank >= 11 && card.rank <= 13);
  }
  throw new Error(`Unknown trap selection: ${sel}`);
}

// --------------------------------------------------------------- Note Number
// 6 cards dealt from A..10 (80-card double deck).
// Markets per card: odd/even/black/red/low(1..5)/high(6..10)/card:<r>, plus bacc1/bacc2
function evalNotenum(sel, r) {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  const propM = s.match(
    /^card:(\d+):(odd|even|black|red|low|high|rank):?(\d*)$/
  );
  if (propM) {
    const card = cards[Number(propM[1]) - 1];
    if (!card) throw new Error(`notenum card ${propM[1]} missing`);
    const kind = propM[2];
    if (kind === 'odd') return bool(card.rank % 2 === 1);
    if (kind === 'even') return bool(card.rank % 2 === 0);
    if (kind === 'red') return bool(isRed(card));
    if (kind === 'black') return bool(!isRed(card));
    if (kind === 'low') return bool(card.rank >= 1 && card.rank <= 5);
    if (kind === 'high') return bool(card.rank >= 6 && card.rank <= 10);
    if (kind === 'rank') return bool(card.rank === Number(propM[3]));
  }
  if (s === 'bacc1' || s === 'bacc2') {
    if (cards.length < 6) throw new Error('notenum needs 6 cards for baccarat');
    const b1 = baccaratValue([cards[0], cards[2], cards[4]]);
    const b2 = baccaratValue([cards[1], cards[3], cards[5]]);
    if (b1 === b2) return 'push';
    return bool(s === 'bacc1' ? b1 > b2 : b2 > b1);
  }
  throw new Error(`Unknown notenum selection: ${sel}`);
}

// ------------------------------------------------------------- Dus Ka Dum (dum10)
function evalDum10(sel, r) {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (s === 'nexttotal') {
    if (r.win === '1' || r.win === 1) return 'win';
    if (r.win === '2' || r.win === 2) return 'lose';
    throw new Error('dum10 nexttotal win code missing');
  }
  const card = r.cardObj || cards[0];
  if (!card) throw new Error('dum10 dealt card missing');
  if (s === 'red') return bool(isRed(card));
  if (s === 'black') return bool(!isRed(card));
  if (s === 'even') return bool(card.rank % 2 === 0);
  if (s === 'odd') return bool(card.rank % 2 === 1);
  throw new Error(`Unknown dum10 selection: ${sel}`);
}

// ----------------------------------------------------------- 1-Card Meter (cmeter1)
function evalCmeter1(sel, r) {
  const s = String(sel || '');
  const cards = Array.isArray(r.cards) ? r.cards : [];
  if (s !== 'fighterA' && s !== 'fighterB') {
    throw new Error(`Unknown cmeter1 selection: ${sel}`);
  }
  if (cards.length >= 2) {
    if (cards[0].rank === cards[1].rank) return 'push';
    return bool(
      s === 'fighterA'
        ? cards[0].rank > cards[1].rank
        : cards[1].rank > cards[0].rank
    );
  }
  const w =
    r.winner ||
    { 1: 'fighterA', 2: 'fighterB', 0: 'tie', 3: 'tie' }[Number(r.win)];
  if (!w) throw new Error('cmeter1 winner missing');
  if (w === 'tie') return 'push';
  return bool(w === s);
}

// ------------------------------------------------------------- Andar Bahar
// Supports:
// - Classic / unit tests: { winner:'andar'|'bahar', cardsDealt:number } -> 'andar'|'bahar'|'cards:a-b'
// - abj (Andar Bahar 2): abj:sa, abj:sb, abj:a1, abj:a2, abj:b1, abj:b2, joker:card:<r>, joker:suit:<s|h|c|d>, joker:odd, joker:even
// - ab20 (Andar Bahar 2020): ab20:andar:<r>, ab20:bahar:<r> (even idx=Bahar, odd idx=Andar; or ares/bres)
// - ab3 / ab4 (50/150 Cards): abchild:<cardNum>:<andar|bahar>:<r>
function evalAndarBahar(sel, r = {}) {
  const { winner, cardsDealt } = r;
  if (sel === 'andar' || sel === 'bahar') {
    const w = winner || { 1: 'andar', 2: 'bahar' }[Number(r.win)];
    if (!w) throw new Error('andar bahar winner missing');
    return bool(w === sel);
  }
  const m = String(sel).match(/^cards:(\d+)-(\d+)$/); // cards:1-5 ... cards:41-999
  if (m) return bool(cardsDealt >= Number(m[1]) && cardsDealt <= Number(m[2]));

  const cards = Array.isArray(r.cards) ? r.cards : [];

  // abj Joker side bets (cards[0] is the Joker card)
  const jk = String(sel).match(/^joker:(card|suit|odd|even)(?::([a-z0-9]+))?$/);
  if (jk) {
    const joker = r.joker || cards[0];
    if (!joker) throw new Error('abj joker card missing');
    if (jk[1] === 'card') return bool(joker.rank === Number(jk[2]));
    if (jk[1] === 'suit') return bool(SUIT_NAME[joker.suit] === jk[2]);
    if (jk[1] === 'odd') return bool(joker.rank % 2 === 1);
    if (jk[1] === 'even') return bool(joker.rank % 2 === 0);
  }

  // abj main / SA / SB bets
  const abjM = String(sel).match(/^abj:(sa|sb|a1|a2|b1|b2)$/);
  if (abjM) {
    const kind = abjM[1];
    if (kind === 'sa' || kind === 'sb') {
      if (cards.length < 3) throw new Error('abj cards missing for SA/SB');
      const joker = cards[0];
      // cards[1] = Bahar 1st card, cards[2] = Andar 1st card
      const target = kind === 'sb' ? cards[1] : cards[2];
      return bool(Boolean(target) && target.rank === joker.rank);
    }
    const winSide = winner || { 1: 'andar', 2: 'bahar' }[Number(r.win)];
    if (!winSide) throw new Error('abj winner missing');
    const isAndar = kind === 'a1' || kind === 'a2';
    return bool(isAndar ? winSide === 'andar' : winSide === 'bahar');
  }

  // ab20: first appearance of rank determines Bahar (even idx) vs Andar (odd idx)
  const ab20M = String(sel).match(/^ab20:(andar|bahar):(\d+)$/);
  if (ab20M) {
    const targetSide = ab20M[1];
    const targetRank = Number(ab20M[2]);
    if (r.ares || r.bres) {
      const aNums = String(r.ares || '')
        .split(',')
        .map(Number);
      const bNums = String(r.bres || '')
        .split(',')
        .map(Number);
      if (aNums.includes(targetRank)) return bool(targetSide === 'andar');
      if (bNums.includes(20 + targetRank)) return bool(targetSide === 'bahar');
    }
    if (!cards.length) throw new Error('ab20 cards missing');
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].rank === targetRank) {
        const landed = i % 2 === 0 ? 'bahar' : 'andar';
        return bool(landed === targetSide);
      }
    }
    return 'lose';
  }

  // ab3 / ab4: cardNum (1-based) onwards, first appearance of rank decides side; never drawn -> push
  const childM = String(sel).match(/^abchild:(\d+):(andar|bahar):(\d+)$/);
  if (childM) {
    const startIdx = Math.max(0, Number(childM[1]) - 1);
    const targetSide = childM[2];
    const targetRank = Number(childM[3]);
    if (cards.length <= startIdx)
      throw new Error('ab3/ab4 cards not dealt yet');
    for (let i = startIdx; i < cards.length; i++) {
      if (cards[i].rank === targetRank) {
        const landed = i % 2 === 0 ? 'bahar' : 'andar';
        return bool(landed === targetSide);
      }
    }
    return 'push';
  }

  throw new Error(`Unknown andar bahar selection: ${sel}`);
}

// -------------------------------------------------------------------- Matka
// Complete D247 Worli / Instant Worli / Matka Market engine (14 sections):
// All 220 valid Matka panas (120 SP + 90 DP + 10 TP) generated deterministically.
const MATKA_ALL_SP = [];
const MATKA_ALL_DP = [];
const MATKA_ALL_TP = [];
for (let a = 0; a < 10; a++) {
  MATKA_ALL_TP.push(`${a}${a}${a}`);
  for (let b = a + 1; b < 10; b++) {
    for (let c = b + 1; c < 10; c++) {
      MATKA_ALL_SP.push(`${a}${b}${c}`);
    }
  }
}
for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    if (x !== y) {
      const sorted = [x, x, y].sort((u, v) => u - v).join('');
      if (!MATKA_ALL_DP.includes(sorted)) MATKA_ALL_DP.push(sorted);
    }
  }
}

const matkaSortPana = (p) =>
  String(p ?? '')
    .replace(/\D/g, '')
    .split('')
    .sort()
    .join('');

const matkaPanaType = (p) => {
  const s = matkaSortPana(p);
  if (s.length !== 3) return null;
  const [a, b, c] = s.split('');
  if (a === b && b === c) return 'tp';
  if (a === b || b === c) return 'dp';
  return 'sp';
};

const matkaPanaDigit = (p) => {
  const s = String(p ?? '').replace(/\D/g, '');
  if (s.length !== 3) return null;
  return (Number(s[0]) + Number(s[1]) + Number(s[2])) % 10;
};

// Ron (consecutive sequence SPs in Matka order where 0 follows 9: 123..789, 890, 901/012)
const isMatkaRonSp = (p) => {
  const s = matkaSortPana(p);
  if (matkaPanaType(s) !== 'sp') return false;
  const nums = s.split('').map(Number);
  // Standard ascending consecutive (012..789) or wrap-around 890 (sorted "089")
  return (nums[1] === nums[0] + 1 && nums[2] === nums[1] + 1) || s === '089';
};

const isMatkaAkiSp = (p) => {
  const s = matkaSortPana(p);
  return (
    matkaPanaType(s) === 'sp' && s.split('').every((ch) => Number(ch) % 2 === 1)
  );
};

const isMatkaBekiSp = (p) => {
  const s = matkaSortPana(p);
  return (
    matkaPanaType(s) === 'sp' && s.split('').every((ch) => Number(ch) % 2 === 0)
  );
};

const isMatkaColorDp = (p) => {
  const s = matkaSortPana(p);
  if (matkaPanaType(s) !== 'dp') return false;
  const allOdd = s.split('').every((ch) => Number(ch) % 2 === 1);
  const allEven = s.split('').every((ch) => Number(ch) % 2 === 0);
  return allOdd || allEven;
};

const matchMatkaAbr = (arg, p) => {
  const a = isMatkaAkiSp(p);
  const b = isMatkaBekiSp(p);
  const r = isMatkaRonSp(p);
  switch (String(arg || '').toLowerCase()) {
    case 'a':
      return a;
    case 'b':
      return b;
    case 'r':
      return r;
    case 'ab':
      return a || b;
    case 'ar':
      return a || r;
    case 'br':
      return b || r;
    case 'abr':
      return a || b || r;
    case 'abrcut':
      return matkaPanaType(p) === 'sp' && !a && !b && !r;
    default:
      return false;
  }
};

const MATKA_SECTION_SID = {
  single: 1,
  pana: 2,
  sp: 3,
  dp: 4,
  tp: 5,
  trio: 5,
  cycle: 6,
  motor: 7,
  chart56: 8,
  chart64: 9,
  abr: 10,
  commonsp: 11,
  commondp: 12,
  colordp: 13,
  jodi: 14,
};

function normalizeMatkaSelection(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (s.includes(':')) {
    const [rawK, ...rest] = s.split(':');
    const k = rawK.trim().toLowerCase();
    const arg = rest.join(':').trim().toLowerCase();
    if (!arg) return null;
    if (k === 'trio') return `tp:${arg}`;
    return `${k}:${arg}`;
  }
  const low = s.toLowerCase();
  if (/^\d+\s*single$/i.test(s) || /^single\s*[-:]?\s*\d+$/i.test(s)) {
    return `single:${s.replace(/\D/g, '')}`;
  }
  if (/line\s*1/i.test(low)) return 'single:line1';
  if (/line\s*2/i.test(low)) return 'single:line2';
  if (/\bodd\b/i.test(low)) return 'single:odd';
  if (/\beven\b/i.test(low)) return 'single:even';
  if (/jodi\s*[-:]?\s*(\d{2})/i.test(low))
    return `jodi:${s.replace(/\D/g, '')}`;
  if (/pana\s*[-:]?\s*(\d{3})/i.test(low))
    return `pana:${s.replace(/\D/g, '')}`;
  if (/^sp\s*[-:]?\s*all$/i.test(low)) return 'sp:all';
  if (/sp\s*[-:]?\s*(\d+)/i.test(low)) return `sp:${s.replace(/\D/g, '')}`;
  if (/^dp\s*[-:]?\s*all$/i.test(low)) return 'dp:all';
  if (/dp\s*[-:]?\s*(\d+)/i.test(low)) return `dp:${s.replace(/\D/g, '')}`;
  if (/trio|tp/i.test(low)) {
    const d = s.replace(/\D/g, '');
    return d ? `tp:${d}` : 'tp:all';
  }
  return low;
}

// Compute exact D247 combo count, section sid, live API board rate, and fair effectiveOdds
// so multi-number bets (Line1/2, ODD/EVEN, SP/DP/Trio/Cycle/Motor/Charts/ABR/Common/Color)
// split stake cleanly across every covered outcome with zero arbitrage.
function getMatkaBetPricing(slug, rawSel, sections = {}) {
  const norm = normalizeMatkaSelection(rawSel);
  if (!norm || !norm.includes(':')) return null;
  const [key, arg] = norm.split(':');
  const sectionSid = MATKA_SECTION_SID[key];
  if (!sectionSid) return null;

  const board = (sid) => sections?.[String(sid)]?.Table?.[0] || {};
  const b1 = board(1);
  const b2 = board(2);
  const fallbackSingle = slug === 'worli2' ? 9 : 9.5;
  const singleRate = Number(b1.single) > 1 ? Number(b1.single) : fallbackSingle;
  const multiRate = Number(b1.multi) > 1 ? Number(b1.multi) : singleRate;
  const spRate =
    Number(board(sectionSid).sp) > 1
      ? Number(board(sectionSid).sp)
      : Number(b2.sp) > 1
        ? Number(b2.sp)
        : 140;
  const dpRate =
    Number(board(sectionSid).dp ?? board(sectionSid).sp) > 1
      ? Number(board(sectionSid).dp ?? board(sectionSid).sp)
      : Number(b2.dp) > 1
        ? Number(b2.dp)
        : 240;
  const tpRate =
    Number(board(sectionSid).tp) > 1
      ? Number(board(sectionSid).tp)
      : Number(b2.tp) > 1
        ? Number(b2.tp)
        : 700;
  const jodiRate = Number(board(14).sp) > 1 ? Number(board(14).sp) : 95;

  let boardRate = singleRate;
  let comboCount = 1;
  let label = norm;

  if (key === 'single') {
    if (/^[0-9]$/.test(arg)) {
      boardRate = singleRate;
      comboCount = 1;
      label = `${arg} Single`;
    } else if (['line1', 'line2', 'odd', 'even'].includes(arg)) {
      boardRate = multiRate;
      comboCount = 5;
      const map = {
        line1: 'Line 1',
        line2: 'Line 2',
        odd: 'ODD',
        even: 'EVEN',
      };
      label = `${map[arg]} Single`;
    } else {
      return null;
    }
  } else if (key === 'jodi') {
    if (!/^\d{2}$/.test(arg)) return null;
    boardRate = jodiRate;
    comboCount = 1;
    label = `Jodi ${arg}`;
  } else if (key === 'pana') {
    if (!/^\d{3}$/.test(arg)) return null;
    const pt = matkaPanaType(arg);
    boardRate = pt === 'tp' ? tpRate : pt === 'dp' ? dpRate : spRate;
    comboCount = 1;
    label = `${arg} Pana`;
  } else if (key === 'sp') {
    boardRate = spRate;
    if (arg === 'all') {
      comboCount = MATKA_ALL_SP.length; // 120
      label = 'SP - ALL';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = MATKA_ALL_SP.filter(
        (p) => matkaPanaDigit(p) === Number(arg)
      ).length; // 12
      label = `${arg} SP`;
    } else if (/^\d{3}$/.test(arg) && matkaPanaType(arg) === 'sp') {
      comboCount = 1;
      label = `${arg} SP`;
    } else {
      return null;
    }
  } else if (key === 'dp') {
    boardRate = dpRate;
    if (arg === 'all') {
      comboCount = MATKA_ALL_DP.length; // 90
      label = 'DP - ALL';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = MATKA_ALL_DP.filter(
        (p) => matkaPanaDigit(p) === Number(arg)
      ).length; // 9
      label = `${arg} DP`;
    } else if (/^\d{3}$/.test(arg) && matkaPanaType(arg) === 'dp') {
      comboCount = 1;
      label = `${arg} DP`;
    } else if (/^\d{2}$/.test(arg) && arg[0] !== arg[1]) {
      comboCount = 2; // xxy & yyx
      label = `${arg} DP`;
    } else {
      return null;
    }
  } else if (key === 'tp' || key === 'trio') {
    boardRate = tpRate;
    if (arg === 'all') {
      comboCount = MATKA_ALL_TP.length; // 10
      label = 'ALL Trio';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = 1;
      label = `${arg}${arg}${arg} Trio`;
    } else if (/^\d{3}$/.test(arg) && matkaPanaType(arg) === 'tp') {
      comboCount = 1;
      label = `${arg} Trio`;
    } else {
      return null;
    }
  } else if (key === 'cycle') {
    if (!/^\d{2}$/.test(arg)) return null;
    boardRate = spRate;
    const [d1, d2] = arg.split('');
    const allPanas = [...MATKA_ALL_SP, ...MATKA_ALL_DP, ...MATKA_ALL_TP];
    comboCount = allPanas.filter((p) => {
      if (d1 === d2) return p.split('').filter((x) => x === d1).length >= 2;
      return p.includes(d1) && p.includes(d2);
    }).length;
    label = `${arg} Cycle`;
  } else if (key === 'motor') {
    const uniq = [...new Set(arg.replace(/\D/g, '').split(''))];
    if (uniq.length < 4 || uniq.length > 9) return null;
    boardRate = spRate;
    const n = uniq.length;
    comboCount = (n * (n - 1) * (n - 2)) / 6;
    label = `${uniq.join('')} Motor`;
  } else if (key === 'chart56') {
    boardRate = spRate;
    const chart = MATKA_ALL_SP.filter(
      (p) => !p.includes('0') && !p.includes('1')
    );
    if (arg === 'all') {
      comboCount = chart.length; // 56
      label = '56CHART';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = chart.filter(
        (p) => matkaPanaDigit(p) === Number(arg)
      ).length;
      label = `56 - ${arg}`;
    } else {
      return null;
    }
  } else if (key === 'chart64') {
    boardRate = spRate;
    const chart = MATKA_ALL_SP.filter(
      (p) => p.includes('0') || p.includes('1')
    );
    if (arg === 'all') {
      comboCount = chart.length; // 64
      label = '64CHART';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = chart.filter(
        (p) => matkaPanaDigit(p) === Number(arg)
      ).length;
      label = `64 - ${arg}`;
    } else {
      return null;
    }
  } else if (key === 'abr') {
    boardRate = spRate;
    comboCount = MATKA_ALL_SP.filter((p) => matchMatkaAbr(arg, p)).length;
    if (comboCount <= 0) return null;
    label = `ABR - ${arg.toUpperCase()}`;
  } else if (key === 'commonsp') {
    if (!/^[0-9]$/.test(arg)) return null;
    boardRate = spRate;
    comboCount = MATKA_ALL_SP.filter((p) => p.includes(arg)).length; // 36
    label = `Common SP - ${arg}`;
  } else if (key === 'commondp') {
    if (!/^[0-9]$/.test(arg)) return null;
    boardRate = dpRate;
    comboCount = MATKA_ALL_DP.filter((p) => p.includes(arg)).length; // 18
    label = `Common DP - ${arg}`;
  } else if (key === 'colordp') {
    boardRate = dpRate;
    const colored = MATKA_ALL_DP.filter(isMatkaColorDp);
    if (arg === 'all') {
      comboCount = colored.length;
      label = 'Color DP - ALL';
    } else if (/^[0-9]$/.test(arg)) {
      comboCount = colored.filter(
        (p) => matkaPanaDigit(p) === Number(arg)
      ).length;
      label = `Color DP - ${arg}`;
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (!(comboCount > 0) || !(boardRate > 1)) return null;
  const effectiveOdds = round2(boardRate / comboCount);
  if (!(effectiveOdds > 1)) return null;

  return {
    selection: norm,
    sectionSid,
    boardRate,
    comboCount,
    effectiveOdds,
    label,
  };
}

// result:
// - worli / worli2: { open: digit, openPana: '440' }
// - worli3 OPEN round: { open: digit, openPana: '489', jodiClose?: digit }
// - worli3 CLOSE round: { close: digit, closePana: '100' }
function evalMatka(sel, r) {
  const norm = normalizeMatkaSelection(sel);
  if (!norm || !norm.includes(':')) {
    throw new Error(`Unknown matka selection: ${sel}`);
  }
  const [key, arg] = norm.split(':');

  // Determine the active round's digit & pana (OPEN round checks open; CLOSE round checks close)
  const digits = [];
  if (
    r.open !== undefined &&
    r.open !== null &&
    Number.isFinite(Number(r.open))
  ) {
    digits.push(Number(r.open));
  }
  if (
    r.close !== undefined &&
    r.close !== null &&
    Number.isFinite(Number(r.close))
  ) {
    digits.push(Number(r.close));
  }

  const panas = [];
  if (r.openPana && /^\d{3}$/.test(String(r.openPana))) {
    panas.push(matkaSortPana(r.openPana));
  }
  if (r.closePana && /^\d{3}$/.test(String(r.closePana))) {
    panas.push(matkaSortPana(r.closePana));
  }

  if (key === 'jodi') {
    const o = r.open;
    const c = r.jodiClose !== undefined ? r.jodiClose : r.close;
    if (o === undefined || o === null || c === undefined || c === null) {
      throw new Error('jodi needs both open and close results');
    }
    return bool(arg === `${o}${c}`);
  }

  if (key === 'single') {
    if (!digits.length) throw new Error('matka digit result missing');
    if (arg === 'line1')
      return bool(digits.some((d) => [1, 2, 3, 4, 5].includes(d)));
    if (arg === 'line2')
      return bool(digits.some((d) => [6, 7, 8, 9, 0].includes(d)));
    if (arg === 'odd') return bool(digits.some((d) => d % 2 === 1));
    if (arg === 'even') return bool(digits.some((d) => d % 2 === 0));
    if (/^[0-9]$/.test(arg)) return bool(digits.includes(Number(arg)));
    throw new Error(`Unknown matka single selection: ${sel}`);
  }

  // All remaining Matka bets require the 3-digit pana result
  if (!panas.length) throw new Error('matka pana result missing');

  switch (key) {
    case 'pana': {
      const target = matkaSortPana(arg);
      return bool(panas.includes(target));
    }
    case 'sp': {
      if (arg === 'all')
        return bool(panas.some((p) => matkaPanaType(p) === 'sp'));
      if (/^[0-9]$/.test(arg)) {
        return bool(
          panas.some(
            (p) =>
              matkaPanaType(p) === 'sp' && matkaPanaDigit(p) === Number(arg)
          )
        );
      }
      const t = matkaSortPana(arg);
      return bool(panas.includes(t));
    }
    case 'dp': {
      if (arg === 'all')
        return bool(panas.some((p) => matkaPanaType(p) === 'dp'));
      if (/^[0-9]$/.test(arg)) {
        return bool(
          panas.some(
            (p) =>
              matkaPanaType(p) === 'dp' && matkaPanaDigit(p) === Number(arg)
          )
        );
      }
      if (/^\d{3}$/.test(arg)) return bool(panas.includes(matkaSortPana(arg)));
      if (/^\d{2}$/.test(arg)) {
        const [x, y] = arg.split('');
        const combos = [
          matkaSortPana(`${x}${x}${y}`),
          matkaSortPana(`${y}${y}${x}`),
        ];
        return bool(panas.some((p) => combos.includes(p)));
      }
      throw new Error(`Unknown matka dp selection: ${sel}`);
    }
    case 'tp':
    case 'trio': {
      if (arg === 'all')
        return bool(panas.some((p) => matkaPanaType(p) === 'tp'));
      const t = arg.length === 3 ? matkaSortPana(arg) : String(arg).repeat(3);
      return bool(panas.includes(t));
    }
    case 'cycle': {
      if (!/^\d{2}$/.test(arg)) throw new Error(`Unknown matka cycle: ${sel}`);
      const [d1, d2] = arg.split('');
      return bool(
        panas.some((p) =>
          d1 === d2
            ? p.split('').filter((x) => x === d1).length >= 2
            : p.includes(d1) && p.includes(d2)
        )
      );
    }
    case 'motor': {
      const allowed = new Set(arg.replace(/\D/g, '').split(''));
      return bool(
        panas.some(
          (p) =>
            matkaPanaType(p) === 'sp' &&
            p.split('').every((ch) => allowed.has(ch))
        )
      );
    }
    case 'chart56': {
      return bool(
        panas.some(
          (p) =>
            matkaPanaType(p) === 'sp' &&
            !p.includes('0') &&
            !p.includes('1') &&
            (arg === 'all' || matkaPanaDigit(p) === Number(arg))
        )
      );
    }
    case 'chart64': {
      return bool(
        panas.some(
          (p) =>
            matkaPanaType(p) === 'sp' &&
            (p.includes('0') || p.includes('1')) &&
            (arg === 'all' || matkaPanaDigit(p) === Number(arg))
        )
      );
    }
    case 'abr': {
      return bool(panas.some((p) => matchMatkaAbr(arg, p)));
    }
    case 'commonsp': {
      return bool(
        panas.some((p) => matkaPanaType(p) === 'sp' && p.includes(arg))
      );
    }
    case 'commondp': {
      return bool(
        panas.some((p) => matkaPanaType(p) === 'dp' && p.includes(arg))
      );
    }
    case 'colordp': {
      return bool(
        panas.some(
          (p) =>
            isMatkaColorDp(p) &&
            (arg === 'all' || matkaPanaDigit(p) === Number(arg))
        )
      );
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
  lucky5: { 1: 'low', 2: 'high', 0: 'six', 3: 'six' },
  lucky15: {
    1: 'runs:0',
    2: 'runs:1',
    3: 'runs:2',
    4: 'runs:4',
    5: 'runs:6',
    6: 'wicket',
  },
  aaa: { 1: 'amar', 2: 'akbar', 3: 'anthony' },
  dt: { 1: 'dragon', 2: 'tiger', 3: 'tie' },
  dtl20: { 1: 'dragon', 21: 'tiger', 41: 'lion', 2: 'tiger', 3: 'lion' },
  bollywood: { 1: 'don', 2: 'aaa', 3: 'sbg', 4: 'dv', 5: 'kkpk', 6: 'ghulam' },
  mogambo: { 1: 'mogambo', 2: 'dagateja' },
  baccarat: { 1: 'player', 2: 'banker', 3: 'tie' },
  teen: { 1: 'playerA', 2: 'playerB', 0: 'tie' },
  muflis: { 1: 'playerA', 2: 'playerB', 0: 'tie' },
  card32: { 1: '8', 2: '9', 3: '10', 4: '11' },
  andarbahar: { 1: 'andar', 2: 'bahar' },
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

function evalDtFromCards(sel, d, t, slug = '') {
  return evalDragonTiger(
    sel,
    { dragon: d, tiger: t },
    { suitTiebreak: ONE_DAY_DT_SLUGS.has(String(slug || '').toLowerCase()) }
  );
}

/**
 * Variable payout multiplier for winning D247 bonus markets when cards are available:
 * - vteen20/teen20 Pair Plus: Pair 1:1 (2), Flush 1:4 (5), Straight 1:6 (7), Trio 1:30 (31), SF 1:40 (41)
 * - vteenmuf/teenmuf Top 9: High 9 -> 1:3 (4), 8 -> 1:4 (5), 7 -> 1:5 (6), 6 -> 1:8 (9), 5 -> 1:30 (31)
 */
function getDynamicSettlementOdds(slug, sel, result) {
  const fam = familyOf(slug);
  // Sic Bo Single 1..6: 1 die = 1:1 (2x), 2 dice = 2:1 (3x), 3 dice = 3:1 (4x)
  if (fam === 'sicbo' && String(sel || '').startsWith('single:')) {
    const dice = Array.isArray(result?.dice) ? result.dice : null;
    if (dice && dice.length === 3) {
      const target = Number(String(sel).split(':')[1]);
      const matches = dice.filter((d) => Number(d) === target).length;
      if (matches >= 1) return matches + 1;
    }
    return null;
  }
  // 1-Card Meter (cmeter1): payout = point difference |rankA - rankB| + 1
  if (fam === 'cmeter1' && (sel === 'fighterA' || sel === 'fighterB')) {
    const cards = Array.isArray(result?.cards)
      ? result.cards
      : result?.card
        ? parseCardList(result.card).filter(Boolean)
        : [];
    if (cards.length >= 2) {
      const diff = Math.abs(cards[0].rank - cards[1].rank);
      if (diff >= 1) return diff + 1;
    }
    return null;
  }
  if (fam !== 'teen' && fam !== 'muflis') return null;
  const [key, who] = String(sel || '').split(':');
  if (key !== 'pairplus' && key !== 'top9') return null;
  let A = result?.A;
  let B = result?.B;
  if ((!A || !B) && result?.card) {
    const cards = parseCardList(result.card).filter(Boolean);
    if (cards.length >= 6) {
      A = [cards[0], cards[2], cards[4]];
      B = [cards[1], cards[3], cards[5]];
    }
  }
  const hand = who === 'B' ? B : A;
  if (!Array.isArray(hand) || hand.length < 3) return null;
  if (key === 'pairplus') {
    const cat = rankHand(hand).cat;
    return PAIR_PLUS_ODDS[cat] || null;
  }
  if (key === 'top9') {
    const mr = top9MaxRank(hand);
    return mr ? TOP9_ODDS[mr] || null : null;
  }
  return null;
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
  if (fam === 'dolidana') {
    let dice = Array.isArray(rc.dice) ? rc.dice : null;
    if (
      !dice &&
      rc.datedNat &&
      /^\d+\s*,\s*\d+$/.test(String(rc.datedNat).trim())
    ) {
      dice = String(rc.datedNat)
        .split(',')
        .map((x) => Number(x.trim()));
    }
    if (!dice && rc.card) {
      const ds = String(rc.card)
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((n) => n >= 1 && n <= 6);
      if (ds.length >= 2) dice = ds.slice(0, 2);
    }
    return evalDolidana(sel, { ...rc, dice });
  }
  if (fam === 'ballbyball') {
    return evalBallbyball(sel, rc);
  }
  if (fam === 'cmatch20') {
    return evalCmatch20(sel, rc);
  }
  if (fam === 'goal') {
    return evalGoal(sel, rc);
  }
  if (fam === 'race2') {
    const r2Cards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
    return evalRace2(sel, { ...rc, cards: r2Cards });
  }
  if (fam === 'race17') {
    const r17Cards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
    return evalRace17(sel, { ...rc, cards: r17Cards });
  }
  if (fam === 'race20') {
    const r20Cards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
    return evalRace20(sel, { ...rc, cards: r20Cards });
  }
  if (fam === 'superover') {
    return evalSuperover(sel, rc);
  }
  if (fam === 'lucky15') {
    return evalLucky15(sel, rc);
  }
  if (fam === 'lottcard') {
    const lCards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
    return evalLottcard(sel, { ...rc, cards: lCards });
  }

  // Try card-level evaluation when Round snapshot saved dealt cards
  const cards = rc.card ? parseCardList(rc.card).filter(Boolean) : [];
  if (fam === 'lucky5' && cards.length >= 1) {
    try {
      return evalLucky5(sel, { card: cards[0] });
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'mogambo') {
    return evalMogambo(sel, { ...rc, cards });
  }
  if (fam === 'andarbahar') {
    return evalAndarBahar(sel, { ...rc, cards });
  }
  if (fam === 'poker') {
    return evalPoker(sel, { ...rc, cards }, slug);
  }
  if (fam === '3cardj') {
    return eval3CardJ(sel, { ...rc, cards });
  }
  if (fam === 'queen') {
    return evalQueen(sel, rc);
  }
  if (fam === 'trap') {
    return evalTrap(sel, { ...rc, cards });
  }
  if (fam === 'notenum') {
    return evalNotenum(sel, { ...rc, cards });
  }
  if (fam === 'dum10') {
    return evalDum10(sel, { ...rc, cards });
  }
  if (fam === 'cmeter1') {
    return evalCmeter1(sel, { ...rc, cards });
  }
  if (
    fam === 'card32' &&
    cards.length >= 4 &&
    !/^player(8|9|10|11)$/.test(sel)
  ) {
    return evalCard32(sel, { rawCards: cards });
  }
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
  if (fam === 'bollywood' && cards.length >= 1) {
    try {
      return evalBollywood(sel, { card: cards[0] });
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'dt' && cards.length >= 2) {
    try {
      return evalDtFromCards(sel, cards[0], cards[1], slug);
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'dtl20' && cards.length >= 3) {
    try {
      return evalDtl20(sel, {
        dragon: cards[0],
        tiger: cards[1],
        lion: cards[2],
      });
    } catch {
      /* fall back to win-code lookup */
    }
  }
  if (fam === 'trio') {
    if (cards.length < 3) {
      throw new Error(`trio selection ${sel} needs 3 dealt cards`);
    }
    return evalTrio(sel, { cards });
  }
  if (fam === 'teen1') {
    return evalTeen1(sel, { ...rc, cards }, slug);
  }
  if (fam === 'teen8') {
    return evalTeen8(sel, { ...rc, cards });
  }
  if (fam === 'teen9') {
    return evalTeen9(sel, { ...rc, cards });
  }
  if (fam === 'patti2') {
    return evalPatti2(sel, { ...rc, cards });
  }
  if ((fam === 'teen' || fam === 'muflis') && cards.length >= 6) {
    // For teen main winner, prefer authoritative provider winCode when present
    if (
      (sel === 'playerA' || sel === 'playerB') &&
      WIN_SIDE[fam]?.[Number(rc.win)]
    ) {
      const side = WIN_SIDE[fam][Number(rc.win)];
      if (side === 'tie') return 'push';
      return bool(side === sel);
    }
    // For 7-card games (poison/poison20/joker20/joker120), cards[0] is the poison/joker card
    const offset =
      cards.length >= 7 &&
      ['poison', 'poison20', 'joker20', 'joker120'].includes(slug)
        ? 1
        : 0;
    try {
      return evalTeen(
        sel,
        {
          A: [cards[offset], cards[offset + 2], cards[offset + 4]],
          B: [cards[offset + 1], cards[offset + 3], cards[offset + 5]],
          rawCards: cards,
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
        perfectPair: Boolean(
          (pPair && pCards[0].suit === pCards[1].suit) ||
          (bPair && bCards[0].suit === bCards[1].suit)
        ),
        totalCards: pCards.length + bCards.length,
      });
    } catch {
      /* fall back to win-code lookup */
    }
  }

  const side = (WIN_SIDE[fam] || {})[Number(rc.win)];
  if (side) {
    const [key, who] = sel.split(':');
    switch (fam) {
      case 'lucky7':
        if (key === 'low' || key === 'high') {
          return side === 'seven' ? 'half_loss' : bool(side === key);
        }
        if (key === 'seven') return bool(side === 'seven');
        break;
      case 'lucky5':
        if (key === 'low' || key === 'high') {
          return side === 'six' ? 'half_loss' : bool(side === key);
        }
        if (key === 'six') return bool(side === 'six');
        break;
      case 'aaa':
        if (key === 'amar' || key === 'akbar' || key === 'anthony') {
          return bool(side === key);
        }
        if (key === 'under7') {
          if (side === 'amar') return 'win';
          if (side === 'anthony') return 'lose';
        }
        if (key === 'over7') {
          if (side === 'anthony') return 'win';
          if (side === 'amar') return 'lose';
        }
        break;
      case 'dt':
        if (key === 'dragon' || key === 'tiger') {
          return side === 'tie' ? 'half_loss' : bool(side === key);
        }
        if (key === 'tie' || key === 'pair') {
          if (!ONE_DAY_DT_SLUGS.has(String(slug || '').toLowerCase())) {
            return bool(side === 'tie');
          }
        }
        break;
      case 'dtl20':
        if (key === 'winner' && ['dragon', 'tiger', 'lion'].includes(who)) {
          return bool(side === who);
        }
        break;
      case 'bollywood':
        if (['don', 'aaa', 'sbg', 'dv', 'kkpk', 'ghulam'].includes(key)) {
          return bool(side === key);
        }
        break;
      case 'baccarat':
        if (key === 'player' || key === 'banker') {
          return side === 'tie' ? 'push' : bool(side === key);
        }
        if (key === 'tie') return bool(side === 'tie');
        break;
      case 'teen':
      case 'muflis':
        if (key === 'playerA' || key === 'playerB') {
          return side === 'tie' ? 'push' : bool(side === key);
        }
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

  // Fallback generic settlement via datedNat ONLY for unmodeled families
  if (!fam) {
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
    case 'lucky5':
      return evalLucky5(selection, result);
    case 'lucky15':
      return evalLucky15(selection, result);
    case 'mogambo':
      return evalMogambo(selection, result);
    case 'lottcard':
      return evalLottcard(selection, result);
    case 'aaa':
      return evalAAA(selection, result);
    case 'dt':
      return evalDragonTiger(selection, result, {
        suitTiebreak: ONE_DAY_DT_SLUGS.has(String(slug || '').toLowerCase()),
      });
    case 'dtl20':
      return evalDtl20(selection, result);
    case 'trio':
      return evalTrio(selection, result);
    case 'bollywood':
      return evalBollywood(selection, result);
    case 'baccarat':
      return evalBaccarat(selection, result);
    case 'teen':
      return evalTeen(selection, result);
    case 'teen1':
      return evalTeen1(selection, result, slug);
    case 'teen8':
      return evalTeen8(selection, result);
    case 'teen9':
      return evalTeen9(selection, result);
    case 'patti2':
      return evalPatti2(selection, result);
    case 'muflis':
      return evalTeen(selection, result, { muflis: true });
    case 'roulette':
      return evalRoulette(selection, result);
    case 'sicbo':
      return evalSicBo(selection, result);
    case 'dolidana':
      return evalDolidana(selection, result);
    case 'ballbyball':
      return evalBallbyball(selection, result);
    case 'cmatch20':
      return evalCmatch20(selection, result);
    case 'goal':
      return evalGoal(selection, result);
    case 'race2':
      return evalRace2(selection, result);
    case 'race17':
      return evalRace17(selection, result);
    case 'race20':
      return evalRace20(selection, result);
    case 'superover':
      return evalSuperover(selection, result);
    case 'card32':
      return evalCard32(selection, result);
    case 'poker':
      return evalPoker(selection, result, slug);
    case '3cardj':
      return eval3CardJ(selection, result);
    case 'queen':
      return evalQueen(selection, result);
    case 'trap':
      return evalTrap(selection, result);
    case 'notenum':
      return evalNotenum(selection, result);
    case 'dum10':
      return evalDum10(selection, result);
    case 'cmeter1':
      return evalCmeter1(selection, result);
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
  dtl20: new Set(['winner:dragon', 'winner:tiger', 'winner:lion']),
  bollywood: new Set(['don', 'aaa', 'sbg', 'dv', 'kkpk', 'ghulam']),
  baccarat: new Set(['player', 'banker', 'tie']),
  teen: new Set(['playerA', 'playerB']),
  teen1: new Set(['player', 'dealer', 'tie']),
  teen9: new Set(['winner:tiger', 'winner:lion', 'winner:dragon']),
  patti2: new Set(['playerA', 'playerB']),
  muflis: new Set(['playerA', 'playerB']),
  lucky7: new Set(['low', 'seven', 'high']),
  lucky5: new Set(['low', 'six', 'high']),
  lucky15: new Set([
    'runs:0',
    'runs:1',
    'runs:2',
    'runs:4',
    'runs:6',
    'wicket',
  ]),
  mogambo: new Set(['mogambo', 'dagateja']),
  aaa: new Set(['amar', 'akbar', 'anthony']),
  card32: new Set(['player8', 'player9', 'player10', 'player11']),
  queen: new Set(['total0', 'total1', 'total2', 'total3']),
  trap: new Set(['playerA', 'playerB']),
  cmeter1: new Set(['fighterA', 'fighterB']),
  race2: new Set(['playerA', 'playerB', 'playerC', 'playerD']),
  race20: new Set(['king:spade', 'king:heart', 'king:club', 'king:diamond']),
  superover: new Set(['team1', 'team2', 'tie']),
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

  // Matka single/line1/line2/odd/even share the 0..9 digit outcome space in a round
  if (fam === 'matka') {
    const singleBets = [];
    const otherBets = [];
    for (const bet of bets) {
      const norm = normalizeMatkaSelection(bet.selection) || '';
      if (norm.startsWith('single:')) singleBets.push(bet);
      else otherBets.push(bet);
    }
    let exp = 0;
    if (singleBets.length > 0) {
      let worstNet = 0;
      for (let d = 0; d <= 9; d++) {
        let scNet = 0;
        for (const b of singleBets) {
          const out = evalMatka(b.selection, { open: d });
          scNet += settleBet(b, out).net;
        }
        if (scNet < worstNet) worstNet = scNet;
      }
      exp += Math.max(0, -worstNet);
    }
    for (const b of otherBets) {
      exp += calcExposure(b);
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
  const s = String(slug || '').toLowerCase();
  switch (familyOf(s)) {
    case 'dt':
      if (ONE_DAY_DT_SLUGS.has(s)) {
        // 1-day single-deck Dragon Tiger (dt6/vdt6/pdt6): suit breaks rank ties -> no tie scenario
        return [
          { id: 'dragon', result: { dragon: c(10), tiger: c(3) } },
          { id: 'tiger', result: { dragon: c(3), tiger: c(10) } },
        ];
      }
      return [
        { id: 'dragon', result: { dragon: c(10), tiger: c(3) } },
        { id: 'tiger', result: { dragon: c(3), tiger: c(10) } },
        { id: 'tie', result: { dragon: c(7), tiger: c(7) } },
      ];
    case 'dtl20':
      return [
        {
          id: 'dragon',
          result: { dragon: c(13, 'S'), tiger: c(5, 'H'), lion: c(2, 'D') },
        },
        {
          id: 'tiger',
          result: { dragon: c(2, 'D'), tiger: c(13, 'S'), lion: c(5, 'H') },
        },
        {
          id: 'lion',
          result: { dragon: c(2, 'D'), tiger: c(5, 'H'), lion: c(13, 'S') },
        },
      ];
    case 'bollywood':
      return [
        { id: 'don', result: { card: c(1, 'S') } },
        { id: 'aaa', result: { card: c(1, 'H') } },
        { id: 'sbg', result: { card: c(13, 'S') } },
        { id: 'dv', result: { card: c(13, 'D') } },
        { id: 'kkpk', result: { card: c(13, 'H') } },
        { id: 'ghulam', result: { card: c(11, 'H') } },
      ];
    case 'teen':
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
    case 'teen1':
      return s === 'teen120'
        ? [
            { id: 'player', result: { win: '1' } },
            { id: 'dealer', result: { win: '2' } },
            { id: 'tie', result: { win: '3' } },
          ]
        : [
            { id: 'player', result: { win: '1' } },
            { id: 'dealer', result: { win: '2' } },
          ];
    case 'teen9':
      return [
        { id: 'tiger', result: { winner: 'tiger' } },
        { id: 'lion', result: { winner: 'lion' } },
        { id: 'dragon', result: { winner: 'dragon' } },
      ];
    case 'patti2':
      return [
        { id: 'playerA', result: { winner: 'playerA' } },
        { id: 'playerB', result: { winner: 'playerB' } },
      ];
    case 'muflis':
      // Muflis inverts rank: low high-card beats pair
      return [
        {
          id: 'A',
          result: {
            A: [c(9), c(5, 'H'), c(2, 'C')],
            B: [c(13), c(13, 'H'), c(2)],
          },
        },
        {
          id: 'B',
          result: {
            A: [c(13), c(13, 'H'), c(2)],
            B: [c(9), c(5, 'H'), c(2, 'C')],
          },
        },
      ];
    case 'lucky7':
      return [
        { id: 'low', result: { card: c(3) } },
        { id: 'seven', result: { card: c(7) } },
        { id: 'high', result: { card: c(10) } },
      ];
    case 'lucky5':
      return [
        { id: 'low', result: { card: c(3) } },
        { id: 'six', result: { card: c(6) } },
        { id: 'high', result: { card: c(9) } },
      ];
    case 'lucky15':
      return [
        { id: 'runs:0', result: { outcome: 'runs:0' } },
        { id: 'runs:1', result: { outcome: 'runs:1' } },
        { id: 'runs:2', result: { outcome: 'runs:2' } },
        { id: 'runs:4', result: { outcome: 'runs:4' } },
        { id: 'runs:6', result: { outcome: 'runs:6' } },
        { id: 'wicket', result: { outcome: 'wicket' } },
      ];
    case 'mogambo':
      return [
        { id: 'mogambo', result: { winner: 'mogambo' } },
        { id: 'dagateja', result: { winner: 'dagateja' } },
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
    case 'queen':
      return [
        { id: 'total0', result: { winner: 'total0' } },
        { id: 'total1', result: { winner: 'total1' } },
        { id: 'total2', result: { winner: 'total2' } },
        { id: 'total3', result: { winner: 'total3' } },
      ];
    case 'trap':
      return [
        { id: 'playerA', result: { winner: 'playerA' } },
        { id: 'playerB', result: { winner: 'playerB' } },
      ];
    case 'cmeter1':
      return [
        { id: 'fighterA', result: { winner: 'fighterA' } },
        { id: 'fighterB', result: { winner: 'fighterB' } },
      ];
    case 'race2':
      return [
        { id: 'playerA', result: { winner: 'playerA' } },
        { id: 'playerB', result: { winner: 'playerB' } },
        { id: 'playerC', result: { winner: 'playerC' } },
        { id: 'playerD', result: { winner: 'playerD' } },
      ];
    case 'race20':
      return [
        { id: 'spade', result: { winner: 'spade' } },
        { id: 'heart', result: { winner: 'heart' } },
        { id: 'club', result: { winner: 'club' } },
        { id: 'diamond', result: { winner: 'diamond' } },
      ];
    case 'superover':
      return [
        { id: 'team1', result: { winner: 'team1' } },
        { id: 'team2', result: { winner: 'team2' } },
        { id: 'tie', result: { winner: 'tie' } },
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
  getDynamicSettlementOdds,
  getLimits,
  getMatkaBetPricing,
  isHalfLossMarket,
  lucky7Stats,
  nationBook,
  normalizeMatkaSelection,
  PAIR_PLUS_ODDS,
  rankHand,
  rouletteStats,
  settleBet,
  TOP9_ODDS,
  validateBet,
};
