import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from './authService';

//Get user from localstorage
const user = JSON.parse(localStorage.getItem('user'));
console.log('get local storage', user);
const store = JSON.parse(localStorage.getItem('store'));
console.log('get store', store);

const initialState = {
  user: user ? user : null,
  store: store || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  sidebar: false
};

export const login = createAsyncThunk(
  'auth/login',
  async (user, thunkAPI) => {
    try {
      console.log('user ..:', user);
      return await authService.login(user);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUser = createAsyncThunk(
  'auth/getUser',
  async (user, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await authService.getUser(token);
    } catch (error) {
      console.log('error getUser ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

//Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});
/*
export const setStore = createAsyncThunk('auth/setStore', async (store) => {
  await authService.setStore(store);
});
*/

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.sidebar = false;
    },
    showSidebar: (state) => {
      state.sidebar = !state.sidebar;
    },
    setStore: (state, action) => {
      console.log('setStore ..:', action.payload);
      state.store = action.payload
      localStorage.setItem('store', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.store = null
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        //state.user = action.payload
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
  },
});

export const { reset, showSidebar, setStore } = authSlice.actions;
export default authSlice.reducer;
