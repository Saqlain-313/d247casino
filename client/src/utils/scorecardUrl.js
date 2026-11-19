import env from '../config/env';

/**
 * Unified provider score iframe URL:
 *   /score-iframe/:etid_:gmid?key=...
 * Used for Real Cricket (etid=4, iscc=0) and all Football (1), Tennis (2),
 * and Horse Racing (10) events. Non-real Cricket (iscc 1/2/3/4) uses live JSON
 * score via backend /diamond/score/4_:gmid instead.
 */
export const getScoreIframeUrl = (etid, eventId) => {
  if (!eventId || !env.scoreIframeBaseUrl) return '';
  const base = `${env.scoreIframeBaseUrl}/score-iframe/${etid}_${encodeURIComponent(String(eventId))}`;
  if (!env.scoreIframeKey) return base;
  const params = new URLSearchParams({ key: env.scoreIframeKey });
  return `${base}?${params.toString()}`;
};

export const getCricketScorecardUrl = (eventId) =>
  getScoreIframeUrl(4, eventId);

export const getFootballScorecardUrl = (eventId) =>
  getScoreIframeUrl(1, eventId);

export const getTennisScorecardUrl = (eventId) => getScoreIframeUrl(2, eventId);

export const getHorseRacingScorecardUrl = (eventId) =>
  getScoreIframeUrl(10, eventId);
