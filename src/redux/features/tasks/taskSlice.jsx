import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  detailsError: null,
  currentTaskId: null,
  taskData: null,
  isUploading: false,
  isDeletingDocument: false,
  currentProjectId: null,
  currentTaskListId: null,
  query: {
    page: 1,
    pageSize: 5,
    sortBy: '',
    sortOrder: '',
    statusNames: '',
    search: '',
    startDateFrom: null,
    endDateTo: null,
    memberUserId: null,
    type: 'tasks', // all, tasks, todos
    isAllTasks: false, // flag to use /alltasks endpoint
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.isUploading = false;
      state.isDeletingDocument = false;
      state.error = action.payload;
    },
    fetchTasksSuccess: (state, action) => {
      state.tasks = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    getTaskByIdSuccess: (state, action) => {
      state.taskData = action.payload;
      state.isLoading = false;
      state.detailsError = null;
    },
    getTaskByIdFailure: (state, action) => {
      state.isLoading = false;
      state.detailsError = action.payload;
    },
    createTaskSuccess: (state, action) => {
      if (action.payload) {
        state.tasks.items.unshift(action.payload);
      }
      state.tasks.totalCount += 1;
      state.isLoading = false;
    },
    createSubTaskSuccess: (state, action) => {
      state.isLoading = false;
    },
    updateTaskSuccess: (state, action) => {
      const updatedTask = action.payload;
      if (updatedTask && updatedTask.taskId) {
        const taskIndex = state.tasks.items.findIndex(task => task.taskId === updatedTask.taskId);
        if (taskIndex !== -1) {
          state.tasks.items[taskIndex] = { ...state.tasks.items[taskIndex], ...updatedTask };
        }
        
        // CRITICAL: Also update the currently open task details so the modal doesn't revert
        if (state.taskData && state.taskData.taskId === updatedTask.taskId) {
          state.taskData = { ...state.taskData, ...updatedTask };
        }
      }
      state.isLoading = false;
    },
    deleteTaskSuccess: (state, action) => {
      const taskIdToDelete = action.payload;
      const initialCount = state.tasks.items.length;
      state.tasks.items = state.tasks.items.filter(task => task.taskId !== taskIdToDelete);
      const newCount = state.tasks.items.length;
      if (newCount < initialCount) {
        state.tasks.totalCount -= (initialCount - newCount);
      }
      state.isLoading = false;
    },
    uploadDocumentRequest: (state) => {
      state.isUploading = true;
      state.error = null;
    },
    uploadDocumentSuccess: (state, action) => {
      state.isUploading = false;
      if (state.taskData && state.taskData.documents) {
        state.taskData.documents.push(action.payload);
      }
    },
    deleteTaskDocumentRequest: (state) => {
      state.isDeletingDocument = true;
      state.error = null;
    },
    deleteTaskDocumentSuccess: (state, action) => {
      const { documentId } = action.payload;
      if (state.taskData && state.taskData.documents) {
        state.taskData.documents = state.taskData.documents.filter(
          (doc) => doc.documentId !== documentId
        );
      }
      state.isDeletingDocument = false;
    },
    fetchTasksByTaskListRequest: (state) => { state.isLoading = true; state.error = null; },
    fetchTasksForProjectRequest: (state) => { state.isLoading = true; state.error = null; },
    fetchUserTasksRequest: (state) => { state.isLoading = true; state.error = null; },
    fetchAllTasksRequest: (state) => { state.isLoading = true; state.error = null; },
    getTaskByIdRequest: (state) => { state.isLoading = true; state.detailsError = null; state.taskData = null; },
    createTaskRequest: (state) => { state.isLoading = true; state.error = null; },
    createSubTaskRequest: (state) => { state.isLoading = true; state.error = null; },
    updateTaskRequest: (state) => { state.isLoading = true; state.error = null; },
    deleteTaskRequest: (state) => { state.isLoading = true; state.error = null; },

    // New reducers to track project context
    setTaskProjectContext: (state, action) => {
      const { projectId, taskListId } = action.payload;
      state.currentProjectId = projectId;
      state.currentTaskListId = taskListId;
    },
    clearTaskProjectContext: (state) => {
      state.currentProjectId = null;
      state.currentTaskListId = null;
    },

    setTasksQuery: (state, action) => {
      state.query = action.payload;
    },
    setCurrentTaskId: (state, action) => {
      state.currentTaskId = action.payload;
    },
    clearTasksError: (state) => {
      state.error = null;
    },
    clearEditingTaskState: (state) => {
      state.currentTaskId = null;
      state.taskData = null;
    },
  },
});

export const {
  requestStart,
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
  setCurrentTaskId,
  clearTasksError,
  setTasksQuery,
  clearEditingTaskState,
  setTaskProjectContext,
  clearTaskProjectContext,
  fetchAllTasksRequest
} = taskSlice.actions;

export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTasksLoading = (state) => state.tasks.isLoading;
export const selectTasksError = (state) => state.tasks.error;
export const selectCurrentTaskId = (state) => state.tasks.currentTaskId;
export const selectTaskData = (state) => state.tasks.taskData;
export const selectIsUploading = (state) => state.tasks.isUploading;
export const selectTasksQuery = (state) => state.tasks.query;
export const selectIsDeletingDocument = (state) => state.tasks.isDeletingDocument;
export const selectDetailsError = (state) => state.tasks.detailsError;
export const selectCurrentProjectId = (state) => state.tasks.currentProjectId;
export const selectCurrentTaskListId = (state) => state.tasks.currentTaskListId;

export default taskSlice.reducer;
