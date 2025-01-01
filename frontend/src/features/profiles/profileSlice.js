import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from './profileService';

const initialState = {
  profiles: [],
  profile: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Get profiles
export const getProfiles = createAsyncThunk(
  'profiles/getAll',
  async (_, thunkAPI) => {
    try {
      console.log('getProfiles ..:');
      const { token } = thunkAPI.getState().auth.user;
      return await profileService.getProfiles(token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profiles = action.payload;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset } = profileSlice.actions;
export default profileSlice.reducer;