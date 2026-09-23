// Filename: ViewProfileView.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
// --- UI Imports ---
import {
    Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText,
    Divider, Tabs, Tab, Chip, Button, CircularProgress,
    TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PublicIcon from '@mui/icons-material/Public';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
// --- Utility Imports ---
import { format, parseISO, isValid, differenceInYears } from 'date-fns';
import { gridSpacing } from '../../store/constant';
import { useTheme } from '@mui/material/styles';
import UserChangePassword from './UserChangePassword';
import toast from 'react-hot-toast';
import { validateEmailStrict } from '../../utils/emailValidation';

// --- Redux Imports ---
import {
    getUserProfileRequest,
    getEmployeeProfileRequest,
    selectUserProfile,
    selectUserProfileLoading,
    selectUserProfileError,
    clearUserProfileError,
    updateUserRequest
} from '../../redux/features/profile/profileSlice';

import {
    getCompanyRolesRequest,
    getCompanyDepartmentsRequest,
    selectCompanyRoles,
    selectCompanyDepartments
} from '../../redux/features/company/companySlice';

// --- Static Data ---
const countryOptions = [
    { code: 'IN', label: 'India' },
    { code: 'US', label: 'United States' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
    { code: 'SG', label: 'Singapore' }
];

const departmentOptions = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Human Resources' },
    { id: 4, name: 'Design' },
    { id: 5, name: 'Sales' },
    { id: 6, name: 'Operations' },
];

const roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Company Admin' },
    { id: 3, name: 'Employee' },
];

const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

// Helper function to generate avatar initials
const generateInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
};

// Helper function to generate avatar background color based on name
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

// Custom Avatar Component for ViewProfile
const ViewProfileAvatar = ({ src, firstName, lastName, size = 140, ...props }) => {
    const initials = generateInitials(firstName, lastName);
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const backgroundColor = generateAvatarColor(name);

    // Check if image exists and is valid
    const hasValidImage = src &&
        !src.includes('user-round.svg');

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
const InfoDisplayItem = ({ label, value, icon, fullWidth = false, sx, isEditing, name, type = 'text', options, onChange, error, ...props }) => (
    <Grid item size={{ xs: 12, md: fullWidth ? 12 : 6, lg: fullWidth ? 12 : 4 }} sx={{ mb: 2.5, ...sx }}>
        {!isEditing ? (
            <>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: '0.75rem', lineHeight: 1.2 }}>
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon && React.cloneElement(icon, { sx: { mr: 1, fontSize: '1.2rem', color: 'text.secondary', opacity: 0.8 } })}
                    <Typography variant="body1" fontWeight="500" sx={{ wordBreak: 'break-word' }}>
                        {value || '-'}
                    </Typography>
                </Box>
            </>
        ) : (
            <Box sx={{ mt: 1 }}>
                {type === 'text' || type === 'email' ? (
                    <TextField
                        fullWidth
                        size="small"
                        label={label}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        error={!!error}
                        helperText={error}
                        type={type}
                        {...props}
                    />
                ) : type === 'select' ? (
                    <FormControl fullWidth size="small" error={!!error}>
                        <InputLabel>{label}</InputLabel>
                        <Select
                            label={label}
                            name={name}
                            value={value || ''}
                            onChange={onChange}
                            {...props}
                        >
                            {options?.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                        {error && <Typography variant="caption" color="error">{error}</Typography>}
                    </FormControl>
                ) : type === 'date' ? (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label={label}
                            value={value ? new Date(value) : null}
                            onChange={(newValue) => onChange({ target: { name, value: newValue } })}
                            format="dd/MM/yyyy"
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    error: !!error,
                                    helperText: error
                                }
                            }}
                            {...props}
                        />
                    </LocalizationProvider>
                ) : null}
            </Box>
        )}
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
            id={`view-profile-tabpanel-${index}`}
            aria-labelledby={`view-profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: gridSpacing }}>{children}</Box>}
        </div>
    );
}

export default function ViewProfileView({ profileData: passedProfileData }) {
    const theme = useTheme();
    const dispatch = useDispatch();

    const { userId } = useParams();

    const location = useLocation();
    const placeholderData = location.state?.employeeData;

    const [profileData, setProfileData] = useState(placeholderData || passedProfileData || null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [errors, setErrors] = useState({});
    
    const userDetail = useSelector(selectUserProfile);
    const isLoading = useSelector(selectUserProfileLoading);
    const error = useSelector(selectUserProfileError);

    const companyRoles = useSelector(selectCompanyRoles);
    const companyDepartments = useSelector(selectCompanyDepartments);

    const dateToParse = (dateString) => {
        if (!dateString) return null;
        const parsed = parseISO(dateString);
        return isValid(parsed) ? parsed : null;
    };

    useEffect(() => {
        if (userId) {
            dispatch(clearUserProfileError());
            dispatch(getEmployeeProfileRequest({ userId: userId }));
            dispatch(getCompanyRolesRequest());
            dispatch(getCompanyDepartmentsRequest());
        }
    }, [userId, dispatch]);

    useEffect(() => {
        if (!isLoading && userDetail) {
            if (String(userDetail.userId) === String(userId)) {
                const mappedData = {
                    userId: userDetail.employeeCode || userDetail.userId,
                    firstName: userDetail.firstName || '',
                    lastName: userDetail.lastName || '',
                    email: userDetail.userEmail || '',
                    phoneNumber: userDetail.phoneNumber || '',
                    phoneCountryCode: '+91',
                    gender: userDetail.gender || '',
                    dob: userDetail.dateOfBirth || null,
                    bloodGroup: userDetail.bloodGroup || '',
                    maritalStatus: userDetail.maritalStatus || '',

                    // Employment Information
                    status: userDetail.isActive ? 'Active' : 'Inactive',
                    typeOfHire: userDetail.employmentType || '',
                    department: departmentOptions.find(d => d.id === userDetail.departmentId)?.name || '',
                    departmentId: userDetail.departmentId || '',
                    role: roleOptions.find(r => r.id === userDetail.roleId)?.name || '',
                    roleId: userDetail.roleId || '',
                    joiningDate: userDetail.joiningDate || null,
                    anniversaryDate: userDetail.anniversaryDate || null,

                    // Address Information
                    streetAddress1: userDetail.address || '',
                    streetAddress2: userDetail.addressLine1 || '',
                    city: userDetail.city || '',
                    state: userDetail.state || '',
                    postalCode: userDetail.postalCode || '',
                    country: userDetail.country || '',
                    countryAddress: userDetail.country || '',
                    nationality: userDetail.country || '',

                    // Emergency Contact
                    emergencyContactName: userDetail.emergencyContactName || '',
                    emergencyContactRelation: userDetail.emergencyContactRelation || '',
                    emergencyContactPhone: userDetail.emergencyContactNumber || '',

                    // Additional fields
                    profilePhotoUrl: userDetail?.profilePhotoUrl,
                    description: userDetail.description || '',
                    reportToUserId: userDetail.reportToUserId || '',
                    companyId: userDetail.companyId || '',

                    // Professional fields (not in API, set defaults)
                    levelOfEducation: '',
                    degree: '',
                    institution: '',
                    graduationYear: '',
                    officeLocation: '',
                };

                setProfileData(mappedData);
            }
        }
    }, [userDetail, isLoading, userId]);

    // Handlers
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleRetry = () => {
        if (userId) {
            dispatch(clearUserProfileError());
            // dispatch(getUserProfileRequest({ userId: userId }));
            dispatch(getEmployeeProfileRequest({ userId: userId }));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(null);
        setErrors({});
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({ ...profileData });
        setErrors({});
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setEditData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSave = () => {
        // Validation
        const newErrors = {};
        if (!editData.firstName?.trim()) newErrors.firstName = 'First Name is required';
        if (!editData.lastName?.trim()) newErrors.lastName = 'Last Name is required';
        if (!editData.email?.trim()) newErrors.email = 'Email is required';
        else {
            const emailValidation = validateEmailStrict(editData.email.trim());
            if (!emailValidation.isValid) newErrors.email = emailValidation.message;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (userDetail) {
            const payload = {
                firstName: editData.firstName,
                lastName: editData.lastName,
                userEmail: editData.email,
                phoneNumber: editData.phoneNumber,
                gender: editData.gender,
                dateOfBirth: editData.dob ? format(new Date(editData.dob), 'yyyy-MM-dd') : null,
                bloodGroup: editData.bloodGroup,
                maritalStatus: editData.maritalStatus,
                anniversaryDate: editData.anniversaryDate ? format(new Date(editData.anniversaryDate), 'yyyy-MM-dd') : null,
                country: editData.nationality,
                address: editData.streetAddress1,
                addressLine1: editData.streetAddress2,
                city: editData.city,
                state: editData.state,
                postalCode: editData.postalCode,
                emergencyContactName: editData.emergencyContactName,
                emergencyContactRelation: editData.emergencyContactRelation,
                emergencyContactNumber: editData.emergencyContactPhone,
                departmentId: editData.departmentId,
                roleId: editData.roleId,
                joiningDate: editData.joiningDate ? format(new Date(editData.joiningDate), 'yyyy-MM-dd') : null,
                isActive: editData.status === 'Active',
                employmentType: editData.typeOfHire,
                reportToUserId: editData.reportToUserId ? Number(editData.reportToUserId) : null,
            };

            dispatch(
                updateUserRequest({
                    userId: userDetail.userId,
                    userData: payload,
                    onSuccess: () => {
                        setIsEditing(false);
                        setEditData(null);
                        dispatch(getEmployeeProfileRequest({ userId: userId }));
                        toast.success('Member updated successfully');
                    },
                    onFailure: (err) => {
                        toast.error(`Update failed: ${err}`);
                    },
                })
            );
        }
    };

    // DERIVED DATA: Calculate age and other computed values
    const age = useMemo(() => {
        if (profileData?.dob) {
            const parsedDob = dateToParse(profileData.dob);
            if (parsedDob && isValid(parsedDob)) {
                return differenceInYears(new Date(), parsedDob);
            }
        }
        return null;
    }, [profileData?.dob]);

    // Format profile image URL
    const profileImageUrl = useMemo(() => {
        // const imageUrl = profileData?.avatarUrl;
        const imageUrl = profileData?.profilePhotoUrl || profileData?.avatarUrl;
        if (imageUrl) {
            return imageUrl.startsWith('http') ? imageUrl : `${ASSETS_BASE_URL}${imageUrl}`;
        }
        return null;
    // }, [profileData?.avatarUrl]);
    }, [profileData?.profilePhotoUrl]);

    // Left panel information with proper field mapping
    const leftPanelInfo = useMemo(() => [
        // { 
        //     icon: <EmailOutlinedIcon />, 
        //     label: 'Email', 
        //     value: profileData?.email 
        // },
        { 
            icon: <PhoneOutlinedIcon />, 
            label: 'Mobile Phone', 
            value: `${profileData?.phoneCountryCode || ''} ${profileData?.phoneNumber || ''}`.trim() 
        },
        {
            icon: <PublicIcon />,
            label: 'Nationality',
            value: countryOptions.find(c => c.label === profileData?.nationality || c.code === profileData?.nationality)?.label
        },
        {
            icon: <WcOutlinedIcon />,
            label: 'Gender',
            value: profileData?.gender
        },
        {
            icon: <CakeOutlinedIcon />,
            label: 'Age',
            value: age ? `${age} years` : null
        },
        {
            icon: <FavoriteIcon />,
            label: 'Blood Group',
            value: profileData?.bloodGroup
        },
        {
            icon: <WorkOutlineOutlinedIcon />,
            label: 'Status',
            value: profileData?.status,
            isChip: true,
            chipColor: profileData?.status === 'Active' ? 'success' : 'default'
        },
        {
            icon: <BadgeIcon />,
            label: 'Employment Type',
            value: profileData?.typeOfHire
        },
    ].filter(item => item.value), [profileData, age]);

    if (error) {
        return (
            <ErrorBoundary
                error={error}
                onRetry={handleRetry}
                onDismiss={() => navigate('/employee')}
                title="Error Loading User Details"
                showInline={false}
                showImage={true}
            />
        );
    }

    if (isLoading && !profileData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
                Team Member profile not found.
            </Typography>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const parsed = dateToParse(dateString);
        if (parsed && isValid(parsed)) {
            return format(parsed, 'MMMM dd, yyyy');
        }
        return 'N/A';
    };

    const currentData = isEditing ? editData : profileData;

    return (
        <Box sx={{
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh'
        }}>
            <Grid container spacing={gridSpacing} sx={{ p: gridSpacing }}>
                {/* Left Sidebar */}
                <Grid item size={{ xs: 12, md: 4, lg: 3 }}>
                    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        {/* Custom Avatar with Initials */}
                        <ViewProfileAvatar
                            src={profileImageUrl}
                            firstName={profileData?.firstName}
                            lastName={profileData?.lastName}
                            size={140}
                        />

                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {profileData?.firstName} {profileData?.lastName}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 400 }}>
                            {profileData?.role || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {profileData?.department || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            ID: {profileData?.userId || 'N/A'}
                        </Typography>

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
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Tabs Header */}
                    <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider', 
                        bgcolor: 'background.paper',
                        display: 'flex',                 
                        justifyContent: 'space-between',  
                        alignItems: 'center',                 
                        pr: 2                             
                    }}>                            
                                <Tabs
                                value={currentTab}
                                onChange={handleTabChange}
                                aria-label="profile information tabs"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 60, px: 3.5 },
                                    '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3 },
                                    '& .Mui-selected': { color: 'primary.main' }
                                }}
                            >
                                <Tab label="Personal Information" id="view-profile-tab-0" aria-controls="view-profile-tabpanel-0" />
                                <Tab label="Job Information" id="view-profile-tab-1" aria-controls="view-profile-tabpanel-1" />
                            </Tabs>
                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={() => setIsChangePasswordOpen(true)}
                                    sx={{ borderRadius: '6px', textTransform: 'none' }}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: gridSpacing }}>
                            {/* Personal Information Tab */}
                            <TabPanel value={currentTab} index={0}>
                                <ViewSectionCard title="Basic Details" icon={<PersonOutlineIcon />}>
                                    {!isEditing ? (
                                        <InfoDisplayItem
                                            label="Full Name"
                                            value={`${currentData?.firstName || ''} ${currentData?.lastName || ''}`.trim()}
                                        />
                                    ) : (
                                        <>
                                            <InfoDisplayItem
                                                label="First Name"
                                                name="firstName"
                                                value={currentData?.firstName}
                                                isEditing={isEditing}
                                                onChange={handleFieldChange}
                                                error={errors.firstName}
                                            />
                                            <InfoDisplayItem
                                                label="Last Name"
                                                name="lastName"
                                                value={currentData?.lastName}
                                                isEditing={isEditing}
                                                onChange={handleFieldChange}
                                                error={errors.lastName}
                                            />
                                        </>
                                    )}
                                    <InfoDisplayItem
                                        label="Gender"
                                        name="gender"
                                        type="select"
                                        options={[{label: 'Male', value: 'Male'}, {label: 'Female', value: 'Female'}, {label: 'Other', value: 'Other'}]}
                                        value={currentData?.gender}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Date of Birth"
                                        name="dob"
                                        type="date"
                                        value={isEditing ? currentData?.dob : formatDate(currentData?.dob)}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    {!isEditing && (
                                        <InfoDisplayItem
                                            label="Age"
                                            value={age ? `${age} years` : 'N/A'}
                                        />
                                    )}
                                    <InfoDisplayItem
                                        label="Blood Group"
                                        name="bloodGroup"
                                        type="select"
                                        options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => ({label: bg, value: bg}))}
                                        value={currentData?.bloodGroup}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Marital Status"
                                        name="maritalStatus"
                                        type="select"
                                        options={maritalStatusOptions.map(ms => ({label: ms, value: ms}))}
                                        value={currentData?.maritalStatus}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Anniversary Date"
                                        name="anniversaryDate"
                                        type="date"
                                        value={isEditing ? currentData?.anniversaryDate : formatDate(currentData?.anniversaryDate)}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Nationality"
                                        name="nationality"
                                        type={isEditing ? "select" : "text"}
                                        options={countryOptions.map(c => ({label: c.label, value: c.code}))}
                                        value={isEditing ? currentData?.nationality : (countryOptions.find(c => c.label === currentData?.nationality || c.code === currentData?.nationality)?.label || currentData?.nationality || 'N/A')}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Contact Details" icon={<EmailOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={currentData?.email}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                        error={errors.email}
                                    />
                                    <InfoDisplayItem
                                        label="Phone Number"
                                        name="phoneNumber"
                                        value={currentData?.phoneNumber}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                        error={errors.phoneNumber}
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Address Information" icon={<HomeOutlinedIcon />}>
                                    <InfoDisplayItem
                                        label="Address Line 1"
                                        name="streetAddress1"
                                        value={currentData?.streetAddress1}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                        fullWidth
                                    />
                                    {(currentData?.streetAddress2 || isEditing) && (
                                        <InfoDisplayItem
                                            label="Address Line 2"
                                            name="streetAddress2"
                                            value={currentData?.streetAddress2}
                                            isEditing={isEditing}
                                            onChange={handleFieldChange}
                                            fullWidth
                                        />
                                    )}
                                    <InfoDisplayItem
                                        label="City"
                                        name="city"
                                        value={currentData?.city}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="State"
                                        name="state"
                                        value={currentData?.state}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Postal Code"
                                        name="postalCode"
                                        value={currentData?.postalCode}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Country"
                                        name="country"
                                        type={isEditing ? "select" : "text"}
                                        options={countryOptions.map(c => ({label: c.label, value: c.code}))}
                                        value={isEditing ? currentData?.country : (countryOptions.find(c => c.label === currentData?.country || c.code === currentData?.country)?.label || currentData?.country || 'N/A')}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                </ViewSectionCard>

                                <ViewSectionCard title="Emergency Contact" icon={<ContactEmergencyIcon />}>
                                    <InfoDisplayItem
                                        label="Contact Name"
                                        name="emergencyContactName"
                                        value={currentData?.emergencyContactName}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Relation"
                                        name="emergencyContactRelation"
                                        value={currentData?.emergencyContactRelation}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Phone Number"
                                        name="emergencyContactPhone"
                                        value={currentData?.emergencyContactPhone}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                </ViewSectionCard>
                            </TabPanel>

                            {/* Job Information Tab */}
                            <TabPanel value={currentTab} index={1}>
                                <ViewSectionCard title="Employment Details" icon={<BusinessCenterIcon />}>
                                    <InfoDisplayItem
                                        label="ID"
                                        value={currentData?.userId}
                                    />
                                    <InfoDisplayItem
                                        label="Role"
                                        name="roleId"
                                        type={isEditing ? "select" : "text"}
                                        options={companyRoles?.map(r => ({label: r.roleName, value: r.companyRoleId}))}
                                        value={isEditing ? currentData?.roleId : currentData?.role}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Department"
                                        name="departmentId"
                                        type={isEditing ? "select" : "text"}
                                        options={companyDepartments?.map(d => ({label: d.departmentName, value: d.deptId}))}
                                        value={isEditing ? currentData?.departmentId : currentData?.department}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Employment Type"
                                        name="typeOfHire"
                                        type={isEditing ? "select" : "text"}
                                        options={employmentTypeOptions.map(t => ({label: t, value: t}))}
                                        value={currentData?.typeOfHire}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Joining Date"
                                        name="joiningDate"
                                        type="date"
                                        value={isEditing ? currentData?.joiningDate : formatDate(currentData?.joiningDate)}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Employment Status"
                                        name="status"
                                        type={isEditing ? "select" : "text"}
                                        options={[{label: 'Active', value: 'Active'}, {label: 'Inactive', value: 'Inactive'}]}
                                        value={currentData?.status}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Office Location"
                                        name="officeLocation"
                                        value={currentData?.officeLocation}
                                        icon={!isEditing ? <LocationOnOutlinedIcon /> : null}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                    <InfoDisplayItem
                                        label="Reports To (User ID)"
                                        name="reportToUserId"
                                        value={currentData?.reportToUserId}
                                        isEditing={isEditing}
                                        onChange={handleFieldChange}
                                    />
                                </ViewSectionCard>

                                {/* <ViewSectionCard title="Professional Background" icon={<SchoolIcon />}>
                                    <InfoDisplayItem 
                                        label="Level of Education" 
                                        value={profileData?.levelOfEducation || 'Not specified'} 
                                    />
                                    <InfoDisplayItem
                                        label="Degree"
                                        value={profileData?.degree || 'Not specified'}
                                    />
                                    <InfoDisplayItem
                                        label="Institution"
                                        value={profileData?.institution || 'Not specified'}
                                    />
                                    <InfoDisplayItem
                                        label="Year of Graduation"
                                        value={profileData?.graduationYear || 'Not specified'}
                                    />
                                </ViewSectionCard> */}
                            </TabPanel>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <UserChangePassword
                open={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                userId={userId}
            />

        </Box>
    );
}
