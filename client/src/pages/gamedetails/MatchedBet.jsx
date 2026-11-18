import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingBet } from '../../redux/reducer/betReducer';
import { getMyCasinoBets } from '../../redux/reducer/casinoBetSlice';

function MatchedBet({ eventName, slug, fetchBets = true }) {
  const dispatch = useDispatch();
  const isCasino = Boolean(slug);

  const {
    myBets = [],
    myBetsLoading,
    myBetsError,
  } = useSelector((state) => state.casinoBet);
  const { eventName: sportsPendingBets = [], loading: sportsLoading } =
    useSelector((state) => state.bet);

  useEffect(() => {
    if (!fetchBets) return;
    if (isCasino) {
      dispatch(getMyCasinoBets(slug));
    } else if (eventName) {
      dispatch(getPendingBet(eventName));
    }
  }, [dispatch, isCasino, slug, eventName, fetchBets]);

  const filteredBetHistory = useMemo(() => {
    if (isCasino) {
      if (!Array.isArray(myBets)) return [];
      return myBets.filter((bet) => {
        const betSlug = bet?.slug || bet?.gameSlug || bet?.casinoSlug;
        return betSlug ? String(betSlug) === String(slug) : true;
      });
    }
    if (!Array.isArray(sportsPendingBets)) return [];
    if (!eventName) return sportsPendingBets;
    return sportsPendingBets.filter(
      (bet) =>
        !bet?.gameId ||
        String(bet.gameId) === String(eventName) ||
        String(bet.eventName || '') === String(eventName)
    );
  }, [isCasino, myBets, slug, sportsPendingBets, eventName]);

  const loading = isCasino ? myBetsLoading : sportsLoading;
  const loadError = isCasino ? myBetsError : null;

  const getMatchedBetLabel = (item) => {
    if (!item) return 'N/A';

    if (item.gameType === 'oddeven') {
      return (
        [item.marketName, item.teamName].filter(Boolean).join(' / ') || 'N/A'
      );
    }

    return item.teamName || item.marketName || item.selection || 'N/A';
  };

  const formatNumber = (num) => {
    const value = Number(num ?? 0);

    return Number.isFinite(value)
      ? value.toLocaleString('en-US', {
          maximumFractionDigits: 0,
        })
      : '0';
  };

  return (
    <div className='bg-[#f7f7f7]'>
      <div className='grid grid-cols-4 border-b border-gray-300 bg-white'>
        <div className='col-span-2 flex h-8 items-center px-2 text-sm font-semibold'>
          Matched Bet
        </div>
        <div className='flex h-8 items-center px-2 text-sm font-semibold'>
          Odds
        </div>
        <div className='flex h-8 items-center px-2 text-sm font-semibold'>
          Stake
        </div>
      </div>

      {loading && filteredBetHistory.length === 0 ? (
        <div className='bg-white p-2 text-center text-xs'>Loading...</div>
      ) : loadError ? (
        <div className='bg-white p-2 text-center text-xs text-red-500'>
          Unable to load bets
        </div>
      ) : filteredBetHistory.length > 0 ? (
        filteredBetHistory.map((item, index) => (
          <div
            key={item?._id || item?.betId || index}
            className={`grid grid-cols-4 border-b border-gray-200 ${
              item?.side === 'back' || item?.otype === 'back'
                ? 'bg-[#72bbef]'
                : 'bg-[#faa9ba]'
            }`}
          >
            <div className='col-span-2 flex h-8 items-center truncate px-2 text-sm font-semibold'>
              {getMatchedBetLabel(item)}
              {item?.fancyScore ? `/${item?.xValue}` : ''}
            </div>

            <div className='flex h-8 items-center px-2 text-sm font-semibold'>
              {item?.odds ||
                item?.price ||
                item?.fancyScore ||
                item?.xValue ||
                '0'}
            </div>

            <div className='flex h-8 items-center px-2 text-sm font-semibold'>
              {formatNumber(
                item?.stake ?? item?.amount ?? item?.betAmount ?? 0
              )}
            </div>
          </div>
        ))
      ) : (
        <div className='bg-white p-2 text-center text-sm text-gray-500'>
          No Matched Bets
        </div>
      )}
    </div>
  );
}

export default MatchedBet;
