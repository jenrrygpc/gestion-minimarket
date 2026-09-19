import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import roleService from './roleService';

const initialState = {
  roles: [],
  role: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new role
export const createRole = createAsyncThunk(
  'roles/create',
  async (roleData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await roleService.createRole(roleData, token);
    } catch (error) {
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update role
export const updateRole = createAsyncThunk(
  'roles/update',
  async (roleData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await roleService.updateRole(roleData, token);
    } catch (error) {
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get roles
export const getRoles = createAsyncThunk(
  'roles/get',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await roleService.getRoles(params, token);
    } catch (error) {
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetRole: (state) => {
      state.role = {};
    },
    setRole: (state, action) => {
      state.role = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.roles = action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.roles = [];
      })
  },
});

export const { reset, setRole, resetRole } = roleSlice.actions;
export default roleSlice.reducer;
