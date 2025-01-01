import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import measureReducer from '../features/measures/measureSlice';
import profileReducer from '../features/profiles/profileSlice';
import masterReducer from '../features/masters/masterSlice';
import storeReducer from '../features/stores/storeSlice';
import saleReducer from '../features/products/saleSlice';
import userReducer from '../features/auth/userSlice';
import inventoryReducer from '../features/inventories/inventorySlice';
import reasonTransactionReducer from '../features/reasons-transaction/reasonTransactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    measure: measureReducer,
    profile: profileReducer,
    master: masterReducer,
    sale: saleReducer,
    user: userReducer,
    store: storeReducer,
    inventory: inventoryReducer,
    reasonTransaction: reasonTransactionReducer
  },
});