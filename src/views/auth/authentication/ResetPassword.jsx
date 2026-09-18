// ResetPassword.jsx
import { Link as RouterLink, useParams } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthResetPassword from '../auth-forms/AuthResetPassword';
import Logo from 'uiComponent/Logo';
import AuthFooter from 'uiComponent/cards/AuthFooter';

// ================================|| AUTH - RESET PASSWORD ||================================ //

export default function ResetPassword() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Stack spacing={2.5} sx={{ alignItems: 'center', width: '100%' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <RouterLink to="#" aria-label="logo">
                      {/* <Logo /> */}
                    </RouterLink>
                  </Box>

                  <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                      Set New Password
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '16px' }}>
                      Please enter your new password below.
                    </Typography>
                  </Stack>

                  <Box sx={{ width: '100%' }}>
                    <AuthResetPassword />
                  </Box>
                </Stack>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ px: 3, my: 3 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
}