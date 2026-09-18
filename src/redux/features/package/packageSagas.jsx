import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { PackageAPI } from '../../../services/api';
import {
  requestFailure,
  fetchPackagesSuccess,
  getPackageByIdSuccess,
  createPackageSuccess,
  updatePackageSuccess,
  deletePackageSuccess,
  purchasePackageSuccess,
  fetchPurchaseHistorySuccess,
  fetchCompanyPackagesSuccess,
  fetchPackagesRequest,
  getPackageByIdRequest,
  createPackageRequest,
  updatePackageRequest,
  deletePackageRequest,
  purchasePackageRequest,
  fetchPurchaseHistoryRequest,
  fetchCompanyPackagesRequest,
  selectPackagesQuery,
  selectPurchaseQuery,
  selectCurrentCompanyId
} from './packageSlice';
import { fetchCompaniesRequest, selectQuery } from '../company/companySlice';
import toast from 'react-hot-toast';

function* refreshCompanyData(companyId) {
  if (companyId) {
    const companiesQuery = yield select(selectQuery);
    yield put(fetchCompaniesRequest(companiesQuery));
  }
}

function* handleFetchPackages({ payload }) {
  try {
    const response = yield call(PackageAPI.getAllPackages);
    if (response.data && response.status === 200) {
      yield put(fetchPackagesSuccess(response.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch packages'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}


function* handleGetPackageById({ payload: packageId }) {
  try {
    const response = yield call(PackageAPI.getPackageById, packageId);
    if (response.data && response.data.statusCode === 200) {
      yield put(getPackageByIdSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch package details'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleCreatePackage({ payload }) {
  const { packageData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PackageAPI.createPackage, packageData);
    
    if (response.data && response.status == 201 ) {
      yield put(createPackageSuccess(response.data.data));

      // const currentQuery = yield select(selectPackagesQuery);
      yield put(fetchPackagesRequest());
      // yield put(fetchPackagesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to create package';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during package creation';
    yield put(requestFailure(errorMessage));
    toast.error(`Creation Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}


function* handleUpdatePackage({ payload }) {
  const { packageId, packageData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PackageAPI.updatePackage, packageId, packageData);
    if (response && response.status >= 200 && response.status < 300) {
      // toast.success('Package Updated Successfully');
      yield put(updatePackageSuccess(response.data?.data || response.data));

      // const currentQuery = yield select(selectPackagesQuery);
      yield put(fetchPackagesRequest());
      // yield put(fetchPackagesRequest(currentQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to update package';
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

function* handleDeletePackage({ payload }) {
  const { packageId, onSuccess, onFailure } = payload;
  console.log('PD01: Delete Package ID:', packageId);
  try {
    const response = yield call(PackageAPI.deletePackage, packageId);
    console.log('PD02: Delete Package Response:', response);
    if (response && response.status === 204) {
      yield put(deletePackageSuccess(packageId));
      // toast.success('Package Deleted Successfully');
      
      // const currentQuery = yield select(selectPackagesQuery);
      // yield put(fetchPackagesRequest(currentQuery));
      yield put(fetchPackagesRequest());

      if (onSuccess) {
        yield call(onSuccess);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to delete package';
      yield put(requestFailure(errorMessage));
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    console.log('PD03: Delete Package Error:', error);
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Delete Failed');
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handlePurchasePackage({ payload }) {
  const { companyId, packageId, purchaseData, onSuccess, onFailure } = payload;
  try {
    const response = yield call(PackageAPI.purchasePackage, companyId, packageId, purchaseData);
    if (response.data && response.data.statusCode === 201) {
      toast.success('Package Purchased Successfully');
      yield put(purchasePackageSuccess(response.data.data));
      
      yield call(refreshCompanyData, companyId);
      const purchaseQuery = yield select(selectPurchaseQuery);
      yield put(fetchPurchaseHistoryRequest(purchaseQuery));

      if (onSuccess) {
        yield call(onSuccess, response.data.data);
      }
    } else {
      const errorMessage = response.data?.message || 'Failed to purchase package';
      yield put(requestFailure(errorMessage));
      toast.error(errorMessage);
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during purchase';
    yield put(requestFailure(errorMessage));
    toast.error(`Purchase Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleFetchPurchaseHistory({ payload }) {
  try {
    const response = yield call(PackageAPI.getPurchaseHistory, payload);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchPurchaseHistorySuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch purchase history'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleFetchCompanyPackages({ payload: companyId }) {
  try {
    const response = yield call(PackageAPI.getCompanyPackages, companyId);
    if (response.data && response.data.statusCode === 200) {
      yield put(fetchCompanyPackagesSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch company packages'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

// Watcher Sagas
function* watchPackageRequests() {
  yield takeLatest(fetchPackagesRequest.type, handleFetchPackages);
  yield takeLatest(getPackageByIdRequest.type, handleGetPackageById);
  yield takeLatest(createPackageRequest.type, handleCreatePackage);
  yield takeLatest(updatePackageRequest.type, handleUpdatePackage);
  yield takeLatest(deletePackageRequest.type, handleDeletePackage);
  yield takeLatest(purchasePackageRequest.type, handlePurchasePackage);
  yield takeLatest(fetchPurchaseHistoryRequest.type, handleFetchPurchaseHistory);
  yield takeLatest(fetchCompanyPackagesRequest.type, handleFetchCompanyPackages);
}

export default function* packageSagas() {
  yield all([
    watchPackageRequests(),
  ]);
}
