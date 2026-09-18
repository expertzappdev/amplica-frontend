import {
  IconDashboard,
  IconBriefcase,         
  IconListCheck,         
  IconReportAnalytics,   
  IconUserCircle,        
  IconTargetArrow,
  IconUsers,
  IconBuildingCommunity,
  IconUserPlus,
  IconSettings,
  IconHierarchy,
} from '@tabler/icons-react';
import Can from '../uiComponent/Can';


const icons = {
  IconDashboard,
  IconBriefcase,
  IconListCheck,
  IconReportAnalytics,
  IconUserCircle,
  IconTargetArrow,
  IconUsers,
  IconBuildingCommunity,
  IconUserPlus,
  IconSettings,
  IconHierarchy,
};

const dashboard = {
  id: 'dashboard',
  title: 'My Workspace',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/app/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'projects',
      title: 'Projects',
      type: 'item',
      url: '/app/project',
      icon: icons.IconBriefcase,
      breadcrumbs: false,
      permission: 'project:read'
    },
    {
      id: 'tasks',
      title: 'Tasks',
      type: 'item',
      url: '/app/tasks',
      icon: icons.IconListCheck,
      breadcrumbs: false,
      permission: 'task:read'
    },
    // {
    //   id: 'goals',
    //   title: 'Goals',
    //   type: 'item',
    //   url: '/app/goals',
    //   icon: icons.IconTargetArrow,
    //   breadcrumbs: false
    // },
    {
      id: 'reports',
      title: 'Reports',
      type: 'item',
      url: '/app/reports',
      icon: icons.IconReportAnalytics,
      breadcrumbs: false,
      permission: 'report:read'
    },
    // {
    //   id: 'profile',
    //   title: 'Profile',
    //   type: 'item',
    //   url: '/app/profile',
    //   icon: icons.IconUserCircle,
    //   breadcrumbs: false
    // }
    {
      id: 'employee',
      title: 'Team Members',
      type: 'item',
      url: '/app/employee',
      icon: icons.IconUserPlus,
      breadcrumbs: false,
      permission: 'employee:read:all'
    },
    {
      id: 'company',
      title: 'Company',
      type: 'item',
      url: '/app/company',
      icon: icons.IconBuildingCommunity,
      breadcrumbs: false,
      permission: 'company:read'
    },
    {
      id: 'role',
      title: 'Role',
      type: 'item',
      url: '/app/role',
      icon: icons.IconUsers,
      breadcrumbs: false,
      permission: 'companyrole:read:all'
    },
    {
      id: 'department',
      title: 'Department',
      type: 'item',
      url: '/app/department',
      icon: icons.IconHierarchy,
      breadcrumbs: false,
      permission: 'department:read:all'
    },
    // {
    //   id: 'process',
    //   title: 'Process',
    //   type: 'item',
    //   url: '/app/process',
    //   icon: icons.IconUsers,
    //   breadcrumbs: false,
    //   // permission: 'role:read:all'
    // },
    // {
    //   id: 'settings',
    //   title: 'Settings',
    //   type: 'item',
    //   url: '/app/settings',
    //   icon: icons.IconSettings,
    //   breadcrumbs: false,
    //   // permission: 'company:read'
    // },
  ]
};

export default dashboard;
