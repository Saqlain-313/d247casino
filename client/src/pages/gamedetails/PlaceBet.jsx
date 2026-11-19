import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBet,
  createfancyBet,
  getPendingBetAmo,
  getBetHistory,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import ButtonValues from '../../components/header/ButtonValues';

function PlaceBet({
  selectedBet,
  onBetChange,
  onClose,
  isMobile = false,
  team1,
  team2,
  gameId,
  eventName,
  marketName,
  gameType,
  gameName = 'Cricket Game',
  sid,
  maxAmount,
  minAmount,
  fancyScore,
}) {
  const dispatch = useDispatch();
  const { loading, pendingBetAmounts, pendingBet, cashoutPL } = useSelector(
    (state) => state.bet
  );
  const { userInfo } = useSelector((state) => state.auth);

  const DEFAULT_GAME_STAKES = [
    { label: '1k', value: 1000 },
    { label: '2k', value: 2000 },
    { label: '5k', value: 5000 },
    { label: '10k', value: 10000 },
    { label: '20k', value: 20000 },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '75k', value: 75000 },
    { label: '1L', value: 100000 },
    { label: '2L', value: 200000 },
  ];

  const quickStakes = (() => {
    const saved = userInfo?.quickStakes;
    if (!saved?.length) return DEFAULT_GAME_STAKES;
    return DEFAULT_GAME_STAKES.map((def, i) => {
      const item = saved[i];
      if (!item) return { ...def };
      if (typeof item === 'object' && item.label && item.value) return item;
      if (typeof item === 'number' && item > 0)
        return { label: def.label, value: item };
      return { ...def };
    });
  })();

  const [stake, setStake] = useState('');
  const [odds, setOdds] = useState(selectedBet?.odds || '');
  const [betFor, setBetFor] = useState(selectedBet?.team || '');
  const [betType, setBetType] = useState(selectedBet?.type || ''); // 'back' or 'lay'
  const [showEditButtons, setShowEditButtons] = useState(false);
  const currentBetKey = selectedBet
    ? `${selectedBet.team}-${selectedBet.odds}-${selectedBet.sid}-${selectedBet.type}`
    : '';
  const [syncedBetKey, setSyncedBetKey] = useState(currentBetKey);
  const autoCloseTimerRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  const loadingRef = React.useRef(loading);
  const editModalOpenRef = React.useRef(false);

  // Sync local slip fields when a different bet selection is clicked (React render-phase pattern)
  if (selectedBet && currentBetKey !== syncedBetKey) {
    setSyncedBetKey(currentBetKey);
    setBetFor(selectedBet.team || '');
    setOdds(selectedBet.odds || '');
    setBetType(selectedBet.type || '');
    setStake('');
  }

  useEffect(() => {
    editModalOpenRef.current = showEditButtons;
  }, [showEditButtons]);

  // Update ref when onClose changes
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Keep loading ref in sync so timeout callback can check if bet is still placing
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Toast messages are now handled in the parent component (CricketBet/FootballBet/TennisBet)
  // to prevent duplicate toasts from multiple PlaceBet component instances

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // Auto-close after 5 seconds of inactivity
  useEffect(() => {
    // Only set up auto-close if selectedBet exists
    if (selectedBet) {
      // Clear any existing timer first
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }

      // Set new timer to close after 5 seconds (pause while placing or editing buttons)
      autoCloseTimerRef.current = setTimeout(() => {
        if (
          !loadingRef.current &&
          !editModalOpenRef.current &&
          onCloseRef.current
        ) {
          onCloseRef.current();
        }
        autoCloseTimerRef.current = null;
      }, 5000);

      // Cleanup timer on unmount or when selectedBet changes
      return () => {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
      };
    } else {
      // Clear timer if selectedBet is null
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    }
  }, [selectedBet]); // Removed onClose from dependencies

  // Reset auto-close timer on any user interaction
  const resetAutoCloseTimer = React.useCallback(() => {
    if (selectedBet) {
      // Clear existing timer
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      // Set new timer only if onClose is available
      if (onCloseRef.current) {
        autoCloseTimerRef.current = setTimeout(() => {
          if (
            !loadingRef.current &&
            !editModalOpenRef.current &&
            onCloseRef.current
          ) {
            onCloseRef.current();
          }
          autoCloseTimerRef.current = null;
        }, 5000);
      }
    }
  }, [selectedBet]); // Removed onClose from dependencies

  const isBhavGtype =
    String(selectedBet?.gType || '').toLowerCase() === 'match1';

  const isBookmakerStyleMarket = () =>
    gameType === 'Bookmaker' ||
    gameType === 'Bookmaker IPL CUP' ||
    marketName === 'Bookmaker' ||
    isBhavGtype;

  const isMatchOddsStyleMarket = () =>
    !isBhavGtype &&
    (gameType === 'Match Odds' ||
      gameType === 'Winner' ||
      gameType === 'Tied Match' ||
      gameType === 'OVER_UNDER_05' ||
      gameType === 'OVER_UNDER_15' ||
      gameType === 'OVER_UNDER_25' ||
      gameType === 'OVER_UNDER_35' ||
      gameType === 'fancy1' ||
      marketName === 'MATCH_ODDS' ||
      marketName === 'TOURNAMENT_WINNER');

  const usesProjectedNetOutcome = () =>
    isMatchOddsStyleMarket() || isBookmakerStyleMarket();

  const normalizeMarketKey = (value) => {
    const norm = String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (norm === 'match_odds' || norm === 'match odds') return 'match odds';
    if (norm === 'tied_match' || norm === 'tied match') return 'tied match';
    return norm;
  };

  const matchesMarketGameType = (item) => {
    const gameTypeToMatch = gameType || marketName || '';
    const marketNameToMatch = marketName || gameType || '';
    if (
      (gameType === 'Match Odds' ||
        gameType === 'Winner' ||
        gameType === 'Bookmaker' ||
        gameType === 'Bookmaker IPL CUP' ||
        isBhavGtype) &&
      marketName &&
      item.marketName &&
      normalizeMarketKey(item.marketName) !== normalizeMarketKey(marketName)
    ) {
      return false;
    }
    return (
      item.gameType === gameTypeToMatch ||
      item.gameType === marketNameToMatch ||
      (isBookmakerStyleMarket() &&
        (item.gameType === 'Bookmaker' ||
          item.gameType === 'Bookmaker IPL CUP')) ||
      (isMatchOddsStyleMarket() &&
        (item.gameType === 'Match Odds' ||
          item.gameType === 'Winner' ||
          item.gameType === 'MATCH_ODDS' ||
          item.gameType === 'TOURNAMENT_WINNER' ||
          item.gameType === 'Tied Match' ||
          item.gameType === 'OVER_UNDER_05' ||
          item.gameType === 'OVER_UNDER_15' ||
          item.gameType === 'OVER_UNDER_25' ||
          item.gameType === 'OVER_UNDER_35' ||
          item.gameType === 'fancy1'))
    );
  };

  const getMarketCashoutPL = () => {
    if (isBookmakerStyleMarket()) {
      return (
        cashoutPL?.[marketName || 'Bookmaker'] || cashoutPL?.['Bookmaker'] || 0
      );
    }
    const key =
      gameType === 'MATCH_ODDS' || marketName === 'MATCH_ODDS'
        ? 'Match Odds'
        : gameType || marketName;
    return cashoutPL?.[key] || 0;
  };

  const getMarketBets = () => {
    const historyBets =
      Array.isArray(pendingBet) && gameId
        ? pendingBet
            .filter(
              (b) =>
                String(b.gameId) === String(gameId) && matchesMarketGameType(b)
            )
            .map((b) => ({
              teamName: b.teamName,
              otype: b.otype,
              totalBetAmount: b.betAmount,
              totalPrice: b.price,
            }))
        : [];

    if (historyBets.length > 0) return historyBets;

    return (
      pendingBetAmounts?.filter((item) => matchesMarketGameType(item)) || []
    );
  };

  const computeNetOutcome = (team, marketBets, mCashoutPL = 0) => {
    let netOutcome = 0;
    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase() === team?.toLowerCase();
      const betAmt = parseFloat(bet.totalBetAmount) || 0;
      const stakeLiability = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        netOutcome += isBetOnThisTeam ? betAmt : -stakeLiability;
      } else {
        netOutcome += isBetOnThisTeam ? -stakeLiability : betAmt;
      }
    });
    return Math.round((netOutcome + mCashoutPL) * 100) / 100;
  };

  const buildPendingBetLeg = (team, type, stakeValue, oddsValue) => {
    const stakeNum = parseFloat(stakeValue);
    const oddsNum = parseFloat(oddsValue);
    if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum <= 0 || !team || !type) {
      return null;
    }
    const isLay = type === 'lay';
    if (isBookmakerStyleMarket()) {
      return {
        teamName: team,
        otype: type,
        totalBetAmount: isLay ? stakeNum : stakeNum * (oddsNum / 100),
        totalPrice: isLay ? stakeNum * (oddsNum / 100) : stakeNum,
      };
    }
    return {
      teamName: team,
      otype: type,
      totalBetAmount: isLay ? stakeNum : stakeNum * (oddsNum - 1),
      totalPrice: isLay ? stakeNum * (oddsNum - 1) : stakeNum,
    };
  };

  const getProjectedNetOutcome = (team) => {
    const pendingLeg = buildPendingBetLeg(betFor, betType, stake, odds);
    if (!pendingLeg) return null;
    return computeNetOutcome(
      team,
      [...getMarketBets(), pendingLeg],
      getMarketCashoutPL()
    );
  };

  // Get bet details from pending bets (same logic as components)
  const getBetDetails = (team) => {
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

    const netOutcome =
      marketBets.length > 0
        ? computeNetOutcome(team, marketBets, getMarketCashoutPL())
        : null;

    return {
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
      netOutcome,
      hasMarketBets: marketBets.length > 0,
    };
  };

  // Calculate suggestion based on game type (same logic as components)
  // Don't show suggestions for these bet types - only show values after placing bet from API
  const calculateSuggestion = (
    team,
    selectedTeam,
    selectedType,
    stake,
    odds
  ) => {
    // Don't show suggestions for these bet types
    // fancy1 uses Match-Odds math, so it falls through to the match-odds branch below.
    const noSuggestionMarkets = ['khado', 'Normal', 'meter', 'oddeven'];
    if (noSuggestionMarkets.includes(gameType)) {
      return null;
    }

    if (!stake || !odds || !selectedBet) return null;

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum === 0) return null;

    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(team);
    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet =
      (otype && totalBetAmount) || (totalPrice && teamName && isMatchedTeam);

    // Determine calculation method based on game type
    // Bhav markets (Bookmaker, Bookmaker IPL CUP, match1 Tied Match): stake * (odds / 100)
    // Fancy session markets (Normal, meter, line, ball, khado): stake * (size / 100)
    // Decimal markets (Match Odds, Winner, OverUnder, Fancy1, OddEven, decimal Tied Match): stake * (odds - 1)
    const isFancySession = [
      'Normal',
      'meter',
      'line',
      'ball',
      'khado',
    ].includes(gameType);
    const isBookmaker = isBookmakerStyleMarket();
    const isKhado = gameType === 'khado';
    const usesFancyCalculation = isBookmaker || isFancySession;
    const effectiveFancyRate =
      isFancySession && parseFloat(selectedBet?.size) > 0
        ? parseFloat(selectedBet.size)
        : oddsNum;

    if (!existingBet) {
      // No existing bet - calculate based on game type
      let profit;
      if (usesFancyCalculation) {
        if (isKhado) {
          profit = stakeNum * (effectiveFancyRate / 100);
        } else if (isBookmaker) {
          const p = stakeNum;
          const x = oddsNum;
          const b = selectedType === 'lay' ? p : p * (x / 100);
          const pCalc = selectedType === 'lay' ? p * (x / 100) : p;

          if (selectedType === 'back') {
            profit = b;
            return {
              value: Math.abs(profit),
              color: profit >= 0 ? 'green' : 'red',
            };
          } else {
            profit = -pCalc;
            return { value: Math.abs(profit), color: 'red' };
          }
        } else {
          // Normal, meter, line, ball use size bhav rate (default 100)
          profit =
            selectedType === 'back'
              ? stakeNum * (effectiveFancyRate / 100)
              : stakeNum * (1 - effectiveFancyRate / 100);
        }
      } else {
        // Match Odds, Winner, OverUnder, TiedMatch (decimal), Fancy1, OddEven: profit = stake * (odds - 1)
        profit =
          selectedType === 'back'
            ? stakeNum * (oddsNum - 1)
            : stakeNum * (1 - oddsNum);
      }
      return { value: Math.abs(profit), color: profit >= 0 ? 'green' : 'red' };
    }

    // Complex calculation with existing bet
    const totalBetAmt = parseFloat(totalBetAmount || 0);
    const totalPrc = parseFloat(totalPrice || 0);

    // Calculate new bet values based on game type
    let p, x, b;
    if (usesFancyCalculation) {
      if (isKhado) {
        // Khado only has back
        p = stakeNum;
        x = oddsNum;
        b = p * (x / 100);
      } else if (isBookmaker) {
        // Bookmaker calculation: b = otype === 'lay' ? p : p * (x / 100)
        // p = otype === 'lay' ? p * (x / 100) : p
        p = stakeNum;
        x = oddsNum;
        b = selectedType === 'lay' ? p : p * (x / 100);
        p = selectedType === 'lay' ? p * (x / 100) : p;
      } else {
        // Normal, Meter
        p = stakeNum;
        x = oddsNum;
        b = selectedType === 'back' ? p * (x / 100) : p * (1 - x / 100);
        p = selectedType === 'lay' ? p * (1 - x / 100) : p;
      }
    } else {
      // Match Odds, OverUnder, TiedMatch, Fancy1, OddEven
      p = stakeNum;
      x = oddsNum;
      b = selectedType === 'lay' ? p : p * (x - 1);
      p = selectedType === 'lay' ? p * (x - 1) : p;
    }

    // For Bookmaker, use the specific logic from the provided component
    if (isBookmaker && existingBet) {
      if (selectedTeam?.toLowerCase() === teamName?.toLowerCase()) {
        if (selectedType === otype) {
          // Same team, same type - merge
          b = b + totalBetAmt;
          p = p + totalPrc;
          const calValue = selectedType === 'back' ? b : p;
          return {
            value: Math.abs(calValue),
            color: selectedType === 'back' && calValue >= 0 ? 'green' : 'red',
          };
        } else {
          // Same team, opposite type - offset
          if (selectedType === 'back') {
            if (totalBetAmt > p) {
              p = totalPrc - b;
              return { value: Math.abs(p), color: 'red' };
            } else {
              b = b - totalPrc;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            }
          } else if (selectedType === 'lay') {
            if (totalPrc >= b) {
              b = totalBetAmt - p;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            } else {
              p = p - totalBetAmt;
              return { value: Math.abs(p), color: 'red' };
            }
          }
        }
      } else {
        // Different team
        if (selectedType === otype) {
          if (selectedType === 'back') {
            if (totalPrc >= b) {
              p = totalPrc - b;
              return { value: Math.abs(p), color: 'red' };
            } else {
              b = b - totalPrc;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            }
          } else if (selectedType === 'lay') {
            if (totalPrc >= b) {
              b = totalBetAmt - p;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            } else {
              p = p - totalBetAmt;
              return { value: Math.abs(p), color: 'red' };
            }
          }
        } else {
          // Different team, different type - add
          b = b + totalBetAmt;
          p = p + totalPrc;
          const calValue = selectedType === 'back' ? b : p;
          return {
            value: Math.abs(calValue),
            color: selectedType === 'back' && calValue >= 0 ? 'green' : 'red',
          };
        }
      }
    }

    // For other game types, use the original logic
    if (selectedTeam?.toLowerCase() === teamName?.toLowerCase()) {
      if (selectedType === otype) {
        // Same team, same type - merge
        b = b + totalBetAmt;
        p = p + totalPrc;
        const calValue = selectedType === 'back' ? b : p;
        return {
          value: Math.abs(calValue),
          color: calValue >= 0 ? 'green' : 'red',
        };
      } else {
        // Same team, opposite type - offset
        if (selectedType === 'back') {
          if (totalBetAmt > p) {
            p = totalPrc - b;
            return { value: Math.abs(p), color: 'red' };
          } else {
            b = b - totalPrc;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          }
        } else {
          if (totalPrc >= b) {
            b = totalBetAmt - p;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          } else {
            p = p - totalBetAmt;
            return { value: Math.abs(p), color: 'red' };
          }
        }
      }
    } else {
      // Different team
      if (selectedType === otype) {
        if (selectedType === 'back') {
          if (totalPrc >= b) {
            p = totalPrc - b;
            return { value: Math.abs(p), color: 'red' };
          } else {
            b = b - totalPrc;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          }
        } else {
          if (totalPrc >= b) {
            b = totalBetAmt - p;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          } else {
            p = p - totalBetAmt;
            return { value: Math.abs(p), color: 'red' };
          }
        }
      } else {
        // Different team, different type - add
        b = b + totalBetAmt;
        p = p + totalPrc;
        const calValue = selectedType === 'back' ? b : p;
        return {
          value: Math.abs(calValue),
          color: calValue >= 0 ? 'green' : 'red',
        };
      }
    }
  };

  // Calculate profit for display (always show green/profit value)
  const calculateProfit = () => {
    if (!stake || !odds) return '0';

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || isNaN(oddsNum)) return '0';

    // Always show the green/profit value
    // For BACK: profit if selected team wins
    // For LAY: profit if selected team loses (stake)
    if (betType === 'back') {
      if (usesProjectedNetOutcome()) {
        const projected = getProjectedNetOutcome(betFor);
        if (projected !== null && projected > 0) {
          return projected.toFixed(2);
        }
      }
      // BACK: get green value from selected team suggestion
      const suggestion = calculateSuggestion(
        betFor,
        betFor,
        betType,
        stake,
        odds
      );
      if (suggestion && suggestion.color === 'green') {
        return suggestion.value.toFixed(2);
      }
      // Fallback: calculate profit if selected team wins
      const isFancySession = [
        'Normal',
        'meter',
        'line',
        'ball',
        'khado',
      ].includes(gameType);
      const isBhav = isBookmakerStyleMarket();
      const effectiveFancyRate =
        isFancySession && parseFloat(selectedBet?.size) > 0
          ? parseFloat(selectedBet.size)
          : oddsNum;

      let profitValue;
      if (isBhav) {
        profitValue = stakeNum * (oddsNum / 100);
      } else if (isFancySession) {
        profitValue = stakeNum * (effectiveFancyRate / 100);
      } else {
        // Match Odds, Winner, OverUnder, Fancy1, OddEven, decimal Tied Match
        profitValue = stakeNum * (oddsNum - 1);
      }
      return profitValue.toFixed(2);
    } else {
      // LAY: green value is the stake (profit if selected team loses)
      return stakeNum.toFixed(2);
    }
  };

  const profit = calculateProfit();

  // Get all teams from selectedBet, fallback to team1/team2 if not available
  const allTeams =
    selectedBet?.teams && selectedBet.teams.length > 0
      ? selectedBet.teams
      : team1 && team2
        ? [team1, team2]
        : [];

  const isOddEvenMarket =
    gameType === 'oddeven' || selectedBet?.gameType === 'oddeven';

  // Format number with commas
  const formatNumber = (num) => {
    if (!num || num === '0') return '0';
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleStakeChange = (value) => {
    setStake(value);
    resetAutoCloseTimer(); // Reset timer on interaction
    // Update selectedBet with stake for suggestion calculations
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, stake: value });
    }
  };

  const handleQuickStake = (amount) => {
    const currentStake = parseFloat(stake) || 0;
    const newStake = (currentStake + amount).toString();
    setStake(newStake);
    resetAutoCloseTimer(); // Reset timer on interaction
    // Update selectedBet with stake for suggestion calculations
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, stake: newStake });
    }
  };

  const handleClearStake = () => {
    setStake('');
    resetAutoCloseTimer(); // Reset timer on interaction
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, stake: '' });
    }
  };

  const handleOddsChange = (value) => {
    setOdds(value);
    resetAutoCloseTimer(); // Reset timer on interaction
    if (selectedBet) {
      setSyncedBetKey(
        `${selectedBet.team}-${value}-${selectedBet.sid}-${selectedBet.type}`
      );
      if (onBetChange) {
        onBetChange({ ...selectedBet, odds: value, stake });
      }
    }
  };

  const isHorseRacingBet =
    Number(sid) === 10 ||
    Number(sid) === 65 ||
    String(gameName || '').toLowerCase() === 'horse racing';
  const isFancySessionMarket = [
    'Normal',
    'meter',
    'line',
    'ball',
    'khado',
  ].includes(gameType);
  const canStepOdds =
    !isHorseRacingBet &&
    !isBookmakerStyleMarket() &&
    (gameType === 'khado' ||
      (!isFancySessionMarket &&
        gameType !== 'oddeven' &&
        gameType !== 'fancy1'));

  // D247 Betfair odds tick ladder (pA in reference chunk)
  const getBetfairTickStep = (rate) => {
    if (rate < 2) return 0.01;
    if (rate < 3) return 0.02;
    if (rate < 4) return 0.05;
    if (rate < 6) return 0.1;
    if (rate < 10) return 0.2;
    if (rate < 20) return 0.5;
    if (rate < 30) return 1;
    if (rate < 50) return 2;
    if (rate < 100) return 5;
    if (rate < 1000) return 10;
    return 0;
  };

  const oddsStep =
    gameType === 'khado'
      ? 1
      : getBetfairTickStep(parseFloat(odds) || 0) || 0.01;

  const handleOddsIncrement = () => {
    if (!canStepOdds) return;
    const currentOdds = parseFloat(odds) || 0;
    if (gameType === 'khado') {
      const baseOdds = parseFloat(selectedBet?.odds) || currentOdds;
      const maxAllowed = baseOdds + 100;
      const minAllowed = baseOdds - 100;
      if (currentOdds > minAllowed && currentOdds < maxAllowed) {
        handleOddsChange(String(Math.round(currentOdds + 1)));
      }
      return;
    }
    if (currentOdds >= 10000) {
      handleOddsChange('10000');
      return;
    }
    const step = getBetfairTickStep(currentOdds);
    if (!step) return;
    const next = Number((currentOdds + step).toFixed(2));
    handleOddsChange(String(next));
  };

  const handleOddsDecrement = () => {
    if (!canStepOdds) return;
    const currentOdds = parseFloat(odds) || 0;
    if (gameType === 'khado') {
      const baseOdds = parseFloat(selectedBet?.odds) || currentOdds;
      const maxAllowed = baseOdds + 100;
      const minAllowed = baseOdds - 100;
      if (currentOdds > minAllowed && currentOdds < maxAllowed) {
        const next = Math.round(currentOdds - 1);
        handleOddsChange(String(next < 2 ? 1 : next));
      }
      return;
    }
    if (currentOdds <= 1.01) {
      handleOddsChange('1.01');
      return;
    }
    const step = getBetfairTickStep(currentOdds);
    if (!step) return;
    const next = Number(Math.max(1.01, currentOdds - step).toFixed(2));
    handleOddsChange(String(next));
  };

  const handleReset = () => {
    setStake('');
    setOdds(selectedBet?.odds || '');
    setBetFor(selectedBet?.team || '');
    resetAutoCloseTimer(); // Reset timer on interaction
  };

  const handleSubmit = async () => {
    if (!stake || !odds || !betFor) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);

    if (isNaN(stakeNum) || isNaN(oddsNum)) {
      toast.error('Please enter valid stake and odds');
      return;
    }

    // Validate min/max amounts
    const minLimit = Number(minAmount);
    const maxLimit = Number(maxAmount);
    if (Number.isFinite(minLimit) && minLimit > 0 && stakeNum < minLimit) {
      toast.error(`Minimum bet amount is ${minLimit}`);
      return;
    }

    if (Number.isFinite(maxLimit) && maxLimit > 0 && stakeNum > maxLimit) {
      toast.error(`Maximum bet amount is ${maxLimit}`);
      return;
    }

    // Determine if this is a fancy bet (Normal, meter, line, ball, khado).
    // fancy1 and oddeven use Match Odds math and route through the sports
    // placeBet endpoint, not the fancy one.
    const fancyBetTypes = ['Normal', 'meter', 'line', 'ball', 'khado'];
    const isFancyBet = fancyBetTypes.includes(gameType);

    // For all fancy bets (Normal, Meter, line, ball, Khado):
    // fancyScore = original odds value (rate), xValue = size value, price = stake
    let finalFancyScore = fancyScore || null;
    let finalXValue = oddsNum.toString();

    const fancyBetTypesWithSize = ['Normal', 'meter', 'line', 'ball', 'khado'];
    if (
      fancyBetTypesWithSize.includes(gameType) &&
      selectedBet?.size !== undefined &&
      selectedBet?.size !== null
    ) {
      // For fancy bets: fancyScore is the original odds value (rate) from selectedBet, xValue is the size value
      finalFancyScore = parseFloat(selectedBet.odds || oddsNum); // The original odds value (e.g., 15)
      finalXValue = selectedBet.size.toString(); // The size value (e.g., 120)
    }

    const formData = {
      gameId: gameId,
      sid: sid,
      otype: betType,
      oname: selectedBet?.oname || '',
      tno: selectedBet?.tno,
      gType: selectedBet?.gType || '',
      price: stakeNum,
      xValue: finalXValue,
      gameType: gameType,
      marketName: marketName || gameType,
      eventName: eventName,
      gameName: gameName,
      teamName: betFor,
      fancyScore: finalFancyScore,
      ...(selectedBet?.khadoLayOdds != null
        ? { khadoLayOdds: selectedBet.khadoLayOdds }
        : {}),
    };

    try {
      const action = isFancyBet
        ? await dispatch(createfancyBet(formData))
        : await dispatch(createBet(formData));

      if (action?.error) {
        return;
      }

      // Close right away only after confirmed acceptance; keep open on error so user can adjust stake/odds.
      setStake('');
      if (onClose) {
        onClose();
      }

      dispatch(getUser());
      if (gameId) {
        dispatch(getPendingBetAmo(gameId));
        dispatch(
          getBetHistory({
            gameid: gameId,
            page: 1,
            limit: 10,
            selectedVoid: 'unsettel',
          })
        );
      }
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  const handleEdit = () => {
    setShowEditButtons(true);
    resetAutoCloseTimer();
  };

  if (!selectedBet) {
    return null;
  }

  const slipDisplayName =
    gameType === 'Normal' && selectedBet?.size
      ? `${betFor} - ${selectedBet.size}`
      : gameType === 'khado' && selectedBet?.khadoLayOdds
        ? `${betFor} - ${selectedBet.khadoLayOdds}`
        : betFor;

  const isBlueSlip = isOddEvenMarket || betType === 'back';

  return (
    <div className='bg-white'>
      {/* Header */}
      <div
        className={`${isMobile ? 'bg-primary px-2 py-1.5' : 'bg-secondary p-1'} flex items-center justify-between text-[15px] font-bold text-white`}
      >
        <span>Place Bet</span>
        {isMobile && onClose && (
          <button
            type='button'
            onClick={onClose}
            aria-label='Close bet slip'
            className='cursor-pointer text-[20px] font-normal text-white hover:text-gray-200'
            style={{ lineHeight: '1' }}
          >
            ×
          </button>
        )}
      </div>

      {/* Desktop 4-column Header */}
      {!isMobile && (
        <div className='grid grid-cols-4 bg-[#cccccc] text-[12px] font-bold text-black'>
          <div className='p-2'>(Bet for)</div>
          <div className='p-2'>Odds</div>
          <div className='p-2'>Stake</div>
          <div className='p-2'>Profit</div>
        </div>
      )}

      <div
        className={`${isBlueSlip ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'} ${
          isMobile ? 'place-bet-modal p-2.5 text-black' : ''
        }`}
      >
        {isMobile ? (
          /* Mobile D247 .place-bet-modal layout */
          <>
            <div className='flex items-center justify-between gap-2 text-[13px]'>
              <b className='min-w-0 break-words'>{slipDisplayName}</b>
              <span className='shrink-0 text-[12px] font-bold'>
                Profit: {profit}
              </span>
            </div>

            <div className='odd-stake-box mt-1.5 bg-[#ffffff45] p-1.5'>
              <div className='grid grid-cols-2 gap-2 text-center text-[12px] font-bold'>
                <div>Odds</div>
                <div>Amount</div>
              </div>
              <div className='mt-1 grid grid-cols-2 items-center gap-2'>
                <div className='flex items-center'>
                  {isHorseRacingBet ? (
                    <input
                      type='text'
                      value={odds}
                      readOnly
                      disabled
                      className='stakeinput h-[28px] w-full border border-[#666] bg-white px-1 text-center text-[13px] font-bold text-black'
                    />
                  ) : (
                    <>
                      <button
                        type='button'
                        onClick={handleOddsDecrement}
                        disabled={!canStepOdds}
                        aria-label='Decrease odds'
                        className={`stakeactionminus bg-secondary text-secondary flex h-[28px] w-[28px] shrink-0 items-center justify-center text-sm font-bold ${
                          canStepOdds
                            ? 'cursor-pointer hover:opacity-90'
                            : 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        −
                      </button>
                      <input
                        type='number'
                        value={odds}
                        readOnly={!canStepOdds}
                        onChange={(e) =>
                          canStepOdds && handleOddsChange(e.target.value)
                        }
                        step={oddsStep}
                        min='0.01'
                        className='stakeinput h-[28px] min-w-0 flex-1 border-y border-[#666] bg-white px-1 text-center text-[13px] font-bold text-black'
                      />
                      <button
                        type='button'
                        onClick={handleOddsIncrement}
                        disabled={!canStepOdds}
                        aria-label='Increase odds'
                        className={`stakeactionplus bg-secondary text-secondary flex h-[28px] w-[28px] shrink-0 items-center justify-center text-sm font-bold ${
                          canStepOdds
                            ? 'cursor-pointer hover:opacity-90'
                            : 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <input
                    type='number'
                    value={stake}
                    onChange={(e) => handleStakeChange(e.target.value)}
                    placeholder='0'
                    min='0'
                    className='stakeinput h-[28px] w-full border border-[#666] bg-white px-2 text-center text-[13px] font-bold text-black'
                  />
                </div>
              </div>
            </div>

            <div className='place-bet-buttons mt-1.5 grid grid-cols-4 gap-1'>
              {quickStakes.map((item, i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => handleQuickStake(item.value)}
                  className='btn-place-bet bg-secondary text-secondary cursor-pointer py-1.5 text-center text-[12px] font-bold whitespace-nowrap hover:opacity-90'
                >
                  +{item.label}
                </button>
              ))}
            </div>

            <div className='place-bet-btn-box mt-1.5 grid grid-cols-4 gap-1'>
              <button
                type='button'
                onClick={handleClearStake}
                className='btn cursor-pointer py-1.5 text-[12px] font-bold text-[#212529] underline'
              >
                Clear
              </button>
              <button
                type='button'
                onClick={handleEdit}
                className='btn cursor-pointer border border-[#097c93] bg-[#097c93] py-1.5 text-[12px] font-bold text-white hover:bg-[#086a82]'
              >
                Edit
              </button>
              <button
                type='button'
                onClick={handleReset}
                className='btn cursor-pointer border border-[#bd1828] bg-[#bd1828] py-1.5 text-[12px] font-bold text-white hover:bg-[#c82333]'
              >
                Reset
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                disabled={loading || !stake || Number(stake) <= 0}
                className='btn cursor-pointer border border-[#198754] bg-[#198754] py-1.5 text-[12px] font-bold text-white hover:bg-[#157347] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {loading ? 'Placing...' : 'Place Bet'}
              </button>
            </div>

            {!isMatchOddsStyleMarket() && (minAmount > 0 || maxAmount > 0) && (
              <div className='mt-1.5 text-[11px] font-semibold text-[#212529]'>
                Range: {minAmount || 0} to {maxAmount || 0}
              </div>
            )}
          </>
        ) : (
          /* Desktop D247 .place-bet-box layout */
          <>
            {/* Table Data Row */}
            <div className='grid grid-cols-4 items-center text-[12px] text-black'>
              <div className='p-2 text-[12px] font-semibold break-words text-[#000000]'>
                {slipDisplayName}
              </div>
              <div className='flex items-center gap-0.5 p-2'>
                <input
                  type='number'
                  value={odds}
                  readOnly={!canStepOdds}
                  onChange={(e) =>
                    canStepOdds && handleOddsChange(e.target.value)
                  }
                  step={oddsStep}
                  min='0.01'
                  className='h-[25px] w-full border border-gray-400 bg-white px-1 py-0.5 text-center text-[12px] font-bold text-black'
                />
                {canStepOdds && (
                  <div className='flex flex-col'>
                    <button
                      type='button'
                      onClick={handleOddsIncrement}
                      className='bg-secondary text-secondary cursor-pointer text-[10px] leading-none hover:opacity-90'
                      style={{
                        width: '16px',
                        height: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type='button'
                      onClick={handleOddsDecrement}
                      className='bg-secondary text-secondary cursor-pointer text-[10px] leading-none hover:opacity-90'
                      style={{
                        width: '16px',
                        height: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
              <div className='p-2'>
                <input
                  type='number'
                  value={stake}
                  onChange={(e) => handleStakeChange(e.target.value)}
                  placeholder='0'
                  min='0'
                  className='h-[25px] w-full border border-gray-400 bg-white px-1 py-0.5 text-center text-[12px] font-bold text-black'
                />
              </div>
              <div className='p-2 font-bold'>{profit}</div>
            </div>

            {/* Quick Stake Buttons (D247 5-column layout, zero clipping) */}
            <div className='px-2 pt-1 pb-1'>
              <div className='grid grid-cols-5 gap-1'>
                {quickStakes.map((item, i) => (
                  <button
                    key={i}
                    type='button'
                    onClick={() => handleQuickStake(item.value)}
                    className='cursor-pointer border border-[#a5a5a5] bg-[#d4d4d4] px-1 py-1.5 text-center text-[12px] font-bold whitespace-nowrap text-[#000000] hover:bg-[#bfbfbf]'
                  >
                    +{item.label}
                  </button>
                ))}
              </div>
              <div className='mt-1 flex items-center justify-between text-[11px] text-[#212529]'>
                <span>
                  {(minAmount > 0 || maxAmount > 0) &&
                    `Min: ${minAmount || 0} | Max: ${maxAmount || '-'}`}
                </span>
                <button
                  type='button'
                  onClick={handleClearStake}
                  className='cursor-pointer font-semibold text-[#212529] underline'
                >
                  clear
                </button>
              </div>
            </div>

            {/* Action Buttons (D247 layout: Edit left, Reset + Submit right) */}
            <div className='flex items-center justify-between gap-2 p-2'>
              <button
                type='button'
                onClick={handleEdit}
                className='cursor-pointer border border-[#097c93] bg-[#097c93] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#086a82]'
              >
                Edit
              </button>
              <div className='flex gap-1.5'>
                <button
                  type='button'
                  onClick={handleReset}
                  className='cursor-pointer border border-[#bd1828] bg-[#bd1828] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#c82333]'
                >
                  Reset
                </button>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={loading || !stake || Number(stake) <= 0}
                  className='cursor-pointer border border-[#198754] bg-[#198754] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#157347] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {loading ? 'Placing...' : 'Submit'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Bet Summary Footer - Mobile Only */}
        {isMobile &&
          allTeams.length > 0 &&
          !isHorseRacingBet &&
          !isOddEvenMarket && (
            <div className='odds-count mt-1.5 bg-[#ffffff45] p-2'>
              {allTeams.map((team, index) => {
                // Don't show suggestions for these bet types - only show after placing bet from API
                const noSuggestionMarkets = [
                  'khado',
                  'Normal',
                  'meter',
                  'oddeven',
                ];
                const shouldHideSuggestions =
                  noSuggestionMarkets.includes(gameType);

                // Check for existing bet
                const {
                  otype,
                  totalBetAmount,
                  totalPrice,
                  teamName,
                  netOutcome,
                  hasMarketBets,
                } = getBetDetails(team);
                const isMatchedTeam =
                  teamName?.toLowerCase() === team?.toLowerCase();
                const existingBet =
                  hasMarketBets ||
                  (otype && totalBetAmount) ||
                  (totalPrice && teamName && isMatchedTeam);
                const useProjectedPL = usesProjectedNetOutcome();

                // For these bet types, only show existing bet values, no suggestions
                if (shouldHideSuggestions) {
                  return (
                    <div
                      key={index}
                      className='mb-1 flex items-center justify-between'
                    >
                      <span className='text-[12px] text-black'>{team}</span>
                      {existingBet && (
                        <span
                          className={`text-[12px] font-semibold ${
                            otype === 'lay'
                              ? isMatchedTeam
                                ? 'text-[#dc3545]'
                                : 'text-[#28a745]'
                              : otype === 'back'
                                ? isMatchedTeam
                                  ? 'text-[#28a745]'
                                  : 'text-[#dc3545]'
                                : 'text-[#28a745]'
                          }`}
                        >
                          {(() => {
                            if (otype === 'lay') {
                              return isMatchedTeam
                                ? formatNumber(totalPrice)
                                : formatNumber(totalBetAmount);
                            } else if (otype === 'back') {
                              return isMatchedTeam
                                ? formatNumber(totalBetAmount)
                                : formatNumber(totalPrice);
                            }
                            return '';
                          })()}
                        </span>
                      )}
                    </div>
                  );
                }

                const singleItemMarkets = [
                  'fancy1',
                  'khado',
                  'Normal',
                  'meter',
                  'oddeven',
                ];
                const isSingleItemMarket = singleItemMarkets.includes(gameType);
                const isSelectedTeam =
                  team?.toLowerCase() === betFor?.toLowerCase();
                const shouldShowSuggestion = isSingleItemMarket
                  ? isSelectedTeam
                  : true;

                let suggestionValue = null;
                let suggestionColor = 'green';
                let currentDisplayValue = null;
                let currentDisplayColor = 'green';

                if (useProjectedPL && hasMarketBets && netOutcome !== null) {
                  currentDisplayValue = netOutcome;
                  currentDisplayColor = netOutcome >= 0 ? 'green' : 'red';
                }

                if (stake && selectedBet && shouldShowSuggestion) {
                  if (useProjectedPL) {
                    const projectedNet = getProjectedNetOutcome(team);
                    if (projectedNet !== null) {
                      suggestionValue = projectedNet;
                      suggestionColor = projectedNet >= 0 ? 'green' : 'red';
                    }
                  } else if (isSelectedTeam) {
                    const suggestion = calculateSuggestion(
                      team,
                      betFor,
                      betType,
                      stake,
                      odds
                    );
                    if (suggestion) {
                      if (isBookmakerStyleMarket() && betType === 'lay') {
                        suggestionValue = -suggestion.value;
                        suggestionColor = 'red';
                      } else {
                        suggestionValue = suggestion.value;
                        suggestionColor = suggestion.color;
                      }
                    }
                  } else if (!isSingleItemMarket) {
                    const stakeNum = parseFloat(stake);
                    if (!isNaN(stakeNum) && stakeNum > 0) {
                      if (betType === 'back') {
                        suggestionValue = stakeNum;
                        suggestionColor = 'red';
                      } else {
                        suggestionValue = stakeNum;
                        suggestionColor = 'green';
                      }
                    }
                  }
                }

                return (
                  <div
                    key={index}
                    className='mb-1 flex items-center justify-between'
                  >
                    <span className='text-[12px] text-black'>{team}</span>
                    {(stake || existingBet) && (
                      <div className='flex items-center gap-1'>
                        {existingBet && (
                          <span
                            className={`text-[12px] font-semibold ${
                              currentDisplayValue !== null
                                ? currentDisplayColor === 'green'
                                  ? 'text-[#28a745]'
                                  : 'text-[#dc3545]'
                                : otype === 'lay'
                                  ? isMatchedTeam
                                    ? 'text-[#dc3545]'
                                    : 'text-[#28a745]'
                                  : otype === 'back'
                                    ? isMatchedTeam
                                      ? 'text-[#28a745]'
                                      : 'text-[#dc3545]'
                                    : 'text-[#28a745]'
                            }`}
                          >
                            {currentDisplayValue !== null
                              ? `${currentDisplayValue < 0 ? '-' : ''}${formatNumber(Math.abs(currentDisplayValue))}`
                              : (() => {
                                  if (otype === 'lay') {
                                    return isMatchedTeam
                                      ? formatNumber(totalPrice)
                                      : formatNumber(totalBetAmount);
                                  }
                                  if (otype === 'back') {
                                    return isMatchedTeam
                                      ? formatNumber(totalBetAmount)
                                      : formatNumber(totalPrice);
                                  }
                                  return '';
                                })()}
                          </span>
                        )}
                        {suggestionValue !== null && (
                          <span
                            className={`text-[12px] font-semibold ${
                              suggestionColor === 'green'
                                ? 'text-[#28a745]'
                                : 'text-[#dc3545]'
                            }`}
                          >
                            {existingBet || currentDisplayValue !== null
                              ? `(${suggestionValue < 0 ? '-' : ''}${formatNumber(Math.abs(suggestionValue))})`
                              : `${suggestionValue < 0 ? '-' : ''}${formatNumber(Math.abs(suggestionValue))}`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
      {showEditButtons && (
        <ButtonValues
          initialTab='game'
          onClose={() => setShowEditButtons(false)}
        />
      )}
    </div>
  );
}

export default PlaceBet;
