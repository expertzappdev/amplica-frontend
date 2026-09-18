import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import ViewHeader from '../../uiComponent/viewheader';
import RolesTable from './RolesTable';
import AddRoleDrawer from '../../components/addRole/AddRoleDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import RoleDetailModal from './roleDetail/RoleDetailModal';
import { gridSpacing } from '../../store/constant';
import toast from 'react-hot-toast';
import { useCan } from '../../hooks/useCan';

import {
  fetchRolesRequest,
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest,
  getRoleByIdRequest,
  clearEditingRoleState,
  selectAllRoles,
  selectRolesLoading,
  selectRolesError,
  selectRoleData,
  clearRolesError,
  selectRolesQuery,
  setRolesQuery,
} from '../../redux/features/role/roleSlice';

import { selectIsAuthenticated, selectUserCompanyId } from '../../redux/features/auth/authSlice';

import {
  fetchPermissionsRequest,
  selectAllPermissions,
} from '../../redux/features/permissions/permissionSlice';

export default function RolesView() {
  const dispatch = useDispatch();
  const { can } = useCan();

  const reduxRoleItems = useSelector(selectAllRoles) || { items: [], totalCount: 0 };
  const rolesLoading = useSelector(selectRolesLoading);
  const roleError = useSelector(selectRolesError);
  const editingRoleData = useSelector(selectRoleData);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const companyId = useSelector(selectUserCompanyId);
  const query = useSelector(selectRolesQuery);
  const permissionsData = useSelector(selectAllPermissions);
  const canCreateRole = can('companyrole:create') || can('role:create');

  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const [isAddRoleDrawerOpen, setAddRoleDrawerOpen] = useState(false);
  const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);
  const [isRoleDetailModalOpen, setRoleDetailModalOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !rolesLoading && !hasFetchedInitial) {
      dispatch(fetchRolesRequest(query));
      setHasFetchedInitial(true);
    }
  }, [isAuthenticated, rolesLoading, hasFetchedInitial, dispatch, query]);

  useEffect(() => {
    if (isAuthenticated && hasFetchedInitial) {
      dispatch(fetchRolesRequest(query));
    }
  }, [query, dispatch, isAuthenticated, hasFetchedInitial]);

  useEffect(() => {
    if (isAuthenticated && (!permissionsData.items || permissionsData.items.length === 0)) {
      dispatch(fetchPermissionsRequest({
        page: 1,
        pageSize: 200,
        sortBy: 'permissionName',
        sortOrder: 'asc'
      }));
    }
  }, [isAuthenticated, dispatch, permissionsData.items]);

  const transformedRoles = useMemo(() => {
    const items = reduxRoleItems?.items || [];

    return items.map((role, index) => {
      let permissions = [];
      let permissionCount = 0;

      try {
        if (role.defaultPermission) {
          permissions = JSON.parse(role.defaultPermission);
        }
      } catch (e) {
        console.error('Error parsing permissions for role:', role.companyRoleId, e);
        permissions = [];
        permissionCount = 0;
      }

      return {
        id: role.companyRoleId,
        serialNumber: (query.page - 1) * query.pageSize + index + 1,
        companyRoleId: role.companyRoleId,
        roleName: role.roleName,
        isActive: role.isActive,
        isDeleted: role.isDeleted,
        defaultRole: role.defaultRole === "true" || role.defaultRole === true,
        permissions: permissions,
        permissionCount: permissionCount,
        companyName: role.companyName,
        createdAt: role.createdAt,
        createdBy: role.createdBy,
        createdByName: role.createdByName,
        updatedAt: role.updatedAt,
        updatedBy: role.updatedBy,
        updatedByName: role.updatedByName,
        originalRole: role
      };
    });
  }, [reduxRoleItems, query.page, query.pageSize]);

  const pagination = {
    pageNumber: query.page,
    pageSize: query.pageSize,
    totalCount: reduxRoleItems.totalCount || 0,
  };

  const sorting = {
    sortField: query.sortBy,
    sortOrder: query.sortOrder,
  };

  const roleFilterSections = useMemo(() => [
    {
      type: 'sort',
      key: 'sort',
      title: 'Sort Roles',
      options: [
        { key: 'roleName', label: 'Role Name' },
        { key: 'createdAt', label: 'Creation Date' },
        { key: 'updatedAt', label: 'Last Updated' },
      ],
    },
    // {
    //   type: 'isActive',
    //   key: 'isActive',
    //   title: 'Filter by Status',
    //   options: [
    //     { key: 'true', label: 'Active' },
    //     { key: 'false', label: 'Inactive' },
    //   ],
    // },
    // {
    //   type: 'defaultRole',
    //   key: 'defaultRole',
    //   title: 'Filter by Type',
    //   options: [
    //     { key: 'true', label: 'Default Roles' },
    //     { key: 'false', label: 'Custom Roles' },
    //   ],
    // },
    {
      type: 'keyword',
      key: 'search',
      title: 'Filter by Keyword',
    },
  ], []);

  const initialRoleSelection = useMemo(() => ({
    sortBy: query.sortBy || null,
    sortOrder: query.sortOrder || null,
    isActive: query.isActive || null,
    defaultRole: query.defaultRole || null,
    search: query.search || null,
  }), [query]);

  const toggleAddRoleDrawer = (open) => () => {
    setAddRoleDrawerOpen(open);
    if (!open) {
      dispatch(clearEditingRoleState());
    }
  };

  const toggleAdvancedSortDrawer = (open) => () => {
    setAdvancedSortDrawerOpen(open);
  };

  const handleCreateRole = (roleData) => {
    dispatch(createRoleRequest({ roleData }));
    setAddRoleDrawerOpen(false);
  };

  const handleEditRole = (role) => {
    dispatch(getRoleByIdRequest(role.id));
    setAddRoleDrawerOpen(true);
  };

  const handleUpdateRole = (updatedRoleData) => {
    const formattedData = {
      companyId: companyId,
      roleName: updatedRoleData.roleName,
      isActive: updatedRoleData.isActive,
      defaultRole: "false",
      defaultPermission: updatedRoleData.defaultPermission || "string",
      permissionIds: updatedRoleData.permissionIds || []
    };

    dispatch(updateRoleRequest({
      roleId: updatedRoleData.id,
      roleData: formattedData,
      onSuccess: () => {
        setAddRoleDrawerOpen(false);
        toast.success('Role updated successfully');
      },
      onFailure: (error) => {
        console.error('Role update failed:', error);
        toast.error(`Update failed: ${error}`);
      }
    }));
  };

  const handleStatusToggle = (role) => {
    if (role.defaultRole) {
      return;
    }

    const originalRole = role.originalRole;
    let existingPermissions = [];
    let existingPermissionIds = [];

    try {
      if (originalRole.defaultPermission && originalRole.defaultPermission !== "string") {
        existingPermissions = JSON.parse(originalRole.defaultPermission);
      }
    } catch (e) {
      console.error('Error parsing existing permissions:', e);
      existingPermissions = [];
    }

    if (permissionsData.items && existingPermissions.length > 0) {
      existingPermissionIds = permissionsData.items
        .filter(p => existingPermissions.includes(p.permissionName))
        .map(p => p.permissionId);
    }

    const formattedData = {
      companyId: companyId,
      roleName: originalRole.roleName,
      isActive: !originalRole.isActive,
      defaultRole: originalRole.defaultRole || "false",
      defaultPermission: originalRole.defaultPermission || "string",
      permissionIds: existingPermissionIds
    };

    console.log('Status toggle payload:', formattedData);

    dispatch(updateRoleRequest({
      roleId: originalRole.companyRoleId,
      roleData: formattedData,
      onSuccess: () => {
        toast.success(`Role ${!originalRole.isActive ? 'activated' : 'deactivated'} successfully`);
      },
      onFailure: (error) => {
        console.error('Status toggle failed:', error);
        toast.error(`Status update failed: ${error}`);
      }
    }));
  };

  const handleDeleteRole = (roleId) => {
    dispatch(deleteRoleRequest({
      roleId,
      onSuccess: () => {
        toast.success('Role deleted successfully');
      },
      onFailure: (error) => {
        toast.error(`Delete failed: ${error}`);
      }
    }));
  };

  const handleRoleClick = (role) => {
    const originalRole = reduxRoleItems.items?.find(r => r.companyRoleId === role.id);
    setSelectedRoleForDetail(originalRole);
    setRoleDetailModalOpen(true);
  };

  const handleCloseRoleDetailModal = () => {
    setRoleDetailModalOpen(false);
    setSelectedRoleForDetail(null);
  };

  const handleApplyFilters = useCallback((filtersPayload) => {
    let newQueryState = { ...query };

    if (Object.keys(filtersPayload).length === 0) {
      newQueryState = {
        ...newQueryState,
        sortBy: 'roleName',
        sortOrder: 'asc',
        search: '',
        isActive: '',
        defaultRole: '',
        page: 1,
      };
    } else {
      newQueryState = { ...newQueryState, ...filtersPayload, page: 1 };
    }

    dispatch(setRolesQuery(newQueryState));
    setAdvancedSortDrawerOpen(false);
  }, [dispatch, query]);

  const handlePageChange = useCallback((event, newPage) => {
    dispatch(setRolesQuery({ ...query, page: newPage + 1 }));
  }, [dispatch, query]);

  const handleRowsPerPageChange = useCallback((event) => {
    dispatch(setRolesQuery({
      ...query,
      page: 1,
      pageSize: parseInt(event.target.value, 10)
    }));
  }, [dispatch, query]);

  const handleSortRequest = useCallback((sortField) => {
    const isAsc = query.sortBy === sortField && query.sortOrder === 'asc';
    const sortOrder = isAsc ? 'desc' : 'asc';
    dispatch(setRolesQuery({
      ...query,
      sortBy: sortField,
      sortOrder,
      page: 1
    }));
  }, [dispatch, query]);

  const handleRetry = () => {
    dispatch(clearRolesError());
    dispatch(fetchRolesRequest(query));
  };

  const shouldShowFullScreenLoader = false;

  const renderHeaderActions = () => (
    <>
      <Tooltip title={canCreateRole ? '' : "You don't have permission to add role"}>
        <span>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={toggleAddRoleDrawer(true)}
            disabled={!canCreateRole}
            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
          >
            Add Role
          </Button>
        </span>
      </Tooltip>
      <IconButton
        onClick={toggleAdvancedSortDrawer(true)}
        sx={{
          backgroundColor: 'background.default',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          p: '7px'
        }}
      >
        <FilterListIcon color="primary" />
      </IconButton>
    </>
  );

  const renderCurrentView = () => {
    if (shouldShowFullScreenLoader) {
      return (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 200px)'
        }}>
          <CircularProgress />
        </Box>
      );
    }

    if (roleError) {
      return (
        <ErrorBoundary
          error={roleError}
          onRetry={handleRetry}
          onDismiss={() => window.location.reload()}
          title="Failed to Load Roles"
          showInline={false}
          showImage={true}
        />
      );
    }

    return (
      <RolesTable
        roles={transformedRoles}
        isLoading={rolesLoading}
        pagination={pagination}
        sorting={sorting}
        onRoleClick={handleRoleClick}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onStatusToggle={handleStatusToggle}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSortRequest={handleSortRequest}
      />
    );
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: gridSpacing / 2
      }}>
      </Box>

      <ViewHeader title="Roles">
        {renderHeaderActions()}
      </ViewHeader>

      <Box sx={{ mt: gridSpacing }}>
        {renderCurrentView()}
      </Box>

      <AddRoleDrawer
        open={isAddRoleDrawerOpen}
        onClose={toggleAddRoleDrawer(false)}
        onSubmitCreate={handleCreateRole}
        onSubmitUpdate={handleUpdateRole}
        editingRole={editingRoleData}
      />

      <AdvancedSortDrawer
        open={isAdvancedSortDrawerOpen}
        onClose={toggleAdvancedSortDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={roleFilterSections}
        initialSelection={initialRoleSelection}
      />

      {selectedRoleForDetail && (
        <RoleDetailModal
          open={isRoleDetailModalOpen}
          onClose={handleCloseRoleDetailModal}
          role={selectedRoleForDetail}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </Box>
  );
}
