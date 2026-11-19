import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { dedupedGet } from '../../services/dedupe';
import api from '../api';

export const formatMatchDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatListingOdds = (value) => {
  if (value === '0' || value === 0 || value === null || value === undefined) {
    return '-';
  }
  return value;
};

export const normalizeSportMatch = (
  match,
  { includeBeventId = false } = {}
) => {
  const base = {
    id: match.id,
    title: match.title,
    game: match.match || '',
    time: formatMatchDate(match.date),
    inplay: match.inplay,
    tv: match.tv,
    bm: match.bm,
    f: match.f,
    iscc: match.iscc || 0,
    one: {
      back: formatListingOdds(match.odds?.[0]?.home),
      lay: formatListingOdds(match.odds?.[0]?.away),
    },
    x: {
      back: formatListingOdds(match.odds?.[1]?.home),
      lay: formatListingOdds(match.odds?.[1]?.away),
    },
    two: {
      back: formatListingOdds(match.odds?.[2]?.home),
      lay: formatListingOdds(match.odds?.[2]?.away),
    },
  };
  if (includeBeventId) {
    base.beventId = match.beventId || null;
  }
  return base;
};

/**
 * Factory for standard sport slices (Cricket, Soccer, Tennis) to eliminate
 * duplicated date/odds normalization and thunk boilerplate.
 */
export function createSportSlice({
  name,
  dedupeKey,
  listEndpoint,
  listPayloadKey = 'data',
  bettingEndpoint,
  listThunkType,
  bettingThunkType,
  includeBeventId = false,
  rawListField = null,
  listLoadingField = 'loading',
  listErrorField = 'error',
  bettingLoadingField = 'loading',
  clearBettingOnPending = false,
  extraInitialState = {},
  includeResetBatting = false,
}) {
  const fetchMatches = createAsyncThunk(
    listThunkType,
    async (_, { rejectWithValue }) => {
      try {
        const response = await dedupedGet(dedupeKey, () =>
          api.get(listEndpoint)
        );
        return response.data[listPayloadKey];
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch matches'
        );
      }
    }
  );

  const fetchBetting = createAsyncThunk(
    bettingThunkType,
    async (gameid, { rejectWithValue }) => {
      try {
        const response = await api.get(`${bettingEndpoint}?gameid=${gameid}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch matches'
        );
      }
    }
  );

  const reducers = includeResetBatting
    ? {
        resetBattingData: (state) => {
          state.battingData = [];
        },
      }
    : {};

  const slice = createSlice({
    name,
    initialState: {
      matches: [],
      battingData: [],
      error: null,
      ...extraInitialState,
    },
    reducers,
    extraReducers: (builder) => {
      builder
        .addCase(fetchMatches.pending, (state) => {
          state[listLoadingField] = true;
          state[listErrorField] = null;
        })
        .addCase(fetchMatches.fulfilled, (state, action) => {
          state[listLoadingField] = false;
          const rows = Array.isArray(action.payload) ? action.payload : [];
          if (rawListField) {
            state[rawListField] = rows;
          }
          state.matches = rows.map((match) =>
            normalizeSportMatch(match, { includeBeventId })
          );
          state.error = null;
        })
        .addCase(fetchMatches.rejected, (state, action) => {
          state[listLoadingField] = false;
          state[listErrorField] = action.payload || action.error?.message;
        })
        .addCase(fetchBetting.pending, (state) => {
          state[bettingLoadingField] = true;
          state.error = null;
          if (clearBettingOnPending) {
            state.battingData = [];
          }
        })
        .addCase(fetchBetting.fulfilled, (state, action) => {
          state[bettingLoadingField] = false;
          state.battingData = action.payload?.data || [];
          state.error = null;
        })
        .addCase(fetchBetting.rejected, (state, action) => {
          state[bettingLoadingField] = false;
          state.error = action.payload;
        });
    },
  });

  return { slice, fetchMatches, fetchBetting };
}
