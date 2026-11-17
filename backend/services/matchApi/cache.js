// Short-TTL shared cache for provider match calls (list + odds).
// Every consumer (REST controllers, the 1s WS poller, bet-time lookups) reads
// through this cache, so concurrent users watching the same sport/match share
// one provider request — provider load depends on live matches, not users.
const cache = new Map(); // key -> { at, value }
const inflight = new Map(); // key -> Promise
const failures = new Map(); // key -> { at, error }

// A failed refresh may fall back to data at most this old (ms). Display-only
// paths tolerate brief staleness; bet validation uses the WS poller's own
// cachedData, so stale fallbacks here never widen betting odds.
const MAX_STALE_ON_ERROR_MS = 5000;
// Failing keys are not re-requested from the provider for this long (ms)
const FAILURE_BACKOFF_MS = 2000;
// Bounds memory if many distinct keys are requested
const MAX_TRACKED_KEYS = 2000;

export const getCached = (key, ttlMs, loader) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at <= ttlMs) {
    return Promise.resolve(cached.value);
  }

  const failed = failures.get(key);
  if (failed && Date.now() - failed.at < FAILURE_BACKOFF_MS) {
    if (cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS) {
      return Promise.resolve(cached.value);
    }
    return Promise.reject(failed.error);
  }

  let pending = inflight.get(key);
  if (!pending) {
    pending = loader()
      .then((value) => {
        failures.delete(key);
        if (cache.size >= MAX_TRACKED_KEYS) cache.clear();
        cache.set(key, { at: Date.now(), value });
        return value;
      })
      .catch((error) => {
        if (failures.size >= MAX_TRACKED_KEYS) failures.clear();
        failures.set(key, { at: Date.now(), error });
        if (cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS) {
          return cached.value;
        }
        throw error;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending;
};
