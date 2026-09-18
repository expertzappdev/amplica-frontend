// ForgotPassword.jsx
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid'; // Still used for overall page layout
import Stack from '@mui/material/Stack'; // Import Stack
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box'; // Import Box for spacing/wrapping if needed

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthForgotPassword from '../auth-forms/AuthForgotPassword';
import Logo from 'uiComponent/Logo';
import AuthFooter from 'uiComponent/cards/AuthFooter';

// ================================|| AUTH - FORGOT PASSWORD ||================================ //

export default function ForgotPassword() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                {/* Use Stack for vertical layout inside the card */}
                <Stack spacing={2.5} sx={{ alignItems: 'center', width: '100%' }}> {/* Ensure stack takes full width */}
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <RouterLink to="#" aria-label="logo">
                      {/* <Logo /> */}
                    </RouterLink>
                  </Box>

                  <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                      Forgot Password?
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '16px' }}>
                      Enter your email address below and we&apos;ll send you a link to reset your password.
                    </Typography>
                  </Stack>

                  {/* Form takes full width of the Stack's alignment container */}
                  <Box sx={{ width: '100%' }}>
                    <AuthForgotPassword />
                  </Box>
                  
                  <Divider sx={{ width: '100%', my: 0.5 }} /> {/* Divider takes full width */}

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      component={RouterLink}
                      to="/"
                      variant="subtitle1"
                      sx={{ textDecoration: 'none' }}
                      color="secondary"
                    >
                      Back to Login
                    </Typography>
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