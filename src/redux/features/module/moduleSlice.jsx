import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modules: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentModuleId: null,
  moduleData: null,
  isAssigningModule: false,
  isDeletingModule: false,
  currentPackageId: null,
  currentCompanyId: null,
  packageModules: {
    items: [],
    totalCount: 0,
  },
  companyModules: {
    items: [],
    totalCount: 0,
  },
  modulePermissions: [],
  query: {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '', // active, inactive, maintenance
    search: '',
    moduleType: '', // core, addon, premium
    category: '', // accounting, crm, inventory, etc.
    packageId: null,
    createdDateFrom: null,
    createdDateTo: null,
  },
  companyModuleQuery: {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '', // active, inactive, expired
    companyId: null,
    accessLevel: '', // read, write, admin
    assignedDateFrom: null,
    assignedDateTo: null,
  },
};

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.isAssigningModule = false;
      state.isDeletingModule = false;
      state.error = action.payload;
    },

    // Module CRUD Operations
    fetchModulesSuccess: (state, action) => {
      state.modules = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    getModuleByIdSuccess: (state, action) => {
      state.moduleData = action.payload;
      state.isLoading = false;
    },
    createModuleSuccess: (state, action) => {
      if (action.payload) {
        state.modules.items.unshift(action.payload);
        state.modules.totalCount += 1;
      }
      state.isLoading = false;
    },
    updateModuleSuccess: (state, action) => {
      const updatedModule = action.payload;
      if (updatedModule && updatedModule.moduleId) {
        const moduleIndex = state.modules.items.findIndex(
          module => module.moduleId === updatedModule.moduleId
        );
        if (moduleIndex !== -1) {
          state.modules.items[moduleIndex] = {
            ...state.modules.items[moduleIndex],
            ...updatedModule
          };
        }
      }
      state.isLoading = false;
    },
    deleteModuleSuccess: (state, action) => {
      const moduleIdToDelete = action.payload;
      const initialCount = state.modules.items.length;
      state.modules.items = state.modules.items.filter(
        module => module.moduleId !== moduleIdToDelete
      );
      const newCount = state.modules.items.length;
      if (newCount < initialCount) {
        state.modules.totalCount -= (initialCount - newCount);
      }
      state.isLoading = false;
    },

    // Package Module Operations
    fetchPackageModulesSuccess: (state, action) => {
      state.packageModules = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    assignModuleToPackageSuccess: (state, action) => {
      const assignedModule = action.payload;
      if (assignedModule) {
        state.packageModules.items.unshift(assignedModule);
        state.packageModules.totalCount += 1;
      }
      state.isAssigningModule = false;
    },
    removeModuleFromPackageSuccess: (state, action) => {
      const { packageId, moduleId } = action.payload;
      state.packageModules.items = state.packageModules.items.filter(
        item => !(item.packageId === packageId && item.moduleId === moduleId)
      );
      state.packageModules.totalCount = Math.max(0, state.packageModules.totalCount - 1);
      state.isLoading = false;
    },

    // Company Module Operations
    fetchCompanyModulesSuccess: (state, action) => {
      state.companyModules = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    assignModuleToCompanySuccess: (state, action) => {
      const assignedModule = action.payload;
      if (assignedModule) {
        state.companyModules.items.unshift(assignedModule);
        state.companyModules.totalCount += 1;
      }
      state.isAssigningModule = false;
    },
    updateCompanyModuleAccessSuccess: (state, action) => {
      const updatedAccess = action.payload;
      if (updatedAccess && updatedAccess.companyId && updatedAccess.moduleId) {
        const accessIndex = state.companyModules.items.findIndex(
          item => item.companyId === updatedAccess.companyId && 
                  item.moduleId === updatedAccess.moduleId
        );
        if (accessIndex !== -1) {
          state.companyModules.items[accessIndex] = {
            ...state.companyModules.items[accessIndex],
            ...updatedAccess
          };
        }
      }
      state.isLoading = false;
    },
    revokeCompanyModuleAccessSuccess: (state, action) => {
      const { companyId, moduleId } = action.payload;
      state.companyModules.items = state.companyModules.items.filter(
        item => !(item.companyId === companyId && item.moduleId === moduleId)
      );
      state.companyModules.totalCount = Math.max(0, state.companyModules.totalCount - 1);
      state.isLoading = false;
    },

    // Module Permissions
    fetchModulePermissionsSuccess: (state, action) => {
      state.modulePermissions = action.payload || [];
      state.isLoading = false;
    },

    // Request Actions (for saga triggers)
    fetchModulesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getModuleByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.moduleData = null;
    },
    createModuleRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateModuleRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteModuleRequest: (state) => {
      state.isDeletingModule = true;
      state.error = null;
    },
    fetchPackageModulesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignModuleToPackageRequest: (state) => {
      state.isAssigningModule = true;
      state.error = null;
    },
    removeModuleFromPackageRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCompanyModulesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    assignModuleToCompanyRequest: (state) => {
      state.isAssigningModule = true;
      state.error = null;
    },
    updateCompanyModuleAccessRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    revokeCompanyModuleAccessRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchModulePermissionsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // State Management
    setCurrentModuleId: (state, action) => {
      state.currentModuleId = action.payload;
    },
    setCurrentPackageId: (state, action) => {
      state.currentPackageId = action.payload;
    },
    setCurrentCompanyId: (state, action) => {
      state.currentCompanyId = action.payload;
    },
    setModulesQuery: (state, action) => {
      state.query = action.payload;
    },
    setCompanyModuleQuery: (state, action) => {
      state.companyModuleQuery = action.payload;
    },
    clearModulesError: (state) => {
      state.error = null;
    },
    clearEditingModuleState: (state) => {
      state.currentModuleId = null;
      state.moduleData = null;
    },
    clearModuleContext: (state) => {
      state.currentPackageId = null;
      state.currentCompanyId = null;
    },
    // packageSlice.jsx - Add to reducers
updatePackagesQuery: (state, action) => {
  state.query = { ...state.query, ...action.payload };
},
resetPackagesQuery: (state) => {
  state.query = {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '',
    search: '',
    priceFrom: null,
    priceTo: null,
    packageType: null,
    createdDateFrom: null,
    createdDateTo: null,
  };
},

  },
});

export const {
  requestStart,
  updatePackagesQuery,
  resetPackagesQuery,
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
  setCurrentModuleId,
  setCurrentPackageId,
  setCurrentCompanyId,
  setModulesQuery,
  setCompanyModuleQuery,
  clearModulesError,
  clearEditingModuleState,
  clearModuleContext,
} = moduleSlice.actions;

// Selectors
export const selectAllModules = (state) => state.modules.modules;
export const selectModulesLoading = (state) => state.modules.isLoading;
export const selectModulesError = (state) => state.modules.error;
export const selectCurrentModuleId = (state) => state.modules.currentModuleId;
export const selectModuleData = (state) => state.modules.moduleData;
export const selectIsAssigningModule = (state) => state.modules.isAssigningModule;
export const selectIsDeletingModule = (state) => state.modules.isDeletingModule;
export const selectCurrentPackageId = (state) => state.modules.currentPackageId;
export const selectCurrentCompanyId = (state) => state.modules.currentCompanyId;
export const selectPackageModules = (state) => state.modules.packageModules;
export const selectCompanyModules = (state) => state.modules.companyModules;
export const selectModulePermissions = (state) => state.modules.modulePermissions;
export const selectModulesQuery = (state) => state.modules.query;
export const selectCompanyModuleQuery = (state) => state.modules.companyModuleQuery;

export default moduleSlice.reducer;
