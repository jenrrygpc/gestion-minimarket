import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import inventoryService from './inventoryService';
import productService from '../products/productService';

const initialState = {
  inventories: [],
  inventory: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  product: undefined,
  products: [],
};

// Create new inventory
export const registerInventory = createAsyncThunk(
  'inventory/create',
  async (inventoryData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      const store = thunkAPI.getState().auth.store;
      console.log('tokennn..:', token);
      console.log('storeee..:', store);
      return await inventoryService.registerInventory(inventoryData, { token, store });
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get product by code
export const getProduct = createAsyncThunk(
  'inventory/getProducts',
  async (params, thunkAPI) => {
    try {
      console.log('getProduct inventorySlice ');
      const { token } = thunkAPI.getState().auth.user;
      const store = thunkAPI.getState().auth.store;
      return await productService.getProduct(params, { token, store });
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update products
export const updateProducts = createAsyncThunk(
  'inventory/update-stock',
  async (productData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await productService.updateProducts(productData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerInventory.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(registerInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProduct.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        const { payload } = action;
        console.log('payload ..: ', payload);
        if (Array.isArray(payload)) {
          state.products = payload;
        } else if (payload !== null && typeof payload === 'object') {
          state.product = payload;
        } else {
          state.product = {};
        }

      })
      .addCase(getProduct.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true;
        state.product = {};
        //state.messageGetProduct = action.payload;
      })
      .addCase(updateProducts.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(updateProducts.fulfilled, (state) => {
        //state.isLoading = false;
        //state.isSuccess = true;
        //state.isError = false;
      })
      .addCase(updateProducts.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isError = true;
        //state.messageGetProduct = action.payload;
      })
  },
});

export const { reset } = inventorySlice.actions;
export default inventorySlice.reducer;