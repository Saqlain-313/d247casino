import cron from 'node-cron';

import {
  reconcileOrphanedBetHistory,
  updateFancyBetResult,
  updateResultOfBets,
  updateResultOfCasinoBets,
} from '../controllers/betController.js';

// Prevent overlapping cron runs so settlement jobs never race on the same bets.
const locks = {
  sports: false,
  fancy: false,
  casino: false,
  reconcile: false,
};

const runWithLock = async (lockName, fn, label) => {
  if (locks[lockName]) return;
  locks[lockName] = true;
  try {
    await fn();
  } catch (error) {
    console.error(`Error in ${label}:`, error);
  } finally {
    locks[lockName] = false;
  }
};

export const cronJobGame1p = () => {
  // SPORTS - Every 1 minute
  cron.schedule('*/1 * * * *', () => {
    runWithLock('sports', updateResultOfBets, 'updateResultOfBets');
  });

  // FANCY - Every 10 seconds
  cron.schedule('*/10 * * * * *', () => {
    runWithLock('fancy', updateFancyBetResult, 'updateFancyBetResult');
  });

  // CASINO - Every 2 seconds
  cron.schedule('*/2 * * * * *', () => {
    runWithLock('casino', updateResultOfCasinoBets, 'updateResultOfCasinoBet');
  });

  // RECONCILE - Every 60 seconds (repairs orphaned betHistory records from betModel)
  cron.schedule('*/60 * * * * *', () => {
    runWithLock(
      'reconcile',
      reconcileOrphanedBetHistory,
      'reconcileOrphanedBetHistory'
    );
  });
};

export default cronJobGame1p;
