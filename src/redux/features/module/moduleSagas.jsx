import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { ModuleAPI } from '../../../services/api';
import {
  requestFailure,
  fetchModulesSuccess,
  getModuleByIdSuccess,
  createModuleSuccess,
  updateModuleSuccess,
  deleteModuleSuccess,
  fetchPackageModulesSuccess,
  assignModuleToPackageSuccess,
  removeModuleFromPackageSuccess,
  fetchCompanyModulesSuccess,
  assignModuleToCompanySuccess,
  updateCompanyModuleAccessSuccess,
  revokeCompanyModuleAccessSuccess,
  fetchModulePermissionsSuccess,
  fetchModulesRequest,
  getModuleByIdRequest,
  createModuleRequest,
  updateModuleRequest,
  deleteModuleRequest,
  fetchPackageModulesRequest,
  assignModuleToPackageRequest,
  removeModuleFromPackageRequest,
  fetchCompanyModulesRequest,
  assignModuleToCompanyRequest,
  updateCompanyModuleAccessRequest,
  revokeCompanyModuleAccessRequest,
  fetchModulePermissionsRequest,
  selectModulesQuery,
  selectCompanyModuleQuery,
  selectCurrentPackageId,
  selectCurrentCompanyId
} from './moduleSlice';
import { fetchPackagesRequest, selectPackagesQuery } from '../package/packageSlice';
import { fetchCompaniesRequest, selectQuery } from '../company/companySlice';
import toast from 'react-hot-toast';

// Helper functions to refresh related data
function* refreshPackageData(packageId) {
  if (packageId) {
    const packagesQuery = yield select(selectPackagesQuery);
    yield put(fetchPackagesRequest(packagesQuery));
    // Refresh package modules
    yield put(fetchPackageModulesRequest(packageId));
  }
}

function* refreshCompanyData(companyId) {
  if (companyId) {
    const companiesQuery = yield select(selectQuery);
    yield put(fetchCompaniesRequest(companiesQuery));
    // Refresh company modules
    const companyModuleQuery = yield select(selectCompanyModuleQuery);
    yield put(fetchCompanyModulesRequest({ companyId, ...companyModuleQuery }));
  }
}

// Module CRUD Sagas
function* handleFetchModules({ payload }) {
  try {
    const response = yield call(ModuleAPI.getAllModules);
    if (response.data && response.status === 200) {
      yield put(fetchModulesSuccess(response.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch modules'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleGetModuleById({ payload: moduleId }) {
  try {
    const response = yield call(ModuleAPI.getModuleById, moduleId);
    if (response.data && response.data.statusCode === 200) {
      yield put(getModuleByIdSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch module details'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleCreateModule({ payload }) {
  const { moduleData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.createModule, moduleData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Module Created Successfully');
      yield put(createModuleSuccess(response.data.data));
      
      // Refresh modules list
      const currentQuery = yield select(selectModulesQuery);
      yield put(fetchModulesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create module';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during module creation';
    yield put(requestFailure(errorMessage));
    toast.error(`Creation Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleUpdateModule({ payload }) {
  const { moduleId, moduleData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.updateModule, moduleId, moduleData);
    
    if (response && response.status >= 200 && response.status < 300) {
      toast.success('Module Updated Successfully');
      yield put(updateModuleSuccess(response.data?.data || response.data));

      // Refresh modules list
      const currentQuery = yield select(selectModulesQuery);
      yield put(fetchModulesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update module';
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

function* handleDeleteModule({ payload }) {
  const { moduleId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.deleteModule, moduleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(deleteModuleSuccess(moduleId));
      toast.success('Module Deleted Successfully');
      
      // Refresh modules list
      const currentQuery = yield select(selectModulesQuery);
      yield put(fetchModulesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete module';
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

// Package Module Sagas
function* handleFetchPackageModules({ payload: packageId }) {
  try {
    const response = yield call(ModuleAPI.getPackageModules, packageId);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchPackageModulesSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch package modules'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleAssignModuleToPackage({ payload }) {
  const { packageId, moduleId, assignmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.assignModuleToPackage, packageId, moduleId, assignmentData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Module Assigned to Package Successfully');
      yield put(assignModuleToPackageSuccess(response.data.data));
      
      // Refresh package data
      yield call(refreshPackageData, packageId);

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to assign module to package';
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

function* handleRemoveModuleFromPackage({ payload }) {
  const { packageId, moduleId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.removeModuleFromPackage, packageId, moduleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(removeModuleFromPackageSuccess({ packageId, moduleId }));
      toast.success('Module Removed from Package Successfully');
      
      // Refresh package data
      yield call(refreshPackageData, packageId);

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to remove module from package';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Removal Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Company Module Sagas
function* handleFetchCompanyModules({ payload }) {
  try {
    const response = yield call(ModuleAPI.getCompanyModules, payload);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchCompanyModulesSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch company modules'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleAssignModuleToCompany({ payload }) {
  const { companyId, moduleId, accessData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.assignModuleToCompany, companyId, moduleId, accessData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Module Access Granted to Company Successfully');
      yield put(assignModuleToCompanySuccess(response.data.data));
      
      // Refresh company data
      yield call(refreshCompanyData, companyId);

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to assign module to company';
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

function* handleUpdateCompanyModuleAccess({ payload }) {
  const { companyId, moduleId, accessData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.updateCompanyModuleAccess, companyId, moduleId, accessData);
    
    if (response && response.status >= 200 && response.status < 300) {
      toast.success('Module Access Updated Successfully');
      yield put(updateCompanyModuleAccessSuccess(response.data?.data || response.data));

      // Refresh company data
      yield call(refreshCompanyData, companyId);

      if (onSuccess) {
        yield call(onSuccess, response.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update module access';
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

function* handleRevokeCompanyModuleAccess({ payload }) {
  const { companyId, moduleId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(ModuleAPI.revokeCompanyModuleAccess, companyId, moduleId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(revokeCompanyModuleAccessSuccess({ companyId, moduleId }));
      toast.success('Module Access Revoked Successfully');
      
      // Refresh company data
      yield call(refreshCompanyData, companyId);

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to revoke module access';
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
    const response = yield call(ModuleAPI.getModulePermissions, moduleId);
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
function* watchModuleRequests() {
  yield takeLatest(fetchModulesRequest.type, handleFetchModules);
  yield takeLatest(getModuleByIdRequest.type, handleGetModuleById);
  yield takeLatest(createModuleRequest.type, handleCreateModule);
  yield takeLatest(updateModuleRequest.type, handleUpdateModule);
  yield takeLatest(deleteModuleRequest.type, handleDeleteModule);
  yield takeLatest(fetchPackageModulesRequest.type, handleFetchPackageModules);
  yield takeLatest(assignModuleToPackageRequest.type, handleAssignModuleToPackage);
  yield takeLatest(removeModuleFromPackageRequest.type, handleRemoveModuleFromPackage);
  yield takeLatest(fetchCompanyModulesRequest.type, handleFetchCompanyModules);
  yield takeLatest(assignModuleToCompanyRequest.type, handleAssignModuleToCompany);
  yield takeLatest(updateCompanyModuleAccessRequest.type, handleUpdateCompanyModuleAccess);
  yield takeLatest(revokeCompanyModuleAccessRequest.type, handleRevokeCompanyModuleAccess);
  yield takeLatest(fetchModulePermissionsRequest.type, handleFetchModulePermissions);
}

export default function* moduleSagas() {
  yield all([
    watchModuleRequests(),
  ]);
}
