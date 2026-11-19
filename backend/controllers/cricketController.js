import { getCricketCasino } from '../services/cricketCasinoCache.js';
import { fetchMatchData, fetchMatchList } from '../services/matchApi/index.js';
import {
  createSportBettingHandler,
  createSportListHandler,
} from '../utils/sportControllerFactory.js';

export const getCricketData = createSportListHandler({
  sportId: 4,
  sportName: 'cricket',
  responseKey: 'matches',
  preferBeventId: true,
  includeFancyChannel: false,
  requireSuccessFlag: true,
});

export const fetchCrirketBettingData = createSportBettingHandler(
  4,
  'fetchCrirketBettingData'
);

export const getDiamondEvents = async (req, res) => {
  try {
    const sid = Number(req.query.sid) || 10;
    const data = await fetchMatchList(sid);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      'Diamond Events API Error:',
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch diamond events',
      error: error.response?.data || error.message,
    });
  }
};

export const getDiamondEventsData = async (req, res) => {
  const { gameid } = req.query;
  const sid = Number(req.query.sid) || 10;

  if (!gameid) {
    return res.status(400).json({
      success: false,
      message: 'Missing gameid',
    });
  }

  try {
    const data = await fetchMatchData(gameid, sid);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      'Diamond Events API Error:',
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch diamond events',
      error: error.response?.data || error.message,
    });
  }
};

// GET /cricket/cricket-casino?gmid=<id>
// Virtual cricket (iscc 1) live card/countdown feed.
export const getCricketCasinoData = async (req, res) => {
  const { gmid } = req.query;

  if (!gmid || !/^\d{1,20}$/.test(String(gmid))) {
    return res
      .status(400)
      .json({ success: false, message: 'Valid gmid is required' });
  }

  try {
    const data = await getCricketCasino(gmid, 500);

    if (!data?.success) {
      return res.status(404).json({
        success: false,
        message: 'Cricket casino not available for this event',
      });
    }

    return res.status(200).json({ success: true, data: data.data });
  } catch (error) {
    console.error('getCricketCasinoData error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Cricket casino provider temporarily unavailable',
    });
  }
};
