/**
 * Realistic Hand Evaluator for Casino Games
 * Evaluates winners dynamically based on card ranks and standard casino rules
 */

// Card ranks from 2 to 14 (Ace = 14)
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// DTL specific rank: Ace is 1, King is 13
const DTL_RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export function parseCard(cardStr) {
  if (!cardStr || typeof cardStr !== 'string') return { rank: 2, suit: 'S', code: '2SS' };
  const str = cardStr.trim();
  // Handle cards like '10DD', 'JSS', 'ADD', '8HH', '7CC'
  let rankStr = '';
  let suitStr = '';
  if (str.startsWith('10')) {
    rankStr = '10';
    suitStr = str.slice(2, 3);
  } else {
    rankStr = str.charAt(0);
    suitStr = str.slice(1, 2);
  }
  const rank = RANK_VALUES[rankStr] || 2;
  const dtlRank = DTL_RANK_VALUES[rankStr] || 2;
  return { rank, dtlRank, rankStr, suit: suitStr, code: cardStr };
}

/**
 * Teen Patti Hand Evaluator (3 cards)
 * Hand Types:
 * 6: Trio (Three of a Kind)
 * 5: Pure Sequence (Straight Flush)
 * 4: Sequence (Straight)
 * 3: Color (Flush)
 * 2: Pair
 * 1: High Card
 */
export function evaluateTeenPattiHand(cardStrings) {
  if (!cardStrings || cardStrings.length < 3) return { type: 1, typeName: 'High Card', rank: 0 };
  const cards = cardStrings.map(parseCard).sort((a, b) => b.rank - a.rank);

  const [c1, c2, c3] = cards;
  const isFlush = c1.suit === c2.suit && c2.suit === c3.suit;

  // Check Trio
  if (c1.rank === c2.rank && c2.rank === c3.rank) {
    return { type: 6, typeName: 'Trio', score: 60000 + c1.rank * 100, highRank: c1.rank };
  }

  // Check Sequence (A-2-3 is lowest or second highest; standard A-K-Q is 14-13-12)
  const isNormalSeq = c1.rank - c2.rank === 1 && c2.rank - c3.rank === 1;
  const isA23 = c1.rank === 14 && c2.rank === 3 && c3.rank === 2;
  const isStraight = isNormalSeq || isA23;

  if (isStraight && isFlush) {
    return { type: 5, typeName: 'Pure Sequence', score: 50000 + (isA23 ? 3 : c1.rank) * 100, highRank: isA23 ? 3 : c1.rank };
  }

  if (isStraight) {
    return { type: 4, typeName: 'Sequence', score: 40000 + (isA23 ? 3 : c1.rank) * 100, highRank: isA23 ? 3 : c1.rank };
  }

  if (isFlush) {
    return { type: 3, typeName: 'Color', score: 30000 + c1.rank * 100 + c2.rank * 10 + c3.rank, highRank: c1.rank };
  }

  // Check Pair
  if (c1.rank === c2.rank) {
    return { type: 2, typeName: 'Pair', score: 20000 + c1.rank * 100 + c3.rank, highRank: c1.rank };
  }
  if (c2.rank === c3.rank) {
    return { type: 2, typeName: 'Pair', score: 20000 + c2.rank * 100 + c1.rank, highRank: c2.rank };
  }
  if (c1.rank === c3.rank) {
    return { type: 2, typeName: 'Pair', score: 20000 + c1.rank * 100 + c2.rank, highRank: c1.rank };
  }

  // High Card
  return { type: 1, typeName: 'High Card', score: 10000 + c1.rank * 100 + c2.rank * 10 + c3.rank, highRank: c1.rank };
}

export function compareTeenPatti(cardsA, cardsB) {
  const handA = evaluateTeenPattiHand(cardsA);
  const handB = evaluateTeenPattiHand(cardsB);

  if (handA.score > handB.score) return { winner: 'A', handA, handB, isTie: false };
  if (handB.score > handA.score) return { winner: 'B', handA, handB, isTie: false };
  return { winner: 'TIE', handA, handB, isTie: true }; // Official push on main bet tie
}

// Suit ranking for 3 Baccarat Condition 4: Spades > Hearts > Clubs > Diamonds
const SUIT_RANK = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };
const FACE_RANKS = { 'K': 13, 'Q': 12, 'J': 11 };

function getBaccaratCardPoints(rankStr) {
  if (['10', 'J', 'Q', 'K'].includes(rankStr)) return 0;
  if (rankStr === 'A') return 1;
  return parseInt(rankStr, 10) || 0;
}

function getTotalCardPoints(rankStr) {
  if (rankStr === 'A') return 1;
  if (rankStr === 'J') return 11;
  if (rankStr === 'Q') return 12;
  if (rankStr === 'K') return 13;
  return parseInt(rankStr, 10) || 0;
}

/**
 * 3 Baccarat Evaluator (Official Diamond247 Rules)
 * Criteria 1: Trio (AAA > KKK > ... > 222)
 * Criteria 2: All 3 face cards (J, Q, K). Higher face card wins (K > Q > J, then Spade > Heart > Club > Diamond)
 * Criteria 3: Higher Baccarat Value (sum modulo 10)
 *   Condition 1: More face cards wins
 *   Condition 2: Equal face cards -> Higher face card with suit
 *   Condition 3: Neither has face card -> Higher value point card
 *   Condition 4: Same point cards -> Suit of high card decides
 */
export function evaluate3Baccarat(cardsA, cardsB) {
  const pA = (cardsA || []).map(parseCard);
  const pB = (cardsB || []).map(parseCard);

  // Criteria 1: Trio
  const isTrioA = pA[0].rank === pA[1].rank && pA[1].rank === pA[2].rank;
  const isTrioB = pB[0].rank === pB[1].rank && pB[1].rank === pB[2].rank;

  if (isTrioA && !isTrioB) return { winner: 'A', criteria: 1, reason: 'Trio' };
  if (!isTrioA && isTrioB) return { winner: 'B', criteria: 1, reason: 'Trio' };
  if (isTrioA && isTrioB) {
    if (pA[0].rank > pB[0].rank) return { winner: 'A', criteria: 1, reason: 'Higher Trio' };
    if (pB[0].rank > pA[0].rank) return { winner: 'B', criteria: 1, reason: 'Higher Trio' };
  }

  // Criteria 2: All 3 face cards
  const isFace = (c) => ['J', 'Q', 'K'].includes(c.rankStr);
  const allFaceA = pA.every(isFace);
  const allFaceB = pB.every(isFace);

  if (allFaceA && !allFaceB) return { winner: 'A', criteria: 2, reason: 'All Face Cards' };
  if (!allFaceA && allFaceB) return { winner: 'B', criteria: 2, reason: 'All Face Cards' };
  if (allFaceA && allFaceB) {
    const sortFaces = (arr) => [...arr].sort((x, y) => {
      const rDiff = FACE_RANKS[y.rankStr] - FACE_RANKS[x.rankStr];
      if (rDiff !== 0) return rDiff;
      return (SUIT_RANK[y.suit] || 0) - (SUIT_RANK[x.suit] || 0);
    });
    const sortedA = sortFaces(pA);
    const sortedB = sortFaces(pB);
    for (let i = 0; i < 3; i++) {
      const diff = FACE_RANKS[sortedA[i].rankStr] - FACE_RANKS[sortedB[i].rankStr];
      if (diff > 0) return { winner: 'A', criteria: 2, reason: 'Higher Face Card' };
      if (diff < 0) return { winner: 'B', criteria: 2, reason: 'Higher Face Card' };
      const sDiff = (SUIT_RANK[sortedA[i].suit] || 0) - (SUIT_RANK[sortedB[i].suit] || 0);
      if (sDiff > 0) return { winner: 'A', criteria: 2, reason: 'Higher Suit Face Card' };
      if (sDiff < 0) return { winner: 'B', criteria: 2, reason: 'Higher Suit Face Card' };
    }
  }

  // Criteria 3: Higher Baccarat Value (sum modulo 10)
  const bacValA = pA.reduce((sum, c) => sum + getBaccaratCardPoints(c.rankStr), 0) % 10;
  const bacValB = pB.reduce((sum, c) => sum + getBaccaratCardPoints(c.rankStr), 0) % 10;

  if (bacValA > bacValB) return { winner: 'A', criteria: 3, valA: bacValA, valB: bacValB, reason: 'Higher Baccarat Value' };
  if (bacValB > bacValA) return { winner: 'B', criteria: 3, valA: bacValA, valB: bacValB, reason: 'Higher Baccarat Value' };

  // Condition 1: Player having more face cards wins
  const faceCountA = pA.filter(isFace).length;
  const faceCountB = pB.filter(isFace).length;
  if (faceCountA > faceCountB) return { winner: 'A', criteria: 3, condition: 1, reason: 'More Face Cards' };
  if (faceCountB > faceCountA) return { winner: 'B', criteria: 3, condition: 1, reason: 'More Face Cards' };

  // Condition 2: If face cards equal (> 0), higher value face card wins
  if (faceCountA > 0) {
    const facesA = pA.filter(isFace).sort((x, y) => {
      const r = FACE_RANKS[y.rankStr] - FACE_RANKS[x.rankStr];
      if (r !== 0) return r;
      return (SUIT_RANK[y.suit] || 0) - (SUIT_RANK[x.suit] || 0);
    });
    const facesB = pB.filter(isFace).sort((x, y) => {
      const r = FACE_RANKS[y.rankStr] - FACE_RANKS[x.rankStr];
      if (r !== 0) return r;
      return (SUIT_RANK[y.suit] || 0) - (SUIT_RANK[x.suit] || 0);
    });
    for (let i = 0; i < facesA.length; i++) {
      const diff = FACE_RANKS[facesA[i].rankStr] - FACE_RANKS[facesB[i].rankStr];
      if (diff > 0) return { winner: 'A', criteria: 3, condition: 2, reason: 'Higher Face Card' };
      if (diff < 0) return { winner: 'B', criteria: 3, condition: 2, reason: 'Higher Face Card' };
      const sDiff = (SUIT_RANK[facesA[i].suit] || 0) - (SUIT_RANK[facesB[i].suit] || 0);
      if (sDiff > 0) return { winner: 'A', criteria: 3, condition: 2, reason: 'Higher Suit Face Card' };
      if (sDiff < 0) return { winner: 'B', criteria: 3, condition: 2, reason: 'Higher Suit Face Card' };
    }
  }

  // Condition 3: Neither player has face cards -> Player with higher value point card wins
  const sortPoints = (arr) => [...arr].sort((x, y) => {
    const pX = getBaccaratCardPoints(x.rankStr);
    const pY = getBaccaratCardPoints(y.rankStr);
    if (pY !== pX) return pY - pX;
    return (SUIT_RANK[y.suit] || 0) - (SUIT_RANK[x.suit] || 0);
  });
  const ptsA = sortPoints(pA);
  const ptsB = sortPoints(pB);

  for (let i = 0; i < 3; i++) {
    const pX = getBaccaratCardPoints(ptsA[i].rankStr);
    const pY = getBaccaratCardPoints(ptsB[i].rankStr);
    if (pX > pY) return { winner: 'A', criteria: 3, condition: 3, reason: 'Higher Value Point Card' };
    if (pY > pX) return { winner: 'B', criteria: 3, condition: 3, reason: 'Higher Value Point Card' };
  }

  // Condition 4: Same point cards -> Suit of high card decides
  const highSuitA = SUIT_RANK[ptsA[0].suit] || 0;
  const highSuitB = SUIT_RANK[ptsB[0].suit] || 0;
  if (highSuitA >= highSuitB) return { winner: 'A', criteria: 3, condition: 4, reason: 'Suit of High Card' };
  return { winner: 'B', criteria: 3, condition: 4, reason: 'Suit of High Card' };
}

/**
 * Teen Patti Total Points Evaluator
 * Point Value: A = 1, 2-10 face, Jack = 11, Queen = 12, King = 13
 * If Total A == Total B: Tie (bets lose 50%)
 */
export function evaluateTeenPattiTotal(cardsA, cardsB) {
  const pA = (cardsA || []).map(parseCard);
  const pB = (cardsB || []).map(parseCard);

  const totalA = pA.reduce((sum, c) => sum + getTotalCardPoints(c.rankStr), 0);
  const totalB = pB.reduce((sum, c) => sum + getTotalCardPoints(c.rankStr), 0);

  if (totalA > totalB) return { winner: 'A', totalA, totalB, isTie: false };
  if (totalB > totalA) return { winner: 'B', totalA, totalB, isTie: false };
  return { winner: 'TIE', totalA, totalB, isTie: true, loseFiftyPercent: true };
}

/**
 * Dragon Tiger Lion Evaluator
 * Compares 1 card each: K > Q > J > 10 ... > A
 */
export function evaluateDTL(dragonCard, tigerCard, lionCard) {
  const d = parseCard(dragonCard).dtlRank;
  const t = parseCard(tigerCard).dtlRank;
  const l = parseCard(lionCard).dtlRank;

  if (d >= t && d >= l) return 'D';
  if (t >= d && t >= l) return 'T';
  return 'L';
}

/**
 * Lucky 7 Evaluator
 * Card < 7 -> Low ('L')
 * Card == 7 -> 7 ('7')
 * Card > 7 -> High ('H')
 */
export function evaluateLucky7(cardStr) {
  const parsed = parseCard(cardStr);
  const r = parsed.dtlRank;
  if (r < 7) return 'L';
  if (r === 7) return '7';
  return 'H';
}

/**
 * Amar Akbar Anthony Evaluator
 * Amar: A, 2, 3, 4, 5, 6 (1 to 6)
 * Akbar: 7, 8, 9, 10
 * Anthony: J, Q, K (11 to 13)
 */
export function evaluateAAA(cardStr) {
  const parsed = parseCard(cardStr);
  const r = parsed.dtlRank;
  if (r <= 6) return 'Amar';
  if (r <= 10) return 'Akbar';
  return 'Anthony';
}

/**
 * Trio Evaluator (3 cards dealt in center)
 * Strictly matches official V-Trio rules:
 * - Session: Total point value of all three cards (A=1, 2-10 face, J=11, Q=12, K=13)
 * - 3 Card Judgement: Set 1 (1,2,4), Set 2 (J,Q,K) - at least one card must come
 * - Two Red Only / Two Black Only: exactly 2 cards (not more not less)
 * - Two Odd Only / Two Even Only: exactly 2 cards (not more not less)
 * - Pair: Two of same rank (Trio is also valid for Pair)
 * - Flush: Three of same suit (Straight Flush also valid)
 * - Straight: Three in sequence (Straight Flush also valid; K-A-2 is not valid)
 * - Trio: Three of same rank
 * - Straight Flush: Sequence + same suit (K-A-2 is not valid)
 */
export function evaluateTrio(c1, c2, c3) {
  const hand = evaluateTeenPattiHand([c1, c2, c3]);
  const p1 = parseCard(c1);
  const p2 = parseCard(c2);
  const p3 = parseCard(c3);
  const cards = [p1, p2, p3];

  // Point values: A=1, 2=2...10=10, J=11, Q=12, K=13
  const totalSum = p1.dtlRank + p2.dtlRank + p3.dtlRank;
  const redCount = cards.filter((c) => c.suit === 'H' || c.suit === 'D').length;
  const blackCount = 3 - redCount;
  const oddCount = cards.filter((c) => c.dtlRank % 2 !== 0).length;
  const evenCount = 3 - oddCount;

  // 3 Card Judgement: at least one card in set must appear
  const has124 = cards.some((c) => c.dtlRank === 1 || c.dtlRank === 2 || c.dtlRank === 4);
  const hasJQK = cards.some((c) => c.dtlRank === 11 || c.dtlRank === 12 || c.dtlRank === 13);

  // Exact combinations according to V-Trio rules:
  const isTrio = hand.typeName === 'Trio';
  const isStraightFlush = hand.typeName === 'Pure Sequence';
  const isStraight = hand.typeName === 'Sequence' || isStraightFlush;
  const isFlush = hand.typeName === 'Color' || isStraightFlush;
  const isPair = hand.typeName === 'Pair' || isTrio;

  return {
    handType: hand.typeName,
    shortType: isTrio ? 'Trio' : isStraightFlush ? 'Straight Flush' : isStraight ? 'Straight' : isFlush ? 'Flush' : isPair ? 'Pair' : 'High Card',
    totalSum,
    // Session 21
    isSession21: totalSum === 21,
    // Judgement sets
    has124,
    hasJQK,
    // Color & Parity (Two ... Only: exactly 2 cards, not more not less)
    twoRedOnly: redCount === 2,
    twoBlackOnly: blackCount === 2,
    twoOddOnly: oddCount === 2,
    twoEvenOnly: evenCount === 2,
    // Hand Combinations
    isPair,
    isFlush,
    isStraight,
    isTrio,
    isStraightFlush,
  };
}

/**
 * Poker Evaluator (Player A vs Player B)
 */
export function evaluatePoker(cardsA = [], cardsB = []) {
  const pA = (cardsA.length ? cardsA : ['KSS', '10HH']).map(parseCard).sort((a, b) => b.rank - a.rank);
  const pB = (cardsB.length ? cardsB : ['QDD', '9CC']).map(parseCard).sort((a, b) => b.rank - a.rank);
  const isPairA = pA[0]?.rank === pA[1]?.rank;
  const isPairB = pB[0]?.rank === pB[1]?.rank;
  const scoreA = (pA[0]?.rank || 2) * 20 + (pA[1]?.rank || 2) + (isPairA ? 1000 : 0);
  const scoreB = (pB[0]?.rank || 2) * 20 + (pB[1]?.rank || 2) + (isPairB ? 1000 : 0);
  if (scoreA > scoreB) return 'A';
  if (scoreB > scoreA) return 'B';
  return 'Tie';
}

/**
 * Sic Bo Evaluator (3 dice, 1-6)
 */
export function evaluateSicBo(dice = [3, 4, 5]) {
  const sum = dice.reduce((acc, d) => acc + d, 0);
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
  if (isTriple) return 'Triple';
  if (sum >= 4 && sum <= 10) return 'Small';
  return 'Big';
}

/**
 * Goal Penalty Shootout Evaluator
 */
export function evaluateGoal(seed = 0) {
  const outcomes = ['Goal', 'Goal', 'Miss', 'Goal', 'Save'];
  return outcomes[Math.abs(seed) % outcomes.length];
}

/**
 * Super Over Cricket Evaluator
 */
export function evaluateSuperOver(runs = 11) {
  return runs >= 11 ? 'Batsman' : 'Bowler';
}

/**
 * Race Evaluator (4 Suits)
 */
export function evaluateRace(seed = 0) {
  const suits = ['♠ Spade', '♥ Heart', '♣ Club', '♦ Diamond'];
  return suits[Math.abs(seed) % suits.length];
}

/**
 * Muflis Teen Patti Evaluator
 * In Muflis: Lowest hand rank wins!
 * High Card > Pair > Color > Sequence > Pure Sequence > Trio
 */
export function compareMuflisTeenPatti(cardsA, cardsB) {
  const handA = evaluateTeenPattiHand(cardsA);
  const handB = evaluateTeenPattiHand(cardsB);

  // Lower hand type number wins (type 1 is High Card, type 6 is Trio)
  if (handA.type < handB.type) return { winner: 'A', handA, handB, isTie: false };
  if (handB.type < handA.type) return { winner: 'B', handA, handB, isTie: false };

  // If types are same: lower score wins (e.g. 5-3-2 beats 8-7-6)
  if (handA.score < handB.score) return { winner: 'A', handA, handB, isTie: false };
  if (handB.score < handA.score) return { winner: 'B', handA, handB, isTie: false };

  return { winner: 'TIE', handA, handB, isTie: true };
}

/**
 * Dragon Tiger 2-way Evaluator
 */
export function evaluateDragonTiger(dragonCard, tigerCard) {
  const d = parseCard(dragonCard);
  const t = parseCard(tigerCard);
  const dRank = d.dtlRank;
  const tRank = t.dtlRank;
  const isTie = dRank === tRank;
  const isSuitedTie = isTie && d.suit === t.suit;

  let winner = 'Tie';
  if (dRank > tRank) winner = 'D';
  else if (tRank > dRank) winner = 'T';

  return {
    winner,
    isTie,
    isSuitedTie,
    dRank,
    tRank,
    dSuit: d.suit,
    tSuit: t.suit,
    isDragonEven: dRank % 2 === 0,
    isDragonOdd: dRank % 2 !== 0,
    isDragonRed: d.suit === 'H' || d.suit === 'D',
    isDragonBlack: d.suit === 'S' || d.suit === 'C',
    isTigerEven: tRank % 2 === 0,
    isTigerOdd: tRank % 2 !== 0,
    isTigerRed: t.suit === 'H' || t.suit === 'D',
    isTigerBlack: t.suit === 'S' || t.suit === 'C',
  };
}

/**
 * Lucky 5 / Lucky 6 Evaluator (Center Card, pivot 6)
 */
export function evaluateLucky5(cardStr) {
  const p = parseCard(cardStr);
  const r = p.dtlRank;
  let outcome = '6';
  if (r < 6) outcome = 'L';
  else if (r > 6) outcome = 'H';

  return {
    outcome,
    rank: r,
    isEven: r % 2 === 0,
    isOdd: r % 2 !== 0,
    isRed: p.suit === 'H' || p.suit === 'D',
    isBlack: p.suit === 'S' || p.suit === 'C',
    rankStr: p.rankStr,
  };
}

/**
 * Baccarat Evaluator (Player vs Banker, sum modulo 10)
 */
export function evaluateBaccarat(playerCards = [], bankerCards = []) {
  const pCards = (playerCards.length ? playerCards : ['6DD', '8HH']).map(parseCard);
  const bCards = (bankerCards.length ? bankerCards : ['9DD', '10SS']).map(parseCard);

  const pPoints = pCards.reduce((acc, c) => acc + getBaccaratCardPoints(c.rankStr), 0) % 10;
  const bPoints = bCards.reduce((acc, c) => acc + getBaccaratCardPoints(c.rankStr), 0) % 10;

  const isPlayerPair = pCards.length >= 2 && pCards[0].rankStr === pCards[1].rankStr;
  const isBankerPair = bCards.length >= 2 && bCards[0].rankStr === bCards[1].rankStr;
  const isTie = pPoints === bPoints;
  const winner = pPoints > bPoints ? 'Player' : bPoints > pPoints ? 'Banker' : 'Tie';

  return {
    winner,
    pPoints,
    bPoints,
    isTie,
    isPlayerPair,
    isBankerPair,
  };
}

/**
 * 32 Cards Evaluator (4 Players: P8, P9, P10, P11)
 */
export function evaluateCard32(c8, c9, c10, c11) {
  const getCard32Value = (c) => {
    const p = parseCard(c);
    if (p.rankStr === 'A') return 1;
    if (['J', 'Q', 'K'].includes(p.rankStr)) return p.rank;
    return parseInt(p.rankStr, 10) || 6;
  };

  const v8 = getCard32Value(c8 || '8SS');
  const v9 = getCard32Value(c9 || '9HH');
  const v10 = getCard32Value(c10 || '10DD');
  const v11 = getCard32Value(c11 || 'JCC');

  const score8 = 8 + v8;
  const score9 = 9 + v9;
  const score10 = 10 + v10;
  const score11 = 11 + v11;

  const list = [
    { code: 'P8', name: 'Player 8', score: score8 },
    { code: 'P9', name: 'Player 9', score: score9 },
    { code: 'P10', name: 'Player 10', score: score10 },
    { code: 'P11', name: 'Player 11', score: score11 },
  ];

  list.sort((a, b) => b.score - a.score);
  return {
    winner: list[0].code,
    winnerName: list[0].name,
    winningScore: list[0].score,
    scores: { P8: score8, P9: score9, P10: score10, P11: score11 },
  };
}

/**
 * European Roulette Evaluator (0 to 36)
 */
const ROULETTE_REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const ROULETTE_BLACKS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

export function evaluateRoulette(num) {
  const n = typeof num === 'number' ? num : parseInt(num, 10) || 0;
  const isZero = n === 0;
  const isRed = ROULETTE_REDS.has(n);
  const isBlack = ROULETTE_BLACKS.has(n);
  const isEven = !isZero && n % 2 === 0;
  const isOdd = !isZero && n % 2 !== 0;
  const isLow = !isZero && n >= 1 && n <= 18;
  const isHigh = !isZero && n >= 19 && n <= 36;
  const dozen = isZero ? null : n <= 12 ? '1st Dozen' : n <= 24 ? '2nd Dozen' : '3rd Dozen';
  const column = isZero ? null : n % 3 === 1 ? '1st Col' : n % 3 === 2 ? '2nd Col' : '3rd Col';

  return {
    number: n,
    isZero,
    isRed,
    isBlack,
    isEven,
    isOdd,
    isLow,
    isHigh,
    dozen,
    column,
  };
}

/**
 * 1 Card Teen Patti Evaluator
 */
export function compare1Card(cardA, cardB) {
  const pA = parseCard(cardA);
  const pB = parseCard(cardB);
  if (pA.rank > pB.rank) return { winner: 'A', isTie: false };
  if (pB.rank > pA.rank) return { winner: 'B', isTie: false };
  return { winner: 'Tie', isTie: true };
}

/**
 * 2 Cards Teen Patti Evaluator (patti2)
 */
export function compare2Cards(cardsA = [], cardsB = []) {
  const pA = cardsA.map(parseCard).sort((a, b) => b.rank - a.rank);
  const pB = cardsB.map(parseCard).sort((a, b) => b.rank - a.rank);

  const isPairA = pA[0]?.rank === pA[1]?.rank;
  const isPairB = pB[0]?.rank === pB[1]?.rank;
  const isFlushA = pA[0]?.suit === pA[1]?.suit;
  const isFlushB = pB[0]?.suit === pB[1]?.suit;

  const scoreCard = (p, isP, isF) => {
    if (isP) return 3000 + (p[0]?.rank || 0) * 10;
    if (isF) return 2000 + (p[0]?.rank || 0) * 10 + (p[1]?.rank || 0);
    return 1000 + (p[0]?.rank || 0) * 10 + (p[1]?.rank || 0);
  };

  const sA = scoreCard(pA, isPairA, isFlushA);
  const sB = scoreCard(pB, isPairB, isFlushB);

  if (sA > sB) return { winner: 'A', isTie: false };
  if (sB > sA) return { winner: 'B', isTie: false };
  return { winner: 'Tie', isTie: true };
}

/**
 * Worli Matka Evaluator
 */
export function evaluateWorli(singleDigit, pana) {
  const digit = typeof singleDigit === 'number' ? singleDigit : parseInt(singleDigit, 10) || 0;
  const panaStr = String(pana || '128');
  const d1 = panaStr[0], d2 = panaStr[1], d3 = panaStr[2];
  const isTriple = d1 === d2 && d2 === d3;
  const isDouble = !isTriple && (d1 === d2 || d2 === d3 || d1 === d3);

  return {
    singleDigit: digit,
    pana: panaStr,
    panaType: isTriple ? 'TP' : isDouble ? 'DP' : 'SP',
    isEven: digit % 2 === 0,
    isOdd: digit % 2 !== 0,
    line1: [1, 2, 3, 4, 5].includes(digit),
    line2: [6, 7, 8, 9, 0].includes(digit),
  };
}

/**
 * Andar Bahar Evaluator
 */
export function evaluateAndarBahar(mainCard, andarCards = [], baharCards = []) {
  const m = parseCard(mainCard).rankStr;
  const aIdx = andarCards.findIndex((c) => parseCard(c).rankStr === m);
  const bIdx = baharCards.findIndex((c) => parseCard(c).rankStr === m);

  if (aIdx !== -1 && (bIdx === -1 || aIdx <= bIdx)) {
    return { winner: 'Andar', winningSide: 'A', totalCards: (aIdx + 1) * 2 - 1 };
  }
  return { winner: 'Bahar', winningSide: 'B', totalCards: (bIdx !== -1 ? bIdx + 1 : 2) * 2 };
}



