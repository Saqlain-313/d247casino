import dotenv from 'dotenv';

import { fetchMatchData, fetchMatchList } from '../services/matchApi/index.js';
import { listingOdds } from '../utils/bestOdds.js';

dotenv.config();

export const fetchSoccerData = async (req, res) => {
  try {
    const data = await fetchMatchList(1);

    const t1Data = data.data.t1 || [];
    const t2Data = data.data.t2 || [];

    const combinedData = [...t1Data, ...t2Data].map((match) => ({
      id: match.gmid,
      title: match.cname,
      beventId: match.beventId || null,
      match: match.ename,
      date: match.stime,
      inplay: match.iplay,
      tv: match.tv,
      bm: match.bm,
      f: match.f,
      iscc: match.iscc || 0,
      channels: match.f ? ['F'] : [],
      odds: listingOdds(match.section),
    }));

    // Reference-site listing order: live (inplay) matches first in provider
    // order, then upcoming matches sorted by start time.
    const now = new Date();
    const upcoming = combinedData
      .filter((m) => m.inplay !== true && new Date(m.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedData = [
      ...combinedData.filter((m) => m.inplay === true),
      ...upcoming,
    ];

    res.status(200).json({ success: true, data: sortedData });
  } catch (error) {
    console.error('Error fetching soccer data:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch soccer data' });
  }
};

export const fetchsoccerBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 1);

    if (json.success) {
      res.status(200).json({
        success: true,
        data: json,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
