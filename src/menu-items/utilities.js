// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons-react';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      type: 'item',
      url: '/typography',
      icon: icons.IconTypography,
      breadcrumbs: false
    },
    {
      id: 'util-color',
      title: 'Color',
      type: 'item',
      url: '/color',
      icon: icons.IconPalette,
      breadcrumbs: false
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      type: 'item',
      url: '/shadow',
      icon: icons.IconShadow,
      breadcrumbs: false
    },
    {
      id: 'util-table',
      title: 'Table',
      type: 'item',
      url: '/table',
      icon: icons.IconShadow,
      breadcrumbs: false
    },
    {
      id: 'util-alert',
      title: 'Alert',
      type: 'item',
      url: '/alert',
      icon: icons.IconShadow,
      breadcrumbs: false
    },
    {
      id: 'util-button',
      title: 'Button',
      type: 'item',
      url: '/button',
      icon: icons.IconShadow,
      breadcrumbs: false
    },
    {
      id: 'util-textfield',
      title: 'Text Field',
      type: 'item',
      url: '/textfield',
      icon: icons.IconShadow,
      breadcrumbs: false
    }
  ]
};

export default utilities;
