import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

// project imports
import { DASHBOARD_PATH } from 'config';
import Logo from 'uiComponent/Logo';
import { Typography } from '@mui/material';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link
      component={RouterLink}
      to={DASHBOARD_PATH}
      aria-label="logo"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Logo />
      {/* <Typography variant="h2" component="h2">
        Amplica
      </Typography> */}
    </Link>
  );
}
