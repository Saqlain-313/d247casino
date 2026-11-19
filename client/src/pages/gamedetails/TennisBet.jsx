import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { useSportEventSocket } from '../../hooks/useSportEventSocket';
import {
  fetchTannisBatingData,
  fetchTennisData,
} from '../../redux/reducer/tennisSlice';
import { getLiveTvUrl } from '../../utils/liveTvUrl';
import { getTennisScorecardUrl } from '../../utils/scorecardUrl';
import CricketMarket from './CricketMarket';
import MatchOdds from './MatchOdds';
import SportDetailLayout from './components/SportDetailLayout';
import { getMarketWidthClass } from './utils/marketHelpers';
import {
  parseMatchTeams,
  useSportBettingLifecycle,
} from './hooks/useSportBettingLifecycle';

const KNOWN_MARKETS = new Set(['MATCH_ODDS', 'TOURNAMENT_WINNER']);

function TennisBet() {
  const { id: gameid } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const storeMatch = useSelector((state) =>
    state.tennis.matches.find((m) => String(m.id) === String(gameid))
  );
  const listLoaded = useSelector((state) => state.tennis.matches.length > 0);
  const { battingData } = useSelector((state) => state.tennis);
  const { userInfo } = useSelector((state) => state.auth);

  const time = location.state?.time || storeMatch?.time;
  const beventId = location.state?.beventId || storeMatch?.beventId;
  const match = location.state?.name || storeMatch?.game || 'Live Match';
  const streamGmid = beventId || gameid;
  const liveTvUrl = getLiveTvUrl(2, streamGmid);
  const hasLiveTv = Boolean(storeMatch?.tv && liveTvUrl);
  const scorecardUrl = getTennisScorecardUrl(streamGmid);
  const { team1, team2 } = parseMatchTeams(match);

  const [bettingData, setBettingData] = useState(null);
  const [marketFetchFailed, setMarketFetchFailed] = useState(false);
  const [bettingLoaded, setBettingLoaded] = useState(false);

  useSportEventSocket({
    enabled: Boolean(gameid),
    subscribePayload: gameid
      ? { type: 'subscribe', gameid, apitype: 'tennis', userId: userInfo?._id }
      : null,
    onMessage: (message) => {
      if (message.gameid === gameid) {
        setBettingData(message.data);
      }
    },
  });

  useEffect(() => {
    if (!storeMatch && !listLoaded) {
      dispatch(fetchTennisData());
    }
  }, [dispatch, storeMatch, listLoaded]);

  useEffect(() => {
    if (!gameid) return;
    setMarketFetchFailed(false);
    setBettingLoaded(false);
    dispatch(fetchTannisBatingData(gameid))
      .then((res) => {
        if (fetchTannisBatingData.rejected.match(res)) {
          setMarketFetchFailed(true);
        }
      })
      .finally(() => {
        setBettingLoaded(true);
      });
  }, [gameid, dispatch]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  const lifecycle = useSportBettingLifecycle({
    gameId: gameid,
    bettingData,
    battingData,
    listLoaded,
    storeMatch,
    marketFetchFailed,
    bettingLoaded,
  });

  const safeData = Array.isArray(bettingData) ? bettingData : [];
  const matchOddsList = safeData.filter(
    (item) =>
      item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
  );
  const otherMarkets = safeData.filter(
    (market) =>
      !KNOWN_MARKETS.has(market?.mname) &&
      Array.isArray(market?.section) &&
      market.section.length > 0
  );

  const placeBetProps = {
    onBetChange: lifecycle.handleBetChange,
    team1,
    team2,
    gameId: gameid,
    eventName: match,
    sid: 2,
    marketName: lifecycle.selectedBet?.marketName,
    gameType: lifecycle.selectedBet?.gameType,
    gameName: 'Tennis Game',
    maxAmount: lifecycle.selectedBet?.maxAmount,
    minAmount: lifecycle.selectedBet?.minAmount,
    fancyScore: lifecycle.selectedBet?.fancyScore,
  };

  return (
    <SportDetailLayout
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
      matchedBetEventKey={gameid}
      selectedBet={lifecycle.selectedBet}
      onCloseBet={() => lifecycle.setSelectedBet(null)}
      placeBetProps={placeBetProps}
      scorecardSlot={
        scorecardUrl ? (
          <iframe
            src={scorecardUrl}
            allowFullScreen
            className='w-full border-0 bg-black'
            style={{ height: '165px' }}
            title='Live Score'
            allow='autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope'
          />
        ) : null
      }
    >
      {matchOddsList.length > 0 && (
        <MatchOdds
          gameid={gameid}
          onBetSelect={lifecycle.handleBetSelect}
          matchOddsList={matchOddsList}
          pendingBetAmounts={lifecycle.pendingBetAmounts}
          selectedBet={lifecycle.selectedBet}
        />
      )}

      {otherMarkets.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-1'>
          {otherMarkets.map((market) => (
            <div
              key={`${market.gmid || gameid}-${market.mid || market.mname}`}
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

export default TennisBet;
