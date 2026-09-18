import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, 
    Button, IconButton, Divider, Chip, Paper, Grid, Avatar,
    List, ListItem, ListItemIcon, ListItemText, Switch, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    LinearProgress, Card, CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PackageIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExtensionIcon from '@mui/icons-material/Extension';

import { format, parseISO, isValid } from 'date-fns';
// import Can from '../../uiComponent/Can';

const formatDate = (dateStr) => {
    try {
        if (!dateStr) return 'Not available';
        const date = parseISO(dateStr);
        if (!isValid(date)) return 'Not available';
        return format(date, 'MMM dd, yyyy HH:mm');
    } catch (e) {
        return 'Not available';
    }
};

const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
};

const formatLimit = (value, unit) => {
    if (value === null || value === undefined) return 'Unlimited';
    if (unit === 'MB') {
        if (value >= 1024) {
            return `${(value / 1024).toFixed(1)} GB`;
        }
        return `${value} MB`;
    }
    return `${value} ${unit}`;
};

const getAvatarLetters = (name) => {
    if (!name) return '';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

const getPriceChipStyle = (price) => {
    if (price === 0) {
        return {
            backgroundColor: 'success.lighter',
            color: 'success.dark',
            border: '1px solid',
            borderColor: 'success.main',
        };
    } else if (price <= 50) {
        return {
            backgroundColor: 'info.lighter',
            color: 'info.dark',
            border: '1px solid',
            borderColor: 'info.main',
        };
    } else if (price <= 100) {
        return {
            backgroundColor: 'warning.lighter',
            color: 'warning.dark',
            border: '1px solid',
            borderColor: 'warning.main',
        };
    } else {
        return {
            backgroundColor: 'error.lighter',
            color: 'error.dark',
            border: '1px solid',
            borderColor: 'error.main',
        };
    }
};

export default function PackageDetailModal({ 
    open, 
    onClose, 
    package: pkg,
    onUpdatePackage
}) {
    const [localIsActive, setLocalIsActive] = useState(true);

    // Group modules by category
    const modulesByCategory = useMemo(() => {
        if (!pkg?.modules) return [];
        
        const categories = {};
        pkg.modules.forEach(module => {
            const category = module.category || 'Other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(module);
        });
        
        return Object.entries(categories).map(([category, modules]) => ({
            category,
            modules,
            includedCount: modules.filter(m => m.isIncluded).length,
            totalCount: modules.length
        }));
    }, [pkg?.modules]);

    const includedModules = useMemo(() => {
        return pkg?.modules?.filter(m => m.isIncluded) || [];
    }, [pkg?.modules]);

    const totalModules = pkg?.modules?.length || 0;
    const includedModulesCount = includedModules.length;

    useEffect(() => {
        if (pkg) {
            setLocalIsActive(pkg.isActive !== false);
        }
    }, [pkg]);

    const handleStatusToggle = () => {
        const newStatus = !localIsActive;
        setLocalIsActive(newStatus);
        
        if (onUpdatePackage) {
            onUpdatePackage({
                ...pkg,
                isActive: newStatus
            });
        }
    };

    const handleEdit = () => {
        onClose();
        // Edit functionality would be handled by parent component
    };

    if (!pkg) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            // fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PackageIcon 
                            color="primary" 
                            sx={{ fontSize: 32 }}
                        />
                        <Box>
                            <Typography variant="h5" component="div" fontWeight={600}>
                                {pkg.packageName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={formatPrice(pkg.price)}
                                    size="small"
                                    sx={getPriceChipStyle(pkg.price)}
                                />
                                <Chip
                                    label={pkg.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={pkg.isActive ? 'success' : 'error'}
                                />
                                <Chip
                                    label={`${includedModulesCount}/${totalModules} Modules`}
                                    size="small"
                                    color="info"
                                />
                            </Box>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* <FormControlLabel
                            control={
                                <Switch
                                    checked={localIsActive}
                                    onChange={handleStatusToggle}
                                    color="success"
                                    size="small"
                                />
                            }
                            label="Active"
                            labelPlacement="start"
                        /> */}
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pb: 2 }}>
                <Grid container spacing={3}>
                    {/* Package Overview */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 'fit-content' }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Package Overview
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1">
                                        {pkg.description}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachMoneyIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Price
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            {formatPrice(pkg.price)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ExtensionIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Module Coverage
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(includedModulesCount / totalModules) * 100} 
                                                sx={{ width: 100, height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2">
                                                {includedModulesCount}/{totalModules}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Package Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Package Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PackageIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Package ID
                                        </Typography>
                                        <Typography variant="body1">
                                            #{pkg.packageId}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarTodayIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Created Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(pkg.createdAt)}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                {pkg.createdByName && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Created By
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                                    {getAvatarLetters(pkg.createdByName)}
                                                </Avatar>
                                                <Typography variant="body1">
                                                    {pkg.createdByName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                                
                                {pkg.updatedAt && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Last Updated
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(pkg.updatedAt)}
                                            </Typography>
                                            {pkg.updatedByName && (
                                                <Typography variant="body2" color="text.secondary">
                                                    by {pkg.updatedByName}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                    
                    {/* Detailed Module List */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Detailed Module Access
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {modulesByCategory.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CancelIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        No modules configured for this package
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {modulesByCategory.map(({ category, modules }) => (
                                        <Card key={category} variant="outlined">
                                            <CardContent sx={{ pb: '16px !important' }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    mb: 2
                                                }}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {category} Modules
                                                    </Typography>
                                                    <Chip
                                                        label={`${modules.filter(m => m.isIncluded).length}/${modules.length} included`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                                
                                                <List dense>
                                                    {modules.map((module) => (
                                                        <ListItem key={module.moduleId}>
                                                            <ListItemIcon>
                                                                {module.isIncluded ? (
                                                                    <CheckCircleIcon color="success" />
                                                                ) : (
                                                                    <CancelIcon color="disabled" />
                                                                )}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography variant="subtitle2">
                                                                            {module.moduleName}
                                                                        </Typography>
                                                                        {module.isCore && (
                                                                            <Chip 
                                                                                label="Core" 
                                                                                size="small" 
                                                                                color="primary" 
                                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                }
                                                                secondary={module.description}
                                                                sx={{
                                                                    opacity: module.isIncluded ? 1 : 0.6,
                                                                    textDecoration: module.isIncluded ? 'none' : 'line-through'
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
                
                {/* <Can perform="package:update"> */}
                    {/* <Button 
                        onClick={handleEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                    >
                        Edit Package
                    </Button> */}
                {/* </Can> */}
            </DialogActions>
        </Dialog>
    );
}
