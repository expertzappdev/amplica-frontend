import { lazy } from 'react';
import Loadable from 'uiComponent/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import RoleBasedRedirect from './RoleBasedRedirect';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/auth/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/auth/authentication/Register')));
const ForgotPassword = Loadable(lazy(() => import('views/auth/authentication/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('views/auth/authentication/ResetPassword')));
// const ResetSuccess = Loadable(lazy(() => import('views/auth/authentication/ResetSuccess')));
const GenericSuccessPage = Loadable(lazy(() => import('../uiComponent/successpage')));
const ResetExpired = Loadable(lazy(() => import('views/auth/authentication/ResetExpired')));
const UnauthorizedPage = Loadable(lazy(() => import('components/error/UnauthorizedPage')));
const NotFoundPage = Loadable(lazy(() => import('components/error/NotFoundPage')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      index: true,
      element: <LoginPage />
    },
    {
      path: '/',
      element: <LoginPage />
    },
    {
      path: 'register',
      element: <RegisterPage />
    },
    {
      path: 'forgot-password',
      element: <ForgotPassword />
    },
    {
      path: 'reset-password',
      element: <ResetPassword />
    },
    {
      path: 'success',
      element: <GenericSuccessPage />
    },
    {
      path: 'reset-expired',
      element: <ResetExpired />
    },
    {
      path: 'unauthorized',
      element: <UnauthorizedPage />
    },
    {
      path: 'dashboard',
      element: <RoleBasedRedirect />
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ]
};

export default AuthenticationRoutes;
