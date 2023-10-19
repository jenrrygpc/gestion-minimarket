import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import masterService from './masterService';

const initialState = {
  masters: [],
  master: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new master
export const createMaster = createAsyncThunk(
  'masters/create',
  async (masterData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await masterService.createMaster(masterData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update master
export const updateMaster = createAsyncThunk(
  'masters/update',
  async (masterData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await masterService.updateMaster(masterData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get masters
export const getMasters = createAsyncThunk(
  'masters/get',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await masterService.getMasters(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    reset: (state) => initialState,
    resetCreate: (state, action) => {
      state.isSuccess = false;
      state.isError = false;
      state.master = {};
      state.message = '';
    },
    setMaster: (state, action) => {
      state.master = action.payload;
    },
    setMasters: (state, action) => {
      state.masters = action.payload;
    } 
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMaster.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMaster.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createMaster.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMaster.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMaster.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateMaster.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.messageGetProduct = action.payload; // ?
      })
      .addCase(getMasters.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getMasters.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = false; // ?
        state.masters = action.payload
      })
      .addCase(getMasters.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true; // ?
        state.masters = [];
        //state.messageGetProduct = action.payload; // ?
      })
  },
});

export const { reset, setMaster, setMasters, resetCreate } = masterSlice.actions;
export default masterSlice.reducer;