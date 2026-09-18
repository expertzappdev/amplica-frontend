import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Alert, CircularProgress, Avatar
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
    const [userSearchTerm, setUserSearchTerm] = useState('');
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
        
        if (userSearchTerm.trim()) {
            filteredUsers = filteredUsers.filter(user => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                const email = (user.userEmail || '').toLowerCase();
                const employeeCode = (user.employeeCode || '').toLowerCase();
                const searchLower = userSearchTerm.toLowerCase();
                
                return fullName.includes(searchLower) || 
                       email.includes(searchLower) ||
                       employeeCode.includes(searchLower);
            });
        }
        
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
    }, [allUsers, userSearchTerm, currentUser]);

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
                    setUserSearchTerm('');
                }
            } else {
                setDepartmentName('');
                setDescription('');
                setDepartmentHeadUserId('');
            }
            setErrors({});
            setUserSearchTerm('');
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
                    
                    <TextField
                        label="Search Users"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Search by name, email, or employee code..."
                        fullWidth
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        disabled={isLoading || usersLoading}
                        helperText={`${userOptions.length} users available`}
                    />
                    
                    <FormControl fullWidth error={!!errors.departmentHeadUserId}>
                        <InputLabel id="department-head-select-label">
                            Department Head *
                        </InputLabel>
                        <Select 
                            labelId="department-head-select-label" 
                            label="Department Head *" 
                            value={departmentHeadUserId} 
                            onChange={(e) => setDepartmentHeadUserId(e.target.value)}
                            disabled={isLoading || usersLoading}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="" disabled>
                                <em>Select Department Head</em>
                            </MenuItem>
                            {usersLoading ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                    Loading users...
                                </MenuItem>
                            ) : userOptions.length === 0 ? (
                                <MenuItem disabled>
                                    <em>No users found</em>
                                </MenuItem>
                            ) : (
                                userOptions.map(user => (
                                    <MenuItem key={user.value} value={user.value}>
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
                                                    {/* {user.employeeCode && ` • ${user.employeeCode}`}
                                                    {user.departmentName && ` • ${user.departmentName}`} */}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        {errors.departmentHeadUserId && (
                            <FormHelperText>{errors.departmentHeadUserId}</FormHelperText>
                        )}
                        <FormHelperText>
                            {usersLoading ? 'Loading users...' : 'Select the person responsible for managing this department'}
                        </FormHelperText>
                    </FormControl>

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
