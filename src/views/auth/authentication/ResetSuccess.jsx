import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthFooter from 'uiComponent/cards/AuthFooter';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Default Success Icon

export default function SuccessScreen({
  title,
  message,
  actionButtonText,
  actionButtonTo,
  showLogo = false,
  icon: IconComponent = CheckCircleOutlineIcon,
}) {
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

                  <IconComponent sx={{ fontSize: '3.5rem', color: 'success.main' }} className="text-green-500 mb-4" />

                  <Stack spacing={1} alignItems="center" width="100%">
                    <Typography
                      gutterBottom
                      variant="h2"
                      className="text-secondary-main text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight"
                    >
                      {title}
                    </Typography>
                    <Typography variant="body1" className="text-text-secondary text-base sm:text-lg text-gray-600">
                      {message}
                    </Typography>
                  </Stack>

                  <Box sx={{ width: '100%', mt: 4 }}>
                    <Button
                      component={RouterLink}
                      to={actionButtonTo}
                      disableElevation
                      fullWidth
                      size="large"
                      type="button"
                      variant="contained"
                      color="secondary"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                      {actionButtonText}
                    </Button>
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

SuccessScreen.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionButtonText: PropTypes.string.isRequired,
  actionButtonTo: PropTypes.string.isRequired,
  showLogo: PropTypes.bool,
  icon: PropTypes.elementType,
};