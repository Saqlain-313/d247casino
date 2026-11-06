
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBetHistory } from '../../redux/reducer/betReducer';

function MatchedBet({ eventName: eventNameProp, gameid }) {
  const dispatch = useDispatch();

  // Supports both old gameid prop and new eventName prop
  const currentEventName = eventNameProp || gameid;

  const { betHistory = [], loading } = useSelector(
    (state) => state.bet
  );

  useEffect(() => {
    if (!currentEventName) return;

    dispatch(
      getBetHistory({
        eventName: currentEventName,
        page: 1,
        limit: 10,
        selectedVoid: 'unsettel',
      })
    );
  }, [dispatch, currentEventName]);

  // Filter by eventName
  const filteredBetHistory = useMemo(() => {
    if (!Array.isArray(betHistory)) return [];

    return betHistory.filter((bet) => {
      return (
        String(bet?.eventName || '').trim() ===
        String(currentEventName || '').trim()
      );
    });
  }, [betHistory, currentEventName]);

  const getMatchedBetLabel = (item) => {
    if (!item) return 'N/A';

    if (item.gameType === 'oddeven') {
      const market = item.marketName || '';
      const team = item.teamName || '';

      return [market, team].filter(Boolean).join(' / ') || 'N/A';
    }

    return item.teamName || item.marketName || 'N/A';
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

      {/* Table Rows */}
      {loading && filteredBetHistory.length === 0 ? (
        <div className="flex h-8 items-center justify-center bg-white px-2 py-1 text-xs text-gray-500">
          Loading...
        </div>
      ) : filteredBetHistory.length > 0 ? (
        filteredBetHistory.map((item, index) => (
          <div
            key={item?._id || item?.betId || index}
            className={`grid grid-cols-4 border-b border-gray-200 ${
              item?.otype === 'back'
                ? 'bg-[#72bbef]'
                : 'bg-[#faa9ba]'
            }`}
          >
            <div className="col-span-2 flex h-8 items-center truncate px-2 py-1 text-left text-sm font-semibold text-gray-800">
              {getMatchedBetLabel(item)}
              {item?.fancyScore ? `/${item?.xValue}` : ''}
            </div>

            <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800">
              {item?.fancyScore || item?.xValue || '0'}
            </div>

            <div className="flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800">
              {formatNumber(
                item?.otype === 'back'
                  ? item?.price
                  : item?.betAmount
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
