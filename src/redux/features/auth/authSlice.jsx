import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null,
  companyId: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isForgotPassword: false,
  isResetPassword: false,
  authLoading: false,
  error: null,
  permissions: [],
  // Impersonation state
  isImpersonating: false,
  impersonatedCompanyId: null,
  impersonatedCompanyName: null,
  originalToken: null,         // SA's real token preserved during impersonation
  originalCompanyId: null,     // SA's real companyId
  originalPermissions: [],     // SA's real permissions
  originalRole: null,          // SA's real role (e.g. 'Super Admin')
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    loginRequest: (state) => {
      state.authLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.authLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.companyId = action.payload.user.companyId;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.permissions = action.payload.permissions;
      state.error = null;
    },

    loginFailure: (state, action) => {
      state.authLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.companyId = null;
      state.permissions = [];
    },

    logoutRequest: (state) => {
      state.authLoading = true;
    },

    logoutSuccess: (state) => {
      state.authLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.role = null;
      state.companyId = null;
      state.permissions = [];
    },

    logoutFailure: (state, action) => {
      state.authLoading = false;
      state.error = action.payload;
    },

    setInitialAuth: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.companyId = action.payload.user.companyId;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.permissions = action.payload.permissions;
      state.authLoading = false;
    },
    authCheckFinished: (state) => {
      state.authLoading = false;
    },

    forgotPasswordRequest: (state) => {
      state.authLoading = true;
      state.error = null;
    },

    forgotPasswordSuccess: (state) => {
      state.authLoading = false;
      state.error = null;
      state.isForgotPassword = true;
    },
    forgotPasswordFailure: (state, action) => {
      state.authLoading = false;
      state.error = action.payload;
    },


    resetPasswordRequest: (state) => {
      // state.authLoading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.authLoading = false;
      state.isResetPassword = true;
    },
    resetPasswordFailure: (state, action) => {
      state.authLoading = false;
      state.error = action.payload;
    },

    refreshTokenRequest: (state) => {
      // state.authLoading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action) => {
      state.authLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.error = null;
    },
    refreshTokenFailure: (state, action) => {
      state.authLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
    clearIsForgotPassword: (state) => {
      state.isForgotPassword = false;
    },
    clearIsResetPassword: (state) => {
      state.isResetPassword = false;
    },

    setAuthData: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.authLoading = false;
      state.error = null;
    },

    // --- Impersonation Reducers ---
    impersonateRequest: (state) => {
      state.authLoading = true;
      state.error = null;
    },

    impersonateSuccess: (state, action) => {
      // Preserve original SA token & context before switching
      state.originalToken = state.accessToken;
      state.originalCompanyId = state.companyId;
      state.originalPermissions = state.permissions;
      state.originalRole = state.role;           // ← Save SA role
      // Switch to impersonation token & context
      state.accessToken = action.payload.token;
      state.companyId = action.payload.impersonatedCompanyId;
      state.permissions = action.payload.permissions;
      state.role = 'Company Admin';              // ← Switch role so router enters /app/* layout
      state.isImpersonating = true;
      state.impersonatedCompanyId = action.payload.impersonatedCompanyId;
      state.impersonatedCompanyName = action.payload.companyName;
      state.authLoading = false;
      state.error = null;
    },

    impersonateFailure: (state, action) => {
      state.authLoading = false;
      state.error = action.payload;
    },

    exitImpersonation: (state) => {
      // Restore original SA token & context
      state.accessToken = state.originalToken;
      state.companyId = state.originalCompanyId;
      state.permissions = state.originalPermissions;
      state.role = state.originalRole;           // ← Restore SA role so router goes back to /super-admin/*
      // Clear impersonation state
      state.isImpersonating = false;
      state.impersonatedCompanyId = null;
      state.impersonatedCompanyName = null;
      state.originalToken = null;
      state.originalCompanyId = null;
      state.originalPermissions = [];
      state.originalRole = null;
      state.error = null;
    },

    // Trigger action watched by the saga (to restore axios token before exiting)
    exitImpersonationRequest: (state) => {
      // No state change here — saga handles restoring token, then dispatches exitImpersonation
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  setInitialAuth,
  authCheckFinished,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  clearAuthError,
  setAuthData,
  clearIsForgotPassword,
  clearIsResetPassword,
  impersonateRequest,
  impersonateSuccess,
  impersonateFailure,
  exitImpersonation,
  exitImpersonationRequest,
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsForgotPassword = (state) => state.auth.isForgotPassword;
export const selectIsResetPassword = (state) => state.auth.isResetPassword;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectUserCompanyId = (state) => state.auth.companyId;
export const selectPermissions = (state) => state.auth.permissions;
export const selectAuthToken = (state) => state.auth.accessToken;
export const selectAuthLoading = (state) => state.auth.authLoading;
export const selectAuthError = (state) => state.auth.error;
// Impersonation selectors
export const selectIsImpersonating = (state) => state.auth.isImpersonating;
export const selectImpersonatedCompanyId = (state) => state.auth.impersonatedCompanyId;
export const selectImpersonatedCompanyName = (state) => state.auth.impersonatedCompanyName;

export default authSlice.reducer;
