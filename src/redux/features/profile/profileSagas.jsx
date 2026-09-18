import { call, put, takeLatest, all, select, delay } from 'redux-saga/effects';
import { UserAPI } from '../../../services/api'; // Ensure this is correctly imported
import {
  getAllUsersRequest,
  getAllUsersSuccess,
  getUserProfileRequest,
  getUserProfileSuccess,
  getEmployeeProfileRequest,
  getEmployeeProfileSuccess,
  createUserRequest,
  createUserSuccess,
  updateUserRequest,
  updateUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
  updatePasswordRequest,
  updatePasswordSuccess,
  changeUserPasswordRequest,
  changeUserPasswordSuccess,
  uploadProfileImageRequest,
  uploadProfileImageSuccess,
  uploadProfileImageFailure,
  setUsersQuery,
  requestFailure, // General failure action in profileSlice
  selectUsersQuery,
} from './profileSlice';
import toast from 'react-hot-toast';
import { selectUser } from '../auth/authSlice';

// --- Worker Sagas ---

function* handleGetAllUsers() {
  try {
    const query = yield select(selectUsersQuery);
    const response = yield call(UserAPI.getAllUsers, query);
    yield put(getAllUsersSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users.';
    yield put(requestFailure(errorMessage));
  }
}

function* handleQueryChange() {
  yield delay(300);
  yield put(getAllUsersRequest());
}

function* handleGetUserProfile(action) {
  try {
    const { userId, onSuccess, onFailure } = action.payload;
    const response = yield call(UserAPI.getUserProfile, userId);
    const userData = response.data?.data || response.data;
    yield put(getUserProfileSuccess(userData));

    if (onSuccess) {
      yield call(onSuccess, userData);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user profile.';
    yield put(requestFailure(errorMessage));

    if (action.payload.onFailure) {
      yield call(action.payload.onFailure, errorMessage);
    }
  }
}

function* handleGetEmployeeProfile(action) {
  try {
    const { userId, onSuccess, onFailure } = action.payload;
    const response = yield call(UserAPI.getUserProfile, userId);
    const userData = response.data?.data || response.data;
    yield put(getEmployeeProfileSuccess(userData));
    
    if (onSuccess) {
      yield call(onSuccess, userData);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user profile.';
    yield put(requestFailure(errorMessage));
    
    if (action.payload.onFailure) {
      yield call(action.payload.onFailure, errorMessage);
    }
  }
}

function* handleCreateUser(action) {
  const { userData, onSuccess: resolve, onFailure: reject } = action.payload;
  try {
    const response = yield call(UserAPI.createUser, userData);
    const newUser = response.data?.data || response.data;
    if (response.data && response.status === 'success') { 
      yield put(createUserSuccess(newUser));
      toast.success('User Created Successfully', { variant: 'success' });

      if (resolve) {
        yield call(resolve, { success: true, userData: newUser });
      }
      yield put(getAllUsersRequest());
    } else {
      const errorMessage = response.data?.message || 'Failed to create user.';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage, { variant: 'error' });
      if (reject) {
        yield call(reject, { success: false, error: errorMessage });
      }
    }
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create user.';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });
    if (reject) {
      yield call(reject, { success: false, error: errorMessage }); 
    }
  }
}

function* handleUpdateUser(action) {
  try {
    const { userId, userData, onSuccess, onFailure } = action.payload;
    const response = yield call(UserAPI.updateUser, userId, userData);
    const updatedUser = response.data?.data || response.data;
    yield put(updateUserSuccess(updatedUser));
    toast.success('User Updated Successfully', { variant: 'success' });

    if (onSuccess) {
      yield call(onSuccess, updatedUser);
    }

    const loggedInUser = yield select(selectUser);

    if (loggedInUser && loggedInUser?.id === userId) {
      yield put(getUserProfileRequest({ userId }));
    } else {
      yield put(getEmployeeProfileRequest({ userId }));
    }
    yield put(getAllUsersRequest());
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update user.';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });

    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleDeleteUser(action) {
  const { userId, onSuccess, onFailure } = action.payload;
  try {
    yield call(UserAPI.deleteUser, userId);
    yield put(deleteUserSuccess());
    // toast.success('User Deleted Successfully', { variant: 'success' });
    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user.';
    yield put(deleteUserFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleUpdatePassword(action) {
  const { passwordData, onSuccess, onFailure } = action.payload;
  try {
    const response = yield call(UserAPI.updatePassword, passwordData);
    yield put(updatePasswordSuccess());
    toast.success('Password Updated Successfully', { variant: 'success' });
    if (onSuccess) {
      yield call(onSuccess, response);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update password.';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleChangeUserPassword(action) {
  const { userId, passwordData, onSuccess, onFailure } = action.payload;
  try {
    const response = yield call(UserAPI.changeUserPassword, userId, passwordData);
    yield put(changeUserPasswordSuccess());
    toast.success('Password Updated Successfully', { variant: 'success' });
    if (onSuccess) {
      yield call(onSuccess, response);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update password.';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleUploadProfileImage(action) {
  try {
    const { formData, userId} = action.payload;
    const response = yield call(UserAPI.uploadProfileImage, formData, userId);
    const imageData = response.data;
    yield put(uploadProfileImageSuccess({ imageUrl: imageData.profilePhotoUrl || imageData.url }));
    toast.success('Profile Image Uploaded Successfully', { variant: 'success' });

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image.';
    yield put(uploadProfileImageFailure(errorMessage));
    toast.error(errorMessage, { variant: 'error' });
    if (action.payload.onFailure) {
      yield call(action.payload.onFailure, errorMessage);
    }
  }
}


// --- Watcher Sagas ---
function* watchGetAllUsersRequest() {
  yield takeLatest(getAllUsersRequest.type, handleGetAllUsers);
}
function* watchChangeUserPasswordRequest() {
  yield takeLatest(changeUserPasswordRequest.type, handleChangeUserPassword);
}
function* watchSetUsersQuery() {
  yield takeLatest(setUsersQuery.type, handleQueryChange);
}
function* watchGetUserProfileRequest() {
  yield takeLatest(getUserProfileRequest.type, handleGetUserProfile);
}
function* watchGetEmployeeProfileRequest() {
  yield takeLatest(getEmployeeProfileRequest.type, handleGetEmployeeProfile);
}
function* watchCreateUserRequest() {
  yield takeLatest(createUserRequest.type, handleCreateUser);
}
function* watchUpdateUserRequest() {
  yield takeLatest(updateUserRequest.type, handleUpdateUser);
}
function* watchDeleteUserRequest() {
  yield takeLatest(deleteUserRequest.type, handleDeleteUser);
}
function* watchUpdatePasswordRequest() {
  yield takeLatest(updatePasswordRequest.type, handleUpdatePassword);
}
function* watchUploadProfileImageRequest() {
  yield takeLatest(uploadProfileImageRequest.type, handleUploadProfileImage);
}

// --- Root Saga ---
export default function* userProfileSagas() {
  yield all([
    watchGetAllUsersRequest(),
    watchSetUsersQuery(),
    watchGetUserProfileRequest(),
    watchGetEmployeeProfileRequest(),
    watchCreateUserRequest(),
    watchUpdateUserRequest(),
    watchDeleteUserRequest(),
    watchUpdatePasswordRequest(),
    watchUploadProfileImageRequest(),
    watchChangeUserPasswordRequest(),
  ]);
}