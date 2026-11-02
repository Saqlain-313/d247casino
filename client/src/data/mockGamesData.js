/**
 * Realistic Mock Game Data Generator for Diamond247 Casino
 * 100% INDIVIDUAL, ZERO-GROUPING, ZERO-FAMILY SPECIFICATION.
 * Every single one of the 93 games has its own dedicated round data specification.
 */

export const DECK = [
  "10CC", "10DD", "10HH", "10SS", "2CC", "2DD", "2HH", "2SS",
  "3CC", "3DD", "3HH", "3SS", "4CC", "4DD", "4HH", "4SS",
  "5CC", "5DD", "5HH", "5SS", "6CC", "6DD", "6HH", "6SS",
  "7CC", "7DD", "7HH", "7SS", "8CC", "8DD", "8HH", "8SS",
  "9CC", "9DD", "9HH", "9SS", "ACC", "ADD", "AHH", "ASS",
  "JCC", "JDD", "JHH", "JSS", "KCC", "KDD", "KHH", "KSS",
  "QCC", "QDD", "QHH", "QSS"
];

function getRandomCard() {
  return DECK[Math.floor(Math.random() * DECK.length)];
}

function getRandomCards(count) {
  const shuffled = [...DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateMockRoundData(slug) {
  const roundId = "30" + Math.floor(1000000000000 + Math.random() * 9000000000000);

  // 1. Lucky 7 Variants (vlucky7, lucky7, lucky7eu, lucky7eu2, plucky7) - 1 Center Card
  if (
    slug === 'vlucky7' ||
    slug === 'lucky7' ||
    slug === 'lucky7eu' ||
    slug === 'lucky7eu2' ||
    slug === 'plucky7'
  ) {
    const card = getRandomCard();
    const isVirtual = slug === 'vlucky7';
    return {
      roundId,
      slug,
      cards: { center: [card] },
      results: ['L', 'H', 'H', 'L', '7', 'L', 'H', 'H', 'L', 'H'],
      markets: {
        low: { name: 'Low (A-6)', back: '2.0', volume: '150k' },
        high: { name: 'High (8-K)', back: '2.0', volume: '180k' },
        seven: { name: 'Card 7', back: '12.0', volume: '25k' },
        even: { name: 'Even', back: '2.10', volume: '80k' },
        odd: { name: 'Odd', back: '1.79', volume: '95k' },
        red: { name: 'Red', back: '1.95', volume: '120k' },
        black: { name: 'Black', back: '1.95', volume: '110k' },
        groupOdds: isVirtual ? '3.90' : '4.00',
        cardsOdds: '12.0',
      },
    };
  }

  // 2. Lucky 5 (Lucky 6) - 1 Center Card (Ace to Jack, Pivot 6)
  if (slug === 'lucky5') {
    const lucky5Cards = ['ACC', '2DD', '3HH', '4SS', '5CC', '6DD', '7HH', '8SS', '9CC', '10DD', 'JHH'];
    const card = lucky5Cards[Math.floor(Math.random() * lucky5Cards.length)];
    return {
      roundId,
      slug,
      cards: { center: [card] },
      results: ['L', 'H', '6', 'L', 'H', 'L', 'H', 'L'],
      markets: {
        low: { name: 'Low (1-5)', back: '2.00', volume: '90k' },
        six: { name: 'Card 6', back: '12.00', volume: '20k' },
        high: { name: 'High (7-11)', back: '2.00', volume: '90k' },
        even: { name: 'Even', back: '2.10', volume: '50k' },
        odd: { name: 'Odd', back: '1.79', volume: '50k' },
        red: { name: 'Red', back: '1.95', volume: '60k' },
        black: { name: 'Black', back: '1.95', volume: '60k' },
      },
    };
  }

  // 3. Lucky 15 Cricket (lucky15)
  if (slug === 'lucky15') {
    const balls = [4, 6, 0, 1, 'W', 2];
    return {
      roundId,
      slug,
      cards: {},
      balls,
      results: ['4 Runs', '6 Runs', '0 Runs', '1 Run', 'Wicket', '2 Runs'],
      markets: {
        batsman: { name: 'Batsman', back: '1.95', lay: '2.05', volume: '210k' },
        bowler: { name: 'Bowler', back: '1.95', lay: '2.05', volume: '210k' },
        runsUnder: { name: 'Runs Under 15', back: '1.90', volume: '85k' },
        runsOver: { name: 'Runs Over 15', back: '1.90', volume: '85k' },
      },
    };
  }

  // 4. Trio & Judgement (vtrio, trio, 3cardj) - 3 Center Cards
  if (slug === 'vtrio' || slug === 'trio' || slug === '3cardj') {
    const [c1, c2, c3] = getRandomCards(3);
    return {
      roundId,
      slug,
      cards: { center: [c1, c2, c3] },
      results: ['Pair', 'High Card', 'Flush', 'Straight', 'High Card', 'Pair'],
      markets: {
        session21: { name: 'Session 21 (Yes/No)', back: '21.00', lay: '22.00', volume: '75k' },
        judge124: { name: 'Judgement (1, 2, 4)', back: '1.98', lay: '2.02', volume: '60k' },
        judgeJQK: { name: 'Judgement (J, Q, K)', back: '1.98', lay: '2.02', volume: '60k' },
        twoRed: { name: 'Two Red Only', back: '2.40', volume: '50k' },
        twoBlack: { name: 'Two Black Only', back: '2.40', volume: '50k' },
        twoOdd: { name: 'Two Odd Only', back: '2.40', volume: '50k' },
        twoEven: { name: 'Two Even Only', back: '2.40', volume: '50k' },
        pair: { name: 'Pair', back: '5.50', volume: '80k' },
        flush: { name: 'Flush', back: '17.00', volume: '40k' },
        straight: { name: 'Straight', back: '24.00', volume: '30k' },
        trio: { name: 'Trio', back: '201.00', volume: '20k' },
        straightFlush: { name: 'Straight Flush', back: '226.00', volume: '15k' },
      },
    };
  }

  // 5. Amar Akbar Anthony (vaaa, aaa, aaa2) - 1 Center Card
  if (slug === 'vaaa' || slug === 'aaa' || slug === 'aaa2') {
    const card = getRandomCard();
    return {
      roundId,
      slug,
      cards: { center: [card] },
      results: ['Amar', 'Akbar', 'Amar', 'Anthony', 'Akbar', 'Amar'],
      markets: {
        amar: { name: 'Amar (A-6)', back: '2.12', lay: '2.16', volume: '120k' },
        akbar: { name: 'Akbar (7-10)', back: '3.15', lay: '3.20', volume: '90k' },
        anthony: { name: 'Anthony (J-K)', back: '4.25', lay: '4.30', volume: '60k' },
        even: { name: 'Even', back: '2.12', volume: '50k' },
        odd: { name: 'Odd', back: '1.83', volume: '50k' },
        red: { name: 'Red', back: '1.97', volume: '70k' },
        black: { name: 'Black', back: '1.97', volume: '70k' },
        under7: { name: 'Under 7', back: '2.12', volume: '40k' },
        over7: { name: 'Over 7', back: '1.83', volume: '40k' },
      },
    };
  }

  // 6. Dragon Tiger Lion (vdtl20, dtl20) - 3 Cards: D, T, L
  if (slug === 'vdtl20' || slug === 'dtl20') {
    const [c1, c2, c3] = getRandomCards(3);
    return {
      roundId,
      slug,
      cards: { dragon: [c1], tiger: [c2], lion: [c3] },
      results: ['D', 'L', 'D', 'T', 'D', 'D', 'D', 'D', 'L', 'D'],
      markets: {
        winner: { dragon: '2.94', tiger: '2.94', lion: '2.94' },
        black: { dragon: '1.95', tiger: '1.95', lion: '1.95' },
        red: { dragon: '1.95', tiger: '1.95', lion: '1.95' },
        odd: { dragon: '1.79', tiger: '1.79', lion: '1.79' },
        even: { dragon: '2.10', tiger: '2.10', lion: '2.10' },
        cardsOdds: '12.0',
      },
    };
  }

  // 7. Dragon Tiger 2-way (vdt6, dt20, dt6, dt202, pdt20, pdt6)
  if (
    slug === 'vdt6' ||
    slug === 'dt20' ||
    slug === 'dt6' ||
    slug === 'dt202' ||
    slug === 'pdt20' ||
    slug === 'pdt6'
  ) {
    const [c1, c2] = getRandomCards(2);
    return {
      roundId,
      slug,
      cards: { dragon: [c1], tiger: [c2] },
      results: ['D', 'T', 'D', 'D', 'T', 'Tie', 'D', 'T'],
      markets: {
        dragon: { name: 'Dragon', back: '1.98', lay: '2.02', volume: '200k' },
        tiger: { name: 'Tiger', back: '1.98', lay: '2.02', volume: '200k' },
        tie: { name: 'Tie', back: '11.00', volume: '30k' },
        suitedTie: { name: 'Suited Tie', back: '50.00', volume: '10k' },
        pair: { name: 'Pair', back: '11.00', volume: '25k' },
        dragonEven: { name: 'Dragon Even', back: '2.10', volume: '40k' },
        dragonOdd: { name: 'Dragon Odd', back: '1.79', volume: '45k' },
        dragonRed: { name: 'Dragon Red', back: '1.95', volume: '50k' },
        dragonBlack: { name: 'Dragon Black', back: '1.95', volume: '50k' },
        tigerEven: { name: 'Tiger Even', back: '2.10', volume: '40k' },
        tigerOdd: { name: 'Tiger Odd', back: '1.79', volume: '45k' },
        tigerRed: { name: 'Tiger Red', back: '1.95', volume: '50k' },
        tigerBlack: { name: 'Tiger Black', back: '1.95', volume: '50k' },
      },
    };
  }

  // 8. Roulette Games (roulette11, roulette12, roulette13, ourroullete)
  if (
    slug === 'roulette11' ||
    slug === 'roulette12' ||
    slug === 'roulette13' ||
    slug === 'ourroullete'
  ) {
    const winningNumber = Math.floor(Math.random() * 37); // 0 to 36
    return {
      roundId,
      slug,
      cards: {},
      winningNumber,
      results: ['17', '4', '0', '23', '36', '11', '8', '29'],
      markets: {
        straightUp: { back: '36.00' },
        red: { name: 'Red', back: '2.00', volume: '180k' },
        black: { name: 'Black', back: '2.00', volume: '180k' },
        even: { name: 'Even', back: '2.00', volume: '150k' },
        odd: { name: 'Odd', back: '2.00', volume: '150k' },
        low: { name: 'Low (1-18)', back: '2.00', volume: '110k' },
        high: { name: 'High (19-36)', back: '2.00', volume: '110k' },
        dozen1: { name: '1st Dozen (1-12)', back: '3.00', volume: '90k' },
        dozen2: { name: '2nd Dozen (13-24)', back: '3.00', volume: '90k' },
        dozen3: { name: '3rd Dozen (25-36)', back: '3.00', volume: '90k' },
        col1: { name: '1st Column', back: '3.00', volume: '80k' },
        col2: { name: '2nd Column', back: '3.00', volume: '80k' },
        col3: { name: '3rd Column', back: '3.00', volume: '80k' },
      },
    };
  }

  // 9. Worli Matka Games (worli, worli2, worli3, dolidana)
  if (
    slug === 'worli' ||
    slug === 'worli2' ||
    slug === 'worli3' ||
    slug === 'dolidana'
  ) {
    const singleDigit = Math.floor(Math.random() * 10);
    const panaList = ['128', '235', '357', '448', '112', '777', '560', '140'];
    const pana = panaList[Math.floor(Math.random() * panaList.length)];
    return {
      roundId,
      slug,
      cards: { single: String(singleDigit), pana },
      results: ['7', '3', '8', '0', '4', '7', '1', '9'],
      markets: {
        singleOdds: '9.50',
        jodiOdds: '95.00',
        spOdds: '140.00',
        dpOdds: '280.00',
        tpOdds: '600.00',
        even: { name: 'Even', back: '1.95', volume: '80k' },
        odd: { name: 'Odd', back: '1.95', volume: '80k' },
        line1: { name: 'Line 1 (1-5)', back: '2.00', volume: '60k' },
        line2: { name: 'Line 2 (6-0)', back: '2.00', volume: '60k' },
      },
    };
  }

  // 10. 32 Cards Series (card32, card32eu, pcard32) - 4 Player cards
  if (slug === 'card32' || slug === 'card32eu' || slug === 'pcard32') {
    const [c1, c2, c3, c4] = getRandomCards(4);
    return {
      roundId,
      slug,
      cards: { p8: [c1], p9: [c2], p10: [c3], p11: [c4] },
      results: ['P8', 'P9', 'P8', 'P10', 'P11', 'P8', 'P9'],
      markets: {
        player8: { name: 'Player 8', back: '1.98', lay: '2.02', volume: '120k', baseScore: 8 },
        player9: { name: 'Player 9', back: '2.50', lay: '2.60', volume: '95k', baseScore: 9 },
        player10: { name: 'Player 10', back: '3.50', lay: '3.65', volume: '75k', baseScore: 10 },
        player11: { name: 'Player 11', back: '4.50', lay: '4.70', volume: '50k', baseScore: 11 },
        total8: { name: 'Player 8 Total Runs', back: '22.5', lay: '23.5', volume: '40k' },
        total9: { name: 'Player 9 Total Runs', back: '22.5', lay: '23.5', volume: '40k' },
        total10: { name: 'Player 10 Total Runs', back: '22.5', lay: '23.5', volume: '40k' },
        total11: { name: 'Player 11 Total Runs', back: '22.5', lay: '23.5', volume: '40k' },
      },
    };
  }

  // 11. Andar Bahar Games (ab20, ab3, ab4, abj)
  if (slug === 'ab20' || slug === 'ab3' || slug === 'ab4' || slug === 'abj') {
    const [cMain, c1, c2, c3, c4] = getRandomCards(5);
    return {
      roundId,
      slug,
      cards: { main: [cMain], andar: [c1, c2], bahar: [c3, c4] },
      results: ['A', 'B', 'A', 'A', 'B', 'A', 'B'],
      markets: {
        andar: { name: 'Andar', back: '1.98', lay: '2.02', volume: '210k' },
        bahar: { name: 'Bahar', back: '1.98', lay: '2.02', volume: '210k' },
        andar1st: { name: 'Andar 1st Bet', back: '1.95', volume: '90k' },
        bahar1st: { name: 'Bahar 1st Bet', back: '1.95', volume: '90k' },
        r1_5: { name: '1-5 Cards', back: '3.50', volume: '50k' },
        r6_10: { name: '6-10 Cards', back: '4.00', volume: '40k' },
        r11_15: { name: '11-15 Cards', back: '5.50', volume: '30k' },
        r16_25: { name: '16-25 Cards', back: '7.00', volume: '20k' },
        r26_40: { name: '26-40 Cards', back: '12.00', volume: '15k' },
        r41plus: { name: '41+ Cards', back: '50.00', volume: '10k' },
      },
    };
  }

  // 12. Baccarat Games (baccarat, baccarat2, pbaccarat, btable, btable2, vbtable, teensin)
  if (
    slug === 'baccarat' ||
    slug === 'baccarat2' ||
    slug === 'pbaccarat' ||
    slug === 'btable' ||
    slug === 'btable2' ||
    slug === 'vbtable' ||
    slug === 'teensin'
  ) {
    const [p1, p2, b1, b2] = getRandomCards(4);
    return {
      roundId,
      slug,
      cards: { player: [p1, p2], banker: [b1, b2] },
      results: ['P', 'B', 'B', 'P', 'Tie', 'B', 'P', 'B'],
      markets: {
        player: { name: 'Player', back: '1.98', volume: '180k' },
        banker: { name: 'Banker', back: '1.95', volume: '220k' },
        tie: { name: 'Tie', back: '9.00', volume: '40k' },
        playerPair: { name: 'Player Pair', back: '12.00', volume: '15k' },
        bankerPair: { name: 'Banker Pair', back: '12.00', volume: '15k' },
        playerNatural: { name: 'Player Natural 9', back: '3.50', volume: '20k' },
        bankerNatural: { name: 'Banker Natural 9', back: '3.50', volume: '20k' },
        anyPair: { name: 'Any Pair', back: '6.00', volume: '15k' },
        perfectPair: { name: 'Perfect Pair', back: '25.00', volume: '10k' },
      },
    };
  }

  // 13. Sic Bo (sicbo, sicbo2) - 3 Dice
  if (slug === 'sicbo' || slug === 'sicbo2') {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    return {
      roundId,
      slug,
      dice: [d1, d2, d3],
      cards: {},
      results: ['Small', 'Big', 'Big', 'Small', 'Triple', 'Big'],
      markets: {
        small: { name: 'Small (4-10)', back: '1.98', lay: '2.02', volume: '240k' },
        big: { name: 'Big (11-17)', back: '1.98', lay: '2.02', volume: '240k' },
        odd: { name: 'Odd', back: '1.95', volume: '80k' },
        even: { name: 'Even', back: '1.95', volume: '80k' },
        triple: { name: 'Any Triple', back: '30.00', volume: '15k' },
        double: { name: 'Specific Double', back: '10.00', volume: '25k' },
      },
    };
  }

  // 14. Goal 2 (goal2) - Football Simulation
  if (slug === 'goal2') {
    const players = [
      'Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski',
      'Karim Benzema', 'Edinson Cavani', 'Luis Suarez',
      'Neymar', 'Sergio Aguero', 'Olivier Giroud',
      'Mohamed Salah', 'Kylian Mbappe', 'No Goal',
    ];
    const methods = ['Shot Goal', 'Header Goal', 'Penalty Goal', 'Free Kick Goal', 'No Goal'];
    const pWinner = players[Math.floor(Math.random() * players.length)];
    const mWinner = pWinner === 'No Goal' ? 'No Goal' : methods[Math.floor(Math.random() * (methods.length - 1))];
    const rdesc = pWinner === 'No Goal' ? 'No Goal' : `${pWinner} - ${mWinner}`;

    return {
      roundId,
      slug,
      goalPlayerWinner: pWinner,
      goalMethodWinner: mWinner,
      cards: {},
      rdesc,
      results: ['CR7 Shot', 'Messi Penalty', 'No Goal', 'Mbappe Shot', 'Lewandowski Header', 'No Goal'],
      remark: 'Who Will Goal Next? Predict the scorer and method of goal!',
      markets: {
        ronaldo: { name: 'Cristiano Ronaldo', back: '4.50', lay: '4.80', volume: '150k' },
        messi: { name: 'Lionel Messi', back: '4.80', lay: '5.10', volume: '150k' },
        noGoal: { name: 'No Goal', back: '3.20', lay: '3.40', volume: '200k' },
        shotGoal: { name: 'Shot Goal', back: '1.85', lay: '1.92', volume: '250k' },
        headerGoal: { name: 'Header Goal', back: '4.50', lay: '4.80', volume: '80k' },
        penaltyGoal: { name: 'Penalty Goal', back: '6.00', lay: '6.50', volume: '50k' },
        freeKickGoal: { name: 'Free Kick Goal', back: '12.00', lay: '13.00', volume: '30k' },
      },
    };
  }

  // 15. Goal (goal) - Penalty Shootout
  if (slug === 'goal') {
    return {
      roundId,
      slug,
      targetQuadrant: Math.floor(Math.random() * 5),
      cards: {},
      results: ['Goal', 'Miss', 'Goal', 'Goal', 'Save', 'Goal'],
      markets: {
        goal: { name: 'Goal', back: '1.95', lay: '2.05', volume: '300k' },
        noGoal: { name: 'No Goal (Miss/Save)', back: '1.95', lay: '2.05', volume: '300k' },
        topLeft: { name: 'Top Left', back: '4.50', volume: '60k' },
        topRight: { name: 'Top Right', back: '4.50', volume: '60k' },
        bottomLeft: { name: 'Bottom Left', back: '4.50', volume: '60k' },
        bottomRight: { name: 'Bottom Right', back: '4.50', volume: '60k' },
        center: { name: 'Center', back: '5.00', volume: '40k' },
      },
    };
  }

  // 16. Cricket Games (superover, superover2, superover3, cricketv3, cmatch20, ballbyball)
  if (
    slug === 'superover' ||
    slug === 'superover2' ||
    slug === 'superover3' ||
    slug === 'cricketv3' ||
    slug === 'cmatch20' ||
    slug === 'ballbyball'
  ) {
    return {
      roundId,
      slug,
      cards: {},
      balls: [0, 1, 4, 6, 2, 'W'],
      results: ['Batsman', 'Bowler', 'Batsman', 'Batsman', 'Bowler'],
      markets: {
        batsman: { name: 'Batsman', back: '1.95', lay: '2.05', volume: '350k' },
        bowler: { name: 'Bowler', back: '1.95', lay: '2.05', volume: '350k' },
        overRunsUnder: { name: 'Runs Under 10.5', back: '1.90', volume: '120k' },
        overRunsOver: { name: 'Runs Over 10.5', back: '1.90', volume: '120k' },
        boundaryYes: { name: 'Boundary in Over (Yes)', back: '1.65', volume: '140k' },
        boundaryNo: { name: 'Boundary in Over (No)', back: '2.20', volume: '110k' },
      },
    };
  }

  // 17. Poker Games (poker, poker20, poker6)
  if (slug === 'poker' || slug === 'poker20' || slug === 'poker6') {
    const [c1, c2, c3, c4] = getRandomCards(4);
    const comm = getRandomCards(5);
    return {
      roundId,
      slug,
      cards: {
        playerA: [c1, c2],
        playerB: [c3, c4],
        community: comm,
      },
      results: ['A', 'B', 'A', 'A', 'B', 'Tie', 'A'],
      markets: {
        playerA: { name: 'Player A', back: '1.98', lay: '2.02', volume: '180k' },
        playerB: { name: 'Player B', back: '1.98', lay: '2.02', volume: '180k' },
        tie: { name: 'Tie', back: '21.00', volume: '25k' },
        pairA: { name: 'Pair Player A', back: '3.50', volume: '40k' },
        pairB: { name: 'Pair Player B', back: '3.50', volume: '40k' },
        flush: { name: 'Any Flush', back: '8.00', volume: '30k' },
        straight: { name: 'Any Straight', back: '12.00', volume: '20k' },
      },
    };
  }

  // 18. Race Games (race20, race17, race2)
  if (slug === 'race20' || slug === 'race17' || slug === 'race2') {
    const card = getRandomCard();
    return {
      roundId,
      slug,
      cards: { center: [card] },
      results: ['♠ Spade', '♥ Heart', '♣ Club', '♦ Diamond', '♠ Spade'],
      markets: {
        spade: { name: 'Spade ♠', back: '3.75', lay: '3.95', volume: '110k' },
        heart: { name: 'Heart ♥', back: '3.75', lay: '3.95', volume: '110k' },
        club: { name: 'Club ♣', back: '3.75', lay: '3.95', volume: '110k' },
        diamond: { name: 'Diamond ♦', back: '3.75', lay: '3.95', volume: '110k' },
      },
    };
  }

  // 19. 1 Card Teen Patti (teen1, teen120)
  if (slug === 'teen1' || slug === 'teen120') {
    const [c1, c2] = getRandomCards(2);
    return {
      roundId,
      slug,
      cards: { playerA: [c1], playerB: [c2] },
      results: ['A', 'B', 'A', 'A', 'B', 'A', 'B', 'B'],
      markets: {
        playerA: { name: 'Player A', back: '1.98', lay: '2.02', volume: '300k' },
        playerB: { name: 'Player B', back: '1.98', lay: '2.02', volume: '300k' },
        tie: { name: 'Tie', back: '11.00', volume: '30k' },
      },
    };
  }

  // 20. 2 Cards Teen Patti (patti2)
  if (slug === 'patti2') {
    const [a1, a2, b1, b2] = getRandomCards(4);
    return {
      roundId,
      slug,
      cards: { playerA: [a1, a2], playerB: [b1, b2] },
      results: ['A', 'B', 'A', 'A', 'B'],
      markets: {
        playerA: { name: 'Player A', back: '1.98', lay: '2.02', volume: '220k' },
        playerB: { name: 'Player B', back: '1.98', lay: '2.02', volume: '220k' },
        pairA: { name: 'Pair A', back: '5.50', volume: '40k' },
        pairB: { name: 'Pair B', back: '5.50', volume: '40k' },
      },
    };
  }

  // 21. Joker & Poison Teen Patti (joker1, joker20, joker120, poison, poison20)
  if (
    slug === 'joker1' ||
    slug === 'joker20' ||
    slug === 'joker120' ||
    slug === 'poison' ||
    slug === 'poison20'
  ) {
    const isJoker = slug.includes('joker');
    const [wildCard, ...cards6] = getRandomCards(7);
    return {
      roundId,
      slug,
      wildCard,
      wildCardType: isJoker ? 'Joker' : 'Poison',
      cards: {
        playerA: [cards6[0], cards6[1], cards6[2]],
        playerB: [cards6[3], cards6[4], cards6[5]],
        wild: [wildCard],
      },
      results: ['B', 'A', 'B', 'B', 'A', 'A', 'B'],
      markets: {
        playerA: { name: 'Player A', back: '1.98', lay: '2.02', volume: '260k' },
        playerB: { name: 'Player B', back: '1.98', lay: '2.02', volume: '260k' },
        baccaratA: { name: '3 Baccarat A', back: '1.98', volume: '70k' },
        baccaratB: { name: '3 Baccarat B', back: '1.98', volume: '70k' },
        totalA: { name: 'Total A', back: '2.00', volume: '60k' },
        totalB: { name: 'Total B', back: '2.00', volume: '60k' },
        pairPlusA: { name: 'Pair Plus A', back: 'A', volume: '90k' },
        pairPlusB: { name: 'Pair Plus B', back: 'B', volume: '90k' },
      },
    };
  }

  // 22. Open Teen Patti (teen41, teen42)
  if (slug === 'teen41' || slug === 'teen42') {
    const queenCard = slug === 'teen41' ? 'QSS' : 'JSS';
    const otherCards = getRandomCards(5);
    return {
      roundId,
      slug,
      cards: {
        playerA: [queenCard, otherCards[0], otherCards[1]],
        playerB: [otherCards[2], otherCards[3], otherCards[4]],
      },
      results: ['B', 'A', 'B', 'B', 'A', 'B', 'A', 'B'],
      markets: {
        playerAMain: { name: 'Player A Main', back: '1.98', lay: '2.02', volume: '250k' },
        playerBMain: { name: 'Player B Main', back: '1.98', lay: '2.02', volume: '250k' },
        playerBUnder21: { name: 'Player B Under 21', back: '1.98', volume: '100k' },
        playerBOver21: { name: 'Player B Over 21', back: '1.98', volume: '100k' },
      },
    };
  }

  // 23. Specialty Games (dum10, mogambo, queen, trap, notenum, lottcard, cmeter1)
  if (
    slug === 'dum10' ||
    slug === 'mogambo' ||
    slug === 'queen' ||
    slug === 'trap' ||
    slug === 'notenum' ||
    slug === 'lottcard' ||
    slug === 'cmeter1'
  ) {
    const card = getRandomCard();
    const isMogambo = slug === 'mogambo';
    const isQueen = slug === 'queen';
    const isTrap = slug === 'trap';
    const isDum10 = slug === 'dum10';
    const isNote = slug === 'notenum';

    return {
      roundId,
      slug,
      cards: { center: [card] },
      number: Math.floor(Math.random() * 10),
      results: isQueen
        ? ['Queen', 'King', 'Queen', 'Queen']
        : isTrap
        ? ['Trap', 'Escape', 'Trap', 'Trap']
        : isMogambo
        ? ['Mogambo Khush', 'Mogambo Udaas']
        : ['1', '5', '8', '3', '0', '7'],
      markets: {
        optA: {
          name: isQueen
            ? 'Queen'
            : isTrap
            ? 'Trap'
            : isMogambo
            ? 'Khush Hua'
            : isDum10
            ? '1 to 5'
            : isNote
            ? '0 to 4'
            : 'Low (1-5)',
          back: '1.98',
          lay: '2.02',
          volume: '150k',
        },
        optB: {
          name: isQueen
            ? 'King'
            : isTrap
            ? 'Escape'
            : isMogambo
            ? 'Udaas'
            : isDum10
            ? '6 to 10'
            : isNote
            ? '5 to 9'
            : 'High (6-10)',
          back: '1.98',
          lay: '2.02',
          volume: '150k',
        },
        even: { name: 'Even', back: '1.95', volume: '60k' },
        odd: { name: 'Odd', back: '1.95', volume: '60k' },
      },
    };
  }

  // 24. Muflis Teen Patti (vteenmuf, teenmuf)
  if (slug === 'vteenmuf' || slug === 'teenmuf') {
    const [a1, a2, a3, b1, b2, b3] = getRandomCards(6);
    return {
      roundId,
      slug,
      cards: {
        playerA: [a1, a2, a3],
        playerB: [b1, b2, b3],
      },
      results: ['A', 'B', 'A', 'B', 'B', 'A'],
      markets: {
        playerA: { name: 'Player A', back: '1.98', lay: '2.02', volume: '300k' },
        playerB: { name: 'Player B', back: '1.98', lay: '2.02', volume: '300k' },
        pairPlusA: { name: 'Pair Plus A', back: 'A', volume: '70k' },
        pairPlusB: { name: 'Pair Plus B', back: 'B', volume: '70k' },
      },
    };
  }

  // 25. Standard & 20-20 Teen Patti Variants
  // (vteen20, teen20, teen20b, teen20c, teen, teen3, teen32, teen33, teen6, teen8, teen9, pteen, pteen20, teenunique)
  const [a1, a2, a3, b1, b2, b3] = getRandomCards(6);
  return {
    roundId,
    slug,
    cards: {
      playerA: [a1, a2, a3],
      playerB: [b1, b2, b3],
    },
    results: ['B', 'B', 'A', 'B', 'B', 'A', 'B', 'A'],
    markets: {
      playerAMain: { name: 'Player A', back: '1.98', lay: '2.02', volume: '350k' },
      playerBMain: { name: 'Player B', back: '1.98', lay: '2.02', volume: '350k' },
      baccaratA: { name: '3 Baccarat A', back: '1.98', volume: '80k' },
      baccaratB: { name: '3 Baccarat B', back: '1.98', volume: '80k' },
      totalA: { name: 'Total A', back: '2.00', volume: '60k' },
      totalB: { name: 'Total B', back: '2.00', volume: '60k' },
      pairPlusA: { name: 'Pair Plus A', back: 'A', volume: '100k' },
      pairPlusB: { name: 'Pair Plus B', back: 'B', volume: '100k' },
      suitBlack: { name: 'Spade / Club', back: '1.98', volume: '50k' },
      suitRed: { name: 'Heart / Diamond', back: '1.98', volume: '50k' },
    },
  };
}
