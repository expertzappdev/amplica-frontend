import { useSelector } from 'react-redux';
export const useCan = () => {
  const permissions = useSelector((state) => state.auth.permissions);

  if (!permissions) {
    return (permission) => false;
  }

  const can = (permission) => {
    return permissions.includes(permission);
  };

  return { can };
};