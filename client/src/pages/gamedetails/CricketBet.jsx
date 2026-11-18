import { useEffect, useState } from 'react';
import { FaTv } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { host } from '../../redux/api';
import { getUser } from '../../redux/reducer/authReducer';
import {
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import { fetchCricketBatingData } from '../../redux/reducer/cricketSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getCricketScorecardUrl } from '../../utils/scorecardUrl';
import Bookmaker from './Bookmaker';
import CricketCasinoLive from './CricketCasinoLive';
import CricketMarket from './CricketMarket';
import Fancy1 from './Fancy1';
import Khado from './Khado';
import LiveScoreCard from './LiveScoreCard';
import MatchedBet from './MatchedBet';
import MatchOdds from './MatchOdds';
import Normal from './Normal';
import OddEven from './OddEven';
import PlaceBet from './PlaceBet';
import RulesModal from './RulesModal';
import TiedMatch from './TiedMatch';
import { getGameRulesContent } from '../../utils/gameRules';

function CricketBet({ variant = 'sportsbook' }) {
  const { id } = useParams();
  const location = useLocation();
  const eventName = id;
  // Name/time/beventId: navigation state first, redux match list as refresh fallback
  const storeMatch = useSelector((state) =>
    state.cricket.matches.find((m) => String(m.id) === String(id))
  );
  const listLoaded = useSelector((state) => state.cricket.matches.length > 0);
  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const match = location.state?.name || storeMatch?.game || 'Live Match';
  // iscc navigation state se pehle lo (refresh pe redux list ka wait nahi).
  const iscc = Number(location.state?.iscc ?? storeMatch?.iscc ?? 0);
  const casinoLabel =
    variant === 'cricketv'
      ? 'Cricket Casino'
      : variant === 'virtual'
        ? 'Virtual Cricket'
        : variant === 'superover'
          ? 'Super Over'
          : variant === 'egames'
            ? 'E-Games'
            : null;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bettingData, setBettingData] = useState(null);
  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [showodds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const { battingData } = useSelector((state) => state.cricket);
  const { pendingBetAmounts, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { userInfo } = useSelector((state) => state.auth);

  // ✅ streamGmid = actual backend gameId (event id)
  const streamGmid = beventId || eventName;

  // ✅ gameId ko formData mein bhi rakh do (agar kahin use ho raha ho)
  const [formData, setFormData] = useState({
    gameId: streamGmid, // ✅ FIX: gameId add kiya
    game: eventName,
    sid: 4,
    otype: '',
    price: null,
    xValue: '',
    gameType: '',
    gameName: 'Cricket Game',
    teamName: '',
  });

  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [item, setitem] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const rulesContent = getGameRulesContent(
    variant === 'superover' ? 'superover' : 'cricketv',
    match
  );
  const liveTvUrl = getLiveTvUrl(4, streamGmid);
  // Live TV tab sirf jab event me tv flag ho aur stream url bane.
  const hasLiveTv = Boolean(storeMatch?.tv && liveTvUrl);
  const scorecardUrl = getCricketScorecardUrl(streamGmid);
  const [scoreData, setScoreData] = useState(null);
  const [scoreTimedOut, setScoreTimedOut] = useState(false);

  useEffect(() => {
    setScoreData(null);
    setScoreTimedOut(false);
    const timer = setTimeout(() => setScoreTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [streamGmid]);

  const subTabs = [
    { id: 'Normal', name: 'ALL' },
    { id: 'Fancy', name: 'Fancy' },
    { id: 'line', name: 'Line Markets' },
    { id: 'ball', name: 'Ball by Ball' },
    { id: 'meter', name: 'Meter Markets' },
    { id: 'khado', name: 'Khado Markets' },
  ];

  const matchTitle = match || 'Team 1 v Team 2';
  const teams = matchTitle.split(/\s+(?:v|vs|-)\s+/i);
  const team1 = teams[0] || 'Team 1';
  const team2 = teams[1] || 'Team 2';

  const handleBetSelect = (betData) => {
    setSelectedBet(betData);
  };

  const handleBetChange = (updatedBet) => {
    setSelectedBet(updatedBet);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setshowodds(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [marketFetchFailed, setMarketFetchFailed] = useState(false);
  const [bettingLoaded, setBettingLoaded] = useState(false);

  useEffect(() => {
    if (eventName) {
      setMarketFetchFailed(false);
      setBettingLoaded(false);
      setLoader(true);
      dispatch(fetchCricketBatingData(eventName))
        .then((res) => {
          if (fetchCricketBatingData.rejected.match(res)) {
            setMarketFetchFailed(true);
          }
        })
        .finally(() => {
          setBettingLoaded(true);
          setLoader(false);
        });
    }
  }, [dispatch, eventName]);

  const hasLiveMarkets =
    (Array.isArray(bettingData) && bettingData.length > 0) ||
    (Array.isArray(battingData) && battingData.length > 0);

  // Dead event: odds fetch fail (event provider pe hai hi nahi) ya live market
  // empty + list me match nahi → home pe redirect + "no market" message box.
  useEffect(() => {
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
    marketFetchFailed,
    bettingLoaded,
    hasLiveMarkets,
    listLoaded,
    storeMatch,
    navigate,
  ]);

  useEffect(() => {
    if (!eventName) return;
    const socket = new WebSocket(host);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'subscribe',
          gameid: eventName,
          apitype: 'cricket',
          userId: userInfo?._id,
          scoreEventId: String(streamGmid),
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'scoreData') {
          if (message.scoreEventId === String(streamGmid)) {
            setScoreData(message.data);
          }
          return;
        }
        if (message.gameid === eventName) {
          setBettingData(message.data);
        }
      } catch (err) {
        console.error('❌ Error parsing message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => socket.close();
  }, [eventName, streamGmid, userInfo?._id]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (eventName) {
      dispatch(getPendingBetAmo(eventName));
      dispatch(getPendingBet(eventName));
    }
  }, [dispatch, eventName]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setSelectedBet(null);
      if (eventName) {
        dispatch(getPendingBetAmo(eventName));
        dispatch(getPendingBet(eventName));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, eventName]);

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  const tiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'Tied Match' ||
          item?.mname === 'TIED_MATCH' ||
          item?.mname === 'Bookmaker IPL CUP'
      )
    : [];

  const BookmakerList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'Bookmaker')
    : [];

  const fancy1List = bettingData?.filter((item) => item.mname === 'fancy1');

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
      ? fancy1List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy1List[0].mname,
          status: fancy1List[0].status,
        }))
      : [];

  const NormalList = bettingData?.filter((item) => item.mname === 'Normal');
  const NormalData =
    Array.isArray(NormalList) && NormalList.length > 0 && NormalList[0].section
      ? NormalList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: NormalList[0].mname,
          status: sec.gstatus,
        }))
      : [];

  const khadoList = bettingData?.filter((item) => item.mname === 'khado');
  const khadoData =
    Array.isArray(khadoList) && khadoList.length > 0 && khadoList[0].section
      ? khadoList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: khadoList[0].mname,
          status: sec.gstatus,
        }))
      : [];

  const oddEvenList = bettingData?.filter((item) => item.mname === 'oddeven');
  const oddEvenData =
    Array.isArray(oddEvenList) &&
    oddEvenList.length > 0 &&
    oddEvenList[0].section
      ? oddEvenList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: oddEvenList[0].mname,
          status: sec.gstatus,
        }))
      : [];

  const knownMarketNames = new Set([
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

  const otherMarkets = (Array.isArray(bettingData) ? bettingData : []).filter(
    (market) =>
      !knownMarketNames.has(market?.mname) &&
      Array.isArray(market?.section) &&
      market.section.length > 0
  );

  // Reference width scheme (style.css): 3+3-depth back+lay markets are full
  // width (market-4/13 = 100%), 2-depth gets 50% (market-3), compact markets
  // (back-only / session / U-O / 1-depth) share a row. Squeezing a 3+3 grid
  // into a 33% column made the odds buttons overflow / overlap the row.
  const marketWidthClass = (market) => {
    const runners = Array.isArray(market?.section) ? market.section : [];
    const dtype = Number(market?.dtype);
    const hasLay = runners.some((r) =>
      (r.odds || []).some((o) => o.otype === 'lay' && Number(o.odds) > 0)
    );
    const depth = Math.min(
      3,
      Math.max(
        1,
        ...runners.map((r) => {
          const odds = Array.isArray(r.odds) ? r.odds : [];
          return Math.max(
            odds.filter((o) => o.otype === 'back').length,
            odds.filter((o) => o.otype === 'lay').length
          );
        })
      )
    );
    const isSession = dtype === 6 || dtype === 7;
    const isUnderOver = dtype === 18;
    const isDepthGrid = hasLay && !isSession && !isUnderOver;
    if (isDepthGrid && depth >= 3) return 'w-full min-w-0';
    if ((isDepthGrid && depth === 2) || isSession) {
      return 'w-full min-w-0 md:w-[calc(50%-4px)]';
    }
    return 'w-full min-w-0 md:w-[calc(50%-4px)] xl:w-[calc(33.33%-6px)]';
  };

  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='ml-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        {casinoLabel && (
          <div className='casino-header'>
            <span className='casino-name'>
              {match}
              <a
                className='ms-1 cursor-pointer underline'
                onClick={() => setShowRules(true)}
              >
                <small>Rules</small>
              </a>
            </span>
            <span className='ml-auto text-[12px] font-[400]'>{time}</span>
          </div>
        )}
        {!casinoLabel && (
          <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[12px] font-bold lg:text-[15px]'>
            <span>{match}</span>
            <span>{time}</span>
          </div>
        )}
        <div className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold lg:hidden'>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${showodds ? 'border-t-2 border-t-[#cccccc]' : ''}`}
            onClick={() => {
              setshowodds(true);
              setShowLive(false);
            }}
          >
            ODDS
          </div>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${showodds ? '' : 'border-t-2 border-t-[#cccccc]'}`}
            onClick={() => setshowodds(false)}
          >
            MATCHED BET
          </div>
          {hasLiveTv && (
            <div
              className={`flex w-full cursor-pointer items-center justify-center p-2`}
              onClick={() => {
                setShowLive(true);
                setshowodds(true);
              }}
            >
              <FaTv className='text-sm' />
            </div>
          )}
        </div>

        {showodds && (
          <div>
            {!showLive && scoreData && <LiveScoreCard data={scoreData} />}
            {!showLive && !scoreData && scoreTimedOut && scorecardUrl && (
              <iframe
                src={scorecardUrl}
                allowFullScreen
                className='w-full'
                title='Live Score'
                allow='
                  autoplay;
                  encrypted-media;
                  fullscreen;
                  picture-in-picture;
                  accelerometer;
                  gyroscope
                '
              />
            )}
            {showLive && liveTvUrl && (
              <div className='w-full'>
                <iframe
                  src={liveTvUrl}
                  title='Watch Live'
                  className='w-full'
                  style={{ height: '50vh' }}
                  allowFullScreen
                  loading='lazy'
                  allow='
                    autoplay;
                    encrypted-media;
                    fullscreen;
                    picture-in-picture;
                    accelerometer;
                    gyroscope
                  '
                />
              </div>
            )}
            {/** Cricket Casino game screen (cards/clock/video) — iscc 1 & 3 */}
            {(iscc === 1 ||
              iscc === 3 ||
              variant === 'cricketv' ||
              variant === 'superover') && (
              <CricketCasinoLive
                gmid={eventName}
                tvUrl={liveTvUrl}
                inplay={storeMatch?.inplay}
                hasTv={storeMatch?.tv}
              />
            )}
            {/** Match Odds */}
            {matchOddsList.length > 0 && (
              <MatchOdds
                eventName={eventName}
                onBetSelect={handleBetSelect}
                matchOddsList={matchOddsList}
                setitem={setitem}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Bookmaker */}
            {BookmakerList.length > 0 && (
              <Bookmaker
                eventName={eventName}
                onBetSelect={handleBetSelect}
                BookmakerList={BookmakerList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Tied Match */}
            {tiedMatchList.length > 0 && (
              <TiedMatch
                eventName={eventName}
                onBetSelect={handleBetSelect}
                tiedMatchList={tiedMatchList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {(NormalData.length > 0 ||
              fancy1Data.length > 0 ||
              khadoData.length > 0 ||
              oddEvenData.length > 0 ||
              otherMarkets.length > 0) && (
              <div className='bg-secondary text-secondary mt-1 flex flex-wrap gap-1 p-1 text-xs font-bold'>
                {subTabs.map((tab) => (
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

            {/** Normal */}
            {NormalData.length > 0 &&
              (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
                <Normal
                  onBetSelect={handleBetSelect}
                  NormalData={NormalData}
                  pendingBetAmounts={pendingBetAmounts}
                  selectedBet={selectedBet}
                />
              )}

            {/** Fancy1  */}
            {fancy1Data.length > 0 &&
              (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
                <Fancy1
                  onBetSelect={handleBetSelect}
                  fancy1Data={fancy1Data}
                  pendingBetAmounts={pendingBetAmounts}
                  selectedBet={selectedBet}
                />
              )}

            {/** Khado */}
            {khadoData.length > 0 &&
              (activeSubTab === 'Normal' || activeSubTab === 'khado') && (
                <Khado
                  onBetSelect={handleBetSelect}
                  khadoData={khadoData}
                  pendingBetAmounts={pendingBetAmounts}
                  selectedBet={selectedBet}
                />
              )}

            {/** OddEven */}
            {oddEvenData.length > 0 &&
              (activeSubTab === 'Normal' || activeSubTab === 'Fancy') && (
                <OddEven
                  onBetSelect={handleBetSelect}
                  oddEvenData={oddEvenData}
                  pendingBetAmounts={pendingBetAmounts}
                  selectedBet={selectedBet}
                />
              )}

            {otherMarkets.length > 0 && (
              <div className='mt-1 flex flex-wrap gap-1'>
                {otherMarkets
                  .filter((market) => {
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
                      return (
                        gtype === 'cricketcasino' || mname.includes('ball')
                      );
                    if (activeSubTab === 'meter')
                      return gtype === 'meter' || mname.includes('meter');
                    if (activeSubTab === 'khado')
                      return gtype === 'khado' || mname.includes('khado');
                    return true;
                  })
                  .map((market) => (
                    <div
                      key={`${market.gmid || eventName}-${market.mid || market.mname}`}
                      className={marketWidthClass(market)}
                    >
                      <CricketMarket
                        market={market}
                        onBetSelect={handleBetSelect}
                        pendingBetAmounts={pendingBetAmounts}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {!showodds && (
          <div className='block'>
            <MatchedBet eventName={eventName} />
          </div>
        )}
      </div>

      <div className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          <div className='mb-1'>
            <div
              className='bg-secondary text-secondary cursor-pointer p-1'
              onClick={() => setshowlivetv((prev) => !prev)}
            >
              <span className='font-bold'>Live Match</span>
            </div>
            {showlivetv && liveTvUrl && (
              <div className='w-full'>
                <iframe
                  src={liveTvUrl}
                  title='Watch Live'
                  className='w-full'
                  style={{ height: '50vh' }}
                  allowFullScreen
                  loading='lazy'
                  allow='
                    autoplay;
                    encrypted-media;
                    fullscreen;
                    picture-in-picture;
                    accelerometer;
                    gyroscope
                  '
                />
              </div>
            )}
          </div>
          <div className=''>
            <PlaceBet
              selectedBet={selectedBet}
              onBetChange={handleBetChange}
              onClose={() => setSelectedBet(null)}
              team1={team1}
              team2={team2}
              item={item}
              eventName={eventName}
              gameId={streamGmid} // ✅ FIX: gameId pass
              sid={4}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Cricket Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
            />
          </div>
          <div className='bg-secondary text-secondary p-1'>
            <span className='font-bold'>My Bet</span>
          </div>
          <MatchedBet eventName={eventName} />
        </div>
      </div>

      {/* Mobile PlaceBet Modal */}
      {selectedBet && (
        <>
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={() => setSelectedBet(null)}
          ></div>
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            <PlaceBet
              selectedBet={selectedBet}
              onBetChange={handleBetChange}
              onClose={() => setSelectedBet(null)}
              isMobile={true}
              team1={team1}
              team2={team2}
              eventName={eventName}
              gameId={streamGmid} // ✅ FIX: gameId pass
              sid={4}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Cricket Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
            />
          </div>
        </>
      )}

      {casinoLabel && (
        <RulesModal
          open={showRules}
          onClose={() => setShowRules(false)}
          title={rulesContent.title}
          image={rulesContent.image}
          html={rulesContent.html}
        />
      )}
    </div>
  );
}

export default CricketBet;
