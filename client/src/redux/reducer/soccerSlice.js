import { createSportSlice } from './createSportSlice';

const { slice, fetchMatches, fetchBetting } = createSportSlice({
  name: 'soccer',
  dedupeKey: 'soccer-matches',
  listEndpoint: '/soccer',
  listPayloadKey: 'data',
  bettingEndpoint: '/soccer/betting',
  listThunkType: 'soccer/fetchSoccerData',
  bettingThunkType: 'cricket/fetchSoccerBatingData',
  includeBeventId: true,
  rawListField: 'soccerData',
  listLoadingField: 'soccerLoading',
  listErrorField: 'soccerError',
  bettingLoadingField: 'loading',
  extraInitialState: {
    soccerLoading: null,
    soccerError: null,
    soccerData: [],
    loading: false,
  },
});

export const fetchSoccerData = fetchMatches;
export const fetchSoccerBatingData = fetchBetting;
export default slice.reducer;
