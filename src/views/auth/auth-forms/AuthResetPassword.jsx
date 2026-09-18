import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'uiComponent/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Redux imports
import {
  resetPasswordRequest,
  selectAuthLoading,
  selectAuthError,
  clearAuthError,
  selectIsResetPassword,
  clearIsResetPassword
} from '../../../redux/features/auth/authSlice'; // Adjust path as needed

// ===============================|| AUTH - RESET PASSWORD FORM ||=============================== //

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export default function AuthResetPassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const tokenFromUrl = searchParams.get('token');
  const isResetPassword = useSelector(selectIsResetPassword);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [initialLoadError, setInitialLoadError] = useState('');
  // const [submissionInitiated, setSubmissionInitiated] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    if (!emailFromUrl || !tokenFromUrl) {
      setInitialLoadError('Missing email or token in the reset password link. Please ensure you clicked the link correctly.');
    }
  }, [dispatch, emailFromUrl, tokenFromUrl]);

  // Handle API response feedback from Redux state
  // useEffect(() => {
  //   if (submissionInitiated && !authLoading) { // Only run if a submission was initiated and loading is complete
  //     if (authError) {
  //       toast.error(authError);
  //       // Do not clear the error immediately if you want it to persist for display
  //       // dispatch(clearAuthError()); // Only clear if you don't want it displayed in the form
  //     } else {
  //       // If not loading and no error, it means success
  //       toast.success('Your password has been updated.');
  //       setNewPassword('');
  //       setConfirmPassword('');
  //       navigate('/success', {
  //         state: {
  //           title: 'Password Reset Successful!',
  //           message: 'Your password has been updated. You can now log in with your new password.',
  //           actionButtonText: 'Back to Login',
  //           actionButtonTo: '/',
  //           showLogo: true,
  //           icon: CheckCircleOutlineIcon,
  //         },
  //       });
  //     }
  //     setSubmissionInitiated(false); // Reset flag
  //   }
  // }, [authLoading, authError, dispatch, navigate, submissionInitiated]);


  useEffect(() => {
    if (!authLoading && authError) {
      toast.error(authError);
      dispatch(clearAuthError());
    }
  }, [authLoading, authError, dispatch]);

  useEffect(() => {
    if (isResetPassword) {
      toast.success('Your password has been updated.');
      dispatch(clearIsResetPassword());
      navigate('/success', { 
        state: { 
          title: 'Password Reset Successful!',
          message: 'Your password has been updated. You can now log in with your new password.',
          actionButtonText: 'Back to Login',
          actionButtonTo: '/',
          showLogo: false,
          iconIdentifier: 'CheckCircleOutlineIcon' 
        } 
      });
    }
  }, [isResetPassword]);


  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validateInputs = () => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword) {
      setPasswordError('New Password is required');
      isValid = false;
    } else if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    // } else if (!passwordRules.test(newPassword)) {
    //   setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    //   isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm Password is required');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords must match');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (initialLoadError) {
      toast.error(initialLoadError);
      return;
    }

    if (!validateInputs()) {
      return;
    }

    dispatch(clearAuthError());
    // setSubmissionInitiated(true);

    const payload = {
      email: emailFromUrl,
      token: tokenFromUrl,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    };

    dispatch(resetPasswordRequest(payload));
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit}>
        {initialLoadError && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography color="error" variant="subtitle1" textAlign="center">
              {initialLoadError}
            </Typography>
          </Box>
        )}

        <FormControl fullWidth error={Boolean(passwordError)} sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-new-password">New Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-new-password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            name="newPassword"
            label="New Password"
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError('');
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle new password visibility"
                  onClick={handleClickShowNewPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            disabled={authLoading || Boolean(initialLoadError)}
          />
          {passwordError && (
            <FormHelperText error id="helper-text-new-password">
              {passwordError}
            </FormHelperText>
          )}
          {!passwordError && newPassword && (
            <FormHelperText id="helper-text-password-strength-hint">
              Must be 8+ chars, with uppercase, lowercase, and a number.
            </FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth error={Boolean(confirmPasswordError)} sx={{ ...theme.typography.customInput, mt: 2 }}>
          <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm New Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            name="confirmPassword"
            label="Confirm New Password"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError('');
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            disabled={authLoading || Boolean(initialLoadError)}
          />
          {confirmPasswordError && (
            <FormHelperText error id="helper-text-confirm-password">
              {confirmPasswordError}
            </FormHelperText>
          )}
        </FormControl>

        {authError && (
          <Box sx={{ mt: 2 }}>
            <FormHelperText error>{authError}</FormHelperText>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <AnimateButton>
            <Button
              disableElevation
              disabled={authLoading || Boolean(initialLoadError)}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={authLoading ? <CircularProgress size={24} color="inherit" /> : null}
            >
              {authLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </AnimateButton>
        </Box>
      </form>
    </>
  );
}