import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import measureReducer from '../features/measures/measureSlice';
import masterReducer from '../features/masters/masterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    measure: measureReducer,
    master: masterReducer
  },
});