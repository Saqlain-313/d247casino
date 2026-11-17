// Reference suspension logic (d247-refrences/refrence.js): a market is
// suspended ONLY by its gscode (`1 != market.gscode` -> suspended-table), and a
// runner only when the market is active but the runner is not
// (`1 == market.gscode && 1 != runner.gscode` -> suspended-row). The
// status/gstatus STRINGS are only the overlay text (data-title), never the
// suspension trigger — a market can carry status:"SUSPENDED" while gscode=1 and
// runners ACTIVE (seen live on a Bookmaker market), which must render ACTIVE.
export const isMarketSuspended = (market) => Number(market?.gscode) !== 1;

export const isRunnerSuspended = (market, runner) =>
  Number(market?.gscode) === 1 && Number(runner?.gscode) !== 1;

// Overlay text: prefer the runner/market status string like reference
// data-title, fall back to SUSPENDED.
export const runnerSuspensionText = (runner) =>
  runner?.gstatus || runner?.status || 'SUSPENDED';

export const marketSuspensionText = (market) =>
  market?.status || market?.gstatus || 'SUSPENDED';
