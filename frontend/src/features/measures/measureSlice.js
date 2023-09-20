import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import measureService from './measureService';

const initialState = {
  measures: [],
  measure: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Get measures
export const getMeasures = createAsyncThunk(
  'measures/getAll',
  async (_, thunkAPI) => {
    try {
      console.log('getMeasures ..:');
      const { token } = thunkAPI.getState().auth.user;
      return await measureService.getMeasures(token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const measureSlice = createSlice({
  name: 'measure',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMeasures.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeasures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.measures = action.payload;
      })
      .addCase(getMeasures.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset } = measureSlice.actions;
export default measureSlice.reducer;