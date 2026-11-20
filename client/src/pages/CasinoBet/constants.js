// Quick bet amount options with chip images — reference bet slip grid:
// 100, 500, 1000, 5000, 10000, 25000, 50000 (ui.md Desktop Bet Slip audits)
export const QUICK_AMOUNTS = [
  { amt: 100, img: 'chips1.svg' },
  { amt: 500, img: 'chips1.svg' },
  { amt: 1000, img: 'chips1.svg' },
  { amt: 5000, img: 'chips5.svg' },
  { amt: 10000, img: 'chips10.svg' },
  { amt: 25000, img: 'chips20.svg' },
  { amt: 50000, img: 'chips1k.svg' },
];

// Games that should only show Player A and Player B
export const TWO_PLAYER_GAMES = [
  'teen20',
  'teenmuf',
  // 'poison',
  'poison20',
  'teen20c',
  'teen20b',
  'joker20',
  'teen41',
  'teen42',
  'teen',
  'pteen',
  'pteen20',
  'teen6',
  'poker',
  'patti2',
  'teenjoker',
  'teen20v1',
  'teen62',
  'teen9',
];

// Teen20 side bet sections (static data)
export const TEEN20_SIDE_BETS = [
  {
    title: 'PAIR ( DUBBLE )',
    ratio: '1:4',
    players: [
      {
        sid: 'pair_player_a',
        nat: 'Player A ( Pair )',
        b: 4,
        amount: 500000,
        subtype: 'pair',
      },
      {
        sid: 'pair_player_b',
        nat: 'Player B ( Pair )',
        b: 4,
        amount: 500000,
        subtype: 'pair',
      },
    ],
  },
  {
    title: 'FLUSH ( COLOR )',
    ratio: '1:8',
    players: [
      {
        sid: 'flush_player_a',
        nat: 'Player A ( Flush )',
        b: 8,
        amount: 500000,
        subtype: 'flush',
      },
      {
        sid: 'flush_player_b',
        nat: 'Player B ( flush )',
        b: 8,
        amount: 500000,
        subtype: 'flush',
      },
    ],
  },
  {
    title: 'STRAIGHT ( ROWN )',
    ratio: '1:14',
    players: [
      {
        sid: 'Straight_player_a',
        nat: 'Player A ( Straight )',
        b: 14,
        amount: 500000,
        subtype: 'straight',
      },
      {
        sid: 'Straight_player_b',
        nat: 'Player B ( Straight )',
        b: 14,
        amount: 500000,
        subtype: 'staright',
      },
    ],
  },
  {
    title: 'STRAIGHT FLUSH ( PAKKI ROWN )',
    ratio: ' 1:40',
    players: [
      {
        sid: 'Straight_flush_a',
        nat: 'Player A ( Straight Flush )',
        b: 40,
        amount: 500000,
        subtype: 'straightFlush',
      },
      {
        sid: 'Straight_flush_b',
        nat: 'Player B ( Straight Flush )',
        b: 40,
        amount: 500000,
        subtype: 'straightFlush',
      },
    ],
  },
  {
    title: 'TRIO ( TEEN )',
    ratio: '1:75',
    players: [
      {
        sid: 'player_trio_a',
        nat: 'Player A ( Trio )',
        b: 75,
        amount: 500000,
        subtype: 'trio',
      },
      {
        sid: 'player_trio_b',
        nat: 'Player B ( Trio )',
        b: 75,
        amount: 500000,
        subtype: 'trio',
      },
    ],
  },
  {
    title: 'PUTLA ( 1 PICTURE IN GAME )',
    ratio: '1:0.70',
    players: [
      {
        sid: 'player_putla1_a',
        nat: 'Player A ( Putla 1 )',
        b: 1.7,
        amount: 1000000,
        subtype: 'putla1',
      },
      {
        sid: 'player_putla1_b',
        nat: 'Player B ( Putla 1 )',
        b: 1.7,
        amount: 1000000,
        subtype: 'putla1',
      },
    ],
  },
  {
    title: 'PUTLA ( 2 PICTURE IN GAME )',
    ratio: '1:4',
    players: [
      {
        sid: 'player_putla2_a',
        nat: 'Player A ( Putla 2 )',
        b: 4,
        amount: 1000000,
        subtype: 'putla2',
      },
      {
        sid: 'player_putla2_b',
        nat: 'Player B ( Putla 2 )',
        b: 4,
        amount: 1000000,
        subtype: 'putla2',
      },
    ],
  },
  {
    title: 'PUTLA ( 3 PICTURE IN GAME )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_putla3_a',
        nat: 'Player A ( Putla 3 )',
        b: 25,
        amount: 1000000,
        subtype: 'putla3',
      },
      {
        sid: 'player_putla3_b',
        nat: 'Player B ( Putla 3 )',
        b: 25,
        amount: 1000000,
        subtype: 'putla3',
      },
    ],
  },
  {
    title: 'LOVE MARRIAGE ( Q & K WITH SAME SUIT )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_qk_a',
        nat: 'Player A ( Queen & King )',
        b: 25,
        amount: 500000,
        subtype: 'loveMarriage',
      },
      {
        sid: 'player_qk_b',
        nat: 'Player B ( Queen & King )',
        b: 25,
        amount: 500000,
        subtype: 'loveMarriage',
      },
    ],
  },
  {
    title: 'BF LOVE GF ( J & Q WITH SAME SUIT )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_jq_a',
        nat: 'Player A ( Jack & Queen )',
        b: 25,
        amount: 500000,
        subtype: 'bfAndGf',
      },
      {
        sid: 'player_jq_b',
        nat: 'Player B ( Jack & Queen )',
        b: 25,
        amount: 500000,
        subtype: 'bfAndGf',
      },
    ],
  },
];

const R_BADGE_GAMES = new Set([
  '3cardj',
  'ab20',
  'ab3',
  'ab4',
  'ballbyball',
  'dolidana',
  'goal',
  'joker1',
  'joker120',
  'notenum',
  'teen8',
  'teenunique',
  'trio',
  'vtrio',
  'worli',
  'worli2',
]);

const ROULETTE_GAMES = new Set([
  'ourroullete',
  'roulette11',
  'roulette12',
  'roulette13',
]);

const ROULETTE_RED_NUMS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

// Winner labels for different game types
export const getWinnerMap = (gameid) => {
  const g = String(gameid || '').toLowerCase();
  if (['baccarat', 'baccarat2', 'pbaccarat'].includes(g)) {
    return { 1: 'Player', 2: 'Banker', 3: 'Tie' };
  }
  if (['dt6', 'vdt6', 'dt202', 'dt20', 'pdt6', 'pdt20'].includes(g)) {
    return { 1: 'Dragon', 2: 'Tiger', 3: 'Tie' };
  }
  if (['vaaa', 'aaa', 'aaa2'].includes(g)) {
    return { 1: 'Amar', 2: 'Akbar', 3: 'Anthony' };
  }
  if (g === 'vdtl20' || g === 'dtl20') {
    return { 1: 'Dragon', 2: 'Tiger', 3: 'Lion', 21: 'Tiger', 41: 'Lion' };
  }
  if (['vbtable', 'btable', 'btable2'].includes(g)) {
    return {
      1: 'Don',
      2: 'Amar Akbar Anthony',
      3: 'Sahib Bibi Aur Ghulam',
      4: 'Dharam Veer',
      5: 'Kis Kis ko Pyaar Karoon',
      6: 'Ghulam',
    };
  }
  if (['card32', 'card32eu', 'pcard32'].includes(g)) {
    return {
      1: 'Player 8',
      2: 'Player 9',
      3: 'Player 10',
      4: 'Player 11',
    };
  }
  if (['lucky7', 'lucky7eu', 'lucky7eu2', 'vlucky7', 'plucky7'].includes(g)) {
    return { 1: 'Low Card', 2: 'High Card', 0: 'Tie (7)', 3: 'Tie (7)' };
  }
  if (g === 'lucky5') {
    return { 1: 'Low Card', 2: 'High Card', 0: 'Tie (6)', 3: 'Tie (6)' };
  }
  if (g === 'abj') {
    return { 1: 'Andar', 2: 'Bahar' };
  }
  if (g === 'dum10') {
    return { 1: 'Yes', 2: 'No' };
  }
  if (g === 'mogambo') {
    return { 1: 'Mogambo', 2: 'Daga / Teja' };
  }
  if (g === 'race17') {
    return { 0: 'No', 1: 'Yes' };
  }
  if (g === 'teen1') {
    return { 1: 'Player', 2: 'Dealer' };
  }
  if (g === 'teen120') {
    return { 1: 'Player', 2: 'Dealer', 3: 'Tie' };
  }
  if (g === 'teen9') {
    return { 1: 'Tiger', 2: 'Lion', 3: 'Dragon' };
  }
  if (g === 'superover') {
    return { 1: 'ENG', 2: 'RSA', 3: 'Tie', 0: 'Tie' };
  }
  if (g === 'superover2') {
    return { 1: 'IND', 2: 'ENG', 3: 'Tie', 0: 'Tie' };
  }
  if (g === 'superover3') {
    return { 1: 'IND', 2: 'AUS', 3: 'Tie', 0: 'Tie' };
  }
  if (g === 'cricketv3') {
    return { 1: 'AUS', 2: 'IND', 3: 'Tie', 0: 'Tie' };
  }
  if (g === 'race2') {
    return { 1: 'Player A', 2: 'Player B', 3: 'Player C', 4: 'Player D' };
  }
  if (g === 'race20') {
    return {
      1: 'K of Spade',
      2: 'K of Heart',
      3: 'K of Club',
      4: 'K of Diamond',
    };
  }
  if (g === 'cmatch20') {
    return Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 1, `Run ${i + 1}`])
    );
  }
  if (g === 'queen') {
    return { 1: 'Total 0', 2: 'Total 1', 3: 'Total 2', 4: 'Total 3' };
  }
  if (g === 'poker6') {
    return {
      0: 'Tie Game',
      11: 'Player 1',
      12: 'Player 2',
      13: 'Player 3',
      14: 'Player 4',
      15: 'Player 5',
      16: 'Player 6',
    };
  }
  if (g === 'lucky15') {
    return {
      1: '0 Run',
      2: '1 Run',
      3: '2 Run',
      4: '4 Run',
      5: '6 Run',
      6: 'Wicket',
    };
  }
  return {
    1: 'Player A',
    2: 'Player B',
  };
};

// Result display labels
export const getResultLabel = (gameid, win) => {
  const g = String(gameid || '').toLowerCase();
  const w = String(win ?? '').trim();

  if (R_BADGE_GAMES.has(g)) return 'R';
  if (ROULETTE_GAMES.has(g)) return w || '-';
  if (g === 'sicbo' || g === 'sicbo2') return w || '-';
  if (g === 'lottcard') {
    const digs = w.match(/\d/g);
    return digs ? digs.join('') : w || '-';
  }

  if (['vaaa', 'aaa', 'aaa2'].includes(g)) {
    return w === '1' ? 'A' : w === '2' ? 'B' : 'C';
  }
  if (g === 'vdtl20' || g === 'dtl20') {
    if (w === '1') return 'D';
    if (w === '21' || w === '2') return 'T';
    if (w === '41' || w === '3') return 'L';
    return 'L';
  }
  if (['vbtable', 'btable', 'btable2'].includes(g)) {
    return { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F' }[w] || w || '-';
  }
  if (['baccarat', 'baccarat2', 'pbaccarat'].includes(g)) {
    return w === '1' ? 'P' : w === '2' ? 'B' : 'T';
  }
  if (['dt6', 'vdt6', 'dt202', 'dt20', 'pdt6', 'pdt20'].includes(g)) {
    return w === '1' ? 'D' : w === '3' ? 'Tie' : 'T';
  }
  if (['card32', 'card32eu', 'pcard32'].includes(g)) {
    return { 1: '8', 2: '9', 3: '10', 4: '11' }[w] || '11';
  }
  if (
    [
      'lucky7',
      'lucky7eu',
      'lucky7eu2',
      'vlucky7',
      'plucky7',
      'lucky5',
    ].includes(g)
  ) {
    return w === '1' ? 'L' : w === '2' ? 'H' : 'T';
  }
  if (g === 'dum10') {
    return w === '1' ? 'Y' : 'N';
  }
  if (g === 'mogambo') {
    return w === '1' ? 'W' : 'L';
  }
  if (g === 'race17') {
    return w === '1' ? 'Y' : 'N';
  }
  if (g === 'superover') {
    return w === '1' ? 'E' : w === '2' ? 'R' : 'T';
  }
  if (g === 'superover2') {
    return w === '1' ? 'I' : w === '2' ? 'E' : 'T';
  }
  if (g === 'superover3') {
    return w === '1' ? 'I' : w === '2' ? 'A' : 'T';
  }
  if (g === 'cricketv3') {
    return w === '1' ? 'A' : w === '2' ? 'I' : 'T';
  }
  if (g === 'race2') {
    return { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }[w] || w || '-';
  }
  if (g === 'race20') {
    return { 1: '♠', 2: '♥', 3: '♣', 4: '♦' }[w] || w || '-';
  }
  if (g === 'cmatch20') {
    return w || '-';
  }
  if (g === 'teen1') {
    return w === '1' ? 'P' : 'D';
  }
  if (g === 'teen120') {
    return w === '1' ? 'P' : w === '2' ? 'D' : 'T';
  }
  if (g === 'teen9') {
    return w === '1' ? 'T' : w === '2' ? 'L' : w === '3' ? 'D' : w || '-';
  }
  if (g === 'queen') {
    return { 1: '0', 2: '1', 3: '2', 4: '3' }[w] || '0';
  }
  if (g === 'poker6') {
    const num = Number(w);
    if (num >= 11 && num <= 16) return String(num - 10);
    return w === '0' ? 'T' : w || '-';
  }
  if (g === 'lucky15') {
    return { 1: '0', 2: '1', 3: '2', 4: '4', 5: '6', 6: 'W' }[w] || 'W';
  }

  return w === '1' ? 'A' : w === '2' ? 'B' : 'T';
};

// Result background colors
export const getResultBgColor = (gameid, win) => {
  const g = String(gameid || '').toLowerCase();
  const w = String(win ?? '').trim();

  if (R_BADGE_GAMES.has(g)) {
    return 'bg-[#355e3b] text-[#f5cc03]';
  }
  if (ROULETTE_GAMES.has(g)) {
    if (w === '0' || w === '00') return 'bg-[#229632] text-white';
    return ROULETTE_RED_NUMS.has(Number(w))
      ? 'bg-[#d9534f] text-white'
      : 'bg-[#222222] text-white';
  }
  if (g === 'sicbo' || g === 'sicbo2' || g === 'lottcard') {
    return 'bg-[#355e3b] text-[#f5cc03]';
  }
  if (['vaaa', 'aaa', 'aaa2', 'vdtl20', 'dtl20'].includes(g)) {
    if (w === '1') return 'bg-[#ff4500] text-white';
    if (w === '2' || w === '21') return 'bg-[#e2ee26] text-black';
    if (w === '3' || w === '41') return 'bg-[#33c6ff] text-black';
    return 'bg-gray-400';
  }
  if (['vbtable', 'btable', 'btable2'].includes(g)) {
    return 'bg-[#355e3b] text-[#f5cc03]';
  }
  if (['baccarat', 'baccarat2', 'pbaccarat'].includes(g)) {
    if (w === '1') return 'bg-[#428bca] text-white';
    if (w === '2') return 'bg-[#d9534f] text-white';
    if (w === '3') return 'bg-[#5cb85c] text-white';
    return 'bg-gray-400';
  }
  if (['dt6', 'vdt6', 'dt202', 'dt20', 'pdt6', 'pdt20'].includes(g)) {
    if (w === '1') return 'bg-[#72bbef]';
    if (w === '2') return 'bg-[#f9a9ba]';
    if (w === '3') return 'bg-[#ffff33]';
    return 'bg-gray-400';
  }
  if (
    ['card32', 'card32eu', 'pcard32', 'queen', 'poker6', 'lucky15'].includes(g)
  ) {
    return 'bg-[#ffff33] text-[#111]';
  }
  if (
    [
      'lucky7',
      'lucky7eu',
      'lucky7eu2',
      'vlucky7',
      'plucky7',
      'lucky5',
    ].includes(g)
  ) {
    if (w === '1') return 'bg-[#f9a9ba]';
    if (w === '2') return 'bg-[#72bbef]';
    return 'bg-[#ffff33]';
  }
  if (w === '1') return 'bg-[#72bbef]';
  if (w === '2') return 'bg-[#f9a9ba]';
  return 'bg-gray-400';
};

// Video stream timeout (ms)
export const VIDEO_LOAD_TIMEOUT = 20000;

// Winner popup display duration (ms)
export const WINNER_POPUP_DURATION = 5000;

// Default bet odds
export const DEFAULT_BET_ODDS = 1.29;

// Default max bet amount
export const DEFAULT_MAX_AMOUNT = 100000;
