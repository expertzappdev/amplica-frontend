import { lazy } from 'react';
import Loadable from 'uiComponent/Loadable';
import SuperAdminLayout from '../layout/SuperAdminLayout';
import RoleProtectedRoute from './RoleProtectedRoute';

// Super Admin specific components
const SuperAdminDashboard = Loadable(lazy(() => import('../superAdminView/Dashboard/DashboardView')));
const CompanyManagement = Loadable(lazy(() => import('../superAdminView/CompanyManagement')));
const CompanyProfileView = Loadable(lazy(() => import('../superAdminView/CompanyManagement/CompanyProfileView')));
const PackageView = Loadable(lazy(() => import('../superAdminView/package/PackageView')));
const Profile = Loadable(lazy(() => import('views/profile')));

const SuperAdminRoutes = {
    path: '/super-admin',
    element: (
        <RoleProtectedRoute requiredPermissions={['company:read']}>
            <SuperAdminLayout />
        </RoleProtectedRoute>
    ),
    children: [
        {
            index: true,
            element: (
                <RoleProtectedRoute requiredPermissions={['company:read']}>
                    <SuperAdminDashboard />
                </RoleProtectedRoute>
            ),
        },
        {
            path: 'dashboard',
            element: (
                <RoleProtectedRoute requiredPermissions={['company:read']}>
                    <SuperAdminDashboard />
                </RoleProtectedRoute>
            ),
        },
        {
            path: 'companies',
            element: (
                <RoleProtectedRoute requiredPermissions={['company:read:all']}>
                    <CompanyManagement />
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
        // {
        //     path: 'package',
        //     element: (
        //         <RoleProtectedRoute requiredPermissions={['company:read']}>
        //             <PackageView />
        //         </RoleProtectedRoute>
        //     ),
        // },
        {
            path: 'profile',
            element: (
                <RoleProtectedRoute>
                    <Profile />
                </RoleProtectedRoute>
            ),
        },
    ],
};

export default SuperAdminRoutes;
