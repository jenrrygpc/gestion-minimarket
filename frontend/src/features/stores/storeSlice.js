import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import storeService from './storeService';

const initialState = {
  stores: [],
  store: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new store
export const createStore = createAsyncThunk(
  'stores/create',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await storeService.createStore(storeData, token);
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
export const updateStore = createAsyncThunk(
  'stores/update',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await storeService.updateStore(storeData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get stores
export const getStores = createAsyncThunk(
  'stores/getPublic',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await storeService.getStores(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get stores public
export const getStoresPublic = createAsyncThunk(
  'stores/get',
  async (params, thunkAPI) => {
    try {
      return await storeService.getStoresPublic(params);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetStore: (state) => {
      state.store = {};
    },
    setStore: (state, action) => {
      state.store = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStore.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStore.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getStores.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = false; // ?
        state.stores = action.payload
      })
      .addCase(getStores.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true; // ?
        state.stores = [];
        //state.messageGetProduct = action.payload; // ?
      })
      .addCase(getStoresPublic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStoresPublic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.stores = action.payload
      })
      .addCase(getStoresPublic.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.stores = [];
      })
  },
});

export const { reset, setStore, resetStore } = storeSlice.actions;
export default storeSlice.reducer;