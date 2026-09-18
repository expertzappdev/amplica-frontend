import React, { useState, useEffect, useMemo } from 'react';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider,
    Switch, FormControlLabel, Chip, Paper, FormControl, InputLabel, 
    OutlinedInput, InputAdornment, Card, CardContent, CardHeader,
    Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PackageIcon from '@mui/icons-material/Inventory';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { gridSpacing } from '../../store/constant';
import { selectUser } from '../../redux/features/auth/authSlice';
import { useSelector } from 'react-redux';

// Default icons for modules (since API doesn't provide them)
const getModuleIcon = (moduleName) => {
    const iconMap = {
        'Common Module': '🔧',
        'Project Module': '📁',
        'Tasks': '✓',
        'Time Tracking': '⏰',
        'Reports': '📊',
        'User Management': '👥',
        'Advanced Analytics': '📈',
        'API Access': '🔗',
        'Custom Integrations': '🔌',
        'Priority Support': '🎧',
        'White Label': '🎨'
    };
    return iconMap[moduleName] || '⚙️';
};

export default function AddPackageDrawer({ 
    open, 
    onClose, 
    onSubmitCreate,
    onSubmitUpdate,
    editingPackage,
    availableModules = []
}) {
    const isEditMode = !!editingPackage;

    // Form state
    const [packageName, setPackageName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [trialDays, setTrialDays] = useState('15');
    const [isActive, setIsActive] = useState(true);
    const [selectedModules, setSelectedModules] = useState([]);
    const [errors, setErrors] = useState({});

    const currentUser = useSelector(selectUser);

    // Transform available modules to include display properties
    const transformedModules = useMemo(() => 
        availableModules.map(module => ({
            ...module,
            icon: getModuleIcon(module.moduleName),
            isCore: module.moduleId === 0, // Common Module is typically core
        })), 
        [availableModules]
    );

    const coreModuleIds = useMemo(
        () => transformedModules.filter(m => m.isCore).map(m => m.moduleId), 
        [transformedModules]
    );

    // Form title/button
    const getDrawerTitle = () => isEditMode ? 'Edit Package' : 'Add New Package';
    const getButtonText = () => isEditMode ? 'Save Changes' : 'Create Package';

    // Reset form when drawer opens/closes
    useEffect(() => {
        if (open) {
            if (isEditMode && editingPackage) {
                setPackageName(editingPackage.packageName || '');
                setDescription(editingPackage.description || '');
                setPrice(editingPackage.price?.toString() || '');
                setTrialDays('7'); // Default since API doesn't return this
                setIsActive(editingPackage.isActive !== false);
                // Get selected modules from editing package
                const included = (editingPackage.modules || [])
                    .filter(m => m.isIncluded)
                    .map(m => m.moduleId);
                setSelectedModules(included);
            } else {
                // Reset for new package
                setPackageName('');
                setDescription('');
                setPrice('');
                setTrialDays('7');
                setIsActive(true);
                // Pre-select core modules for new packages
                setSelectedModules(coreModuleIds);
            }
            setErrors({});
        }
    }, [open, isEditMode, editingPackage, coreModuleIds]);

    const validateForm = () => {
        const newErrors = {};
        if (!packageName.trim()) newErrors.packageName = 'Package name is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (price === '' || isNaN(price) || Number(price) < 0) newErrors.price = 'Valid price is required';
        if (trialDays === '' || isNaN(trialDays) || Number(trialDays) < 0) newErrors.trialDays = 'Valid trial days required';
        if (selectedModules.length === 0) newErrors.modules = 'At least one module must be selected';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Main submit handler: prepares body with `moduleIds` as required by API
    const handleSubmit = () => {
        if (!validateForm()) return;
        
        const baseBody = {
            packageName: packageName.trim(),
            description: description.trim(),
            price: parseFloat(price),
            isActive,
            trialDays: parseInt(trialDays),
            moduleIds: selectedModules
        };

        if (isEditMode) {
            const updateBody = {
                ...baseBody,
                updatedBy: currentUser.id,
            };
            onSubmitUpdate && onSubmitUpdate({
                packageId: editingPackage.packageId || editingPackage.id,
                packageData: updateBody
            });
        } else {
            const createBody = {
                ...baseBody,
                createdBy: currentUser.id,
            };
            onSubmitCreate && onSubmitCreate(createBody);
        }
    };

    // Module selection handlers
    const isModuleSelected = (moduleId) => selectedModules.includes(moduleId);
    
    const toggleModule = (moduleId, isCore = false) => {
        if (isCore) return; // Prevent toggling core modules
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSelectAll = () => {
        setSelectedModules(transformedModules.map(m => m.moduleId));
    };

    const handleSelectNone = () => {
        setSelectedModules(coreModuleIds);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ 
                width: { xs: '100%', sm: 600, md: 700 }, 
                p: gridSpacing, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
            }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PackageIcon color="primary" />
                        <Typography variant="h5" component="h2">{getDrawerTitle()}</Typography>
                    </Box>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Form Content */}
                <Box sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3, 
                    pr: 1, 
                    pt: 1 
                }}>
                    {/* Basic Information */}
                    <Card variant="outlined">
                        <CardHeader 
                            title="Basic Information" 
                            titleTypographyProps={{ variant: 'h6', color: 'primary' }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField 
                                    label="Package Name" 
                                    value={packageName} 
                                    onChange={e => setPackageName(e.target.value)} 
                                    required 
                                    fullWidth
                                    error={!!errors.packageName} 
                                    helperText={errors.packageName}
                                    placeholder="e.g., Professional Package, Enterprise Solution"
                                />
                                
                                <TextField 
                                    label="Description" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)}
                                    required 
                                    fullWidth 
                                    multiline 
                                    rows={2}
                                    error={!!errors.description} 
                                    helperText={errors.description}
                                    placeholder="Describe what this package offers..."
                                />
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControl fullWidth error={!!errors.price}>
                                        <InputLabel htmlFor="price-input">Price *</InputLabel>
                                        <OutlinedInput
                                            id="price-input"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                            label="Price *"
                                            type="number"
                                            inputProps={{ min: 0, step: 0.01 }}
                                        />
                                        {errors.price && (
                                            <Typography variant="caption" color="error">
                                                {errors.price}
                                            </Typography>
                                        )}
                                    </FormControl>
                                    
                                    <TextField
                                        label="Trial Days"
                                        value={trialDays}
                                        onChange={e => setTrialDays(e.target.value)}
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        error={!!errors.trialDays}
                                        helperText={errors.trialDays}
                                        sx={{ minWidth: 120 }}
                                    />
                                </Box>
                                
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={isActive} 
                                            onChange={e => setIsActive(e.target.checked)} 
                                            color="success" 
                                        />
                                    }
                                    label="Active Package"
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Modules Selection */}
                    <Card variant="outlined">
                        <CardHeader 
                            title={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" color="primary">Module Access</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip 
                                            label={`${selectedModules.length}/${transformedModules.length} selected`} 
                                            color="primary" 
                                            size="small"
                                        />
                                        <Button size="small" onClick={handleSelectAll}>All</Button>
                                        <Button size="small" onClick={handleSelectNone}>Core Only</Button>
                                    </Box>
                                </Box>
                            }
                        />
                        <CardContent sx={{ pt: 0 }}>
                            {errors.modules && (
                                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                    {errors.modules}
                                </Typography>
                            )}
                            
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                gap: 1.5 
                            }}>
                                {transformedModules.map(module => (
                                    <Paper
                                        key={module.moduleId}
                                        sx={{
                                            p: 1.5,
                                            cursor: module.isCore ? 'not-allowed' : 'pointer',
                                            border: '1px solid',
                                            borderColor: isModuleSelected(module.moduleId) 
                                                ? 'primary.main' 
                                                : 'divider',
                                            backgroundColor: isModuleSelected(module.moduleId)
                                                ? 'primary.50'
                                                : module.isCore
                                                ? 'grey.50'
                                                : 'background.paper',
                                            opacity: module.isCore ? 0.9 : 1,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: module.isCore ? 'divider' : 'primary.main',
                                                backgroundColor: module.isCore 
                                                    ? 'grey.50' 
                                                    : 'primary.50',
                                                transform: module.isCore ? 'none' : 'translateY(-1px)'
                                            }
                                        }}
                                        onClick={() => toggleModule(module.moduleId, module.isCore)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: '1.2rem', minWidth: '24px' }}>
                                                {module.icon}
                                            </Typography>
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        fontWeight={600} 
                                                        sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            flexGrow: 1
                                                        }}
                                                    >
                                                        {module.moduleName}
                                                    </Typography>
                                                    {module.isCore && (
                                                        <Chip 
                                                            label="Core" 
                                                            size="small" 
                                                            color="primary" 
                                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        lineHeight: 1.2
                                                    }}
                                                >
                                                    {module.description}
                                                </Typography>
                                            </Box>
                                            <Checkbox
                                                checked={isModuleSelected(module.moduleId)}
                                                onChange={() => toggleModule(module.moduleId, module.isCore)}
                                                disabled={module.isCore}
                                                color="primary"
                                                size="small"
                                                icon={<CheckBoxOutlineBlankIcon />}
                                                checkedIcon={<CheckBoxIcon />}
                                            />
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                
                {/* Footer Actions */}
                <Box sx={{ 
                    mt: 'auto', 
                    pt: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1, 
                    borderTop: '1px solid', 
                    borderColor: 'divider' 
                }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {getButtonText()}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
