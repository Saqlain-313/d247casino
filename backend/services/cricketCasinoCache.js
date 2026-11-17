import { fetchCricketCasino } from './matchApi/index.js';

// Cricket-casino (cricketv) live feed cache — reference cricketvdata2 har 500ms
// (live) / 1s (idle) poll hota hy. Shared in-flight dedupe taaki provider load
// per gmid rahe, users/polls ke hisab se nahi. casinoTableCache jaisa pattern.
const cache = new Map(); // gmid -> { at, value }
const inflight = new Map(); // gmid -> Promise
const failures = new Map(); // gmid -> { at, error }

const MAX_STALE_ON_ERROR_MS = 1500;
const FAILURE_BACKOFF_MS = 2000;
const MAX_TRACKED = 500;

export const getCricketCasino = (gmid, maxAgeMs = 500) => {
  const id = String(gmid ?? '').trim();
  if (!/^\d{1,20}$/.test(id)) {
    return Promise.reject(new Error('Invalid cricket gmid'));
  }

  const cached = cache.get(id);
  if (cached && Date.now() - cached.at <= maxAgeMs) {
    return Promise.resolve(cached.value);
  }

  const failed = failures.get(id);
  if (failed && Date.now() - failed.at < FAILURE_BACKOFF_MS) {
    return cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS
      ? Promise.resolve(cached.value)
      : Promise.reject(failed.error);
  }

  let pending = inflight.get(id);
  if (!pending) {
    pending = fetchCricketCasino(id)
      .then((value) => {
        failures.delete(id);
        if (value?.success) {
          if (cache.size >= MAX_TRACKED) cache.clear();
          cache.set(id, { at: Date.now(), value });
        }
        return value;
      })
      .catch((error) => {
        if (failures.size >= MAX_TRACKED) failures.clear();
        failures.set(id, { at: Date.now(), error });
        if (cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS) {
          return cached.value;
        }
        throw error;
      })
      .finally(() => inflight.delete(id));
    inflight.set(id, pending);
  }
  return pending;
};
