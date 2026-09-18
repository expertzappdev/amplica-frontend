import { memo, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MenuCard from './MenuCard';
import MenuList from '../MenuList';
import LogoSection from '../../MainLayout/LogoSection';
import MiniDrawerStyled from './MiniDrawerStyled';
import useConfig from 'hooks/useConfig';
import { drawerWidth } from 'store/constant';

import {
  useGetSuperAdminMenuMaster,
  handlerSuperAdminDrawerOpen
} from 'api/superAdminMenu';

// ==============================|| SUPER ADMIN SIDEBAR ||============================= //

function SuperAdminSidebar() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetSuperAdminMenuMaster();
  // ---- safe optional-chaining + fallback ----
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;

  const { miniDrawer, mode } = useConfig();

  /* --------------- rest of the component unchanged --------------- */
  const logo = useMemo(
    () => (
      <Box sx={{ display: 'flex', p: 2 }}>
        <LogoSection />
      </Box>
    ),
    []
  );

  const drawer = useMemo(() => {
    const drawerContent = (
      <>
        <MenuCard />
        <Stack direction="row" sx={{ justifyContent: 'center', mb: 2 }}>
          <Chip label='aman' size="small" color="secondary" />
        </Stack>
      </>
    );

    let drawerSX = { paddingLeft: '0px', paddingRight: '0px', marginTop: '20px' };
    if (drawerOpen) drawerSX = { paddingLeft: '16px', paddingRight: '16px', marginTop: '0px' };

    return downMD ? (
      <Box sx={drawerSX}>
        <MenuList />
        {/* {drawerOpen && drawerContent} */}
      </Box>
    ) : (
      <PerfectScrollbar style={{ height: 'calc(100vh - 88px)', ...drawerSX }}>
        <MenuList />
        {/* {drawerOpen && drawerContent} */}
      </PerfectScrollbar>
    );
  }, [downMD, drawerOpen, mode]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { xs: 'auto', md: drawerWidth } }}>
      {downMD || (miniDrawer && drawerOpen) ? (
        <Drawer
          variant={downMD ? 'temporary' : 'persistent'}
          anchor="left"
          open={drawerOpen}
          onClose={() => handlerSuperAdminDrawerOpen(!drawerOpen)}
          sx={{
            '& .MuiDrawer-paper': {
              mt: downMD ? 0 : 11,
              zIndex: 1099,
              width: drawerWidth,
              bgcolor: 'background.default',
              color: 'text.primary',
              borderRight: 'none',
              height: 'auto'
            }
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
          {downMD && logo}
          {drawer}
        </Drawer>
      ) : (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          <Box sx={{ mt: 10 }}>{drawer}</Box>
        </MiniDrawerStyled>
      )}
    </Box>
  );
}

export default memo(SuperAdminSidebar);
