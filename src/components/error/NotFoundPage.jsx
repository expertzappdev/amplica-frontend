import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import PageNotFound from '../../assets/images/PageNotFound404.png';

const NotFoundPage = () => {
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
            src={PageNotFound}
            alt="Page Not Found"
            sx={{ width: '100%', maxWidth: 400, mb: 4 }}
        />
        <Typography variant="h3" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
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

export default NotFoundPage;