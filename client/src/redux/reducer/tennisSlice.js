import { createSportSlice } from './createSportSlice';

const { slice, fetchMatches, fetchBetting } = createSportSlice({
  name: 'tennis',
  dedupeKey: 'tennis-matches',
  listEndpoint: '/tennis',
  listPayloadKey: 'data',
  bettingEndpoint: '/tannis/betting',
  listThunkType: 'tennis/fetchTennisData',
  bettingThunkType: 'cricket/fetchTannisBatingData',
  includeBeventId: true,
  rawListField: 'data',
  listLoadingField: 'loading',
  listErrorField: 'tesnnisError',
  bettingLoadingField: 'loading',
  extraInitialState: {
    data: [],
    loading: false,
    tesnnisError: null,
  },
});

export const fetchTennisData = fetchMatches;
export const fetchTannisBatingData = fetchBetting;
export default slice.reducer;
