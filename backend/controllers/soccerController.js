import {
  createSportBettingHandler,
  createSportListHandler,
} from '../utils/sportControllerFactory.js';

export const fetchSoccerData = createSportListHandler({
  sportId: 1,
  sportName: 'soccer',
  responseKey: 'data',
});

export const fetchsoccerBettingData = createSportBettingHandler(
  1,
  'fetchsoccerBettingData'
);
