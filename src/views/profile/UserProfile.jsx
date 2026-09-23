import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Button,
    Select,
    MenuItem,
    Menu,
    FormControl,
    InputLabel,
    IconButton,
    Divider,
    Tooltip,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SchoolIcon from '@mui/icons-material/School';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PublicIcon from '@mui/icons-material/Public';
import BadgeIcon from '@mui/icons-material/Badge';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ConfirmDeleteDialog from '../../uiComponent/deleteconfirmation/ConfirmDeleteDialog';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO, isValid, differenceInYears } from 'date-fns';
import { gridSpacing } from '../../store/constant';
import { useTheme } from '@mui/material/styles';

import { selectUser } from '../../redux/features/auth/authSlice';
import {
    getUserProfileRequest,
    updateUserRequest,
    updatePasswordRequest,
    uploadProfileImageRequest,
    selectUserProfile,
    selectUserProfileLoading,
    selectUserProfileError,
    selectIsProfileUpdated,
    selectIsPasswordChanged,
    selectIsImageUploading,
    resetProfileUpdateStatus,
    resetPasswordChangeStatus,
    clearUserProfileError,
    deleteProfileImageRequest,
} from '../../redux/features/profile/profileSlice';

import { selectCompanyDepartments } from '../../redux/features/company/companySlice';

import { ROLES } from '../../utils/roles';

const countryOptions = [
    { code: 'IN', label: 'India', phone: '+91' }, 
    { code: 'US', label: 'United States', phone: '+1' },
    { code: 'GB', label: 'United Kingdom', phone: '+44' }, 
    { code: 'CA', label: 'Canada', phone: '+1' },
    { code: 'AU', label: 'Australia', phone: '+61' },
    { code: 'SG', label: 'Singapore', phone: '+65' }
];

const designationOptions = [
    'Junior Developer', 'Senior Developer', 'Software Engineer', 'Product Manager', 
    'Team Lead', 'UX Designer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst'
];

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const statusOptions = [{ id: true, label: 'Active' }, { id: false, label: 'Inactive' }];
const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const levelOfEducationOptions = [
    'High School', 'Associate Degree', "Bachelor's Degree", 
    "Master's Degree", "Doctorate", 'Professional Certification'
];

const departmentOptions = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Human Resources' },
    { id: 4, name: 'Design' },
    { id: 5, name: 'Sales' },
    { id: 6, name: 'Operations' },
];

const generateInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
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

const ProfileAvatar = ({ src, firstName, lastName, size = 140, ...props }) => {
    const initials = generateInitials(firstName, lastName);
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const backgroundColor = generateAvatarColor(name);
    
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
                ...props.sx
            }}
            {...props}
        >
            {!hasValidImage && initials}
        </Avatar>
    );
};

const ProfileSectionCard = ({ title, icon, children, sx }) => (
    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '12px', mb: gridSpacing, ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: gridSpacing - 0.5 }}>
            {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.main', fontSize:'1.4rem' }})}
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize:'1.1rem' }}>{title}</Typography>
        </Box>
        <Divider sx={{mb: gridSpacing + 0.5}}/>
        <Grid container spacing={gridSpacing}>
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
      id={`edit-profile-tabpanel-${index}`}
      aria-labelledby={`edit-profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: gridSpacing }}>{children}</Box>}
    </div>
  );
}

export default function ProfileView() {
    const theme = useTheme();
    const dispatch = useDispatch();

    const loggedInUser = useSelector(selectUser);
    const userProfile = useSelector(selectUserProfile);
    const isLoading = useSelector(selectUserProfileLoading);
    const error = useSelector(selectUserProfileError);
    const isProfileUpdated = useSelector(selectIsProfileUpdated);
    const isPasswordChanged = useSelector(selectIsPasswordChanged);
    const isImageUploading = useSelector(selectIsImageUploading);
    const companyDepartments = useSelector(selectCompanyDepartments);

    const isSuperAdmin = useMemo(() => {
        return loggedInUser?.role === ROLES.SUPER_ADMIN || 
               loggedInUser?.roleName === ROLES.SUPER_ADMIN;
    }, [loggedInUser]);

    const [profileData, setProfileData] = useState({});
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const profileImageInputRef = useRef(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [imageMenuAnchor, setImageMenuAnchor] = useState(null);

    const dateToParse = (dateString) => {
        if (!dateString) return null;
        const parsed = parseISO(dateString);
        return isValid(parsed) ? parsed : null;
    };

    useEffect(() => {
        if (loggedInUser?.id) {
            dispatch(getUserProfileRequest({ 
                userId: loggedInUser.id,
                onFailure: (error) => {
                    console.error('Failed to load profile:', error);
                }
            }));
        }
    }, [dispatch, loggedInUser]);

    useEffect(() => {
        if (userProfile) {
            setProfileData({
                userId: userProfile.companyEmployeeId || '',
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                email: userProfile.userEmail || '',
                phoneCountryCode: userProfile.phoneCountryCode || '+91',
                phoneNumber: userProfile.phoneNumber || '',
                gender: userProfile.gender || '',
                dob: dateToParse(userProfile.dateOfBirth),
                bloodGroup: userProfile.bloodGroup || '',
                maritalStatus: userProfile.maritalStatus || '',
                
                status: userProfile.isActive !== undefined ? userProfile.isActive : true,
                designation: '', 
                typeOfHire: userProfile.employmentType || '',
                department: userProfile.departmentId || '',
                joiningDate: dateToParse(userProfile.joiningDate),
                anniversaryDate: dateToParse(userProfile.anniversaryDate),
                
                streetAddress1: userProfile.address || '',
                streetAddress2: userProfile.addressLine1 || '',
                city: userProfile.city || '',
                state: userProfile.state || '',
                postalCode: userProfile.postalCode || '',
                country: userProfile.country || '',
                
                emergencyContactName: userProfile.emergencyContactName || '',
                emergencyContactRelation: userProfile.emergencyContactRelation || '',
                emergencyContactPhone: userProfile.emergencyContactNumber || '',
                
                reportingManager: userProfile.reportToUserId || '',
                officeLocation: '',
                levelOfEducation: '',
                degree: '',
                institution: '',
                graduationYear: '',
                
                employeeId: userProfile.companyEmployeeId,
                roleId: userProfile.roleId,
                companyId: userProfile.companyId,
            });

            const imageUrl = userProfile.profilePhotoUrl;
            if (imageUrl ) {
                setProfileImage(imageUrl.startsWith('http') ? imageUrl : `${ASSETS_BASE_URL}${imageUrl}`);
            } else {
                setProfileImage(null);
            }
        }
    }, [userProfile]);

    useEffect(() => {
        if (isProfileUpdated) {
            setSuccessMessage('Profile updated successfully!');
            setShowSuccessMessage(true);
            setTimeout(() => {
                dispatch(resetProfileUpdateStatus());
                setShowSuccessMessage(false);
            }, 3000);
        }
    }, [isProfileUpdated, dispatch]);

    useEffect(() => {
        if (isPasswordChanged) {
            setSuccessMessage('Password changed successfully!');
            setShowSuccessMessage(true);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => {
                dispatch(resetPasswordChangeStatus());
                setShowSuccessMessage(false);
            }, 3000);
        }
    }, [isPasswordChanged, dispatch]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, newValue) => {
        setProfileData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const previewUrl = URL.createObjectURL(file);
            setProfileImage(previewUrl);

            dispatch(uploadProfileImageRequest({
                formData,
                userId: userProfile.userId,
                onFailure: (error) => {
                    console.error('Failed to upload image:', error);
                }
            }));
        }
    };

    const handleImageUploadClick = () => { 
        profileImageInputRef.current?.click(); 
    };
    const handleDeleteImageClick = () => {
    setIsDeleteDialogOpen(true);
};
const handleConfirmDeleteImage = () => {
  dispatch(
    deleteProfileImageRequest({
      userId: userProfile.userId,
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setProfileImage(null);
      },
      onFailure: () => {
        setIsDeleteDialogOpen(false);
      },
    })
  );
};
    const validateForm = () => {
        if (currentTab === 0) {
            const requiredFields = ['firstName', 'lastName', 'phoneNumber'];
            const missingFields = requiredFields.filter(field => !profileData[field]);
            
            if (missingFields.length > 0) {
                alert(`Please fill in required fields: ${missingFields.join(', ')}`);
                return false;
            }
        }
        if (currentTab === 2 && (oldPassword || newPassword || confirmNewPassword)) {
            if (!oldPassword) {
                alert("Please enter your old password to change it.");
                return false;
            }
            if (!newPassword) {
                alert("Please enter a new password.");
                return false;
            }
            if (newPassword.length < 6) {
                alert("New password must be at least 6 characters long!");
                return false;
            }
            if (newPassword !== confirmNewPassword) {
                alert("New password and confirm new password do not match!");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        dispatch(clearUserProfileError());

        if (currentTab !== 2) {
            const updatePayload = {
                isActive: profileData.status,
                employmentType: profileData.typeOfHire,
                address: profileData.streetAddress1,
                addressLine1: profileData.streetAddress2,
                city: profileData.city,
                state: profileData.state,
                postalCode: profileData.postalCode,
                country: profileData.country,
                gender: profileData.gender,
                bloodGroup: profileData.bloodGroup,
                phoneNumber: profileData.phoneNumber,
                dateOfBirth: profileData.dob ? format(profileData.dob, 'yyyy-MM-dd') : null,
                maritalStatus: profileData.maritalStatus,
                joiningDate: profileData.joiningDate ? format(profileData.joiningDate, 'yyyy-MM-dd') : null,
                anniversaryDate: profileData.anniversaryDate ? format(profileData.anniversaryDate, 'yyyy-MM-dd') : null,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                emergencyContactName: profileData.emergencyContactName,
                emergencyContactRelation: profileData.emergencyContactRelation,
                emergencyContactNumber: profileData.emergencyContactPhone,
                departmentId: profileData.department,
                roleId: profileData.roleId,
            };

            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] === null || updatePayload[key] === undefined) {
                    delete updatePayload[key];
                }
            });

            dispatch(updateUserRequest({
                userId: loggedInUser?.id,
                userData: updatePayload,
            }));
        }

        if (currentTab === 2 && newPassword && newPassword === confirmNewPassword && oldPassword) {
            dispatch(updatePasswordRequest({
                passwordData: { 
                    currentPassword: oldPassword, 
                    newPassword: newPassword,
                    confirmPassword: confirmNewPassword 
                },
                onSuccess: () => {
                    setSuccessMessage('Password changed successfully!'); 
                    setShowSuccessMessage(true);
                },
                onFailure: (error) => {
                    console.error('Password update failed:', error);
                }
            }));
        }
    };

    const handleTabChange = (event, newValue) => { 
        setCurrentTab(newValue); 
    };

    const age = useMemo(() => {
        if (profileData.dob && isValid(profileData.dob)) {
            return differenceInYears(new Date(), profileData.dob);
        }
        return null;
    }, [profileData.dob]);

    const sidebarItems = useMemo(() => [
        { icon: <PhoneOutlinedIcon fontSize="small" />, text: profileData.phoneNumber },
        { icon: <WcOutlinedIcon fontSize="small" />, text: profileData.gender },
        { icon: <CakeOutlinedIcon fontSize="small" />, text: age ? `${age} years` : null },
        { icon: <WorkOutlineOutlinedIcon fontSize="small" />, text: statusOptions.find(s => s.id === profileData.status)?.label },
        { icon: <BadgeIcon fontSize="small" />, text: profileData.typeOfHire },
        { icon: <FavoriteIcon fontSize="small" />, text: profileData.bloodGroup },
    ].filter(item => item.text), [profileData, age]);

    const availableTabs = useMemo(() => {
        const tabs = [
            { label: "Personal Information", index: 0 },
            { label: "Security", index: 2 } 
        ];
        if (!isSuperAdmin) {
            tabs.splice(1, 0, { label: "Job Information", index: 1 });
        }
        
        return tabs;
    }, [isSuperAdmin]);

    if (isLoading && !userProfile) {
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

    return (
        <Box sx={{ 
            width: '100%', 
            boxSizing: 'border-box', 
            backgroundColor: theme.palette.background.default, 
            minHeight: '100vh' 
        }}>
            <Snackbar 
                open={showSuccessMessage} 
                autoHideDuration={3000} 
                onClose={() => setShowSuccessMessage(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setShowSuccessMessage(false)} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            <Grid container spacing={gridSpacing} sx={{p: gridSpacing }}>
                {/* Left Sidebar Card */}
                <Grid item size={{ xs: 12, md: 4, lg: 3 }}>
                    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                            <ProfileAvatar
                                src={profileImage}
                                firstName={profileData.firstName}
                                lastName={profileData.lastName}
                                size={140}
                                onClick={handleImageUploadClick}
                            />
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={profileImageInputRef} 
                                onChange={handleImageChange} 
                                style={{ display: 'none' }} 
                            />
                          <Tooltip title="Edit Profile Picture">
    <IconButton
        onClick={(event) => setImageMenuAnchor(event.currentTarget)}
        size="small"
        disabled={isImageUploading}
        sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
                backgroundColor: 'primary.dark'
            },
            boxShadow: theme.shadows[2]
        }}
    >
        {isImageUploading ? (
            <CircularProgress size={16} color="inherit" />
        ) : (
            <EditIcon fontSize="small" />
        )}
    </IconButton>
</Tooltip>
<Menu
    anchorEl={imageMenuAnchor}
    open={Boolean(imageMenuAnchor)}
    onClose={() => setImageMenuAnchor(null)}
>
    {/* Upload option - always visible */}
    <MenuItem
        onClick={() => {
            setImageMenuAnchor(null);
            handleImageUploadClick();
        }}
    >
        <PhotoCamera fontSize="small" sx={{ mr: 1 }} />
        Change / Upload
    </MenuItem>

    {/* Delete option - only when photo exists */}
    {profileImage && (
        <MenuItem
            onClick={() => {
                setImageMenuAnchor(null);
                handleDeleteImageClick();
            }}
        >
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Photo
        </MenuItem>
    )}
</Menu>
               
                        </Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {profileData.firstName || ''} {profileData.lastName || ''}
                        </Typography>
                        
                        {isSuperAdmin ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <AdminPanelSettingsIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                                        System Admin
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                                    Super Administrator
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 400 }}>
                                    {companyDepartments.find(d => d.deptId === profileData.department)?.departmentName || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                                    ID: {profileData.userId || 'N/A'}
                                </Typography>
                            </>
                        )}
                        
                        <Divider sx={{mb: 2, mt:1}} />
                        <List dense sx={{ textAlign: 'left', px:1 }}>
                            {sidebarItems.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 1.25 }}>
                                    <ListItemIcon sx={{ minWidth: '40px', color: 'primary.main' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body2" color="text.primary" fontWeight={500}>
                                                {item.text}
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Form Area with Tabs */}
                <Grid item size={{ xs: 12, md: 8, lg: 9 }}>
                    <Paper variant="outlined" sx={{ borderRadius: '16px', height: '100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Tabs 
                                value={currentTab} 
                                onChange={handleTabChange} 
                                aria-label="edit profile tabs" 
                                variant="scrollable" 
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 60, px:3.5 },
                                    '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height:3 },
                                    '& .Mui-selected': { color: 'primary.main' }
                                }}
                            >
                                {availableTabs.map((tab, tabIndex) => (
                                    <Tab 
                                        key={tab.index}
                                        label={tab.label} 
                                        id={`edit-profile-tab-${tabIndex}`} 
                                        aria-controls={`edit-profile-tabpanel-${tabIndex}`}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} sx={{flexGrow:1, overflowY:'auto', p: gridSpacing }}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            
                            {/* Personal Information Tab */}
                            <TabPanel value={currentTab} index={0}>
                                <ProfileSectionCard title="Basic Details" icon={<PersonOutlineIcon />}>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="firstName" 
                                            label="First Name" 
                                            value={profileData.firstName || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                            required 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="lastName" 
                                            label="Last Name" 
                                            value={profileData.lastName || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                            required 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker 
                                                label="Date of Birth" 
                                                value={profileData.dob} 
                                                onChange={(v) => handleDateChange('dob', v)} 
                                                slotProps={{ textField: { fullWidth: true } }} 
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Gender</InputLabel>
                                            <Select 
                                                name="gender" 
                                                value={profileData.gender || ''} 
                                                label="Gender" 
                                                onChange={handleChange}
                                            >
                                                {genderOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Blood Group</InputLabel>
                                            <Select 
                                                name="bloodGroup" 
                                                value={profileData.bloodGroup || ''} 
                                                label="Blood Group" 
                                                onChange={handleChange}
                                            >
                                                {bloodGroupOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Marital Status</InputLabel>
                                            <Select 
                                                name="maritalStatus" 
                                                value={profileData.maritalStatus || ''} 
                                                label="Marital Status" 
                                                onChange={handleChange}
                                            >
                                                {maritalStatusOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker 
                                                label="Anniversary Date" 
                                                value={profileData.anniversaryDate} 
                                                onChange={(v) => handleDateChange('anniversaryDate', v)} 
                                                slotProps={{ textField: { fullWidth: true } }} 
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </ProfileSectionCard>

                                <ProfileSectionCard title="Contact Details" icon={<EmailOutlinedIcon />}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            name="email" 
                                            label="Email Address" 
                                            type="email" 
                                            value={profileData.email || ''} 
                                            fullWidth 
                                            InputProps={{ readOnly: true }} 
                                            helperText="Email cannot be changed."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={4} sm={3}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Code</InputLabel>
                                                    <Select 
                                                        name="phoneCountryCode" 
                                                        value={profileData.phoneCountryCode || ''} 
                                                        label="Code" 
                                                        onChange={handleChange}
                                                    >
                                                        {countryOptions.map(option => (
                                                            <MenuItem key={option.code} value={option.phone}>
                                                                {option.code} ({option.phone})
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={8} sm={9}>
                                                <TextField 
                                                    name="phoneNumber" 
                                                    label="Phone Number" 
                                                    value={profileData.phoneNumber || ''} 
                                                    onChange={handleChange} 
                                                    fullWidth 
                                                    required 
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </ProfileSectionCard>

                                <ProfileSectionCard title="Address Information" icon={<HomeOutlinedIcon />}>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="streetAddress1" 
                                            label="Address Line 1" 
                                            value={profileData.streetAddress1 || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="streetAddress2" 
                                            label="Address Line 2 (Optional)" 
                                            value={profileData.streetAddress2 || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="city" 
                                            label="City" 
                                            value={profileData.city || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="state" 
                                            label="State" 
                                            value={profileData.state || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="postalCode" 
                                            label="Postal Code" 
                                            value={profileData.postalCode || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Country</InputLabel>
                                            <Select 
                                                name="country" 
                                                value={profileData.country || ''} 
                                                label="Country" 
                                                onChange={handleChange}
                                            >
                                                {countryOptions.map(option => (
                                                    <MenuItem key={option.code} value={option.label}>{option.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </ProfileSectionCard>

                                <ProfileSectionCard title="Emergency Contact" icon={<ContactEmergencyIcon />}>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="emergencyContactName" 
                                            label="Full Name" 
                                            value={profileData.emergencyContactName || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="emergencyContactRelation" 
                                            label="Relation" 
                                            value={profileData.emergencyContactRelation || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="emergencyContactPhone" 
                                            label="Phone Number" 
                                            value={profileData.emergencyContactPhone || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                </ProfileSectionCard>
                            </TabPanel>

                            {!isSuperAdmin && (
                                <TabPanel value={currentTab} index={1}>
                                    <ProfileSectionCard title="Employment Details" icon={<BusinessCenterIcon />}>
                                        <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                            <TextField 
                                                name="userId" 
                                                label="ID" 
                                                value={profileData.userId || ''} 
                                                fullWidth 
                                                InputProps={{ readOnly: true }} 
                                                helperText="ID cannot be changed."
                                            />
                                        </Grid>
                                        <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Department</InputLabel>
                                                <Select 
                                                    name="department" 
                                                    value={profileData.department || ''} 
                                                    label="Department"
                                                    onChange={handleChange}
                                                >
                                                    {companyDepartments.map(option => (
                                                        <MenuItem key={option.deptId} value={option.deptId}>{option.departmentName}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Employment Type</InputLabel>
                                                <Select 
                                                    name="typeOfHire" 
                                                    value={profileData.typeOfHire || ''} 
                                                    label="Employment Type" 
                                                    onChange={handleChange}
                                                >
                                                    {employmentTypeOptions.map(option => (
                                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker 
                                                    label="Joining Date" 
                                                    value={profileData.joiningDate} 
                                                    onChange={(v) => handleDateChange('joiningDate', v)} 
                                                    slotProps={{ textField: { fullWidth: true } }} 
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Employment Status</InputLabel>
                                                <Select 
                                                    name="status" 
                                                    value={profileData.status} 
                                                    label="Employment Status" 
                                                    onChange={handleChange}
                                                >
                                                    {statusOptions.map(option => (
                                                        <MenuItem key={option.label} value={option.id}>{option.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                                                            {/* <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="officeLocation" 
                                            label="Office Location" 
                                            value={profileData.officeLocation || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid> */}
                                    </ProfileSectionCard>
                                    {/* <ProfileSectionCard title="Professional Background" icon={<SchoolIcon />}>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Level of Education</InputLabel>
                                            <Select 
                                                name="levelOfEducation" 
                                                value={profileData.levelOfEducation || ''} 
                                                label="Level of Education" 
                                                onChange={handleChange}
                                            >
                                                {levelOfEducationOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="degree" 
                                            label="Degree" 
                                            value={profileData.degree || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="institution" 
                                            label="Institution" 
                                            value={profileData.institution || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="graduationYear" 
                                            label="Year of Graduation" 
                                            value={profileData.graduationYear || ''} 
                                            onChange={handleChange} 
                                            fullWidth 
                                            type="number" 
                                        />
                                    </Grid>
                                </ProfileSectionCard> */}
                                </TabPanel>
                            )}

                            <TabPanel value={currentTab} index={isSuperAdmin ? 1 : 2}>
                                <ProfileSectionCard title="Change Password" icon={<VpnKeyIcon />}>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="oldPassword" 
                                            label="Old Password" 
                                            type="password" 
                                            value={oldPassword} 
                                            onChange={(e) => setOldPassword(e.target.value)} 
                                            fullWidth 
                                            placeholder="Enter old password" 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="newPassword" 
                                            label="New Password" 
                                            type="password" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            fullWidth 
                                            placeholder="Enter new password" 
                                            helperText="Minimum 6 characters." 
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12,sm: 6, md: 4, lg: 3 }}>
                                        <TextField 
                                            name="confirmNewPassword" 
                                            label="Confirm New Password" 
                                            type="password" 
                                            value={confirmNewPassword} 
                                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                            fullWidth 
                                            placeholder="Confirm new password" 
                                            error={!!newPassword && newPassword !== confirmNewPassword} 
                                            helperText={
                                                !!newPassword && newPassword !== confirmNewPassword ? 
                                                "Passwords do not match" : 
                                                "Must match the new password"
                                            } 
                                        />
                                    </Grid>
                                </ProfileSectionCard>
                            </TabPanel>

                            {/* Submit Button */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                mt: gridSpacing, 
                                p: gridSpacing, 
                                borderTop: 1, 
                                borderColor:'divider',
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: 'background.paper'
                            }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary" 
                                    size="large" 
                                    disabled={isLoading} 
                                    sx={{ borderRadius: '8px', px: 5, minWidth: '150px' }}
                                >
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" />
                                            Saving...
                                        </Box>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
             <ConfirmDeleteDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDeleteImage}
                itemName="profile photo"
            />
        </Box>

    );
}
