import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import projectReducer from './features/projects/projectSlice';
import timesheetReducer from './features/timesheet/timesheetSlice'; 
import taskListReducer from './features/tasklists/taskListSlice';
import taskReducer from './features/tasks/taskSlice';
import rootDataReducer from './rootData/rootDataSlice';
import userProfileReducer from './features/profile/profileSlice';
import companyReducer from './features/company/companySlice';
import reportReducer from './features/report/reportSlice';
import roleReducer from './features/role/roleSlice';
import moduleReducer from './features/module/moduleSlice';
import packageReducer from './features/package/packageSlice';
import permissionReducer from './features/permissions/permissionSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  tasks: taskReducer,
  taskLists: taskListReducer,
  timesheets: timesheetReducer, 
  userProfile: userProfileReducer,
  rootData: rootDataReducer,
  company : companyReducer,
  report: reportReducer,
  roles: roleReducer,
  modules: moduleReducer,
  packages: packageReducer,
  permissions: permissionReducer,
  // anotherFeature: anotherFeatureReducer,
});

export default rootReducer;
