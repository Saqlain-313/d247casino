import CasinoResult, {
  CASINO_RESULT_RETENTION_DAYS,
} from '../models/CasinoResult.js';
import CasinoRound from '../models/CasinoRound.js';
import {
  fetchCasinoResult as fetchCasinoResultApi,
  fetchCasinoTables,
  fetchDirectCasinoResultByDate as fetchDirectCasinoResultByDateApi,
} from './matchApi/index.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RETENTION_MS = CASINO_RESULT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const formatLocalYmd = (d = new Date()) => {
  const dt = d instanceof Date ? d : new Date(d);
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getCutoffDate = () => new Date(Date.now() - RETENTION_MS);

export const getCutoffYmd = () => formatLocalYmd(getCutoffDate());

/**
 * Derive YYYY-MM-DD and Date timestamp from provider MID when it embeds YYMMDDHHMMSS
 * (e.g. "102261120071415" -> 2026-11-20 07:14:15), falling back cleanly to explicitDate / now.
 */
export const inferResultMeta = (roundId, explicitDate = null) => {
  const now = new Date();
  const digits = String(roundId ?? '').replace(/\D/g, '');
  let parsedDate = null;
  let parsedYmd = null;

  // Most D247 live/virtual MIDs end with YYMMDDHHMMSS (12 digits)
  if (digits.length >= 12) {
    const tail = digits.slice(-12);
    const yy = Number(tail.slice(0, 2));
    const mm = Number(tail.slice(2, 4));
    const dd = Number(tail.slice(4, 6));
    const hh = Number(tail.slice(6, 8));
    const mi = Number(tail.slice(8, 10));
    const ss = Number(tail.slice(10, 12));
    const fullYear = 2000 + yy;
    if (
      fullYear >= 2020 &&
      fullYear <= now.getFullYear() + 1 &&
      mm >= 1 &&
      mm <= 12 &&
      dd >= 1 &&
      dd <= 31 &&
      hh <= 23 &&
      mi <= 59 &&
      ss <= 59
    ) {
      const candidate = new Date(fullYear, mm - 1, dd, hh, mi, ss);
      if (
        !Number.isNaN(candidate.getTime()) &&
        candidate.getTime() <= now.getTime() + 24 * 60 * 60 * 1000
      ) {
        parsedDate = candidate;
        parsedYmd = formatLocalYmd(candidate);
      }
    }
  }

  const finalYmd =
    explicitDate && DATE_PATTERN.test(explicitDate)
      ? explicitDate
      : parsedYmd || formatLocalYmd(now);

  let resultAt = parsedDate;
  if (!resultAt) {
    if (finalYmd === formatLocalYmd(now)) {
      resultAt = now;
    } else {
      const [y, m, d] = finalYmd.split('-').map(Number);
      // Use end of day local time so rows stay within the 4-day retention window for that date
      resultAt = new Date(y, m - 1, d, 23, 59, 59);
    }
  }

  return { date: finalYmd, resultAt };
};

/**
 * Human-readable fallback winner label when non-dated API only provides numeric `win` code.
 */
export const mapCasinoWinLabel = (slug, item) => {
  if (item?.nat && String(item.nat).trim()) return String(item.nat).trim();
  const s = String(slug || '').toLowerCase();
  const w = String(item?.win ?? '').trim();
  if (!w) return '';

  if (['pdt6', 'dt6', 'vdt6', 'pdt20', 'dt20', 'dt202'].includes(s)) {
    return { 1: 'Dragon', 2: 'Tiger', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (['dtl20', 'vdtl20'].includes(s)) {
    return (
      {
        1: 'Dragon',
        2: 'Tiger',
        3: 'Lion',
        21: 'Dragon',
        22: 'Tiger',
        23: 'Lion',
      }[w] || w
    );
  }
  if (['pbaccarat', 'baccarat', 'baccarat2'].includes(s)) {
    return { 1: 'Player', 2: 'Banker', 3: 'Tie' }[w] || w;
  }
  if (
    [
      'plucky7',
      'lucky7',
      'lucky7eu',
      'lucky7eu2',
      'vlucky7',
      'lucky5',
    ].includes(s)
  ) {
    return { 1: 'Low Card', 2: 'High Card', 0: 'Tie', 3: 'Tie' }[w] || w;
  }
  if (['pcard32', 'card32', 'card32eu'].includes(s)) {
    return (
      { 1: 'Player 8', 2: 'Player 9', 3: 'Player 10', 4: 'Player 11' }[w] || w
    );
  }
  if (['aaa', 'aaa2', 'vaaa'].includes(s)) {
    return { 1: 'Amar', 2: 'Akbar', 3: 'Anthony' }[w] || w;
  }
  if (['btable', 'btable2', 'vbtable'].includes(s)) {
    return (
      {
        1: 'Don',
        2: 'Amar Akbar Anthony',
        3: 'Sahib Bibi Aur Ghulam',
        4: 'Dharam Veer',
        5: 'Kishen Kanhaiya',
        6: 'Ghulam',
      }[w] || w
    );
  }
  if (s === 'teen9') {
    return { 1: 'Tiger', 2: 'Lion', 3: 'Dragon' }[w] || w;
  }
  if (s === 'teen8') {
    return w === '0' ? 'Dealer' : `Player ${w}`;
  }
  if (['teen1', 'teen120'].includes(s)) {
    return { 1: 'Player', 2: 'Dealer', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (s === 'superover') {
    return { 1: 'ENG', 2: 'RSA', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (s === 'superover2') {
    return { 1: 'IND', 2: 'ENG', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (s === 'superover3') {
    return { 1: 'IND', 2: 'AUS', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (s === 'cricketv3') {
    return { 1: 'AUS', 2: 'IND', 3: 'Tie', 0: 'Tie' }[w] || w;
  }
  if (['ab20', 'abj', 'ab3', 'ab4'].includes(s)) {
    return { 1: 'Andar', 2: 'Bahar', 0: 'Tie' }[w] || w;
  }
  if (s === 'queen') {
    return { 1: 'Total 0', 2: 'Total 1', 3: 'Total 2', 4: 'Total 3' }[w] || w;
  }
  if (s === 'race2') {
    return (
      { 1: 'Player A', 2: 'Player B', 3: 'Player C', 4: 'Player D' }[w] || w
    );
  }
  if (s === 'race20') {
    return { 1: 'Spade', 2: 'Heart', 3: 'Club', 4: 'Diamond' }[w] || w;
  }
  if (['roulette11', 'roulette12', 'roulette13', 'ourroullete'].includes(s)) {
    return w;
  }
  if (s === 'cmeter1') {
    return { 1: 'Fighter A', 2: 'Fighter B', 0: 'Tie' }[w] || w;
  }
  if (s === 'dolidana') {
    return { 1: 'Player A', 2: 'Player B', 0: 'Tie' }[w] || w;
  }
  if (s === 'poker6') {
    return w === '0' ? 'Tie' : `Player ${w}`;
  }
  return { 1: 'Player A', 2: 'Player B', 3: 'Tie', 0: 'Tie' }[w] || w;
};

/**
 * Extract flat rows array from any provider dated-result response shape.
 */
export const unwrapDatedRows = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

/**
 * Bulk upsert provider casino result rows into MongoDB `casinoresults`.
 * - Primary (`source: 'dated'`): updates `nat`, `date`, `source: 'dated'`
 * - Fallback (`source: 'live'`): updates `win`, and only fills `nat` / `date` on insert
 *   so rich dated labels (Matka pana, Goal scorer, etc.) are NEVER overwritten.
 * - Drops any entry older than 4 days to prevent trash buildup.
 */
export const saveCasinoResults = async (
  slug,
  rows,
  { source = 'dated', date = null } = {}
) => {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase();
  if (!cleanSlug || !Array.isArray(rows) || rows.length === 0) return 0;

  // worli3 non-dated /result/worli3 only returns 7 static bazaar legends (mid 1..7),
  // never actual round results — only store worli3 from dated results.
  if (cleanSlug === 'worli3' && source === 'live') return 0;

  const cutoffMs = getCutoffDate().getTime();
  const ops = [];
  const seen = new Set();

  for (const row of rows) {
    const roundId = String(row?.mid ?? row?.roundId ?? '').trim();
    if (!roundId || seen.has(roundId)) continue;
    // Skip non-round legend ids on worli3
    if (cleanSlug === 'worli3' && roundId.length < 6) continue;
    seen.add(roundId);

    const { date: rowDate, resultAt } = inferResultMeta(
      roundId,
      source === 'dated' ? date || row?.date : null
    );
    if (resultAt.getTime() < cutoffMs) continue;

    const winStr =
      row?.win !== undefined && row?.win !== null ? String(row.win).trim() : '';
    const rawNat =
      row?.nat !== undefined && row?.nat !== null ? String(row.nat).trim() : '';
    const resolvedNat = rawNat || mapCasinoWinLabel(cleanSlug, row);

    if (source === 'dated') {
      const $set = {
        date: rowDate,
        source: 'dated',
        resultAt,
      };
      if (resolvedNat) $set.nat = resolvedNat;
      if (winStr) $set.win = winStr;
      if (row?.card) $set.card = String(row.card);
      if (row?.rdesc) $set.rdesc = String(row.rdesc);

      ops.push({
        updateOne: {
          filter: { slug: cleanSlug, roundId },
          update: {
            $set,
            $setOnInsert: { slug: cleanSlug, roundId },
          },
          upsert: true,
        },
      });
    } else {
      // Fallback non-dated live row: always save `win`, only populate `nat`/`date` on insert
      const $set = {};
      if (winStr) $set.win = winStr;
      if (row?.card) $set.card = String(row.card);
      if (row?.rdesc) $set.rdesc = String(row.rdesc);

      const $setOnInsert = {
        slug: cleanSlug,
        roundId,
        date: rowDate,
        source: 'live',
        resultAt,
        nat: resolvedNat,
      };

      ops.push({
        updateOne: {
          filter: { slug: cleanSlug, roundId },
          update: Object.keys($set).length
            ? { $set, $setOnInsert }
            : { $setOnInsert },
          upsert: true,
        },
      });
    }
  }

  if (!ops.length) return 0;

  try {
    await CasinoResult.bulkWrite(ops, { ordered: false });
    return ops.length;
  } catch (err) {
    // Duplicate key races during concurrent upserts are harmless with ordered:false
    if (err?.code !== 11000) {
      console.error(
        `[CasinoResultStore] bulkWrite error (${cleanSlug}/${source}):`,
        err.message
      );
    }
    return ops.length;
  }
};

/**
 * Primary = Dated API, Fallback = Non-Dated API, merged with our local 4-day DB.
 * ALWAYS returns a clean array (never throws 404 for empty/unsupported dates).
 */
export const getOrSyncCasinoResultsByDate = async (slug, date) => {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase();
  const todayYmd = formatLocalYmd();
  let usedFallback = false;
  let datedFetched = false;

  // 1. Primary: Dated API
  try {
    const datedResp = await fetchDirectCasinoResultByDateApi(date, cleanSlug);
    const datedRows = unwrapDatedRows(datedResp);
    if (datedRows.length > 0) {
      datedFetched = true;
      await saveCasinoResults(cleanSlug, datedRows, {
        source: 'dated',
        date,
      });
    }
  } catch {
    // Provider may return 404 when no rounds exist yet for that date or slug lacks dated feed
  }

  // 2. Fallback: Non-Dated API (for today, or when dated API returned nothing)
  // For past dates on non-dated games, only ingest live rows whose MID actually matches that date
  // (never stamp today's live rounds onto yesterday's date!).
  if (!datedFetched && cleanSlug !== 'worli3') {
    try {
      const recent = await fetchCasinoResultApi(cleanSlug);
      const liveRows = Array.isArray(recent?.data?.res)
        ? recent.data.res
        : Array.isArray(recent?.res)
          ? recent.res
          : [];
      if (liveRows.length > 0) {
        usedFallback = true;
        await saveCasinoResults(cleanSlug, liveRows, {
          source: 'live',
          date: date === todayYmd ? todayYmd : null,
        });
      }
    } catch {
      // Provider 404 / unavailable — fall back smoothly to whatever is stored in our DB
    }
  }

  // 3. Read merged rows from our DB (strictly within 4-day retention)
  const stored = await CasinoResult.find({
    slug: cleanSlug,
    date,
    resultAt: { $gte: getCutoffDate() },
  })
    .sort({ resultAt: -1, roundId: -1 })
    .lean();

  const data = stored.map((doc) => ({
    mid: doc.roundId,
    roundId: doc.roundId,
    win: doc.win || '',
    nat: doc.nat || mapCasinoWinLabel(cleanSlug, doc),
    date: doc.date,
    source: doc.source,
    card: doc.card || '',
    rdesc: doc.rdesc || '',
    resultAt: doc.resultAt,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    date,
    eventName: cleanSlug,
    apiStatus: 200,
    apiSuccess: true,
    fallback: usedFallback,
    count: data.length,
    data,
  };
};

/**
 * Settlement fallback lookup: returns stored CasinoResult docs for missed roundIds.
 */
export const findStoredResultsForSlug = async (slug, roundIds) => {
  const cleanSlug = String(slug || '')
    .trim()
    .toLowerCase();
  if (!cleanSlug || !Array.isArray(roundIds) || !roundIds.length) return [];

  return CasinoResult.find({
    slug: cleanSlug,
    roundId: { $in: roundIds.map(String) },
    resultAt: { $gte: getCutoffDate() },
  }).lean();
};

/**
 * Explicit 4-day cleanup sweep (in addition to MongoDB TTL index) so both
 * `casinoresults` and `casinorounds` never accumulate old data.
 */
export const cleanupExpiredCasinoResults = async () => {
  const cutoff = getCutoffDate();
  const cutoffYmd = getCutoffYmd();
  try {
    const [resDel, rndDel] = await Promise.all([
      CasinoResult.deleteMany({
        $or: [{ resultAt: { $lt: cutoff } }, { date: { $lt: cutoffYmd } }],
      }),
      CasinoRound.deleteMany({ createdAt: { $lt: cutoff } }),
    ]);
    if (resDel.deletedCount || rndDel.deletedCount) {
      console.log(
        `[CasinoResultStore] 4-day cleanup removed ${resDel.deletedCount} results & ${rndDel.deletedCount} rounds`
      );
    }
  } catch (err) {
    console.error('[CasinoResultStore] cleanup error:', err.message);
  }
};

/**
 * Gentle background archive syncer:
 * - Periodically syncs today's results across all active casino slugs
 *   (Primary: dated API, Fallback: non-dated API) so /casino-results and missed
 *   settlement lookups ALWAYS have complete history for the last 4 days.
 * - Batched (5 slugs at a time with short delay) so provider load stays minimal.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let archiveSyncBusy = false;
export const syncAllCasinoResultsOnce = async () => {
  if (archiveSyncBusy) return;
  archiveSyncBusy = true;
  try {
    const payload = await fetchCasinoTables();
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    const slugs = [
      ...new Set(
        list
          .map((item) =>
            String(item?.eventName || item?.slug || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
    if (!slugs.length) return;

    const today = formatLocalYmd();
    const BATCH_SIZE = 5;

    for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
      const batch = slugs.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (slug) => {
          let gotDated = false;
          try {
            const datedResp = await fetchDirectCasinoResultByDateApi(
              today,
              slug
            );
            const rows = unwrapDatedRows(datedResp);
            if (rows.length > 0) {
              gotDated = true;
              await saveCasinoResults(slug, rows, {
                source: 'dated',
                date: today,
              });
            }
          } catch {
            // Fall through to non-dated fallback
          }

          if (!gotDated && slug !== 'worli3') {
            try {
              const recent = await fetchCasinoResultApi(slug);
              const liveRows = Array.isArray(recent?.data?.res)
                ? recent.data.res
                : Array.isArray(recent?.res)
                  ? recent.res
                  : [];
              if (liveRows.length > 0) {
                await saveCasinoResults(slug, liveRows, {
                  source: 'live',
                  date: today,
                });
              }
            } catch {
              // Ignore transient provider 404/network errors
            }
          }
        })
      );
      if (i + BATCH_SIZE < slugs.length) await sleep(250);
    }
  } catch (err) {
    console.error('[CasinoResultStore] archive sync error:', err.message);
  } finally {
    archiveSyncBusy = false;
  }
};

export const startCasinoResultArchiveSync = ({
  syncIntervalMs = Number(process.env.CASINO_ARCHIVE_SYNC_MS) || 10 * 60 * 1000,
  cleanupIntervalMs = 60 * 60 * 1000,
} = {}) => {
  // Run initial cleanup + delayed initial archive sync so server boot stays instant
  cleanupExpiredCasinoResults().catch(() => {});
  setTimeout(() => {
    syncAllCasinoResultsOnce().catch(() => {});
  }, 15 * 1000);

  const syncTimer = setInterval(() => {
    syncAllCasinoResultsOnce().catch(() => {});
  }, syncIntervalMs);

  const cleanupTimer = setInterval(() => {
    cleanupExpiredCasinoResults().catch(() => {});
  }, cleanupIntervalMs);

  return { syncTimer, cleanupTimer };
};
