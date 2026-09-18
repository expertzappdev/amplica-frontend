import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';

import LockAccess from '../../assets/images/unauthorizedLock.png';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };


  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={'100vh'}
      textAlign="center"
    >
      <Container maxWidth="md">
        <Box
            component="img"
            src={LockAccess}
            alt="Access Denied"
            sx={{ width: '100%', maxWidth: 400, mb: 4 }}
        />
        <Typography variant="h3" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Sorry, you do not have the necessary permissions to access this page.
        </Typography>
        <Box>
        <Button variant="outlined" color="secondary" onClick={goBack}>
            Go Back
            </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;