import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import AnimateButton from 'uiComponent/extended/AnimateButton';
import {
  forgotPasswordRequest,
  selectAuthLoading,
  selectAuthError,
  clearAuthError,
  selectIsForgotPassword,
  clearIsForgotPassword
} from '../../../redux/features/auth/authSlice';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

// ===============================|| AUTH - FORGOT PASSWORD ||=============================== //

export default function AuthForgotPassword() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Selectors ---
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
    const isForgotPassword = useSelector(selectIsForgotPassword);
  

  // --- Local State ---
  const [email, setEmail] = useState('');

  // --- Side Effects ---
  useEffect(() => {
    if (!authLoading && authError) {
      toast.error(authError);
      dispatch(clearAuthError());
    }
  }, [authLoading, authError, dispatch]);

  useEffect(() => {
    if (isForgotPassword) {
      toast.success('Password reset link sent to your email');
      dispatch(clearIsForgotPassword());
      navigate('/success', { 
        state: { 
          title: "Email Sent Successfully!",
          message: "A password reset link has been sent to your email address. Please check your inbox (and spam folder).",
          actionButtonText: "Go Back",
          actionButtonTo: "/forgot-password", 
          showLogo: false,
          // icon: MarkEmailReadIcon
          iconIdentifier: 'MarkEmailReadIcon' 
        } 
      });
    }
  }, [isForgotPassword]);

  // --- Event Handlers ---
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPasswordRequest({ email: email }));
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-email-forgot">Email Address</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-forgot"
            type="email"
            value={email}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            disabled={authLoading}
            autoFocus
          />
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button
              disableElevation
              disabled={authLoading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="secondary"
            >
              {authLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
          </AnimateButton>
        </Box>
      </form>
    </>
  );
}
