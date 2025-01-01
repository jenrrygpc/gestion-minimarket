import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import reasonTransactionService from './reasonTransactionService';

const initialState = {
  reasons: [],
  reason: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Get reasons-transaction
export const getRTs = createAsyncThunk(
  'reasons-transaction/getAll',
  async (_, thunkAPI) => {
    try {
      console.log('getRTs ..:');
      const { token } = thunkAPI.getState().auth.user;
      return await reasonTransactionService.getRTs(token);
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
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRTs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRTs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reasons = action.payload;
      })
      .addCase(getRTs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset } = reasonTransactionSlice.actions;
export default reasonTransactionSlice.reducer;