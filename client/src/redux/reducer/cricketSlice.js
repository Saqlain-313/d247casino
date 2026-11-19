import { createSportSlice } from './createSportSlice';

const { slice, fetchMatches, fetchBetting } = createSportSlice({
  name: 'cricket',
  dedupeKey: 'cricket-matches',
  listEndpoint: '/cricket/matches',
  listPayloadKey: 'matches',
  bettingEndpoint: '/cricket/betting',
  listThunkType: 'cricket/fetchCricketData',
  bettingThunkType: 'cricket/fetchCricketBatingData',
  listLoadingField: 'loader',
  bettingLoadingField: 'loader',
  clearBettingOnPending: true,
  includeResetBatting: true,
  extraInitialState: { loader: false },
});

export const fetchCricketData = fetchMatches;
export const fetchCricketBatingData = fetchBetting;
export const { resetBattingData } = slice.actions;
export default slice.reducer;
