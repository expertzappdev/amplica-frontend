// export const API_BASE_URL = 'http://10.0.0.150:5062/api';
// export const ASSETS_BASE_URL = 'http://10.0.0.150:5062';
export const API_BASE_URL = 'https://amplica-backend.onrender.com/api';
export const ASSETS_BASE_URL = 'https://amplica-backend.onrender.com';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/Auth/login`,
  LOGOUT: `${API_BASE_URL}/Auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/Auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/Auth/reset-password`,
  CHANGE_PASSWORD: `${API_BASE_URL}/Auth/change-password`,
  REFRESH_TOKEN: `${API_BASE_URL}/Auth/refresh-token`,
  IMPERSONATE: (companyId) => `${API_BASE_URL}/Auth/impersonate/${companyId}`,
};

// Project Endpoints
export const PROJECT_ENDPOINTS = {
  GET_ALL_PROJECTS: `${API_BASE_URL}/Project`,
  GET_PROJECT_BY_ID: (projectId) => `${API_BASE_URL}/Project/${projectId}`,
  CREATE_PROJECT: `${API_BASE_URL}/Project`,
  UPDATE_PROJECT: (projectId) => `${API_BASE_URL}/Project/${projectId}`,
  DELETE_PROJECT: (projectId) => `${API_BASE_URL}/Project/${projectId}`,
  GET_PROJECT_STATUSES: `${API_BASE_URL}/Taskstatuses`,
  UPLOAD_DOCUMENT: (projectId) => `${API_BASE_URL}/Project/${projectId}/documents`,
  DELETE_PROJECT_DOCUMENT: (taskId, documentId) => `/Project/${taskId}/documents/${documentId}`,
  ADD_PROJECT_MEMBER: (projectId) => `${API_BASE_URL}/Project/${projectId}/members`,
  DELETE_PROJECT_MEMBER: (projectId, userId) => `${API_BASE_URL}/Project/${projectId}/members/${userId}`,
};

// Task Endpoints
export const TASK_ENDPOINTS = {
  GET_TASKS_BY_TASKLIST: (taskListId) => `${API_BASE_URL}/Tasks/tasklists/${taskListId}/tasks`,
  GET_ALL_TASKS_FOR_PROJECT: (projectId) => `${API_BASE_URL}/Tasks/projects/${projectId}/tasks`,
  GET_ALL_TASKS_FOR_USER: `${API_BASE_URL}/Tasks/users/mytasks`,
  GET_COMPANY_TASKS: `${API_BASE_URL}/Tasks/users/alltasks`,
  GET_TASK_BY_ID: (taskId) => `${API_BASE_URL}/Tasks/${taskId}`,
  CREATE_TASK: (taskListId) => `${API_BASE_URL}/Tasks/tasklists/${taskListId}/tasks`,
  UPDATE_TASK: (taskId) => `${API_BASE_URL}/Tasks/${taskId}`,
  DELETE_TASK: (taskId) => `${API_BASE_URL}/Tasks/${taskId}`,
  UPLOAD_TASK_DOCUMENT: (taskId) => `/Tasks/${taskId}/documents`,
  DELETE_TASK_DOCUMENT: (taskId, documentId) => `/Tasks/${taskId}/documents/${documentId}`,
  CREATE_SUBTASK: (parentTaskId) => `${API_BASE_URL}/tasks/${parentTaskId}/subtasks`,
};

// Task List Endpoints
export const TASKLIST_ENDPOINTS = {
  GET_ALL_TASKLISTS: (projectId) => `${API_BASE_URL}/Tasks/projects/${projectId}/tasklists`,
  GET_TASKLIST_BY_ID: (taskListId) => `${API_BASE_URL}/TaskLists/${taskListId}`,
  CREATE_TASKLIST: (projectId) => `${API_BASE_URL}/Tasks/projects/${projectId}/tasklists`,
  UPDATE_TASKLIST: (projectId, taskListId) => `${API_BASE_URL}/Tasks/projects/${projectId}/tasklists/${taskListId}`,
  DELETE_TASKLIST: (projectId, taskListId) => `${API_BASE_URL}/Tasks/projects/${projectId}/tasklists/${taskListId}`
};

// Timesheet Endpoint
export const TIMESHEET_ENDPOINTS = {
  GET_ALL_TIMESHEETS: `${API_BASE_URL}/Timelogs`,
  GET_FILTERED_TIMESHEETS: `${API_BASE_URL}/Timelogs/filtered`,
  CREATE_TIMESHEET: `${API_BASE_URL}/Timelogs`,
  GET_TIMESHEET_BY_ID: (timesheetId) => `${API_BASE_URL}/Timelogs/${timesheetId}`,
  UPDATE_TIMESHEET: (timesheetId) => `${API_BASE_URL}/Timelogs/${timesheetId}`,
  DELETE_TIMESHEET: (timesheetId) => `${API_BASE_URL}/Timelogs/${timesheetId}`,
  GET_FILTERED_TIMELOGS: `${API_BASE_URL}/Timelogs/filtered`,
};

// User Profile & Management Endpoints
export const USER_ENDPOINTS = {
  CHANGE_USER_PASSWORD: (userId) => `${API_BASE_URL}/CompanyUsers/user/${userId}/change-password`,
  GET_ALL_USERS: `${API_BASE_URL}/CompanyUsers/details`,
  GET_USER_PROFILE: (userId) => `${API_BASE_URL}/CompanyUsers/details/user/${userId}`,
  CREATE_USER: `${API_BASE_URL}/CompanyUsers`,
  UPDATE_USER: (userId) => `/CompanyUsers/user/${userId}`,
  DELETE_USER: (userId) => `${API_BASE_URL}/CompanyUsers/user/${userId}`,
  UPDATE_PASSWORD: `${API_BASE_URL}/Auth/change-password`,
  UPLOAD_USER_PROFILE: (userId) => `/CompanyUsers/upload-profile-photo/${userId}`,
};

export const COMPANY_ENDPOINTS = {
  GET_ALL_COMPANIES: `${API_BASE_URL}/Companies`,
  GET_COMPANY_BY_ID: (companyId) => `${API_BASE_URL}/Companies/${companyId}`,
  CREATE_COMPANY: `${API_BASE_URL}/Companies`,
  UPDATE_COMPANY: (companyId) => `${API_BASE_URL}/Companies/${companyId}`,
  DELETE_COMPANY: (companyId) => `${API_BASE_URL}/Companies/${companyId}`,
  UPLOAD_COMPANY_DOCUMENT: (companyId) => `${API_BASE_URL}/Companies/${companyId}/documents`,
  UPLOAD_COMPANY_LOGO: (companyId) => `${API_BASE_URL}/Companies/${companyId}/upload-logo`,
  DELETE_COMPANY_DOCUMENT: (companyId, documentId) => `${API_BASE_URL}/Companies/${companyId}/documents/${documentId}`,
  GET_COMPANY_DEPARTMENT: `${API_BASE_URL}/Department`,
  GET_COMPANY_ROLES: `${API_BASE_URL}/CompanyRoles`,
  GET_COMPANY_STATS: `${API_BASE_URL}/Companies/dashboard-stats`,
  GET_ALL_DEPARTMENTS: `${API_BASE_URL}/Department`,
  GET_DEPARTMENT_BY_ID: (departmentId) => `${API_BASE_URL}/Department/${departmentId}`,
  CREATE_DEPARTMENT: `${API_BASE_URL}/Department`,
  UPDATE_DEPARTMENT: (departmentId) => `${API_BASE_URL}/Department/${departmentId}`,
  DELETE_DEPARTMENT: (departmentId) => `${API_BASE_URL}/Department/${departmentId}`,
  CHANGE_COMPANY_USER_PASSWORD: (userId) =>
  `${API_BASE_URL}/CompanyUsers/admin/${userId}/change-password`,
};

// Report Endpoints
export const REPORT_ENDPOINTS = {
  GET_USER_REPORT_BY_ID: (id) => `/taskreports/user-tasks-by-status/${id}`,
  GET_COMPANY_USERS_TASKS: `/taskreports/company-users-tasks-by-status`,
};

export const ROLE_ENDPOINTS = {
  GET_ALL_ROLES: `${API_BASE_URL}/CompanyRoles`,
  GET_ROLE_BY_ID: (roleId) => `${API_BASE_URL}/CompanyRoles/${roleId}`,
  CREATE_ROLE: `${API_BASE_URL}/CompanyRoles`,
  UPDATE_ROLE: (roleId) => `${API_BASE_URL}/CompanyRoles/${roleId}`,
  DELETE_ROLE: (roleId) => `${API_BASE_URL}/CompanyRoles/${roleId}`,
};

// Package Endpoints
export const PACKAGE_ENDPOINTS = {
  GET_ALL_PACKAGES: `${API_BASE_URL}/Package`,
  GET_PACKAGE_BY_ID: (packageId) => `${API_BASE_URL}/Package/${packageId}`,
  CREATE_PACKAGE: `${API_BASE_URL}/Package`,
  UPDATE_PACKAGE: (packageId) => `${API_BASE_URL}/Package/${packageId}`,
  DELETE_PACKAGE: (packageId) => `${API_BASE_URL}/Package/${packageId}`,

  // Package Purchase Endpoints
  PURCHASE_PACKAGE: (companyId, packageId) => `${API_BASE_URL}/Companies/${companyId}/packages/${packageId}/purchase`,
  GET_PURCHASE_HISTORY: `${API_BASE_URL}/PackagePurchases`,
  GET_COMPANY_PACKAGES: (companyId) => `${API_BASE_URL}/Companies/${companyId}/packages`,

  // Package Module Management
  GET_PACKAGE_MODULES: (packageId) => `${API_BASE_URL}/Package/${packageId}/modules`,
  ASSIGN_MODULE_TO_PACKAGE: (packageId, moduleId) => `${API_BASE_URL}/Package/${packageId}/modules/${moduleId}`,
  REMOVE_MODULE_FROM_PACKAGE: (packageId, moduleId) => `${API_BASE_URL}/Package/${packageId}/modules/${moduleId}`,
};

// Module Endpoints
export const MODULE_ENDPOINTS = {
  GET_ALL_MODULES: `${API_BASE_URL}/Modules`,
  GET_MODULE_BY_ID: (moduleId) => `${API_BASE_URL}/Modules/${moduleId}`,
  CREATE_MODULE: `${API_BASE_URL}/Modules`,
  UPDATE_MODULE: (moduleId) => `${API_BASE_URL}/Modules/${moduleId}`,
  DELETE_MODULE: (moduleId) => `${API_BASE_URL}/Modules/${moduleId}`,

  // Module Package Management
  GET_PACKAGE_MODULES: (packageId) => `${API_BASE_URL}/Package/${packageId}/modules`,
  ASSIGN_MODULE_TO_PACKAGE: (packageId, moduleId) => `${API_BASE_URL}/Package/${packageId}/modules/${moduleId}`,
  REMOVE_MODULE_FROM_PACKAGE: (packageId, moduleId) => `${API_BASE_URL}/Package/${packageId}/modules/${moduleId}`,

  // Module Company Access Management
  GET_COMPANY_MODULES: (companyId) => `${API_BASE_URL}/Companies/${companyId}/modules`,
  ASSIGN_MODULE_TO_COMPANY: (companyId, moduleId) => `${API_BASE_URL}/Companies/${companyId}/modules/${moduleId}`,
  UPDATE_COMPANY_MODULE_ACCESS: (companyId, moduleId) => `${API_BASE_URL}/Companies/${companyId}/modules/${moduleId}`,
  REVOKE_COMPANY_MODULE_ACCESS: (companyId, moduleId) => `${API_BASE_URL}/Companies/${companyId}/modules/${moduleId}`,

  // Module Permissions
  GET_MODULE_PERMISSIONS: (moduleId) => `${API_BASE_URL}/Modules/${moduleId}/permissions`,
};

// Permission Endpoints
export const PERMISSION_ENDPOINTS = {
  GET_ALL_PERMISSIONS: `${API_BASE_URL}/Permissions`,
  GET_PERMISSION_BY_ID: (permissionId) => `${API_BASE_URL}/Permissions/${permissionId}`,
  CREATE_PERMISSION: `${API_BASE_URL}/Permissions`,
  UPDATE_PERMISSION: (permissionId) => `${API_BASE_URL}/Permissions/${permissionId}`,
  DELETE_PERMISSION: (permissionId) => `${API_BASE_URL}/Permissions/${permissionId}`,

  // Role Management
  GET_ALL_ROLES: `${API_BASE_URL}/Roles`,
  CREATE_ROLE: `${API_BASE_URL}/Roles`,
  UPDATE_ROLE: (roleId) => `${API_BASE_URL}/Roles/${roleId}`,
  DELETE_ROLE: (roleId) => `${API_BASE_URL}/Roles/${roleId}`,

  // User Permission Management
  GET_USER_PERMISSIONS: (userId) => `${API_BASE_URL}/Users/${userId}/permissions`,
  ASSIGN_PERMISSION_TO_USER: (userId, permissionId) => `${API_BASE_URL}/Users/${userId}/permissions/${permissionId}`,
  REVOKE_USER_PERMISSION: (userId, permissionId) => `${API_BASE_URL}/Users/${userId}/permissions/${permissionId}`,

  // Role Permission Management
  GET_ROLE_PERMISSIONS: (roleId) => `${API_BASE_URL}/Roles/${roleId}/permissions`,
  ASSIGN_PERMISSION_TO_ROLE: (roleId, permissionId) => `${API_BASE_URL}/Roles/${roleId}/permissions/${permissionId}`,
  REVOKE_ROLE_PERMISSION: (roleId, permissionId) => `${API_BASE_URL}/Roles/${roleId}/permissions/${permissionId}`,

  // User Role Management
  GET_USER_ROLES: (userId) => `${API_BASE_URL}/Users/${userId}/roles`,
  ASSIGN_ROLE_TO_USER: (userId, roleId) => `${API_BASE_URL}/Users/${userId}/roles/${roleId}`,
  REVOKE_USER_ROLE: (userId, roleId) => `${API_BASE_URL}/Users/${userId}/roles/${roleId}`,

  // Module Permission Management
  GET_MODULE_PERMISSIONS: (moduleId) => `${API_BASE_URL}/Modules/${moduleId}/permissions`,
};
