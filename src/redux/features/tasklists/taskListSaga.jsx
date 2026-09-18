import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { TaskListAPI } from '../../../services/api';
import {
  fetchTaskListsRequest,
  fetchTaskListsSuccess,
  fetchTaskListsFailure,
  fetchTaskListByIdRequest,
  fetchTaskListByIdSuccess,
  fetchTaskListByIdFailure,
  createTaskListRequest,
  createTaskListSuccess,
  createTaskListFailure,
  updateTaskListRequest,
  updateTaskListSuccess,
  updateTaskListFailure,
  deleteTaskListRequest,
  deleteTaskListSuccess,
  deleteTaskListFailure,
} from './taskListSlice';
import { getProjectByIdRequest } from '../projects/projectSlice';
import toast from 'react-hot-toast';

function* handleFetchTaskLists(action) {
  try {
    const projectId = action.payload;
    const response = yield call(TaskListAPI.getAllTaskLists, projectId);
    yield put(fetchTaskListsSuccess(response.data));
  } catch (error) {
    yield put(fetchTaskListsFailure(error.response?.data?.message || error.message || 'Failed to fetch task lists'));
  }
}

function* handleFetchTaskListById(action) {
  try {
    const { taskListId } = action.payload;
    const response = yield call(TaskListAPI.getTaskListById, taskListId);
    yield put(fetchTaskListByIdSuccess(response.data));
  } catch (error) {
    yield put(fetchTaskListByIdFailure(error.response?.data?.message || error.message || 'Failed to fetch task list details'));
  }
}

function* handleCreateTaskList(action) {
  try {
    const { projectId, taskListData } = action.payload;
    
    // Correct API call using 'create' method from TaskListAPI
    const response = yield call(TaskListAPI.createTaskList, projectId, taskListData);

    if (response.data) {
        toast.success('Task List Created Successfully');
        yield put(createTaskListSuccess(response.data));
        yield put(getProjectByIdRequest(projectId)); // Refresh project data
    } else {
        throw new Error("Invalid response from server");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create task list';
    console.error("SAGA ERROR in handleCreateTaskList:", errorMessage); // Log error
    yield put(createTaskListFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* handleUpdateTaskList(action) {
  try {
    const { projectId, taskListId, taskListData } = action.payload;
    const response = yield call(TaskListAPI.updateTaskList, projectId, taskListId, taskListData); 
    yield put(updateTaskListSuccess(response.data));
    toast.success('Task List Updated Successfully');
    yield put(getProjectByIdRequest(projectId)); // Refresh project data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update task list';
    yield put(updateTaskListFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* handleDeleteTaskList(action) {
  try {
    const { projectId, taskListId } = action.payload;
    yield call(TaskListAPI.deleteTaskList, projectId, taskListId);
    yield put(deleteTaskListSuccess(taskListId));
    toast.success('Task List Deleted Successfully');
    yield put(getProjectByIdRequest(projectId)); // Refresh project data
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task list';
    yield put(deleteTaskListFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* watchFetchTaskListsRequest() {
  yield takeLatest(fetchTaskListsRequest.type, handleFetchTaskLists);
}
function* watchFetchTaskListByIdRequest() {
  yield takeLatest(fetchTaskListByIdRequest.type, handleFetchTaskListById);
}
function* watchCreateTaskListRequest() {
  yield takeLatest(createTaskListRequest.type, handleCreateTaskList);
}
function* watchUpdateTaskListRequest() {
  yield takeLatest(updateTaskListRequest.type, handleUpdateTaskList);
}
function* watchDeleteTaskListRequest() {
  yield takeLatest(deleteTaskListRequest.type, handleDeleteTaskList);
}

export default function* taskListSagas() {
  yield all([
    watchFetchTaskListsRequest(),
    watchFetchTaskListByIdRequest(),
    watchCreateTaskListRequest(),
    watchUpdateTaskListRequest(),
    watchDeleteTaskListRequest(),
  ]);
}