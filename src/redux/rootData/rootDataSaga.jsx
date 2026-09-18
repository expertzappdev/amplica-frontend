import { put, call, all, takeLatest, select } from 'redux-saga/effects';
import {
  fetchRootDataStart,
  fetchRootDataSuccess,
  fetchRootDataFailure,
} from './rootDataSlice';

import { fetchProjectsRequest } from '../features/projects/projectSlice';
import { getUserProfileRequest } from '../../redux/features/profile/profileSlice';
import { selectUser } from '../../redux/features/auth/authSlice';

function* loadRootDataSaga() {
  try {
    const loggedInUser = yield select(selectUser);
    yield put(fetchProjectsRequest({}));
    yield put(getUserProfileRequest({ userId: loggedInUser.id }));

    yield put(fetchRootDataSuccess());
  } catch (error) {
    yield put(fetchRootDataFailure(error.message || 'Failed to load root data'));
  }
}

function* watchFetchRootData() {
  yield takeLatest(fetchRootDataStart.type, loadRootDataSaga);
}
export default function* rootSagas() {
  yield all([
    watchFetchRootData(),
  ]);
}