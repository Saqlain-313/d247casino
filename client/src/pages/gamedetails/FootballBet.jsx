import { useEffect, useRef, useState } from 'react';
import { FaTv } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { host } from '../../redux/api';
import {
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import { fetchSoccerBatingData } from '../../redux/reducer/soccerSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getFootballScorecardUrl } from '../../utils/scorecardUrl';
import CricketMarket from './CricketMarket';
import MatchedBet from './MatchedBet';
import MatchOdds from './MatchOdds';
import OverUnder_05 from './OverUnder_05';
import OverUnder_15 from './OverUnder_15';
import OverUnder_25 from './OverUnder_25';
import OverUnder_35 from './OverUnder_35';
import PlaceBet from './PlaceBet';
function FootballBet() {
  const { id } = useParams();
  const location = useLocation();
  const gameid = id;
  // Name/time/beventId: navigation state first, redux match list as refresh fallback
  const storeMatch = useSelector((state) =>
    state.soccer.matches.find((m) => String(m.id) === String(id))
  );
  const listLoaded = useSelector((state) => state.soccer.matches.length > 0);
  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const match = location.state?.name || storeMatch?.game || 'Live Match';
  const dispatch = useDispatch();

  const [bettingData, setBettingData] = useState(null);
  const hasCheckedRef = useRef(false);
  const navigate = useNavigate();
  const { loading, successMessage, errorMessage, pendingBetAmounts } =
    useSelector((state) => state.bet);
  const { battingData } = useSelector((state) => state.soccer);
  const { userInfo } = useSelector((state) => state.auth);
  const sharedSocketRef = useRef(null);
  const [showodds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const streamGmid = beventId || gameid;
  const liveTvUrl = getLiveTvUrl(1, streamGmid);
  const hasLiveTv = Boolean(storeMatch?.tv && liveTvUrl);
  const scorecardUrl = getFootballScorecardUrl(streamGmid);

  // Extract team names from match title
  const matchTitle = match;
  const teams = matchTitle.split(' v ');
  const team1 = teams[0] || 'Team 1';
  const team2 = teams[1] || 'Team 2';
  console.log(showodds);

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

  useEffect(() => {
    if (!gameid) return;
    const sharedSocket = sharedSocketRef.current;
    if (!sharedSocket || sharedSocket.readyState !== 1) {
      sharedSocketRef.current = new WebSocket(host);
      sharedSocketRef.current.onopen = () => {
        console.log('✅ Socket connected');
        sharedSocketRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            gameid,
            apitype: 'soccer',
            userId: userInfo?._id,
          })
        );
      };
      sharedSocketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.gameid === gameid) {
            setBettingData(message.data);
          }
        } catch (e) {
          console.error('❌ Message error', e);
        }
      };
      sharedSocketRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
      sharedSocketRef.current.onclose = () => {
        console.log('Socket closed');
      };
    } else {
      // Already connected, just send subscription
      sharedSocketRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          gameid,
          apitype: 'soccer',
          userId: userInfo?._id,
        })
      );
    }
    return () => {
      // Optionally leave socket open for reuse
    };
  }, [gameid, userInfo?._id]);

  const [marketFetchFailed, setMarketFetchFailed] = useState(false);

  useEffect(() => {
    if (gameid) {
      dispatch(fetchSoccerBatingData(gameid)) // initial
        .then((res) => {
          if (fetchSoccerBatingData.rejected.match(res)) {
            setMarketFetchFailed(true);
          }
        });
    }
  }, [gameid, dispatch]);

  // Dead event: odds fetch fail (event provider pe hai hi nahi) ya refreshed
  // list me event nahi bacha → home pe redirect + "no market" message box.
  useEffect(() => {
    if (marketFetchFailed || (listLoaded && !storeMatch)) {
      navigate('/', {
        replace: true,
        state: {
          noMarketMessage: 'There are no market available in this game',
        },
      });
    }
  }, [marketFetchFailed, listLoaded, storeMatch, navigate]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  const matchOddsList =
    bettingData?.filter((item) => item.mname === 'MATCH_ODDS') || [];

  const matcUnder5List =
    bettingData?.filter((item) => item.mname === 'OVER_UNDER_05') || [];

  const matcUnder15List =
    bettingData?.filter((item) => item.mname === 'OVER_UNDER_15') || [];

  const matcUnder25List =
    bettingData?.filter((item) => item.mname === 'OVER_UNDER_25') || [];

  const matcUnder35List =
    bettingData?.filter((item) => item.mname === 'OVER_UNDER_35') || [];

  // Every market without a dedicated component (Bookmaker, Draw No Bet,
  // Next Goal, ...) renders through the generic renderer, so nothing the
  // provider sends is silently dropped.
  const KNOWN_MARKETS = new Set([
    'MATCH_ODDS',
    'OVER_UNDER_05',
    'OVER_UNDER_15',
    'OVER_UNDER_25',
    'OVER_UNDER_35',
  ]);
  const otherMarkets = (Array.isArray(bettingData) ? bettingData : []).filter(
    (market) =>
      !KNOWN_MARKETS.has(market?.mname) &&
      Array.isArray(market?.section) &&
      market.section.length > 0
  );

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
    dispatch(getPendingBet(gameid));
  }, [dispatch, gameid]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setSelectedBet(null);
      if (gameid) {
        dispatch(getPendingBetAmo(gameid));
        dispatch(getPendingBet(gameid));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, gameid]);

  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='ml-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[12px] font-bold lg:text-[15px]'>
          <span>{match}</span>
          <span>{time}</span>
        </div>
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
              className='flex w-full cursor-pointer items-center justify-center p-2'
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
            {!showLive && scorecardUrl && (
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
            {/** Match Odds */}
            {matchOddsList.length > 0 && (
              <MatchOdds
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matchOddsList={matchOddsList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Bookmaker */}
            {/* <Bookmaker/> */}

            {/** Over Under 0.5 */}
            {matcUnder5List.length > 0 && (
              <OverUnder_05
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matcUnder5List={matcUnder5List}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Over Under 1.5 */}
            {matcUnder15List.length > 0 && (
              <OverUnder_15
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matcUnder15List={matcUnder15List}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Over Under 2.5 */}
            {matcUnder25List.length > 0 && (
              <OverUnder_25
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matcUnder25List={matcUnder25List}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Over Under 3.5 */}
            {matcUnder35List.length > 0 && (
              <OverUnder_35
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matcUnder35List={matcUnder35List}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** All other provider markets (Draw No Bet, Next Goal, Bookmaker...) —
             * reference-style grid: 1 per row mobile, 2 per row md, 3 per row xl */}
            {otherMarkets.length > 0 && (
              <div className='mt-1 flex flex-wrap gap-1'>
                {otherMarkets.map((market) => (
                  <div
                    key={`${market.gmid || gameid}-${market.mid || market.mname}`}
                    className='w-full min-w-0 md:w-[calc(50%-4px)] xl:w-[calc(33.33%-6px)]'
                  >
                    <CricketMarket
                      market={market}
                      onBetSelect={handleBetSelect}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!showodds && (
          <div className='block lg:hidden'>
            <MatchedBet eventName={gameid} />
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
              gameId={gameid}
              eventName={match}
              sid={1}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Soccer Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
            />
          </div>
          <div className='bg-secondary text-secondary p-1'>
            <span className='font-bold'>My Bet</span>
          </div>
          <MatchedBet eventName={gameid} />
        </div>
      </div>

      {/* Mobile PlaceBet Modal */}
      {selectedBet && (
        <>
          {/* Backdrop */}
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={() => setSelectedBet(null)}
          ></div>
          {/* Modal */}
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            <PlaceBet
              selectedBet={selectedBet}
              onBetChange={handleBetChange}
              onClose={() => setSelectedBet(null)}
              isMobile={true}
              team1={team1}
              team2={team2}
              gameId={gameid}
              eventName={match}
              sid={1}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Soccer Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default FootballBet;
