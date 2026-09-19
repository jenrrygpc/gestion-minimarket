import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import permissionService from './permissionService';

const initialState = {
  permissions: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Get permissions
export const getPermissions = createAsyncThunk(
  'permissions/get',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await permissionService.getPermissions(params, token);
    } catch (error) {
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPermissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.permissions = action.payload;
      })
      .addCase(getPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.permissions = [];
      })
  },
});

export const { reset } = permissionSlice.actions;
export default permissionSlice.reducer;
