
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCasinoBets } from '../../redux/reducer/casinoBetSlice';

function MatchedBet({ eventName, slug }) {
  const dispatch = useDispatch();

  const {
    myBets = [],
    myBetsLoading,
    myBetsError,
  } = useSelector((state) => state.casinoBet);

  console.log("Slug:", slug);
  console.log("Event Name:", eventName);

  // Fetch casino bets
  useEffect(() => {
    const casinoSlug = slug || eventName;

    if (!casinoSlug) return;



    dispatch(getMyCasinoBets(casinoSlug));
  }, [dispatch, eventName, slug]);

  // Filter bets for current casino
  const filteredBetHistory = useMemo(() => {
    if (!Array.isArray(myBets)) return [];

    return myBets.filter((bet) => {
      const betSlug =
        bet?.slug ||
        bet?.gameSlug ||
        bet?.casinoSlug;

      // If API returns slug, match it
      if (betSlug) {
        return String(betSlug) === String(slug || eventName);
      }

      // If API already returns bets for requested slug,
      // don't filter using unrelated eventName.
      return true;
    });
  }, [myBets, eventName, slug]);

  const getMatchedBetLabel = (item) => {
    if (!item) return 'N/A';

    if (item.gameType === 'oddeven') {
      const market = item.marketName || '';
      const team = item.teamName || '';

      return [market, team].filter(Boolean).join(' / ') || 'N/A';
    }

    return (
      item.teamName ||
      item.marketName ||
      item.selection ||
      'N/A'
    );
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null || num === '') {
      return '0';
    }

    const numValue =
      typeof num === 'string' ? parseFloat(num) : Number(num);

    if (Number.isNaN(numValue)) return '0';

    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="bg-[#f7f7f7]">
      {/* Table Headers */}
      <div className="grid grid-cols-4 border-b border-gray-300 bg-white">
        <div className="col-span-2 flex h-8 items-center px-2 py-1 text-left text-sm font-semibold">
          Matched Bet
        </div>

        <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold">
          Odds
        </div>

        <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold">
          Stake
        </div>
      </div>

      {/* Loading */}
      {myBetsLoading && filteredBetHistory.length === 0 ? (
        <div className="flex h-8 items-center justify-center bg-white text-xs text-gray-500">
          Loading...
        </div>
      ) : myBetsError ? (
        <div className="flex h-8 items-center justify-center bg-white text-xs text-red-500">
          {typeof myBetsError === 'string'
            ? myBetsError
            : 'Unable to load bets'}
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
            <div className="col-span-2 flex h-8 items-center truncate px-2 py-1 text-left text-sm font-semibold text-gray-800">
              {getMatchedBetLabel(item)}
              {item?.fancyScore ? `/${item?.xValue}` : ''}
            </div>

            <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800">
              {item?.odds || item?.price || item?.fancyScore || item?.xValue || '0'}
            </div>

            <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800">
              {formatNumber(
                item?.stake ??
                item?.amount ??
                item?.betAmount ??
                0
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="flex h-8 items-center justify-center bg-white px-2 py-1 text-sm text-gray-500">
          No Matched Bets
        </div>
      )}
    </div>
  );
}

export default MatchedBet;
