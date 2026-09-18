import { Link as RouterLink } from 'react-router-dom'; 
// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite'

export default function Footer() {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: 3,
        mt: 'auto'
      }}
    >
      <Stack direction="column" alignItems="flex-start">
        <Typography variant="caption">
          &copy; All rights reserved{' '}
          <Typography
            component={Link}
            href="#"
            underline="hover"
            target="_blank"
            color="secondary.main"
          >
            Amplica
          </Typography>
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            mt: 0.25
          }}
        >
          Made with <FavoriteIcon sx={{ color: 'red', mx: 0.5, fontSize: 'inherit' }} /> by Averybit
        </Typography>
      </Stack>

      
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
     
    </Stack>
  );
}