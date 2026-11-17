import { memo, useMemo } from 'react';

// Reference roulette sidebar "Statistics" box (style.css @11564-11583):
// percentages server-side reference me lastresults2 data.g se aate hy; hamare
// provider sirf round history bhejta hy, isliye % yahin compute hote hy.
const RED = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const pct = (count, total) =>
  total > 0 ? ((count / total) * 100).toFixed(2) : '0.00';

function computeStats(rows) {
  const nz = rows
    .map((r) => parseInt(r?.nat, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const total = nz.length;
  const count = (fn) => nz.filter(fn).length;
  const red = count((n) => RED.has(n));
  const odd = count((n) => n % 2 === 1);
  const low = count((n) => n <= 18);
  return {
    C1st12: pct(
      count((n) => n <= 12),
      total
    ),
    C2nd12: pct(
      count((n) => n > 12 && n <= 24),
      total
    ),
    C3rd12: pct(
      count((n) => n > 24),
      total
    ),
    R1st: pct(
      count((n) => n % 3 === 1),
      total
    ),
    R2nd: pct(
      count((n) => n % 3 === 2),
      total
    ),
    R3rd: pct(
      count((n) => n % 3 === 0),
      total
    ),
    Red: pct(red, total),
    Blk: pct(total - red, total),
    Odd: pct(odd, total),
    Evn: pct(total - odd, total),
    T01to18: pct(low, total),
    T19to36: pct(total - low, total),
  };
}

const Cell = ({ label, value }) => (
  <div className='roulette11-table-cell'>
    <span>{label}</span>
    <b>{value}%</b>
  </div>
);

const RouletteStatistics = memo(function RouletteStatistics({ rows }) {
  const stats = useMemo(() => computeStats(rows || []), [rows]);
  if (!rows?.length) return null;

  return (
    <div className='roulette-rules mb-1'>
      <div className='bg-secondary text-secondary p-1'>
        <span className='font-bold'>Statistics</span>
      </div>
      <div className='roulette11-table'>
        <div className='roulette11-table-row'>
          <Cell label='1st12:' value={stats.C1st12} />
          <Cell label='2nd12:' value={stats.C2nd12} />
          <Cell label='3rd12:' value={stats.C3rd12} />
        </div>
        <div className='roulette11-table-row'>
          <Cell label='1-34:' value={stats.R1st} />
          <Cell label='2-35' value={stats.R2nd} />
          <Cell label='3-36' value={stats.R3rd} />
        </div>
        <div className='roulette11-table-row'>
          <Cell label='Red:' value={stats.Red} />
          <Cell label='Black:' value={stats.Blk} />
        </div>
        <div className='roulette11-table-row'>
          <Cell label='Odd:' value={stats.Odd} />
          <Cell label='Even:' value={stats.Evn} />
        </div>
        <div className='roulette11-table-row'>
          <Cell label='1to18:' value={stats.T01to18} />
          <Cell label='19to36:' value={stats.T19to36} />
        </div>
      </div>
    </div>
  );
});

export const ROULETTE_STAT_SLUGS = new Set([
  'roulette11',
  'roulette12',
  'roulette13',
  'ourroullete',
]);

export default RouletteStatistics;
