import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getUser } from '../../redux/reducer/authReducer';

import {
  clearPendingBetAmounts,
  getBetHistory,
  getPendingBet,
  getPendingBetAmo,
} from '../../redux/reducer/betReducer';

import {
  clearCasinoBettingData,
  clearCasinoResultData,
  fetchCasinoBatingData,
} from '../../redux/reducer/casinoSlice';

import MatchedBet from '../gamedetails/MatchedBet';
import ResultPopup from './components/CasinoResult1';
import RecentResults from './components/RecentResults';
import Spinner2 from './components/Spinner2';
import VideoStream from './components/VideoStream';

import DesktopBetSlip from '../../components/betting/DesktopBetSlip';
import NewMobileBetDrawer from '../../components/betting/MobileBetDrawer';

import useBetting from './hooks/useBetting';
import useCasinoResults from './hooks/useCasinoResults';
import useCasinoWebSocket from './hooks/useCasinoWebSocket';

import { TWO_PLAYER_GAMES, getWinnerMap } from './constants';

import {
  filterPlayersForTwoPlayerGames,
  groupBettingData,
} from './utils/bettingUtils';

import { createMockCasinoMarkets } from './utils/mockCasinoMarkets';

import GameMarketTable from '../../components/tables/GameMarketTable';
import { CasinoUiProvider } from '../../context/CasinoContext';

export default function CasinoBet() {
  const dispatch = useDispatch();

  // URL parameters
  const { gameid, match, eventName } = useParams() || {};

  // States
  const [bettingData, setBettingData] = useState(null);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );

  // Refs
  const previousMidRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Redux
  const { battingData, loader, error } = useSelector(
    (state) => state.casino
  );

  const { userInfo } = useSelector((state) => state.auth);

  // Custom hooks
  const betting = useBetting({ gameid, bettingData });

  const results = useCasinoResults({ gameid });

  // Resolve actual event name for video stream
  const casinoEventName =
    eventName ||
    bettingData?.eventName ||
    bettingData?.eventname ||
    bettingData?.event_name ||
    bettingData?.gtype ||
    gameid;

  // WebSocket
  const { isConnected } = useCasinoWebSocket({
    gameid,
    userId: userInfo?._id,
    bettingDataMid: bettingData?.mid,
    onBettingDataUpdate: setBettingData,
  });

  const winnerMap = getWinnerMap(gameid);

  // Responsive
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');

    const onChange = (e) => setIsDesktop(e.matches);

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  // Fetch betting data
  useEffect(() => {
    if (!gameid) return;

    previousMidRef.current = null;
    hasInitializedRef.current = false;

    dispatch(clearCasinoResultData());
    dispatch(clearCasinoBettingData());
    dispatch(clearPendingBetAmounts());

    dispatch(fetchCasinoBatingData(gameid));
    dispatch(getPendingBet());
  }, [gameid, dispatch]);

  // Sync Redux data
  useEffect(() => {
    setBettingData(battingData?.data);
  }, [battingData]);

  // Reset betting when suspended
  useEffect(() => {
    if (!betting.betControl?.sid || !bettingData?.sub) return;

    const selectedSub = bettingData.sub.find(
      (s) => s.sid === betting.betControl.sid
    );

    if (selectedSub?.gstatus === 'SUSPENDED') {
      betting.resetBettingState();
    }
  }, [
    bettingData?.sub,
    betting.betControl?.sid,
    betting.resetBettingState,
  ]);

  // Round management
  useEffect(() => {
    if (!bettingData?.mid || !gameid) return;

    const currentMid = bettingData.mid;
    const previousMid = previousMidRef.current;

    if (
      hasInitializedRef.current &&
      previousMid !== currentMid
    ) {
      console.log('🔄 Round changed, clearing pending bets');

      betting.resetAllBettingState();

      dispatch(clearPendingBetAmounts());

      setTimeout(() => {
        dispatch(getUser());

        dispatch(
          getPendingBetAmo({
            gameId: gameid,
            roundId: currentMid,
          })
        );

        dispatch(
          getBetHistory({
            gameid,
            page: 1,
            limit: 10,
            selectedVoid: 'unsettel',
          })
        );
      }, 100);
    } else if (!hasInitializedRef.current) {
      dispatch(
        getPendingBetAmo({
          gameId: gameid,
          roundId: currentMid,
        })
      );
    }

    previousMidRef.current = currentMid;
    hasInitializedRef.current = true;
  }, [
    bettingData?.mid,
    gameid,
    dispatch,
    betting.resetAllBettingState,
  ]);

  // Fetch user
  useEffect(() => {
    if (gameid) {
      dispatch(getUser());
    }
  }, [gameid, dispatch]);

  // Fallback polling
  useEffect(() => {
    if (!gameid || isConnected) return;

    const pollInterval = setInterval(() => {
      dispatch(fetchCasinoBatingData(gameid));
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [gameid, dispatch, isConnected]);

  // Mock betting data
  const mockBettingData = {
    ...(bettingData || {}),
    gtype: bettingData?.gtype || gameid,
    mid: bettingData?.mid || 'MOCK-ROUND-001',
    sub: createMockCasinoMarkets(gameid),
  };

  // Group and filter
  const groupedData = groupBettingData(
    mockBettingData.sub,
    gameid
  );

  const displayData = filterPlayersForTwoPlayerGames(
    groupedData,
    gameid,
    mockBettingData.sub,
    TWO_PLAYER_GAMES
  );

  return (
    <>
      {/* Bet Loader */}
      {betting.loader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <Spinner2 />
        </div>
      )}

      <div className="mt-0.5 flex gap-px">

        {/* Left Section */}
        <div className="ml-0 w-full min-w-0 md:ml-1 lg:w-[calc(100%-352px)]">

          {/* Header */}
          <div className="bg-secondary text-secondary flex items-center justify-between gap-2 p-1 text-[12px] font-bold lg:text-[15px]">
            <span className="truncate uppercase">
              {match || gameid}
            </span>

            {bettingData?.mid && (
              <span>Round ID: {bettingData.mid}</span>
            )}
          </div>

          {/* Casino Video Stream */}
          <VideoStream
            eventName={casinoEventName}
            bettingData={bettingData}
            showWinner={results.showWinner}
            winnerLabel={
              winnerMap[results.resultData?.res?.[0]?.win]
            }
          />

          {/* API Error */}
          {!bettingData && !loader.betting && error.betting && (
            <div className="bg-white p-6 text-center text-[14px] font-semibold text-[#b3001b]">
              {error.betting}
            </div>
          )}

          {/* Betting Markets */}
          <CasinoUiProvider
            gameid={gameid}
            bettingData={mockBettingData}
            betting={betting}
            isMobile={!isDesktop}
          >
            <GameMarketTable />
          </CasinoUiProvider>

          {/* Remark */}
          {bettingData?.remark && (
            <div className="bg-white px-2 py-1 text-[12px] font-semibold text-[#097c93]">
              {bettingData.remark}
            </div>
          )}

          {/* Mobile My Bets */}
          {!isDesktop && (
            <div>
              <div className="bg-secondary text-secondary p-1">
                <span className="font-bold">My Bet</span>
              </div>

              <MatchedBet gameid={gameid} />
            </div>
          )}

          {/* Recent Results */}
          <RecentResults
            gameid={gameid}
            currentGameId={results.currentGameId}
            results={results.resultData?.res}
            onItemClick={results.setSelectedItem}
          />
        </div>

        {/* Desktop Sidebar */}
        {isDesktop && (
          <div className="sticky top-0 h-fit">
            <div className="w-[350px]">

              <CasinoUiProvider
                gameid={gameid}
                bettingData={mockBettingData}
                betting={betting}
                isMobile={false}
              >
                <DesktopBetSlip />
              </CasinoUiProvider>

              <div className="bg-secondary text-secondary p-1">
                <span className="font-bold">My Bet</span>
              </div>

              <MatchedBet gameid={gameid} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bet Drawer */}
      {!isDesktop && (
        <CasinoUiProvider
          gameid={gameid}
          bettingData={mockBettingData}
          betting={betting}
          isMobile={true}
        >
          <NewMobileBetDrawer />
        </CasinoUiProvider>
      )}

      {/* Result Popup */}
      {results.selectedItem && (
        <ResultPopup
          mid={bettingData?.mid}
          gameId={gameid}
          item={results.selectedItem}
          onClose={() => results.setSelectedItem(null)}
          showSideBets={true}
        />
      )}
    </>
  );
}