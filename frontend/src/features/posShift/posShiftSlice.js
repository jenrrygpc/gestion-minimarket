import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import posShiftService from './posShiftService';

const initialState = {
  posShiftList: [],
  posShift: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  shiftClosingResult: {},
  preClosingSummary: null,
};

// Create new pos shift
export const createPosShift = createAsyncThunk(
  'posShift/create',
  async (posData, thunkAPI) => {
    try {
      const { user, store } = thunkAPI.getState().auth;
      const { token } = user;
      const { id } = store;
      posData.storeId = id;
      return await posShiftService.createPosShift(posData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update pos shift
export const updatePosShift = createAsyncThunk(
  'posShift/update',
  async (posData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await posShiftService.updatePosShift(posData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get pos shift
export const getPosShift = createAsyncThunk(
  'posShift/get',
  async (params, thunkAPI) => {
    try {
      const { token, id } = thunkAPI.getState().auth.user;
      params.user = id;
      return await posShiftService.getPosShift(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get valid pos shift
export const getValidPosShift = createAsyncThunk(
  'validPosShift/get',
  async (params, thunkAPI) => {
    try {
      const { user, store } = thunkAPI.getState().auth;
      const { token, id: userId } = user;
      const { id: storeId } = store;
      params.user = userId;
      params.storeId = storeId;
      return await posShiftService.getValidPosShift(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Close pos shift
export const closePosShift = createAsyncThunk(
  'posShift/close',
  async (posData, thunkAPI) => {
    try {
      const { user } = thunkAPI.getState().auth;
      const { token } = user;
      return await posShiftService.closePosShift(posData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ✅ Acción para obtener resumen previo al cierre
export const getPreClosingSummary = createAsyncThunk(
  'posShift/getPreClosingSummary',
  async (posShiftId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await posShiftService.getPreClosingSummary(posShiftId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const posShiftSlice = createSlice({
  name: 'posShift',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetPosShift: (state) => {
      state.posShift = {};
      state.posShiftList = [];
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
      state.shiftClosingResult = null;
      state.preClosingSummary = null;
    },
    setPosShift: (state, action) => {
      state.posShift = action.payload;
      state.message = 'setPosShift';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPosShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPosShift.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posShift = action.payload;
        state.message = 'createPosShift';
        state.isError = false;
      })
      .addCase(createPosShift.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePosShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePosShift.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updatePosShift.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPosShift.pending, (state) => {
      })
      .addCase(getPosShift.fulfilled, (state, action) => {
        state.posShiftList = action.payload
      })
      .addCase(getPosShift.rejected, (state, action) => {
        state.posShiftList = [];
      })
      .addCase(getValidPosShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getValidPosShift.fulfilled, (state, action) => {
        state.posShiftList = action.payload
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'getValidPosShift';
        state.isError = false;
      })
      .addCase(getValidPosShift.rejected, (state, action) => {
        state.posShiftList = [];
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(closePosShift.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(closePosShift.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.shiftClosingResult = action.payload;
        state.message = 'closePosShift';
        state.isError = false;
      })
      .addCase(closePosShift.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPreClosingSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPreClosingSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.preClosingSummary = action.payload.summary;
        state.message = 'getPreClosingSummary';
      })
      .addCase(getPreClosingSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.preClosingSummary = null;
      });
  },
});

export const { reset, setPosShift, resetPosShift } = posShiftSlice.actions;
export default posShiftSlice.reducer;