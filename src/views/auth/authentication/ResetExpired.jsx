// ResetExpired.jsx
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Error/Warning Icon

// project imports
import AuthWrapper1 from './AuthWrapper1'; // Assuming path is correct
import AuthCardWrapper from './AuthCardWrapper'; // Assuming path is correct
import Logo from 'uiComponent/Logo'; // Assuming path is correct
import AuthFooter from 'uiComponent/cards/AuthFooter'; // Assuming path is correct
import AnimateButton from 'uiComponent/extended/AnimateButton'; // Assuming path is correct

// ================================|| AUTH - RESET LINK EXPIRED / INVALID ||================================ //

export default function ResetExpired() {
  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Stack spacing={3} sx={{ alignItems: 'center', width: '100%', textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    <RouterLink to="#" aria-label="logo">
                      {/* <Logo /> */}
                    </RouterLink>
                  </Box>

                  <ErrorOutlineIcon sx={{ fontSize: '3.5rem', color: 'error.main' }} />

                  <Stack spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                    <Typography gutterBottom variant={'h3'} sx={{ color: 'secondary.main' }}>
                      Link Expired or Invalid
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '16px', color: 'text.secondary' }}>
                      The password reset link you used is no longer valid. This can happen if it has expired or has already been used.
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '16px', color: 'text.secondary', mt: 1 }}>
                      Please request a new password reset link.
                    </Typography>
                  </Stack>

                  <Box sx={{ width: '100%', mt: 2 }}>
                    <AnimateButton>
                      <Button
                        component={RouterLink}
                        to="/forgot-password" // Adjust your forgot password path if different
                        disableElevation
                        fullWidth
                        size="large"
                        type="button"
                        variant="contained"
                        color="secondary"
                      >
                        Request New Link
                      </Button>
                    </AnimateButton>
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