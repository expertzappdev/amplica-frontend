import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
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
        type: 'isDeletedFilter',
        key: 'isDeletedFilter',
        title: 'User Status',
        options: [
          { key: false, label: 'Active Users' },
          { key: true, label: 'Deleted Users' },
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
      isDeletedFilter: query.isDeletedFilter ?? false,
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
        page: 1,
        pageSize: 50,
      };
    } else {
      const updatedFilters = { ...filtersPayload };
      
      // Handle array to comma-separated string conversion for all multi-select fields
      ['statusNames', 'departmentNames', 'roleNames'].forEach(field => {
        if (Array.isArray(updatedFilters[field])) {
          if (updatedFilters[field].length > 0) {
            updatedFilters[field] = updatedFilters[field].join(',');
          } else {
            updatedFilters[field] = '';
          }
        }
      });
      
      newQueryState = { ...newQueryState, ...updatedFilters, page: 1 };
    }
    
    dispatch(setUsersQuery(newQueryState));
    toggleFilterDrawer(false);
  }, [dispatch, query]);

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
        id: user.employeeCode || `EMP-${String(index + 1).padStart(3, '0')}`,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.profilePhotoUrl,
        email: user.userEmail,
        department: user.departmentName || 'N/A',
        role: user.description || 'N/A',
        joiningDate: user.joiningDate,
        status: user.userIsActive ? 'Active' : 'Inactive',
        isDeleted: query.isDeletedFilter,
        originalData: user
      }));
  }, [employees, query.page, query.pageSize, query.isDeletedFilter]);

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
            {query.isDeletedFilter ? 'Deleted Members' : 'Active Members'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
