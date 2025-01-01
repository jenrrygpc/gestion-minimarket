import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from './productService';

const initialState = {
  product: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new product
export const createProduct = createAsyncThunk(
  'products/create',
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
  'products/getByCode',
  async (params, thunkAPI) => {
    try {
      console.log('getProduct saleSlice ');
      const { token } = thunkAPI.getState().auth.user;
      return await productService.getProduct(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

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
        state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        //state.product = {};
        state.message = action.payload;
      })
  },
});

export const { reset } = saleSlice.actions;
export default saleSlice.reducer;