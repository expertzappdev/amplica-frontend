import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconSettings,
  IconFileText,
  IconShield,
  IconDatabase,
  IconChartBar,
  IconPackages
} from '@tabler/icons-react';

const icons = {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconSettings,
  IconFileText,
  IconShield,
  IconDatabase,
  IconChartBar,
  IconPackages
};

const superAdminDashboard = {
  id: 'super-admin',
  title: 'Super Admin Panel',
  type: 'group',
  children: [
    {
      id: 'super-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/super-admin/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    // {
    //   id: 'user-management',
    //   title: 'User Management',
    //   type: 'item',
    //   url: '/super-admin/users',
    //   icon: icons.IconUsers,
    //   breadcrumbs: false
    // },
    {
      id: 'company-management',
      title: 'Companies',
      type: 'item',
      url: '/super-admin/companies',
      icon: icons.IconBuilding,
      breadcrumbs: false,
      // permission: 'company:read:all'
    },
    // {
    //   id: 'package-management',
    //   title: 'Package',
    //   type: 'item',
    //   url: '/super-admin/package',
    //   icon: icons.IconPackages,
    //   breadcrumbs: false,
    //   permission: 'package:read:all'
    // },
    // {
    //   id: 'system-settings',
    //   title: 'System Settings',
    //   type: 'item',
    //   url: '/super-admin/settings',
    //   icon: icons.IconSettings,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'audit-logs',
    //   title: 'Audit Logs',
    //   type: 'item',
    //   url: '/super-admin/audit-logs',
    //   icon: icons.IconFileText,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'system-analytics',
    //   title: 'Analytics',
    //   type: 'item',
    //   url: '/super-admin/analytics',
    //   icon: icons.IconChartBar,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'data-management',
    //   title: 'Data Management',
    //   type: 'item',
    //   url: '/super-admin/data',
    //   icon: icons.IconDatabase,
    //   breadcrumbs: false
    // }
  ]
};

export default superAdminDashboard;
