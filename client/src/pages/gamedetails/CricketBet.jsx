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
  messageClear
} from '../../redux/reducer/betReducer';
import { fetchCricketBatingData } from '../../redux/reducer/cricketSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getCricketScorecardUrl } from '../../utils/scorecardUrl';
import Bookmaker from './Bookmaker';
import CricketMarket from './CricketMarket';
import Fancy1 from './Fancy1';
import Khado from './Khado';
import LiveScoreCard from './LiveScoreCard';
import MatchedBet from './MatchedBet';
import MatchOdds from './MatchOdds';
import Normal from './Normal';
import OddEven from './OddEven';
import PlaceBet from './PlaceBet';
import TiedMatch from './TiedMatch';

function CricketBet() {
  const { game, id } = useParams();
  const location = useLocation();
  const time = location.state?.time;
  const beventId = location.state?.beventId;
  const eventName = id;
  const match = game;
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
    gameId: streamGmid,          // ✅ FIX: gameId add kiya
    game: eventName,
    sid: 4,
    otype: '',
    price: null,
    xValue: '',
    gameType: '',
    gameName: 'Cricket Game',
    teamName: '',
  });

  console.log('eventName', eventName);
  console.log('streamGmid (gameId)', streamGmid);

  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [item, setitem] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const liveTvUrl = getLiveTvUrl(4, streamGmid);
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

  const matchTitle = decodeURIComponent(game || 'Team 1 v Team 2');
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
    if (eventName) {
      setLoader(true);
      dispatch(fetchCricketBatingData(eventName)).finally(() => {
        setLoader(false);
      });
    }
  }, [dispatch, eventName]);

  useEffect(() => {
    if (!eventName) return;
    const socket = new WebSocket(host);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'subscribe',
          eventName,
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
        if (message.eventName === eventName) {
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
    let intervalId;

    if (eventName) {
      setLoader(true);
      const fetchData = async () => {
        await dispatch(fetchCricketBatingData(eventName));
        setLoader(false);
      };
      fetchData();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [eventName, dispatch]);

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

  console.log('bettting data111', bettingData);

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

  console.log('khadoData from cricketbet', khadoData);

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

  console.log('oddEvenData from cricketbet', oddEvenData);

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

  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='ml-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[12px] font-bold lg:text-[15px]'>
          <span>{game}</span>
          <span>{time}</span>
        </div>
        <div className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold'>
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
          <div
            className={`flex w-full cursor-pointer items-center justify-center p-2`}
            onClick={() => {
              setShowLive(true);
              setshowodds(true);
            }}
          >
            <FaTv className='text-sm' />
          </div>
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

            {/** Normal */}
            {NormalData.length > 0 && (
              <Normal
                onBetSelect={handleBetSelect}
                NormalData={NormalData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Fancy1  */}
            {fancy1Data.length > 0 && (
              <Fancy1
                onBetSelect={handleBetSelect}
                fancy1Data={fancy1Data}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Khado */}
            {khadoData.length > 0 && (
              <Khado
                onBetSelect={handleBetSelect}
                khadoData={khadoData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** OddEven */}
            {oddEvenData.length > 0 && (
              <OddEven
                onBetSelect={handleBetSelect}
                oddEvenData={oddEvenData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {otherMarkets.map((market) => (
              <CricketMarket
                key={`${market.gmid || eventName}-${market.mid || market.mname}`}
                market={market}
                onBetSelect={handleBetSelect}
              />
            ))}
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
              gameId={streamGmid}              // ✅ FIX: gameId pass
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
              gameId={streamGmid}            // ✅ FIX: gameId pass
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
    </div>
  );
}

export default CricketBet;