import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import EmployeesTable from './EmployeesTable';
import NewEmployeeDrawer from '../../components/addEmployee/NewEmployeeDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from '../../store/constant';
import { useCan } from '../../hooks/useCan';

import {
  getAllUsersRequest,
  setUsersQuery,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
  selectUserList,
  selectUsersQuery,
  selectUserProfileLoading,
} from '../../redux/features/profile/profileSlice';

import {
  getCompanyDepartmentsRequest,
  getCompanyRolesRequest,
  selectCompanyDepartments,
  selectCompanyRoles,
} from '../../redux/features/company/companySlice';

export default function EmployeesView() {
  const [isNewEmployeeDrawerOpen, setNewEmployeeDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const dispatch = useDispatch();
  const { can } = useCan();

  const { items: employees, totalCount } = useSelector(selectUserList);
  
  const query = useSelector(selectUsersQuery) || {
    page: 1,
    pageSize: 50,
    sortBy: '',
    sortOrder: '',
    statusNames: '',
    search: '',
    roleNames: '',
    departmentNames: '',
    memberUserId: null,
    isDeletedFilter: false,
    isActiveFilter: true,
  };
  
  const loading = useSelector(selectUserProfileLoading);
  const canCreateEmployee = can('employee:create');

  // Company data
  const companyDepartments = useSelector(selectCompanyDepartments);
  const companyRoles = useSelector(selectCompanyRoles);

  useEffect(() => {
    dispatch(getAllUsersRequest(query));
    // Fetch reference data
    dispatch(getCompanyDepartmentsRequest());
    dispatch(getCompanyRolesRequest());
  }, [dispatch, query]);

  const handleQueryChange = useCallback(
    (newQuery) => {
      dispatch(setUsersQuery({ ...query, ...newQuery }));
    },
    [dispatch, query]
  );

  const toggleNewEmployeeDrawer = (open) => {
    if (!open) {
      setEmployeeToEdit(null);
    }
    setNewEmployeeDrawerOpen(open);
  };

  const toggleFilterDrawer = (shouldOpen = null) => {
    if (shouldOpen !== null) {
      setFilterDrawerOpen(shouldOpen);
    } else {
      setFilterDrawerOpen((prev) => !prev);
    }
  };

  // ✅ FIXED: Updated filter sections to match slice field names
  const employeeFilterSections = useMemo(() => {
    const departmentOptions = companyDepartments?.map(dept => ({
      key: dept.departmentName,
      label: dept.departmentName
    })) || [];

    const roleOptions = companyRoles?.map(role => ({
      key: role.roleName,
      label: role.roleName
    })) || [];

    return [
      {
        type: 'sort',
        key: 'sort',
        title: 'Sort By Team Member',
        options: [
          { key: 'firstName', label: 'Name' },
          { key: 'joiningDate', label: 'Joining Date' },
          { key: 'userEmail', label: 'Email' },
          { key: 'departmentName', label: 'Department' },
        ],
      },
      {
        type: 'departmentNames',
        key: 'departmentNames',
        title: 'Filter by Department',
        options: departmentOptions,
      },
      {
        type: 'roleNames',
        key: 'roleNames',
        title: 'Filter by Role',
        options: roleOptions,
      },
      {
        type: 'keyword',
        key: 'search',
        title: 'Search by Keyword',
      },
      {
  type: 'userStatus',
  key: 'userStatus',
  title: 'User Status',
  options: [
    { key: 'active', label: 'Active Users' },
    { key: 'inactive', label: 'Inactive Users' },
    { key: 'deleted', label: 'Deleted Users' },
  ],
},
    ];
  }, [companyDepartments, companyRoles]);

  const initialEmployeeSelection = useMemo(() => {
    const parseCommaSeparatedField = (field) => {
      return typeof field === 'string' && field ? field.split(',') : [];
    };

    return {
      sortBy: query.sortBy || null,
      sortOrder: query.sortOrder || null,
      statusNames: parseCommaSeparatedField(query.statusNames),
      departmentNames: parseCommaSeparatedField(query.departmentNames),
      roleNames: parseCommaSeparatedField(query.roleNames),
      search: query.search || '',
      memberUserId: query.memberUserId || null,
      isDeletedFilter: query.isDeletedFilter,
      isActiveFilter: query.isActiveFilter,
    };
  }, [query]);

  const handleApplyFilters = useCallback((filtersPayload) => {
    let newQueryState = { ...query };
    
    if (Object.keys(filtersPayload).length === 0) {
      // Clear all filters
      newQueryState = {
        ...newQueryState,
        sortBy: '',
        sortOrder: '',
        statusNames: '',
        search: '',
        roleNames: '',
        departmentNames: '',
        memberUserId: null,
        isDeletedFilter: false,
        isActiveFilter: true,
        page: 1,
        pageSize: 50,
      };
    } else {
      const updatedFilters = { ...filtersPayload };
      
      const managedKeys = ['departmentNames', 'roleNames', 'search', 'sortBy', 'sortOrder', 'statusNames'];
      managedKeys.forEach(key => {
        if (!(key in updatedFilters)) {
          updatedFilters[key] = '';
        }
      });

      if (!('isActiveFilter' in updatedFilters)) updatedFilters.isActiveFilter = null;
      if (!('isDeletedFilter' in updatedFilters)) updatedFilters.isDeletedFilter = false;

      // Handle array to comma-separated string conversion for all multi-select fields
      ['statusNames', 'departmentNames', 'roleNames'].forEach(field => {
        if (Array.isArray(updatedFilters[field])) {
          updatedFilters[field] = updatedFilters[field].join(',');
        }
      });
      
      newQueryState = { ...newQueryState, ...updatedFilters, page: 1 };
    }
    
    dispatch(setUsersQuery(newQueryState));
    toggleFilterDrawer(false);
  }, [dispatch, query]);

  const handleRemoveFilter = useCallback((filterKey) => {
    let newQuery = { ...query, page: 1 };
    if (filterKey === 'search') {
      newQuery.search = '';
    } else if (filterKey === 'sortBy') {
      newQuery.sortBy = '';
      newQuery.sortOrder = '';
    } else {
      newQuery[filterKey] = '';
    }
    dispatch(setUsersQuery(newQuery));
  }, [dispatch, query]);

  const handleClearAllFilters = useCallback(() => {
    dispatch(setUsersQuery({
      ...query,
      sortBy: '',
      sortOrder: '',
      statusNames: '',
      search: '',
      roleNames: '',
      departmentNames: '',
      memberUserId: null,
      isDeletedFilter: false,
      isActiveFilter: true,
      page: 1,
    }));
  }, [dispatch, query]);

  const renderActiveFilters = () => {
    const chips = [];
    const deptNames = query.departmentNames ? (typeof query.departmentNames === 'string' ? query.departmentNames.split(',').filter(Boolean) : query.departmentNames) : [];
    const roleNames = query.roleNames ? (typeof query.roleNames === 'string' ? query.roleNames.split(',').filter(Boolean) : query.roleNames) : [];
    const hasSortBy = query.sortBy;

    deptNames.forEach(dept => {
      chips.push({
        key: `dept_${dept}`, label: `Department: ${dept}`, onDelete: () => {
          const remaining = deptNames.filter(d => d !== dept);
          dispatch(setUsersQuery({ ...query, departmentNames: remaining.join(','), page: 1 }));
        }
      });
    });

    roleNames.forEach(role => {
      chips.push({
        key: `role_${role}`, label: `Role: ${role}`, onDelete: () => {
          const remaining = roleNames.filter(r => r !== role);
          dispatch(setUsersQuery({ ...query, roleNames: remaining.join(','), page: 1 }));
        }
      });
    });

    if (hasSortBy) {
      const sortLabel = { firstName: 'Name', joiningDate: 'Joining Date', userEmail: 'Email', departmentName: 'Department' }[query.sortBy] || query.sortBy;
      chips.push({ key: 'sortBy', label: `Sort: ${sortLabel} (${query.sortOrder || 'asc'})`, onDelete: () => handleRemoveFilter('sortBy') });
    }

    if (chips.length === 0) return null;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mr: 1.5 }}>
        {chips.map(chip => (
          <Chip
            key={chip.key}
            label={chip.label}
            size="small"
            onDelete={chip.onDelete}
            deleteIcon={<CloseIcon />}
            sx={{
              backgroundColor: 'primary.50',
              color: 'primary.main',
              border: '1px solid',
              borderColor: 'primary.200',
              fontWeight: 500,
              fontSize: '0.75rem',
              '& .MuiChip-deleteIcon': { color: 'primary.main', fontSize: '0.9rem' }
            }}
          />
        ))}
        <Button
          size="small"
          onClick={handleClearAllFilters}
          sx={{ color: 'text.secondary', fontSize: '0.75rem', textTransform: 'none', minWidth: 0, px: 0.5 }}
        >
          Clear all
        </Button>
      </Box>
    );
  };

  const handleEditClick = (userId) => {
    const employeeRow = formattedEmployees.find((emp) => emp.userId === userId);
    if (employeeRow && employeeRow.originalData) {
      setEmployeeToEdit(employeeRow.originalData);
      setNewEmployeeDrawerOpen(true);
    }
  };

  const handleFormSubmit = (employeeData) => {
    if (employeeToEdit) {
      dispatch(
        updateUserRequest({
          userId: employeeToEdit.userId, 
          userData: employeeData,
          onSuccess: () => { 
            toggleNewEmployeeDrawer(false); 
          },
          onFailure: (err) => { 
            toast.error(`Update failed: ${err}`); 
          },
        })
      );
    } else {
      dispatch(
        createUserRequest({
          userData: employeeData,
          onSuccess: () => { 
            toggleNewEmployeeDrawer(false); 
          },
          onFailure: (err) => { 
            toast.error(`Creation failed: ${err}`); 
          },
        })
      );
    }
  };

  const handleDeleteEmployee = (userId) => {
    dispatch(
      deleteUserRequest({
        userId,
        onSuccess: () => toast.success('Deleted successfully.'),
        onFailure: (err) => toast.error(`Deletion failed: ${err}`),
      })
    );
  };

  // Updated formattedEmployees with serial numbers based on pagination
  const formattedEmployees = useMemo(() => {
    return employees
      .map((user, index) => ({
        userId: user.userId,
        serialNumber: (query.page - 1) * query.pageSize + index + 1,
        id: user.employeeCode || `EMP-${user.userId}`,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.profilePhotoUrl,
        email: user.userEmail,
        department: user.departmentName,
        role: user.description,
        joiningDate: user.joiningDate,

        isActive: user.isActive,
        isDeleted: user.isDeleted,

  originalData: user
      }));
  }, [employees, query.page, query.pageSize]);

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: gridSpacing, 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Our Team
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#1e293b', // Deep slate/black
              px: 1.25,
              py: 0.4,
              borderRadius: '20px',
              display: 'inline-block',
              mt: 0.5,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {
      query.isDeletedFilter
    ? 'Deleted Members'
    : query.isActiveFilter
      ? 'Active Members'
      : 'Inactive Members'
}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {renderActiveFilters()}
          <Tooltip title={canCreateEmployee ? '' : "You don't have permission to add employee"}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setNewEmployeeDrawerOpen(true)}
                disabled={!canCreateEmployee}
                sx={{
                  borderRadius: '12px',
                  px: { xs: 1.5, sm: 2.5 },
                  height: '40px',
                  whiteSpace: 'nowrap'
                }}
              >
                Add Team Member
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Filter & Sort">
            <IconButton 
              onClick={() => toggleFilterDrawer()} 
              sx={{ 
                backgroundColor: 'background.paper', 
                borderRadius: '12px', 
                border: '1px solid', 
                borderColor: 'divider', 
                height: '40px', 
                width: '40px' 
              }}
            >
              <FilterListIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && !employees.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <EmployeesTable
          employees={formattedEmployees}
          totalCount={totalCount}
          query={query}
          onQueryChange={handleQueryChange}
          onEditEmployee={handleEditClick}
          onDeleteEmployee={handleDeleteEmployee}
          loading={loading}
        />
      )}

      <NewEmployeeDrawer
        open={isNewEmployeeDrawerOpen}
        onClose={() => toggleNewEmployeeDrawer(false)}
        onSubmit={handleFormSubmit}
        employeeToEdit={employeeToEdit}
      />
      
      <AdvancedSortDrawer
        open={isFilterDrawerOpen}
        onClose={() => toggleFilterDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={employeeFilterSections}
        initialSelection={initialEmployeeSelection}
      />
    </Box>
  );
}
