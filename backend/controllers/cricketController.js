import dotenv from 'dotenv';

import adminModel from '../models/adminModel.js';
import { getCricketCasino } from '../services/cricketCasinoCache.js';
import { fetchMatchData, fetchMatchList } from '../services/matchApi/index.js';
import { bestBackLay } from '../utils/bestOdds.js';

dotenv.config();

export const getCricketData = async (req, res) => {
  try {
    const data = await fetchMatchList(4);

    if (data.success) {
      const t1 = data.data.t1 || [];
      const t2 = data.data.t2 || [];
      const allMatches = [...t1, ...t2];

      const transformed = allMatches.map((match) => {
        // Best back/lay per section (provider order back3→back1 hota hai,
        // isliye positional pick galat odds deta tha)
        const sec1 = bestBackLay(match.section?.[0]?.odds);
        const sec2 =
          match.section && match.section.length >= 2
            ? bestBackLay(match.section[1].odds)
            : { back: '0', lay: '0' };

        const team1Odds = { home: sec1.back, away: sec1.lay };
        const team2Odds = { home: sec2.back, away: sec2.lay };

        const oddsArr = [team1Odds, { home: '0', away: '0' }, team2Odds];

        return {
          id: match.beventId || match.oldgmid || match.gmid,
          title: match.cname,
          beventId: match.beventId || null,
          match: match.ename,
          date: match.stime,
          channels: [],
          odds: oddsArr,
          inplay: match.iplay,
          tv: match.tv,
          bm: match.bm,
          f: match.f,
          iscc: match.iscc || 0,
        };
      });

      const now = new Date();
      const filteredMatches = transformed.filter((match) => {
        const matchDate = new Date(match.date);
        return match.inplay === true || matchDate >= now;
      });

      // Reference-site listing order: live (inplay) matches first in provider
      // order, then upcoming matches sorted by start time.
      const sortedMatches = [
        ...filteredMatches.filter((m) => m.inplay === true),
        ...filteredMatches
          .filter((m) => m.inplay !== true)
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      ];

      return res.status(200).json({ success: true, matches: sortedMatches });
    } else {
      return res
        .status(400)
        .json({ success: false, message: 'Failed to fetch matches' });
    }
  } catch (err) {
    console.error('Error fetching matches:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const fetchCrirketBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 4);

    if (json.success) {
      return res.status(200).json({ success: true, data: json });
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchCrirketBettingData:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDiamondEvents = async (req, res) => {
  console.log('getDiamondEvents');
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
  console.log('getDiamondEventsData');
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
// Cricket-casino (cricketv) live game feed — reference /api/front/cricketvdata2
// ka equivalent. Virtual cricket (iscc 1) events ke liye card/countdown data.
// Response: { success, data: { t1: { card, ft, lt } } }.
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
