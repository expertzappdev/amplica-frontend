import { call, put, takeLatest, all, select, delay } from 'redux-saga/effects';
import { AuthAPI, setAuthToken } from '../../../services/api';
import {
  loginSuccess,
  loginFailure,
  logoutSuccess,
  logoutFailure,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordSuccess,
  resetPasswordFailure,
  refreshTokenSuccess,
  refreshTokenFailure,
  impersonateSuccess,
  impersonateFailure,
  exitImpersonation,
} from './authSlice';
import { clearDropdownProjects } from '../projects/projectSlice';

// Selectors
const selectRefreshToken = (state) => state.auth.refreshToken;

// --- Worker Sagas ---

function* handleLogin(action) {
  try {
    const { email, password } = action.payload;
    const response = yield call(AuthAPI.login, { email, password });
    const responseData = response.data;
    
    yield call(setAuthToken, responseData.token);

    yield put(loginSuccess(responseData));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login Failed. Please check your credentials.';
    yield put(loginFailure(errorMessage));
  }
}

function* handleLogout() {
  try {
    yield call(AuthAPI.logout);
  } catch (error) {
    console.error('Server logout failed, proceeding with client-side logout:', error);
  } finally {
    yield call(setAuthToken, null);
    yield put(clearDropdownProjects());
    yield put(logoutSuccess());
  }
}

function* handleForgotPassword(action) {
  const { email, onSuccess, onFailure } = action.payload;
  try {
    yield call(AuthAPI.forgotPassword, { email });
    yield put(forgotPasswordSuccess());
    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Forgot Password Request Failed';
    yield put(forgotPasswordFailure(errorMessage));
    if (onFailure) {
      yield call(onFailure);
    }
  }
}

function* handleResetPassword(action) {
  const { email, token, newPassword, confirmPassword, onSuccess, onFailure } = action.payload;
  try {
    const response = yield call(AuthAPI.resetPassword, { email, token, newPassword, confirmPassword })
    yield put(resetPasswordSuccess());
    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Reset Password Failed';
    yield put(resetPasswordFailure(errorMessage));
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleImpersonate(action) {
  const { companyId, onSuccess, onFailure } = action.payload;
  try {
    const response = yield call(AuthAPI.impersonate, companyId);
    const responseData = response.data;
    // Update axios default header to use the impersonation token
    yield call(setAuthToken, responseData.token);
    if (onSuccess) yield call(onSuccess, responseData);
    
    // Wait for React Router to process the navigation before updating Redux state
    yield delay(100);
    
    yield put(impersonateSuccess(responseData));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Impersonation failed. Please try again.';
    yield put(impersonateFailure(errorMessage));
    if (onFailure) yield call(onFailure, errorMessage);
  }
}

function* handleExitImpersonation(action) {
  const { originalToken, onSuccess } = action.payload || {};
  // Restore original SA token in axios
  if (originalToken) {
    yield call(setAuthToken, originalToken);
  }
  yield put(exitImpersonation());
  if (onSuccess) yield call(onSuccess);
}



function* watchLoginRequest() {
  yield takeLatest('auth/loginRequest', handleLogin);
}

function* watchLogoutRequest() {
  yield takeLatest('auth/logoutRequest', handleLogout);
}

function* watchForgotPasswordRequest() {
  yield takeLatest('auth/forgotPasswordRequest', handleForgotPassword);
}

function* watchResetPasswordRequest() {
  yield takeLatest('auth/resetPasswordRequest', handleResetPassword);
}

function* watchImpersonateRequest() {
  yield takeLatest('auth/impersonateRequest', handleImpersonate);
}

function* watchExitImpersonationRequest() {
  yield takeLatest('auth/exitImpersonationRequest', handleExitImpersonation);
}

export default function* authSagas() {
  yield all([
    watchLoginRequest(),
    watchLogoutRequest(),
    watchForgotPasswordRequest(),
    watchResetPasswordRequest(),
    watchImpersonateRequest(),
    watchExitImpersonationRequest(),
  ]);
}
