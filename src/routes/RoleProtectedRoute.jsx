import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from '../redux/features/auth/authSlice';
import Loader from 'uiComponent/Loader';
import { useCan } from '../hooks/useCan'; // adjust import if needed

const RoleProtectedRoute = ({ requiredPermissions = [], children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const { can } = useCan();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} replace />;


  if (!requiredPermissions || requiredPermissions.length === 0) {
  return children || <Outlet />;
}


  if (!requiredPermissions.some(perm => can(perm))) {
    // User does not have any required permission
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

export default RoleProtectedRoute;
