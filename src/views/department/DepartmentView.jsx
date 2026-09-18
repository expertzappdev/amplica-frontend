import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import ViewHeader from '../../uiComponent/viewheader';
import DepartmentTable from './DepartmentTable';
import AddEditDepartmentDrawer from '../../components/addDepartment/AddEditDepartmentDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from '../../store/constant';
import toast from 'react-hot-toast';
import { useCan } from '../../hooks/useCan';

import {
  getDepartmentsRequest,
  getDepartmentByIdRequest,
  createDepartmentRequest,
  updateDepartmentRequest,
  deleteDepartmentRequest,
  clearCurrentDepartment,
  clearDepartmentCRUDError,
  selectAllDepartments,
  selectCurrentDepartment,
  selectDepartmentCRUDLoading,
  selectDepartmentCRUDError,
} from '../../redux/features/company/companySlice';

import { selectIsAuthenticated } from '../../redux/features/auth/authSlice';

export default function DepartmentView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useCan();
  
  const reduxDepartmentItems = useSelector(selectAllDepartments) || { items: [], totalCount: 0 };
  const departmentsLoading = useSelector(selectDepartmentCRUDLoading);
  const departmentError = useSelector(selectDepartmentCRUDError);
  const editingDepartmentData = useSelector(selectCurrentDepartment);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const canCreateDepartment = can('department:create');
  
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    sortBy: 'departmentName',
    sortOrder: 'asc',
    search: '',
    isActive: '',
  });

  const [isAddDepartmentDrawerOpen, setAddDepartmentDrawerOpen] = useState(false);
  const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !departmentsLoading && !hasFetchedInitial) {
      dispatch(getDepartmentsRequest({}));
      setHasFetchedInitial(true);
    }
  }, [isAuthenticated, departmentsLoading, hasFetchedInitial, dispatch]);

  useEffect(() => {
    if (isAuthenticated && hasFetchedInitial) {
      dispatch(getDepartmentsRequest({}));
    }
  }, [query, dispatch, isAuthenticated, hasFetchedInitial]);

  const transformedDepartments = useMemo(() => {
    const items = reduxDepartmentItems?.items || [];
    
    let filteredItems = [...items];
    
    if (query.search) {
      filteredItems = filteredItems.filter(dept => 
        dept.departmentName.toLowerCase().includes(query.search.toLowerCase()) ||
        dept.description?.toLowerCase().includes(query.search.toLowerCase())
      );
    }
    
    filteredItems.sort((a, b) => {
      let aValue = a[query.sortBy] || '';
      let bValue = b[query.sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (query.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
    
    const startIndex = (query.page - 1) * query.pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + query.pageSize);
    
    return {
      items: paginatedItems.map((department, index) => ({
        id: department.deptId,
        serialNumber: startIndex + index + 1,
        deptId: department.deptId,
        companyId: department.companyId,
        departmentName: department.departmentName,
        description: department.description,
        departmentHeadUserId: department.departmentHeadUserId,
        departmentHeadName: department.departmentHeadName,
        isDeleted: department.isDeleted || false,
        companyName: department.companyName,
        createdAt: department.createdAt,
        createdBy: department.createdBy,
        createdByName: department.createdByName,
        updatedAt: department.updatedAt,
        updatedBy: department.updatedBy,
        updatedByName: department.updatedByName
      })),
      totalCount: filteredItems.length
    };
  }, [reduxDepartmentItems, query]);

  const pagination = {
    pageNumber: query.page,
    pageSize: query.pageSize,
    totalCount: transformedDepartments.totalCount,
  };

  const sorting = {
    sortField: query.sortBy,
    sortOrder: query.sortOrder,
  };

  const departmentFilterSections = useMemo(() => [
    {
      type: 'sort',
      key: 'sort',
      title: 'Sort Departments',
      options: [
        { key: 'departmentName', label: 'Department Name' },
        { key: 'createdAt', label: 'Creation Date' },
        { key: 'updatedAt', label: 'Last Updated' },
      ],
    },
    {
      type: 'keyword',
      key: 'search',
      title: 'Filter by Keyword',
    },
  ], []);

  const initialDepartmentSelection = useMemo(() => ({
    sortBy: query.sortBy || null,
    sortOrder: query.sortOrder || null,
    search: query.search || null,
  }), [query]);

  const toggleAddDepartmentDrawer = (open) => () => {
    setAddDepartmentDrawerOpen(open);
    if (!open) {
      dispatch(clearCurrentDepartment());
    }
  };

  const toggleAdvancedSortDrawer = (open) => () => {
    setAdvancedSortDrawerOpen(open);
  };

  const handleCreateDepartment = (departmentData) => {
    dispatch(createDepartmentRequest({ 
      departmentData,
      onSuccess: (newDepartment) => {
        setAddDepartmentDrawerOpen(false);
        toast.success('Department created successfully');
        dispatch(getDepartmentsRequest({}));
      },
      onFailure: (error) => {
        toast.error(`Creation failed: ${error}`);
      }
    }));
  };

  const handleEditDepartment = (department) => {
    dispatch(getDepartmentByIdRequest(department.deptId));
    setAddDepartmentDrawerOpen(true);
  };

  const handleUpdateDepartment = (updatedDepartmentData) => {

    const formattedData = {
      departmentName: updatedDepartmentData.departmentName,
      description: updatedDepartmentData.description,
      departmentHeadUserId: updatedDepartmentData.departmentHeadUserId
    };


    dispatch(updateDepartmentRequest({ 
      departmentId: updatedDepartmentData.id,
      departmentData: formattedData,
      onSuccess: (updatedDepartment) => {
        setAddDepartmentDrawerOpen(false);
        toast.success('Department updated successfully');
        dispatch(getDepartmentsRequest({}));
      },
      onFailure: (error) => {
        console.error('Department update failed:', error);
        toast.error(`Update failed: ${error}`);
      }
    }));
  };

  const handleDeleteDepartment = (departmentId) => {
    dispatch(deleteDepartmentRequest({ 
      departmentId,
      onSuccess: () => {
        toast.success('Department deleted successfully');
        dispatch(getDepartmentsRequest({}));
      },
      onFailure: (error) => {
        toast.error(`Delete failed: ${error}`);
      }
    }));
  };

  const handleDepartmentClick = (department) => {
    navigate(`/app/departments/${department.deptId}`);
  };

  const handleApplyFilters = useCallback((filtersPayload) => {
    let newQueryState = { ...query };

    if (Object.keys(filtersPayload).length === 0) {
      newQueryState = {
        ...newQueryState,
        sortBy: 'departmentName',
        sortOrder: 'asc',
        search: '',
        page: 1,
      };
    } else {
      newQueryState = { ...newQueryState, ...filtersPayload, page: 1 };
    }

    setQuery(newQueryState);
    setAdvancedSortDrawerOpen(false);
  }, [query]);

  const handlePageChange = useCallback((event, newPage) => {
    setQuery(prev => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setQuery(prev => ({ 
      ...prev, 
      page: 1, 
      pageSize: parseInt(event.target.value, 10) 
    }));
  }, []);

  const handleSortRequest = useCallback((sortField) => {
    const isAsc = query.sortBy === sortField && query.sortOrder === 'asc';
    const sortOrder = isAsc ? 'desc' : 'asc';
    setQuery(prev => ({ 
      ...prev, 
      sortBy: sortField, 
      sortOrder, 
      page: 1 
    }));
  }, [query.sortBy, query.sortOrder]);

  const handleRetry = () => {
    dispatch(clearDepartmentCRUDError());
    dispatch(getDepartmentsRequest({}));
  };

  const shouldShowFullScreenLoader = false;

  const renderHeaderActions = () => (
    <>
      <Tooltip title={canCreateDepartment ? '' : "You don't have permission to add department"}>
        <span>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={toggleAddDepartmentDrawer(true)}
            disabled={!canCreateDepartment}
            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
          >
            Add Department
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

    if (departmentError) {
      return (
        <ErrorBoundary
          error={departmentError}
          onRetry={handleRetry}
          onDismiss={() => window.location.reload()}
          title="Failed to Load Departments"
          showInline={false}
          showImage={true}
        />
      );
    }

    return (
      <DepartmentTable
        departments={transformedDepartments.items}
        isLoading={departmentsLoading}
        pagination={pagination}
        sorting={sorting}
        onDepartmentClick={handleDepartmentClick}
        onEditDepartment={handleEditDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        onUpdateDepartment={handleUpdateDepartment}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSortRequest={handleSortRequest}
      />
    );
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <ViewHeader title="Departments">
        {renderHeaderActions()}
      </ViewHeader>

      <Box sx={{ mt: gridSpacing }}>
        {renderCurrentView()}
      </Box>

      <AddEditDepartmentDrawer
        open={isAddDepartmentDrawerOpen}
        onClose={toggleAddDepartmentDrawer(false)}
        onSubmitCreate={handleCreateDepartment}
        onSubmitUpdate={handleUpdateDepartment}
        editingDepartment={editingDepartmentData}
      />

      <AdvancedSortDrawer
        open={isAdvancedSortDrawerOpen}
        onClose={toggleAdvancedSortDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={departmentFilterSections}
        initialSelection={initialDepartmentSelection}
      />
    </Box>
  );
}
