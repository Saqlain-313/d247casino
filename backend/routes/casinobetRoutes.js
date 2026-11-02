/**
 * routes/casinoRoutes.js
 * Mount in app: app.use('/api', casinoRoutes);   // import casinoRoutes from './routes/casinoRoutes.js'
 */
import { Router } from 'express';
import * as c from '../controllers/casinobetController.js';

// apne existing middleware ke path adjust kar lena
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/casino/:slug/bet', authMiddleware, c.placeBet);
router.post('/casino/:slug/settle', authMiddleware, c.settleRound);
router.post('/casino/:slug/void', authMiddleware, c.voidRound);
router.get('/casino/:slug/book/:roundId', authMiddleware, c.getNationBook);
router.get('/casino/:slug/my-bets', authMiddleware, c.myBets);
router.get('/casino/:slug/stats', authMiddleware, c.getStats);

export default router;