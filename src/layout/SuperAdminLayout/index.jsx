import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';


import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Footer from '../MainLayout/Footer'; // Reuse from MainLayout
import SuperAdminHeader from './Header';
import SuperAdminSidebar from './Sidebar';
import SuperAdminContentStyled from './SuperAdminContentStyled';
import Loader from 'uiComponent/Loader';
import Breadcrumbs from 'uiComponent/extended/Breadcrumbs';

import useConfig from 'hooks/useConfig';
import { handlerSuperAdminDrawerOpen, useGetSuperAdminMenuMaster } from 'api/superAdminMenu';

// ==============================|| SUPER ADMIN LAYOUT ||============================== //

export default function SuperAdminLayout() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { borderRadius, miniDrawer } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetSuperAdminMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  useEffect(() => {
    handlerSuperAdminDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerSuperAdminDrawerOpen(false);
  }, [downMD]);

  // Show loader while menu is loading
  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* header */}
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: 2 }}>
          <SuperAdminHeader />
        </Toolbar>
      </AppBar>

      {/* menu / drawer */}
      <SuperAdminSidebar />

      {/* main content */}
      <SuperAdminContentStyled {...{ borderRadius, open: drawerOpen }}>
        <Box sx={{ ...{ px: { xs: 0 } }, minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
          {/* breadcrumb */}
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Box>
      </SuperAdminContentStyled>
    </Box>
  );
}
