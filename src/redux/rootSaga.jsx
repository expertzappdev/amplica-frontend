import { all, fork } from 'redux-saga/effects';
import authSagas from './features/auth/authSagas'
import projectSagas from './features/projects/projectSagas';
import taskSagas from './features/tasks/taskSagas';
import timesheetSagas from './features/timesheet/timesheetSagas';
import taskListSagas from './features/tasklists/taskListSaga'; 
import rootSagas from './rootData/rootDataSaga';
import userProfileSagas from './features/profile/profileSagas';
import companySagas from './features/company/companySagas';
import reportSagas from './features/report/reportSaga';
import roleSagas from './features/role/roleSagas';
import moduleSagas from './features/module/moduleSagas';
import packageSagas from './features/package/packageSagas';
import permissionSagas from './features/permissions/permissionSagas';

export default function* rootSaga() {
  yield all([
    fork(authSagas),
    fork(projectSagas),
    fork(taskSagas),
    fork(timesheetSagas),
    fork(taskListSagas),
    fork(userProfileSagas),
    fork(rootSagas),
    fork(companySagas),
    fork(reportSagas),
    fork(roleSagas),
    fork(moduleSagas),
    fork(packageSagas),
    fork(permissionSagas),
    // fork(anotherFeatureSagas),
  ]);
}
