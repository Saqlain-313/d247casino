import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useIsMobile } from '../../../hooks/useIsMobile';
import {
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../../redux/reducer/betReducer';

export function parseMatchTeams(matchTitle = '') {
  const teams = String(matchTitle).split(/\s+(?:v|vs|-)\s+/i);
  return {
    team1: teams[0] || 'Team 1',
    team2: teams[1] || 'Team 2',
  };
}

/**
 * Shared lifecycle hook for sport detail pages (Cricket, Football, Tennis):
 * - Pending bet fetching & post-bet toast/refresh cycle
 * - Selected bet state & mobile/desktop tab state
 * - Dead-event redirect guard when market fetch fails or has no live markets
 */
export function useSportBettingLifecycle({
  gameId,
  bettingData,
  battingData,
  listLoaded,
  storeMatch,
  marketFetchFailed,
  bettingLoaded,
  redirectOnNoMarket = true,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile(1024);

  const { loading, successMessage, errorMessage, pendingBetAmounts } =
    useSelector((state) => state.bet);

  const [mobileShowOdds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);

  // Desktop always shows odds panel; mobile respects user tab toggle
  const showodds = !isMobile || mobileShowOdds;

  // Fetch pending bets for current event
  useEffect(() => {
    if (!gameId) return;
    dispatch(getPendingBetAmo(gameId));
    dispatch(getPendingBet(gameId));
  }, [dispatch, gameId]);

  // Toast feedback + refresh pending bets after bet submission
  useEffect(() => {
    let timerId;
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      timerId = setTimeout(() => setSelectedBet(null), 0);
      if (gameId) {
        dispatch(getPendingBetAmo(gameId));
        dispatch(getPendingBet(gameId));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    return () => clearTimeout(timerId);
  }, [successMessage, errorMessage, dispatch, gameId]);

  // Dead event redirect guard
  const hasLiveMarkets =
    (Array.isArray(bettingData) && bettingData.length > 0) ||
    (Array.isArray(battingData) && battingData.length > 0);

  useEffect(() => {
    if (!redirectOnNoMarket) return;
    if (
      marketFetchFailed ||
      (bettingLoaded && !hasLiveMarkets && listLoaded && !storeMatch)
    ) {
      navigate('/', {
        replace: true,
        state: {
          noMarketMessage: 'There are no market available in this game',
        },
      });
    }
  }, [
    redirectOnNoMarket,
    marketFetchFailed,
    bettingLoaded,
    hasLiveMarkets,
    listLoaded,
    storeMatch,
    navigate,
  ]);

  return {
    loading,
    pendingBetAmounts,
    showodds,
    setshowodds,
    selectedBet,
    setSelectedBet,
    handleBetSelect: (betData) => setSelectedBet(betData),
    handleBetChange: (updatedBet) => setSelectedBet(updatedBet),
    showLive,
    setShowLive,
    showlivetv,
    setshowlivetv,
  };
}

export default useSportBettingLifecycle;
