import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerService from './customerService';

const initialState = {
  customers: [],
  customer: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new customer
export const createCustomer = createAsyncThunk(
  'customers/create',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await customerService.createCustomer(storeData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customers/update',
  async (storeData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await customerService.updateCustomer(storeData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get customers
export const getCustomers = createAsyncThunk(
  'customers/get',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await customerService.getCustomers(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetCustomer: (state) => {
      state.customer = {};
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCustomers.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = false; // ?
        state.customers = action.payload
      })
      .addCase(getCustomers.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true; // ?
        state.customers = [];
        //state.messageGetProduct = action.payload; // ?
      })
  },
});

export const { reset, setCustomer, resetCustomer } = customerSlice.actions;
export default customerSlice.reducer;