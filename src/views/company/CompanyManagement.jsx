import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Grid, Paper, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText,
    TextField, Button, Select, MenuItem, FormControl, InputLabel, IconButton, Divider,
    Tooltip, Tabs, Tab, CircularProgress, Alert, Snackbar, Chip, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { format, parseISO, isValid } from 'date-fns';
import { gridSpacing } from '../../store/constant';
import { useTheme } from '@mui/material/styles';
import { validateEmailStrict } from '../../utils/emailValidation';
import {
    getCompanyByIdRequest,
    updateCompanyRequest,
    uploadCompanyLogoRequest,
    uploadCompanyDocumentRequest,
    deleteCompanyDocumentRequest,
    selectCompanyIdData,
    selectCompaniesLoading,
    selectCompaniesError,
    selectIsUploadingLogo,
    selectIsUploadingDocument,
    selectIsDeletingDocument,
    selectUploadError,
    clearCompaniesError,
} from '../../redux/features/company/companySlice';
import { selectUserCompanyId, selectUser } from '../../redux/features/auth/authSlice';
import toast from 'react-hot-toast';
import { ASSETS_BASE_URL } from '../../services/apiConstants';

import {
    industryOptions,
    companySizeOptions,
    packageOptions,
    statusOptions,
    approvalOptions,
    getCompanySizeLabel,
    getPackageName,
    getStatusLabel,
    getApprovalLabel
} from '../../constants/formOptions';

const generateInitials = (companyName) => {
    if (!companyName) return 'C';
    return companyName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
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

const CompanyAvatar = ({ src, companyName, size = 140, ...props }) => {
    const initials = generateInitials(companyName);
    const backgroundColor = generateAvatarColor(companyName);

    const hasValidImage = src &&
        !src.includes('default-company.png') &&
        !src.includes('company-default.svg');

    return (
        <Avatar
            src={hasValidImage ? src : undefined}
            alt={companyName}
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

const CompanySectionCard = ({ title, icon, children, sx }) => (
    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '12px', mb: gridSpacing, ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: gridSpacing - 0.5 }}>
            {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.main', fontSize: '1.4rem' } })}
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{title}</Typography>
        </Box>
        <Divider sx={{ mb: gridSpacing + 0.5 }} />
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
            id={`company-tabpanel-${index}`}
            aria-labelledby={`company-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: gridSpacing }}>{children}</Box>}
        </div>
    );
}

const DocumentCard = ({ document, onDelete, isDeleting, isAdmin }) => (
    <Card sx={{ mb: 2, position: 'relative' }}>
        <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon color="primary" />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {document.documentName || document.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Uploaded: {document.createdAt ? format(parseISO(document.createdAt), 'dd/MM/yyyy') : 'Unknown'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {document.documentUrl && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(`${ASSETS_BASE_URL}${document.documentUrl}`, '_blank')}
                        >
                            View
                        </Button>
                    )}
                    {isAdmin && (
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(document.documentId || document.id)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                        </IconButton>
                    )}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const CoreValueInput = ({ value, onChange, onRemove, placeholder, autoFocus }) => (
    <Card sx={{ mb: 1.5, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
        <CardContent sx={{ py: 1, px:2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Enter core value (e.g., Innovation, Integrity)"}
                    fullWidth
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        style: { fontWeight: 500 }
                    }}
                    inputProps={{ maxLength: 100 }}
                    autoFocus={autoFocus}
                />
                <Tooltip title="Remove this field">
                    <IconButton 
                        size="small" 
                        color="error"
                        onClick={onRemove}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary" >
                {value.length}/100 characters
            </Typography>
        </CardContent>
    </Card>
);

// Main Component
export default function CompanyManagement({ isAdmin = true }) {
    const theme = useTheme();
    const dispatch = useDispatch();

    // Auth selectors
    const loggedInUser = useSelector(selectUser);
    const userCompanyId = useSelector(selectUserCompanyId);

    // Company selectors
    const company = useSelector(selectCompanyIdData);
    const isLoading = useSelector(selectCompaniesLoading);
    const error = useSelector(selectCompaniesError);
    const isUploadingLogo = useSelector(selectIsUploadingLogo);
    const isUploadingDocument = useSelector(selectIsUploadingDocument);
    const isDeletingDocument = useSelector(selectIsDeletingDocument);
    const uploadError = useSelector(selectUploadError);

    // State
    const [companyData, setCompanyData] = useState({});
    const [companyLogo, setCompanyLogo] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [documentName, setDocumentName] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [errors, setErrors] = useState({});

    const [coreValues, setCoreValues] = useState([]); // Saved core values from DB
    const [editingCoreValues, setEditingCoreValues] = useState([]); // Local editing state
    const [newCoreValueInputs, setNewCoreValueInputs] = useState([]); // New input fields

    // Refs
    const logoInputRef = useRef(null);
    const documentInputRef = useRef(null);

    // Effects
    useEffect(() => {
        if (userCompanyId) {
            dispatch(getCompanyByIdRequest(userCompanyId));
        } else {
            console.warn('No company ID available from auth');
        }
    }, [dispatch, userCompanyId]);

    useEffect(() => {
        if (company) {
            setCompanyData({
                companyName: company.companyName || '',
                companyEmail: company.companyEmail || '',
                companyAddress: company.companyAddress || '',
                companyPhone: company.companyPhone || '',
                companyUrl: company.companyUrl || '',
                aboutCompany: company.aboutCompany || '',
                industry: company.industry || '',
                companySize: company.companySize || '',
                isApproved: company.isApproved !== undefined ? company.isApproved : false,
                isActive: company.isActive !== undefined ? company.isActive : true,
                vision: company.vision || '',
                mission: company.mission || '',
                goal: company.goal || '',
                adminUserId: company.adminUserId || '',
                packageId: company.packageId || 1,
            });

            const companyValues = company.coreValues || [];
            setCoreValues(companyValues);
            setEditingCoreValues([...companyValues]); 
            setNewCoreValueInputs([]);

            const logoUrl = company.companyLogoUrl;
            if (logoUrl) {
                setCompanyLogo(logoUrl.startsWith('http') ? logoUrl : `${ASSETS_BASE_URL}${logoUrl}`);
            } else {
                setCompanyLogo(null);
            }
        }
    }, [company]);

    useEffect(() => {
        if (!isLoading && !isUploadingLogo && !isUploadingDocument && !isDeletingDocument && !error && !uploadError) {
        }
    }, [isLoading, isUploadingLogo, isUploadingDocument, isDeletingDocument, error, uploadError]);

    // const handleAddCoreValueInput = () => {
    //     setNewCoreValueInputs(prev => [...prev, '']);
    // };

    const handleAddCoreValueInput = () => {
        const totalCoreValues = editingCoreValues.length + newCoreValueInputs.length;
        if (totalCoreValues >= 7) {
            toast.error('Maximum 7 core values allowed');
            return;
        }
        setNewCoreValueInputs(prev => [...prev, '']);
    };

    const handleNewCoreValueChange = (index, value) => {
        setNewCoreValueInputs(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleRemoveNewCoreValueInput = (index) => {
        setNewCoreValueInputs(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditExistingCoreValue = (index) => {
    };

    const handleEditingCoreValueChange = (index, value) => {
        setEditingCoreValues(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleDeleteExistingCoreValue = (index) => {
        setEditingCoreValues(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const fieldsWithLimit = ['vision', 'mission', 'goal'];

        if (name === 'companyPhone') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            setCompanyData(prev => ({ ...prev, [name]: numericValue }));
        } else if (fieldsWithLimit.includes(name)) {
            if (value.length <= 150) {
                setCompanyData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setCompanyData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLogoChange = (event) => {
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
            formData.append('logoFile', file);

            const previewUrl = URL.createObjectURL(file);
            setCompanyLogo(previewUrl);

            dispatch(uploadCompanyLogoRequest({
                formData,
                companyId: userCompanyId,
            }));
        }
    };

    const handleDocumentUpload = (event) => {
        if (event.target.files && event.target.files[0] && documentName.trim()) {
            const file = event.target.files[0];

            const formData = new FormData();
            formData.append('documentFile', file);
            formData.append('documentName', documentName.trim());

            dispatch(uploadCompanyDocumentRequest({
                formData,
                companyId: userCompanyId,
            }));

            setDocumentName('');
            event.target.value = '';
        }
    };

    const handleDeleteDocument = (documentId) => {
        setDocumentToDelete(documentId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteDocument = () => {
        if (documentToDelete) {
            dispatch(deleteCompanyDocumentRequest({
                companyId: userCompanyId,
                documentId: documentToDelete,
                onSuccess: () => {
                    toast.success('Document deleted successfully');
                    dispatch(getCompanyByIdRequest(userCompanyId));
                },
                onFailure: (error) => {
                    console.error('Failed to delete document:', error);
                    toast.error('Failed to delete document');
                }
            }));
        }
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
    };

    const handleLogoUploadClick = () => {
        logoInputRef.current?.click();
    };

    const handleDocumentUploadClick = () => {
        if (!documentName.trim()) {
            alert('Please enter a document name first');
            return;
        }
        documentInputRef.current?.click();
    };

    const validateForm = () => {
        if (currentTab === 0) {
            const tempErrors = {};
            if (!companyData.companyName || !companyData.companyName.trim()) {
                tempErrors.companyName = 'Company name is required';
            }
            if (!companyData.companyEmail || !companyData.companyEmail.trim()) {
                tempErrors.companyEmail = 'Email is required';
            } else {
                const emailValidation = validateEmailStrict(companyData.companyEmail.trim());
                if (!emailValidation.isValid) {
                    tempErrors.companyEmail = emailValidation.message;
                }
            }
            if (companyData.companyPhone && companyData.companyPhone.toString().trim()) {
                const phoneStr = companyData.companyPhone.toString().trim().replace(/[-\s]/g, '');
                if (!/^\d{10}$/.test(phoneStr)) {
                    tempErrors.companyPhone = 'Phone number must be exactly 10 digits';
                }
            }
            if (companyData.companyUrl && companyData.companyUrl.trim()) {
                if (!/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(companyData.companyUrl.trim())) {
                    tempErrors.companyUrl = 'Please enter a valid website URL (e.g., example.com)';
                }
            }
            setErrors(tempErrors);
            if (Object.keys(tempErrors).length > 0) {
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

        dispatch(clearCompaniesError());

        const finalCoreValues = [
            ...editingCoreValues.filter(value => value.trim() !== ''),
            ...newCoreValueInputs.filter(value => value.trim() !== '')
        ];

        const updatePayload = {
            companyName: companyData.companyName,
            companyEmail: companyData.companyEmail,
            companyAddress: companyData.companyAddress,
            companyPhone: parseInt(companyData.companyPhone) || 0,
            companyUrl: companyData.companyUrl,
            aboutCompany: companyData.aboutCompany,
            industry: companyData.industry,
            companySize: parseInt(companyData.companySize) || 0,
            isApproved: companyData.isApproved,
            isActive: companyData.isActive,
            vision: companyData.vision,
            mission: companyData.mission,
            goal: companyData.goal,
            adminUserId: parseInt(companyData.adminUserId) || 0,
            packageId: companyData.packageId,
            coreValues: finalCoreValues,
        };

        // Remove null/undefined values
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === null || updatePayload[key] === undefined || updatePayload[key] === '') {
                delete updatePayload[key];
            }
        });

        dispatch(updateCompanyRequest({
            companyId: userCompanyId,
            companyData: updatePayload,
        }));
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Sidebar items
    const sidebarItems = useMemo(() => [
        { icon: <EmailOutlinedIcon fontSize="small" />, text: companyData.companyEmail },
        { icon: <PhoneOutlinedIcon fontSize="small" />, text: companyData.companyPhone },
        { icon: <PublicIcon fontSize="small" />, text: companyData.companyUrl },
        { icon: <LocationOnOutlinedIcon fontSize="small" />, text: companyData.companyAddress },
        { icon: <BusinessCenterIcon fontSize="small" />, text: companyData.industry },
        { icon: <BadgeIcon fontSize="small" />, text: getCompanySizeLabel(companyData.companySize) },
    ].filter(item => item.text), [companyData]);

    // Loading state
    if (isLoading && !company) {
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

    // No company ID available
    if (!userCompanyId) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <Alert severity="warning" sx={{ maxWidth: 400 }}>
                    No company information available. Please contact your administrator.
                </Alert>
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
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this document? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteDocument} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={gridSpacing} sx={{ p: gridSpacing }}>
                <Grid item size={{ xs: 12, md: 4, lg: 3 }}>
                    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                            <CompanyAvatar
                                src={companyLogo}
                                companyName={companyData.companyName}
                                size={140}
                            />
                            {isAdmin && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={logoInputRef}
                                        onChange={handleLogoChange}
                                        style={{ display: 'none' }}
                                    />
                                    <Tooltip title="Change Company Logo">
                                        <IconButton
                                            onClick={handleLogoUploadClick}
                                            size="small"
                                            disabled={isUploadingLogo}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 4,
                                                right: 4,
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': { backgroundColor: 'primary.dark' },
                                                boxShadow: theme.shadows[2]
                                            }}
                                        >
                                            {isUploadingLogo ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <PhotoCamera fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {companyData.companyName || 'Company Name'}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 400 }}>
                            {companyData.industry || 'Industry'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Company ID: {userCompanyId || 'N/A'}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                            <Chip
                                label={getStatusLabel(companyData.isActive)}
                                color={companyData.isActive ? 'success' : 'error'}
                                size="small"
                            />
                            <Chip
                                label={getApprovalLabel(companyData.isApproved)}
                                color={companyData.isApproved ? 'primary' : 'warning'}
                                size="small"
                            />
                        </Box>

                        <Divider sx={{ mb: 2, mt: 1 }} />
                        <List dense sx={{ textAlign: 'left', px: 1 }}>
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
                    <Paper variant="outlined" sx={{ borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Tabs
                                value={currentTab}
                                onChange={handleTabChange}
                                aria-label="company management tabs"
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 60, px: 3.5 },
                                    '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3 },
                                    '& .Mui-selected': { color: 'primary.main' }
                                }}
                            >
                                <Tab label="Company Information" id="company-tab-0" aria-controls="company-tabpanel-0" />
                                <Tab label="Document Management" id="company-tab-1" aria-controls="company-tabpanel-1" />
                                {/* {isAdmin && (
                                    <Tab label="Admin Settings" id="company-tab-2" aria-controls="company-tabpanel-2" />
                                )} */}
                            </Tabs>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, overflowY: 'auto', p: gridSpacing }}>
                            {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
                            {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

                            {/* Company Information Tab */}
                            <TabPanel value={currentTab} index={0}>
                                <CompanySectionCard title="Basic Details" icon={<BusinessIcon />}>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <TextField
                                            name="companyName"
                                            label="Company Name *"
                                            value={companyData.companyName || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            error={!!errors.companyName}
                                            helperText={errors.companyName}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <TextField
                                            name="companyEmail"
                                            label="Company Email *"
                                            type="email"
                                            value={companyData.companyEmail || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            error={!!errors.companyEmail}
                                            helperText={errors.companyEmail}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <TextField
                                            name="companyPhone"
                                            label="Phone Number"
                                            type="text"
                                            value={companyData.companyPhone || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            error={!!errors.companyPhone}
                                            helperText={errors.companyPhone}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <TextField
                                            name="companyUrl"
                                            label="Website URL"
                                            value={companyData.companyUrl || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            error={!!errors.companyUrl}
                                            helperText={errors.companyUrl}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Industry</InputLabel>
                                            <Select
                                                name="industry"
                                                value={companyData.industry || ''}
                                                label="Industry"
                                                onChange={handleChange}
                                                disabled={!isAdmin}
                                            >
                                                {industryOptions.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Company Size</InputLabel>
                                            <Select
                                                name="companySize"
                                                value={companyData.companySize || ''}
                                                label="Company Size"
                                                onChange={handleChange}
                                                disabled={!isAdmin}
                                            >
                                                {companySizeOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item size={{ xs: 12 }}>
                                        <TextField
                                            name="companyAddress"
                                            label="Company Address"
                                            value={companyData.companyAddress || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12 }}>
                                        <TextField
                                            name="aboutCompany"
                                            label="About Company"
                                            value={companyData.aboutCompany || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            InputProps={{ readOnly: !isAdmin }}
                                        />
                                    </Grid>
                                </CompanySectionCard>

                                <CompanySectionCard title="Vision & Mission" icon={<BusinessCenterIcon />}>
                                    <Grid item size={{ xs: 12 }}>
                                        <TextField
                                            name="vision"
                                            label="Company Vision"
                                            value={companyData.vision || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            InputProps={{ readOnly: !isAdmin }}
                                            helperText={`${(companyData.vision || '').length}/150 characters`}
                                            inputProps={{ maxLength: 150 }}
                                        />
                                    </Grid>
                                    {/* <Grid item size={{ xs: 12 }}>
                                        <TextField
                                            name="mission"
                                            label="Company Mission"
                                            value={companyData.mission || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            InputProps={{ readOnly: !isAdmin }}
                                            helperText={`${(companyData.mission || '').length}/150 characters`}
                                            inputProps={{ maxLength: 150 }}
                                        />
                                    </Grid> */}
                                    <Grid item size={{ xs: 12 }}>
                                        <TextField
                                            name="goal"
                                            label="Company Focus"
                                            value={companyData.goal || ''}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            InputProps={{ readOnly: !isAdmin }}
                                            helperText={`${(companyData.goal || '').length}/150 characters`}
                                            inputProps={{ maxLength: 150 }}
                                        />
                                    </Grid>
                                </CompanySectionCard>

                                <CompanySectionCard title="Core Values" icon={<FavoriteIcon />}>
                                    <Grid item size={{ xs: 12 }}>
                                        {isAdmin && (() => {
                                            const totalCoreValues = editingCoreValues.length + newCoreValueInputs.length;
                                            const isLimitReached = totalCoreValues >= 7;

                                            return (
                                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" color="text.secondary">
                                                            Define your company's core values that guide your culture and decisions.
                                                        </Typography>
                                                        <Typography variant="caption" color={isLimitReached ? 'error' : 'text.secondary'}>
                                                            {totalCoreValues}/7 core values {isLimitReached && '(Maximum reached)'}
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<AddIcon />}
                                                        onClick={handleAddCoreValueInput}
                                                        disabled={isLimitReached}
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        Add Core Value
                                                    </Button>
                                                </Box>
                                            );
                                        })()}

                                        {editingCoreValues.map((value, index) => (
                                            <CoreValueInput
                                                key={`existing-${index}`}
                                                value={value}
                                                onChange={(newValue) => handleEditingCoreValueChange(index, newValue)}
                                                onRemove={() => handleDeleteExistingCoreValue(index)}
                                                placeholder="Edit core value..."
                                            />
                                        ))}

                                        {newCoreValueInputs.map((value, index) => (
                                            <CoreValueInput
                                                key={`new-${index}`}
                                                value={value}
                                                onChange={(newValue) => handleNewCoreValueChange(index, newValue)}
                                                onRemove={() => handleRemoveNewCoreValueInput(index)}
                                                placeholder="Enter new core value..."
                                                autoFocus={index === newCoreValueInputs.length - 1}
                                            />
                                        ))}

                                        {editingCoreValues.length === 0 && newCoreValueInputs.length === 0 && (
                                            <Box sx={{
                                                textAlign: 'center',
                                                py: 4,
                                                border: '2px dashed',
                                                borderColor: 'divider',
                                                borderRadius: '8px',
                                                bgcolor: 'grey.50'
                                            }}>
                                                <FavoriteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography variant="subtitle1" color="text.secondary">
                                                    No core values defined yet
                                                </Typography>
                                                <Typography variant="body2" color="text.disabled">
                                                    {isAdmin ? 'Click "Add Core Value" to get started (Max 7 values)' : 'Core values will be displayed here once added by admin'}
                                                </Typography>
                                            </Box>
                                        )}

                                        {isAdmin && (editingCoreValues.length > 0 || newCoreValueInputs.length > 0) && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                💡 Make your changes and click "Save Changes" button below to save all core values.
                                            </Typography>
                                        )}
                                    </Grid>
                                </CompanySectionCard>
                            </TabPanel>

                            <TabPanel value={currentTab} index={1}>
                                {isAdmin && (
                                    <CompanySectionCard title="Upload New Document" icon={<CloudUploadIcon />}>
                                        <Grid item size={{ xs: 12, sm: 8 }}>
                                            <TextField
                                                label="Document Name"
                                                value={documentName}
                                                onChange={(e) => setDocumentName(e.target.value)}
                                                fullWidth
                                                placeholder="Enter document name (e.g., License, Certificate)"
                                            />
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 4 }}>
                                            <input
                                                type="file"
                                                ref={documentInputRef}
                                                onChange={handleDocumentUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleDocumentUploadClick}
                                                disabled={!documentName.trim() || isUploadingDocument}
                                                fullWidth
                                                sx={{ height: '56px' }}
                                                startIcon={isUploadingDocument ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                            >
                                                {isUploadingDocument ? 'Uploading...' : 'Upload Document'}
                                            </Button>
                                        </Grid>
                                    </CompanySectionCard>
                                )}

                                <CompanySectionCard title="Company Documents" icon={<DescriptionIcon />}>
                                    <Grid item size={{ xs: 12 }}>
                                        {company?.documents && company.documents.length > 0 ? (
                                            company.documents.map((document, index) => (
                                                <DocumentCard
                                                    key={document.documentId || index}
                                                    document={document}
                                                    onDelete={handleDeleteDocument}
                                                    isDeleting={isDeletingDocument}
                                                    isAdmin={isAdmin}
                                                />
                                            ))
                                        ) : (
                                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                                No documents uploaded yet
                                            </Typography>
                                        )}
                                    </Grid>
                                </CompanySectionCard>
                            </TabPanel>

                            {/* {isAdmin && (
                                <TabPanel value={currentTab} index={2}>
                                    <CompanySectionCard title="Status & Approval" icon={<AdminPanelSettingsIcon />}>
                                        <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    name="isActive"
                                                    value={companyData.isActive !== undefined ? companyData.isActive : true}
                                                    label="Status"
                                                    onChange={handleChange}
                                                >
                                                    {statusOptions.map(option => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Approval Status</InputLabel>
                                                <Select
                                                    name="isApproved"
                                                    value={companyData.isApproved !== undefined ? companyData.isApproved : false}
                                                    label="Approval Status"
                                                    onChange={handleChange}
                                                >
                                                    {approvalOptions.map(option => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Package</InputLabel>
                                                <Select
                                                    name="packageId"
                                                    value={companyData.packageId || 1}
                                                    label="Package"
                                                    onChange={handleChange}
                                                >
                                                    {packageOptions.map(option => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.name} - {option.description}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                name="adminUserId"
                                                label="Admin User ID"
                                                type="number"
                                                value={companyData.adminUserId || ''}
                                                onChange={handleChange}
                                                fullWidth
                                            />
                                        </Grid>
                                    </CompanySectionCard>

                                    <CompanySectionCard title="Company Metadata" icon={<SettingsIcon />}>
                                        <Grid item size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Created At"
                                                value={company?.createdAt ? format(parseISO(company.createdAt), 'PPP') : 'N/A'}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Updated At"
                                                value={company?.updatedAt ? format(parseISO(company.updatedAt), 'PPP') : 'N/A'}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Created By"
                                                value={company?.createdBy || 'System'}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                label="Updated By"
                                                value={company?.updatedBy || 'System'}
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                    </CompanySectionCard>
                                </TabPanel>
                            )} */}

                            {/* Submit Button - Only show if user is admin */}
                            {isAdmin && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: gridSpacing,
                                    p: gridSpacing,
                                    borderTop: 1,
                                    borderColor: 'divider',
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
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
