import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, 
    Button, IconButton, Divider, Chip, Paper, Grid, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, parseISO, isValid } from 'date-fns';
import Can from '../../../uiComponent/Can';
import { 
    selectAllPermissions,
    selectPermissionsLoading 
} from '../../../redux/features/permissions/permissionSlice';

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

const getAvatarLetters = (name) => {
    if (!name) return '';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

const PERMISSION_ORDER = [
    'read',
    'create',
    'update',
    'delete',
    'read:department',
    'read:all',
    'read:company'
];

export default function RoleDetailModal({ 
    open, 
    onClose, 
    role,
    onUpdateRole
}) {
    const [localIsActive, setLocalIsActive] = useState(true);
    
    // Get permissions from Redux store
    const permissionsData = useSelector(selectAllPermissions);
    const permissionsLoading = useSelector(selectPermissionsLoading);

    // Parse role permissions
    const rolePermissions = useMemo(() => {
        if (!role) return [];
        
        try {
            if (role.defaultPermission) {
                return JSON.parse(role.defaultPermission);
            } else if (role.permissions) {
                return Array.isArray(role.permissions) ? role.permissions : [];
            }
        } catch (e) {
            console.error('Error parsing role permissions:', e);
        }
        return [];
    }, [role]);

    // Process permissions data from API to create modules and permission types
    const processedPermissionsData = useMemo(() => {
        if (!permissionsData.items || permissionsData.items.length === 0) {
            return { modules: [], allPermissionTypes: [] };
        }

        // Group by module first
        const moduleMap = new Map();
        const allPermissionTypesSet = new Set();
        
        permissionsData.items.forEach(permission => {
            const { permissionId, permissionName, moduleId, moduleName } = permission;
            
            let resource, action;
            if (permissionName.includes(':')) {
                const parts = permissionName.split(':');
                resource = parts[0];
                action = parts.slice(1).join(':');
            } else {
                const parts = permissionName.split('-');
                resource = parts[0];
                action = parts.slice(1).join('-');
            }

            if (!resource || !action) return;
            allPermissionTypesSet.add(action);
            
            if (!moduleMap.has(moduleId)) {
                moduleMap.set(moduleId, {
                    moduleId,
                    moduleName,
                    resources: new Map()
                });
            }
            
            const module = moduleMap.get(moduleId);
            
            if (!module.resources.has(resource)) {
                module.resources.set(resource, {
                    resourceName: resource,
                    permissions: []
                });
            }
            
            module.resources.get(resource).permissions.push({
                permissionId,
                permissionName,
                action,
                resource
            });
        });

        // Convert to array format
        const modules = Array.from(moduleMap.values()).map(module => ({
            ...module,
            resources: Array.from(module.resources.values()).sort((a, b) => 
                a.resourceName.localeCompare(b.resourceName)
            )
        })).sort((a, b) => a.moduleName.localeCompare(b.moduleName));

        const allPermissionTypes = Array.from(allPermissionTypesSet).sort((a, b) => {
            const indexA = PERMISSION_ORDER.indexOf(a);
            const indexB = PERMISSION_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        return { modules, allPermissionTypes };
    }, [permissionsData.items]);

    const { modules, allPermissionTypes } = processedPermissionsData;

    useEffect(() => {
        if (role) {
            setLocalIsActive(role.isActive !== false);
        }
    }, [role]);

    const handleStatusToggle = () => {
        if (role.defaultRole === "true" || role.defaultRole === true) {
            return;
        }
        
        const newStatus = !localIsActive;
        setLocalIsActive(newStatus);
        
        if (onUpdateRole) {
            const updatedRoleData = {
                id: role.companyRoleId,
                companyRoleId: role.companyRoleId,
                roleName: role.roleName,
                isActive: newStatus,
                defaultPermission: JSON.stringify(rolePermissions),
                defaultRole: false,
                permissions: rolePermissions
            };
            onUpdateRole(updatedRoleData);
        }
    };

    const handleEdit = () => {
        // This should trigger the edit mode in the parent component
        // You might want to pass a callback or use a different approach
        onClose();
        // If you have an onEdit callback, call it here
        // onEdit?.(role);
    };

    // Check if a specific permission is granted
    const hasPermission = (permissionName) => {
        return rolePermissions.includes(permissionName);
    };

    // Get resource statistics
    const getResourceStats = (resource) => {
        const grantedCount = resource.permissions.filter(permission => 
            hasPermission(permission.permissionName)
        ).length;
        return { granted: grantedCount, total: resource.permissions.length };
    };

    // Get module statistics
    const getModuleStats = (module) => {
        let totalPermissions = 0;
        let grantedPermissions = 0;
        
        module.resources.forEach(resource => {
            totalPermissions += resource.permissions.length;
            grantedPermissions += resource.permissions.filter(permission => 
                hasPermission(permission.permissionName)
            ).length;
        });
        
        return { granted: grantedPermissions, total: totalPermissions };
    };

    if (!role) return null;

    const isDefaultRole = role.defaultRole === "true" || role.defaultRole === true;
    const totalPermissions = rolePermissions.length;
    
    // Calculate max possible permissions from actual API data
    const maxPossiblePermissions = modules.reduce((sum, module) => {
        return sum + module.resources.reduce((moduleSum, resource) => {
            return moduleSum + resource.permissions.length;
        }, 0);
    }, 0);

    // Show loading state if permissions are still loading
    if (permissionsLoading && modules.length === 0) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading role details...</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: { minHeight: '80vh', maxHeight: '90vh' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SecurityIcon 
                            color={isDefaultRole ? 'primary' : 'secondary'} 
                            sx={{ fontSize: 28 }}
                        />
                        <Box>
                            <Typography variant="h5" component="div" fontWeight={600}>
                                {role.roleName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={isDefaultRole ? 'Default Role' : 'Custom Role'}
                                    size="small"
                                    color={isDefaultRole ? 'primary' : 'secondary'}
                                    variant="outlined"
                                />
                                <Chip
                                    label={localIsActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={localIsActive ? 'success' : 'error'}
                                />
                                <Chip
                                    label={`${totalPermissions}${maxPossiblePermissions > 0 ? `/${maxPossiblePermissions}` : ''} Permissions`}
                                    size="small"
                                    color="info"
                                />
                            </Box>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* {!isDefaultRole && (
                            <FormControlLabel
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
                            />
                        )} */}
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pb: 2 }}>
                <Grid container spacing={3}>
                    {/* Role Information */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: 'fit-content' }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Role Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SecurityIcon color="action" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Role ID
                                        </Typography>
                                        <Typography variant="body1">
                                            #{role.companyRoleId}
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
                                            {formatDate(role.createdAt)}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                {role.createdByName && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Created By
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                                    {getAvatarLetters(role.createdByName)}
                                                </Avatar>
                                                <Typography variant="body1">
                                                    {role.createdByName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                                
                                {role.updatedAt && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon color="action" />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Last Updated
                                            </Typography>
                                            <Typography variant="body1">
                                                {formatDate(role.updatedAt)}
                                            </Typography>
                                            {role.updatedByName && (
                                                <Typography variant="body2" color="text.secondary">
                                                    by {role.updatedByName}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                    
                    {/* Permissions Table */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Module Permissions
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {rolePermissions.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CancelIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        No permissions assigned to this role
                                    </Typography>
                                </Box>
                            ) : modules.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Permission details not available
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>
                                                    Module / Resource
                                                </TableCell>
                                                {allPermissionTypes.map((permissionType) => (
                                                    <TableCell 
                                                        key={permissionType} 
                                                        align="center" 
                                                        sx={{ fontWeight: 'bold', minWidth: 70 }}
                                                    >
                                                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                                            {permissionType.replace(':', ' ').replace('-', ' ')}
                                                        </Typography>
                                                    </TableCell>
                                                ))}
                                                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                                                    Coverage
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {modules.map((module) => {
                                                const moduleStats = getModuleStats(module);
                                                const hasAnyModulePermission = moduleStats.granted > 0;
                                                
                                                if (!hasAnyModulePermission) return null;
                                                
                                                return (
                                                    <React.Fragment key={module.moduleId}>
                                                        {/* Module Header */}
                                                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                            <TableCell colSpan={allPermissionTypes.length + 2} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="subtitle2" color="primary">
                                                                        {module.moduleName}
                                                                    </Typography>
                                                                    <Chip 
                                                                        label={`${moduleStats.granted}/${moduleStats.total}`}
                                                                        size="small"
                                                                        color={
                                                                            moduleStats.granted === moduleStats.total ? 'success' : 
                                                                            moduleStats.granted > 0 ? 'warning' : 'default'
                                                                        }
                                                                        sx={{ fontSize: '0.7rem', height: 18 }}
                                                                    />
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                        {/* Resources */}
                                                        {module.resources.map((resource) => {
                                                            const resourceStats = getResourceStats(resource);
                                                            const hasAnyResourcePermission = resourceStats.granted > 0;
                                                            
                                                            if (!hasAnyResourcePermission) return null;
                                                            
                                                            return (
                                                                <TableRow key={`${module.moduleId}-${resource.resourceName}`} hover>
                                                                    <TableCell sx={{ fontWeight: 500, pl: 4 }}>
                                                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                                            {resource.resourceName.replace('-', ' ')}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    {allPermissionTypes.map((permissionType) => {
                                                                        const permission = resource.permissions.find(p => p.action === permissionType);
                                                                        return (
                                                                            <TableCell key={permissionType} align="center">
                                                                                {permission ? (
                                                                                    hasPermission(permission.permissionName) ? (
                                                                                        <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                                                                                    ) : (
                                                                                        <CancelIcon color="disabled" sx={{ fontSize: 18 }} />
                                                                                    )
                                                                                ) : (
                                                                                    <Typography variant="body2" color="text.disabled">
                                                                                        -
                                                                                    </Typography>
                                                                                )}
                                                                            </TableCell>
                                                                        );
                                                                    })}
                                                                    <TableCell align="center">
                                                                        <Chip 
                                                                            label={`${resourceStats.granted}/${resourceStats.total}`}
                                                                            size="small"
                                                                            color={
                                                                                resourceStats.granted === resourceStats.total ? 'success' : 
                                                                                resourceStats.granted > 0 ? 'warning' : 'default'
                                                                            }
                                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
                
                {/* {!isDefaultRole && (
                    <Can perform="role:update">
                        <Button 
                            onClick={handleEdit}
                            variant="contained"
                            startIcon={<EditIcon />}
                        >
                            Edit Role
                        </Button>
                    </Can>
                )} */}
            </DialogActions>
        </Dialog>
    );
}
