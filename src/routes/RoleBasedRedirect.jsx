import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUserRole, selectIsAuthenticated, selectAuthLoading } from '../redux/features/auth/authSlice';
import { ROLES } from '../utils/roles';
import Loader from 'uiComponent/Loader';

const RoleBasedRedirect = () => {
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole === ROLES.SUPER_ADMIN){
    return <Navigate to="/super-admin/dashboard" replace />;
  }else {
    return <Navigate to="/app/dashboard" replace />;
  }
  // Redirect based on role
  // switch (userRole) {
  //   case ROLES.SUPER_ADMIN:
  //     return <Navigate to="/super-admin/dashboard" replace />;
  //   case ROLES.ADMIN:
  //   case ROLES.HR:
  //   case ROLES.USER:
  //     return <Navigate to="/app/dashboard" replace />;
  //   default:
  //     return <Navigate to="/unauthorized" replace />;
  // }
};

export default RoleBasedRedirect;
