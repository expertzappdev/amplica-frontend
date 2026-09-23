import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import {
    changeUserPasswordRequest,
    selectUserProfileLoading,
    selectUserProfileError,
    selectIsPasswordChanged,
    resetPasswordChangeStatus,
} from '../../redux/features/profile/profileSlice';

export default function UserChangePassword({ open, onClose, userId }) {
    const dispatch = useDispatch();

    const isLoading = useSelector(selectUserProfileLoading);
    const error = useSelector(selectUserProfileError);
    const success = useSelector(selectIsPasswordChanged);

    const [formState, setFormState] = useState({
        newPassword: '',
        confirmPassword: '',
        validationError: ''
    });

    const { newPassword, confirmPassword, validationError } = formState;

    const handleClose = () => {
        setFormState({
            newPassword: '',
            confirmPassword: '',
            validationError: ''
        });

        dispatch(resetPasswordChangeStatus());
        onClose();
    };

    const handleSubmit = () => {
        if (!newPassword || !confirmPassword) {
            setFormState(prev => ({ ...prev, validationError: 'Both password fields are required.' }));
            return;
        }

        if (newPassword.length < 6) {
            setFormState(prev => ({ ...prev, validationError: 'Password must be at least 6 characters long.' }));
            return;
        }

        if (newPassword !== confirmPassword) {
            setFormState(prev => ({ ...prev, validationError: 'Passwords do not match.' }));
            return;
        }

        if (!userId) {
            setFormState(prev => ({ ...prev, validationError: 'Admin user ID is missing.' }));
            return;
        }

        if (validationError) {
            setFormState(prev => ({ ...prev, validationError: '' }));
        }

        dispatch(
            changeUserPasswordRequest({
                userId,
                passwordData: {
                    newPassword,
                    confirmPassword,
                }
            })
        );
    };

    useEffect(() => {
        if (success) {
            setFormState({
                newPassword: '',
                confirmPassword: '',
                validationError: ''
            });

            onClose();

            dispatch(resetPasswordChangeStatus());
        }
    }, [success, onClose, dispatch]);

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Change Password</DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        pt: 1,
                        minWidth: 350,
                    }}
                >
                    <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={newPassword}
                        onChange={(event) => {
                            const val = event.target.value;
                            setFormState(prev => ({ ...prev, newPassword: val, validationError: '' }));
                        }}
                        error={Boolean(validationError)}
                    />

                    <TextField
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        size="small"
                        value={confirmPassword}
                        onChange={(event) => {
                            const val = event.target.value;
                            setFormState(prev => ({ ...prev, confirmPassword: val, validationError: '' }));
                        }}
                        error={Boolean(validationError)}
                    />

                    {validationError && (
                        <Box sx={{ color: 'error.main', fontSize: 14 }}>
                            {validationError}
                        </Box>
                    )}

                    {error && (
                        <Box sx={{ color: 'error.main', fontSize: 14 }}>
                            {error}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Update'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}