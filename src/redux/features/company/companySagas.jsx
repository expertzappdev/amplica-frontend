import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { CompanyAPI } from '../../../services/api';
import {
  requestFailure,
  fetchCompaniesSuccess,
  getCompanyByIdSuccess,
  createCompanySuccess,
  updateCompanySuccess,
  deleteCompanySuccess,
  getCompanyStatsRequest,
  getCompanyStatsSuccess,
  getCompanyStatsFailure,
  uploadCompanyLogoRequest,
  uploadCompanyLogoSuccess,
  uploadCompanyDocumentRequest,
  uploadCompanyDocumentSuccess,
  deleteCompanyDocumentRequest,
  deleteCompanyDocumentSuccess,
  getCompanyRolesRequest,
  getCompanyRolesSuccess,
  getCompanyRolesFailure,
  getCompanyDepartmentsRequest,
  getCompanyDepartmentsSuccess,
  getCompanyDepartmentsFailure,
  getDepartmentsRequest,
  getDepartmentsSuccess,
  getDepartmentsFailure,
  getDepartmentByIdRequest,
  getDepartmentByIdSuccess,
  getDepartmentByIdFailure,
  createDepartmentRequest,
  createDepartmentSuccess,
  createDepartmentFailure,
  updateDepartmentRequest,
  updateDepartmentSuccess,
  updateDepartmentFailure,
  deleteDepartmentRequest,
  deleteDepartmentSuccess,
  deleteDepartmentFailure,

  fetchCompaniesRequest,
  getCompanyByIdRequest,
  createCompanyRequest,
  updateCompanyRequest,
  deleteCompanyRequest,
  selectQuery,

changeCompanyUserPasswordRequest,
changeCompanyUserPasswordSuccess,
changeCompanyUserPasswordFailure,
} from './companySlice';
import toast from 'react-hot-toast';

function* handleGetAllDepartments({ payload }) {
  try {
    const response = yield call(CompanyAPI.getAllDepartments, payload);

    if (response.data && (response.data.status === 'Success' || response.data.status === 'success')) {
      const departmentsData = {
        items: response.data.data || [],
        totalCount: response.data.data?.length || 0
      };
      yield put(getDepartmentsSuccess(departmentsData));
    } else {
      yield put(getDepartmentsFailure(response.data?.message || 'Failed to fetch departments'));
    }
  } catch (error) {
    console.error("Network error fetching departments:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch departments';
    yield put(getDepartmentsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Get Department By ID
function* handleGetDepartmentById({ payload: departmentId }) {
  try {
    const response = yield call(CompanyAPI.getDepartmentById, departmentId);

    if (response.data && (response.data.status === 'Success' || response.data.status === 'success')) {
      yield put(getDepartmentByIdSuccess(response.data.data));
    } else {
      yield put(getDepartmentByIdFailure(response.data?.message || 'Failed to fetch department details'));
    }
  } catch (error) {
    console.error("Network error getting department by ID:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch department details';
    yield put(getDepartmentByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Create Department
function* handleCreateDepartment({ payload }) {
  const { departmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(CompanyAPI.createDepartment, departmentData);

    if (response.data && (response.data.status === 'Success' || response.data.status === 'success')) {
      const newDepartment = response.data.data;
      yield put(createDepartmentSuccess(newDepartment));
      // toast.success('Department created successfully');

      // Refresh departments list
      yield put(getDepartmentsRequest({}));

      if (onSuccess) {
        yield call(onSuccess, newDepartment);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create department';
      yield put(createDepartmentFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.error("Network error creating department:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create department';
    yield put(createDepartmentFailure(errorMessage));
    toast.error('Creation Failed: ' + errorMessage);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Update Department
function* handleUpdateDepartment({ payload }) {
  const { departmentId, departmentData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(CompanyAPI.updateDepartment, departmentId, departmentData);

    if (response && (response.status === 204 || response.data?.status === 'success' || response.data?.status === 'Success')) {
      // Since API returns 204 No Content, we need to construct the updated department
      const updatedDepartment = {
        deptId: departmentId,
        ...departmentData,
        updatedAt: new Date().toISOString()
      };

      yield put(updateDepartmentSuccess(updatedDepartment));
      // toast.success('Department updated successfully');

      // Refresh department details
      yield put(getDepartmentByIdRequest(departmentId));

      // Refresh departments list
      yield put(getDepartmentsRequest({}));

      if (onSuccess) {
        yield call(onSuccess, updatedDepartment);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update department';
      yield put(updateDepartmentFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.error("Network error updating department:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update department';
    yield put(updateDepartmentFailure(errorMessage));
    toast.error('Update Failed: ' + errorMessage);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Delete Department
function* handleDeleteDepartment({ payload }) {
  const { departmentId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(CompanyAPI.deleteDepartment, departmentId);

    if (response && (response.status === 204 || response.data?.status === 'success' || response.data?.status === 'Success')) {
      yield put(deleteDepartmentSuccess(departmentId));
      // toast.success('Department deleted successfully');

      // Refresh departments list
      yield put(getDepartmentsRequest({}));

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete department';
      yield put(deleteDepartmentFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.error("Network error deleting department:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete department';
    yield put(deleteDepartmentFailure(errorMessage));
    toast.error('Delete Failed: ' + errorMessage);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Existing sagas (keep all your existing functions)
function* handleFetchCompanies({ payload }) {
  try {
    const defaults = { page: 1, pageSize: 5 };
    const queryParams = { ...defaults, ...payload };

    const response = yield call(CompanyAPI.getAllCompanies, queryParams);

    if (response.data && response.data.status === 'success') {
      yield put(fetchCompaniesSuccess({
        items: response.data.data?.items || response.data.data || [],
        totalCount: response.data.data?.totalCount || response.data.data?.length || 0
      }));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch companies'));
    }
  } catch (error) {
    console.error("Network error fetching companies:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch companies';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Dashboard Stats Saga
function* handleGetCompanyStats({ payload }) {
  try {
    const response = yield call(CompanyAPI.getCompanyStats, payload);

    if (response.data && response.data.status === 'success') {
      yield put(getCompanyStatsSuccess(response.data.data));
    } else {
      yield put(getCompanyStatsFailure(response.data?.message || 'Failed to fetch dashboard stats'));
    }
  } catch (error) {
    console.error("Network error fetching company stats:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
    yield put(getCompanyStatsFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* handleGetCompanyById({ payload: companyId }) {
  try {
    console.log("T3 ~ handleGetCompanyById ~ companyId:", companyId)
    const response = yield call(CompanyAPI.getCompanyById, companyId);
    console.log("T4 ~ handleGetCompanyById ~ response:", response)

    if (response.data && response.data.status === 'success') {
      yield put(getCompanyByIdSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch company details'));
    }
  } catch (error) {
    console.error("Network error getting company by ID:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company details';
    yield put(requestFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* handleCreateCompany({ payload }) {
  const { companyData, resolve, reject } = payload;
  try {
    const response = yield call(CompanyAPI.createCompany, companyData);

    if (response.data && response.data.status === 'success') {
      const newCompanyData = response.data.data;
      yield put(createCompanySuccess(newCompanyData));
      toast.success('Company Created Successfully');

      const currentQuery = yield select(selectQuery);
      yield put(fetchCompaniesRequest(currentQuery));

      if (resolve) {
        yield call(resolve, {
          success: true,
          companyId: newCompanyData.companyId || newCompanyData.id,
          companyRoles: newCompanyData.companyRoles
        });
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create company';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (reject) {
        yield call(reject, { success: false, error: errorMessage });
      }
    }
  } catch (error) {
    console.error("Network error creating company:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create company';
    yield put(requestFailure(errorMessage));
    toast.error('Creation Failed: ' + errorMessage);
    if (reject) {
      yield call(reject, { success: false, error: errorMessage });
    }
  }
}

function* handleUpdateCompany({ payload }) {
  const { companyId, companyData, resolve, reject } = payload;
  try {
    const response = yield call(CompanyAPI.updateCompany, companyId, companyData);
    if (response && (response.status === 204 || response.data?.status === 'success')) {
      yield put(updateCompanySuccess());
      toast.success('Company Updated Successfully');

      yield put(getCompanyByIdRequest(companyId));

      const currentQuery = yield select(selectQuery);
      yield put(fetchCompaniesRequest(currentQuery));
      if (resolve) yield call(resolve, { success: true });
    } else {
      const errorMessage = response.data?.message || 'Failed to update company';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (reject) yield call(reject, { success: false, error: errorMessage });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update company';
    yield put(requestFailure(errorMessage));
    toast.error('Update Failed: ' + errorMessage);
    if (reject) yield call(reject, { success: false, error: errorMessage });
  }
}

function* handleDeleteCompany({ payload }) {
  const { companyId } = payload;
  try {
    const response = yield call(CompanyAPI.deleteCompany, companyId);

    if (response && (response.status === 204 || response.data?.status === 'success')) {
      yield put(deleteCompanySuccess(companyId));
      toast.success('Company Deleted Successfully');

      const currentQuery = yield select(selectQuery);
      yield put(fetchCompaniesRequest(currentQuery));
    } else {
      const errorMessage = response.data?.message || 'Failed to delete company';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error("Network error deleting company:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete company';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed: ' + errorMessage);
  }
}

function* handleUploadCompanyLogo({ payload }) {
  const { formData, companyId } = payload;
  try {
    const response = yield call(CompanyAPI.uploadCompanyLogo, formData, companyId);

    if (response.data && response.data.status === 'success') {
      yield put(uploadCompanyLogoSuccess(response.data.data));
      yield put(getCompanyByIdRequest(companyId));
      toast.success('Company Logo Uploaded Successfully');
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to upload logo'));
    }
  } catch (error) {
    console.error("Network error uploading company logo:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload company logo';
    yield put(requestFailure(errorMessage));
    toast.error('Upload Failed: ' + errorMessage);
  }
}

function* handleUploadCompanyDocument({ payload }) {
  const { formData, companyId } = payload;
  try {
    const response = yield call(CompanyAPI.uploadCompanyDocument, formData, companyId);

    if (response.data && response.data.status === 'success') {
      yield put(uploadCompanyDocumentSuccess(response.data.data));
      yield put(getCompanyByIdRequest(companyId));
      toast.success('Company Document Uploaded Successfully');
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to upload document'));
    }
  } catch (error) {
    console.error("Network error uploading company document:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload company document';
    yield put(requestFailure(errorMessage));
    toast.error('Upload Failed: ' + errorMessage);
  }
}

function* handleDeleteCompanyDocument({ payload }) {
  const { companyId, documentId, onSuccess, onFailure } = payload;
  try {
    const response = yield call(CompanyAPI.deleteCompanyDocument, companyId, documentId);

    if (response && (response.status === 204 || response.data?.status === 'success')) {
      yield put(deleteCompanyDocumentSuccess({ documentId }));
      toast.success('Document Deleted Successfully');

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete document';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.error("Network error deleting company document:", error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete document';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed: ' + errorMessage);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Company Roles Saga
function* handleGetCompanyRoles() {
  try {
    const queryParams = { page: 1, pageSize: 25 };
    const response = yield call(CompanyAPI.getCompanyRoles, queryParams);

    if (response.data && (response.data.status === 'success' || response.data.status === 'Success')) {
      yield put(getCompanyRolesSuccess(response.data.data || []));
    } else {
      yield put(getCompanyRolesFailure(response.data?.message || 'Failed to fetch company roles'));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company roles';
    yield put(getCompanyRolesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// Company Departments Saga
function* handleGetCompanyDepartments() {
  try {
    const queryParams = { page: 1, pageSize: 25 };
    const response = yield call(CompanyAPI.getCompanyDepartment, queryParams);

    if (response.data && (response.data.status === 'success' || response.data.status === 'Success')) {
      yield put(getCompanyDepartmentsSuccess(response.data.data || []));
    } else {
      yield put(getCompanyDepartmentsFailure(response.data?.message || 'Failed to fetch company departments'));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company departments';
    yield put(getCompanyDepartmentsFailure(errorMessage));
    const isPermissionError =
      error.response?.status === 403 ||
      errorMessage.includes('required permissions') ||
      errorMessage.includes('department:read');

    if (!isPermissionError) {
      toast.error(errorMessage);
    }
  }
}


//Comapny-Sagas for changing company user password
function* handleChangeCompanyUserPassword({ payload }) {
  const { userId, newPassword, confirmPassword } = payload;

  try {
    const response = yield call(
      CompanyAPI.changeCompanyUserPassword,
      userId,
      {
        newPassword,
        confirmPassword,
      }
    );

    if (
      response.data &&
      (response.data.status === 'success' ||
        response.data.status === 'Success')
    ) {
      yield put(changeCompanyUserPasswordSuccess());
      toast.success('Password Changed Successfully');
    } else {
      const errorMessage =
        response.data?.message || 'Failed to change password';

      yield put(changeCompanyUserPasswordFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('Network error changing company user password:', error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to change password';

    yield put(changeCompanyUserPasswordFailure(errorMessage));
    toast.error('Password Change Failed: ' + errorMessage);
  }
}

// Existing Watcher Sagas
function* watchCompanyRequests() {
  yield takeLatest(fetchCompaniesRequest.type, handleFetchCompanies);
  yield takeLatest(getCompanyStatsRequest.type, handleGetCompanyStats);
  yield takeLatest(getCompanyByIdRequest.type, handleGetCompanyById);
  yield takeLatest(createCompanyRequest.type, handleCreateCompany);
  yield takeLatest(updateCompanyRequest.type, handleUpdateCompany);
  yield takeLatest(deleteCompanyRequest.type, handleDeleteCompany);
  yield takeLatest(uploadCompanyLogoRequest.type, handleUploadCompanyLogo);
  yield takeLatest(uploadCompanyDocumentRequest.type, handleUploadCompanyDocument);
  yield takeLatest(deleteCompanyDocumentRequest.type, handleDeleteCompanyDocument);
  yield takeLatest(getCompanyRolesRequest.type, handleGetCompanyRoles);
  yield takeLatest(getCompanyDepartmentsRequest.type, handleGetCompanyDepartments);
  yield takeLatest(getDepartmentsRequest.type, handleGetAllDepartments);
  yield takeLatest(getDepartmentByIdRequest.type, handleGetDepartmentById);
  yield takeLatest(createDepartmentRequest.type, handleCreateDepartment);
  yield takeLatest(updateDepartmentRequest.type, handleUpdateDepartment);
  yield takeLatest(deleteDepartmentRequest.type, handleDeleteDepartment);
  yield takeLatest(changeCompanyUserPasswordRequest.type,handleChangeCompanyUserPassword);
}

export default function* companySagas() {
  yield all([
    watchCompanyRequests(),
  ]);
}
