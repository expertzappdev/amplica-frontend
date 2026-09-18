import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  permissions: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentPermissionId: null,
  permissionData: null,
  isAssigningPermission: false,
  isDeletingPermission: false,
  currentUserId: null,
  currentRoleId: null,
  currentModuleId: null,
  userPermissions: {
    items: [],
    totalCount: 0,
  },
  rolePermissions: {
    items: [],
    totalCount: 0,
  },
  modulePermissions: {
    items: [],
    totalCount: 0,
  },
  roles: {
    items: [],
    totalCount: 0,
  },
  userRoles: {
    items: [],
    totalCount: 0,
  },
  query: {
    page: 1,
    pageSize: 200,
    sortBy: '',
    sortOrder: '',
    status: '', // active, inactive
    search: '',
    permissionType: '', // read, write, delete, admin
    category: '', // module, system, api
    moduleId: null,
    createdDateFrom: null,
    createdDateTo: null,
  },
  roleQuery: {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '', // active, inactive
    search: '',
    roleType: '', // admin, user, custom
    companyId: null,
  },
  userPermissionQuery: {
    page: 1,
    pageSize: 200,
    sortBy: '',
    sortOrder: '',
    userId: null,
    roleId: null,
    moduleId: null,
    permissionType: '',
    assignedDateFrom: null,
    assignedDateTo: null,
  },
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.isAssigningPermission = false;
      state.isDeletingPermission = false;
      state.error = action.payload;
    },

    // Permission CRUD Operations
    fetchPermissionsSuccess: (state, action) => {
      state.permissions = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    getPermissionByIdSuccess: (state, action) => {
      state.permissionData = action.payload;
      state.isLoading = false;
    },
    createPermissionSuccess: (state, action) => {
      if (action.payload) {
        state.permissions.items.unshift(action.payload);
        state.permissions.totalCount += 1;
      }
      state.isLoading = false;
    },
    updatePermissionSuccess: (state, action) => {
      const updatedPermission = action.payload;
      if (updatedPermission && updatedPermission.permissionId) {
        const permissionIndex = state.permissions.items.findIndex(
          permission => permission.permissionId === updatedPermission.permissionId
        );
        if (permissionIndex !== -1) {
          state.permissions.items[permissionIndex] = {
            ...state.permissions.items[permissionIndex],
            ...updatedPermission
          };
        }
      }
      state.isLoading = false;
    },
    deletePermissionSuccess: (state, action) => {
      const permissionIdToDelete = action.payload;
      const initialCount = state.permissions.items.length;
      state.permissions.items = state.permissions.items.filter(
        permission => permission.permissionId !== permissionIdToDelete
      );
      const newCount = state.permissions.items.length;
      if (newCount < initialCount) {
        state.permissions.totalCount -= (initialCount - newCount);
      }
      state.isLoading = false;
    },

    // Role CRUD Operations
    fetchRolesSuccess: (state, action) => {
      state.roles = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    createRoleSuccess: (state, action) => {
      if (action.payload) {
        state.roles.items.unshift(action.payload);
        state.roles.totalCount += 1;
      }
      state.isLoading = false;
    },
    updateRoleSuccess: (state, action) => {
      const updatedRole = action.payload;
      if (updatedRole && updatedRole.roleId) {
        const roleIndex = state.roles.items.findIndex(
          role => role.roleId === updatedRole.roleId
        );
        if (roleIndex !== -1) {
          state.roles.items[roleIndex] = {
            ...state.roles.items[roleIndex],
            ...updatedRole
          };
        }
      }
      state.isLoading = false;
    },
    deleteRoleSuccess: (state, action) => {
      const roleIdToDelete = action.payload;
      const initialCount = state.roles.items.length;
      state.roles.items = state.roles.items.filter(
        role => role.roleId !== roleIdToDelete
      );
      const newCount = state.roles.items.length;
      if (newCount < initialCount) {
        state.roles.totalCount -= (initialCount - newCount);
      }
      state.isLoading = false;
    },

    // User Permission Operations
    fetchUserPermissionsSuccess: (state, action) => {
      state.userPermissions = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    assignPermissionToUserSuccess: (state, action) => {
      const assignedPermission = action.payload;
      if (assignedPermission) {
        state.userPermissions.items.unshift(assignedPermission);
        state.userPermissions.totalCount += 1;
      }
      state.isAssigningPermission = false;
    },
    revokeUserPermissionSuccess: (state, action) => {
      const { userId, permissionId } = action.payload;
      state.userPermissions.items = state.userPermissions.items.filter(
        item => !(item.userId === userId && item.permissionId === permissionId)
      );
      state.userPermissions.totalCount = Math.max(0, state.userPermissions.totalCount - 1);
      state.isLoading = false;
    },

    // Role Permission Operations
    fetchRolePermissionsSuccess: (state, action) => {
      state.rolePermissions = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    assignPermissionToRoleSuccess: (state, action) => {
      const assignedPermission = action.payload;
      if (assignedPermission) {
        state.rolePermissions.items.unshift(assignedPermission);
        state.rolePermissions.totalCount += 1;
      }
      state.isAssigningPermission = false;
    },
    revokeRolePermissionSuccess: (state, action) => {
      const { roleId, permissionId } = action.payload;
      state.rolePermissions.items = state.rolePermissions.items.filter(
        item => !(item.roleId === roleId && item.permissionId === permissionId)
      );
      state.rolePermissions.totalCount = Math.max(0, state.rolePermissions.totalCount - 1);
      state.isLoading = false;
    },

    // User Role Operations
    fetchUserRolesSuccess: (state, action) => {
      state.userRoles = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    assignRoleToUserSuccess: (state, action) => {
      const assignedRole = action.payload;
      if (assignedRole) {
        state.userRoles.items.unshift(assignedRole);
        state.userRoles.totalCount += 1;
      }
      state.isAssigningPermission = false;
    },
    revokeUserRoleSuccess: (state, action) => {
      const { userId, roleId } = action.payload;
      state.userRoles.items = state.userRoles.items.filter(
        item => !(item.userId === userId && item.roleId === roleId)
      );
      state.userRoles.totalCount = Math.max(0, state.userRoles.totalCount - 1);
      state.isLoading = false;
    },

    // Module Permission Operations
    fetchModulePermissionsSuccess: (state, action) => {
      state.modulePermissions = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },

    // Request Actions (for saga triggers)
    fetchPermissionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getPermissionByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.permissionData = null;
    },
    createPermissionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updatePermissionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deletePermissionRequest: (state) => {
      state.isDeletingPermission = true;
      state.error = null;
    },
    fetchRolesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
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
      state.isDeletingPermission = true;
      state.error = null;
    },
    fetchUserPermissionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignPermissionToUserRequest: (state) => {
      state.isAssigningPermission = true;
      state.error = null;
    },
    revokeUserPermissionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRolePermissionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignPermissionToRoleRequest: (state) => {
      state.isAssigningPermission = true;
      state.error = null;
    },
    revokeRolePermissionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchUserRolesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignRoleToUserRequest: (state) => {
      state.isAssigningPermission = true;
      state.error = null;
    },
    revokeUserRoleRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchModulePermissionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // State Management
    setCurrentPermissionId: (state, action) => {
      state.currentPermissionId = action.payload;
    },
    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload;
    },
    setCurrentRoleId: (state, action) => {
      state.currentRoleId = action.payload;
    },
    setCurrentModuleId: (state, action) => {
      state.currentModuleId = action.payload;
    },
    setPermissionsQuery: (state, action) => {
      state.query = action.payload;
    },
    setRoleQuery: (state, action) => {
      state.roleQuery = action.payload;
    },
    setUserPermissionQuery: (state, action) => {
      state.userPermissionQuery = action.payload;
    },
    clearPermissionsError: (state) => {
      state.error = null;
    },
    clearEditingPermissionState: (state) => {
      state.currentPermissionId = null;
      state.permissionData = null;
    },
    clearPermissionContext: (state) => {
      state.currentUserId = null;
      state.currentRoleId = null;
      state.currentModuleId = null;
    },
  },
});

export const {
  requestStart,
  requestFailure,
  fetchPermissionsSuccess,
  getPermissionByIdSuccess,
  createPermissionSuccess,
  updatePermissionSuccess,
  deletePermissionSuccess,
  fetchRolesSuccess,
  createRoleSuccess,
  updateRoleSuccess,
  deleteRoleSuccess,
  fetchUserPermissionsSuccess,
  assignPermissionToUserSuccess,
  revokeUserPermissionSuccess,
  fetchRolePermissionsSuccess,
  assignPermissionToRoleSuccess,
  revokeRolePermissionSuccess,
  fetchUserRolesSuccess,
  assignRoleToUserSuccess,
  revokeUserRoleSuccess,
  fetchModulePermissionsSuccess,
  fetchPermissionsRequest,
  getPermissionByIdRequest,
  createPermissionRequest,
  updatePermissionRequest,
  deletePermissionRequest,
  fetchRolesRequest,
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest,
  fetchUserPermissionsRequest,
  assignPermissionToUserRequest,
  revokeUserPermissionRequest,
  fetchRolePermissionsRequest,
  assignPermissionToRoleRequest,
  revokeRolePermissionRequest,
  fetchUserRolesRequest,
  assignRoleToUserRequest,
  revokeUserRoleRequest,
  fetchModulePermissionsRequest,
  setCurrentPermissionId,
  setCurrentUserId,
  setCurrentRoleId,
  setCurrentModuleId,
  setPermissionsQuery,
  setRoleQuery,
  setUserPermissionQuery,
  clearPermissionsError,
  clearEditingPermissionState,
  clearPermissionContext,
} = permissionSlice.actions;

// Selectors
export const selectAllPermissions = (state) => state.permissions.permissions;
export const selectPermissionsLoading = (state) => state.permissions.isLoading;
export const selectPermissionsError = (state) => state.permissions.error;
export const selectCurrentPermissionId = (state) => state.permissions.currentPermissionId;
export const selectPermissionData = (state) => state.permissions.permissionData;
export const selectIsAssigningPermission = (state) => state.permissions.isAssigningPermission;
export const selectIsDeletingPermission = (state) => state.permissions.isDeletingPermission;
export const selectCurrentUserId = (state) => state.permissions.currentUserId;
export const selectCurrentRoleId = (state) => state.permissions.currentRoleId;
export const selectCurrentModuleId = (state) => state.permissions.currentModuleId;
export const selectAllRoles = (state) => state.permissions.roles;
export const selectUserPermissions = (state) => state.permissions.userPermissions;
export const selectRolePermissions = (state) => state.permissions.rolePermissions;
export const selectUserRoles = (state) => state.permissions.userRoles;
export const selectModulePermissions = (state) => state.permissions.modulePermissions;
export const selectPermissionsQuery = (state) => state.permissions.query;
export const selectRoleQuery = (state) => state.permissions.roleQuery;
export const selectUserPermissionQuery = (state) => state.permissions.userPermissionQuery;

export default permissionSlice.reducer;
