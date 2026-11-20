import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getResultBgColor, getResultLabel } from '../constants';

const isGoalGame = (gameId) =>
  ['goal2', 'goal', 'soccer'].includes(String(gameId || '').toLowerCase());

// Matka strip reference me bazaar-name chips ONLY worli3 me hota hy,
// worli & worli2 me round 'R' bubble hota hy
const isMatkaGame = (gameId) => String(gameId || '').toLowerCase() === 'worli3';

const getInitial = (name) => {
  const value = String(name || '').trim();
  return value ? value.charAt(0).toUpperCase() : '-';
};

const RecentResults = memo(function RecentResults({
  gameid,
  currentGameId,
  results = [],
  directResults = [],
  resultDate = null,
  directResultsLoading = false,
  directResultsError = null,
  onItemClick,
}) {
  const goalGame = isGoalGame(gameid);

  const visibleResults = useMemo(() => {
    const direct = Array.isArray(directResults) ? directResults : [];
    const casino =
      currentGameId === gameid && Array.isArray(results) ? results : [];

    // Goal/Goal2 need player-scorer `nat` from direct-result-by-date;
    // all other casinos must prioritize live newest-first WS `results` (`res`)
    // enriched with `direct` metadata by mid so new rounds appear immediately.
    if (goalGame) {
      const casinoByMid = new Map(
        casino.map((item) => [String(item?.mid), item])
      );
      if (!direct.length) return casino;
      return direct.map((item) => ({
        ...item,
        ...(casinoByMid.get(String(item?.mid)) || {}),
        nat: item?.nat,
      }));
    }

    if (casino.length) {
      const directByMid = new Map(
        direct.map((item) => [String(item?.mid), item])
      );
      return casino.map((item) => {
        const d = directByMid.get(String(item?.mid));
        return d ? { ...d, ...item, nat: d.nat || item.nat } : item;
      });
    }

    return direct;
  }, [directResults, results, currentGameId, gameid, goalGame]);

  // Show exactly the latest 10 results on the game screen.
  const items = visibleResults.slice(0, 10);

  return (
    <div className='mb-25 lg:mb-2'>
      <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[15px] font-bold'>
        <span>Last Result</span>
        <Link
          to={
            gameid
              ? `/casino-results?game=${encodeURIComponent(gameid)}`
              : '/casino-results'
          }
          className='text-[13px] font-semibold hover:underline'
        >
          View All
        </Link>
      </div>

      <div className='min-h-[52px] overflow-x-auto bg-white px-1 py-1.5'>
        {isMatkaGame(gameid) && Array.isArray(results) && results.length ? (
          <div className='casino-last-results matka-result flex justify-end gap-1.5'>
            {results.slice(0, 10).map((item, index) => (
              <span
                className='result result-b'
                key={`${item?.mid ?? 'b'}-${index}`}
              >
                {String(item?.win ?? '').trim()}
              </span>
            ))}
          </div>
        ) : directResultsLoading && items.length === 0 ? (
          <div className='py-2 text-center text-xs text-gray-500'>
            Loading results...
          </div>
        ) : directResultsError && items.length === 0 ? (
          <div className='py-2 text-center text-xs text-red-500'>
            Unable to load results
          </div>
        ) : items.length ? (
          <div className='flex w-full justify-end gap-1.5'>
            {items.map((item, index) => {
              const fullName = String(item?.nat || '').trim();
              const label = goalGame
                ? getInitial(fullName)
                : getResultLabel(gameid, String(item?.win ?? ''));

              const colorClass = goalGame
                ? 'bg-[#315d3b] text-[#ffd52a]'
                : getResultBgColor(gameid, String(item?.win ?? ''));

              return (
                <button
                  type='button'
                  onClick={() =>
                    onItemClick?.({
                      ...item,
                      resultDate: item?.resultDate || item?.date || resultDate,
                    })
                  }
                  key={`${item?.mid ?? 'result'}-${index}`}
                  title={
                    goalGame ? fullName || 'No result name' : `Result ${label}`
                  }
                  aria-label={
                    goalGame
                      ? `Result: ${fullName || 'Unknown'}`
                      : `Result ${label}`
                  }
                  className={`!box-border !flex !aspect-square !h-9 !max-h-9 !min-h-9 !w-9 !max-w-9 !min-w-9 !shrink-0 !items-center !justify-center !rounded-full !border-0 !p-0 !text-center !text-sm !leading-none !font-extrabold !uppercase ${colorClass}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className='py-2 text-center text-xs text-gray-500'>
            No results available
          </div>
        )}
      </div>
    </div>
  );
});

export default RecentResults;
