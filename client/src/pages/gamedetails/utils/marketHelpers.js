import {
  isMarketSuspended,
  isRunnerSuspended,
  marketSuspensionText,
  runnerSuspensionText,
} from '../../../utils/suspension';

const OPEN_STATUS_STRINGS = new Set(['', 'OPEN', 'ACTIVE']);

export function resolveFancyItemSuspension(item) {
  const hasMarketGscode =
    item.marketGscode !== undefined && item.marketGscode !== null;
  const hasRunnerGscode = item.gscode !== undefined && item.gscode !== null;

  const marketDown =
    hasMarketGscode && isMarketSuspended({ gscode: item.marketGscode });
  const runnerDown =
    hasMarketGscode && hasRunnerGscode
      ? isRunnerSuspended(
          { gscode: item.marketGscode },
          { gscode: item.gscode }
        )
      : hasRunnerGscode && Number(item.gscode) !== 1;

  const rawStatus = String(item.gstatus ?? item.status ?? '').trim();
  const statusDown =
    rawStatus !== '' && !OPEN_STATUS_STRINGS.has(rawStatus.toUpperCase());

  const suspended = marketDown || runnerDown || statusDown;
  const label = marketDown
    ? marketSuspensionText({ status: item.marketStatus, gstatus: rawStatus })
    : runnerSuspensionText({ gstatus: rawStatus, status: item.status });

  return { suspended, label };
}

export const BACK_SLOT_BG = [
  'bg-[#72bbef7f]',
  'bg-[#72bbefbf]',
  'bg-[#72bbef]',
];
export const LAY_SLOT_BG = ['bg-[#faa9ba]', 'bg-[#faa9babf]', 'bg-[#faa9ba7f]'];

/**
 * Reference-site market max format: >=1L -> "2.5L", >=1K -> "25K"
 */
export function formatMarketMax(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '-';
  if (n >= 1e5) return `${parseFloat((n / 1e5).toFixed(2))}L`;
  if (n >= 1e3) return `${parseFloat((n / 1e3).toFixed(2))}K`;
  return String(n);
}

/**
 * Format market limit (used in fancy/session headers, e.g. "100", "25K", "1L").
 */
export function formatLimitCompact(val) {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num >= 100000) return `${parseFloat((num / 100000).toFixed(2))}L`;
  if (num >= 1000) return `${parseFloat((num / 1000).toFixed(2))}K`;
  return String(num);
}

/**
 * Shared D247 responsive card width for dynamic `otherMarkets` (Cricket, Football,
 * Tennis, E-Cricket):
 * - 3+3 or 2+2 depth Back+Lay markets (e.g. dtype=4 OVER_UNDER_45/55) -> full width
 *   so runner names never squash vertically.
 * - Compact 1+1, session (dtype 6/7), under/over (dtype 18), and back-only markets ->
 *   50% 2-column grid on desktop, 100% on mobile (never cramped 33%).
 */
export function getMarketWidthClass(market) {
  const runners = Array.isArray(market?.section) ? market.section : [];
  const dtype = Number(market?.dtype);
  const hasLay = runners.some((r) =>
    (r.odds || []).some((o) => o.otype === 'lay' && Number(o.odds) > 0)
  );
  const depth = Math.min(
    3,
    Math.max(
      1,
      ...runners.map((r) => {
        const odds = Array.isArray(r.odds) ? r.odds : [];
        return Math.max(
          odds.filter((o) => o.otype === 'back').length,
          odds.filter((o) => o.otype === 'lay').length
        );
      })
    )
  );
  const isSession = dtype === 6 || dtype === 7;
  const isUnderOver = dtype === 18;
  const isDepthGrid = hasLay && !isSession && !isUnderOver;

  if (dtype === 4 || (isDepthGrid && depth >= 2)) {
    return 'w-full min-w-0';
  }
  return 'w-full min-w-0 md:w-[calc(50%-4px)]';
}

/**
 * Format runner liquidity/size shown below odds (e.g. 522.08 or 1.4k).
 */
export function formatOddsSize(size) {
  if (!size || size === 0) return '0';
  const n = Number(size);
  if (!Number.isFinite(n)) return String(size);
  if (n >= 100000) return `${parseFloat((n / 100000).toFixed(1))}L`;
  if (n >= 1000) return `${parseFloat((n / 1000).toFixed(1))}k`;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Split runner odds into 3 right-aligned back slots (best back on right)
 * and 3 left-aligned lay slots (best lay on left).
 */
export function splitBackLaySlots(odds = []) {
  const backList = (odds || []).filter((o) => o.otype === 'back').slice(-3);
  const backOdds = [null, null, null];
  backList.forEach((o, i) => {
    backOdds[3 - backList.length + i] = o;
  });

  const layList = (odds || []).filter((o) => o.otype === 'lay').slice(0, 3);
  const layOdds = [layList[0] || null, layList[1] || null, layList[2] || null];

  return { backOdds, layOdds };
}

/**
 * Compute aggregate pending bet exposure / P&L for a fancy/session runner.
 */
export function getFancyPendingBetDetails(pendingBets, runnerName) {
  if (!Array.isArray(pendingBets) || !runnerName) {
    return { totalBetAmount: 0, totalPrice: 0, otype: '', hasBets: false };
  }
  const matching = pendingBets.filter((bet) => bet.teamName === runnerName);
  if (matching.length === 0) {
    return { totalBetAmount: 0, totalPrice: 0, otype: '', hasBets: false };
  }
  const totalBetAmount = matching.reduce(
    (sum, bet) => sum + (Number(bet.betAmount) || 0),
    0
  );
  const totalPrice = matching.reduce(
    (sum, bet) => sum + (Number(bet.price) || 0),
    0
  );
  return {
    totalBetAmount,
    totalPrice,
    otype: matching[0]?.otype || '',
    hasBets: true,
  };
}
