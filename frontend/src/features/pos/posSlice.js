import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import posService from './posService';

const initialState = {
  posList: [],
  pos: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new pos
export const createPos = createAsyncThunk(
  'pos/create',
  async (posData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await posService.createPos(posData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update pos
export const updatePos = createAsyncThunk(
  'pos/update',
  async (posData, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await posService.updatePos(posData, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);



// Get pos public
export const getPos = createAsyncThunk(
  'pos/get',
  async (params, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      return await posService.getPos(params, token);
    } catch (error) {
      console.log('error ..:', error);
      const message = (error.response && error.response.data
        && error.response.data.message) || error.message
        || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetPos: (state) => {
      state.pos = {};
    },
    setPos: (state, action) => {
      state.pos = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPos.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(createPos.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePos.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(updatePos.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPos.pending, (state) => {
        //state.isLoading = true;
      })
      .addCase(getPos.fulfilled, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = false; // ?
        state.posList = action.payload
      })
      .addCase(getPos.rejected, (state, action) => {
        //state.isLoading = false;
        //state.isErrorGetProduct = true; // ?
        state.posList = [];
        //state.messageGetProduct = action.payload; // ?
      })
  },
});

export const { reset, setPos, resetPos } = posSlice.actions;
export default posSlice.reducer;