import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reasonTransactionService from './reasonTransactionService';
import { get } from "mongoose";

const initialState = {
  reasons: [],
  reason: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new reason-transaction
export const createReasonTransaction = createAsyncThunk(
  'reasons-transaction/create',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await reasonTransactionService.createReasonTransaction(storeData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update store
export const updateReasonTransaction = createAsyncThunk(
  'reasons-transaction/update',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await reasonTransactionService.updateReasonTransaction(storeData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get reasons-transaction
export const getReasonsTransaction = createAsyncThunk(
  'reasons-transaction/getAll',
  async (_, thunkAPI) => {
    try {
      console.log('getReasonsTransaction ..:');
      const { token } = thunkAPI.getState().auth.user;
      return await reasonTransactionService.getReasonsTransaction(token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const reasonTransactionSlice = createSlice({
  name: 'reasonTransaction',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetReason: (state) => {
      state.reason = {};
    },
    setReason: (state, action) => {
      state.reason = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReasonTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReasonTransaction.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createReasonTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateReasonTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateReasonTransaction.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateReasonTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getReasonsTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReasonsTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        //state.isSuccess = true;
        state.reasons = action.payload;
      })
      .addCase(getReasonsTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
}); 

export const { reset, setReason, resetReason } = reasonTransactionSlice.actions;
export default reasonTransactionSlice.reducer;