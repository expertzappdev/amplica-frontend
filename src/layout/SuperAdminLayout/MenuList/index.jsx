import { memo, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import superAdminMenuItems from 'menu-items/superAdminDashboard';

import { useGetSuperAdminMenuMaster } from 'api/superAdminMenu';

// ==============================|| SUPER ADMIN SIDEBAR MENU LIST ||============================== //

function SuperAdminMenuList() {
  const { menuMaster } = useGetSuperAdminMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  const lastItem = null;

  let lastItemIndex = superAdminMenuItems.children.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < superAdminMenuItems.children.length) {
    lastItemId = superAdminMenuItems.children[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = superAdminMenuItems.children.slice(lastItem - 1, superAdminMenuItems.children.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = superAdminMenuItems.children.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        // For Super Admin, we don't filter by permissions as they have full access
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      case 'item':
        return <NavItem key={item.id} item={item} level={1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Super Admin Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(SuperAdminMenuList);
