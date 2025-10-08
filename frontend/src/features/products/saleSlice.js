import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from './productService';
import saleService from './saleService';

const initialState = {
  product: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  products: [],
  sale: null,
};

// Create new product
export const createProduct = createAsyncThunk(
  'sale/create',
  async (productData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await productService.createProduct(productData, token);
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
  'sale/getProducts',
  async (params, thunkAPI) => {
    try {
      console.log('getProduct saleSlice ');
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

// Create new Sale
export const createSale = createAsyncThunk(
  'sale/createSale',
  async (saleData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      const store = thunkAPI.getState().auth.store;
      return await saleService.createSale(saleData, { token, store });
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
)

export const saleSlice = createSlice({
  name: 'sale',
  initialState,
  reducers: {
    reset: (state) => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProduct.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        //state.isLoading = false;
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
        state.product = {};
      })
      .addCase(createSale.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.sale = action.payload;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset } = saleSlice.actions;
export default saleSlice.reducer;