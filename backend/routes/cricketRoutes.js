import express from 'express';

import {
  fetchCrirketBettingData,
  getCricketCasinoData,
  getCricketData,
  getDiamondEvents,
  getDiamondEventsData,
} from '../controllers/cricketController.js';
// import { proxyLiveStream } from "../controllers/videoProxy.js";

const router = express.Router();

router.get('/cricket/matches', getCricketData);
router.get('/cricket/betting', fetchCrirketBettingData); // /api/betting?gameid=123
router.get('/cricket/cricket-casino', getCricketCasinoData); // /api/cricket/cricket-casino?gmid=123
router.get('/cricket/new-data', getDiamondEvents); // /api/betting?gameid=123
router.get('/cricket/game-data', getDiamondEventsData); // /api/betting?gameid=123
// router.get("/stream", proxyLiveStream);

export default router;
