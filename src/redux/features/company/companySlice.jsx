import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  companies: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentCompanyId: null,
  companyData: null,
  isUploadingLogo: false,
  isUploadingDocument: false,
  isDeletingDocument: false,
  dashboardStats: {
    totalActiveUsers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    approvedCompanies: 0
  },
  isLoadingStats: false,
  statsError: null,
  
  // Company Roles state
  companyRoles: [],
  isLoadingRoles: false,
  rolesError: null,
  
  // Company Departments state
  companyDepartments: [],
  isLoadingDepartments: false,
  departmentsError: null,

  departments: {
    items: [],
    totalCount: 0,
  },
  currentDepartment: null,
  isLoadingDepartmentCRUD: false,
  departmentCRUDError: null,
  
  query: {
    page: 1,
    pageSize: 5,
    sortBy: '',
    sortOrder: '',
    search: '',
  },

  changePassword: {
  isLoading: false,
  error: null,
  success: false,
},
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.isUploadingLogo = false;
      state.isUploadingDocument = false;
      state.isDeletingDocument = false;
      state.error = action.payload;
    },

    fetchCompaniesSuccess: (state, action) => {
      state.companies = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },

    getCompanyByIdSuccess: (state, action) => {
      state.companyData = action.payload;
      state.isLoading = false;
    },

    createCompanySuccess: (state, action) => {
      state.companies.totalCount += 1;
      state.isLoading = false;
    },

    updateCompanySuccess: (state, action) => {
      state.isLoading = false;
    },

    deleteCompanySuccess: (state, action) => {
      const initialCount = state.companies.items.length;
      const newCount = state.companies.items.length;
      if (newCount < initialCount) {
        state.companies.totalCount -= 1;
      }
      state.isLoading = false;
    },

    // Dashboard Stats reducers
    getCompanyStatsRequest: (state) => {
      state.isLoadingStats = true;
      state.statsError = null;
    },
    getCompanyStatsSuccess: (state, action) => {
      state.dashboardStats = action.payload || {
        totalActiveUsers: 0,
        totalCompanies: 0,
        activeCompanies: 0,
        approvedCompanies: 0
      };
      state.isLoadingStats = false;
      state.statsError = null;
    },
    getCompanyStatsFailure: (state, action) => {
      state.isLoadingStats = false;
      state.statsError = action.payload;
    },

    uploadCompanyLogoRequest: (state) => {
      state.isUploadingLogo = true;
      state.error = null;
    },
    uploadCompanyLogoSuccess: (state, action) => {
      state.isUploadingLogo = false;
      if (state.companyData && action.payload) {
        state.companyData = {
          ...state.companyData,
          companyLogoUrl: action.payload.companyLogoUrl || action.payload.logoUrl,
          updatedAt: new Date().toISOString()
        };
      }
    },

    uploadCompanyDocumentRequest: (state) => {
      state.isUploadingDocument = true;
      state.error = null;
    },
    uploadCompanyDocumentSuccess: (state, action) => {
      state.isUploadingDocument = false;
      if (state.companyData && state.companyData.documents) {
        state.companyData.documents.push(action.payload);
      }
    },

    deleteCompanyDocumentRequest: (state) => {
      state.isDeletingDocument = true;
      state.error = null;
    },
    deleteCompanyDocumentSuccess: (state, action) => {
      const { documentId } = action.payload;
      if (state.companyData && state.companyData.documents) {
        state.companyData.documents = state.companyData.documents.filter(
          (doc) => (doc.documentId || doc.id) !== documentId
        );
      }
      state.isDeletingDocument = false;
    },

    // Company Roles reducers
    getCompanyRolesRequest: (state) => {
      state.isLoadingRoles = true;
      state.rolesError = null;
    },
    getCompanyRolesSuccess: (state, action) => {
      state.companyRoles = action.payload || [];
      state.isLoadingRoles = false;
      state.rolesError = null;
    },
    getCompanyRolesFailure: (state, action) => {
      state.isLoadingRoles = false;
      state.rolesError = action.payload;
      state.companyRoles = [];
    },

    // Company Departments reducers
    getCompanyDepartmentsRequest: (state) => {
      state.isLoadingDepartments = true;
      state.departmentsError = null;
    },
    getCompanyDepartmentsSuccess: (state, action) => {
      state.companyDepartments = action.payload || [];
      state.isLoadingDepartments = false;
      state.departmentsError = null;
    },
    getCompanyDepartmentsFailure: (state, action) => {
      state.isLoadingDepartments = false;
      state.departmentsError = action.payload;
      state.companyDepartments = [];
    },

    getDepartmentsRequest: (state) => {
      state.isLoadingDepartmentCRUD = true;
      state.departmentCRUDError = null;
    },
    getDepartmentsSuccess: (state, action) => {
      state.departments = action.payload || { items: [], totalCount: 0 };
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = null;
    },
    getDepartmentsFailure: (state, action) => {
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = action.payload;
    },

    // Get Department By ID
    getDepartmentByIdRequest: (state) => {
      state.isLoadingDepartmentCRUD = true;
      state.departmentCRUDError = null;
    },
    getDepartmentByIdSuccess: (state, action) => {
      state.currentDepartment = action.payload;
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = null;
    },
    getDepartmentByIdFailure: (state, action) => {
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = action.payload;
      state.currentDepartment = null;
    },

    // Create Department
    createDepartmentRequest: (state) => {
      state.isLoadingDepartmentCRUD = true;
      state.departmentCRUDError = null;
    },
    createDepartmentSuccess: (state, action) => {
      state.departments.items.unshift(action.payload);
      state.departments.totalCount += 1;
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = null;
    },
    createDepartmentFailure: (state, action) => {
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = action.payload;
    },

    // Update Department
    updateDepartmentRequest: (state) => {
      state.isLoadingDepartmentCRUD = true;
      state.departmentCRUDError = null;
    },
    updateDepartmentSuccess: (state, action) => {
      const updatedDepartment = action.payload;
      const index = state.departments.items.findIndex(dept => dept.deptId === updatedDepartment.deptId);
      if (index !== -1) {
        state.departments.items[index] = updatedDepartment;
      }
      if (state.currentDepartment && state.currentDepartment.deptId === updatedDepartment.deptId) {
        state.currentDepartment = updatedDepartment;
      }
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = null;
    },
    updateDepartmentFailure: (state, action) => {
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = action.payload;
    },

    // Delete Department
    deleteDepartmentRequest: (state) => {
      state.isLoadingDepartmentCRUD = true;
      state.departmentCRUDError = null;
    },
    deleteDepartmentSuccess: (state, action) => {
      const departmentId = action.payload;
      state.departments.items = state.departments.items.filter(dept => dept.deptId !== departmentId);
      state.departments.totalCount = Math.max(0, state.departments.totalCount - 1);
      if (state.currentDepartment && state.currentDepartment.deptId === departmentId) {
        state.currentDepartment = null;
      }
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = null;
    },
    deleteDepartmentFailure: (state, action) => {
      state.isLoadingDepartmentCRUD = false;
      state.departmentCRUDError = action.payload;
    },

    // Existing reducers
    fetchCompaniesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getCompanyByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.companyData = null;
    },
    createCompanyRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateCompanyRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteCompanyRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    setQuery: (state, action) => {
      state.query = action.payload;
    },

    setCurrentCompanyId: (state, action) => {
      state.currentCompanyId = action.payload;
    },
    clearCompaniesError: (state) => {
      state.error = null;
    },
    clearStatsError: (state) => {
      state.statsError = null;
    },
    clearRolesError: (state) => {
      state.rolesError = null;
    },
    clearDepartmentsError: (state) => {
      state.departmentsError = null;
    },
    clearDepartmentCRUDError: (state) => {
      state.departmentCRUDError = null;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
    clearEditingCompanyState: (state) => {
      state.currentCompanyId = null;
      state.companyData = null;
    },
    clearCompanyRoles: (state) => {
      state.companyRoles = [];
      state.rolesError = null;
    },
    clearCompanyDepartments: (state) => {
      state.companyDepartments = [];
      state.departmentsError = null;
    },
    changeCompanyUserPasswordRequest: (state) => {
  state.changePassword.isLoading = true;
  state.changePassword.error = null;
  state.changePassword.success = false;
},

changeCompanyUserPasswordSuccess: (state) => {
  state.changePassword.isLoading = false;
  state.changePassword.error = null;
  state.changePassword.success = true;
},

changeCompanyUserPasswordFailure: (state, action) => {
  state.changePassword.isLoading = false;
  state.changePassword.error = action.payload;
  state.changePassword.success = false;
},

clearChangeCompanyUserPasswordState: (state) => {
  state.changePassword.isLoading = false;
  state.changePassword.error = null;
  state.changePassword.success = false;
},
  },
});

export const {
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
  setCurrentCompanyId,
  clearCompaniesError,
  clearStatsError,
  clearRolesError,
  clearDepartmentsError,
  clearDepartmentCRUDError,
  clearCurrentDepartment,
  setQuery,
  clearEditingCompanyState,
  clearCompanyRoles,
  clearCompanyDepartments,
  changeCompanyUserPasswordRequest,
changeCompanyUserPasswordSuccess,
changeCompanyUserPasswordFailure,
clearChangeCompanyUserPasswordState,
} = companySlice.actions;

// Existing Selectors
export const selectAllCompanies = (state) => state.company.companies;
export const selectCompaniesLoading = (state) => state.company.isLoading;
export const selectCompaniesError = (state) => state.company.error;
export const selectCurrentCompanyId = (state) => state.company.currentCompanyId;
export const selectCompanyIdData = (state) => state.company.companyData;
export const selectEditingCompanyData = (state) => state.company.companyData;
export const selectIsUploadingLogo = (state) => state.company.isUploadingLogo;
export const selectIsUploadingDocument = (state) => state.company.isUploadingDocument;
export const selectQuery = (state) => state.company.query;
export const selectIsDeletingDocument = (state) => state.company.isDeletingDocument;
export const selectTotalCompanyCount = (state) => state.company.companies.totalCount;
export const selectUploadError = (state) => state.company.error;
export const selectCompanyRoles = (state) => state.company.companyRoles;
export const selectCompanyRolesLoading = (state) => state.company.isLoadingRoles;
export const selectCompanyRolesError = (state) => state.company.rolesError;
export const selectCompanyDepartments = (state) => state.company.companyDepartments;
export const selectCompanyDepartmentsLoading = (state) => state.company.isLoadingDepartments;
export const selectCompanyDepartmentsError = (state) => state.company.departmentsError;
export const selectDashboardStats = (state) => state.company.dashboardStats;
export const selectDashboardStatsLoading = (state) => state.company.isLoadingStats;
export const selectDashboardStatsError = (state) => state.company.statsError;
export const selectAllDepartments = (state) => state.company.departments;
export const selectCurrentDepartment = (state) => state.company.currentDepartment;
export const selectDepartmentCRUDLoading = (state) => state.company.isLoadingDepartmentCRUD;
export const selectDepartmentCRUDError = (state) => state.company.departmentCRUDError;
export const selectTotalDepartmentCount = (state) => state.company.departments.totalCount;
export const selectChangeCompanyUserPasswordLoading = (state) =>
  state.company.changePassword.isLoading;

export const selectChangeCompanyUserPasswordError = (state) =>
  state.company.changePassword.error;

export const selectChangeCompanyUserPasswordSuccess = (state) =>
  state.company.changePassword.success;
export default companySlice.reducer;
