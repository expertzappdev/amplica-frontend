import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import toast from 'react-hot-toast';
import { TimesheetAPI } from '../../../services/api';
import {
  requestFailure,
  getTimesheetByIdSuccess,
  createTimesheetSuccess,
  updateTimesheetSuccess,
  deleteTimesheetSuccess,
  getTimesheetByIdRequest,
  createTimesheetRequest,
  updateTimesheetRequest,
  deleteTimesheetRequest,
  selectTimesheetsQuery,
  getFilteredTimelogsRequest,
  fetchFilteredTimesheetsSuccess,
  fetchFilteredTimesheetsFailure,
} from './timesheetSlice';
import { selectUser } from '../auth/authSlice'; // Import user selector

// This function is not used for edit anymore, but kept for potential future use
function* handleGetTimesheetById({ payload: timesheetId }) {
  try {
    const response = yield call(TimesheetAPI.getTimesheetById, timesheetId);
    yield put(getTimesheetByIdSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'You do not have permission to view this timelog.';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* handleCreateTimesheet({ payload: timesheetData }) {
  try {
    const response = yield call(TimesheetAPI.createTimesheet, timesheetData);

    if (response.status === 201 || response.status === 200) {
      yield put(createTimesheetSuccess());
      toast.success('Timesheet Entry Created');

      const currentUser = yield select(selectUser);
      const currentQuery = yield select(selectTimesheetsQuery);

      const refetchQuery = {
        ...currentQuery,
        userId: currentUser.id
      };

      yield put(getFilteredTimelogsRequest(refetchQuery));
    } else {
      const errorMessage = response.data?.message || 'Failed to create timesheet entry';
      yield put(requestFailure(errorMessage));
      toast.error('Creation Failed', { text2: errorMessage });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Creation Failed', { text2: errorMessage });
  }
}

function* handleUpdateTimesheet({ payload }) {
  const { timesheetId, timesheetData } = payload;
  try {
    const response = yield call(TimesheetAPI.updateTimesheet, timesheetId, timesheetData);
    if (response.status === 204 || response.status === 200) {
      yield put(updateTimesheetSuccess());
      toast.success('Timesheet Entry Updated');

      // Also ensure the refetch after update is for the current user
      const currentUser = yield select(selectUser);
      const currentQuery = yield select(selectTimesheetsQuery);
      const refetchQuery = {
        ...currentQuery,
        userId: currentUser.id
      };
      yield put(getFilteredTimelogsRequest(refetchQuery));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update timesheet entry';
    yield put(requestFailure(errorMessage));
    toast.error('Update Failed', { text2: errorMessage });
  }
}

function* handleDeleteTimesheet({ payload: timesheetId }) {
  try {
    yield call(TimesheetAPI.deleteTimesheet, timesheetId);
    yield put(deleteTimesheetSuccess());
    toast.success('Timesheet Entry Deleted');

    // --- THIS IS THE CORRECTED LOGIC ---
    // After deleting, we must get the current user and refetch their specific logs.
    const currentUser = yield select(selectUser);
    const currentQuery = yield select(selectTimesheetsQuery);
    const refetchQuery = {
      ...currentQuery,
      userId: currentUser.id
    };

    yield put(getFilteredTimelogsRequest(refetchQuery));
    // --- END OF CORRECTION ---

  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete timesheet entry';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed', { text2: errorMessage });
  }
}

function* handleGetFilteredTimelogs({ payload }) {
  try {
    const apiPayload = {
      ...payload,
      page: payload.pageNumber || payload.page,
    };
    delete apiPayload.pageNumber;

    const { data } = yield call(TimesheetAPI.getFilteredTimelogs, apiPayload);
    if (data && data.statusCode === 200) {
      yield put(fetchFilteredTimesheetsSuccess(data.data));
    } else {
      const errorMessage = data?.message || 'Failed to load timelogs';
      yield put(fetchFilteredTimesheetsFailure(errorMessage));
    }
  } catch (error) {
    yield put(fetchFilteredTimesheetsFailure(error.message || 'Something went wrong'));
  }
}

function* watchTimesheetRequests() {
  yield takeLatest(getTimesheetByIdRequest.type, handleGetTimesheetById);
  yield takeLatest(createTimesheetRequest.type, handleCreateTimesheet);
  yield takeLatest(updateTimesheetRequest.type, handleUpdateTimesheet);
  yield takeLatest(deleteTimesheetRequest.type, handleDeleteTimesheet);
  yield takeLatest(getFilteredTimelogsRequest.type, handleGetFilteredTimelogs);
}

export default function* timesheetSagas() {
  yield all([
    watchTimesheetRequests(),
  ]);
}