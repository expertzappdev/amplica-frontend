import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taskLists: [],
  isLoading: false,
  error: null,
  currentProjectId: null,
};

const taskListSlice = createSlice({
  name: 'taskLists',
  initialState,
  reducers: {
    fetchTaskListsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.currentProjectId = action.payload;
      state.taskLists = [];
    },
    fetchTaskListsSuccess: (state, action) => {
      state.taskLists = action.payload;
      state.isLoading = false;
    },
    fetchTaskListsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    fetchTaskListByIdRequest: (state, action) => { // action.payload = taskListId
      state.isLoading = true;
      state.error = null;
    },
    fetchTaskListByIdSuccess: (state, action) => {
      const taskListData = action.payload;
      const existingIndex = state.taskLists.findIndex(tl => tl.taskListId === taskListData.taskListId);
      if (existingIndex !== -1) {
        state.taskLists[existingIndex] = taskListData;
      } else {
        state.taskLists.push(taskListData);
      }
      state.isLoading = false;
    },
    fetchTaskListByIdFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    createTaskListRequest: (state) => { // action.payload = { projectId, taskListData }
      state.isLoading = true;
      state.error = null;
    },
    createTaskListSuccess: (state, action) => {
      state.taskLists.push(action.payload);
      state.isLoading = false;
    },
    createTaskListFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateTaskListRequest: (state) => { // action.payload = { taskListId, changes }
      state.isLoading = true;
      state.error = null;
    },
    updateTaskListSuccess: (state, action) => {
      const updatedTaskList = action.payload;
      state.taskLists = state.taskLists.map(taskList =>
        taskList.taskListId === updatedTaskList.taskListId ? updatedTaskList : taskList
      );
      state.isLoading = false;
    },
    updateTaskListFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    deleteTaskListRequest: (state) => { // action.payload = { projectId, taskListId }
      state.isLoading = true;
      state.error = null;
    },
    deleteTaskListSuccess: (state, action) => {
      const taskListIdToDelete = action.payload;
      state.taskLists = state.taskLists.filter(taskList => taskList.taskListId !== taskListIdToDelete);
      state.isLoading = false;
    },
    deleteTaskListFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearTaskListsError: (state) => {
      state.error = null;
    },

    updateTaskListMetrics: (state, action) => {
      const { taskListId, taskCountChange, overallProgress } = action.payload;
      const taskList = state.taskLists.find(tl => tl.taskListId === taskListId);
      if (taskList) {
        if (taskCountChange) {
          taskList.taskCount = (taskList.taskCount || 0) + taskCountChange;
        }
        if (overallProgress !== undefined) {
          taskList.overallProgress = overallProgress;
        }
      }
    }
  },
});

export const {
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
  clearTaskListsError,
  updateTaskListMetrics,
} = taskListSlice.actions;

// Selectors
export const selectAllTaskLists = (state) => state.taskLists.taskLists;
export const selectTaskListsLoading = (state) => state.taskLists.isLoading;
export const selectTaskListsError = (state) => state.taskLists.error;
export const selectTaskListById = (state, taskListId) => {
  return state.taskLists.taskLists.find(taskList => taskList.taskListId === taskListId);
};

export default taskListSlice.reducer;