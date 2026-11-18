// import React,{useState, useEffect,useRef} from 'react'
// import { useNavigate, useParams } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { createBet, getPendingBetAmo, messageClear } from '../../redux/reducer/betReducer';
// import { getUser } from '../../redux/reducer/authReducer';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { fetchTannisBatingData } from '../../redux/reducer/tennisSlice';
// import { getPendingBet } from '../../redux/reducer/betReducer';
// import MatchOdds from './MatchOdds'
// import Bookmaker from './Bookmaker'
// import MatchedBet from './MatchedBet'
// import PlaceBet from './PlaceBet'
// import { host } from '../../redux/api';
// function TennisBet() {
//     const {game, id} = useParams()
//     const location = useLocation();
//     const time = location.state?.time;
//     const gameid= id;
//     const match =game;
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [bettingData, setBettingData] = useState(null);
//     const hasCheckedRef = useRef(false);
//     const [showodds, setshowodds] = useState(true)
//     const [selectedBet, setSelectedBet] = useState(null)
//     // Extract team names from match title
//     const matchTitle = "Paarl Royals v Joburg Super Kings"
//     const teams = matchTitle.split(' v ')
//     const team1 = teams[0] || "Team 1"
//     const team2 = teams[1] || "Team 2"
//     console.log(showodds)
//     const { loading, successMessage, errorMessage, pendingBetAmounts } = useSelector(
//         (state) => state.bet
//       );
//     const { battingData } = useSelector((state) => state.tennis);
//     const { userInfo } = useSelector((state) => state.auth);
//     const sharedSocketRef = useRef(null);

//     const handleBetSelect = (betData) => {
//         setSelectedBet(betData)
//     }

//     const handleBetChange = (updatedBet) => {
//         setSelectedBet(updatedBet)
//     }

//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth >= 1024) {
//                 setshowodds(true)
//             }
//         }

//         window.addEventListener('resize', handleResize)
//         return () => window.removeEventListener('resize', handleResize)
//     }, [])

//     useEffect(() => {
//         if (!gameid) return;

//         const sharedSocket = sharedSocketRef.current;
//         if (!sharedSocket || sharedSocket.readyState !== 1) {
//           sharedSocketRef.current = new WebSocket(host);

//           sharedSocketRef.current.onopen = () => {
//             console.log('✅ Socket connected');
//             sharedSocketRef.current.send(
//               JSON.stringify({
//                 type: 'subscribe',
//                 gameid,
//                 apitype: 'tennis',
//                 userId: userInfo?._id,
//               })
//             );
//           };

//           sharedSocketRef.current.onmessage = (event) => {
//             try {
//               const message = JSON.parse(event.data);
//               if (message.gameid === gameid) {
//                 setBettingData(message.data);
//               }
//             } catch (e) {
//               console.error('❌ Message error', e);
//             }
//           };

//           sharedSocketRef.current.onerror = (err) => {
//             console.error('WebSocket error:', err);
//           };

//           sharedSocketRef.current.onclose = () => {
//             console.log('Socket closed');
//           };
//         } else {
//           // Already connected, just send subscription
//           sharedSocketRef.current.send(
//             JSON.stringify({
//               type: 'subscribe',
//               gameid,
//               apitype: 'tennis',
//               userId: userInfo?._id,
//             })
//           );
//         }

//         return () => {
//           // Optionally leave socket open for reuse
//         };
//       }, [gameid, userInfo?._id]);

//       useEffect(() => {
//         if (gameid) {
//           console.log('The gameId is', gameid);
//           dispatch(fetchTannisBatingData(gameid)); // initial
//         }
//       }, [gameid, dispatch]);

//       useEffect(() => {
//         setBettingData(battingData);
//       }, [battingData]);
//       useEffect(() => {
//         dispatch(getPendingBetAmo(gameid));
//       }, [dispatch, gameid]);

//       // Show toast messages for success/error (centralized to prevent duplicates)
//       useEffect(() => {
//         if (successMessage) {
//           toast.success(successMessage);
//           dispatch(messageClear());
//           // Hide PlaceBet component when bet is successfully placed
//           setSelectedBet(null);
//         }
//         if (errorMessage) {
//           toast.error(errorMessage);
//           dispatch(messageClear());
//         }
//       }, [successMessage, errorMessage, dispatch]);

//       const matchOddsList = Array.isArray(bettingData)
//         ? bettingData.filter((item) => item.mname === 'MATCH_ODDS')
//         : [];

//       console.log('this is matchOddsList', matchOddsList);

//       console.log('bettingData', bettingData);

//     //   const oddsData =
//     //     Array.isArray(matchOddsList) &&
//     //     matchOddsList.length > 0 &&
//     //     matchOddsList[0].section
//     //       ? matchOddsList[0].section.map((sec) => ({
//     //           team: sec.nat,
//     //           sid: sec.sid,
//     //           odds: sec.odds,
//     //           mname: 'Match Odds', // ✅ Access from first item
//     //           status: matchOddsList[0].status, // ✅ Access from first item
//     //         }))
//     //       : [];
//   return (
//     <div className='flex mt-0.5 gap-px'>
//         <div className='w-full lg:w-[calc(100%-352px)] ml-0 md:ml-1'>
//             <div className='flex justify-between items-center bg-secondary text-secondary text-[12px] lg:text-[15px] font-bold p-1'>
//                 <span>{game}</span>
//                 <span>{time}</span>
//             </div>
//             <div className='flex lg:hidden bg-primary text-primary justify-around items-center  text-[12px] font-bold'>
//                 <div className={`p-2 w-full border-r border-r-[#FFFFFF] flex justify-center items-center ${showodds?"border-t-2 border-t-[#cccccc]":""}`}
//                 onClick={()=>setshowodds(true)}
//                 >ODDS</div>
//                 <div className={`p-2 w-full flex justify-center items-center ${showodds?"":"border-t-2 border-t-[#cccccc]"}`}
//                 onClick={()=>setshowodds(false)}
//                 >MATCHED BET(0)</div>
//             </div>

//             {showodds && (
//                 <div>
//                 {/** Match Odds */}
//                 {matchOddsList.length > 0 && <MatchOdds onBetSelect={handleBetSelect} matchOddsList={matchOddsList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Bookmaker */}
//                 {/* {BookmakerList.length > 0 && <Bookmaker onBetSelect={handleBetSelect} BookmakerList={BookmakerList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>} */}

//                 </div>
//             )}
//             {!showodds && (
//                 <div className='block lg:hidden'>
//                     <MatchedBet gameid={gameid}/>
//                 </div>
//             )}

//         </div>
//         <div className='hidden lg:block  h-fit sticky top-0'>
//             <div className='w-[350px]'>
//                 <div className=''>
//                     <PlaceBet
//                         selectedBet={selectedBet}
//                         onBetChange={handleBetChange}
//                         team1={team1}
//                         team2={team2}
//                         gameId={gameid}
//                         eventName={match}
//                         marketName={selectedBet?.marketName}
//                         gameType={selectedBet?.gameType}
//                         gameName="Tennis Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
//                         fancyScore={selectedBet?.fancyScore}
//                     />
//                 </div>
//                 <div className='bg-secondary text-secondary p-1'>
//                     <span className='font-bold'>My Bet</span>
//                 </div>
//                 <MatchedBet gameid={gameid}/>

//             </div>
//         </div>

//         {/* Mobile PlaceBet Modal */}
//         {selectedBet && (
//             <>
//                 {/* Backdrop */}
//                 <div
//                     className='block lg:hidden fixed inset-0 bg-black/60 bg-opacity-50 z-40'
//                     onClick={() => setSelectedBet(null)}
//                 ></div>
//                 {/* Modal */}
//                 <div className='block lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg max-h-screen overflow-y-auto'>
//                     <PlaceBet
//                         selectedBet={selectedBet}
//                         onBetChange={handleBetChange}
//                         onClose={() => setSelectedBet(null)}
//                         isMobile={true}
//                         team1={team1}
//                         team2={team2}
//                         gameId={gameid}
//                         eventName={match}
//                         marketName={selectedBet?.marketName}
//                         gameType={selectedBet?.gameType}
//                         gameName="Tennis Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
//                         fancyScore={selectedBet?.fancyScore}
//                     />
//                 </div>
//             </>
//         )}

//     </div>
//   )
// }

// export default TennisBet

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
import { fetchTannisBatingData } from '../../redux/reducer/tennisSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getTennisScorecardUrl } from '../../utils/scorecardUrl';
import CricketMarket from './CricketMarket';
import MatchedBet from './MatchedBet';
import MatchOdds from './MatchOdds';
import PlaceBet from './PlaceBet';
function TennisBet() {
  const { id } = useParams();
  const location = useLocation();
  const gameid = id;
  // Name/time/beventId: navigation state first, redux match list as refresh fallback
  const storeMatch = useSelector((state) =>
    state.tennis.matches.find((m) => String(m.id) === String(id))
  );
  const listLoaded = useSelector((state) => state.tennis.matches.length > 0);
  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const match = location.state?.name || storeMatch?.game || 'Live Match';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bettingData, setBettingData] = useState(null);
  const hasCheckedRef = useRef(false);
  const [showodds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const streamGmid = beventId || gameid;
  const liveTvUrl = getLiveTvUrl(3, streamGmid);
  const hasLiveTv = Boolean(storeMatch?.tv && liveTvUrl);
  const scorecardUrl = getTennisScorecardUrl(streamGmid);
  // Extract team names from match title (handles "A v B", "A vs B", "A - B")
  const matchTitle = match;
  const teams = matchTitle.split(/\s+(?:v|vs|-)\s+/i);
  const team1 = teams[0] || 'Team 1';
  const team2 = teams[1] || 'Team 2';
  console.log(showodds);
  const { loading, successMessage, errorMessage, pendingBetAmounts } =
    useSelector((state) => state.bet);
  const { battingData } = useSelector((state) => state.tennis);
  const { userInfo } = useSelector((state) => state.auth);
  const sharedSocketRef = useRef(null);

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
            apitype: 'tennis',
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
      const subscribePayload = JSON.stringify({
        type: 'subscribe',
        gameid,
        apitype: 'tennis',
        userId: userInfo?._id,
      });
      if (sharedSocket.readyState === WebSocket.OPEN) {
        sharedSocket.send(subscribePayload);
      } else if (sharedSocket.readyState === WebSocket.CONNECTING) {
        sharedSocket.addEventListener(
          'open',
          () => {
            if (sharedSocket.readyState === WebSocket.OPEN) {
              sharedSocket.send(subscribePayload);
            }
          },
          { once: true }
        );
      }
    }

    return () => {
      // Optionally leave socket open for reuse
    };
  }, [gameid, userInfo?._id]);

  const [marketFetchFailed, setMarketFetchFailed] = useState(false);

  const [bettingLoaded, setBettingLoaded] = useState(false);

  useEffect(() => {
    if (gameid) {
      setMarketFetchFailed(false);
      setBettingLoaded(false);
      dispatch(fetchTannisBatingData(gameid)) // initial
        .then((res) => {
          if (fetchTannisBatingData.rejected.match(res)) {
            setMarketFetchFailed(true);
          }
        })
        .finally(() => {
          setBettingLoaded(true);
        });
    }
  }, [gameid, dispatch]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);
  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
    dispatch(getPendingBet(gameid));
  }, [dispatch, gameid]);

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

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  // Every market without a dedicated component (Bookmaker, Game Winner,
  // Set Winner, Game To Deuce, ...) renders through the generic renderer,
  // so nothing the provider sends is silently dropped.
  const KNOWN_MARKETS = new Set(['MATCH_ODDS', 'TOURNAMENT_WINNER']);
  const otherMarkets = (Array.isArray(bettingData) ? bettingData : []).filter(
    (market) =>
      !KNOWN_MARKETS.has(market?.mname) &&
      Array.isArray(market?.section) &&
      market.section.length > 0
  );

  //   const oddsData =
  //     Array.isArray(matchOddsList) &&
  //     matchOddsList.length > 0 &&
  //     matchOddsList[0].section
  //       ? matchOddsList[0].section.map((sec) => ({
  //           team: sec.nat,
  //           sid: sec.sid,
  //           odds: sec.odds,
  //           mname: 'Match Odds', // ✅ Access from first item
  //           status: matchOddsList[0].status, // ✅ Access from first item
  //         }))
  //       : [];
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

            {/** All other provider markets (Bookmaker, Game/Set Winner, Deuce...) —
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
                      pendingBetAmounts={pendingBetAmounts}
                    />
                  </div>
                ))}
              </div>
            )}

            {/** Bookmaker */}
            {/* {BookmakerList.length > 0 && <Bookmaker onBetSelect={handleBetSelect} BookmakerList={BookmakerList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>} */}
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
              sid={2}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Tennis Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
              fancyScore={selectedBet?.fancyScore}
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
              sid={2}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Tennis Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
              fancyScore={selectedBet?.fancyScore}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default TennisBet;
