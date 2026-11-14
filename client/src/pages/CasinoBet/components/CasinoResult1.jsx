import { useMemo } from 'react';
import { getResultLabel, getWinnerMap } from '../constants';

const isGoalGame = (gameId) =>
  ['goal2', 'goal', 'soccer'].includes(String(gameId || '').toLowerCase());

// Provider MID format ends in HHMMSS (e.g. ...145857 => 14:58:57).
const getTimeFromMid = (mid) => {
  const digits = String(mid ?? '').replace(/\D/g, '');
  if (digits.length < 6) return null;

  const time = digits.slice(-6);
  const hours = Number(time.slice(0, 2));
  const minutes = Number(time.slice(2, 4));
  const seconds = Number(time.slice(4, 6));

  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
};

const formatDate = (value) => {
  if (!value) return null;

  // API date is YYYY-MM-DD; format it as DD/MM/YYYY without timezone shifts.
  const raw = String(value).trim();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
};

const formatExplicitDateTime = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(parsed).replace(',', '');
};

const ResultPopup = ({ item, onClose, gameId }) => {
  const goalGame = isGoalGame(gameId);

  const resultLabel = useMemo(() => {
    if (!item) return '—';
    if (goalGame) return item.nat || 'Result';
    return getResultLabel(gameId, String(item.win ?? ''));
  }, [item, gameId, goalGame]);

  if (!item) return null;

  const winnerMap = getWinnerMap(gameId);
  const winner = winnerMap?.[String(item.win)] || resultLabel;
  const roundId = item.mid ?? item.rid ?? '—';
  const resultName = String(item.nat || item.name || item.selection || winner);

  const explicitDateTime =
    item.matchDateTime || item.match_datetime || item.dateTime || item.matchTime || item.match_time;
  const explicitDate =
    item.resultDate || item.date || item.matchDate || item.match_date;
  const dateText = formatDate(explicitDate);
  const timeText =
    item.time && /^\d{1,2}:\d{2}(:\d{2})?$/.test(String(item.time))
      ? String(item.time)
      : getTimeFromMid(roundId);

  const matchDateTime =
    formatExplicitDateTime(explicitDateTime) ||
    [dateText, timeText].filter(Boolean).join(' ') ||
    '—';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${gameId || 'Casino'} result`}
        className="w-full max-w-[760px] overflow-hidden rounded-sm bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between bg-[#0788c9] px-4 py-3 text-white">
          <h2 className="text-xl font-bold">
            {(item.ename || item.cname || gameId || 'Casino').toString()} Result
          </h2>
          
<button
  type="button"
  onClick={onClose}
  aria-label="Close result"
  className="!flex !h-12 !w-12 !shrink-0 !items-center !justify-center !border-0 !bg-transparent !p-0 !text-white hover:!opacity-75"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="!h-9 !w-9"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
</button>

        </header>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm md:text-lg">
            <p>
              <strong>Round Id:</strong> {String(roundId)}
            </p>
            <p>
              <strong>Match Time:</strong> {matchDateTime}
            </p>
          </div>

          {goalGame ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-5 py-8 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#315d3b] text-5xl font-extrabold uppercase text-[#ffd52a]">
                {resultName.trim().charAt(0).toUpperCase() || '-'}
              </div>
              <div>
                <p className="text-xl font-extrabold uppercase text-black md:text-2xl">
                  Goal scored by
                </p>
                <p className="mt-2 text-2xl font-black uppercase text-[#0788c9] md:text-3xl">
                  {resultName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="text-sm font-semibold uppercase text-gray-500">
                Winning Result
              </div>
              <div className="flex h-24 min-w-24 items-center justify-center rounded-full bg-[#315d3b] px-5 text-3xl font-black text-yellow-300">
                {resultLabel}
              </div>
              <p className="text-xl font-bold uppercase">{winner}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 text-center text-xs text-gray-500">
            Result information supplied by the casino result API.
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPopup;
