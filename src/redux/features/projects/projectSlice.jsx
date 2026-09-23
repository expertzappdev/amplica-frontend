import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  isLoading: false,
  error: null,
  currentProjectId: null,
  editingProjectId: null,
  editingProjectData: null,
  status: [],
  projectIdData: null,
  isDeletingDocument: false,
  isManagingMembers: false,
  dropdownProjects: [],
  isDropdownLoading: false,
  dropdownError: null,
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
  },
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjectsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action) => {
      state.projects = action.payload;
      state.isLoading = false;
    },
    fetchProjectsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    getProjectByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      // Intentionally not clearing state.projectIdData or state.editingProjectData here 
      // to prevent the UI from flickering/showing a spinner during background data refreshes.
      // Cleanup is handled correctly by clearEditingState on unmount.
    },
    getProjectByIdSuccess: (state, action) => {
      state.isLoading = false;
      const updatedProjectData = action.payload;
      state.editingProjectData = updatedProjectData;

      if (state.projects.items && state.projects.items.length > 0) {
        const index = state.projects.items.findIndex(p => p.projectId === updatedProjectData.projectId);
        if (index !== -1) {
          state.projects.items[index] = { ...state.projects.items[index], ...updatedProjectData };
        }
      }
    },
    getProjectByIdFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.editingProjectId = null;
      state.editingProjectData = null;
      state.projectIdData = null;
    },

    createProjectRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action) => {
      state.isLoading = false;
      state.dropdownProjects = [];
    },
    createProjectFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateProjectRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProjectSuccess: (state, action) => {
      state.isLoading = false;
      state.editingProjectId = null;
      state.editingProjectData = null;
      state.projectIdData = null; // Clear after update
      state.dropdownProjects = [];
    },
    updateProjectFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    deleteProjectRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteProjectSuccess: (state, action) => {
      state.isLoading = false;
      state.dropdownProjects = [];
    },
    deleteProjectFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    setCurrentProject: (state, action) => {
      state.currentProjectId = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
    clearEditingState: (state) => {
      state.editingProjectId = null;
      state.editingProjectData = null;
      state.projectIdData = null; // Also clear projectIdData when editing state is cleared
    },
    fetchStatusesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStatusesSuccess: (state, action) => {
      state.status = action.payload;
      state.isLoading = false;
    },
    fetchStatusesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    uploadDocumentRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    uploadDocumentSuccess: (state) => {
      state.isLoading = false;
    },
    uploadDocumentFailure: (state, action) => {
      state.isLoading = false;
      state.isDeletingDocument = false;
      state.error = action.payload;
    },
    deleteProjectDocumentRequest: (state) => {
      state.isDeletingDocument = true;
      state.error = null;
    },
    deleteProjectDocumentSuccess: (state, action) => {
      if (state.projectIdData?.documents) {
        state.projectIdData.documents = state.projectIdData.documents.filter(doc => doc.documentId !== action.payload.documentId);
      }
      state.isDeletingDocument = false;
    },

    addProjectMemberRequest: (state) => {
      state.isManagingMembers = true;
      state.error = null;
    },
    addProjectMemberSuccess: (state) => {
      state.isManagingMembers = false;
    },
    addProjectMemberFailure: (state, action) => {
      state.isManagingMembers = false;
      state.error = action.payload;
    },
    deleteProjectMemberRequest: (state) => {
      state.isManagingMembers = true;
      state.error = null;
    },
    deleteProjectMemberSuccess: (state, action) => {
      const { userId } = action.payload;
      if (state.projectIdData?.projectMembers) {
        state.projectIdData.projectMembers = state.projectIdData.projectMembers.filter(
          (member) => member.userId !== userId
        );
      }
      state.isManagingMembers = false;
    },
    deleteProjectMemberFailure: (state, action) => {
      state.isManagingMembers = false;
      state.error = action.payload;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    fetchDropdownProjectsRequest: (state) => {
      state.isDropdownLoading = true;
      state.dropdownError = null;
    },
    fetchDropdownProjectsSuccess: (state, action) => {
      state.dropdownProjects = action.payload;
      state.isDropdownLoading = false;
    },
    fetchDropdownProjectsFailure: (state, action) => {
      state.isDropdownLoading = false;
      state.dropdownError = action.payload;
    },
    clearDropdownProjects: (state) => {
      state.dropdownProjects = [];
      state.isDropdownLoading = false;
      state.dropdownError = null;
    },
  },
});

export const {
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
  setCurrentProject,
  clearProjectsError,
  clearEditingState,
  fetchStatusesRequest,
  fetchStatusesSuccess,
  fetchStatusesFailure,
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
  setQuery,
  fetchDropdownProjectsRequest,
  fetchDropdownProjectsSuccess,
  fetchDropdownProjectsFailure,
  clearDropdownProjects,
} = projectSlice.actions;

// Selectors
export const selectAllProjects = (state) => state.projects.projects;
export const selectProjectsLoading = (state) => state.projects.isLoading;
export const selectProjectsError = (state) => state.projects.error;
export const selectCurrentProjectId = (state) => state.projects.currentProjectId;
export const selectStatusItems = (state) => state.projects.status;
export const selectProjectIdData = (state) => state.projects.projectIdData;
export const selectIsManagingMembers = (state) => state.projects.isManagingMembers;
export const selectQuery = (state) => state.projects.query;
export const selectCurrentProjectData = (state) => {
  const currentId = state.projects.currentProjectId;
  if (currentId) {
    return state.projects.projects.find(p => p.projectId === currentId);
  }
  return null;
};
export const selectEditingProjectData = (state) => state.projects.editingProjectData;
export const selectEditingProjectId = (state) => state.projects.editingProjectId;
export const selectIsDeletingProjectDocument = (state) => state.projects.isDeletingDocument;
export const selectDropdownProjects = (state) => state.projects.dropdownProjects;
export const selectDropdownLoading = (state) => state.projects.isDropdownLoading;

export default projectSlice.reducer;