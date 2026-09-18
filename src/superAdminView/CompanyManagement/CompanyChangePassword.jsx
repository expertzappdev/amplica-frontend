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
    changeCompanyUserPasswordRequest,
    selectChangeCompanyUserPasswordLoading,
    selectChangeCompanyUserPasswordError,
    selectChangeCompanyUserPasswordSuccess,
    clearChangeCompanyUserPasswordState,
} from '../../redux/features/company/companySlice';

export default function CompanyChangePassword({ open, onClose, userId }) {
    const dispatch = useDispatch();

    const isLoading = useSelector(selectChangeCompanyUserPasswordLoading);
    const error = useSelector(selectChangeCompanyUserPasswordError);
    const success = useSelector(selectChangeCompanyUserPasswordSuccess);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setValidationError('');

        dispatch(clearChangeCompanyUserPasswordState());
        onClose();
    };

    const handleSubmit = () => {
        if (!newPassword || !confirmPassword) {
            setValidationError('Both password fields are required.');
            return;
        }

        if (newPassword.length < 6) {
            setValidationError(
                'Password must be at least 6 characters long.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setValidationError('Passwords do not match.');
            return;
        }

        if (!userId) {
            setValidationError('Admin user ID is missing.');
            return;
        }

        setValidationError('');

        dispatch(
            changeCompanyUserPasswordRequest({
                userId,
                newPassword,
                confirmPassword,
            })
        );
    };

    useEffect(() => {
        if (success) {
            setNewPassword('');
            setConfirmPassword('');
            setValidationError('');

            onClose();

            dispatch(clearChangeCompanyUserPasswordState());
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
                            setNewPassword(event.target.value);
                            setValidationError('');
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
                            setConfirmPassword(event.target.value);
                            setValidationError('');
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