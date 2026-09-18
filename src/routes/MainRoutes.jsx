import { lazy } from 'react';
import Loadable from 'uiComponent/Loadable';
import RoleProtectedRoute from './RoleProtectedRoute';
import RootContainer from '../layout/RootContainer';

const Dashboard = Loadable(lazy(() => import('views/dashboard/Employee/Dashboard')));
const Projects = Loadable(lazy(() => import('views/project')));
const ProjectDetailView = Loadable(lazy(() => import('../views/project/ProjectDetail/ProjectDetailView')));
const Tasks = Loadable(lazy(() => import('views/task')));
const Goals = Loadable(lazy(() => import('views/goals')));
const CompanyManagement = Loadable(lazy(() => import('views/company/CompanyManagement')));
const CompanyProfileView = Loadable(lazy(() => import('superAdminView/CompanyManagement/CompanyProfileView')));
const CompanyRoleHandler = Loadable(lazy(() => import('views/company/CompanyRoleHandler')));
const Reports = Loadable(lazy(() => import('views/reports')));
const Profile = Loadable(lazy(() => import('views/profile')));
const EmployeeProfile = Loadable(lazy(() => import('views/employees/EmployeeProfileView')));
const Employee = Loadable(lazy(() => import('views/employees/EmployeesView')));
const RolesView = Loadable(lazy(() => import('views/roles/RolesView')));
const DepartmentView = Loadable(lazy(() => import('views/department/DepartmentView')));
const DepartmentDetail = Loadable(lazy(() => import('views/department/departmentDetail/DepartmentDetail')));
const ProcessListView = Loadable(lazy(() => import('views/processes/ProcessListView')));
const ProcessDetailView = Loadable(lazy(() => import('views/processes/ProcessDetailView.jsx')));
const AppSettingsView = Loadable(lazy(() => import('views/appsettings/AppSettingsView')));

const MainRoutes = {
  path: '/app',
  element: (
    <RoleProtectedRoute>
      <RootContainer />
    </RoleProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: (
        <RoleProtectedRoute >
          <Dashboard />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'dashboard',
      element: (
        <RoleProtectedRoute >
          <Dashboard />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'project',
      element: (
        <RoleProtectedRoute requiredPermissions={['project:read']}>
          <Projects />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'reports',
      element: (
        <RoleProtectedRoute requiredPermissions={['report:read']}>
          <Reports />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'tasks',
      element: (
        <RoleProtectedRoute requiredPermissions={['task:read']}>
          <Tasks />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'profile',
      element: (
        <RoleProtectedRoute>
          <Profile />
        </RoleProtectedRoute>
      ),
    },
    // { path: 'goals', element: <Goals /> },
    {
      path: 'project-detail/:projectId',
      element: (
        <RoleProtectedRoute requiredPermissions={['project:read']}>
          <ProjectDetailView />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'employee-profile/:userId',
      element: (
        <RoleProtectedRoute requiredPermissions={['employee:read']}>
          <EmployeeProfile />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'companies/:companyId',
      element: (
        <RoleProtectedRoute requiredPermissions={['company:read']}>
          <CompanyProfileView />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'company',
      element: (
        <RoleProtectedRoute requiredPermissions={['company:read']}>
          <CompanyRoleHandler />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'role',
      element: (
        <RoleProtectedRoute requiredPermissions={['companyrole:read:all']}>
          <RolesView />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'department',
      element: (
        <RoleProtectedRoute requiredPermissions={['department:read:all']}>
          <DepartmentView />
        </RoleProtectedRoute>
      ),
    },
    {
      path: 'departments/:id',
      element: (
        <RoleProtectedRoute requiredPermissions={['department:read:all']}>
          <DepartmentDetail />
        </RoleProtectedRoute>
      ),
    },
    // {
    //   path: 'process',
    //   element: (
    //     <RoleProtectedRoute >
    //       <ProcessListView />
    //     </RoleProtectedRoute>
    //   ),
    // },
    // {
    //   path: 'process/:processId',
    //   element: (
    //     <RoleProtectedRoute >
    //       <ProcessDetailView />
    //     </RoleProtectedRoute>
    //   ),
    // },
    // {
    //   path: 'settings',
    //   element: (
    //     <RoleProtectedRoute requiredPermissions={['settings:view']}>
    //       <AppSettingsView />
    //     </RoleProtectedRoute>
    //   ),
    // },
    {
      element: (
        <RoleProtectedRoute requiredPermissions={['employee:read:all', 'company:read']} />
      ),
      children: [
        {
          path: 'employee',
          element: <Employee />,
        },
        {
          path: 'company-management',
          element: <CompanyManagement />,
        },
      ],
    },
  ],
};

export default MainRoutes;
