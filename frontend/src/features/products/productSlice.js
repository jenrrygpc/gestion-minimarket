import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from './productService';

const initialState = {
  products: [],
  product: {},
  newProductId: null,
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
      const store = thunkAPI.getState().auth.store;
      console.log('tokennn..:', token);
      console.log('storeee..:', store);
      return await productService.createProduct(productData, { token, store });
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
  'product/getProducts',
  async (params, thunkAPI) => {
    try {
      console.log('getProduct productSlice ');
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

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setProduct: (state, action) => {
      state.product = action.payload;
    },

    setProducts: (state, action) => {
      state.products = action.payload;
    },
    resetProduct: (state) => {
      state.product = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        console.log('nuevo producto ...:', payload)
        state.newProductId = payload?._id;
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
        //state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = false;
        const { payload } = action;
        console.log('payload ..: ', payload);
        if (Array.isArray(payload)) {
          console.log('Array.isArray ..: ', payload);
          state.products = payload
        } else if (payload !== null && typeof payload === 'object') {
          console.log('isObject ..: ', payload);
          state.products = [payload];
        } else {
          console.log('else ..: ', payload);
          state.products = [];
        }
      })
      .addCase(getProduct.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true;
        state.products = [];
        //state.messageGetProduct = action.payload;
      })
  },
});

export const { reset, setProduct, resetProduct, setProducts } = productSlice.actions;
export default productSlice.reducer;