import { fetchCasinoData } from './matchApi/index.js';

// Superover/cricketv3 family provider payloads {t1,t2} shape me ate hy (sub
// nahi): t2 = market groups (section[] with odds[]), t1 = round meta (card,
// lt, gmid...). REST + WS dono consumers ke liye yahin normalize karte hy:
// sections -> flat `sub` (b/l from odds array) + top-level card/lt/mid.
const normalizeCasinoPayload = (value) => {
  const d = value?.data;
  if (!d || typeof d !== 'object' || Array.isArray(d.sub)) return value;
  if (!Array.isArray(d.t2) && !d.t1) return value;
  const t1 = d.t1 || {};
  const groups = Array.isArray(d.t2) ? d.t2 : [];
  const sub = groups.flatMap((m) =>
    (Array.isArray(m.section) ? m.section : []).map((s) => {
      const odds = Array.isArray(s.odds) ? s.odds : [];
      const back = odds.find((o) => o.otype === 'back');
      const lay = odds.find((o) => o.otype === 'lay');
      return {
        sid: s.sid,
        nat: s.nat,
        gstatus: s.gstatus,
        gscode: s.gscode ?? m.gscode,
        b: back?.odds ?? 0,
        l: lay?.odds ?? 0,
        bs: back?.size ?? 0,
        ls: lay?.size ?? 0,
        min: s.min || m.min || 0,
        max: s.max || m.max || 0,
        mname: m.mname,
        dtype: m.dtype,
        visible: m.visible,
      };
    })
  );
  return {
    ...value,
    data: {
      ...d,
      sub,
      mgroups: groups,
      card: d.card ?? t1.card,
      lt: d.lt ?? t1.lt,
      ft: d.ft ?? t1.ft,
      mid: d.mid ?? t1.gmid,
      ename: d.ename ?? t1.ename,
      gtype: d.gtype ?? t1.gtype,
      iplay: d.iplay ?? t1.iplay,
      remark: d.remark ?? '',
    },
  };
};

// Every consumer of a casino table (bet validation, the 1s WebSocket poller and the
// REST endpoint) reads through this cache. Concurrent callers for the same table share
// one in-flight provider request, so provider load depends on the number of live
// tables, never on the number of users or bets.
const cache = new Map(); // eventName -> { at, value }
const inflight = new Map(); // eventName -> Promise
const failures = new Map(); // eventName -> { at, error }

// A failed refresh may fall back to data at most this old (ms)
const MAX_STALE_ON_ERROR_MS = 1500;
// Unknown / failing tables are not re-requested from the provider for this long (ms)
const FAILURE_BACKOFF_MS = 2000;
// Event names are put in the provider URL path, so only plain slugs are accepted
const EVENT_NAME_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
// Bounds memory if callers pass many distinct names
const MAX_TRACKED_NAMES = 500;

export const getCasinoTable = (eventName, maxAgeMs = 500) => {
  if (typeof eventName !== 'string' || !EVENT_NAME_PATTERN.test(eventName)) {
    return Promise.reject(new Error('Invalid casino event name'));
  }

  const cached = cache.get(eventName);
  if (cached && Date.now() - cached.at <= maxAgeMs) {
    return Promise.resolve(cached.value);
  }

  const failed = failures.get(eventName);
  if (failed && Date.now() - failed.at < FAILURE_BACKOFF_MS) {
    return cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS
      ? Promise.resolve(cached.value)
      : Promise.reject(failed.error);
  }

  let pending = inflight.get(eventName);
  if (!pending) {
    pending = fetchCasinoData(eventName)
      .then((raw) => {
        const value = normalizeCasinoPayload(raw);
        failures.delete(eventName);
        if (value?.success) {
          if (cache.size >= MAX_TRACKED_NAMES) cache.clear();
          cache.set(eventName, { at: Date.now(), value });
        }
        return value;
      })
      .catch((error) => {
        if (failures.size >= MAX_TRACKED_NAMES) failures.clear();
        failures.set(eventName, { at: Date.now(), error });
        if (cached && Date.now() - cached.at <= MAX_STALE_ON_ERROR_MS) {
          return cached.value;
        }
        throw error;
      })
      .finally(() => inflight.delete(eventName));
    inflight.set(eventName, pending);
  }
  return pending;
};
