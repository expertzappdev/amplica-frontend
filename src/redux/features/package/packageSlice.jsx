import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  packages: {
    items: [],
    totalCount: 0,
  },
  isLoading: false,
  error: null,
  currentPackageId: null,
  packageData: null,
  isProcessingPurchase: false,
  isDeletingPackage: false,
  currentCompanyId: null,
  purchaseHistory: {
    items: [],
    totalCount: 0,
  },
  query: {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '', // active, inactive, expired
    search: '',
    priceFrom: null,
    priceTo: null,
    packageType: null,
    createdDateFrom: null,
    createdDateTo: null,
  },
  purchaseQuery: {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    status: '', // pending, completed, failed, expired
    companyId: null,
    packageId: null,
    purchaseDateFrom: null,
    purchaseDateTo: null,
  },
};

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    requestFailure: (state, action) => {
      state.isLoading = false;
      state.isProcessingPurchase = false;
      state.isDeletingPackage = false;
      state.error = action.payload;
    },
    
    fetchPackagesSuccess: (state, action) => {
      state.packages = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },
    getPackageByIdSuccess: (state, action) => {
      state.packageData = action.payload;
      state.isLoading = false;
    },
    createPackageSuccess: (state, action) => {
      if (action.payload) {
        state.packages.items.unshift(action.payload);
        state.packages.totalCount += 1;
      }
      state.isLoading = false;
    },
    updatePackageSuccess: (state, action) => {
      const updatedPackage = action.payload;
      if (updatedPackage && updatedPackage.packageId) {
        const packageIndex = state.packages.items.findIndex(
          pkg => pkg.packageId === updatedPackage.packageId
        );
        if (packageIndex !== -1) {
          state.packages.items[packageIndex] = { 
            ...state.packages.items[packageIndex], 
            ...updatedPackage 
          };
        }
      }
      state.isLoading = false;
    },
    deletePackageSuccess: (state, action) => {
      // const packageIdToDelete = action.payload;
      // const initialCount = state.packages.items.length;
      // state.packages.items = state.packages.items.filter(
      //   pkg => pkg.packageId !== packageIdToDelete
      // );
      // const newCount = state.packages.items.length;
      // if (newCount < initialCount) {
      //   state.packages.totalCount -= (initialCount - newCount);
      // }
      state.isDeletingPackage = false;
      state.isLoading = false;
    },

    // Package Purchase Operations
    purchasePackageRequest: (state) => {
      state.isProcessingPurchase = true;
      state.error = null;
    },
    purchasePackageSuccess: (state, action) => {
      state.isProcessingPurchase = false;
      // Update package purchase count if needed
      const purchasedPackage = action.payload;
      if (purchasedPackage && purchasedPackage.packageId) {
        const packageIndex = state.packages.items.findIndex(
          pkg => pkg.packageId === purchasedPackage.packageId
        );
        if (packageIndex !== -1 && state.packages.items[packageIndex].purchaseCount !== undefined) {
          state.packages.items[packageIndex].purchaseCount += 1;
        }
      }
    },

    // Purchase History Operations
    fetchPurchaseHistorySuccess: (state, action) => {
      state.purchaseHistory = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },

    // Company Package Management
    fetchCompanyPackagesSuccess: (state, action) => {
      state.packages = action.payload || { items: [], totalCount: 0 };
      state.isLoading = false;
    },

    // Request Actions (for saga triggers)
    fetchPackagesRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    getPackageByIdRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
      state.packageData = null; 
    },
    createPackageRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    updatePackageRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    deletePackageRequest: (state) => { 
      state.isDeletingPackage = true; 
      state.error = null; 
    },
    fetchPurchaseHistoryRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },
    fetchCompanyPackagesRequest: (state) => { 
      state.isLoading = true; 
      state.error = null; 
    },

    // State Management
    setCurrentPackageId: (state, action) => {
      state.currentPackageId = action.payload;
    },
    setCurrentCompanyId: (state, action) => {
      state.currentCompanyId = action.payload;
    },
    setPackagesQuery: (state, action) => {
      state.query = action.payload;
    },
    setPurchaseQuery: (state, action) => {
      state.purchaseQuery = action.payload;
    },
    clearPackagesError: (state) => {
      state.error = null;
    },
    clearEditingPackageState: (state) => {
      state.currentPackageId = null;
      state.packageData = null;
    },
    clearCurrentCompany: (state) => {
      state.currentCompanyId = null;
    },
  },
});

export const {
  requestStart,
  requestFailure,
  fetchPackagesSuccess,
  getPackageByIdSuccess,
  createPackageSuccess,
  updatePackageSuccess,
  deletePackageSuccess,
  purchasePackageRequest,
  purchasePackageSuccess,
  fetchPurchaseHistorySuccess,
  fetchCompanyPackagesSuccess,
  fetchPackagesRequest,
  getPackageByIdRequest,
  createPackageRequest,
  updatePackageRequest,
  deletePackageRequest,
  fetchPurchaseHistoryRequest,
  fetchCompanyPackagesRequest,
  setCurrentPackageId,
  setCurrentCompanyId,
  setPackagesQuery,
  setPurchaseQuery,
  clearPackagesError,
  clearEditingPackageState,
  clearCurrentCompany,
} = packageSlice.actions;

// Selectors
export const selectAllPackages = (state) => state.packages.packages;
export const selectPackagesLoading = (state) => state.packages.isLoading;
export const selectPackagesError = (state) => state.packages.error;
export const selectCurrentPackageId = (state) => state.packages.currentPackageId;
export const selectPackageData = (state) => state.packages.packageData;
export const selectIsProcessingPurchase = (state) => state.packages.isProcessingPurchase;
export const selectIsDeletingPackage = (state) => state.packages.isDeletingPackage;
export const selectCurrentCompanyId = (state) => state.packages.currentCompanyId;
export const selectPurchaseHistory = (state) => state.packages.purchaseHistory;
export const selectPackagesQuery = (state) => state.packages.query;
export const selectPurchaseQuery = (state) => state.packages.purchaseQuery;

export default packageSlice.reducer;
