import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Switch, FormControlLabel,
    Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import { selectUserCompanyId } from '../../redux/features/auth/authSlice';
import {
    fetchPermissionsRequest,
    selectAllPermissions,
    selectPermissionsLoading,
    selectPermissionsError
} from '../../redux/features/permissions/permissionSlice';
import { gridSpacing } from '../../store/constant';

const PERMISSION_ORDER = [
    { key: 'read', label: 'Read' },
    { key: 'create', label: 'Create' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
    { key: 'read:department', label: 'Department' },
    { key: 'read:all', label: 'Read All' },
    {key: 'read:company', label: 'Read Company'}
];

export default function AddRoleDrawer({
    open,
    onClose,
    onSubmitCreate,
    onSubmitUpdate,
    editingRole
}) {
    const dispatch = useDispatch();
    const isEditMode = !!editingRole;

    const companyId = useSelector(selectUserCompanyId);
    const permissionsData = useSelector(selectAllPermissions);
    const permissionsLoading = useSelector(selectPermissionsLoading);
    const permissionsError = useSelector(selectPermissionsError);

    const [roleName, setRoleName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open && (!permissionsData.items || permissionsData.items.length === 0)) {
            dispatch(fetchPermissionsRequest({
                page: 1,
                pageSize: 200,
                sortBy: 'permissionName',
                sortOrder: 'asc'
            }));
        }
    }, [open, dispatch, permissionsData.items]);

    const processedData = useMemo(() => {
        if (!permissionsData.items || permissionsData.items.length === 0) {
            return { modules: [], orderedPermissionTypes: [] };
        }

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
            
            // Hide company:read:all, create, delete
            if (resource.toLowerCase() === 'company') {
                const actionLower = action.toLowerCase();
                if (actionLower === 'read:all' || actionLower === 'create' || actionLower === 'delete') {
                    return;
                }
            }

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

        const modules = Array.from(moduleMap.values()).map(module => ({
            ...module,
            resources: Array.from(module.resources.values()).sort((a, b) =>
                a.resourceName.localeCompare(b.resourceName)
            )
        })).sort((a, b) => a.moduleName.localeCompare(b.moduleName));

        const availablePermissionTypes = Array.from(allPermissionTypesSet);
        const orderedPermissionTypes = PERMISSION_ORDER.filter(permType =>
            availablePermissionTypes.includes(permType.key)
        );

        return { modules, orderedPermissionTypes };
    }, [permissionsData.items]);

    const { modules, orderedPermissionTypes } = processedData;

    const getDrawerTitle = () => {
        return isEditMode ? 'Edit Role' : 'Add New Role';
    };

    const getButtonText = () => {
        return isEditMode ? 'Save Changes' : 'Create Role';
    };

    useEffect(() => {
        if (open) {
            if (isEditMode && editingRole) {
                setRoleName(editingRole.roleName || '');
                setIsActive(editingRole.isActive !== false);

                let permissions = [];
                try {
                    if (editingRole.defaultPermission) {
                        permissions = JSON.parse(editingRole.defaultPermission);
                    } else if (editingRole.permissions) {
                        permissions = editingRole.permissions;
                    }
                } catch (e) {
                    console.error('Error parsing permissions:', e);
                    permissions = [];
                }
                setSelectedPermissions(permissions);
            } else {
                setRoleName('');
                setIsActive(true);
                setSelectedPermissions([]);
            }
            setErrors({});
        }
    }, [open, isEditMode, editingRole]);

    const validateForm = () => {
        const newErrors = {};

        if (!roleName.trim()) {
            newErrors.roleName = 'Role name is required';
        }

        if (selectedPermissions.length === 0) {
            newErrors.permissions = 'At least one permission must be selected';
        }

        if (!companyId) {
            newErrors.companyId = 'Company ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const permissionIds = permissionsData.items
            .filter(p => selectedPermissions.includes(p.permissionName))
            .map(p => p.permissionId);

        const defaultPermission = "string";
        // const defaultPermission = JSON.stringify(selectedPermissions);
        const defaultRoleValue = "false";

        if (isEditMode) {
            const updatedRoleData = {
                id: editingRole.companyRoleId,
                roleName: roleName.trim(),
                isActive,
                defaultRole: defaultRoleValue,
                defaultPermission,
                permissionIds
            };

            if (onSubmitUpdate) {
                onSubmitUpdate(updatedRoleData);
            }
        } else {
            const roleData = {
                companyId: companyId,
                roleName: roleName.trim(),
                isActive,
                defaultRole: defaultRoleValue,
                defaultPermission,
                permissionIds
            };

            if (onSubmitCreate) {
                onSubmitCreate(roleData);
            }
        }
    };

    const hasPermission = (permissionName) => {
        return selectedPermissions.includes(permissionName);
    };

    const togglePermission = (permissionName) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionName)) {
                return prev.filter(p => p !== permissionName);
            } else {
                return [...prev, permissionName];
            }
        });
        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: null }));
        }
    };

    const isResourceFullySelected = (moduleId, resource) => {
        return resource.permissions.every(permission =>
            hasPermission(permission.permissionName)
        );
    };

    const isResourcePartiallySelected = (moduleId, resource) => {
        const selectedCount = resource.permissions.filter(permission =>
            hasPermission(permission.permissionName)
        ).length;
        return selectedCount > 0 && selectedCount < resource.permissions.length;
    };

    const toggleResourcePermissions = (moduleId, resource) => {
        const isFullySelected = isResourceFullySelected(moduleId, resource);

        if (isFullySelected) {
            const resourcePermissions = resource.permissions.map(p => p.permissionName);
            setSelectedPermissions(prev =>
                prev.filter(p => !resourcePermissions.includes(p))
            );
        } else {
            const resourcePermissions = resource.permissions.map(p => p.permissionName);
            setSelectedPermissions(prev => {
                const newPermissions = [...prev];
                resourcePermissions.forEach(permission => {
                    if (!newPermissions.includes(permission)) {
                        newPermissions.push(permission);
                    }
                });
                return newPermissions;
            });
        }

        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: null }));
        }
    };

    const isPermissionTypeFullySelected = (permissionType) => {
        const allPermissionsWithThisType = permissionsData.items?.filter(permission => {
            const pName = permission.permissionName.toLowerCase();
            if (pName === 'company:read:all' || pName === 'company-read-all' ||
                pName === 'company:create' || pName === 'company-create' ||
                pName === 'company:delete' || pName === 'company-delete') return false;
            const parts = permission.permissionName.split(':');
            if (parts.length === 2) {
                return parts[1] === permissionType;
            } else if (parts.length === 3) {
                return parts.slice(1).join(':') === permissionType;
            }
            return false;
        }) || [];

        return allPermissionsWithThisType.length > 0 && allPermissionsWithThisType.every(permission =>
            hasPermission(permission.permissionName)
        );
    };

    const togglePermissionTypeForAll = (permissionType) => {
        const allPermissionsWithThisType = permissionsData.items?.filter(permission => {
            const pName = permission.permissionName.toLowerCase();
            if (pName === 'company:read:all' || pName === 'company-read-all' ||
                pName === 'company:create' || pName === 'company-create' ||
                pName === 'company:delete' || pName === 'company-delete') return false;
            const parts = permission.permissionName.split(':');
            if (parts.length === 2) {
                return parts[1] === permissionType;
            } else if (parts.length === 3) {
                return parts.slice(1).join(':') === permissionType;
            }
            return false;
        }) || [];

        const allHaveThisPermission = allPermissionsWithThisType.every(permission =>
            hasPermission(permission.permissionName)
        );

        if (allHaveThisPermission) {
            const permissionsToRemove = allPermissionsWithThisType.map(permission =>
                permission.permissionName
            );
            setSelectedPermissions(prev =>
                prev.filter(p => !permissionsToRemove.includes(p))
            );
        } else {
            const permissionsToAdd = allPermissionsWithThisType.map(permission =>
                permission.permissionName
            );
            setSelectedPermissions(prev => {
                const newPermissions = [...prev];
                permissionsToAdd.forEach(permission => {
                    if (!newPermissions.includes(permission)) {
                        newPermissions.push(permission);
                    }
                });
                return newPermissions;
            });
        }

        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: null }));
        }
    };

    const resourceHasPermissionType = (resource, permissionType) => {
        return resource.permissions.some(permission => permission.action === permissionType);
    };

    const resourceHasPermissionTypeSelected = (resource, permissionType) => {
        const permission = resource.permissions.find(p => p.action === permissionType);
        return permission ? hasPermission(permission.permissionName) : false;
    };

    const handleClose = () => {
        setRoleName('');
        setIsActive(true);
        setSelectedPermissions([]);
        setErrors({});
        onClose();
    };

    if (permissionsLoading && modules.length === 0) {
        return (
            <Drawer anchor="right" open={open} onClose={handleClose}>
                <Box sx={{
                    width: { xs: '100%', sm: 800, md: 900 },
                    p: gridSpacing,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading permissions...</Typography>
                </Box>
            </Drawer>
        );
    }

    if (permissionsError) {
        return (
            <Drawer anchor="right" open={open} onClose={handleClose}>
                <Box sx={{
                    width: { xs: '100%', sm: 800, md: 900 },
                    p: gridSpacing,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                }}>
                    <Typography color="error" variant="h6">
                        Error loading permissions
                    </Typography>
                    <Typography color="error" sx={{ mt: 1 }}>
                        {permissionsError}
                    </Typography>
                    <Button onClick={handleClose} sx={{ mt: 2 }}>
                        Close
                    </Button>
                </Box>
            </Drawer>
        );
    }

    return (
        <Drawer anchor="right" open={open} onClose={handleClose}>
            <Box sx={{
                width: { xs: '100%', sm: 700, md: 1000 },
                p: gridSpacing,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflowY: 'auto',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon color="primary" />
                        <Typography variant="h5" component="h2">
                            {getDrawerTitle()}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    pr: 1,
                    pt: 1
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" color="primary">
                            Basic Information
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Role Name"
                                value={roleName}
                                onChange={(e) => {
                                    setRoleName(e.target.value);
                                    if (errors.roleName) {
                                        setErrors(prev => ({ ...prev, roleName: null }));
                                    }
                                }}
                                required
                                fullWidth
                                error={!!errors.roleName}
                                helperText={errors.roleName}
                                placeholder="e.g., Project Manager, Developer, Viewer"
                                sx={{ flex: 1 }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Active"
                            />
                        </Box>

                        {!companyId && (
                            <Typography color="error" variant="body2">
                                Company ID not found. Please ensure you are logged in.
                            </Typography>
                        )}

                        {errors.companyId && (
                            <Typography color="error" variant="body2">
                                {errors.companyId}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" color="primary">
                                Module Permissions
                            </Typography>
                            <Chip
                                label={`${selectedPermissions.length} permissions selected`}
                                color={selectedPermissions.length > 0 ? "primary" : "default"}
                                size="small"
                            />
                        </Box>

                        {errors.permissions && (
                            <Typography color="error" variant="body2">
                                {errors.permissions}
                            </Typography>
                        )}

                        {modules.length > 0 ? (
                            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: 600 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>
                                                    Module / Resource
                                                </TableCell>
                                                {orderedPermissionTypes.map((permissionType) => (
                                                    <TableCell
                                                        key={permissionType.key}
                                                        align="center"
                                                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                            <Typography variant="caption">
                                                                {permissionType.label}
                                                            </Typography>
                                                            <Checkbox
                                                                size="small"
                                                                checked={isPermissionTypeFullySelected(permissionType.key)}
                                                                onChange={() => togglePermissionTypeForAll(permissionType.key)}
                                                                sx={{ p: 0 }}
                                                                title={`Select/Deselect all ${permissionType.label} permissions`}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                ))}
                                                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                                                    All
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {modules.map((module) => (
                                                <React.Fragment key={module.moduleId}>
                                                    {/* Module Header */}
                                                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                        <TableCell colSpan={orderedPermissionTypes.length + 2} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                            <Typography variant="subtitle2" color="primary">
                                                                {module.moduleName}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                    {/* Resources */}
                                                    {module.resources.map((resource) => (
                                                        <TableRow key={`${module.moduleId}-${resource.resourceName}`} hover>
                                                            <TableCell sx={{ fontWeight: 500, pl: 4 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                                        {resource.resourceName.replace('-', ' ')}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={`${resource.permissions.filter(p => hasPermission(p.permissionName)).length}/${resource.permissions.length}`}
                                                                        size="small"
                                                                        color={
                                                                            isResourceFullySelected(module.moduleId, resource) ? 'success' :
                                                                                isResourcePartiallySelected(module.moduleId, resource) ? 'warning' : 'default'
                                                                        }
                                                                        sx={{ fontSize: '0.7rem', height: 18 }}
                                                                    />
                                                                </Box>
                                                            </TableCell>
                                                            {orderedPermissionTypes.map((permissionType) => (
                                                                <TableCell key={permissionType.key} align="center">
                                                                    {resourceHasPermissionType(resource, permissionType.key) ? (
                                                                        <Checkbox
                                                                            size="small"
                                                                            checked={resourceHasPermissionTypeSelected(resource, permissionType.key)}
                                                                            disabled={permissionType.key === 'read:department' && resourceHasPermissionTypeSelected(resource, 'read:all')}
                                                                            onChange={() => {
                                                                                const permission = resource.permissions.find(p => p.action === permissionType.key);
                                                                                if (permission) {
                                                                                    togglePermission(permission.permissionName);
                                                                                }
                                                                            }}
                                                                            sx={{ p: 0.5 }}
                                                                            title={`${resource.resourceName}:${permissionType.key}`}
                                                                        />
                                                                    ) : (
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                                            <Typography variant="body2" color="text.disabled">
                                                                                -
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                            <TableCell align="center">
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={isResourceFullySelected(module.moduleId, resource)}
                                                                    indeterminate={isResourcePartiallySelected(module.moduleId, resource)}
                                                                    onChange={() => toggleResourcePermissions(module.moduleId, resource)}
                                                                    sx={{ p: 0.5 }}
                                                                    title={`Select/Deselect all ${resource.resourceName} permissions`}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No permissions available
                            </Typography>
                        )}
                    </Box>
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
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!companyId || permissionsLoading}
                    >
                        {getButtonText()}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
