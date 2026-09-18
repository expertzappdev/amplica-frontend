import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyChangePassword from './CompanyChangePassword';
import {
    Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText,
    Divider, Tabs, Tab, Chip, Button, CircularProgress, Alert
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
import { useTheme } from '@mui/material/styles';
import { gridSpacing } from '../../store/constant';
import NewCompanyDrawer from './NewCompanyDrawer';
import toast from 'react-hot-toast';

import {
    getCompanyByIdRequest,
    selectCompanyIdData,
    selectCompaniesLoading,
    selectCompaniesError,
    clearEditingCompanyState,
    clearCompaniesError,
    updateCompanyRequest,
} from '../../redux/features/company/companySlice';
import { selectUserCompanyId, impersonateRequest } from '../../redux/features/auth/authSlice';

const generateInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?';
};

const generateAvatarColor = (name) => {
    const colors = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
        '#ff5722', '#795548', '#9e9e9e', '#607d8b'
    ];

    if (!name) return colors[0];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
};

const CompanyProfileAvatar = ({ src, name, size = 140, ...props }) => {
    const initials = generateInitials(name);
    const backgroundColor = generateAvatarColor(name);
    const hasValidImage = src &&
        !src.includes('null') &&
        !src.includes('undefined') &&
        (src.startsWith('http') || src.startsWith('/'));

    return (
        <Avatar
            src={hasValidImage ? src : undefined}
            alt={name}
            sx={{
                width: size,
                height: size,
                fontSize: size / 3,
                fontWeight: 600,
                backgroundColor: hasValidImage ? 'transparent' : backgroundColor,
                color: 'white',
                border: `4px solid white`,
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                margin: 'auto',
                mb: 2,
                ...props.sx
            }}
            {...props}
        >
            {!hasValidImage && initials}
        </Avatar>
    );
};

// Helper Components
const InfoDisplayItem = ({ label, value, icon, fullWidth = false, sx, link }) => (
    <Grid
        item
        xs={fullWidth ? 12 : 12}
        sm={fullWidth ? 12 : 6}
        md={fullWidth ? 12 : 6}
        lg={fullWidth ? 12 : 4}
        sx={{ mb: 2.5, ...sx }}
    >
        <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 0.5, fontSize: '0.75rem', lineHeight: 1.2 }}
        >
            {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && React.cloneElement(icon, {
                sx: { mr: 1, fontSize: '1.2rem', color: 'text.secondary', opacity: 0.8 }
            })}
            {link ? (
                <Typography
                    variant="body1"
                    fontWeight="500"
                    component="a"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        wordBreak: 'break-word',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                    }}
                >
                    {value || '-'}
                </Typography>
            ) : (
                <Typography variant="body1" fontWeight="500" sx={{ wordBreak: 'break-word' }}>
                    {value || '-'}
                </Typography>
            )}
        </Box>
    </Grid>
);

const ViewSectionCard = ({ title, icon, children, sx }) => (
    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '12px', mb: gridSpacing, ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: gridSpacing - 0.5 }}>
            {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: 'primary.main', fontSize: '1.6rem' } })}
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
            </Typography>
        </Box>
        <Divider sx={{ mb: gridSpacing + 0.5 }} />
        <Grid container spacing={gridSpacing - 0.5}>
            {children}
        </Grid>
    </Paper>
);

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`company-profile-tabpanel-${index}`}
            aria-labelledby={`company-profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: gridSpacing }}>{children}</Box>}
        </div>
    );
}

export default function CompanyProfileView({ companyId: propsCompanyId, readOnly = false }) {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { companyId: routeCompanyId } = useParams();
    const [currentTab, setCurrentTab] = useState(0);
    const [companyLogo, setCompanyLogo] = useState(null);

    const userCompanyId = useSelector(selectUserCompanyId);
    
    // Determine the actual companyId to use:
    // 1. If provided in URL params (SuperAdmin viewing specific company)
    // 2. If provided as a prop (e.g. from CompanyRoleHandler)
    // 3. Fallback to logged-in user's company ID
    const companyId = routeCompanyId || propsCompanyId || userCompanyId;
    
    const companyData = useSelector(selectCompanyIdData);
    const isLoading = useSelector(selectCompaniesLoading);
    const error = useSelector(selectCompaniesError);

    // Edit Drawer State
    const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const handleEditClick = () => {
        setIsNewDrawerOpen(true);
    };

    const handleImpersonateClick = () => {
        if (!companyData) return;
        const loadingToast = toast.loading(`Starting impersonation for ${companyData.companyName}...`);
        dispatch(impersonateRequest({
            companyId: companyData.companyId || companyData.id,
            onSuccess: (data) => {
                toast.dismiss(loadingToast);
                toast.success(`Now impersonating ${companyData.companyName}`);
                navigate('/app/dashboard');
            },
            onFailure: (errorMsg) => {
                toast.dismiss(loadingToast);
                toast.error(errorMsg || 'Impersonation failed');
            },
        }));
    };

    const handleDrawerClose = () => {
        setIsNewDrawerOpen(false);
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        return new Promise((resolve, reject) => {
            try {
                if (companyData) {
                    dispatch(updateCompanyRequest({
                        companyId: companyData.companyId,
                        changes: data,
                    }));
                    resolve({ success: true });
                } else {
                    reject({ success: false, error: "Company data not found" });
                }
            } catch (err) {
                console.error("Company update failed:", err);
                setIsSubmitting(false);
                reject({ success: false, error: err.message });
            }
        }).finally(() => {
            setIsSubmitting(false);
            setIsNewDrawerOpen(false);
            if (companyId) {
                dispatch(getCompanyByIdRequest(companyId));
            }
        });
    };

    useEffect(() => {
        if (companyId) {
            dispatch(getCompanyByIdRequest(companyId));
        }

        return () => {
            dispatch(clearEditingCompanyState());
            dispatch(clearCompaniesError());
        };
    }, [dispatch, companyId]);

    useEffect(() => {
        const logoUrl = companyData?.companyLogoUrl;

        if (logoUrl && logoUrl !== 'null' && logoUrl !== 'undefined') {
            if (logoUrl.startsWith('http')) {
                setCompanyLogo(logoUrl);
            } else if (logoUrl.startsWith('/')) {
                setCompanyLogo(`${ASSETS_BASE_URL}${logoUrl}`);
            } else {
                setCompanyLogo(`${ASSETS_BASE_URL}/${logoUrl}`);
            }
        } else {
            setCompanyLogo(null);
        }
    }, [companyData?.companyLogoUrl]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleRetry = () => {
        dispatch(clearCompaniesError());
        if (companyId) {
            dispatch(getCompanyByIdRequest(companyId));
        }
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    // Format company size display
    const formatCompanySize = (size) => {
        if (!size) return 'N/A';
        const num = Number(size);
        if (num === 1) return '1 employee';
        return `${num} employees`;
    };

    // Left panel information
    const leftPanelInfo = useMemo(() => [
        {
            icon: <EmailOutlinedIcon />,
            label: 'Company Email',
            value: companyData?.companyEmail
        },
        {
            icon: <PhoneOutlinedIcon />,
            label: 'Company Phone',
            value: companyData?.companyPhone
        },
        {
            icon: <PublicIcon />,
            label: 'Website',
            value: companyData?.companyUrl,
            link: companyData?.companyUrl
        },
        {
            icon: <LocationOnOutlinedIcon />,
            label: 'Address',
            value: companyData?.companyAddress
        },
        {
            icon: <PeopleOutlineIcon />,
            label: 'Company Size',
            value: formatCompanySize(companyData?.companySize)
        },
        {
            icon: <WorkOutlineOutlinedIcon />,
            label: 'Industry',
            value: companyData?.industry
        },
        {
            icon: <VerifiedUserOutlinedIcon />,
            label: 'Status',
            value: companyData?.isActive ? 'Active' : 'Inactive',
            isChip: true,
            chipColor: companyData?.isActive ? 'success' : 'error'
        },
    ].filter(item => item.value), [companyData]);

    // Loading state - show loader if loading OR if we don't have data yet and no error
    if (isLoading || (!companyData && !error)) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <ErrorBoundary
                error={error}
                onRetry={handleRetry}
                onDismiss={() => navigate('/dashboard')}
                title="Error Loading Company Details"
                showInline={false}
                showImage={true}
            />
        );
    }

    // No data state
    if (!companyData) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Company profile not found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    The requested company profile could not be found or you don't have access to view it.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                >
                    Go Back
                </Button>
            </Box>
        );
    }

    // Main UI Rendering
    return (
        <Box sx={{
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh'
        }}>
            {/* Header with back button */}
            {/* <Box sx={{ p: gridSpacing, pb: 0 }}>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>
            </Box> */}

            <Grid container spacing={gridSpacing} sx={{ p: gridSpacing }}>
                {/* Left Sidebar */}
                <Grid item size={{ xs: 12, md: 4, lg: 3 }}>
                    <Paper variant="outlined" sx={{
                        p: gridSpacing,
                        borderRadius: '16px',
                        textAlign: 'center',
                        height: 'fit-content',
                        position: 'sticky',
                        top: gridSpacing
                    }}>
                        <CompanyProfileAvatar
                            src={companyLogo}
                            name={companyData?.companyName}
                            size={140}
                        />

                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {companyData?.companyName}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 400 }}>
                            {companyData?.industry || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Company ID: {companyData?.companyId || 'N/A'}
                        </Typography>

                        {/* Status chips */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                            <Chip
                                label={companyData?.isActive ? 'Active' : 'Inactive'}
                                color={companyData?.isActive ? 'success' : 'error'}
                                size="small"
                            />
                            <Chip
                                label={companyData?.isApproved ? 'Approved' : 'Pending'}
                                color={companyData?.isApproved ? 'primary' : 'warning'}
                                size="small"
                            />
                        </Box>

                        <Divider sx={{ mb: 2, mt: 1 }} />

                        <List dense sx={{ textAlign: 'left', px: 1 }}>
                            {leftPanelInfo.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 1.25 }}>
                                    <ListItemIcon sx={{ minWidth: '40px', color: 'primary.main' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        secondary={
                                            item.isChip ? (
                                                <Chip
                                                    label={item.value}
                                                    color={item.chipColor || 'default'}
                                                    size="small"
                                                    sx={{ mt: 0.5, fontWeight: 500 }}
                                                />
                                            ) : item.link ? (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: theme.palette.primary.main,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                item.value
                                            )
                                        }
                                        primaryTypographyProps={{
                                            variant: 'caption',
                                            color: 'text.secondary',
                                            sx: { fontSize: '0.8rem' }
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'body1',
                                            fontWeight: 500,
                                            color: 'text.primary'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Content Area */}
                <Grid item size={{ xs: 12, md: 8, lg: 9 }}>
                    <Paper variant="outlined" sx={{
                        borderRadius: '16px',
                        height: 'fit-content',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
                            {/* Left Side: Tabs */}
                            <Tabs
                                value={currentTab}
                                onChange={handleTabChange}
                                aria-label="company information tabs"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 60, px: 3.5 },
                                    '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3 },
                                    '& .Mui-selected': { color: 'primary.main' }
                                }}
                            >
                                <Tab label="Company Information" />
                                <Tab label="About & Vision" />
                            </Tabs>

                            {/* Right Side: Both buttons grouped together */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    color="error" 
                                    startIcon={<ManageAccountsIcon />}
                                    onClick={handleImpersonateClick}
                                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                                >
                                    Impersonate
                                </Button>
                                
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={() => setIsChangePasswordOpen(true)}
                                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                                >
                                    Change Password
                                </Button>

                                {!readOnly && (
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<EditOutlinedIcon />} 
                                        onClick={handleEditClick}
                                        sx={{ borderRadius: '6px', textTransform: 'none' }}
                                    >
                                        Edit Company
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: gridSpacing }}>
                            <TabPanel value={currentTab} index={0}>
                                <ViewSectionCard title="Basic Details" icon={<BusinessIcon />}>
                                    <InfoDisplayItem
                                        label="Company Name"
                                        value={companyData?.companyName}
                                    />
                                    <InfoDisplayItem
                                        label="Company ID"
                                        value={companyData?.companyId}
                                    />
                                    <InfoDisplayItem
                                        label="Industry"
                                        value={companyData?.industry}
                                    />
                                    <InfoDisplayItem
                                        label="Company Size"
                                        value={formatCompanySize(companyData?.companySize)}
                                    />
                                    <InfoDisplayItem
                                        label="Approval Status"
                                        value={companyData?.isApproved ? 'Approved' : 'Pending'}
                                        sx={{
                                            '& .MuiTypography-body1': {
                                                color: companyData?.isApproved ? 'success.main' : 'warning.main',
                                                fontWeight: 600
                                            }
                                        }}
                                    />
                                    <InfoDisplayItem
                                        label="Company Status"
                                        value={companyData?.isActive ? 'Active' : 'Inactive'}
                                        sx={{
                                            '& .MuiTypography-body1': {
                                                color: companyData?.isActive ? 'success.main' : 'error.main',
                                                fontWeight: 600
                                            }
                                        }}
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Contact Information" icon={<EmailOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Email Address"
                                        value={companyData?.companyEmail}
                                        link={companyData?.companyEmail ? `mailto:${companyData.companyEmail}` : null}
                                    />
                                    <InfoDisplayItem
                                        label="Phone Number"
                                        value={companyData?.companyPhone}
                                    />
                                    <InfoDisplayItem
                                        label="Website"
                                        value={companyData?.companyUrl}
                                        link={companyData?.companyUrl}
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Location" icon={<LocationOnOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Address"
                                        value={companyData?.companyAddress}
                                        fullWidth
                                    />
                                </ViewSectionCard>
                            </TabPanel>

                            <TabPanel value={currentTab} index={1}>
                                <ViewSectionCard title="About Company" icon={<InfoOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Description"
                                        value={companyData?.aboutCompany || 'No description provided.'}
                                        fullWidth
                                    />
                                </ViewSectionCard>

                                {/* <ViewSectionCard title="Mission" icon={<PublicIcon />}>
                                    <InfoDisplayItem
                                        label="Mission"
                                        value={companyData?.mission || 'Not specified.'}
                                        fullWidth
                                    />
                                </ViewSectionCard> */}

                                <ViewSectionCard title="Vision" icon={<LightbulbOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Vision"
                                        value={companyData?.vision || 'Not specified.'}
                                        fullWidth
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Core Focus" icon={<TrackChangesOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Core Focus"
                                        value={companyData?.goal || 'Not specified.'}
                                        fullWidth
                                    />
                                </ViewSectionCard>
                            </TabPanel>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Edit Drawer */}
            <NewCompanyDrawer
                open={isNewDrawerOpen}
                onClose={handleDrawerClose}
                onSubmit={handleFormSubmit}
                companyToEdit={companyData}
                isSubmitting={isSubmitting}
            />
            <CompanyChangePassword
    open={isChangePasswordOpen}
    onClose={() => setIsChangePasswordOpen(false)}
    userId={companyData?.adminUserId}
/>
        </Box>
    );
}
