import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/features/auth/authSlice';
import CompanyManagement from './CompanyManagement';
import CompanyProfileView from '../../superAdminView/CompanyManagement/CompanyProfileView';
import { useCan } from '../../hooks/useCan';

export default function CompanyRoleHandler() {
  const currentUser = useSelector(selectUser);
  const { can } = useCan();

  const canManageCompany = can('company:update');

  if (canManageCompany) {
    return <CompanyManagement />;
  } else {
    return <CompanyProfileView companyId={currentUser?.companyId} readOnly={true} />;
  }
}
