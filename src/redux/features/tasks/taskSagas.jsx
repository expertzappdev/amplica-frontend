import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { TaskAPI } from '../../../services/api';
import {
  requestFailure,
  fetchTasksSuccess,
  getTaskByIdSuccess,
  getTaskByIdFailure,
  createTaskSuccess,
  createSubTaskSuccess,
  updateTaskSuccess,
  deleteTaskSuccess,
  uploadDocumentRequest,
  uploadDocumentSuccess,
  deleteTaskDocumentRequest,
  deleteTaskDocumentSuccess,
  fetchTasksByTaskListRequest,
  fetchTasksForProjectRequest,
  fetchUserTasksRequest,
  getTaskByIdRequest,
  createTaskRequest,
  createSubTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  selectCurrentProjectId,
  selectCurrentTaskListId,
  fetchAllTasksRequest,
  selectTasksQuery
} from './taskSlice';
import { getProjectByIdRequest, selectEditingProjectData, fetchProjectsRequest, selectQuery } from '../projects/projectSlice';
import toast from 'react-hot-toast';

function* refreshProjectData(projectId) {
  if (projectId) {
    yield put(getProjectByIdRequest(projectId));
    
    const projectQuery = yield select(selectQuery);
    yield put(fetchProjectsRequest(projectQuery));
  }
}

function* handleFetchTasksByTaskList({ payload }) {
  try {
    // payload can be just taskListId (backward compatibility) or an object { taskListId, params }
    const taskListId = typeof payload === 'object' && payload !== null ? payload.taskListId : payload;
    const params = typeof payload === 'object' && payload !== null ? payload.params : {};
    const response = yield call(TaskAPI.getTasksByTaskList, taskListId, params);
    yield put(fetchTasksSuccess(response.data?.data || { items: [], totalCount: 0 }));
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'Failed to fetch tasks'));
  }
}

function* handleFetchTasksForProject({ payload: projectId }) {
  try {
    const response = yield call(TaskAPI.getAllTasksForProject, projectId);
    yield put(fetchTasksSuccess(response.data?.data || { items: [], totalCount: 0 }));
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'Failed to fetch tasks'));
  }
}

function* handleFetchUserTasks({ payload }) {
  try {
    const currentQuery = yield select(selectTasksQuery);
    const apiPayload = (!payload || Object.keys(payload).length === 0) ? currentQuery : payload;
    const response = yield call(TaskAPI.getAllTasksForUser, apiPayload);

    if (response.data && response.data.statusCode === 200) {
      yield put(fetchTasksSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch tasks'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleFetchAllTasks({ payload }) {
  try {
    const currentQuery = yield select(selectTasksQuery);
    const apiPayload = (!payload || Object.keys(payload).length === 0) ? currentQuery : payload;
    const response = yield call(TaskAPI.getCompanyTasks, apiPayload);

    if (response.data && response.data.statusCode === 200) {
      yield put(fetchTasksSuccess(response.data.data));
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to fetch tasks'));
    }
  } catch (error) {
    yield put(requestFailure(error.response?.data?.message || 'An unexpected error occurred'));
  }
}

function* handleGetTaskById({ payload: taskId }) {
    try {
        const response = yield call(TaskAPI.getTaskById, taskId);
        if (response.data && response.data.statusCode === 200) {
            yield put(getTaskByIdSuccess(response.data.data));
        } else {
            yield put(getTaskByIdFailure(response.data?.message || 'Failed to fetch task details'));
        }
    } catch (error) {
        yield put(getTaskByIdFailure(error.response?.data?.message || 'An unexpected error occurred'));
    }
}

function* handleCreateTask({ payload }) {
    const { taskListId, taskData, projectId } = payload;
    try {
        const response = yield call(TaskAPI.createTask, taskListId, taskData);
        if (response.data) {
            toast.success('Task Created Successfully');
            yield put(createTaskSuccess(response.data.data));
            
            let targetProjectId = projectId;
            
            if (!targetProjectId) {
                const projectData = yield select(selectEditingProjectData);
                targetProjectId = projectData?.projectId;
            }
            if (!targetProjectId) {
                targetProjectId = yield select(selectCurrentProjectId);
            }
            const currentQuery = yield select(selectTasksQuery);
            if (currentQuery) {
                if (currentQuery.isAllTasks) {
                    yield put(fetchAllTasksRequest(currentQuery));
                } else {
                    yield put(fetchUserTasksRequest(currentQuery));
                }
            }

            if (targetProjectId) {
                yield call(refreshProjectData, targetProjectId);
            }
        } else {
             const errorMessage = 'Failed to create task: Invalid server response';
             yield put(requestFailure(errorMessage));
             toast.error(errorMessage);
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred during task creation.';
        yield put(requestFailure(errorMessage));
        toast.error(`Creation Failed: ${errorMessage}`);
    }
}

function* handleUpdateTask({ payload }) {
  const { taskId, taskData, projectId, onSuccess, onFailure } = payload;
  try {
      const response = yield call(TaskAPI.updateTask, taskId, taskData);
      
      if (response && response.status >= 200 && response.status < 300) {
          toast.success('Task Updated Successfully', { variant: 'success' });
          yield put(updateTaskSuccess(response.data?.data || response.data));

          let targetProjectId = projectId;
          
          if (!targetProjectId) {
              const projectData = yield select(selectEditingProjectData);
              targetProjectId = projectData?.projectId;
          }
          
          if (!targetProjectId) {
              targetProjectId = yield select(selectCurrentProjectId);
          }
          // REMOVED: Auto-refetching tasks causes them to disappear from the Dashboard list
          // because it uses the TasksView query which may filter out completed tasks.
          // The list is already updated in-place by updateTaskSuccess.
          // const currentQuery = yield select(selectTasksQuery);
          // if (currentQuery) {
          //     if (currentQuery.isAllTasks) {
          //         yield put(fetchAllTasksRequest(currentQuery));
          //     } else {
          //         yield put(fetchUserTasksRequest(currentQuery));
          //     }
          // }

          if (targetProjectId) {
              yield call(refreshProjectData, targetProjectId);
          }

          // Execute the success callback if provided
          if (onSuccess) {
            yield call(onSuccess);
          }
      } else {
           const errorMessage = response.data?.message || 'Failed to update task';
           yield put(requestFailure(errorMessage));
           if (onFailure) {
             yield call(onFailure, errorMessage);
           }
      }
  } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      yield put(requestFailure(errorMessage));
      toast.error('Update Failed', { variant: 'error' });
      if (onFailure) {
        yield call(onFailure, errorMessage);
      }
  }
}

function* handleDeleteTask({ payload }) {
  const { taskId, projectId } = payload;
  try {
    const response = yield call(TaskAPI.deleteTask, taskId);
    if (response && response.status >= 200 && response.status < 300) {
      yield put(deleteTaskSuccess(taskId));
      toast.success('Task Deleted Successfully', { variant: 'success' });
      
      let targetProjectId = projectId;
      
      if (!targetProjectId) {
          const projectData = yield select(selectEditingProjectData);
          targetProjectId = projectData?.projectId;
      }
      
      if (!targetProjectId) {
          targetProjectId = yield select(selectCurrentProjectId);
      }

      const currentQuery = yield select(selectTasksQuery);
      if (currentQuery) {
          if (currentQuery.isAllTasks) {
              yield put(fetchAllTasksRequest(currentQuery));
          } else {
              yield put(fetchUserTasksRequest(currentQuery));
          }
      }

      if (targetProjectId) {
          yield call(refreshProjectData, targetProjectId);
      }
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to delete task'));
    }
  } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      yield put(requestFailure(errorMessage));
      toast.error('Delete Failed', { variant: 'error' });
  }
}

function* handleCreateSubTask({ payload }) {
  const { parentTaskId, subTaskData } = payload;
  try {
    const response = yield call(TaskAPI.createSubTask, parentTaskId, subTaskData);
    if (response.data && response.data.statusCode === 201) {
      yield put(createSubTaskSuccess(response.data.data));
      yield put(getTaskByIdRequest(parentTaskId));
      const currentQuery = yield select(selectTasksQuery);
      if (currentQuery.isAllTasks) {
          yield put(fetchAllTasksRequest(currentQuery));
      } else {
          yield put(fetchUserTasksRequest(currentQuery));
      }
      toast.success('Subtask Created Successfully');
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to create subtask'));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    yield put(requestFailure(errorMessage));
    toast.error('Creation Failed', { variant: 'error' });
  }
}

function* handleUploadDocument({ payload }) {
  const { taskId, formData, projectId } = payload;
  try {
    const response = yield call(TaskAPI.uploadTaskDocument, taskId, formData);
    if (response.data && response.data.statusCode === 201) {
      yield put(uploadDocumentSuccess(response.data.data));
      yield put(getTaskByIdRequest(taskId));
      toast.success('Document Uploaded Successfully');
      
      if (projectId) {
          yield call(refreshProjectData, projectId);
      }
    } else {
      yield put(requestFailure(response.data?.message || 'Failed to upload document'));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred during upload';
    yield put(requestFailure(errorMessage));
    toast.error('Upload Failed', { variant: 'error' });
  }
}

function* handleDeleteTaskDocument({ payload }) {
  const { taskId, documentId, projectId, onSuccess, onFailure } = payload;
  try {
    yield call(TaskAPI.deleteTaskDocument, taskId, documentId);
    yield put(deleteTaskDocumentSuccess({ documentId }));
    toast.success('Document Deleted');
    
    if (projectId) {
        yield call(refreshProjectData, projectId);
    }
    
    if (onSuccess) {
      yield call(onSuccess);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete document';
    yield put(requestFailure(errorMessage));
    toast.error(`Delete Failed: ${errorMessage}`);
    if (onFailure) {
      yield call(onFailure, errorMessage);
    }
  }
}

// Watcher Sagas
function* watchTaskRequests() {
  yield takeLatest(fetchTasksByTaskListRequest.type, handleFetchTasksByTaskList);
  yield takeLatest(fetchTasksForProjectRequest.type, handleFetchTasksForProject);
  yield takeLatest(fetchUserTasksRequest.type, handleFetchUserTasks);
  yield takeLatest(fetchAllTasksRequest.type, handleFetchAllTasks);
  yield takeLatest(getTaskByIdRequest.type, handleGetTaskById);
  yield takeLatest(createTaskRequest.type, handleCreateTask);
  yield takeLatest(createSubTaskRequest.type, handleCreateSubTask);
  yield takeLatest(updateTaskRequest.type, handleUpdateTask);
  yield takeLatest(deleteTaskRequest.type, handleDeleteTask);
  yield takeLatest(uploadDocumentRequest.type, handleUploadDocument);
  yield takeLatest(deleteTaskDocumentRequest.type, handleDeleteTaskDocument);
}

export default function* taskSagas() {
  yield all([
    watchTaskRequests(),
  ]);
}
