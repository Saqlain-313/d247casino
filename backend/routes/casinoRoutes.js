import express from 'express';

import {
  getCasinoBettingData,
  getCasinoData,
  getCasinoResultData,
  getCasinoResultDetailData,
  getDirectCasinoResultByDate,
} from '../controllers/casinoController.js';

const router = express.Router();

router.get('/casino-data', getCasinoData);

router.get('/casino-betting-data', getCasinoBettingData);

// Frontend compatibility
router.get('/casino/data', getCasinoBettingData);

router.get('/casino-betting-result', getCasinoResultData);
router.get('/casino-betting-result-detail', getCasinoResultDetailData);

// Direct casino result by date + eventName
// GET /casino/direct-result-by-date?date=2026-11-13&eventName=aaa
router.get('/casino/direct-result-by-date', getDirectCasinoResultByDate);

export default router;