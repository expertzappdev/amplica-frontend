import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Alert, CircularProgress, Avatar,
    Autocomplete
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

import { gridSpacing } from '../../store/constant';

import { 
    createDepartmentRequest, 
    updateDepartmentRequest,
    selectCurrentDepartment,
    selectDepartmentCRUDLoading,
    selectDepartmentCRUDError
} from '../../redux/features/company/companySlice';

import {
    getAllUsersRequest,
    selectUserList,
    selectUserProfileLoading,
    selectUserProfileError,
} from '../../redux/features/profile/profileSlice';

import { selectUser, selectUserCompanyId } from '../../redux/features/auth/authSlice';

const getAvatarLetters = (name) => {
    if (!name) return '?';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

export default function AddEditDepartmentDrawer({ 
    open, 
    onClose, 
    editingDepartment = null,
    onSubmitCreate,
    onSubmitUpdate
}) {
    const dispatch = useDispatch();
    const isEditMode = !!editingDepartment;

    const currentUser = useSelector(selectUser);
    const companyId = useSelector(selectUserCompanyId);
    const isLoading = useSelector(selectDepartmentCRUDLoading);
    const error = useSelector(selectDepartmentCRUDError);
    
    const { items: allUsers } = useSelector(selectUserList);
    const usersLoading = useSelector(selectUserProfileLoading);
    const usersError = useSelector(selectUserProfileError);

    const [departmentName, setDepartmentName] = useState('');
    const [description, setDescription] = useState('');
    const [departmentHeadUserId, setDepartmentHeadUserId] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open && (!allUsers || allUsers.length === 0)) {
            dispatch(getAllUsersRequest({
                page: 1,
                pageSize: 100,
                sortBy: 'firstName',
                sortOrder: 'asc',
                search: '',
                statusNames: '',
                roleNames: '',
                departmentNames: '',
                memberUserId: null,
            }));
        }
    }, [open, dispatch, allUsers]);

    const userOptions = useMemo(() => {
        if (!Array.isArray(allUsers)) return [];
        
        let filteredUsers = [...allUsers];
        
        return filteredUsers
            .filter(user => user.userIsActive)
            .map(user => ({
                value: user.userId,
                label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userEmail || 'Unknown User',
                email: user.userEmail,
                employeeCode: user.employeeCode,
                avatar: `${user.firstName || ''}${user.lastName || ''}`,
                isCurrentUser: user.userId === currentUser?.id,
                departmentName: user.departmentName,
                roleName: user.description
            }));
    }, [allUsers, currentUser]);

    const selectedUserDetails = useMemo(() => {
        if (!departmentHeadUserId) return null;
        return userOptions.find(user => user.value?.toString() === departmentHeadUserId?.toString());
    }, [departmentHeadUserId, userOptions]);

    const getDrawerTitle = () => {
        return isEditMode ? 'Edit Department' : 'Add New Department';
    };

    const getButtonText = () => {
        return isEditMode ? 'Save Changes' : 'Create Department';
    };

    useEffect(() => {
        if (open) {
            if (isEditMode && editingDepartment) {
                setDepartmentName(editingDepartment.departmentName || '');
                setDescription(editingDepartment.description || '');
                
                const headUserId = editingDepartment.departmentHeadUserId || '';
                setDepartmentHeadUserId(headUserId?.toString() || '');
                
                if (editingDepartment.departmentHeadName) {
                    // 
                }
            } else {
                setDepartmentName('');
                setDescription('');
                setDepartmentHeadUserId('');
            }
            setErrors({});
        }
    }, [open, isEditMode, editingDepartment]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!departmentName.trim()) {
            newErrors.departmentName = 'Department name is required';
        } else if (departmentName.length < 2) {
            newErrors.departmentName = 'Department name must be at least 2 characters';
        } else if (departmentName.length > 100) {
            newErrors.departmentName = 'Department name must be less than 100 characters';
        }

        if (!description.trim()) {
            newErrors.description = 'Department description is required';
        } else if (description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        } else if (description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (!departmentHeadUserId) {
            newErrors.departmentHeadUserId = 'Please select a department head';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const departmentData = {
            departmentName: departmentName.trim(),
            description: description.trim(),
            departmentHeadUserId: parseInt(departmentHeadUserId)
        };

        if (isEditMode) {
            const updatedData = {
                id: editingDepartment.deptId,
                ...departmentData
            };
            
            if (onSubmitUpdate) {
                onSubmitUpdate(updatedData);
            } else {
                dispatch(updateDepartmentRequest({ 
                    departmentId: editingDepartment.deptId, 
                    departmentData,
                    onSuccess: () => {
                        onClose();
                    },
                    onFailure: (error) => {
                        console.error('Update failed:', error);
                    }
                }));
            }
        } else {
            if (onSubmitCreate) {
                onSubmitCreate(departmentData);
            } else {
                dispatch(createDepartmentRequest({ 
                    departmentData,
                    onSuccess: () => {
                        onClose();
                    },
                    onFailure: (error) => {
                        console.error('Creation failed:', error);
                    }
                }));
            }
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const currentDepartmentHead = useMemo(() => {
        if (isEditMode && editingDepartment?.departmentHeadName) {
            return {
                name: editingDepartment.departmentHeadName,
                id: editingDepartment.departmentHeadUserId
            };
        }
        return null;
    }, [isEditMode, editingDepartment]);

    return (
        <Drawer anchor="right" open={open} onClose={handleClose}>
            <Box sx={{ 
                width: { xs: '100%', sm: 500, md: 550 }, 
                p: gridSpacing, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%' 
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h5" component="h2">
                            {getDrawerTitle()}
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={handleClose} 
                        disabled={isLoading}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {usersError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Failed to load users: {usersError}
                    </Alert>
                )}

                {isEditMode && currentDepartmentHead && (
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'info.50', 
                        borderRadius: 1, 
                        border: '1px solid',
                        borderColor: 'info.200',
                        mb: 2
                    }}>
                        <Typography variant="subtitle2" color="info.dark" gutterBottom>
                            Current Department Head
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {getAvatarLetters(currentDepartmentHead.name)}
                            </Avatar>
                            <Typography variant="body2">
                                {currentDepartmentHead.name}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2.5, 
                    pr: 1, 
                    pt: 1 
                }}>
                    
                    <TextField 
                        label="Department Name" 
                        value={departmentName} 
                        onChange={(e) => setDepartmentName(e.target.value)} 
                        required 
                        fullWidth 
                        error={!!errors.departmentName} 
                        helperText={errors.departmentName || `${departmentName.length}/100 characters`}
                        placeholder="e.g., Human Resources, Engineering, Marketing"
                        disabled={isLoading}
                        inputProps={{ maxLength: 100 }}
                    />
                    
                    <TextField 
                        label="Department Description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        fullWidth 
                        multiline
                        rows={4}
                        error={!!errors.description} 
                        helperText={errors.description || `${description.length}/500 characters`}
                        placeholder="Describe the department's role, responsibilities, and objectives..."
                        disabled={isLoading}
                        inputProps={{ maxLength: 500 }}
                    />
                    
                    <Autocomplete
                        options={userOptions}
                        getOptionLabel={(option) => option.label}
                        value={userOptions.find(opt => opt.value?.toString() === departmentHeadUserId?.toString()) || null}
                        onChange={(event, newValue) => {
                            setDepartmentHeadUserId(newValue ? newValue.value : '');
                        }}
                        filterOptions={(options, state) => {
                            const inputValue = state.inputValue.toLowerCase();
                            return options.filter(option => {
                                return (option.label || '').toLowerCase().includes(inputValue) ||
                                       (option.email || '').toLowerCase().includes(inputValue) ||
                                       (option.employeeCode || '').toLowerCase().includes(inputValue);
                            });
                        }}
                        disabled={isLoading || usersLoading}
                        isOptionEqualToValue={(option, value) => option.value?.toString() === value?.value?.toString()}
                        renderInput={(params) => (
                            <TextField 
                                {...params}
                                label="Department Head *"
                                error={!!errors.departmentHeadUserId}
                                helperText={errors.departmentHeadUserId || (usersLoading ? 'Loading users...' : 'Select the person responsible for managing this department')}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, user) => {
                            const { key, ...restProps } = props;
                            return (
                                <li key={user.value} {...restProps}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                        <Avatar sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            fontSize: '0.875rem',
                                            bgcolor: user.isCurrentUser ? 'primary.main' : 'grey.400'
                                        }}>
                                            {getAvatarLetters(user.avatar)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: user.isCurrentUser ? 600 : 400 }}>
                                                {user.label}
                                                {user.isCurrentUser && ' (You)'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            );
                        }}
                    />

                    {selectedUserDetails && (
                        <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'success.50', 
                            borderRadius: 1, 
                            border: '1px solid',
                            borderColor: 'success.200'
                        }}>
                            <Typography variant="subtitle2" color="success.dark" gutterBottom>
                                Selected Department Head
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    bgcolor: 'success.main',
                                    color: 'white'
                                }}>
                                    {getAvatarLetters(selectedUserDetails.avatar)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {selectedUserDetails.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedUserDetails.email}
                                        {/* {selectedUserDetails.departmentName && ` • ${selectedUserDetails.departmentName}`}
                                        {selectedUserDetails.roleName && ` • ${selectedUserDetails.roleName}`} */}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'primary.50', 
                        borderRadius: 1, 
                        border: '1px solid',
                        borderColor: 'primary.200'
                    }}>
                        <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                            Department Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Department will be created under your company<br/>
                            • Department head will receive management permissions<br/>
                            • You can modify these details anytime after creation
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ 
                    mt: 'auto', 
                    pt: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1, 
                    borderTop: '1px solid', 
                    borderColor: 'divider' 
                }}>
                    <Button 
                        onClick={handleClose} 
                        variant="outlined" 
                        color="secondary"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={isLoading || usersLoading || userOptions.length === 0}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <BusinessIcon />}
                    >
                        {isLoading ? 'Processing...' : getButtonText()}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
