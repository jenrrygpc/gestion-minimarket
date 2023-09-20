import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from './productService';

const initialState = {
  products: [],
  product: {},
  isError: false,
  isErrorGetProduct: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  messageGetProduct: ''
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

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async (productData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await productService.updateProduct(productData, token);
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

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: (state) => initialState,
    setProduct: (state, action) => {
      state.product = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    } 
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
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.messageGetProduct = action.payload;
      })
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isErrorGetProduct = false;
        console.log('action.payload ..: ', action.payload);
        if (Array.isArray(action.payload)) {
          console.log('Array.isArray ..: ', action.payload);
          state.products = action.payload
        } else {
          console.log('isObject ..: ', action.payload);
          state.product = action.payload;
        }
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isErrorGetProduct = true;
        state.product = {};
        state.messageGetProduct = action.payload;
      })
  },
});

export const { reset, setProduct, setProducts } = productSlice.actions;
export default productSlice.reducer;