import { fetchScore } from './matchApi/index.js';

// Shared live score feed for non-real Cricket events (iscc 1, 2, 3, 4).
// Polls provider /diamond/score/4_<gmid> once per active eventId every REFRESH_MS
// so provider load scales with active matches, never with viewer count.
const REFRESH_MS = 3000;
const FAILURE_BACKOFF_MS = 10000;
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

export const isValidScoreEventId = (id) =>
  typeof id === 'string' && EVENT_ID_PATTERN.test(id);

let refreshTimer = null;
let pollInProgress = false;
let onScore = () => {};
let getActiveEventIds = () => [];

const latestScores = new Map(); // eventId -> { json, data }
const inflight = new Map(); // eventId -> Promise
const failureBackoff = new Map(); // eventId -> timestamp

export const getLatestScore = (eventId) => latestScores.get(eventId) || null;

const pollSingleEvent = async (eventId) => {
  if (!isValidScoreEventId(eventId)) return;
  const failedAt = failureBackoff.get(eventId);
  if (failedAt && Date.now() - failedAt < FAILURE_BACKOFF_MS) return;
  if (inflight.has(eventId)) return inflight.get(eventId);

  const task = fetchScore(eventId, 4)
    .then((res) => {
      if (!res?.success || !res?.data || typeof res.data !== 'object') {
        failureBackoff.set(eventId, Date.now());
        return;
      }
      failureBackoff.delete(eventId);
      const next = JSON.stringify(res.data);
      if (latestScores.get(eventId)?.json === next) return;
      latestScores.set(eventId, { json: next, data: res.data });
      onScore(eventId, res.data);
    })
    .catch(() => {
      failureBackoff.set(eventId, Date.now());
    })
    .finally(() => {
      inflight.delete(eventId);
    });

  inflight.set(eventId, task);
  return task;
};

// Trigger an immediate fetch when a viewer subscribes so they don't wait 3s.
export const requestScore = (eventId) => {
  if (!isValidScoreEventId(eventId)) return;
  pollSingleEvent(eventId);
};

export const startLiveScoreFeed = ({ activeEventIds, onUpdate }) => {
  if (refreshTimer) return;

  getActiveEventIds = activeEventIds;
  onScore = onUpdate;

  refreshTimer = setInterval(async () => {
    if (pollInProgress) return;
    pollInProgress = true;
    try {
      const active = new Set(getActiveEventIds());

      for (const eventId of latestScores.keys()) {
        if (!active.has(eventId)) {
          latestScores.delete(eventId);
          failureBackoff.delete(eventId);
        }
      }

      if (active.size > 0) {
        await Promise.allSettled([...active].map((id) => pollSingleEvent(id)));
      }
    } finally {
      pollInProgress = false;
    }
  }, REFRESH_MS);
};
