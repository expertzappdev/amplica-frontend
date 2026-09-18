import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { RoleAPI } from '../../../services/api';
import {
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
  selectRolesQuery,
} from './roleSlice';
import toast from 'react-hot-toast';

function* handleFetchRoles({ payload }) {
  try {
    const response = yield call(RoleAPI.getAllRoles);
    
    if (response.data && response.data.statusCode === 200) {
      let rolesData = response.data.data;
      
      // Apply filters if provided in payload
      if (payload) {
        // Apply search filter
        if (payload.search) {
          rolesData = rolesData.filter(role => 
            role.roleName.toLowerCase().includes(payload.search.toLowerCase())
          );
        }
        
        // Apply status filter
        if (payload.isActive !== '' && payload.isActive !== undefined) {
          rolesData = rolesData.filter(role => 
            role.isActive.toString() === payload.isActive
          );
        }
        
        // Apply default role filter
        if (payload.defaultRole !== '' && payload.defaultRole !== undefined) {
          rolesData = rolesData.filter(role => 
            role.defaultRole === payload.defaultRole
          );
        }
        
        // Apply sorting
        if (payload.sortBy) {
          rolesData.sort((a, b) => {
            let aValue = a[payload.sortBy];
            let bValue = b[payload.sortBy];
            
            if (payload.sortBy === 'createdAt' || payload.sortBy === 'updatedAt') {
              aValue = new Date(aValue || 0);
              bValue = new Date(bValue || 0);
            } else if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (payload.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });
        }
        
        // Apply pagination
        const startIndex = ((payload.page || 1) - 1) * (payload.pageSize || 10);
        const endIndex = startIndex + (payload.pageSize || 10);
        const paginatedData = rolesData.slice(startIndex, endIndex);
        
        // Return paginated result
        const result = {
          items: paginatedData,
          totalCount: rolesData.length
        };
        
        yield put(fetchRolesSuccess(result));
      } else {
        // No filters, return all data
        const result = {
          items: rolesData,
          totalCount: rolesData.length
        };
        yield put(fetchRolesSuccess(result));
      }
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch roles'));
    }
  } catch (error) {
    console.error('Error fetching roles:', error);
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleGetRoleById({ payload: roleId }) {
  try {
    const response = yield call(RoleAPI.getRoleById, roleId);
    if (response.data && response.data.statusCode === 200) {
      yield put(getRoleByIdSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch role details'));
    }
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleCreateRole({ payload }) {
  const { roleData } = payload;
  try {
    const response = yield call(RoleAPI.createRole, roleData);
    if (response.data && response.data.statusCode === 201) {
      yield put(createRoleSuccess(response.data.data));
      
      // Refresh the role list
      const currentQuery = yield select(selectRolesQuery);
      yield put(fetchRolesRequest(currentQuery));
    } else {
      const errorMessage = response.data?.message || 'Failed to create role: Invalid server response';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('RT03: Error creating role:', error);
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during role creation.';
    yield put(requestFailure(errorMessage));
    toast.error(`Creation Failed: ${errorMessage}`);
  }
}

function* handleUpdateRole({ payload }) {
  const { roleId, roleData, onSuccess, onFailure } = payload;

  try {
    const response = yield call(RoleAPI.updateRole, roleId, roleData);
    if (response && response.status >= 200 && response.status < 300) {
      // toast.success('Role Updated Successfully');
      yield put(updateRoleSuccess(response.data?.data || response.data));
      
      // Refresh the role list
      const currentQuery = yield select(selectRolesQuery);
      yield put(fetchRolesRequest(currentQuery));
      
      // Execute the success callback if provided
      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update role';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.error('RT06: Error updating role:', error);
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
    const response = yield call(RoleAPI.deleteRole, roleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(deleteRoleSuccess(roleId));
      // toast.success('Role Deleted Successfully');
      
      // Refresh the role list
      const currentQuery = yield select(selectRolesQuery);
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

// Watcher Sagas
function* watchRoleRequests() {
  yield takeLatest(fetchRolesRequest.type, handleFetchRoles);
  yield takeLatest(getRoleByIdRequest.type, handleGetRoleById);
  yield takeLatest(createRoleRequest.type, handleCreateRole);
  yield takeLatest(updateRoleRequest.type, handleUpdateRole);
  yield takeLatest(deleteRoleRequest.type, handleDeleteRole);
}

export default function* roleSagas() {
  yield all([
    watchRoleRequests(),
  ]);
}
