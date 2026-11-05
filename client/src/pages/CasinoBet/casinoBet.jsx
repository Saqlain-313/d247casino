
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

import GameMarketTable from '../../components/tables/GameMarketTable';
import { CasinoUiProvider } from '../../context/CasinoContext';

// =============================================
// NORMALIZE CASINO API RESPONSE
// Handles:
// { message, data: { mid, sub } }
// { data: { message, data: { mid, sub } } }
// { mid, sub }
// =============================================

const normalizeCasinoData = (payload) => {
  let current = payload;

  for (let i = 0; i < 4; i++) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    // Actual provider game data found
    if (
      current.mid !== undefined &&
      current.mid !== null &&
      Array.isArray(current.sub)
    ) {
      return current;
    }

    // Extract nested response
    if (
      current.data &&
      typeof current.data === 'object'
    ) {
      current = current.data;
      continue;
    }

    return null;
  }

  return null;
};

export default function CasinoBet() {
  const dispatch = useDispatch();

  // =============================================
  // URL PARAMETERS
  // =============================================

  const { gameid, match, eventName } = useParams() || {};

  // =============================================
  // STATES
  // =============================================

  const [bettingData, setBettingData] = useState(null);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );

  // =============================================
  // REFS
  // =============================================

  const previousMidRef = useRef(null);

  const hasInitializedRef = useRef(false);

  // =============================================
  // REDUX
  // =============================================

  const {
    battingData,
    loader,
    error,
  } = useSelector((state) => state.casino);

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  // =============================================
  // CUSTOM HOOKS
  // =============================================

  const betting = useBetting({
    gameid,
    bettingData,
  });

  const results = useCasinoResults({ gameid });

  // =============================================
  // WEBSOCKET DATA NORMALIZER
  // =============================================

  const handleBettingDataUpdate = useCallback((payload) => {
    console.log('WEBSOCKET RAW DATA:', payload);

    const actualData = normalizeCasinoData(payload);

    if (!actualData) {
      console.warn(
        'WebSocket casino data could not be normalized:',
        payload
      );
      return;
    }

    console.log('WEBSOCKET NORMALIZED DATA:', actualData);

    setBettingData(actualData);
  }, []);

  // =============================================
  // VIDEO EVENT NAME
  // =============================================

  const casinoEventName =
    eventName ||
    bettingData?.eventName ||
    bettingData?.eventname ||
    bettingData?.event_name ||
    bettingData?.gtype ||
    gameid;

  // =============================================
  // WEBSOCKET
  // =============================================

  const { isConnected } = useCasinoWebSocket({
    gameid,
    userId: userInfo?._id,
    bettingDataMid: bettingData?.mid,
    onBettingDataUpdate: handleBettingDataUpdate,
  });

  const winnerMap = getWinnerMap(gameid);

  // =============================================
  // RESPONSIVE
  // =============================================

  useEffect(() => {
    const query = window.matchMedia(
      '(min-width: 1024px)'
    );

    const onChange = (e) => {
      setIsDesktop(e.matches);
    };

    query.addEventListener('change', onChange);

    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  // =============================================
  // FETCH BETTING DATA
  // =============================================

  useEffect(() => {
    if (!gameid) return;

    console.log('FETCH CASINO GAME:', gameid);

    previousMidRef.current = null;

    hasInitializedRef.current = false;

    setBettingData(null);

    dispatch(clearCasinoResultData());

    dispatch(clearCasinoBettingData());

    dispatch(clearPendingBetAmounts());

    dispatch(fetchCasinoBatingData(gameid));

    dispatch(getPendingBet());

  }, [gameid, dispatch]);

  // =============================================
  // SYNC REDUX DATA
  // MAIN FIX
  // =============================================

  useEffect(() => {
    if (!battingData) return;

    console.log(
      'REDUX RAW CASINO RESPONSE:',
      battingData
    );

    const actualData = normalizeCasinoData(battingData);

    if (!actualData) {
      console.warn(
        'Casino Redux data normalization failed:',
        battingData
      );
      return;
    }

    console.log(
      'REDUX NORMALIZED CASINO DATA:',
      actualData
    );

    console.log('REDUX MID:', actualData.mid);

    console.log('REDUX MARKETS:', actualData.sub);

    setBettingData(actualData);

  }, [battingData]);

  // =============================================
  // RESET BETTING WHEN MARKET SUSPENDED
  // =============================================

  useEffect(() => {
    if (
      !betting.betControl?.sid ||
      !Array.isArray(bettingData?.sub)
    ) {
      return;
    }

    // Do not invalidate a slip belonging to another MID.
    if (
      String(betting.betControl.roundId) !==
      String(bettingData.mid)
    ) {
      return;
    }

    const selectedSub = bettingData.sub.find(
      (item) =>
        String(item.sid ?? item.i) ===
        String(betting.betControl.sid)
    );

    if (
      !selectedSub ||
      String(selectedSub.gstatus || '').toUpperCase() !==
        'ACTIVE'
    ) {
      betting.resetBettingState();
    }

  }, [
    bettingData?.sub,
    bettingData?.mid,
    betting.betControl?.sid,
    betting.betControl?.roundId,
    betting.resetBettingState,
  ]);

  // =============================================
  // ROUND MANAGEMENT
  // =============================================

  useEffect(() => {
    if (!bettingData?.mid || !gameid) return;

    const currentMid = String(bettingData.mid);

    const previousMid = previousMidRef.current;

    if (
      hasInitializedRef.current &&
      previousMid !== currentMid
    ) {
      console.log(
        'Provider MID changed:',
        previousMid,
        '=>',
        currentMid
      );

      // Preserve the existing bet slip's captured MID.
      dispatch(clearPendingBetAmounts());

      const timer = setTimeout(() => {
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

      previousMidRef.current = currentMid;

      return () => clearTimeout(timer);

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
  ]);

  // =============================================
  // FETCH USER
  // =============================================

  useEffect(() => {
    if (gameid) {
      dispatch(getUser());
    }
  }, [gameid, dispatch]);

  // =============================================
  // FALLBACK POLLING
  // =============================================

  useEffect(() => {
    if (!gameid || isConnected) return;

    const pollInterval = setInterval(() => {
      dispatch(fetchCasinoBatingData(gameid));
    }, 5000);

    return () => clearInterval(pollInterval);

  }, [
    gameid,
    dispatch,
    isConnected,
  ]);

  // =============================================
  // PROVIDER BETTING DATA
  // =============================================

  const mockBettingData = bettingData
    ? {
        ...bettingData,

        gtype: bettingData.gtype || gameid,

        mid: bettingData.mid
          ? String(bettingData.mid)
          : '',

        sub: Array.isArray(bettingData.sub)
          ? bettingData.sub
          : [],
      }
    : {
        gtype: gameid,
        mid: '',
        sub: [],
      };

  // =============================================
  // MARKET DEBUG
  // =============================================

  console.log('CASINO BET PAGE:', {
    game: gameid,
    mid: mockBettingData.mid,
    gtype: mockBettingData.gtype,
    marketCount: mockBettingData.sub.length,
  });

  // =============================================
  // GROUP AND FILTER
  // =============================================

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

  // Keep this variable available if used by your UI.
  void displayData;

  // =============================================
  // RENDER
  // =============================================

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

            {mockBettingData.mid && (
              <span>
                Round ID: {mockBettingData.mid}
              </span>
            )}
          </div>

          {/* Casino Video Stream */}
          <VideoStream
            eventName={casinoEventName}
            bettingData={mockBettingData}
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
          {mockBettingData.remark && (
            <div className="bg-white px-2 py-1 text-[12px] font-semibold text-[#097c93]">
              {mockBettingData.remark}
            </div>
          )}

          {/* Mobile My Bets */}
          {!isDesktop && (
            <div>
              <div className="bg-secondary text-secondary p-1">
                <span className="font-bold">
                  My Bet
                </span>
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
                <span className="font-bold">
                  My Bet
                </span>
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
          mid={mockBettingData.mid}
          gameId={gameid}
          item={results.selectedItem}
          onClose={() => results.setSelectedItem(null)}
          showSideBets={true}
        />
      )}

    </>
  );
}
