export function computeNetOutcome(team, marketBets, mCashoutPL = 0) {
  let netOutcome = 0;
  marketBets.forEach((bet) => {
    const isBetOnThisTeam = bet.teamName?.toLowerCase() === team?.toLowerCase();
    const betAmt = parseFloat(bet.totalBetAmount) || 0;
    const stake = parseFloat(bet.totalPrice) || 0;

    if (bet.otype === 'back') {
      netOutcome += isBetOnThisTeam ? betAmt : -stake;
    } else {
      netOutcome += isBetOnThisTeam ? -stake : betAmt;
    }
  });
  return Math.round((netOutcome + mCashoutPL) * 100) / 100;
}

export function buildMatchOddsStylePendingLeg(bet, isBhav = false) {
  if (!bet?.stake || !bet?.odds || !bet?.team || !bet?.type) return null;
  const stakeNum = parseFloat(bet.stake);
  const oddsNum = parseFloat(bet.odds);
  if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum <= 0) return null;

  const useBhav = isBhav || String(bet?.gType || '').toLowerCase() === 'match1';
  const multiplier = useBhav ? oddsNum / 100 : oddsNum - 1;
  const isLay = bet.type === 'lay';
  return {
    teamName: bet.team,
    otype: bet.type,
    totalBetAmount: isLay ? stakeNum : stakeNum * multiplier,
    totalPrice: isLay ? stakeNum * multiplier : stakeNum,
  };
}

export function createMarketNetOutcomeHelpers({
  gameTypes,
  gameId,
  pendingBetHistory,
  pendingBetAmounts,
  cashoutPL,
  cashoutPLKey,
  marketName = null,
  isBhav = false,
}) {
  const matchesGameType = (value) =>
    gameTypes.some((t) => t.toLowerCase() === (value || '').toLowerCase());

  const matchesMarketName = (value) => {
    if (!marketName || !value) return true;
    const norm = (s) =>
      String(s || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    return norm(value) === norm(marketName);
  };

  const getHistoryMarketBets = () => {
    if (!Array.isArray(pendingBetHistory) || !gameId) return [];

    return pendingBetHistory
      .filter((b) => {
        if (String(b.gameId) !== String(gameId)) return false;
        return matchesGameType(b.gameType) && matchesMarketName(b.marketName);
      })
      .map((b) => ({
        gameType: b.gameType,
        marketName: b.marketName,
        teamName: b.teamName,
        otype: b.otype,
        totalBetAmount: b.betAmount,
        totalPrice: b.price,
      }));
  };

  const getMarketBets = () => {
    const historyBets = getHistoryMarketBets();
    const amountBets =
      pendingBetAmounts?.filter(
        (item) =>
          matchesGameType(item.gameType) && matchesMarketName(item.marketName)
      ) || [];
    return historyBets.length > 0 ? historyBets : amountBets;
  };

  const getMarketCashoutPL = () => cashoutPL?.[cashoutPLKey] || 0;

  const getBetDetails = (team) => {
    const mCashoutPL = getMarketCashoutPL();
    const marketBets = getMarketBets();

    const matchedTeamBet = marketBets.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );
    const otherTeamBet = marketBets[0];

    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || '';
    const totalBetAmount =
      matchedTeamBet?.totalBetAmount || otherTeamBet?.totalBetAmount || '';
    const totalPrice =
      matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || '';
    const teamName = matchedTeamBet?.teamName || otherTeamBet?.teamName || '';

    if (marketBets.length === 0) {
      if (mCashoutPL) {
        return {
          isHedged: true,
          netOutcome: Math.round(mCashoutPL * 100) / 100,
          otype: '',
          totalBetAmount: '',
          totalPrice: '',
          teamName: '',
        };
      }
      return {
        isHedged: false,
        netOutcome: null,
        otype,
        totalBetAmount,
        totalPrice,
        teamName,
      };
    }

    return {
      isHedged: true,
      netOutcome: computeNetOutcome(team, marketBets, mCashoutPL),
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  const getProjectedNetOutcome = (team, bet) => {
    const pendingLeg = buildMatchOddsStylePendingLeg(bet, isBhav);
    if (!pendingLeg) return null;
    return computeNetOutcome(
      team,
      [...getMarketBets(), pendingLeg],
      getMarketCashoutPL()
    );
  };

  const isSelectedBetInMarket = (bet) => {
    if (!bet) return false;
    return matchesGameType(bet.gameType) || matchesGameType(bet.marketName);
  };

  return {
    getBetDetails,
    getProjectedNetOutcome,
    isSelectedBetInMarket,
  };
}
