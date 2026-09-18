import { createBrowserRouter } from 'react-router-dom';
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import SuperAdminRoutes from './SuperAdminRoutes';
import RoleBasedRedirect from './RoleBasedRedirect';

const router = createBrowserRouter([
  AuthenticationRoutes,
  MainRoutes,
  SuperAdminRoutes,
  {
    path: '/redirect',
    element: <RoleBasedRedirect />
  }
]);

export default router;
