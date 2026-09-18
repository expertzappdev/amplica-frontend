import { call, put, takeLatest, all } from 'redux-saga/effects';
import { ReportAPI } from '../../../services/api';
import {
  fetchReportByMemberRequest,
  fetchCompanyReportRequest,
  fetchReportSuccess,
  fetchCompanyReportSuccess,
  fetchReportFailure,
} from './reportSlice';

function* handleFetchReportByMember(action) {
  try {
    const params = action.payload;
    const data = yield call(ReportAPI.getUserReportByID, params);
    yield put(fetchReportSuccess(data?.data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || errorData?.error || error.message || 'Failed to fetch report';
    yield put(fetchReportFailure(errorMessage));
  }
}

function* handleFetchCompanyReport(action) {
  try {
    const params = action.payload;
    const { id, ...queryParams } = params; // Extract 'id' since it's company-wide
    const data = yield call(ReportAPI.getCompanyReport, queryParams);
    yield put(fetchCompanyReportSuccess(data?.data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || errorData?.error || error.message || 'Failed to fetch company report';
    yield put(fetchReportFailure(errorMessage));
  }
}

function* watchFetchReport() {
  yield takeLatest(fetchReportByMemberRequest.type, handleFetchReportByMember);
  yield takeLatest(fetchCompanyReportRequest.type, handleFetchCompanyReport);
}

export default function* reportSagas() {
  yield all([watchFetchReport()]);
}
