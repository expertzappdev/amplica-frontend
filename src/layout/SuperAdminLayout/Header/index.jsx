import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import LogoSection from '../../MainLayout/LogoSection';
import SearchSection from '../../MainLayout/Header/SearchSection';
import ProfileSection from '../../MainLayout/Header/ProfileSection';
import NotificationSection from '../../MainLayout/Header/NotificationSection';

import { handlerSuperAdminDrawerOpen, useGetSuperAdminMenuMaster } from 'api/superAdminMenu';

// assets
import { IconMenu2 } from '@tabler/icons-react';

// ==============================|| SUPER ADMIN NAVBAR / HEADER ||============================== //

export default function SuperAdminHeader() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetSuperAdminMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened || false;

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            bgcolor: 'secondary.light',
            color: 'secondary.dark',
            '&:hover': {
              bgcolor: 'secondary.dark',
              color: 'secondary.light'
            }
          }}
          onClick={() => handlerSuperAdminDrawerOpen(!drawerOpen)}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      {/* header search */}
      {/* <SearchSection /> */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* notification */}
      {/* <NotificationSection /> */}

      {/* profile */}
      <ProfileSection />
    </>
  );
}
