// controllers/tennisController.js
import dotenv from 'dotenv';

import { fetchMatchData, fetchMatchList } from '../services/matchApi/index.js';
import { listingOdds, sortSportsMatches } from '../utils/bestOdds.js';

dotenv.config();

export const fetchTennisData = async (req, res) => {
  try {
    const data = await fetchMatchList(2);

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
      oid: match.oid,
      channels: match.f ? ['F'] : [],
      odds: listingOdds(match.section),
    }));

    // Reference-site parity: keep all upstream events and match D247 sort order.
    const sortedData = sortSportsMatches(combinedData);

    res.status(200).json({ success: true, data: sortedData });
  } catch (error) {
    console.error('Error fetching tennis data:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch tennis data' });
  }
};

export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 2);

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
