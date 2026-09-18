// material-ui
import { useTheme } from '@mui/material/styles';

// import your SVG files
// import logoDark from 'assets/images/your-logo-dark.svg';
import logo from 'assets/images/amplicaLogo.svg';

export default function Logo() {
  const theme = useTheme();

  return (
    <img 
      // src={theme.palette.mode === 'dark' ? logoDark : logo} 
      src={logo} 
      alt="Logo" 
      width="120" 
    />
  );
}
