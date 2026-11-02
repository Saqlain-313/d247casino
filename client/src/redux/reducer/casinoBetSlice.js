
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api';

// --------------------------------------------------
// Helper: API error handling
// --------------------------------------------------
const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Something went wrong'
  );
};

// --------------------------------------------------
// 1. PLACE CASINO BET
// POST /casino/:slug/bet
// --------------------------------------------------
export const placeCasinoBet = createAsyncThunk(
  'casinoBet/placeBet',
  async ({ slug, ...formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/casino/${slug}/bet`,
        formData,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// 2. SETTLE CASINO ROUND
// POST /casino/:slug/settle
// --------------------------------------------------
export const settleCasinoRound = createAsyncThunk(
  'casinoBet/settleRound',
  async ({ slug, roundId, result }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/casino/${slug}/settle`,
        { roundId, result },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// 3. VOID CASINO ROUND
// POST /casino/:slug/void
// --------------------------------------------------
export const voidCasinoRound = createAsyncThunk(
  'casinoBet/voidRound',
  async ({ slug, roundId }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/casino/${slug}/void`,
        { roundId },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// 4. GET NATION BOOK
// GET /casino/:slug/book/:roundId
// --------------------------------------------------
export const getCasinoBook = createAsyncThunk(
  'casinoBet/getBook',
  async ({ slug, roundId }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/casino/${slug}/book/${roundId}`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// 5. GET MY CASINO BETS
// GET /casino/:slug/my-bets
// --------------------------------------------------
export const getMyCasinoBets = createAsyncThunk(
  'casinoBet/getMyBets',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/casino/${slug}/my-bets`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// 6. GET CASINO STATS
// GET /casino/:slug/stats
// --------------------------------------------------
export const getCasinoStats = createAsyncThunk(
  'casinoBet/getStats',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/casino/${slug}/stats`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------
const initialState = {
  // Place bet
  currentBet: null,
  balance: null,
  placeBetLoading: false,
  placeBetError: null,

  // Settle round
  settleData: null,
  settleLoading: false,
  settleError: null,

  // Void round
  voidData: null,
  voidLoading: false,
  voidError: null,

  // Nation book
  casinoBook: null,
  bookLoading: false,
  bookError: null,

  // My bets
  myBets: [],
  myBetsLoading: false,
  myBetsError: null,

  // Stats
  casinoStats: null,
  statsLoading: false,
  statsError: null,
};

// --------------------------------------------------
// CASINO BET SLICE
// --------------------------------------------------
const betSlice = createSlice({
  name: 'casinoBet',
  initialState,

  reducers: {
    clearCasinoBetError: (state) => {
      state.placeBetError = null;
      state.settleError = null;
      state.voidError = null;
      state.bookError = null;
      state.myBetsError = null;
      state.statsError = null;
    },

    clearCasinoBook: (state) => {
      state.casinoBook = null;
    },

    clearMyCasinoBets: (state) => {
      state.myBets = [];
    },

    clearCasinoStats: (state) => {
      state.casinoStats = null;
    },

    resetCasinoBet: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ------------------------------------------
      // PLACE BET
      // ------------------------------------------
      .addCase(placeCasinoBet.pending, (state) => {
        state.placeBetLoading = true;
        state.placeBetError = null;
      })

      .addCase(placeCasinoBet.fulfilled, (state, action) => {
        state.placeBetLoading = false;
        state.currentBet = action.payload.bet || null;

        if (action.payload.balance !== undefined) {
          state.balance = action.payload.balance;
        }

        // Refresh local bets list
        if (action.payload.bet) {
          state.myBets.unshift(action.payload.bet);
        }
      })

      .addCase(placeCasinoBet.rejected, (state, action) => {
        state.placeBetLoading = false;
        state.placeBetError = action.payload;
      })

      // ------------------------------------------
      // SETTLE ROUND
      // ------------------------------------------
      .addCase(settleCasinoRound.pending, (state) => {
        state.settleLoading = true;
        state.settleError = null;
      })

      .addCase(settleCasinoRound.fulfilled, (state, action) => {
        state.settleLoading = false;
        state.settleData = action.payload;
      })

      .addCase(settleCasinoRound.rejected, (state, action) => {
        state.settleLoading = false;
        state.settleError = action.payload;
      })

      // ------------------------------------------
      // VOID ROUND
      // ------------------------------------------
      .addCase(voidCasinoRound.pending, (state) => {
        state.voidLoading = true;
        state.voidError = null;
      })

      .addCase(voidCasinoRound.fulfilled, (state, action) => {
        state.voidLoading = false;
        state.voidData = action.payload;
      })

      .addCase(voidCasinoRound.rejected, (state, action) => {
        state.voidLoading = false;
        state.voidError = action.payload;
      })

      // ------------------------------------------
      // GET NATION BOOK
      // ------------------------------------------
      .addCase(getCasinoBook.pending, (state) => {
        state.bookLoading = true;
        state.bookError = null;
      })

      .addCase(getCasinoBook.fulfilled, (state, action) => {
        state.bookLoading = false;
        state.casinoBook = action.payload.book || null;
      })

      .addCase(getCasinoBook.rejected, (state, action) => {
        state.bookLoading = false;
        state.bookError = action.payload;
      })

      // ------------------------------------------
      // GET MY BETS
      // ------------------------------------------
      .addCase(getMyCasinoBets.pending, (state) => {
        state.myBetsLoading = true;
        state.myBetsError = null;
      })

      .addCase(getMyCasinoBets.fulfilled, (state, action) => {
        state.myBetsLoading = false;
        state.myBets = action.payload.bets || [];
      })

      .addCase(getMyCasinoBets.rejected, (state, action) => {
        state.myBetsLoading = false;
        state.myBetsError = action.payload;
      })

      // ------------------------------------------
      // GET CASINO STATS
      // ------------------------------------------
      .addCase(getCasinoStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })

      .addCase(getCasinoStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.casinoStats = action.payload;
      })

      .addCase(getCasinoStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  },
});

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------
export const {
  clearCasinoBetError,
  clearCasinoBook,
  clearMyCasinoBets,
  clearCasinoStats,
  resetCasinoBet,
} = betSlice.actions;

export default betSlice.reducer;
