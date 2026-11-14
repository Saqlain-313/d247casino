import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getResultBgColor, getResultLabel } from '../constants';

const isGoalGame = (gameId) =>
  ['goal2', 'goal', 'soccer'].includes(String(gameId || '').toLowerCase());

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
  const visibleResults = useMemo(() => {
    const direct = Array.isArray(directResults) ? directResults : [];
    const casino = Array.isArray(results) ? results : [];

    const casinoByMid = new Map(
      casino.map((item) => [String(item?.mid), item])
    );

    if (!direct.length) return casino;

    return direct.map((item) => ({
      ...item,
      ...(casinoByMid.get(String(item?.mid)) || {}),
      nat: item?.nat,
    }));
  }, [directResults, results]);

  const goalGame = isGoalGame(gameid);
  const legacyResults =
    currentGameId === gameid && Array.isArray(results) ? results : [];

  const allItems =
    goalGame || (Array.isArray(directResults) && directResults.length)
      ? visibleResults
      : legacyResults;

  // Show exactly the latest 10 results on the game screen.
  const items = allItems.slice(0, 10);

  return (
    <div className="mb-25 lg:mb-2">
      <div className="bg-secondary text-secondary flex items-center justify-between p-1 text-[15px] font-bold">
        <span>Last Result</span>
        <Link
          to="/casino-results"
          className="text-[13px] font-semibold hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="min-h-[52px] overflow-x-auto bg-white px-1 py-1.5">
        {directResultsLoading && items.length === 0 ? (
          <div className="py-2 text-center text-xs text-gray-500">
            Loading results...
          </div>
        ) : directResultsError && items.length === 0 ? (
          <div className="py-2 text-center text-xs text-red-500">
            Unable to load results
          </div>
        ) : items.length ? (
          <div className="flex w-full justify-end gap-1.5">
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
                  type="button"
                  onClick={() =>
                    onItemClick?.({
                      ...item,
                      resultDate: item?.resultDate || item?.date || resultDate,
                    })
                  }
                  key={`${item?.mid ?? 'result'}-${index}`}
                  title={goalGame ? (fullName || 'No result name') : `Result ${label}`}
                  aria-label={goalGame ? `Result: ${fullName || 'Unknown'}` : `Result ${label}`}
                  className={`!box-border !flex !h-9 !w-9 !min-h-9 !min-w-9 !max-h-9 !max-w-9 !shrink-0 !aspect-square !items-center !justify-center !rounded-full !border-0 !p-0 !text-center !text-sm !font-extrabold !uppercase !leading-none ${colorClass}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-gray-500">
            No results available
          </div>
        )}
      </div>
    </div>
  );
});

export default RecentResults;
