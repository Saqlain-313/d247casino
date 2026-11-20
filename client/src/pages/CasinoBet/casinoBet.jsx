import {
  lazy,
  Suspense,
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
  getPendingBet,
  getPendingBetAmo,
} from '../../redux/reducer/betReducer';

import {
  clearDirectCasinoResult,
  getDirectCasinoResultByDate,
  getMyCasinoBets,
} from '../../redux/reducer/casinoBetSlice';
import RouletteStatistics, {
  ROULETTE_STAT_SLUGS,
} from './components/RouletteStatistics';
import SidebarRulesTable from '../../components/rules/SidebarRulesTable';
import VirtualGameScreen, {
  VIRTUAL_SLUGS,
} from './components/VirtualGameScreen';

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
import RulesPopup from './components/RulesPopup';

const MatkaTable = lazy(() => import('../../components/tables/MatkaTable'));
const MatkaCalendar = lazy(
  () => import('../../components/tables/MatkaCalendar')
);

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
// =============================================

const normalizeCasinoData = (payload) => {
  let current = payload;

  for (let i = 0; i < 4; i++) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    if (
      current.mid !== undefined &&
      current.mid !== null &&
      Array.isArray(current.sub)
    ) {
      return current;
    }

    if (current.data && typeof current.data === 'object') {
      current = current.data;
      continue;
    }

    return null;
  }

  return null;
};

const CONTAINER_CLASS_MAP = {
  goal2: 'ball-by-ball goal goal2',
  goal: 'ball-by-ball goal',
  lucky15: 'ball-by-ball',
  ballbyball: 'ball-by-ball',
  worli3: 'worli matka',
  worli: 'worli',
  worli2: 'worli',
  dolidana: 'doli-dana',
  mogambo: 'teenpatti2cards mogambo',
  patti2: 'teenpatti2cards',
  lucky5: 'lucky7a lucky5',
  lucky7: 'lucky7a',
  lucky7eu: 'lucky7a',
  lucky7eu2: 'lucky7a',
  plucky7: 'lucky7a',
  vlucky7: 'lucky7a vcasino',
  roulette11: 'roulette roulette11',
  roulette12: 'roulette roulette11',
  roulette13: 'roulette roulette11 roulette13',
  ourroullete: 'roulette',
  poison: 'teenpatti-joker',
  poison20: 'teenpatti-joker',
  joker20: 'teenpatti-joker',
  joker1: 'teenpatti-joker1',
  joker120: 'teenpatti-joker1',
  teenunique: 'unique-teen20',
  teen20: 'teenpatti20',
  teen20b: 'teenpatti20',
  teen20c: 'teenpatti20',
  pteen20: 'teenpatti20',
  vteen20: 'teenpatti20 vcasino',
  btable: 'bollywood',
  btable2: 'bollywood',
  vbtable: 'bollywood vcasino',
  superover: 'super-over',
  superover3: 'super-over',
  superover2: 'super-over super-over2',
  ab20: 'ab',
  abj: 'ab2',
  ab3: 'ab ab3',
  ab4: 'ab ab3',
  teen41: 'teenpatti2',
  teen42: 'teenpatti2',
  teen6: 'teenpatti2',
  sicbo: 'sicbo',
  sicbo2: 'sicbo',
  teen: 'teenpatti1day',
  teen32: 'teenpatti1day',
  teen33: 'teenpatti1day',
  pteen: 'teenpatti1day',
  vteen: 'teenpatti1day vcasino',
  teen9: 'teenpattitest',
  teen8: 'teenpattiopen',
  teenmuf: 'teenpattimuflis',
  vteenmuf: 'teenpattimuflis vcasino',
  teensin: 'baccarat29',
  teen1: 'onecard1day',
  teen120: 'onecard20',
  cmeter1: 'one-card-meter',
  teen3: '',
  poker: 'poker1day',
  poker20: 'poker20',
  poker6: 'poker6player',
  baccarat: 'baccarat',
  baccarat2: 'baccarat baccarat2',
  pbaccarat: 'baccarat',
  dt20: 'dt20',
  dt202: 'dt20',
  pdt20: 'dt20',
  dt6: 'dt1day',
  pdt6: 'dt1day',
  vdt6: 'dt1day vcasino',
  dtl20: 'dtl20',
  vdtl20: 'dtl20 vcasino',
  card32: 'cards32a',
  pcard32: 'cards32a',
  card32eu: 'cards32b',
  '3cardj': 'threecardj',
  aaa: 'aaa',
  aaa2: 'aaa',
  vaaa: 'aaa vcasino',
  lottcard: 'lottery',
  cricketv3: 'five-cricket',
  cmatch20: 'cricket20',
  queen: 'queen',
  race2: 'queen',
  race20: 'race20',
  race17: 'raceto17',
  trap: 'trap',
  trio: 'trio',
  vtrio: 'trio vcasino',
  notenum: 'note-number',
  dum10: 'duskadum',
  kbc: 'kbc',
  cmeter: 'cmeter',
  war: 'war',
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
  const [showRules, setShowRules] = useState(false);

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

  const { battingData, loader, error } = useSelector((state) => state.casino);

  const { userInfo } = useSelector((state) => state.auth);

  // Direct casino result state
  const {
    directCasinoResult,
    directCasinoResultLoading,
    directCasinoResultError,
    myBets = [],
  } = useSelector((state) => state.casinoBet);

  const isWorliGame = ['worli', 'worli2', 'worli3'].includes(gameid);
  const isMatkaBazaar = gameid === 'worli3';
  const containerCls = CONTAINER_CLASS_MAP[gameid] || 'game-market';
  const [activeWorliMid, setActiveWorliMid] = useState(null);
  const [calendarBazaar, setCalendarBazaar] = useState(null);
  const [mobileMatkaTab, setMobileMatkaTab] = useState('game');

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
      console.warn('WebSocket casino data could not be normalized:', payload);
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
    const query = window.matchMedia('(min-width: 1024px)');

    const onChange = (e) => {
      setIsDesktop(e.matches);
    };

    query.addEventListener('change', onChange);

    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  // =============================================
  // FETCH BETTING DATA + INITIAL MY BETS
  // =============================================

  useEffect(() => {
    if (!gameid) return;

    console.log('FETCH CASINO GAME:', gameid);
    console.log('MY BET EVENT:', eventName);
    console.log('MY BET SLUG:', gameid);

    previousMidRef.current = null;
    hasInitializedRef.current = false;

    setBettingData(null);

    dispatch(clearCasinoResultData());
    dispatch(clearCasinoBettingData());
    dispatch(clearPendingBetAmounts());
    dispatch(clearDirectCasinoResult());

    dispatch(fetchCasinoBatingData(gameid));

    dispatch(getPendingBet());

    // Fetch My Bets using slug (works on both /casino/:gameid and /casino/:match/:gameid)
    dispatch(
      getMyCasinoBets({
        slug: gameid,
        eventName: eventName || gameid,
      })
    );
  }, [gameid, eventName, dispatch]);

  // =============================================
  // FETCH DIRECT CASINO RESULT BY DATE
  // GET /casino/direct-result-by-date
  // =============================================

  useEffect(() => {
    if (!casinoEventName) return;

    // Build today's date in the browser's local timezone.
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    dispatch(
      getDirectCasinoResultByDate({
        date,
        eventName: casinoEventName,
      })
    );
  }, [casinoEventName, dispatch]);

  // =============================================
  // SYNC REDUX DATA
  // =============================================

  useEffect(() => {
    if (!battingData) return;

    console.log('REDUX RAW CASINO RESPONSE:', battingData);

    const actualData = normalizeCasinoData(battingData);

    if (!actualData) {
      console.warn('Casino Redux data normalization failed:', battingData);
      return;
    }

    console.log('REDUX NORMALIZED CASINO DATA:', actualData);

    console.log('REDUX MID:', actualData.mid);
    console.log('REDUX MARKETS:', actualData.sub);

    setBettingData(actualData);
  }, [battingData]);

  // =============================================
  // RESET BETTING WHEN MARKET SUSPENDED
  // =============================================

  useEffect(() => {
    if (!betting.betControl?.sid || !Array.isArray(bettingData?.sub)) {
      return;
    }

    if (String(betting.betControl.roundId) !== String(bettingData.mid)) {
      return;
    }

    const selectedSub = bettingData.sub.find(
      (item) => String(item.sid ?? item.i) === String(betting.betControl.sid)
    );

    if (!selectedSub) {
      return;
    }

    const selectedStatus = String(
      selectedSub.gstatus ?? selectedSub.status ?? ''
    )
      .trim()
      .toUpperCase();

    if (selectedStatus && !['OPEN', 'ACTIVE'].includes(selectedStatus)) {
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

    if (hasInitializedRef.current && previousMid !== currentMid) {
      console.log('Provider MID changed:', previousMid, '=>', currentMid);

      // Clear stale bet slip from previous round (skip multi-bazaar worli3)
      if (
        !isMatkaBazaar &&
        betting.betControl &&
        String(betting.betControl.roundId) !== currentMid
      ) {
        betting.resetBettingState();
      }
      dispatch(clearPendingBetAmounts());

      const timer = setTimeout(() => {
        dispatch(getUser());

        dispatch(
          getPendingBetAmo({
            gameId: gameid,
            roundId: currentMid,
          })
        );

        // Refresh My Bets on round change (all routes)
        dispatch(
          getMyCasinoBets({
            slug: gameid,
            eventName: eventName || gameid,
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
  }, [bettingData?.mid, gameid, eventName, dispatch]);

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
  }, [gameid, dispatch, isConnected]);

  // =============================================
  // PROVIDER BETTING DATA
  // =============================================

  const mockBettingData = bettingData
    ? {
        ...bettingData,

        gtype: bettingData.gtype || gameid,

        mid: bettingData.mid ? String(bettingData.mid) : '',

        sub: Array.isArray(bettingData.sub) ? bettingData.sub : [],
      }
    : {
        gtype: gameid,
        mid: '',
        sub: [],
      };

  // Roulette Statistics & Goal/Goal2 scorer beads: refetch dated results on round change
  useEffect(() => {
    const needsDatedRefresh =
      ROULETTE_STAT_SLUGS.has(gameid) ||
      gameid === 'goal' ||
      gameid === 'goal2';
    if (!needsDatedRefresh || !mockBettingData.mid) return;
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    dispatch(
      getDirectCasinoResultByDate({
        date,
        eventName: casinoEventName,
        silent: true,
      })
    );
  }, [mockBettingData.mid, gameid, casinoEventName, dispatch]);

  // =============================================
  // MARKET DEBUG
  // =============================================

  console.log('CASINO BET PAGE:', {
    game: gameid,
    eventName,
    mid: mockBettingData.mid,
    gtype: mockBettingData.gtype,
    marketCount: mockBettingData.sub.length,
  });

  // =============================================
  // GROUP AND FILTER
  // =============================================

  const groupedData = groupBettingData(mockBettingData.sub, gameid);

  const displayData = filterPlayersForTwoPlayerGames(
    groupedData,
    gameid,
    mockBettingData.sub,
    TWO_PLAYER_GAMES
  );

  void displayData;

  // =============================================
  // RENDER
  // =============================================

  // For worli3 multi-bazaar, default to the first OPEN bazaar and scope active mid/sub to it
  const resolvedWorliMid = isMatkaBazaar
    ? String(
        activeWorliMid ||
          (mockBettingData.rounds || []).find((r) => r.mtype === 'OPEN')?.mid ||
          mockBettingData.rounds?.[0]?.mid ||
          mockBettingData.mid ||
          ''
      )
    : mockBettingData.mid;

  const effectiveBettingData =
    isMatkaBazaar &&
    resolvedWorliMid &&
    mockBettingData.subs?.[resolvedWorliMid]
      ? {
          ...mockBettingData,
          mid: resolvedWorliMid,
          mname:
            mockBettingData.subs[resolvedWorliMid].mname ||
            mockBettingData.mname,
          mtype:
            mockBettingData.subs[resolvedWorliMid].mtype ||
            mockBettingData.mtype,
          sub:
            mockBettingData.subs[resolvedWorliMid].sub || mockBettingData.sub,
        }
      : mockBettingData;

  return (
    <>
      {/* Bet Loader */}
      {betting.loader && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <Spinner2 />
        </div>
      )}

      <CasinoUiProvider
        gameid={gameid}
        bettingData={effectiveBettingData}
        betting={betting}
        isMobile={!isDesktop}
      >
        <div className='center-main-container casino-page'>
          <div className='center-container'>
            <div className={`casino-page-container ${containerCls}`}>
              {/* Header */}
              <div className='casino-header'>
                <span className='casino-name'>
                  {isMatkaBazaar ? 'Matka Market' : match || gameid}
                  <a
                    className='ms-1 cursor-pointer underline'
                    onClick={() => setShowRules(true)}
                  >
                    <small>Rules</small>
                  </a>
                </span>
                {mockBettingData.mid && (
                  <span className='casino-rid hidden xl:inline-block'>
                    <small>
                      Round ID: <span>{mockBettingData.mid}</span>
                    </small>
                  </span>
                )}
              </div>

              {/* Top Bazaar rounds tabs (sirf worli3 Matka Market me) */}
              {isMatkaBazaar && (mockBettingData?.rounds || []).length > 0 && (
                <div className='matka-tabs'>
                  <ul className='nav nav-pills'>
                    {(mockBettingData?.rounds || []).map((r) => (
                      <li className='nav-item' key={String(r.mid)}>
                        <a
                          className={`nav-link ${
                            String(r.mid) === String(resolvedWorliMid)
                              ? 'active'
                              : ''
                          }`}
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveWorliMid(String(r.mid));
                          }}
                        >
                          <span>{r.mname}</span>
                          <div className='remaining-time'>
                            <img
                              src='https://cdn.926assets.com/g1ver/v111/static/front/img/clock.png'
                              alt='Clock Icon'
                            />
                            <span>{r.ptime || '00:00:00'}</span>
                          </div>
                          <div className='game-time'>
                            <span>{r.mtime}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mobile Tab Header (Game / Placed Bet (0)) for Worli/Matka */}
              {isWorliGame && !isDesktop && (
                <div className='casino-title-header-mobile d-xl-none'>
                  <ul className='nav nav-tabs menu-tabs'>
                    <li className='nav-item'>
                      <div
                        className={`nav-link ${mobileMatkaTab === 'game' ? 'active' : ''}`}
                        onClick={() => setMobileMatkaTab('game')}
                      >
                        Game
                      </div>
                    </li>
                    <li className='nav-item'>
                      <div
                        className={`nav-link ${mobileMatkaTab === 'bets' ? 'active' : ''}`}
                        onClick={() => setMobileMatkaTab('bets')}
                      >
                        Placed Bet ({myBets?.length || 0})
                      </div>
                    </li>
                  </ul>
                  <div className='pe-2'></div>
                </div>
              )}

              {/* Main Video & Detail Area */}
              {isWorliGame && !isDesktop && mobileMatkaTab === 'bets' ? (
                <div className='p-2'>
                  <MatchedBet eventName={eventName} slug={gameid} />
                </div>
              ) : (
                <div className=''>
                  {VIRTUAL_SLUGS.has(gameid) ? (
                    <VirtualGameScreen
                      slug={gameid}
                      bettingData={mockBettingData}
                      showWinner={results.showWinner}
                      winnerLabel={winnerMap[results.resultData?.res?.[0]?.win]}
                      latestResultMid={results.resultData?.res?.[0]?.mid}
                    />
                  ) : (
                    <VideoStream
                      eventName={casinoEventName}
                      bettingData={mockBettingData}
                      showWinner={results.showWinner}
                      winnerLabel={winnerMap[results.resultData?.res?.[0]?.win]}
                      latestResultMid={results.resultData?.res?.[0]?.mid}
                    />
                  )}

                  {/* API Error */}
                  {!bettingData && !loader.betting && error.betting && (
                    <div className='bg-white p-6 text-center text-[14px] font-semibold text-[#b3001b]'>
                      {error.betting}
                    </div>
                  )}

                  <div className='casino-detail'>
                    {isWorliGame ? (
                      <Suspense fallback={null}>
                        <MatkaTable
                          isMobile={!isDesktop}
                          isSuspended={betting.isSuspended}
                          activeMid={resolvedWorliMid}
                        />
                      </Suspense>
                    ) : (mockBettingData.sub || []).length > 0 ? (
                      <GameMarketTable />
                    ) : (
                      !bettingData &&
                      !loader.betting && (
                        <div className='bg-white p-4 text-center text-[13px] font-semibold text-[#b3001b]'>
                          There are no market available in this game
                        </div>
                      )
                    )}

                    {/* Remark */}
                    {mockBettingData.remark && (
                      <div className='bg-white px-2 py-1 text-[12px] font-semibold text-[#097c93]'>
                        {mockBettingData.remark}
                      </div>
                    )}

                    {/* Mobile My Bets */}
                    {!isDesktop && !isWorliGame && (
                      <div>
                        <div className='bg-secondary text-secondary p-1'>
                          <span className='font-bold'>My Bet</span>
                        </div>
                        <MatchedBet eventName={eventName} slug={gameid} />
                      </div>
                    )}

                    {/* Recent Results / Matka Last Results */}
                    {isMatkaBazaar ? (
                      <>
                        <div className='casino-last-result-title'>
                          <span>Last Result</span>
                          <span>
                            <a href={`/casino-results/${gameid}`}>View All</a>
                          </span>
                        </div>
                        <div className='casino-last-results matka-result'>
                          {(results.resultData?.res || []).map((r, i) => (
                            <span
                              className='result result-b'
                              style={{ cursor: 'pointer' }}
                              key={r.mid || i}
                              onClick={() =>
                                setCalendarBazaar(String(r.win || ''))
                              }
                            >
                              {r.win}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <RecentResults
                        gameid={gameid}
                        currentGameId={results.currentGameId}
                        results={results.resultData?.res || []}
                        directResults={directCasinoResult?.data || []}
                        resultDate={directCasinoResult?.date}
                        directResultsLoading={directCasinoResultLoading}
                        directResultsError={directCasinoResultError}
                        onItemClick={results.setSelectedItem}
                      />
                    )}

                    {/* Sidebar Rules payout tables (mobile) */}
                    {!isDesktop && !isWorliGame && (
                      <SidebarRulesTable slug={gameid} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Sidebar */}
          {isDesktop && (
            <div className='sidebar right-sidebar casino-right-sidebar'>
              {ROULETTE_STAT_SLUGS.has(gameid) && (
                <RouletteStatistics rows={directCasinoResult?.data || []} />
              )}

              <DesktopBetSlip />

              <div className='sidebar-box my-bet-container'>
                <div className='sidebar-title'>
                  <h4>My Bet</h4>
                </div>
                <div className='my-bets'>
                  <MatchedBet eventName={eventName} slug={gameid} />
                </div>
              </div>

              {!isWorliGame && <SidebarRulesTable slug={gameid} />}
            </div>
          )}
        </div>

        {/* Mobile Bet Drawer */}
        {!isDesktop && <NewMobileBetDrawer />}
      </CasinoUiProvider>

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

      {/* Rules modal (header se trigger) */}
      {showRules && (
        <RulesPopup
          eventName={casinoEventName}
          onClose={() => setShowRules(false)}
        />
      )}

      {/* Worli3 Matka Calendar modal — exact D247 @2953052 (opens from Last Result bazaar chip) */}
      {calendarBazaar && (
        <Suspense fallback={null}>
          <MatkaCalendar
            slug={gameid}
            bazaarName={calendarBazaar}
            onClose={() => setCalendarBazaar(null)}
          />
        </Suspense>
      )}
    </>
  );
}
