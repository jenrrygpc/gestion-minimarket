import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from './authService';

const initialState = {
  users: [],
  user: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

export const register = createAsyncThunk(
  'auth/register',
  async (user, thunkAPI) => {
    console.log(user);
    try {
      console.log('user ..:', user);
      return await authService.register(user);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'auth/update',
  async (userData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await authService.updateUser(userData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/*
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
*/

export const getUsers = createAsyncThunk(
  'auth/getUsers',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await authService.getUsers(params, token);
    } catch (error) {
      console.log('error getUsers ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetUser: (state) => {
      state.user = {};
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getUsers.pending, (state) => {
        // state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isSuccess = true;
        state.users = action.payload
      })
      .addCase(getUsers.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isError = true;
        //state.message = action.payload;
        state.users = [];
      })
  },
});

export const { reset, setUser, resetUser } = authSlice.actions;
export default authSlice.reducer;
