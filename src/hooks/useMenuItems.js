import { useSelector } from 'react-redux';
import { selectUserRole } from '../redux/features/auth/authSlice';
import { ROLES } from '../utils/roles';
import dashboard from '../menu-items/dashboard';
import superAdminDashboard from '../menu-items/superAdminDashboard';

const useMenuItems = () => {
  const userRole = useSelector(selectUserRole);

  switch (userRole) {
    case ROLES.SUPER_ADMIN:
      return superAdminDashboard;
    case ROLES.ADMIN:
    case ROLES.HR:
    case ROLES.USER:
    default:
      return dashboard;
  }
};

export default useMenuItems;
