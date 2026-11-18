import { useEffect, useState } from 'react';
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
import { getGameRulesContent } from '../../utils/gameRules';
import CricketMarket from './CricketMarket';
import MatchedBet from './MatchedBet';
import PlaceBet from './PlaceBet';
import RulesModal from './RulesModal';
import ScorecardBB from './ScorecardBB';

// E-cricket (iscc 4) casino-page layout — reference DOM jaisa:
// casino-header > tabs(Odds/Matched Bet, mobile-only, NO TV) > scorecard-bb >
// casino-video(mediaplayer iframe) > back-only markets (market-9/17) > sidebar.
function ECricketBet() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const eventName = id;
  const storeMatch = useSelector((state) =>
    state.cricket.matches.find((m) => String(m.id) === String(id))
  );
  const listLoaded = useSelector((state) => state.cricket.matches.length > 0);
  const match = location.state?.name || storeMatch?.game || 'E-Cricket';
  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const streamGmid = beventId || eventName;
  const liveTvUrl = getLiveTvUrl(4, streamGmid);
  const inplay = location.state?.iplay ?? storeMatch?.inplay;

  const [bettingData, setBettingData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showOdds, setShowOdds] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [marketFetchFailed, setMarketFetchFailed] = useState(false);
  const [bettingLoaded, setBettingLoaded] = useState(false);
  const { pendingBetAmounts, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { userInfo } = useSelector((state) => state.auth);
  const { battingData } = useSelector((state) => state.cricket);

  useEffect(() => {
    if (!eventName) return;
    setMarketFetchFailed(false);
    setBettingLoaded(false);
    dispatch(fetchCricketBatingData(eventName)).then((res) => {
      setBettingLoaded(true);
      if (fetchCricketBatingData.rejected.match(res))
        setMarketFetchFailed(true);
    });
  }, [dispatch, eventName]);

  useEffect(() => {
    const hasLiveMarkets =
      (Array.isArray(bettingData) && bettingData.length > 0) ||
      (Array.isArray(battingData) && battingData.length > 0);
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
    bettingData,
    battingData,
    listLoaded,
    storeMatch,
    navigate,
  ]);

  // Betting + score over WebSocket (sports poller 1s inplay / 10s idle).
  useEffect(() => {
    if (!eventName) return undefined;
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
        if (message.gameid === eventName) setBettingData(message.data);
      } catch (err) {
        console.error('E-cricket WS parse error:', err);
      }
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
    if (!eventName) return;
    dispatch(getPendingBetAmo(eventName));
    dispatch(getPendingBet(eventName));
  }, [dispatch, eventName]);

  useEffect(() => {
    let t;
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      t = setTimeout(() => setSelectedBet(null), 0);
      if (eventName) {
        dispatch(getPendingBetAmo(eventName));
        dispatch(getPendingBet(eventName));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    return () => clearTimeout(t);
  }, [successMessage, errorMessage, dispatch, eventName]);

  const markets = (Array.isArray(bettingData) ? bettingData : []).filter(
    (m) => Array.isArray(m?.section) && m.section.length > 0
  );
  const eRules = getGameRulesContent('ecricket', match);
  const eTeams = String(match || '').split(/\s+(?:v|vs|-)\s+/i);

  const renderPlaceBet = (isMobile = false) => (
    <PlaceBet
      selectedBet={selectedBet}
      onBetChange={setSelectedBet}
      onClose={() => setSelectedBet(null)}
      isMobile={isMobile}
      team1={eTeams[0] || match}
      team2={eTeams[1] || 'E-Cricket'}
      item={null}
      gameId={streamGmid}
      eventName={match}
      sid={4}
      marketName={selectedBet?.marketName}
      gameType={selectedBet?.gameType}
      gameName='E-Cricket'
      maxAmount={selectedBet?.maxAmount}
      minAmount={selectedBet?.minAmount}
    />
  );

  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='casino-page ml-0 w-full min-w-0 md:ml-1 lg:w-[calc(100%-352px)]'>
        {/* casino-header — reference: casino-name(+Rules) left, time right */}
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

        {/* tabs — mobile only, NO TV (reference e-cricket) */}
        <ul className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold lg:hidden'>
          <li
            className={`flex w-full cursor-pointer items-center justify-center border-r border-r-[#FFFFFF] p-2 ${showOdds ? 'border-t-2 border-t-[#cccccc]' : ''}`}
            onClick={() => setShowOdds(true)}
          >
            Odds
          </li>
          <li
            className={`flex w-full cursor-pointer items-center justify-center p-2 ${!showOdds ? 'border-t-2 border-t-[#cccccc]' : ''}`}
            onClick={() => setShowOdds(false)}
          >
            Matched Bet
          </li>
        </ul>

        {showOdds ? (
          <>
            {/* ball-by-ball scorecard */}
            <ScorecardBB data={scoreData} />

            {/* casino video (e-cricket virtual stream) */}
            {inplay && liveTvUrl && (
              <div className='casino-video mt-1'>
                <div className='video-box-container v-other'>
                  <div className='casino-video-box'>
                    <iframe
                      src={liveTvUrl}
                      title='E-Cricket Live'
                      allow='autoplay'
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            )}

            {/* back-only markets (market-9/17) */}
            <div className='mt-1 flex flex-wrap gap-1'>
              {markets.map((market) => (
                <div
                  key={`${market.mid || market.mname}`}
                  className='w-full min-w-0 md:w-[calc(50%-4px)]'
                >
                  <CricketMarket
                    market={market}
                    onBetSelect={setSelectedBet}
                    pendingBetAmounts={pendingBetAmounts}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <MatchedBet eventName={eventName} />
        )}
      </div>

      {/* sidebar */}
      <aside className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          <div className='mb-1'>
            <div className='bg-secondary text-secondary p-1'>
              <span className='font-bold'>Place Bet</span>
            </div>
            {renderPlaceBet()}
          </div>
          <div className='bg-secondary text-secondary p-1'>
            <span className='font-bold'>My Bet</span>
          </div>
          <MatchedBet eventName={eventName} />
        </div>
      </aside>

      {/* mobile PlaceBet modal */}
      {selectedBet && (
        <>
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={() => setSelectedBet(null)}
          />
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            {renderPlaceBet(true)}
          </div>
        </>
      )}

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        title={eRules.title}
        html={eRules.html}
      />
    </div>
  );
}

export default ECricketBet;
