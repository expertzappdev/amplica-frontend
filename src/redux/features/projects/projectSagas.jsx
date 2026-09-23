import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { ProjectAPI } from '../../../services/api';
import {
  fetchProjectsRequest,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  getProjectByIdRequest,
  getProjectByIdSuccess,
  getProjectByIdFailure,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
  updateProjectRequest,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectRequest,
  deleteProjectSuccess,
  deleteProjectFailure,
  fetchStatusesFailure,
  fetchStatusesSuccess,
  fetchStatusesRequest,
  uploadDocumentRequest,
  uploadDocumentSuccess,
  uploadDocumentFailure,
  deleteProjectDocumentRequest,
  deleteProjectDocumentSuccess,
  addProjectMemberRequest,
  addProjectMemberSuccess,
  addProjectMemberFailure,
  deleteProjectMemberRequest,
  deleteProjectMemberSuccess,
  deleteProjectMemberFailure,
  selectQuery,
  fetchDropdownProjectsRequest,
  fetchDropdownProjectsSuccess,
  fetchDropdownProjectsFailure
} from './projectSlice';
import { selectUserCompanyId } from '../auth/authSlice';
import toast from 'react-hot-toast';


function* handleFetchProjects({ payload }) {
  try {
    const currentQuery = yield select(selectQuery);
    const apiPayload = (!payload || Object.keys(payload).length === 0) ? currentQuery : { ...currentQuery, ...payload };
    const response = yield call(ProjectAPI.getAllProjects, apiPayload );
    const responseData = response.data;
    // yield put(fetchProjectsSuccess(responseData.data.items));
    if (response.statusCode === 200) {
      yield put(fetchProjectsSuccess(responseData));
    } else {
      yield put(fetchProjectsFailure(response?.message || 'API returned an unsuccessful status code.'));
    }
  } catch (error) {
    yield put(fetchProjectsFailure(error.response?.data?.message || error.message || 'Failed to fetch projects'));
  }
}

function* handleFetchDropdownProjects({ payload }) {
  try {
    const defaults = { page: 1, pageSize: 200 }; // Larger page size for dropdowns
    const response = yield call(ProjectAPI.getAllProjects, { ...defaults, ...payload });
    if (response.statusCode === 200) {
      yield put(fetchDropdownProjectsSuccess(response.data));
    } else {
      yield put(fetchDropdownProjectsFailure(response?.message || 'API returned an unsuccessful status code.'));
    }
  } catch (error) {
    yield put(fetchDropdownProjectsFailure(error.response?.data?.message || error.message || 'Failed to fetch dropdown projects'));
  }
}
function* handleGetProjectById(action) {
  try {
    const projectId = action.payload;
    const response = yield call(ProjectAPI.getProjectById, projectId);
    yield put(getProjectByIdSuccess(response?.data));
  } catch (error) {
    yield put(getProjectByIdFailure(error.response?.data?.message || error.message || 'Failed to fetch project details'));
  }
}

function* handleCreateProject(action) {
  try {
    const newProjectData = action.payload;
    const companyId = yield select(selectUserCompanyId); 
    const projectDataWithCompanyId = { ...newProjectData, companyId }; 

    const response = yield call(ProjectAPI.createProject, projectDataWithCompanyId);
    toast.success('Project Created', { variant: 'success' });


    yield put(createProjectSuccess(response.data));
    const currentQuery = yield select(selectQuery);
    yield put(fetchProjectsRequest(currentQuery));
  } catch (error) {

    yield put(createProjectFailure(error.response?.data?.message || error.message || 'Failed to create project'));
  }
}

function* handleUpdateProject(action) {
  try {
    const { projectId, changes } = action.payload;
    const response = yield call(ProjectAPI.updateProject, projectId, changes);
    yield put(updateProjectSuccess(response.data));
    const currentQuery = yield select(selectQuery);
    yield put(fetchProjectsRequest(currentQuery));
    toast.success('Project Updated', { variant: 'success' });
     yield put(getProjectByIdRequest(projectId));
  } catch (error) {
     yield put(updateProjectFailure(error.response?.data?.message || error.message || 'Failed to update project'));
  }
}

function* handleDeleteProject(action) {
  try {
    const projectId = action.payload;
    const response = yield call(ProjectAPI.deleteProject, projectId.projectId);
    toast.success('Project Deleted', { variant: 'success' });
    yield put(deleteProjectSuccess(projectId));
    const currentQuery = yield select(selectQuery);
    yield put(fetchProjectsRequest(currentQuery));
  } catch (error) {
    toast.error('Project Deletion Failed', { variant: 'error' });
    yield put(deleteProjectFailure(error.response?.data?.message || error.message || 'Failed to delete project'));
  }
}

function* handleFetchStatuses() {
  try {
    const res = yield call(ProjectAPI.getAllStatuses);
    yield put(fetchStatusesSuccess(res.data.data));
  } catch (err) {
    yield put(fetchStatusesFailure(err.message || 'Failed to load statuses'));
  }
}
function* handleUploadProjectDocument({ payload }) {
  // const { projectId, file, documentName } = action.payload;
  const { projectId, formData } = payload;
  try {
    
    // // Create FormData properly
    // const formData = new FormData();
    // formData.append('File', file);
    // formData.append('DocumentName', documentName || file.name);

    const response = yield call(ProjectAPI.uploadProjectDocument, projectId, formData);
    
    toast.success('Document uploaded successfully');
    yield put(uploadDocumentSuccess());
    yield put(getProjectByIdRequest(projectId));
    
  } catch (error) {
    
    if (error.code === 'ERR_NETWORK' && error.config) {
      yield put(getProjectByIdRequest(projectId));
      toast.success('Document uploaded ');
      yield put(uploadDocumentSuccess());
    } else {
      toast.error('Upload failed');
      yield put(uploadDocumentFailure(error.message || 'Document upload failed'));
    }
  }
}


function* handleDeleteProjectDocument({ payload }) {
  const { projectId, documentId, onSuccess, onFailure } = payload;
  try {
    yield call(ProjectAPI.deleteProjectDocument, projectId, documentId);
    yield put(deleteProjectDocumentSuccess({ documentId }));
    toast.success('Document Deleted', { variant: 'success' });

    if (onSuccess) {
      yield call(onSuccess);
    }
      yield put(getProjectByIdRequest(projectId))

  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete document';
    yield put(uploadDocumentFailure(errorMessage)); 
    
    toast.error('Delete Failed', { variant: 'error' });

    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

function* handleAddProjectMember({ payload }) {
    const { projectId, userId, onSuccess, onFailure } = payload;
    try {
        const memberData = { userId };
        yield call(ProjectAPI.addProjectMember, projectId, memberData);

        yield put(addProjectMemberSuccess());
        toast.success('Member Added Successfully', { variant: 'success' });

        yield put(getProjectByIdRequest(projectId));

        if (onSuccess) {
            yield call(onSuccess);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to add member';
        yield put(addProjectMemberFailure(errorMessage));
        toast.error('Failed to Add Member', { variant: 'error' });

        if (onFailure) {
            yield call(onFailure, errorMessage);
        }
    }
}

function* handleDeleteProjectMember({ payload }) {
    const { projectId, userId, onSuccess, onFailure } = payload;
    try {
        yield call(ProjectAPI.deleteProjectMember, projectId, userId);
        yield put(deleteProjectMemberSuccess({ userId }));
        toast.success('Member Removed', { variant: 'success' });

        yield put(getProjectByIdRequest(projectId));
        if (onSuccess) {
            yield call(onSuccess);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to remove member';
        yield put(deleteProjectMemberFailure(errorMessage));
        toast.error('Failed to Remove Member', { variant: 'error' });

    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// --- Watcher Sagas ---
function* watchUploadProjectDocument() {
  yield takeLatest(uploadDocumentRequest.type, handleUploadProjectDocument);
}
function* watchFetchProjectsRequest() {
  yield takeLatest(fetchProjectsRequest.type, handleFetchProjects);
}
function* watchGetProjectByIdRequest() {
  yield takeLatest(getProjectByIdRequest.type, handleGetProjectById);
}
function* watchCreateProjectRequest() {
  yield takeLatest(createProjectRequest.type, handleCreateProject);
}
function* watchUpdateProjectRequest() {
  yield takeLatest(updateProjectRequest.type, handleUpdateProject);
}
function* watchDeleteProjectRequest() {
  yield takeLatest(deleteProjectRequest.type, handleDeleteProject);
}
function* watchFetchStatusesRequest() {
  yield takeLatest(fetchStatusesRequest.type, handleFetchStatuses);
}
function* watchDeleteProjectDocument() {
    yield takeLatest(deleteProjectDocumentRequest.type, handleDeleteProjectDocument);
}
function* watchAddProjectMember() {
    yield takeLatest(addProjectMemberRequest.type, handleAddProjectMember);
}
function* watchDeleteProjectMember() {
    yield takeLatest(deleteProjectMemberRequest.type, handleDeleteProjectMember);
}
function* watchFetchDropdownProjects() {
    yield takeLatest(fetchDropdownProjectsRequest.type, handleFetchDropdownProjects);
}

export default function* projectSagas() {
  yield all([
    watchFetchProjectsRequest(),
    watchGetProjectByIdRequest(),
    watchCreateProjectRequest(),
    watchUpdateProjectRequest(),
    watchDeleteProjectRequest(),
    watchFetchStatusesRequest(),
    watchUploadProjectDocument(),
    watchDeleteProjectDocument(),
    watchAddProjectMember(),
    watchDeleteProjectMember(),
    watchFetchDropdownProjects(),
  ]);
}