import React from 'react';

import {
  isMarketSuspended,
  isRunnerSuspended as runnerSuspendedByGscode,
} from '../../utils/suspension';

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number(value) === 0
  ) {
    return '-';
  }
  return value;
};

// Reference-site market max format: >=1L -> "2.5L", >=1K -> "25K"
const formatMarketMax = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '-';
  if (n >= 1e5) return `${parseFloat((n / 1e5).toFixed(2))}L`;
  if (n >= 1e3) return `${parseFloat((n / 1e3).toFixed(2))}K`;
  return String(n);
};

// Reference-site odds depth colors: best odds (tno 0) solid, next 75% alpha,
// outer 50% alpha (.back/.back1/.back2 + .lay/.lay1/.lay2 in reference CSS).
const BACK_COLORS = ['#72bbef', '#72bbefbf', '#72bbef7f'];
const LAY_COLORS = ['#faa9ba', '#faa9babf', '#faa9ba7f'];
const BACK_SOLID = '#72bbef';

const depthLevel = (odd, slot, depth, isBack) => {
  const tno = Number(odd?.tno);
  if (Number.isFinite(tno)) return Math.min(2, Math.max(0, tno));
  // fallback: best odds sit nearest the center (back = rightmost, lay = leftmost)
  return isBack ? depth - 1 - slot : slot;
};

function CricketMarket({ market, onBetSelect }) {
  const runners = Array.isArray(market.section) ? market.section : [];
  const marketName = market.mname || 'Match Odds';
  const marketMax = market.max || market.maxb || 0;
  // Reference: suspension is gscode-only (status string is just overlay text).
  const marketUnavailable = isMarketSuspended(market);
  const isRunnerSuspended = (runner) => runnerSuspendedByGscode(market, runner);

  const hasLay = runners.some((r) =>
    (r.odds || []).some((o) => o.otype === 'lay' && Number(o.odds) > 0)
  );

  // Reference dtype dispatch: 18 -> Under/Over (market-18); 9/10/17 ->
  // back-only (market-9/10/17). When the provider omits dtype, fall back to
  // the data-driven heuristic. Back+lay types still derive their column count
  // from the odds actually present, so we never render filler lay dashes.
  const dtype = Number(market.dtype);
  const hasDtype = Number.isFinite(dtype);
  const BACK_ONLY_DTYPES = new Set([9, 10, 17]);

  // Reference market-18 layout: Under | line | Over (provider gtype 'fancy3')
  const isUnderOver = hasDtype
    ? dtype === 18
    : !hasLay &&
      runners.length === 2 &&
      String(runners[0]?.nat || '').toLowerCase() === 'under' &&
      String(runners[1]?.nat || '').toLowerCase() === 'over';

  // Reference market-9/10/17 layout: back-only bookmaker-style rows
  const isBackOnly =
    (hasDtype && BACK_ONLY_DTYPES.has(dtype)) || (!hasLay && !isUnderOver);

  // Reference-site odds depth: as many columns as the data actually has (cap 3)
  const depth = Math.min(
    3,
    Math.max(
      1,
      ...runners.map((runner) => {
        const odds = Array.isArray(runner.odds) ? runner.odds : [];
        return Math.max(
          odds.filter((o) => o.otype === 'back').length,
          odds.filter((o) => o.otype === 'lay').length
        );
      })
    )
  );

  // Compact odds columns (max 56px, Bookmaker jaisa); naam ka column flexible
  const gridTemplate = `minmax(0,1fr) repeat(${depth}, minmax(0,56px)) repeat(${depth}, minmax(0,56px))`;

  const selectOdds = (runner, odd) => {
    if (!odd || Number(odd.odds) <= 0 || marketUnavailable) return;

    onBetSelect({
      team: runner.nat || runner.tname || `Selection ${runner.sid}`,
      teams: runners.map(
        (item) => item.nat || item.tname || `Selection ${item.sid}`
      ),
      odds: String(odd.odds),
      size: odd.size,
      sid: runner.sid,
      type: odd.otype,
      oname: odd.oname || '',
      tno: odd.tno,
      marketName,
      gameType: 'Match Odds',
      maxAmount: marketMax,
      minAmount: market.min || 0,
    });
  };

  const bestBack = (runner) => {
    const backs = (runner?.odds || []).filter(
      (o) => o.otype === 'back' && Number(o.odds) > 0
    );
    if (!backs.length) return null;
    // Best back = tno 0 (provider back3→back1 order bhejta hai); fallback highest odds
    return backs.reduce((best, o) => {
      const bt = Number(best.tno);
      const ot = Number(o.tno);
      if (Number.isFinite(bt) && Number.isFinite(ot)) {
        return ot < bt ? o : best;
      }
      return Number(o.odds) > Number(best.odds) ? o : best;
    }, backs[0]);
  };

  const titleBar = (
    <div className='text-secondary flex items-center justify-between bg-[#2C3E50D9] p-1'>
      <span className='text-[13px] font-bold lg:text-[15px]'>
        {marketName.replaceAll('_', ' ')}
      </span>
      {!isBackOnly && (
        <span className='text-xs'>Max: {formatMarketMax(marketMax)}</span>
      )}
    </div>
  );

  // ---------------- Under / Over (reference market-18) ----------------
  if (isUnderOver) {
    const under = runners[0];
    const over = runners[1];
    const lineValue = under?.min ?? over?.min ?? 0;
    const ikValue = under?.ik ?? 0;
    const suspended =
      marketUnavailable || isRunnerSuspended(under) || isRunnerSuspended(over);

    const sideBox = (runner, label) => {
      const odd = bestBack(runner);
      return (
        <div className='flex flex-col items-center'>
          <div className='py-1 text-center text-xs font-bold text-[#333]'>
            {label}
          </div>
          <button
            key={`${label}-${odd?.odds ?? 'x'}`}
            type='button'
            disabled={!odd || suspended}
            onClick={() => selectOdds(runner, odd)}
            style={{ backgroundColor: BACK_SOLID }}
            className={`odds-flash flex min-h-[34px] w-20 flex-col items-center justify-center px-1 text-[#333] ${
              odd && !suspended
                ? 'cursor-pointer hover:brightness-95'
                : 'cursor-default'
            }`}
          >
            <span className='text-[15px] leading-tight font-bold'>
              {formatValue(odd?.odds)}
            </span>
            {odd && Number(odd.size) > 0 && (
              <span className='text-[10px]'>{formatValue(odd.size)}</span>
            )}
          </button>
        </div>
      );
    };

    return (
      <section className='mt-1 min-w-0' aria-label={marketName}>
        {titleBar}
        <div className='relative border-b border-gray-300'>
          <div
            className={`flex items-start justify-between gap-1 px-2 py-[2px] ${
              suspended ? 'opacity-40' : ''
            }`}
          >
            {sideBox(under, 'Under')}
            <div className='flex flex-col items-center'>
              <div className='py-1 text-xs'>&nbsp;</div>
              {/* Reference .market-18-item h4: grey card with border + shadow */}
              <h4
                className='m-0 flex flex-col items-center'
                style={{
                  background: '#0000000d',
                  border: '1px solid #00000017',
                  boxShadow: '0 0 3px #0003',
                  minWidth: '80px',
                  padding: '2px 8px',
                  fontSize: '16px',
                  color: '#000',
                }}
              >
                <b className='font-bold'>{lineValue}</b>
                <small className='text-[11px] text-red-600'>{ikValue}</small>
              </h4>
            </div>
            {sideBox(over, 'Over')}
          </div>
          {suspended && (
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <span className='text-[13px] font-bold tracking-wide text-red-600'>
                SUSPENDED
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ---------------- Back-only rows (reference market-9/17) ----------------
  if (isBackOnly) {
    return (
      <section className='mt-1 min-w-0' aria-label={marketName}>
        {titleBar}
        <div className='grid grid-cols-[minmax(0,1fr)_80px] border-b border-gray-300'>
          <div className='flex items-center gap-2 px-1 text-[12px] font-bold text-[#097c93]'>
            <span>Min: {formatMarketMax(runners[0]?.min)}</span>
            <span>Max: {formatMarketMax(runners[0]?.max ?? marketMax)}</span>
          </div>
          <div className='flex items-center justify-center border-l border-white bg-[#72bbef] p-1 text-[13px] font-bold text-[#333]'>
            Back
          </div>
        </div>
        {runners.map((runner, index) => {
          const runnerName =
            runner.nat ||
            runner.tname ||
            `Selection ${runner.sid || index + 1}`;
          const suspended = marketUnavailable || isRunnerSuspended(runner);
          const odd = bestBack(runner);
          return (
            <div
              key={runner.sid || `${runnerName}-${index}`}
              className='grid grid-cols-[minmax(0,1fr)_80px] border-b border-gray-300'
            >
              <div className='flex min-w-0 items-center px-2 py-2 text-xs font-semibold break-words text-[#333] sm:text-sm'>
                {runnerName}
              </div>
              <div className='relative'>
                <button
                  key={`back-${runner.sid}-${odd?.odds ?? 'x'}`}
                  type='button'
                  disabled={!odd || suspended}
                  onClick={() => selectOdds(runner, odd)}
                  style={{ backgroundColor: BACK_SOLID }}
                  className={`odds-flash flex min-h-[38px] w-full flex-col items-center justify-center border-l border-white px-1 text-[#333] ${
                    odd && !suspended
                      ? 'cursor-pointer hover:brightness-95'
                      : 'cursor-default'
                  } ${suspended ? 'opacity-40' : ''}`}
                >
                  <span className='text-[15px] leading-tight font-bold'>
                    {formatValue(odd?.odds)}
                  </span>
                  {odd && Number(odd.size) > 0 && (
                    <span className='text-[10px]'>{formatValue(odd.size)}</span>
                  )}
                </button>
                {suspended && (
                  <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                    <span className='text-[10px] font-bold tracking-wide text-red-600'>
                      SUSPENDED
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  // ---------------- Session markets (reference market-6) ----------------
  // dtype 6 (zd): No = lay1 (pink) first, Yes = back1 (blue) second.
  // dtype 7 (Od): Back = back1 (blue) first, Lay = lay1 (pink) second.
  // Single-depth buttons + per-section Min/Max. Bet payload mirrors the
  // proven Normal session pattern (gameType 'Normal', marketName = nat).
  if (hasDtype && (dtype === 6 || dtype === 7)) {
    const noFirst = dtype === 6;
    const leftLabel = noFirst ? 'No' : 'Back';
    const rightLabel = noFirst ? 'Yes' : 'Lay';
    const leftColor = noFirst ? '#faa9ba' : '#72bbef';
    const rightColor = noFirst ? '#72bbef' : '#faa9ba';
    const leftOtype = noFirst ? 'lay' : 'back';
    const rightOtype = noFirst ? 'back' : 'lay';

    const pickOdd = (runner, otype, oname) => {
      const odds = Array.isArray(runner.odds) ? runner.odds : [];
      return (
        odds.find(
          (o) =>
            String(o.oname || '').toLowerCase() === oname && Number(o.odds) > 0
        ) ||
        odds.find((o) => o.otype === otype && Number(o.odds) > 0) ||
        null
      );
    };

    const selectSession = (runner, odd) => {
      if (!odd || Number(odd.odds) <= 0 || marketUnavailable) return;
      const name = runner.nat || runner.tname || `Selection ${runner.sid}`;
      onBetSelect({
        team: name,
        teams: [name],
        odds: String(odd.odds),
        size: odd.size,
        sid: runner.sid,
        type: odd.otype,
        marketName: name,
        gameType: 'Normal',
        maxAmount: runner.max || 0,
        minAmount: runner.min || 0,
      });
    };

    const sessionBox = (runner, odd, color) => {
      const suspended = marketUnavailable || isRunnerSuspended(runner);
      return (
        <div className='relative'>
          <button
            key={`${runner.sid}-${color}-${odd?.odds ?? 'x'}`}
            type='button'
            disabled={!odd || suspended}
            onClick={() => selectSession(runner, odd)}
            style={{ backgroundColor: color }}
            className={`odds-flash flex min-h-[34px] w-full flex-col items-center justify-center border-l border-white px-1 text-[#333] ${
              odd && !suspended
                ? 'cursor-pointer hover:brightness-95'
                : 'cursor-default'
            } ${suspended ? 'opacity-40' : ''}`}
          >
            <span className='text-[15px] leading-tight font-bold'>
              {formatValue(odd?.odds)}
            </span>
            {odd && Number(odd.size) > 0 && (
              <span className='text-[10px]'>{formatValue(odd.size)}</span>
            )}
          </button>
          {suspended && (
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <span className='text-[10px] font-bold tracking-wide text-red-600'>
                SUSPENDED
              </span>
            </div>
          )}
        </div>
      );
    };

    const sessionGrid =
      'grid grid-cols-[minmax(0,1fr)_60px_60px] border-b border-gray-300 lg:grid-cols-[minmax(0,1fr)_60px_60px_70px]';

    return (
      <section className='mt-1 min-w-0' aria-label={marketName}>
        <div className='text-secondary flex items-center justify-between bg-[#2C3E50D9] p-1'>
          <span className='text-[13px] font-bold lg:text-[15px]'>
            {marketName.replaceAll('_', ' ')}
          </span>
        </div>
        <div
          className={`${sessionGrid} text-center text-xs font-bold text-[#333]`}
        >
          <div />
          <div className='p-1' style={{ backgroundColor: leftColor }}>
            {leftLabel}
          </div>
          <div className='p-1' style={{ backgroundColor: rightColor }}>
            {rightLabel}
          </div>
          <div className='hidden lg:block' />
        </div>
        {runners.map((runner, index) => {
          const runnerName =
            runner.nat ||
            runner.tname ||
            `Selection ${runner.sid || index + 1}`;
          const leftOdd = pickOdd(runner, leftOtype, `${leftOtype}1`);
          const rightOdd = pickOdd(runner, rightOtype, `${rightOtype}1`);
          return (
            <div
              key={runner.sid || `${runnerName}-${index}`}
              className={sessionGrid}
            >
              <div className='flex min-w-0 items-center px-2 py-2 text-xs font-semibold break-words text-[#333] sm:text-sm'>
                {runnerName}
              </div>
              {sessionBox(runner, leftOdd, leftColor)}
              {sessionBox(runner, rightOdd, rightColor)}
              <div className='hidden flex-col items-center justify-center lg:flex'>
                <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                  Min:{formatMarketMax(runner.min)}
                </span>
                <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                  Max:{formatMarketMax(runner.max)}
                </span>
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  // ---------------- Back + Lay depth grid (reference market-1) ----------------
  const renderOddButton = (runner, odd, type, slot) => {
    const colors = type === 'back' ? BACK_COLORS : LAY_COLORS;
    return (
      <button
        key={`${type}-${runner.sid}-${slot}-${odd?.odds ?? 'x'}`}
        type='button'
        disabled={!odd || Number(odd.odds) <= 0 || marketUnavailable}
        onClick={() => selectOdds(runner, odd)}
        style={{
          backgroundColor:
            colors[depthLevel(odd, slot, depth, type === 'back')],
        }}
        className={`odds-flash flex min-h-[38px] flex-col items-center justify-center border-l border-white px-1 text-[#333] ${
          odd && Number(odd.odds) > 0 && !marketUnavailable
            ? 'cursor-pointer hover:brightness-95'
            : 'cursor-default'
        }`}
      >
        <span className='text-[15px] leading-tight font-bold'>
          {formatValue(odd?.odds)}
        </span>
        {odd && Number(odd.size) > 0 && (
          <span className='text-[10px]'>{formatValue(odd.size)}</span>
        )}
      </button>
    );
  };

  return (
    <section className='mt-1 min-w-0' aria-label={marketName}>
      {titleBar}
      <div
        className='grid border-b border-gray-300 text-center text-xs font-bold text-[#333]'
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div />
        {/* Bookmaker jaisa: Back/Lay single column best odds ke upar */}
        {Array.from({ length: depth - 1 }, (_, i) => (
          <div key={`hb-${i}`} />
        ))}
        <div className='bg-[#72bbef] p-1'>Back</div>
        <div className='bg-[#faa9ba] p-1'>Lay</div>
        {Array.from({ length: depth - 1 }, (_, i) => (
          <div key={`hl-${i}`} />
        ))}
      </div>

      {runners.map((runner, index) => {
        const runnerName =
          runner.nat || runner.tname || `Selection ${runner.sid || index + 1}`;
        const suspended = marketUnavailable || isRunnerSuspended(runner);
        const odds = Array.isArray(runner.odds) ? runner.odds : [];
        const backOdds = odds
          .filter((odd) => odd.otype === 'back')
          .slice(0, depth);
        const layOdds = odds
          .filter((odd) => odd.otype === 'lay')
          .slice(0, depth);

        return (
          <div
            key={runner.sid || `${runnerName}-${index}`}
            className='grid border-b border-gray-300'
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className='flex min-w-0 items-center px-2 py-2 text-xs font-semibold text-[#333] sm:text-sm'>
              <span className='break-words'>{runnerName}</span>
            </div>
            {suspended ? (
              // Reference style: dimmed odds with a red SUSPENDED overlay
              <div
                className='relative'
                style={{ gridColumn: `2 / span ${depth * 2}` }}
              >
                <div
                  className='grid opacity-40'
                  style={{
                    gridTemplateColumns: `repeat(${depth * 2}, minmax(0,1fr))`,
                  }}
                >
                  {Array.from({ length: depth * 2 }, (_, i) => {
                    const isBack = i < depth;
                    const slot = isBack ? i : i - depth;
                    const odd = isBack ? backOdds[slot] : layOdds[slot];
                    const colors = isBack ? BACK_COLORS : LAY_COLORS;
                    return (
                      <div
                        key={`s-${i}`}
                        style={{
                          backgroundColor:
                            colors[depthLevel(odd, slot, depth, isBack)],
                        }}
                        className='flex min-h-[38px] flex-col items-center justify-center border-l border-white px-1 text-[#333]'
                      >
                        <span className='text-[15px] leading-tight font-bold'>
                          {formatValue(odd?.odds)}
                        </span>
                        {odd && Number(odd.size) > 0 && (
                          <span className='text-[10px]'>
                            {formatValue(odd.size)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                  <span className='text-[13px] font-bold tracking-wide text-red-600'>
                    SUSPENDED
                  </span>
                </div>
              </div>
            ) : (
              <>
                {Array.from({ length: depth }, (_, slot) =>
                  renderOddButton(runner, backOdds[slot], 'back', slot)
                )}
                {Array.from({ length: depth }, (_, slot) =>
                  renderOddButton(runner, layOdds[slot], 'lay', slot)
                )}
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default CricketMarket;
