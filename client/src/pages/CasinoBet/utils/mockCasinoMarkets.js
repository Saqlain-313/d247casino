const makeOption = (sid, nat, subtype, b = '1.98', l = '2.02') => ({
  sid, nat, subtype, b, l, min: 100, max: 100000,
  gstatus: 'ACTIVE', status: 'ACTIVE', pt: '125000', pl: '98000',
});

export const createMockCasinoMarkets = (gameid) => {
  const twoWay = (a, b, group = 'main') => [
    makeOption(1, a, group, '1.98', '2.02'),
    makeOption(2, b, group, '1.98', '2.02'),
  ];

  if (gameid === 'baccarat' || gameid === 'baccarat2' || gameid === 'teensin') {
    return [
      makeOption(1, 'Player', 'main', '2.00', '2.02'),
      makeOption(2, 'Banker', 'main', '1.95', '1.97'),
      makeOption(3, 'Tie', 'main', '8.50', '9.00'),
      makeOption(4, 'Player Pair', 'pair', '11.00', '12.00'),
      makeOption(5, 'Banker Pair', 'pair', '11.00', '12.00'),
    ];
  }

  if (gameid === 'dt202' || gameid === 'dt6' || gameid === 'lucky7eu') {
    return [
      ...twoWay('Dragon', 'Tiger'),
      makeOption(3, 'Tie', 'side', '8.00', '9.00'),
      makeOption(4, 'Dragon Odd', 'dragon', '1.90', '1.95'),
      makeOption(5, 'Dragon Even', 'dragon', '1.90', '1.95'),
      makeOption(6, 'Tiger Odd', 'tiger', '1.90', '1.95'),
      makeOption(7, 'Tiger Even', 'tiger', '1.90', '1.95'),
    ];
  }

  if (gameid === 'poker20') {
    return Array.from({ length: 18 }, (_, i) => {
      const sid = i + 11;
      const player = sid <= 19 ? 'Player A' : 'Player B';
      return makeOption(sid, `Pair ${sid <= 19 ? sid - 10 : sid - 19}`, 'poker20', '2.10', '2.14');
    });
  }

  if (gameid === 'teenmuf') {
    return [
      makeOption(1, 'Player A', 'main', '1.95', '2.00'),
      makeOption(2, 'Player B', 'main', '1.95', '2.00'),
    ];
  }

  if (gameid === 'card32' || gameid === 'card32eu') {
    const labels = [
      'Player 8', 'Player 9', 'Player 10', 'Player 11',
      'Odd', 'Even', 'Red', 'Black', 'Spade', 'Club',
      'Heart', 'Diamond', 'Red', 'Black', 'Lucky 0', 'Lucky 1',
      'Lucky 2', 'Lucky 3', 'Lucky 4', 'Lucky 5', 'Lucky 6',
      'Lucky 7', 'Lucky 8', 'Lucky 9', 'Total 0', 'Total 1',
      'Total 2',
    ];
    return labels.map((name, i) => makeOption(i + 1, name,
      i < 4 ? 'winner' : i < 12 ? 'oddEven' : i < 14 ? 'cardColor' : i < 24 ? 'luckyNumber' : 'cardTotal',
      i < 4 ? '2.00' : '1.90', i < 4 ? '2.04' : '1.94'));
  }

  if (gameid === 'lucky7' || gameid === 'lucky7eu2') {
    const labels = ['Low', 'High', 'Seven', 'Odd', 'Even', 'Red', 'Black', 'Spade', 'Club', 'Heart', 'Diamond'];
    return labels.map((name, i) => makeOption(i + 1, name, i < 3 ? 'winner' : i < 5 ? 'oddEven' : i < 7 ? 'cardColor' : i < 9 ? 'cardSuit' : 'luckyCard', '1.95', '2.00'));
  }

  const main = gameid || 'Winner';
  return [
    makeOption(1, 'Player A', main, '1.95', '2.00'),
    makeOption(2, 'Player B', main, '1.95', '2.00'),
    makeOption(3, 'Tie', 'Side Bets', '8.00', '8.50'),
    makeOption(4, 'Odd', 'Odd / Even', '1.90', '1.95'),
    makeOption(5, 'Even', 'Odd / Even', '1.90', '1.95'),
    makeOption(6, 'Red', 'Color', '1.90', '1.95'),
    makeOption(7, 'Black', 'Color', '1.90', '1.95'),
  ];
};
