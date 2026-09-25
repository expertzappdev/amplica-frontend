import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, IconButton, CircularProgress, Tooltip, TextField, InputAdornment } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { format, parseISO, isValid } from 'date-fns';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import ProjectsTable from './ProjectsTable';
import ProjectFormDrawer from '../../components/addProject/NewProjectDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from '../../store/constant';
import {
  fetchProjectsRequest,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
  getProjectByIdRequest,
  clearEditingState,
  selectAllProjects,
  selectProjectsLoading,
  selectProjectsError,
  selectEditingProjectData,
  clearProjectsError,
  selectQuery,
  setQuery,
  selectStatusItems,
} from '../../redux/features/projects/projectSlice';
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from '../../redux/features/auth/authSlice';
import {
  selectUserList,
  setUsersQuery
} from '../../redux/features/profile/profileSlice';
import { useCan } from '../../hooks/useCan';

export default function ProjectsView() {
  const dispatch = useDispatch();
  const { can } = useCan();
  const projectItems = useSelector(selectAllProjects) || { items: [], totalCount: 0 };

  const projectsLoading = useSelector(selectProjectsLoading);
  const projectError = useSelector(selectProjectsError);
  const editingProjectData = useSelector(selectEditingProjectData);
  const authLoading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const query = useSelector(selectQuery) || {
    page: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    statusNames: '',
    search: '',
    startDateFrom: null,
    endDateTo: null,
    memberUserId: null,
  };
  const statusData = useSelector(selectStatusItems);
  const userList = useSelector(selectUserList);
  const currentUser = useSelector(selectUser);
  const canCreateProject = can('project:create');
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [isProjectFormDrawerOpen, setIsProjectFormDrawerOpen] = useState(false);
  const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(query.search || '');
  const searchDebounceRef = useRef(null);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setQuery({ ...query, search: value, page: 1 }));
    }, 400);
  }, [dispatch, query]);

  const pagination = {
    pageNumber: query.page,
    pageSize: query.pageSize,
    totalCount: projectItems.totalCount || 0,
  };
  const sorting = {
    sortField: query.sortBy,
    sortOrder: query.sortOrder,
  };

  const createModalQuery = useCallback((searchValue = '') => ({
    page: 1,
    pageSize: 10000,
    sortBy: '',
    sortOrder: '',
    statusNames: '',
    search: searchValue,
    roleNames: '',
    departmentNames: '',
    memberUserId: null,
  }), []);

  useEffect(() => {
    const modalQuery = createModalQuery();
    dispatch(setUsersQuery(modalQuery));
  }, [createModalQuery, dispatch]);

  useEffect(() => {
    if (isAuthenticated && !projectsLoading && !hasFetchedInitial) {
      dispatch(fetchProjectsRequest(query));
      setHasFetchedInitial(true);
    }
  }, [isAuthenticated, projectsLoading, hasFetchedInitial, dispatch, query]);

  useEffect(() => {
    if (isAuthenticated && hasFetchedInitial) {
      dispatch(fetchProjectsRequest(query));
    }
  }, [query, dispatch, isAuthenticated, hasFetchedInitial]);


  useEffect(() => {
    if (query?.pageSize < 10) {
      dispatch(setQuery({ ...query, pageSize: 10 }));
    }
  }, [query?.pageSize, dispatch]);

  const toggleProjectFormDrawer = (open) => () => {
    setIsProjectFormDrawerOpen(open);
    if (!open) {
      dispatch(clearEditingState());
    }
  };

  const toggleAdvancedSortDrawer = (open) => () => {
    setAdvancedSortDrawerOpen(open);
  };

  const handleCreateProject = (projectData) => {
    dispatch(createProjectRequest(projectData));
  };

  const handleUpdateProject = (projectId, changes) => {
    dispatch(updateProjectRequest({ projectId, changes }));
  };

  const handleProjectStatusChange = (projectId, newStatus) => {
    const projectToUpdate = projectItems.items?.find(p => p.projectId === projectId);

    if (projectToUpdate) {
      const startDate = projectToUpdate.startDate ? parseISO(projectToUpdate.startDate) : null;
      const endDate = projectToUpdate.endDate ? parseISO(projectToUpdate.endDate) : null;

      const changes = {
        name: projectToUpdate.name,
        status: newStatus,
        description: projectToUpdate.description || '',
        startDate: startDate && isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : null,
        endDate: endDate && isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : null,
      };
      dispatch(updateProjectRequest({ projectId, changes }));
    } else {
      console.error(`Project with ID ${projectId} not found for status update.`);
    }
  };

  const handleEditProject = (projectId) => {
    dispatch(getProjectByIdRequest(projectId));
    setIsProjectFormDrawerOpen(true);
  };

  const handleDeleteProject = (projectId) => {
    dispatch(deleteProjectRequest({ projectId }));
  };

  const handleRetry = () => {
    dispatch(clearProjectsError());
    dispatch(fetchProjectsRequest(query));
  };

  const handleApplyFilters = useCallback((filtersPayload) => {
    let newQueryState = { ...query };
    if (Object.keys(filtersPayload).length === 0) {
      newQueryState = {
        ...newQueryState,
        sortBy: '',
        sortOrder: '',
        statusNames: '',
        search: '',
        startDateFrom: null,
        endDateTo: null,
        memberUserId: null,
        page: 1,
      };
      setSearchInput('');
    } else {
      const updatedFilters = { ...filtersPayload };

      if (Array.isArray(updatedFilters.statusNames) && updatedFilters.statusNames.length > 0) {
        updatedFilters.statusNames = updatedFilters.statusNames.join(',');
      } else if (Array.isArray(updatedFilters.statusNames) && updatedFilters.statusNames.length === 0) {
        updatedFilters.statusNames = '';
      }

      newQueryState = { ...newQueryState, ...updatedFilters, page: 1 };
      if (updatedFilters.search !== undefined) {
        setSearchInput(updatedFilters.search || '');
      }
    }
    dispatch(setQuery(newQueryState));
    setAdvancedSortDrawerOpen(false);
  }, [dispatch, query]);

  const handlePageChange = useCallback((event, newPage) => {
    dispatch(setQuery({ ...query, page: newPage + 1 }));
  }, [dispatch, query]);

  const handleRowsPerPageChange = useCallback((event) => {
    dispatch(setQuery({ ...query, page: 1, pageSize: parseInt(event.target.value, 10) }));
  }, [dispatch, query]);

  const handleSortRequest = useCallback((sortField) => {
    const isAsc = query.sortBy === sortField && query.sortOrder === 'asc';
    const sortOrder = isAsc ? 'desc' : 'asc';
    dispatch(setQuery({ ...query, sortBy: sortField, sortOrder, page: 1 }));
  }, [dispatch, query]);

  const shouldShowFullScreenLoader = authLoading || (projectsLoading && !hasFetchedInitial);

  const projectFilterSections = useMemo(() => {
    const statusOptions = statusData.map(status => ({ key: status.name, label: status.name }));
    const memberOptions = userList.items.map(user => ({
      key: user.userId,
      label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
    }));

    const sections = [
      {
        type: 'sort',
        key: 'sort',
        title: 'Sort Projects',
        options: [
          { key: 'name', label: 'Project Name' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
          { key: 'statusName', label: 'Status' },
          { key: 'createdAt', label: 'Created Date' },
        ],
      },
      {
        type: 'statusNames',
        key: 'statusNames',
        title: 'Filter by Status',
        allLabel: 'All Projects',
        options: statusOptions,
      },
      {
        type: 'keyword',
        key: 'search',
        title: 'Filter by Keyword',
      },
      {
        type: 'duration',
        key: 'duration',
        title: 'Filter by Duration',
      },
    ];
    if (currentUser?.role == "Company Admin") {
      sections.push({
        type: 'member',
        key: 'memberUserId',
        title: 'Filter by Member',
        options: memberOptions,
      });
    }
    return sections;
  }, [statusData, userList, currentUser]);

  const initialProjectSelection = useMemo(() => ({
    sortBy: query.sortBy || null,
    sortOrder: query.sortOrder || null,
    statusNames: typeof query.statusNames === 'string' && query.statusNames ? query.statusNames.split(',') : [],
    memberUserId: query.memberUserId || null,
    search: query.search || null,
    startDateFrom: query.startDateFrom || null,
    endDateTo: query.endDateTo || null,
    durationPreset: query.durationPreset || null,
  }), [query]);

  const renderSearchBar = () => (
    <TextField
      size="small"
      placeholder="Search projects..."
      value={searchInput}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
          </InputAdornment>
        ),
        endAdornment: searchInput ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => { setSearchInput(''); dispatch(setQuery({ ...query, search: '', page: 1 })); }}>
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </InputAdornment>
        ) : null,
        sx: { borderRadius: '8px' }
      }}
      sx={{ width: { xs: '150px', sm: '350px' } }}
    />
  );

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: gridSpacing / 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Projects
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {renderSearchBar()}
          <Tooltip title={canCreateProject ? '' : "You don't have permission to add project"}>
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={toggleProjectFormDrawer(true)}
                disabled={!canCreateProject}
                sx={{ borderRadius: '8px', px: { xs: 1.5, sm: 2 }, whiteSpace: 'nowrap' }}
              >
                New Project
              </Button>
            </span>
          </Tooltip>
          <IconButton onClick={toggleAdvancedSortDrawer(true)} sx={{ backgroundColor: 'background.default', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
            <FilterListIcon color="primary" />
          </IconButton>
        </Box>
      </Box>

      {shouldShowFullScreenLoader ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
          <CircularProgress />
        </Box>
      ) : projectError ? (
        <ErrorBoundary
          error={projectError}
          onRetry={handleRetry}
          onDismiss={() => navigate('/project')}
          title="Failed to Load Project"
          showInline={false}
          showImage={true}
        />
      ) : (
        <ProjectsTable
          projects={projectItems.items}
          isLoading={projectsLoading}
          pagination={pagination}
          sorting={sorting}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSortRequest={handleSortRequest}
          onProjectStatusChange={handleProjectStatusChange}
        />
      )}

      <ProjectFormDrawer
        open={isProjectFormDrawerOpen}
        onClose={toggleProjectFormDrawer(false)}
        onSubmitCreate={handleCreateProject}
        onSubmitUpdate={handleUpdateProject}
        projectData={editingProjectData}
      />

      <AdvancedSortDrawer
        open={isAdvancedSortDrawerOpen}
        onClose={toggleAdvancedSortDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={projectFilterSections}
        initialSelection={initialProjectSelection}
      />
    </Box>
  );
}
