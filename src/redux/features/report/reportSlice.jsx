// features/report/reportSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: {
    items: [],
    totalCount: 0,
  },
  companyReport: null,
  isLoading: false,
  error: null,
    query: {
     id: null,
     startDateTo: null,
     endDateTo: null,
     statuses: null,
     pageNumber: 1,
     pageSize: 10,
   },
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    fetchReportRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchReportByMemberRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCompanyReportRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchReportSuccess: (state, action) => {
      state.reports = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    fetchCompanyReportSuccess: (state, action) => {
      state.companyReport = action.payload || null;
      state.isLoading = false;
    },
    fetchReportFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  setReportQuery: (state, action) => {
  state.query = action.payload;
},
    clearReportError: (state) => {
      state.error = null;
    },
    clearReportData: (state) => {
      state.reports = { items: [], totalCount: 0 };
    },
  },
});

export const {
  fetchReportRequest,
  fetchReportByMemberRequest,
  fetchCompanyReportRequest,
  fetchReportSuccess,
  fetchCompanyReportSuccess,
  fetchReportFailure,
  setReportQuery,
  clearReportError,
  clearReportData,
} = reportSlice.actions;

// Selectors
export const selectReportData = (state) => state.report.reports;
export const selectCompanyReportData = (state) => state.report.companyReport;
export const selectReportLoading = (state) => state.report.isLoading;
export const selectReportError = (state) => state.report.error;
export const selectReportQuery = (state) => state.report.query;

export default reportSlice.reducer;
