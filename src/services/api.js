import axios from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS, PROJECT_ENDPOINTS, USER_ENDPOINTS, TASK_ENDPOINTS, TASKLIST_ENDPOINTS, TIMESHEET_ENDPOINTS, COMPANY_ENDPOINTS, REPORT_ENDPOINTS, ROLE_ENDPOINTS, PACKAGE_ENDPOINTS, MODULE_ENDPOINTS, PERMISSION_ENDPOINTS } from './apiConstants';
import { store } from '../redux/store';
import { refreshTokenSuccess, logoutSuccess, refreshTokenRequest } from '../redux/features/auth/authSlice';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.headers['Authorization']) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const currentRefreshToken = state.auth.refreshToken;
      const expiredAccessToken = state.auth.accessToken;

      if (currentRefreshToken && expiredAccessToken) {
        try {
          const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
            token: expiredAccessToken,
            refreshToken: currentRefreshToken,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

          store.dispatch(refreshTokenSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken }));

          processQueue(null, newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          store.dispatch(logoutSuccess());
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        store.dispatch(logoutSuccess());
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// setAuthToken is not used directly in sagas anymore, but might be used elsewhere.
// Keeping it exported for completeness if other parts of your app rely on it.
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Auth API Endpoints ---
export const AuthAPI = {
  login: (credentials) => {
    return apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
  },

  logout: () => {
    return apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  forgotPassword: (email) => {
    return apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, email);
  },

  resetPassword: (data) => {
    return apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  },

  refreshToken: (token) => {
    return apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, token);
  },

  changePassword: (data) => {
    return apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },

  impersonate: (companyId) => {
    return apiClient.post(AUTH_ENDPOINTS.IMPERSONATE(companyId));
  },
};

// --- Project API Endpoints ---
export const ProjectAPI = {
  getAllProjects: async (params) => {
    const response = await apiClient.get(PROJECT_ENDPOINTS.GET_ALL_PROJECTS, { params });
    return response.data;
  },
  getProjectById: async (projectId) => {
    const response = await apiClient.get(PROJECT_ENDPOINTS.GET_PROJECT_BY_ID(projectId));
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await apiClient.post(PROJECT_ENDPOINTS.CREATE_PROJECT, projectData);
    return response.data;
  },
  updateProject: async (projectId, projectData) => {
    const response = await apiClient.put(PROJECT_ENDPOINTS.UPDATE_PROJECT(projectId), projectData);
    return response.data;
  },
  deleteProject: async (projectId) => {
    const response = await apiClient.delete(PROJECT_ENDPOINTS.DELETE_PROJECT(projectId));
    return response.data;
  },
  getAllStatuses: () => {
    return apiClient.get(PROJECT_ENDPOINTS.GET_PROJECT_STATUSES);
  },

  uploadProjectDocument: (projectId, formData) => {
    return apiClient.post(PROJECT_ENDPOINTS.UPLOAD_DOCUMENT(projectId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5000,
    });
  },

  deleteProjectDocument: (projectId, documentId) => {
    return apiClient.delete(PROJECT_ENDPOINTS.DELETE_PROJECT_DOCUMENT(projectId, documentId));
  },

  addProjectMember: (projectId, memberData) => {
    return apiClient.post(PROJECT_ENDPOINTS.ADD_PROJECT_MEMBER(projectId), memberData);
  },

  deleteProjectMember: (projectId, userId) => {
    return apiClient.delete(PROJECT_ENDPOINTS.DELETE_PROJECT_MEMBER(projectId, userId));
  },
};


// --- Task API Endpoints ---
export const TaskAPI = {
  getTasksByTaskList: (taskListId, params) => {
    return apiClient.get(TASK_ENDPOINTS.GET_TASKS_BY_TASKLIST(taskListId), { params });
  },

  getAllTasksForProject: (projectId) => {
    return apiClient.get(TASK_ENDPOINTS.GET_ALL_TASKS_FOR_PROJECT(projectId));
  },

  getAllTasksForUser: (params) => {
    // e.g., { sortBy: 'dueDate', page: 2 } becomes "?sortBy=dueDate&page=2"
    return apiClient.get(TASK_ENDPOINTS.GET_ALL_TASKS_FOR_USER, { params });
  },

  getCompanyTasks: (params) => {
    return apiClient.get(TASK_ENDPOINTS.GET_COMPANY_TASKS, { params });
  },

  getTaskById: (taskId) => {
    return apiClient.get(TASK_ENDPOINTS.GET_TASK_BY_ID(taskId));
  },

  createTask: (taskListId, taskData) => {
    return apiClient.post(TASK_ENDPOINTS.CREATE_TASK(taskListId), taskData);
  },

  updateTask: (taskId, taskData) => {
    return apiClient.put(TASK_ENDPOINTS.UPDATE_TASK(taskId), taskData);
  },

  deleteTask: (taskId) => {
    return apiClient.delete(TASK_ENDPOINTS.DELETE_TASK(taskId));
  },

  uploadTaskDocument: (taskId, formData) => {
    return apiClient.post(TASK_ENDPOINTS.UPLOAD_TASK_DOCUMENT(taskId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteTaskDocument: (taskId, documentId) => {
    return apiClient.delete(TASK_ENDPOINTS.DELETE_TASK_DOCUMENT(taskId, documentId));
  },

  createSubTask: (parentTaskId, subTaskData) => {
    return apiClient.post(TASK_ENDPOINTS.CREATE_SUBTASK(parentTaskId), subTaskData);
  },
};

// --- TaskList API Endpoints ---
export const TaskListAPI = {
  getAllTaskLists: (projectId, params = {}) => {
    return apiClient.get(TASKLIST_ENDPOINTS.GET_ALL_TASKLISTS(projectId), { params });
  },

  getTaskListById: (taskListId) => {
    return apiClient.get(TASKLIST_ENDPOINTS.GET_TASKLIST_BY_ID(taskListId));
  },

  createTaskList: (projectId, tasklistData) => {
    return apiClient.post(TASKLIST_ENDPOINTS.CREATE_TASKLIST(projectId), tasklistData);
  },

  updateTaskList: (projectId, taskListId, taskListData) => {
    return apiClient.put(TASKLIST_ENDPOINTS.UPDATE_TASKLIST(projectId, taskListId), taskListData);
  },

  deleteTaskList: (projectId, taskListId) => {
    return apiClient.delete(TASKLIST_ENDPOINTS.DELETE_TASKLIST(projectId, taskListId));
  },
};

// --- Timesheet API Endpoints ---
export const TimesheetAPI = {
  getFilteredTimesheets: (params) => {
    return apiClient.get(TIMESHEET_ENDPOINTS.GET_FILTERED_TIMESHEETS, { params });
  },

  getTimesheetById: (timesheetId) => {
    return apiClient.get(TIMESHEET_ENDPOINTS.GET_TIMESHEET_BY_ID(timesheetId));
  },

  createTimesheet: (timesheetData) => {
    return apiClient.post(TIMESHEET_ENDPOINTS.CREATE_TIMESHEET, timesheetData);
  },

  updateTimesheet: (timesheetId, timesheetData) => {
    return apiClient.put(TIMESHEET_ENDPOINTS.UPDATE_TIMESHEET(timesheetId), timesheetData);
  },

  deleteTimesheet: (timesheetId) => {
    return apiClient.delete(TIMESHEET_ENDPOINTS.DELETE_TIMESHEET(timesheetId));
  },
  getFilteredTimelogs: (params) => {
    return apiClient.get(TIMESHEET_ENDPOINTS.GET_FILTERED_TIMELOGS, { params });
  },
};



// --- User API Endpoints ---
export const UserAPI = {
  // Fetches a paginated and filtered list of users.
  // `params` will be automatically converted to query string by Axios (e.g., ?page=1&pageSize=10)
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get(USER_ENDPOINTS.GET_ALL_USERS, { params });
    // Assuming the server response has the shape { message, status, data: { items, totalCount, ... } }
    return response.data;
  },

  // Fetches the detailed profile for a single user by their ID.
  getUserProfile: async (userId) => {
    const response = await apiClient.get(USER_ENDPOINTS.GET_USER_PROFILE(userId));
    return response.data;
  },

  // Creates a new user.
  createUser: async (userData) => {
    const response = await apiClient.post(USER_ENDPOINTS.CREATE_USER, userData);
    return response.data;
  },

  // Updates an existing user's data.
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(USER_ENDPOINTS.UPDATE_USER(userId), userData);
    return response.data;
  },

  // Deletes a user by their ID.
  deleteUser: async (userId) => {
    const response = await apiClient.delete(USER_ENDPOINTS.DELETE_USER(userId));
    return response.data;
  },

  // Updates the current user's password.
  // This now directly calls AuthAPI.changePassword
  updatePassword: async (passwordData) => {
    // passwordData should already contain { currentPassword, newPassword, confirmPassword }
    const response = await AuthAPI.changePassword(passwordData);
    return response.data;
  },

  uploadProfileImage: (formData, userId) => {
    return apiClient.post(USER_ENDPOINTS.UPLOAD_USER_PROFILE(userId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProfileImage: (userId) => {
  return apiClient.delete(
    USER_ENDPOINTS.DELETE_USER_PROFILE(userId)
  );
},
  changeUserPassword: async (userId, passwordData) => {
    const response = await apiClient.put(USER_ENDPOINTS.CHANGE_USER_PASSWORD(userId), passwordData);
    return response.data;
  },
};

export const CompanyAPI = {
  getAllCompanies: async (params) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_ALL_COMPANIES, { params });
    return response;
  },
  getCompanyStats: async (params) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_COMPANY_STATS, { params });
    return response;
  },
  getCompanyById: async (companyId) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_COMPANY_BY_ID(companyId));
    return response;
  },
  createCompany: async (companyData) => {
    const response = await apiClient.post(COMPANY_ENDPOINTS.CREATE_COMPANY, companyData);
    return response;
  },
  updateCompany: async (companyId, companyData) => {
    const response = await apiClient.put(COMPANY_ENDPOINTS.UPDATE_COMPANY(companyId), companyData);
    return response;
  },
  deleteCompany: async (companyId) => {
    const response = await apiClient.delete(COMPANY_ENDPOINTS.DELETE_COMPANY(companyId));
    return response;
  },
  uploadCompanyLogo: (formData, companyId) => {
    return apiClient.post(COMPANY_ENDPOINTS.UPLOAD_COMPANY_LOGO(companyId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadCompanyDocument: (formData, companyId) => {
    return apiClient.post(COMPANY_ENDPOINTS.UPLOAD_COMPANY_DOCUMENT(companyId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteCompanyDocument: (companyId, documentId) => {
    return apiClient.delete(COMPANY_ENDPOINTS.DELETE_COMPANY_DOCUMENT(companyId, documentId));
  },
  getCompanyRoles: async (params) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_COMPANY_ROLES, { params });
    return response;
  },
  getCompanyDepartment: async (params) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_COMPANY_DEPARTMENT, { params });
    return response;
  },

  getAllDepartments: async (params) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_ALL_DEPARTMENTS, { params });
    return response;
  },
  getDepartmentById: async (departmentId) => {
    const response = await apiClient.get(COMPANY_ENDPOINTS.GET_DEPARTMENT_BY_ID(departmentId));
    return response;
  },

  createDepartment: async (departmentData) => {
    const response = await apiClient.post(COMPANY_ENDPOINTS.CREATE_DEPARTMENT, departmentData);
    return response;
  },
  updateDepartment: async (departmentId, departmentData) => {
    const response = await apiClient.put(COMPANY_ENDPOINTS.UPDATE_DEPARTMENT(departmentId), departmentData);
    return response;
  },
  deleteDepartment: async (departmentId) => {
    const response = await apiClient.delete(COMPANY_ENDPOINTS.DELETE_DEPARTMENT(departmentId));
    return response;
  },

  changeCompanyUserPassword: async (userId, passwordData) => {
  const response = await apiClient.put(
    COMPANY_ENDPOINTS.CHANGE_COMPANY_USER_PASSWORD(userId),
    passwordData
  );
  return response;
},
};

export const ReportAPI = {
  getUserReportByID: async ({ id, ...queryParams }) => {
    const endpoint = REPORT_ENDPOINTS.GET_USER_REPORT_BY_ID(id);
    const response = await apiClient.get(endpoint, { params: queryParams });
    return response.data;
  },
  getCompanyReport: async (queryParams) => {
    const endpoint = REPORT_ENDPOINTS.GET_COMPANY_USERS_TASKS;
    const response = await apiClient.get(endpoint, { params: queryParams });
    return response.data;
  },
};

// --- Role API Endpoints ---
export const RoleAPI = {
  getAllRoles: (params) => {
    return apiClient.get(ROLE_ENDPOINTS.GET_ALL_ROLES, { params });
  },

  getRoleById: (roleId) => {
    return apiClient.get(ROLE_ENDPOINTS.GET_ROLE_BY_ID(roleId));
  },

  createRole: (roleData) => {
    return apiClient.post(ROLE_ENDPOINTS.CREATE_ROLE, roleData);
  },

  updateRole: (roleId, roleData) => {
    return apiClient.put(ROLE_ENDPOINTS.UPDATE_ROLE(roleId), roleData);
  },

  deleteRole: (roleId) => {
    return apiClient.delete(ROLE_ENDPOINTS.DELETE_ROLE(roleId));
  },
};

// --- Package API Endpoints ---
export const PackageAPI = {
  getAllPackages: async (params) => {
    const response = await apiClient.get(PACKAGE_ENDPOINTS.GET_ALL_PACKAGES, { params });
    return response;
  },

  getPackageById: async (packageId) => {
    const response = await apiClient.get(PACKAGE_ENDPOINTS.GET_PACKAGE_BY_ID(packageId));
    return response;
  },

  createPackage: async (packageData) => {
    const response = await apiClient.post(PACKAGE_ENDPOINTS.CREATE_PACKAGE, packageData);
    return response;
  },

  updatePackage: async (packageId, packageData) => {
    const response = await apiClient.put(PACKAGE_ENDPOINTS.UPDATE_PACKAGE(packageId), packageData);
    return response;
  },

  deletePackage: async (packageId) => {
    const response = await apiClient.delete(PACKAGE_ENDPOINTS.DELETE_PACKAGE(packageId));
    return response;
  },

  // Package Purchase Operations
  purchasePackage: async (companyId, packageId, purchaseData) => {
    const response = await apiClient.post(PACKAGE_ENDPOINTS.PURCHASE_PACKAGE(companyId, packageId), purchaseData);
    return response;
  },

  getPurchaseHistory: async (params) => {
    const response = await apiClient.get(PACKAGE_ENDPOINTS.GET_PURCHASE_HISTORY, { params });
    return response;
  },

  getCompanyPackages: async (companyId) => {
    const response = await apiClient.get(PACKAGE_ENDPOINTS.GET_COMPANY_PACKAGES(companyId));
    return response;
  },
  // Package Module Management
  getPackageModules: async (packageId) => {
    const response = await apiClient.get(PACKAGE_ENDPOINTS.GET_PACKAGE_MODULES(packageId));
    return response;
  },
  assignModuleToPackage: async (packageId, moduleId, assignmentData) => {
    const response = await apiClient.post(PACKAGE_ENDPOINTS.ASSIGN_MODULE_TO_PACKAGE(packageId, moduleId), assignmentData);
    return response;
  },
  removeModuleFromPackage: async (packageId, moduleId) => {
    const response = await apiClient.delete(PACKAGE_ENDPOINTS.REMOVE_MODULE_FROM_PACKAGE(packageId, moduleId));
    return response;
  },
};

// --- Module API Endpoints ---
export const ModuleAPI = {
  getAllModules: async (params) => {
    const response = await apiClient.get(MODULE_ENDPOINTS.GET_ALL_MODULES, { params });
    return response;
  },

  getModuleById: async (moduleId) => {
    const response = await apiClient.get(MODULE_ENDPOINTS.GET_MODULE_BY_ID(moduleId));
    return response;
  },

  createModule: async (moduleData) => {
    const response = await apiClient.post(MODULE_ENDPOINTS.CREATE_MODULE, moduleData);
    return response;
  },

  updateModule: async (moduleId, moduleData) => {
    const response = await apiClient.put(MODULE_ENDPOINTS.UPDATE_MODULE(moduleId), moduleData);
    return response;
  },

  deleteModule: async (moduleId) => {
    const response = await apiClient.delete(MODULE_ENDPOINTS.DELETE_MODULE(moduleId));
    return response;
  },

  // Package Module Management
  getPackageModules: async (packageId) => {
    const response = await apiClient.get(MODULE_ENDPOINTS.GET_PACKAGE_MODULES(packageId));
    return response;
  },

  assignModuleToPackage: async (packageId, moduleId, assignmentData) => {
    const response = await apiClient.post(MODULE_ENDPOINTS.ASSIGN_MODULE_TO_PACKAGE(packageId, moduleId), assignmentData);
    return response;
  },

  removeModuleFromPackage: async (packageId, moduleId) => {
    const response = await apiClient.delete(MODULE_ENDPOINTS.REMOVE_MODULE_FROM_PACKAGE(packageId, moduleId));
    return response;
  },

  // Company Module Access Management
  getCompanyModules: async (params) => {
    const response = await apiClient.get(MODULE_ENDPOINTS.GET_COMPANY_MODULES(params.companyId), {
      params: { ...params, companyId: undefined }
    });
    return response;
  },

  assignModuleToCompany: async (companyId, moduleId, accessData) => {
    const response = await apiClient.post(MODULE_ENDPOINTS.ASSIGN_MODULE_TO_COMPANY(companyId, moduleId), accessData);
    return response;
  },

  updateCompanyModuleAccess: async (companyId, moduleId, accessData) => {
    const response = await apiClient.put(MODULE_ENDPOINTS.UPDATE_COMPANY_MODULE_ACCESS(companyId, moduleId), accessData);
    return response;
  },

  revokeCompanyModuleAccess: async (companyId, moduleId) => {
    const response = await apiClient.delete(MODULE_ENDPOINTS.REVOKE_COMPANY_MODULE_ACCESS(companyId, moduleId));
    return response;
  },

  // Module Permissions
  getModulePermissions: async (moduleId) => {
    const response = await apiClient.get(MODULE_ENDPOINTS.GET_MODULE_PERMISSIONS(moduleId));
    return response;
  },
};

// --- Permission API Endpoints ---
export const PermissionAPI = {
  getAllPermissions: async (params) => {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_ALL_PERMISSIONS, { params });
    return response;
  },

  getPermissionById: async (permissionId) => {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_PERMISSION_BY_ID(permissionId));
    return response;
  },

  createPermission: async (permissionData) => {
    const response = await apiClient.post(PERMISSION_ENDPOINTS.CREATE_PERMISSION, permissionData);
    return response;
  },

  updatePermission: async (permissionId, permissionData) => {
    const response = await apiClient.put(PERMISSION_ENDPOINTS.UPDATE_PERMISSION(permissionId), permissionData);
    return response;
  },

  deletePermission: async (permissionId) => {
    const response = await apiClient.delete(PERMISSION_ENDPOINTS.DELETE_PERMISSION(permissionId));
    return response;
  },

  // Role Management
  getAllRoles: async (params) => {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_ALL_ROLES, { params });
    return response;
  },

  createRole: async (roleData) => {
    const response = await apiClient.post(PERMISSION_ENDPOINTS.CREATE_ROLE, roleData);
    return response;
  },

  updateRole: async (roleId, roleData) => {
    const response = await apiClient.put(PERMISSION_ENDPOINTS.UPDATE_ROLE(roleId), roleData);
    return response;
  },

  deleteRole: async (roleId) => {
    const response = await apiClient.delete(PERMISSION_ENDPOINTS.DELETE_ROLE(roleId));
    return response;
  },

  // User Permission Management
  getUserPermissions: async (params) => {
    const { userId, ...queryParams } = params;
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_USER_PERMISSIONS(userId), { params: queryParams });
    return response;
  },

  assignPermissionToUser: async (userId, permissionId, assignmentData) => {
    const response = await apiClient.post(PERMISSION_ENDPOINTS.ASSIGN_PERMISSION_TO_USER(userId, permissionId), assignmentData);
    return response;
  },

  revokeUserPermission: async (userId, permissionId) => {
    const response = await apiClient.delete(PERMISSION_ENDPOINTS.REVOKE_USER_PERMISSION(userId, permissionId));
    return response;
  },
  // Role Permission Management
  getRolePermissions: async (roleId) => {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_ROLE_PERMISSIONS(roleId));
    return response;
  },
  assignPermissionToRole: async (roleId, permissionId, assignmentData) => {
    const response = await apiClient.post(PERMISSION_ENDPOINTS.ASSIGN_PERMISSION_TO_ROLE(roleId, permissionId), assignmentData);
    return response;
  },
  revokeRolePermission: async (roleId, permissionId) => {
    const response = await apiClient.delete(PERMISSION_ENDPOINTS.REVOKE_ROLE_PERMISSION(roleId, permissionId));
    return response;
  },
  // User Role Management
  getUserRoles: async (params) => {
    const { userId, ...queryParams } = params;
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_USER_ROLES(userId), { params: queryParams });
    return response;
  },

  assignRoleToUser: async (userId, roleId, assignmentData) => {
    const response = await apiClient.post(PERMISSION_ENDPOINTS.ASSIGN_ROLE_TO_USER(userId, roleId), assignmentData);
    return response;
  },

  revokeUserRole: async (userId, roleId) => {
    const response = await apiClient.delete(PERMISSION_ENDPOINTS.REVOKE_USER_ROLE(userId, roleId));
    return response;
  },

  // Module Permission Management
  getModulePermissions: async (moduleId) => {
    const response = await apiClient.get(PERMISSION_ENDPOINTS.GET_MODULE_PERMISSIONS(moduleId));
    return response;
  },
};