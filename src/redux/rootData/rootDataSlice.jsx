import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
};

const rootDataSlice = createSlice({
  name: 'rootData',
  initialState,
  reducers: {
    fetchRootDataStart: (state) => {
      state.loading = 'pending';
      state.error = null;
    },
    fetchRootDataSuccess: (state) => {
      state.loading = 'succeeded';
    },
    fetchRootDataFailure: (state, action) => {
      state.loading = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  fetchRootDataStart,
  fetchRootDataSuccess,
  fetchRootDataFailure,
} = rootDataSlice.actions;

export const selectRootLoading = (state) => state.rootData.loading;
export const selectRootError = (state) => state.rootData.error;

export default rootDataSlice.reducer;
