import { useEffect, useState } from 'react';
import { FaHorse, FaTv } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUser } from '../../redux/reducer/authReducer';
import {
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import {
  fetchHorseRacingBettingData,
  setHorseRacingBettingData,
} from '../../redux/reducer/horseRacingSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { host } from '../../redux/api';
import HorseRacingMarkets from './HorseRacingMarkets';
import MatchedBet from './MatchedBet';
import PlaceBet from './PlaceBet';

function HourseRacingBet() {
  const { id: gameid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const time = location.state?.time;
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const venue = location.state?.name || 'Horse Racing';
  const liveTvUrl = getLiveTvUrl(10, gameid);
  // Horse races me tv flag nahi hota; live (iplay) races pe stream gate karo.
  const hasLiveTv = Boolean(location.state?.iplay && liveTvUrl);
  const dispatch = useDispatch();
  const [showOdds, setShowOdds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const {
    bettingData: storedBettingData,
    bettingLoading,
    bettingLoaded,
    bettingError,
    bettingGameId,
  } = useSelector((state) => state.horseRacing);
  const { pendingBetAmounts, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { userInfo } = useSelector((state) => state.auth);
  const horseRacingDataMatchesRoute = String(bettingGameId) === String(gameid);
  const bettingData = horseRacingDataMatchesRoute ? storedBettingData : [];
  const isBettingLoaded = horseRacingDataMatchesRoute && bettingLoaded;
  const isBettingLoading = !horseRacingDataMatchesRoute || bettingLoading;
  const bettingDataError = horseRacingDataMatchesRoute ? bettingError : null;
  const hasHorseRacingMarkets =
    Array.isArray(bettingData) &&
    bettingData.some(
      (market) =>
        Array.isArray(market?.section) &&
        market.section.some((runner) => runner && (runner.nat || runner.tname))
    );

  // Initial odds fetch (REST) — sirf ek baar. Live updates WS se aate hy.
  useEffect(() => {
    if (!gameid) return;
    dispatch(fetchHorseRacingBettingData(gameid));
  }, [dispatch, gameid]);

  // Live betting data WebSocket pe (sports jaisa, apitype 'horse-racing').
  // Per-user 1s REST polling hata di — backend shared poller 1s inplay / 10s
  // non-inplay broadcast karta hy, provider load per race rahta hy.
  useEffect(() => {
    if (!gameid) return undefined;
    const socket = new WebSocket(host);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'subscribe',
          gameid,
          apitype: 'horse-racing',
          userId: userInfo?._id,
        })
      );
    };
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.type === 'bettingData' &&
          String(message.gameid) === String(gameid)
        ) {
          dispatch(setHorseRacingBettingData({ gameid, data: message.data }));
        }
      } catch (err) {
        console.error('Horse racing WS parse error:', err);
      }
    };
    return () => socket.close();
  }, [dispatch, gameid, userInfo?._id]);

  useEffect(() => {
    // Dead event: betting data fetch fail (race provider pe nahi) ya markets khali
    if (!bettingDataError && (!isBettingLoaded || hasHorseRacingMarkets)) {
      return undefined;
    }

    const redirectTimer = window.setTimeout(
      () =>
        navigate('/', {
          state: {
            noMarketMessage: 'There are no market available in this game',
          },
        }),
      2500
    );
    return () => window.clearTimeout(redirectTimer);
  }, [isBettingLoaded, bettingDataError, hasHorseRacingMarkets, navigate]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (!gameid) return;
    dispatch(getPendingBetAmo(gameid));
    dispatch(getPendingBet(gameid));
  }, [dispatch, gameid]);

  useEffect(() => {
    let clearSelectedBetTimer;
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      clearSelectedBetTimer = window.setTimeout(() => setSelectedBet(null), 0);
      if (gameid) {
        dispatch(getPendingBetAmo(gameid));
        dispatch(getPendingBet(gameid));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    return () => window.clearTimeout(clearSelectedBetTimer);
  }, [successMessage, errorMessage, dispatch, gameid]);

  const renderPlaceBet = (isMobile = false) => (
    <PlaceBet
      selectedBet={selectedBet}
      onBetChange={setSelectedBet}
      onClose={() => setSelectedBet(null)}
      isMobile={isMobile}
      team1={venue}
      team2='Horse Racing'
      item={null}
      gameId={gameid}
      eventName={venue}
      sid={10}
      marketName={selectedBet?.marketName}
      gameType={selectedBet?.gameType}
      gameName='Horse Racing'
      maxAmount={selectedBet?.maxAmount}
      minAmount={selectedBet?.minAmount}
    />
  );

  return (
    <div className='mt-0.5 flex min-w-0 gap-px'>
      <main className='ml-0 w-full min-w-0 md:ml-1 lg:w-[calc(100%-352px)]'>
        <div className='bg-secondary text-secondary flex items-center gap-2 p-2 text-sm font-bold'>
          <FaHorse aria-hidden='true' />
          <span>{venue}</span>
          {time && <span className='ml-auto'>{time}</span>}
        </div>

        <div className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold lg:hidden'>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${
              showOdds && !showLive ? 'border-t-2 border-t-[#cccccc]' : ''
            }`}
            onClick={() => {
              setShowOdds(true);
              setShowLive(false);
            }}
          >
            ODDS
          </div>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${
              !showOdds ? 'border-t-2 border-t-[#cccccc]' : ''
            }`}
            onClick={() => {
              setShowOdds(false);
              setShowLive(false);
            }}
          >
            MATCHED BET
          </div>
          {hasLiveTv && (
            <div
              className={`flex w-full cursor-pointer items-center justify-center p-2 ${
                showLive ? 'border-t-2 border-t-[#cccccc]' : ''
              }`}
              onClick={() => {
                setShowLive(true);
                setShowOdds(true);
              }}
            >
              <FaTv className='text-sm' />
            </div>
          )}
        </div>

        {showLive && hasLiveTv ? (
          <iframe
            src={liveTvUrl}
            title='Horse Racing Live'
            className='w-full'
            style={{ height: '50vh' }}
            allow='autoplay; encrypted-media; picture-in-picture'
            allowFullScreen
            loading='lazy'
          />
        ) : showOdds ? (
          <HorseRacingMarkets
            key={gameid}
            bettingData={bettingData}
            loading={isBettingLoading}
            loaded={isBettingLoaded}
            error={bettingDataError}
            venue={venue}
            time={time}
            onBetSelect={setSelectedBet}
          />
        ) : (
          <MatchedBet eventName={gameid} />
        )}
      </main>
      {hasLiveTv && (
        <div className='mb-1'>
          <div
            className='bg-secondary text-secondary cursor-pointer p-1'
            onClick={() => setshowlivetv((prev) => !prev)}
          >
            <span className='font-bold'>Live Match</span>
          </div>
          {showlivetv && (
            <iframe
              src={liveTvUrl}
              title='Horse Racing Live'
              className='w-full'
              style={{ height: '50vh' }}
              allow='autoplay; encrypted-media; picture-in-picture'
              allowFullScreen
              loading='lazy'
            />
          )}
        </div>
      )}

      <aside className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          <div className='mb-1'>
            <div className='bg-secondary text-secondary flex items-center gap-2 p-1 font-bold'>
              <FaTv aria-hidden='true' />
              <span>Place Bet</span>
            </div>
            {renderPlaceBet()}
          </div>
          <div className='bg-secondary text-secondary p-1 font-bold'>
            My Bet
          </div>
          <MatchedBet eventName={gameid} />
        </div>
      </aside>

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
    </div>
  );
}

export default HourseRacingBet;
