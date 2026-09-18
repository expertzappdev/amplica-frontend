import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userProfileDetail: null,
  employeeProfileDetail: null,
  userList: {
    items: [],
    totalCount: 0,
  },
  query: {
    page: 1,
    pageSize: 50,
    sortBy: '',
    sortOrder: '',
    statusNames: '',
    search: '',
    roleNames: '',
    departmentNames: '',
    memberUserId: null,
    isDeletedFilter: false,
  },
  loading: false,
  error: null,
  isProfileUpdated: false,
  isPasswordChanged: false,
  isImageUploading: false,
  itemToDelete: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getAllUsersSuccess: (state, action) => {
      const items = action.payload?.items || [];
      const totalCount = action.payload?.totalCount || 0;
      state.userList = { items, totalCount };
      state.loading = false;
    },
    createUserSuccess: (state, action) => {
      state.userList.items.unshift(action.payload);
      state.userList.totalCount += 1;
      state.loading = false;
    },
    updateUserSuccess: (state, action) => {
      state.isProfileUpdated = true;
      state.loading = false;
    },
    
    deleteUserRequest: (state, action) => {
      const { userId } = action.payload;
      const userIndex = state.userList.items.findIndex(user => user.userId === userId);
      if (userIndex !== -1) {
        state.itemToDelete = { index: userIndex, user: state.userList.items[userIndex] };
        state.userList.items.splice(userIndex, 1);
        state.userList.totalCount -=1;
      }
      state.loading = true; 
    },
    deleteUserSuccess: (state) => {
      state.loading = false;
      state.itemToDelete = null;
    },
    deleteUserFailure: (state, action) => {
      if (state.itemToDelete) {
        state.userList.items.splice(state.itemToDelete.index, 0, state.itemToDelete.user);
        state.userList.totalCount +=1;
      }
      state.loading = false;
      state.error = action.payload;
      state.itemToDelete = null;
    },

    uploadProfileImageRequest: (state) => {
      state.isImageUploading = true;
      state.error = null;
    },
    uploadProfileImageSuccess: (state, action) => {
      state.isImageUploading = false;
      if (state.userProfileDetail) {
        state.userProfileDetail.profilePhotoUrl = action.payload.imageUrl;
      }
    },
    uploadProfileImageFailure: (state, action) => {
      state.isImageUploading = false;
      // state.error = action.payload;
    },

    setUsersQuery: (state, action) => {
      const isFilterChange = Object.keys(action.payload).some(key => key !== 'page' && state.query[key] !== action.payload[key]);
      state.query = { ...state.query, ...action.payload };
      if (isFilterChange) {
        state.query.page = 1;
        state.loading = true; // Set loading true immediately on filter/search change
      }
    },

    getAllUsersRequest: (state) => { state.loading = true; state.error = null; },
    getUserProfileRequest: (state) => { state.loading = true; state.error = null; state.userProfileDetail = null; },
    getEmployeeProfileRequest: (state) => { state.loading = true; state.error = null; state.employeeProfileDetail = null; },
    createUserRequest: (state) => { state.loading = true; state.error = null; },
    updateUserRequest: (state) => { state.loading = true; state.error = null; state.isProfileUpdated = false; },
    updatePasswordRequest: (state) => { state.loading = true; state.error = null; state.isPasswordChanged = false; },
     changeUserPasswordRequest: (state) => { 
      state.loading = true; 
      state.error = null; 
      state.isPasswordChanged = false;
    },
    changeUserPasswordSuccess: (state) => { 
      state.loading = false; 
      state.isPasswordChanged = true;
    },
    getUserProfileSuccess: (state, action) => { state.loading = false; 
      state.userProfileDetail = action.payload; 
    },
    getEmployeeProfileSuccess: (state, action) => { state.loading = false; 
      state.employeeProfileDetail = action.payload; 
    },
    updatePasswordSuccess: (state) => { state.loading = false; state.isPasswordChanged = true; },
    
    clearUserProfileError: (state) => { state.error = null; },
    resetProfileUpdateStatus: (state) => { state.isProfileUpdated = false; },
    resetPasswordChangeStatus: (state) => { state.isPasswordChanged = false; },
  },
});

export const {
  requestStart,
  requestFailure,
  getAllUsersRequest,
  getAllUsersSuccess,
  setUsersQuery,
  createUserRequest,
  createUserSuccess,
  updateUserRequest,
  updateUserSuccess,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
  getUserProfileRequest,
  getUserProfileSuccess,
  getEmployeeProfileRequest,
  getEmployeeProfileSuccess,
  updatePasswordRequest,
  changeUserPasswordRequest,
  changeUserPasswordSuccess,
  updatePasswordSuccess,
  uploadProfileImageRequest,
  uploadProfileImageSuccess,
  uploadProfileImageFailure,
  clearUserProfileError,
  resetProfileUpdateStatus,
  resetPasswordChangeStatus,
} = userProfileSlice.actions;

export const selectUserList = (state) => state.userProfile.userList;
export const selectUsersQuery = (state) => state.userProfile.query;
export const selectUserProfileLoading = (state) => state.userProfile.loading;
export const selectUserProfileError = (state) => state.userProfile.error;
export const selectUserProfile = (state) => state.userProfile.userProfileDetail;
export const selectEmployeeProfile = (state) => state.userProfile.employeeProfileDetail;
export const selectIsProfileUpdated = (state) => state.userProfile.isProfileUpdated;
export const selectIsPasswordChanged = (state) => state.userProfile.isPasswordChanged;
export const selectIsImageUploading = (state) => state.userProfile.isImageUploading;

export default userProfileSlice.reducer;
