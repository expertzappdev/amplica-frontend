import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentRoleId: null,
  roleData: null,
  query: {
    page: 1,
    pageSize: 10,
    sortBy: 'roleName',
    sortOrder: 'asc',
    search: '',
    isActive: '',
    defaultRole: '',
  },
};

const roleSlice = createSlice({
  name: 'roles',
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
    
    fetchRolesSuccess: (state, action) => {
      const responseData = action.payload;
      if (Array.isArray(responseData)) {
        state.roles = {
          items: responseData,
          totalCount: responseData.length
        };
      } else {
        state.roles = responseData || { items: [], totalCount: 0 };
      }
      state.isLoading = false;
    },
    
    // Get role by ID
    getRoleByIdSuccess: (state, action) => {
      state.roleData = action.payload;
      state.isLoading = false;
    },
    
    // Create role
    createRoleSuccess: (state, action) => {
      if (action.payload) {
        state.roles.items.unshift(action.payload);
        state.roles.totalCount += 1;
      }
      state.isLoading = false;
    },
    
    // Update role
    updateRoleSuccess: (state, action) => {
      const updatedRole = action.payload;
      if (updatedRole && updatedRole.companyRoleId) {
        const roleIndex = state.roles.items.findIndex(role => role.companyRoleId === updatedRole.companyRoleId);
        if (roleIndex !== -1) {
          state.roles.items[roleIndex] = { ...state.roles.items[roleIndex], ...updatedRole };
        }
      }
      state.isLoading = false;
    },
    
    // Delete role
    deleteRoleSuccess: (state, action) => {
      const roleIdToDelete = action.payload;
      const initialCount = state.roles.items.length;
      state.roles.items = state.roles.items.filter(role => role.companyRoleId !== roleIdToDelete);
      const newCount = state.roles.items.length;
      if (newCount < initialCount) {
        state.roles.totalCount -= (initialCount - newCount);
      }
      state.isLoading = false;
    },
    
    // Request actions (for loading states)
    fetchRolesRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    getRoleByIdRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
      state.roleData = null; 
    },
    createRoleRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    updateRoleRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    deleteRoleRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    
    // Utility actions
    setRolesQuery: (state, action) => {
      state.query = action.payload;
    },
    setCurrentRoleId: (state, action) => {
      state.currentRoleId = action.payload;
    },
    clearRolesError: (state) => {
      state.error = null;
    },
    clearEditingRoleState: (state) => {
      state.currentRoleId = null;
      state.roleData = null;
    },
  },
});

export const {
  requestStart,
  requestFailure,
  fetchRolesSuccess,
  getRoleByIdSuccess,
  createRoleSuccess,
  updateRoleSuccess,
  deleteRoleSuccess,
  fetchRolesRequest,
  getRoleByIdRequest,
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest,
  setCurrentRoleId,
  clearRolesError,
  setRolesQuery,
  clearEditingRoleState,
} = roleSlice.actions;

// Selectors
export const selectAllRoles = (state) => state.roles.roles;
export const selectRolesLoading = (state) => state.roles.isLoading;
export const selectRolesError = (state) => state.roles.error;
export const selectCurrentRoleId = (state) => state.roles.currentRoleId;
export const selectRoleData = (state) => state.roles.roleData;
export const selectRolesQuery = (state) => state.roles.query;

export default roleSlice.reducer;
