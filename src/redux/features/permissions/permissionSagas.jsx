import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { PermissionAPI } from '../../../services/api';
import {
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
  selectPermissionsQuery,
  selectRoleQuery,
  selectUserPermissionQuery,
  selectCurrentUserId,
  selectCurrentRoleId,
  selectCurrentModuleId
} from './permissionSlice';
import { getAllUsersRequest, selectUsersQuery } from '../profile/profileSlice';
import { fetchModulesRequest, selectModulesQuery } from '../module/moduleSlice';
import toast from 'react-hot-toast';

// Helper functions to refresh related data
function* refreshUserData(userId) {
  if (userId) {
    const usersQuery = yield select(selectUsersQuery);
    yield put(getAllUsersRequest(usersQuery));
    // Refresh user permissions
    const userPermissionQuery = yield select(selectUserPermissionQuery);
    yield put(fetchUserPermissionsRequest({ userId, ...userPermissionQuery }));
  }
}

function* refreshRoleData(roleId) {
  if (roleId) {
    const roleQuery = yield select(selectRoleQuery);
    yield put(fetchRolesRequest(roleQuery));
    // Refresh role permissions
    yield put(fetchRolePermissionsRequest(roleId));
  }
}

function* refreshModuleData(moduleId) {
  if (moduleId) {
    const modulesQuery = yield select(selectModulesQuery);
    yield put(fetchModulesRequest(modulesQuery));
    // Refresh module permissions
    yield put(fetchModulePermissionsRequest(moduleId));
  }
}

// Permission CRUD Sagas
function* handleFetchPermissions({ payload }) {
  try {
    const response = yield call(PermissionAPI.getAllPermissions, payload);
    if (response.data && response.status === 200) {
      yield put(fetchPermissionsSuccess(response.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch permissions'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleGetPermissionById({ payload: permissionId }) {
  try {
    const response = yield call(PermissionAPI.getPermissionById, permissionId);
    if (response.data && response.data.statusCode === 200) {
      yield put(getPermissionByIdSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch permission details'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleCreatePermission({ payload }) {
  const { permissionData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.createPermission, permissionData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Permission Created Successfully');
      yield put(createPermissionSuccess(response.data.data));
      
      // Refresh permissions list
      const currentQuery = yield select(selectPermissionsQuery);
      yield put(fetchPermissionsRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create permission';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during permission creation';
    yield put(requestFailure(errorMessage));
    toast.error(`Creation Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleUpdatePermission({ payload }) {
  const { permissionId, permissionData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.updatePermission, permissionId, permissionData);
    
    if (response && response.status >= 200 && response.status < 300) {
      toast.success('Permission Updated Successfully');
      yield put(updatePermissionSuccess(response.data?.data || response.data));

      // Refresh permissions list
      const currentQuery = yield select(selectPermissionsQuery);
      yield put(fetchPermissionsRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update permission';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Update Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleDeletePermission({ payload }) {
  const { permissionId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.deletePermission, permissionId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(deletePermissionSuccess(permissionId));
      toast.success('Permission Deleted Successfully');
      
      // Refresh permissions list
      const currentQuery = yield select(selectPermissionsQuery);
      yield put(fetchPermissionsRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete permission';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Role CRUD Sagas
function* handleFetchRoles({ payload }) {
  try {
    const response = yield call(PermissionAPI.getAllRoles, payload);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchRolesSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch roles'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleCreateRole({ payload }) {
  const { roleData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.createRole, roleData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Role Created Successfully');
      yield put(createRoleSuccess(response.data.data));
      
      // Refresh roles list
      const currentQuery = yield select(selectRoleQuery);
      yield put(fetchRolesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create role';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during role creation';
    yield put(requestFailure(errorMessage));
    toast.error(`Creation Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleUpdateRole({ payload }) {
  const { roleId, roleData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.updateRole, roleId, roleData);
    
    if (response && response.status >= 200 && response.status < 300) {
      toast.success('Role Updated Successfully');
      yield put(updateRoleSuccess(response.data?.data || response.data));

      // Refresh roles list and related data
      yield call(refreshRoleData, roleId);

      if (onSuccess) {
        yield call(onSuccess, response.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update role';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Update Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleDeleteRole({ payload }) {
  const { roleId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.deleteRole, roleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(deleteRoleSuccess(roleId));
      toast.success('Role Deleted Successfully');
      
      // Refresh roles list
      const currentQuery = yield select(selectRoleQuery);
      yield put(fetchRolesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete role';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// User Permission Sagas
function* handleFetchUserPermissions({ payload }) {
  try {
    const response = yield call(PermissionAPI.getUserPermissions, payload);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchUserPermissionsSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch user permissions'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleAssignPermissionToUser({ payload }) {
  const { userId, permissionId, assignmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.assignPermissionToUser, userId, permissionId, assignmentData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Permission Assigned to User Successfully');
      yield put(assignPermissionToUserSuccess(response.data.data));
      
      // Refresh user data
      yield call(refreshUserData, userId);

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to assign permission to user';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during assignment';
    yield put(requestFailure(errorMessage));
    toast.error(`Assignment Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleRevokeUserPermission({ payload }) {
  const { userId, permissionId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.revokeUserPermission, userId, permissionId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(revokeUserPermissionSuccess({ userId, permissionId }));
      toast.success('Permission Revoked Successfully');
      
      // Refresh user data
      yield call(refreshUserData, userId);

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to revoke user permission';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Revocation Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Role Permission Sagas
function* handleFetchRolePermissions({ payload: roleId }) {
  try {
    const response = yield call(PermissionAPI.getRolePermissions, roleId);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchRolePermissionsSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch role permissions'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleAssignPermissionToRole({ payload }) {
  const { roleId, permissionId, assignmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.assignPermissionToRole, roleId, permissionId, assignmentData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Permission Assigned to Role Successfully');
      yield put(assignPermissionToRoleSuccess(response.data.data));
      
      // Refresh role data
      yield call(refreshRoleData, roleId);

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to assign permission to role';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during assignment';
    yield put(requestFailure(errorMessage));
    toast.error(`Assignment Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleRevokeRolePermission({ payload }) {
  const { roleId, permissionId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.revokeRolePermission, roleId, permissionId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(revokeRolePermissionSuccess({ roleId, permissionId }));
      toast.success('Permission Revoked from Role Successfully');
      
      // Refresh role data
      yield call(refreshRoleData, roleId);

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to revoke role permission';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Revocation Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// User Role Sagas
function* handleFetchUserRoles({ payload }) {
  try {
    const response = yield call(PermissionAPI.getUserRoles, payload);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchUserRolesSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch user roles'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleAssignRoleToUser({ payload }) {
  const { userId, roleId, assignmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.assignRoleToUser, userId, roleId, assignmentData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Role Assigned to User Successfully');
      yield put(assignRoleToUserSuccess(response.data.data));
      
      // Refresh user data
      yield call(refreshUserData, userId);

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to assign role to user';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during assignment';
    yield put(requestFailure(errorMessage));
    toast.error(`Assignment Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleRevokeUserRole({ payload }) {
  const { userId, roleId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PermissionAPI.revokeUserRole, userId, roleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(revokeUserRoleSuccess({ userId, roleId }));
      toast.success('Role Revoked from User Successfully');
      
      // Refresh user data
      yield call(refreshUserData, userId);

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to revoke user role';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Revocation Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleFetchModulePermissions({ payload: moduleId }) {
  try {
    const response = yield call(PermissionAPI.getModulePermissions, moduleId);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchModulePermissionsSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch module permissions'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

// Watcher Sagas
function* watchPermissionRequests() {
  yield takeLatest(fetchPermissionsRequest.type, handleFetchPermissions);
  yield takeLatest(getPermissionByIdRequest.type, handleGetPermissionById);
  yield takeLatest(createPermissionRequest.type, handleCreatePermission);
  yield takeLatest(updatePermissionRequest.type, handleUpdatePermission);
  yield takeLatest(deletePermissionRequest.type, handleDeletePermission);
  yield takeLatest(fetchRolesRequest.type, handleFetchRoles);
  yield takeLatest(createRoleRequest.type, handleCreateRole);
  yield takeLatest(updateRoleRequest.type, handleUpdateRole);
  yield takeLatest(deleteRoleRequest.type, handleDeleteRole);
  yield takeLatest(fetchUserPermissionsRequest.type, handleFetchUserPermissions);
  yield takeLatest(assignPermissionToUserRequest.type, handleAssignPermissionToUser);
  yield takeLatest(revokeUserPermissionRequest.type, handleRevokeUserPermission);
  yield takeLatest(fetchRolePermissionsRequest.type, handleFetchRolePermissions);
  yield takeLatest(assignPermissionToRoleRequest.type, handleAssignPermissionToRole);
  yield takeLatest(revokeRolePermissionRequest.type, handleRevokeRolePermission);
  yield takeLatest(fetchUserRolesRequest.type, handleFetchUserRoles);
  yield takeLatest(assignRoleToUserRequest.type, handleAssignRoleToUser);
  yield takeLatest(revokeUserRoleRequest.type, handleRevokeUserRole);
  yield takeLatest(fetchModulePermissionsRequest.type, handleFetchModulePermissions);
}

export default function* permissionSagas() {
  yield all([
    watchPermissionRequests(),
  ]);
}
