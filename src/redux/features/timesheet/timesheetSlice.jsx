import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timesheets: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentTimesheetId: null,
  timesheetData: null,
  query: {
    pageNumber: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    userId: null,
    projectId: null,
    taskId: null,
    search: '',
    memberUserId: '',
    loggedAtFrom: '',
    loggedAtTo: '',
    durationFrom: '',
  },
  filterLoading: false,
  filterError: null,
  filterTimeSheet: null
};

const timesheetSlice = createSlice({
  name: 'timesheets',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchTimesheetsSuccess: (state, action) => {
      const { items, totalCount, pageNumber } = action.payload;
      if (pageNumber > 1) {
        state.timesheets.items = [...state.timesheets.items, ...(items || [])];
      } else {
        state.timesheets.items = items || [];
      }
      state.timesheets.totalCount = totalCount || 0;
      state.isLoading = false;
    },
    getTimesheetByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.timesheetData = null;
    },
    getTimesheetByIdSuccess: (state, action) => {
      state.timesheetData = action.payload;
      state.isLoading = false;
    },
    createTimesheetSuccess: (state) => {
      state.isLoading = false;
    },
    updateTimesheetSuccess: (state) => {
      state.isLoading = false;
    },
    deleteTimesheetSuccess: (state) => {
      state.isLoading = false;
    },
    createTimesheetRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateTimesheetRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteTimesheetRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setTimesheetsQuery: (state, action) => {
      state.query = { ...state.query, ...action.payload };
    },
    setCurrentTimesheetId: (state, action) => {
      state.currentTimesheetId = action.payload;
    },
    clearTimesheetsError: (state) => {
      state.error = null;
    },
    clearTimesheets: (state) => {
      state.timesheets = initialState.timesheets;
      state.isLoading = false;
      state.error = null;
    },
    getFilteredTimelogsRequest: (state, action) => {
      state.filterLoading = true;
      state.filterError = null;
    },
    fetchFilteredTimesheetsSuccess: (state, action) => {
      state.filterLoading = false;
      state.filterTimeSheet = action.payload;
    },
    fetchFilteredTimesheetsFailure: (state, action) => {
      state.filterLoading = false;
      state.filterError = action.payload;
    },
    setEditingTimelog: (state, action) => {
      state.timesheetData = action.payload;
    },
    clearEditingTimelog: (state) => {
      state.timesheetData = null;
    },
  },
});

export const {
  requestStart,
  requestFailure,
  fetchTimesheetsSuccess,
  getTimesheetByIdSuccess,
  createTimesheetSuccess,
  updateTimesheetSuccess,
  deleteTimesheetSuccess,
  getTimesheetByIdRequest,
  createTimesheetRequest,
  updateTimesheetRequest,
  deleteTimesheetRequest,
  setCurrentTimesheetId,
  clearTimesheetsError,
  setTimesheetsQuery,
  clearTimesheets,
  getFilteredTimelogsRequest,
  fetchFilteredTimesheetsSuccess,
  fetchFilteredTimesheetsFailure,
  setEditingTimelog,
  clearEditingTimelog,
} = timesheetSlice.actions;

// Selectors
export const selectAllTimesheets = (state) => state.timesheets?.timesheets;
export const selectTimesheetsLoading = (state) => state.timesheets?.isLoading;
export const selectTimesheetsError = (state) => state.timesheets?.error;
export const selectCurrentTimesheetId = (state) => state.timesheets?.currentTimesheetId;
export const selectTimesheetData = (state) => state.timesheets?.timesheetData;
export const selectTimesheetsQuery = (state) => state.timesheets?.query;
export const selectTimeSheetFilterLoading = (state) => state.timesheets?.filterLoading;
export const selectTimeSheetFilterError = (state) => state.timesheets?.filterError;
export const selectTimeSheetFilterTimeSheet = (state) => state.timesheets?.filterTimeSheet;

export default timesheetSlice.reducer;