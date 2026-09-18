import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Button, IconButton, Paper, CircularProgress, Grid,
    Card, CardContent, Avatar, Chip, Divider, Alert, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { format, parseISO, isValid } from 'date-fns';
import { gridSpacing } from '../../../store/constant';
import Can from '../../../uiComponent/Can';
import ViewHeader from '../../../uiComponent/viewheader';
import AddEditDepartmentDrawer from '../../../components/addDepartment/AddEditDepartmentDrawer';
import ConfirmationModal from '../../../uiComponent/confirmationmodal';
import ErrorBoundary from '../../../uiComponent/errorboundary/ErrorBoundary';
import toast from 'react-hot-toast';

import {
    getDepartmentByIdRequest,
    updateDepartmentRequest,
    deleteDepartmentRequest,
    clearCurrentDepartment,
    clearDepartmentCRUDError,
    selectCurrentDepartment,
    selectDepartmentCRUDLoading,
    selectDepartmentCRUDError,
    selectAllDepartments // ✅ Added to check if we can find department in the list
} from '../../../redux/features/company/companySlice';
import { selectUser } from '../../../redux/features/auth/authSlice';

const getAvatarLetters = (name) => {
    if (!name) return '?';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

const formatDate = (dateStr) => {
    try {
        if (!dateStr) return 'Not available';
        const date = parseISO(dateStr);
        if (!isValid(date)) return 'Invalid date';
        return format(date, 'dd MMMM yyyy, HH:mm');
    } catch (e) {
        return 'Invalid date';
    }
};

const InfoCard = ({ title, icon, children, sx = {} }) => (
    <Card sx={{ height: '100%', ...sx }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon && React.cloneElement(icon, { 
                    sx: { mr: 1, color: 'primary.main', fontSize: '1.5rem' } 
                })}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {children}
        </CardContent>
    </Card>
);

const DetailRow = ({ label, value, icon }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
            borderBottom: 'none'
        }
    }}>
        {icon && (
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {React.cloneElement(icon, { 
                    sx: { fontSize: '1.1rem', color: 'text.secondary' } 
                })}
            </Box>
        )}
        <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

export default function DepartmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const department = useSelector(selectCurrentDepartment);
    const isLoading = useSelector(selectDepartmentCRUDLoading);
    const error = useSelector(selectDepartmentCRUDError);
    const allDepartments = useSelector(selectAllDepartments); 
    const currentUser = useSelector(selectUser);

    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const departmentFromList = React.useMemo(() => {
        if (allDepartments?.items && id) {
            const found = allDepartments.items.find(dept => 
                dept.deptId?.toString() === id.toString()
            );
            return found;
        }
        return null;
    }, [allDepartments, id]);

    const displayDepartment = department || departmentFromList;

    useEffect(() => {  
        if (id) {
            dispatch(getDepartmentByIdRequest(id));
        }
        
        return () => {
            dispatch(clearCurrentDepartment());
        };
    }, [dispatch, id, allDepartments]);

    const handleGoBack = () => {
        navigate('/app/department');
    };

    const handleEditClick = () => {
        setIsEditDrawerOpen(true);
    };

    const handleEditClose = () => {
        setIsEditDrawerOpen(false);
    };

    const handleUpdateDepartment = (updatedData) => {
        dispatch(updateDepartmentRequest({
            departmentId: id,
            departmentData: {
                departmentName: updatedData.departmentName,
                description: updatedData.description,
                departmentHeadUserId: updatedData.departmentHeadUserId
            },
            onSuccess: () => {
                setIsEditDrawerOpen(false);
                toast.success('Department updated successfully');
                dispatch(getDepartmentByIdRequest(id));
            },
            onFailure: (error) => {
                toast.error(`Update failed: ${error}`);
            }
        }));
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        dispatch(deleteDepartmentRequest({
            departmentId: id,
            onSuccess: () => {
                toast.success('Department deleted successfully');
                navigate('/app/department');
            },
            onFailure: (error) => {
                toast.error(`Delete failed: ${error}`);
                setIsDeleteModalOpen(false);
            }
        }));
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleRetry = () => {
        dispatch(clearDepartmentCRUDError());
        if (id) {
            dispatch(getDepartmentByIdRequest(id));
        }
    };

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <ErrorBoundary
                error={error}
                onRetry={handleRetry}
                onDismiss={handleGoBack}
                title="Failed to Load Department"
                showInline={false}
                showImage={true}
            />
        );
    }

    if (!displayDepartment) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)',
                flexDirection: 'column',
                gap: 2
            }}>
                <Alert severity="warning" sx={{ maxWidth: 400 }}>
                    Department not found or has been deleted.
                </Alert>
                <Button variant="contained" onClick={handleGoBack}>
                    Go Back to Departments
                </Button>
                <Button variant="outlined" onClick={handleRetry}>
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
            <ViewHeader 
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            onClick={handleGoBack}
                            sx={{ mr: 1 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <BusinessIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h4" component="span">
                            {displayDepartment.departmentName}
                        </Typography>
                    </Box>
                }
            >
                {/* {renderHeaderActions()} */}
            </ViewHeader>

            <Box sx={{ mt: gridSpacing }}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={8}>
                        <InfoCard 
                            title="Department Information" 
                            icon={<BusinessIcon />}
                        >
                            <DetailRow 
                                label="Department Name" 
                                value={displayDepartment.departmentName}
                                icon={<BusinessIcon />}
                            />
                            <DetailRow 
                                label="Description" 
                                value={displayDepartment.description || 'No description provided'}
                                icon={<DescriptionIcon />}
                            />
                            <DetailRow 
                                label="Company" 
                                value={displayDepartment.companyName || 'N/A'}
                                icon={<AdminPanelSettingsIcon />}
                            />
                        </InfoCard>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <InfoCard 
                            title="Department Head" 
                            icon={<PersonIcon />}
                        >
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        fontSize: '1.5rem',
                                        bgcolor: 'primary.200',
                                        margin: '0 auto',
                                        mb: 2
                                    }}
                                >
                                    {displayDepartment.departmentHeadName ? 
                                        getAvatarLetters(displayDepartment.departmentHeadName) : 
                                        '?'
                                    }
                                </Avatar>
                                <Typography variant="h6" gutterBottom>
                                    {displayDepartment.departmentHeadName || 'Not assigned'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {displayDepartment.departmentHeadUserId ? 
                                        `User ID: ${displayDepartment.departmentHeadUserId}` : 
                                        'Department Head'
                                    }
                                </Typography>
                            </Box>
                        </InfoCard>
                    </Grid>

                    <Grid item xs={12}>
                        <InfoCard 
                            title="Audit Information" 
                            icon={<CalendarTodayIcon />}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <DetailRow 
                                        label="Created On" 
                                        value={formatDate(displayDepartment.createdAt)}
                                        icon={<CalendarTodayIcon />}
                                    />
                                    <DetailRow 
                                        label="Created By" 
                                        value={displayDepartment.createdByName || 'System'}
                                        icon={<PersonIcon />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailRow 
                                        label="Last Updated" 
                                        value={formatDate(displayDepartment.updatedAt)}
                                        icon={<CalendarTodayIcon />}
                                    />
                                    <DetailRow 
                                        label="Updated By" 
                                        value={displayDepartment.updatedByName || 'N/A'}
                                        icon={<PersonIcon />}
                                    />
                                </Grid>
                            </Grid>
                        </InfoCard>
                    </Grid>
                </Grid>
            </Box>

            <AddEditDepartmentDrawer
                open={isEditDrawerOpen}
                onClose={handleEditClose}
                editingDepartment={displayDepartment}
                onSubmitUpdate={handleUpdateDepartment}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title={`Delete Department: ${displayDepartment?.departmentName}?`}
                message={`Are you sure you want to delete this department? This action cannot be undone and may affect employees assigned to this department.`}
                confirmButtonText="Delete Department"
                confirmButtonColor="error"
            />
        </Box>
    );
}
