import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import AnimateButton from 'uiComponent/extended/AnimateButton';
import { loginRequest, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearAuthError } from '../../../redux/features/auth/authSlice';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { alignItems } from '@mui/system';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Selectors ---
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  
  // --- Local State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (authError) {
      toast.error(authError);
      dispatch(clearAuthError());
    }
  }, [authError, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Login Successful!');
      navigate('/dashboard');
    }
  }, [isAuthenticated]);

  // --- Event Handlers ---
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    dispatch(loginRequest({ email, password }));
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-login"
            type="email"
            value={email}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={authLoading}
            autoFocus
          />
        </FormControl>

        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password-login"
            type={showPassword ? 'text' : 'password'}
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={authLoading}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          {/* <Grid>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
              label="Keep me logged in"
            />
          </Grid> */}
          <Grid sx={{ alignItems: 'center', justifyContent: 'flex-end', display: 'flex', width: '100%' }}>
            <Typography variant="subtitle1" component={Link} to="/forgot-password" color="secondary" sx={{ textDecoration: 'none' }}>
              Forgot Password?
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button
              color="secondary"
              disabled={authLoading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {authLoading ? <CircularProgress size={26} color="inherit" /> : 'Sign In'}
            </Button>
          </AnimateButton>
        </Box>
      </form>
    </>
  );
}
