import { fetchMatchData, fetchMatchList } from '../services/matchApi/index.js';
import { listingOdds, sortSportsMatches } from './bestOdds.js';

/**
 * Normalize an upstream provider match item into our unified listing shape.
 */
export function transformSportMatch(
  match,
  { preferBeventId = false, includeFancyChannel = true } = {}
) {
  return {
    id: preferBeventId
      ? match.beventId || match.oldgmid || match.gmid
      : match.gmid,
    title: match.cname,
    beventId: match.beventId || null,
    match: match.ename,
    date: match.stime,
    inplay: match.iplay,
    tv: match.tv,
    bm: match.bm,
    f: match.f,
    iscc: match.iscc || 0,
    oid: match.oid,
    channels: includeFancyChannel && match.f ? ['F'] : [],
    odds: listingOdds(match.section),
  };
}

/**
 * Factory for standard sports match listing handlers (Cricket, Soccer, Tennis).
 */
export function createSportListHandler({
  sportId,
  sportName,
  responseKey = 'data',
  preferBeventId = false,
  includeFancyChannel = true,
  requireSuccessFlag = false,
}) {
  return async (req, res) => {
    try {
      const data = await fetchMatchList(sportId);

      if (requireSuccessFlag && !data?.success) {
        return res
          .status(400)
          .json({ success: false, message: 'Failed to fetch matches' });
      }

      const t1Data = data?.data?.t1 || [];
      const t2Data = data?.data?.t2 || [];

      const combinedData = [...t1Data, ...t2Data].map((match) =>
        transformSportMatch(match, { preferBeventId, includeFancyChannel })
      );

      // Reference-site parity: keep all upstream events and match D247 sort order.
      const sortedData = sortSportsMatches(combinedData);

      return res.status(200).json({ success: true, [responseKey]: sortedData });
    } catch (error) {
      console.error(`Error fetching ${sportName} data:`, error.message);
      return res.status(500).json({
        success: false,
        message:
          responseKey === 'matches'
            ? 'Server error'
            : `Failed to fetch ${sportName} data`,
      });
    }
  };
}

/**
 * Factory for standard sports betting odds handlers (Cricket, Soccer, Tennis).
 */
export function createSportBettingHandler(sportId, label = 'fetchBettingData') {
  return async (req, res) => {
    const { gameid } = req.query;

    if (!gameid) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing gameid' });
    }

    try {
      const json = await fetchMatchData(gameid, sportId);

      if (json.success) {
        return res.status(200).json({ success: true, data: json });
      }
      return res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    } catch (error) {
      console.error(`Error in ${label}:`, error.message);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
}
