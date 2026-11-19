import {
  createSportBettingHandler,
  createSportListHandler,
} from '../utils/sportControllerFactory.js';

export const fetchTennisData = createSportListHandler({
  sportId: 2,
  sportName: 'tennis',
  responseKey: 'data',
});

export const fetchTannisBettingData = createSportBettingHandler(
  2,
  'fetchTannisBettingData'
);
