import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSportEventSocket } from '../../hooks/useSportEventSocket';
import { getUser } from '../../redux/reducer/authReducer';
import {
  fetchCricketBatingData,
  fetchCricketData,
} from '../../redux/reducer/cricketSlice';
import { cricketMatchPath } from '../../utils/cricketRoute';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getCricketScorecardUrl } from '../../utils/scorecardUrl';
import Bookmaker from './Bookmaker';
import CricketCasinoLive from './CricketCasinoLive';
import CricketMarket from './CricketMarket';
import Fancy1 from './Fancy1';
import Khado from './Khado';
import LiveScoreCard from './LiveScoreCard';
import MatchOdds from './MatchOdds';
import Normal from './Normal';
import OddEven from './OddEven';
import RulesModal from './RulesModal';
import TiedMatch from './TiedMatch';
import SportDetailLayout from './components/SportDetailLayout';
import {
  parseMatchTeams,
  useSportBettingLifecycle,
} from './hooks/useSportBettingLifecycle';
import { getMarketWidthClass } from './utils/marketHelpers';

const SUB_TABS = [
  { id: 'Normal', name: 'ALL' },
  { id: 'Fancy', name: 'Fancy' },
  { id: 'line', name: 'Line Markets' },
  { id: 'ball', name: 'Ball by Ball' },
  { id: 'meter', name: 'Meter Markets' },
  { id: 'khado', name: 'Khado Markets' },
];

const KNOWN_MARKET_NAMES = new Set([
  'MATCH_ODDS',
  'TOURNAMENT_WINNER',
  'Tied Match',
  'TIED_MATCH',
  'Bookmaker IPL CUP',
  'Bookmaker',
  'fancy1',
  'Normal',
  'khado',
  'oddeven',
]);

const CASINO_LABELS = {
  cricketv: 'Cricket Casino',
  virtual: 'Virtual Cricket',
  superover: 'Super Over',
  egames: 'E-Games',
};

function mapSectionRunners(bettingData, marketName, useMarketStatus = false) {
  const list = Array.isArray(bettingData)
    ? bettingData.filter((item) => item?.mname === marketName)
    : [];
  if (list.length === 0 || !Array.isArray(list[0].section)) return [];
  const market = list[0];
  return market.section.map((sec) => ({
    team: sec.nat,
    sid: sec.sid,
    odds: sec.odds,
    max: sec.max,
    min: sec.min,
    mname: market.mname,
    status: useMarketStatus ? market.status : sec.gstatus,
    gstatus: sec.gstatus,
    gscode: sec.gscode,
    marketStatus: market.status,
    marketGscode: market.gscode,
  }));
}

function matchesSubTab(market, activeSubTab) {
  if (activeSubTab === 'Normal') return true;
  const gtype = String(market?.gtype || '').toLowerCase();
  const mname = String(market?.mname || '').toLowerCase();
  if (activeSubTab === 'Fancy')
    return ['fancy', 'fancy1', 'oddeven'].includes(gtype);
  if (activeSubTab === 'line')
    return (
      gtype === 'fancy2' ||
      mname.includes('line') ||
      mname.includes('over by over')
    );
  if (activeSubTab === 'ball')
    return gtype === 'cricketcasino' || mname.includes('ball');
  if (activeSubTab === 'meter')
    return gtype === 'meter' || mname.includes('meter');
  if (activeSubTab === 'khado')
    return gtype === 'khado' || mname.includes('khado');
  return true;
}

function CricketBet({ variant = 'sportsbook' }) {
  const { id: eventName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storeMatch = useSelector((state) =>
    state.cricket.matches.find((m) => String(m.id) === String(eventName))
  );
  const listLoaded = useSelector((state) => state.cricket.matches.length > 0);
  const { battingData } = useSelector((state) => state.cricket);
  const { userInfo } = useSelector((state) => state.auth);

  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const match = location.state?.name || storeMatch?.game || 'Live Match';
  const iscc = Number(
    location.state?.iscc ??
      storeMatch?.iscc ??
      (variant === 'cricketv'
        ? 1
        : variant === 'virtual'
          ? 2
          : variant === 'superover'
            ? 3
            : variant === 'egames'
              ? 4
              : 0)
  );
  const casinoLabel =
    CASINO_LABELS[variant] ||
    (iscc === 1
      ? 'Cricket Casino'
      : iscc === 2
        ? 'Virtual Cricket'
        : iscc === 3
          ? 'Super Over'
          : iscc === 4
            ? 'E-Games'
            : null);
  const isNonRealCricket = iscc !== 0 || variant !== 'sportsbook';
  const isCricketCasino = iscc === 1 || variant === 'cricketv';
  const isVirtualCricket = iscc === 2 || variant === 'virtual';
  const isInlineVideo = isCricketCasino || isVirtualCricket;

  const streamGmid = beventId || eventName;
  const liveTvUrl = getLiveTvUrl(4, streamGmid);
  // Real Cricket (iscc=0) uses mobile TV tab + sidebar Live Match toggle;
  // Cricket Casino (iscc=1) & Virtual Cricket (iscc=2) show inline .casino-video
  // at top of page (D247 BO & mO — no duplicate TV tab or sidebar toggle).
  const hasLiveTv = Boolean(!isInlineVideo && storeMatch?.tv && liveTvUrl);
  const scorecardUrl = getCricketScorecardUrl(streamGmid);
  const { team1, team2 } = parseMatchTeams(match || 'Team 1 v Team 2');

  // If a direct link/bookmark opens an iscc=3 (Super Over) or iscc=4 (E-Cricket)
  // match on CricketBet, redirect cleanly to its dedicated D247 route.
  useEffect(() => {
    if (iscc === 3 || variant === 'superover') {
      navigate(cricketMatchPath(3, eventName, match), { replace: true });
    } else if (iscc === 4 || variant === 'egames') {
      navigate(cricketMatchPath(4, eventName, match), {
        replace: true,
        state: { name: match, time, beventId, iscc: 4 },
      });
    }
  }, [iscc, variant, eventName, match, time, beventId, navigate]);

  const [bettingData, setBettingData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [item, setitem] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [marketFetchFailed, setMarketFetchFailed] = useState(false);
  const [bettingLoaded, setBettingLoaded] = useState(false);

  // Hydrate match metadata (tv, inplay, iscc, name) on direct URL / refresh
  useEffect(() => {
    if (!storeMatch && !listLoaded) {
      dispatch(fetchCricketData());
    }
  }, [dispatch, storeMatch, listLoaded]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!eventName) return;
    setMarketFetchFailed(false);
    setBettingLoaded(false);
    setScoreData(null);
    dispatch(fetchCricketBatingData(eventName))
      .then((res) => {
        if (fetchCricketBatingData.rejected.match(res)) {
          setMarketFetchFailed(true);
        }
      })
      .finally(() => {
        setBettingLoaded(true);
      });
  }, [dispatch, eventName]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  // Only non-real Cricket (iscc 1/2/3/4) subscribes to /diamond/score/4_<gmid>;
  // Real Cricket (iscc=0) uses /score-iframe/4_<gmid> iframe directly.
  useSportEventSocket({
    enabled: Boolean(eventName),
    subscribePayload: eventName
      ? {
          type: 'subscribe',
          gameid: eventName,
          apitype: 'cricket',
          userId: userInfo?._id,
          ...(isNonRealCricket ? { scoreEventId: String(streamGmid) } : {}),
        }
      : null,
    onMessage: (message) => {
      if (message.type === 'scoreData' && isNonRealCricket) {
        if (message.scoreEventId === String(streamGmid)) {
          setScoreData(message.data);
        }
        return;
      }
      if (message.gameid === eventName) {
        setBettingData(message.data);
      }
    },
  });

  const lifecycle = useSportBettingLifecycle({
    gameId: eventName,
    bettingData,
    battingData,
    listLoaded,
    storeMatch,
    marketFetchFailed,
    bettingLoaded,
  });

  const safeData = Array.isArray(bettingData) ? bettingData : [];
  const matchOddsList = safeData.filter(
    (m) => m?.mname === 'MATCH_ODDS' || m?.mname === 'TOURNAMENT_WINNER'
  );
  const tiedMatchList = safeData.filter(
    (m) =>
      m?.mname === 'Tied Match' ||
      m?.mname === 'TIED_MATCH' ||
      m?.mname === 'Bookmaker IPL CUP'
  );
  const BookmakerList = safeData.filter((m) => m?.mname === 'Bookmaker');
  const fancy1Data = mapSectionRunners(safeData, 'fancy1', true);
  const NormalData = mapSectionRunners(safeData, 'Normal');
  const khadoData = mapSectionRunners(safeData, 'khado');
  const oddEvenData = mapSectionRunners(safeData, 'oddeven');

  const otherMarkets = safeData.filter(
    (market) =>
      !KNOWN_MARKET_NAMES.has(market?.mname) &&
      Array.isArray(market?.section) &&
      market.section.length > 0
  );

  const placeBetProps = {
    onBetChange: lifecycle.handleBetChange,
    team1,
    team2,
    item,
    eventName: match,
    gameId: streamGmid,
    sid: 4,
    marketName: lifecycle.selectedBet?.marketName,
    gameType: lifecycle.selectedBet?.gameType,
    gameName: 'Cricket Game',
    maxAmount: lifecycle.selectedBet?.maxAmount,
    minAmount: lifecycle.selectedBet?.minAmount,
    fancyScore: lifecycle.selectedBet?.fancyScore,
  };

  const customHeader = casinoLabel ? (
    <div className='casino-header'>
      <span className='casino-name'>
        {match}
        {isCricketCasino && (
          <a
            className='ms-1 cursor-pointer underline'
            onClick={() => setShowRules(true)}
          >
            <small>Rules</small>
          </a>
        )}
      </span>
      <span className='ml-auto text-[12px] font-[400]'>{time}</span>
    </div>
  ) : null;

  // Score display rule:
  // - Non-real cricket (iscc 1/2/3/4): JSON LiveScoreCard from /diamond/score/4_<gmid>
  // - Real cricket (iscc 0): /score-iframe/4_<gmid> iframe
  const scorecardSlot = isNonRealCricket ? (
    scoreData ? (
      <LiveScoreCard data={scoreData} />
    ) : null
  ) : scorecardUrl ? (
    <iframe
      src={scorecardUrl}
      allowFullScreen
      className='w-full border-0 bg-black'
      style={{ height: '165px' }}
      title='Live Score'
      allow='autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope'
    />
  ) : null;

  return (
    <SportDetailLayout
      header={customHeader}
      match={match}
      time={time}
      showodds={lifecycle.showodds}
      setshowodds={lifecycle.setshowodds}
      showLive={lifecycle.showLive}
      setShowLive={lifecycle.setShowLive}
      showlivetv={lifecycle.showlivetv}
      setshowlivetv={lifecycle.setshowlivetv}
      hasLiveTv={hasLiveTv}
      liveTvUrl={liveTvUrl}
      scorecardSlot={scorecardSlot}
      matchedBetEventKey={eventName}
      mobileMatchedBetClassName='block'
      selectedBet={lifecycle.selectedBet}
      onCloseBet={() => lifecycle.setSelectedBet(null)}
      placeBetProps={placeBetProps}
      extraModals={
        casinoLabel ? (
          <RulesModal
            open={showRules}
            onClose={() => setShowRules(false)}
            gameKey={variant === 'superover' ? 'superover' : 'cricketv'}
            fallbackTitle={match}
          />
        ) : null
      }
    >
      {/* Cricket Casino game screen (cards + FlipClock + TV iframe) — iscc 1 & 3 */}
      {isCricketCasino && (
        <CricketCasinoLive
          gmid={eventName}
          tvUrl={liveTvUrl}
          inplay={storeMatch?.inplay}
          hasTv={Boolean(liveTvUrl)}
        />
      )}

      {/* Virtual Cricket (iscc 2 — D247 mO @9279416) inline video stream */}
      {isVirtualCricket && liveTvUrl && (
        <div className='casino-video mt-1 overflow-hidden'>
          <div className='video-box-container v-other'>
            <div className='casino-video-box'>
              <iframe
                src={liveTvUrl}
                title='Virtual Cricket Live'
                allow='autoplay; encrypted-media; picture-in-picture'
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {matchOddsList.length > 0 && (
        <MatchOdds
          eventName={eventName}
          onBetSelect={lifecycle.handleBetSelect}
          matchOddsList={matchOddsList}
          setitem={setitem}
          pendingBetAmounts={lifecycle.pendingBetAmounts}
          selectedBet={lifecycle.selectedBet}
        />
      )}

      {BookmakerList.length > 0 && (
        <Bookmaker
          eventName={eventName}
          onBetSelect={lifecycle.handleBetSelect}
          BookmakerList={BookmakerList}
          pendingBetAmounts={lifecycle.pendingBetAmounts}
          selectedBet={lifecycle.selectedBet}
        />
      )}

      {tiedMatchList.length > 0 && (
        <TiedMatch
          eventName={eventName}
          onBetSelect={lifecycle.handleBetSelect}
          tiedMatchList={tiedMatchList}
          pendingBetAmounts={lifecycle.pendingBetAmounts}
          selectedBet={lifecycle.selectedBet}
        />
      )}

      {(NormalData.length > 0 ||
        fancy1Data.length > 0 ||
        khadoData.length > 0 ||
        oddEvenData.length > 0 ||
        otherMarkets.length > 0) && (
        <div className='bg-secondary text-secondary mt-1 flex flex-wrap gap-1 p-1 text-xs font-bold'>
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveSubTab(tab.id)}
              className={`cursor-pointer rounded px-2.5 py-1 transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-white text-[#2c3e50]'
                  : 'text-white/85 hover:bg-white/15'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      {NormalData.length > 0 &&
        (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
          <Normal
            onBetSelect={lifecycle.handleBetSelect}
            NormalData={NormalData}
            pendingBetAmounts={lifecycle.pendingBetAmounts}
            selectedBet={lifecycle.selectedBet}
          />
        )}

      {fancy1Data.length > 0 &&
        (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
          <Fancy1
            onBetSelect={lifecycle.handleBetSelect}
            fancy1Data={fancy1Data}
            pendingBetAmounts={lifecycle.pendingBetAmounts}
            selectedBet={lifecycle.selectedBet}
          />
        )}

      {khadoData.length > 0 &&
        (activeSubTab === 'Normal' || activeSubTab === 'khado') && (
          <Khado
            onBetSelect={lifecycle.handleBetSelect}
            khadoData={khadoData}
            pendingBetAmounts={lifecycle.pendingBetAmounts}
            selectedBet={lifecycle.selectedBet}
          />
        )}

      {oddEvenData.length > 0 &&
        (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
          <OddEven
            onBetSelect={lifecycle.handleBetSelect}
            oddEvenData={oddEvenData}
            pendingBetAmounts={lifecycle.pendingBetAmounts}
            selectedBet={lifecycle.selectedBet}
          />
        )}

      {otherMarkets.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-1'>
          {otherMarkets
            .filter((market) => matchesSubTab(market, activeSubTab))
            .map((market) => (
              <div
                key={`${market.gmid || eventName}-${market.mid || market.mname}`}
                className={getMarketWidthClass(market)}
              >
                <CricketMarket
                  market={market}
                  onBetSelect={lifecycle.handleBetSelect}
                  pendingBetAmounts={lifecycle.pendingBetAmounts}
                />
              </div>
            ))}
        </div>
      )}
    </SportDetailLayout>
  );
}

export default CricketBet;
