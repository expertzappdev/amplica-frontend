import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Paper, CircularProgress,
  ToggleButton, ToggleButtonGroup, Tooltip, TextField, Chip, InputAdornment
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

import TimerIcon from '@mui/icons-material/Timer';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import ViewHeader from '../../uiComponent/viewheader';
import TaskTable from './TaskTable';
import { TaskAPI } from '../../services/api';
import AddTaskDrawer from '../../components/addTask/AddTaskDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import TaskDetailModal from './taskDetail/TaskDetailModal';
import UserTimesheetView from '../timesheet/UserTimesheetView';
import KanbanView from './kanban/KanbanView';
import Can from '../../uiComponent/Can';
import { gridSpacing } from '../../store/constant';
import { format, parseISO, isValid } from 'date-fns';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
import {
  fetchUserTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  getTaskByIdRequest as getTaskDetailsById,
  clearEditingTaskState,
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
  selectTaskData,
  clearTasksError,
  selectTasksQuery,
  setTasksQuery,
  fetchAllTasksRequest,
  selectDetailsError,
  clearTaskProjectContext
} from '../../redux/features/tasks/taskSlice';
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from '../../redux/features/auth/authSlice';
import {
  selectUserList,
  setUsersQuery,
} from '../../redux/features/profile/profileSlice';
import { fetchStatusesRequest, selectStatusItems } from '../../redux/features/projects/projectSlice';
import {
  getFilteredTimelogsRequest,
  createTimesheetRequest,
  updateTimesheetRequest,
  deleteTimesheetRequest,
  clearEditingTimelog,
  selectTimeSheetFilterTimeSheet,
  selectTimeSheetFilterLoading,
  selectTimesheetsError as selectTimesheetError,
  selectTimesheetData,
  setTimesheetsQuery,
  selectTimesheetsQuery,
  setEditingTimelog,
} from '../../redux/features/timesheet/timesheetSlice';
import AddTimelogDrawer from '../../components/addTimesheet/AddTimelogDrawer';
import { useCan } from '../../hooks/useCan';


const extractAssigneeIds = (task) => {
  if (!task) return [];

  // New API structure: assignedUsers array
  if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
    if (task.assignedUsers.length > 0) {
      return task.assignedUsers.map(user => user.userId);
    }
  }

  // Fallback to legacy single assignee
  if (task.assignedToUserId) {
    return [task.assignedToUserId];
  }

  return [];
};


const getAssigneesFromTask = (task) => {
  if (!task) return [];

  // Priority 1: New API structure with assignedUsers array
  if (task.assignedUsers && Array.isArray(task.assignedUsers) && task.assignedUsers.length > 0) {
    return task.assignedUsers.map(user => ({
      id: user.userId,
      name: user.userName,
      avatarUrl: user.avatarUrl ? `${ASSETS_BASE_URL}${user.avatarUrl}` : null
    }));
  }

  // Priority 2: Fallback to legacy single assignee
  if (task.assignedToUserId && task.assignedToUserName) {
    return [{
      id: task.assignedToUserId,
      name: task.assignedToUserName,
      avatarUrl: task.assignedToUserAvatarUrl ? `${ASSETS_BASE_URL}${task.assignedToUserAvatarUrl}` : null
    }];
  }

  return [];
};


const isUserAssignedToTask = (task, userId) => {
  if (!task || !userId) return false;

  // Check new assignedUsers array
  if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
    return task.assignedUsers.some(user => user.userId === userId);
  }

  // Fallback to legacy assignedToUserId
  return task.assignedToUserId === userId;
};


export default function TasksView() {
  const dispatch = useDispatch();
  const { can } = useCan();
  const canCreateTimelog = can('timelog:create');
  const canCreateTask = can('task:create');

  // Redux selectors
  const reduxTaskItems = useSelector(selectAllTasks) || { items: [], totalCount: 0 };
  const tasksLoading = useSelector(selectTasksLoading);
  const taskError = useSelector(selectTasksError);
  const detailsError = useSelector(selectDetailsError);
  const editingTaskData = useSelector(selectTaskData);
  const authLoading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const query = useSelector(selectTasksQuery);

  const timesheetData = useSelector(selectTimeSheetFilterTimeSheet);
  const timesheetLoading = useSelector(selectTimeSheetFilterLoading);
  const timesheetError = useSelector(selectTimesheetError);
  const editingTimelogData = useSelector(selectTimesheetData);
  const timesheetQuery = useSelector(selectTimesheetsQuery) || {
    pageNumber: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    search: '',
    userId: null,
    projectId: null,
    taskId: null,
    memberUserId: '',
    loggedAtFrom: '',
    loggedAtTo: '',
    durationFrom: '',
    durationTo: '',
    startDateFrom: null,
    endDateTo: null,
  };

  const statusData = useSelector(selectStatusItems) || [];
  const userList = useSelector(selectUserList);
  const currentUser = useSelector(selectUser);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const [localAllTasks, setLocalAllTasks] = useState([]);
  const optimisticUpdatePending = useRef(false);

  const [isAddTaskDrawerOpen, setAddTaskDrawerOpen] = useState(false);
  const [isAddTodoDrawerOpen, setAddTodoDrawerOpen] = useState(false);
  const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [previousView, setPreviousView] = useState('list');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isAddTimelogDrawerOpen, setAddTimelogDrawerOpen] = useState(false);
  const [timelogPrefillData, setTimelogPrefillData] = useState(null);
  const [isFilterTimesheetDrawerOpen, setFilterTimesheetDrawerOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query.search || '');
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    if (editingTimelogData) {
      setAddTimelogDrawerOpen(true);
    }
  }, [editingTimelogData]);

  const handleEditLog = (log) => {
    dispatch(setEditingTimelog(log));
  };

  const handleDeleteLog = (logId) => {
    dispatch(deleteTimesheetRequest(logId));
  };

  const handleCloseTimelogDrawer = useCallback(() => {
    setAddTimelogDrawerOpen(false);
    dispatch(clearEditingTimelog());
    setTimelogPrefillData(null);
  }, [dispatch]);

  const handleAddTimelogFromTask = useCallback((task) => {
    if (task.projectId || task.taskListId) {
      setTimelogPrefillData({
        id: task.projectId || task.taskListId,
        taskLists: [
          {
            tasks: [
              {
                id: task.id || task.taskId,
                taskName: task.title || task.taskName
              }
            ]
          }
        ]
      });
    }
    setAddTimelogDrawerOpen(true);
  }, []);

  const handleAddOrUpdateTimelog = (logData, isEditing) => {
    if (isEditing) {
      dispatch(updateTimesheetRequest({ timesheetId: logData.id, timesheetData: logData }));
    } else {
      dispatch(createTimesheetRequest(logData));
    }
    handleCloseTimelogDrawer();
  };

  const priorityOptions = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 },
  ];

  // Pagination and sorting
  const pagination = {
    pageNumber: query.page,
    pageSize: query.pageSize,
    totalCount: reduxTaskItems.totalCount || 0,
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
    dispatch(clearTaskProjectContext());
  }, [dispatch]);

  useEffect(() => {
    const modalQuery = createModalQuery();
    dispatch(setUsersQuery(modalQuery));
  }, [createModalQuery, dispatch]);

  // Initial fetch effect
  useEffect(() => {
    if (detailsError) {
      toast.error(`Error loading task details: ${detailsError}`);
      dispatch(clearTasksError()); // Or a new clearDetailsError
    }
  }, [detailsError, dispatch]);

  useEffect(() => {
    if (query?.pageSize < 10) {
      dispatch(setTasksQuery({ ...query, pageSize: 10 }));
    }
  }, [query?.pageSize, dispatch]);

  useEffect(() => {
    if (isAuthenticated && !tasksLoading && !hasFetchedInitial) {
      dispatch(fetchUserTasksRequest(query));
      setHasFetchedInitial(true);
    }
  }, [isAuthenticated, tasksLoading, hasFetchedInitial, dispatch, query]);

  useEffect(() => {
    if (isAuthenticated && hasFetchedInitial && currentUser) {
      if (currentView === 'list' || currentView === 'kanban' || currentView === 'todo' || currentView === 'all') {
        if (query.isAllTasks) {
          dispatch(fetchAllTasksRequest(query));
        } else {
          dispatch(fetchUserTasksRequest(query));
        }
      }
    }
  }, [query, dispatch, isAuthenticated, hasFetchedInitial, currentView, currentUser]);

  useEffect(() => {
    if (currentView === 'timesheet' && previousView !== 'timesheet' && currentUser && isAuthenticated) {
      const freshTimesheetQuery = {
        pageNumber: 1,
        pageSize: 10,
        sortBy: '',
        sortOrder: '',
        search: '',
        userId: currentUser.id,
        projectId: null,
        taskId: null,
        memberUserId: '',
        loggedAtFrom: '',
        loggedAtTo: '',
        durationFrom: '',
        durationTo: '',
        startDateFrom: null,
        endDateTo: null,
      };

      dispatch(setTimesheetsQuery(freshTimesheetQuery));
      dispatch(getFilteredTimelogsRequest(freshTimesheetQuery));
    }
  }, [currentView, previousView, currentUser, dispatch, isAuthenticated]);

  useEffect(() => {
    if (currentView === 'timesheet' && previousView === 'timesheet' && currentUser && isAuthenticated) {
      const queryWithUser = {
        ...timesheetQuery,
        userId: timesheetQuery.userId || currentUser.id,
      };
      dispatch(getFilteredTimelogsRequest(queryWithUser));
    }
  }, [timesheetQuery, currentView, previousView, currentUser, dispatch, isAuthenticated]);

  // ============================================================================
  // Transform tasks with multi-assignee support
  // ============================================================================
  const transformedTasks = useMemo(() => {
    console.log('🔄 Transforming tasks, count:', reduxTaskItems.items?.length);

    return (reduxTaskItems.items || []).map((task) => {
      // Get assignees using helper function
      const taskAssignees = getAssigneesFromTask(task);

      console.log(`Task ${task.taskId} (${task.title}) assignees:`, {
        hasAssignedUsers: !!task.assignedUsers,
        assignedUsersCount: task.assignedUsers?.length || 0,
        transformedCount: taskAssignees.length,
        assignees: taskAssignees
      });

      return {
        id: task.taskId,
        taskId: task.taskId,
        taskName: task.title,
        status: task.statusName,
        statusId: task.statusId,
        startDate: task.startDate,
        dueDate: task.endDate,
        priority: task.priorityName,
        priorityId: task.priorityId,
        completion: task.progression || 0,
        description: task.description,
        taskListId: task.taskListId,
        projectId: task.projectId,
        projectName: task.name,

        // Legacy fields (for backward compatibility)
        assignedToUserId: task.assignedToUserId,
        assignedToUserName: task.assignedToUserName,
        assignedToUserAvatarUrl: task.assignedToUserAvatarUrl ? `${ASSETS_BASE_URL}${task.assignedToUserAvatarUrl}` : null,

        estimatedHours: task.estimatedHours,

        // CRITICAL: Use the helper function result
        assignees: taskAssignees,

        // Store original assignedUsers for edit operations
        assignedUsers: task.assignedUsers || null,
      };
    });
  }, [reduxTaskItems.items]);

  useEffect(() => {
    if (!optimisticUpdatePending.current) {
      setLocalAllTasks(transformedTasks);
    }
  }, [transformedTasks]);

  const allTimelogs = useMemo(() => timesheetData?.items || [], [timesheetData]);

  const taskFilterSections = useMemo(() => {
    const statusOptions = statusData.map((status) => ({
      key: status.name,
      label: status.name
    }));

    const memberOptions = userList.items?.map((user) => ({
      key: user.userId,
      label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
    })) || [];

    const sections = [
      {
        type: 'sort',
        key: 'sort',
        title: 'Sort Tasks',
        options: [
          { key: 'title', label: 'Task Name' },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'createdAt', label: 'Creation Date' },
        ],
      },
      {
        type: 'statusNames',
        key: 'statusNames',
        title: 'Filter by Status',
        allLabel: 'All Tasks',
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

    // Add member filter only when viewing All Tasks (company-wide view)
    if (query.isAllTasks && memberOptions.length > 0) {
      sections.push({
        type: 'member',
        key: 'memberUserIds',
        title: 'Filter by Assignee',
        id: 'memberUserIds',
        options: memberOptions,
      });
    }

    return sections;
  }, [statusData, userList, currentUser, query.isAllTasks]);

  const timesheetFilterSections = useMemo(() => {
    const memberOptions = userList.items?.map((user) => ({
      key: user.userId,
      label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
    })) || [];

    const sections = [
      {
        type: 'sort',
        key: 'sort',
        title: 'Sort Timesheet',
        options: [
          { key: 'loggedAt', label: 'Logged At' },
          { key: 'duration', label: 'Duration' },
        ],
      },
      {
        type: 'keyword',
        key: 'search',
        title: 'Filter by Keyword',
      },
    ];
    return sections;
  }, [currentUser, userList]);

  const initialTaskSelection = useMemo(() => ({
    sortBy: query.sortBy || null,
    sortOrder: query.sortOrder || null,
    statusNames: typeof query.statusNames === 'string' && query.statusNames ?
      query.statusNames.split(',') : [],
    memberUserIds: typeof query.memberUserIds === 'string' && query.memberUserIds
      ? query.memberUserIds.split(',') : [],
    search: query.search || null,
    startDateFrom: query.startDateFrom || null,
    endDateTo: query.endDateTo || null,
    durationPreset: query.durationPreset || null,
  }), [query]);

  const initialTimesheetSelection = useMemo(() => ({
    sortBy: timesheetQuery.sortBy || null,
    sortOrder: timesheetQuery.sortOrder || null,
    memberUserId: timesheetQuery.userId || null,
    search: timesheetQuery.search || '',
    loggedAtFrom: timesheetQuery.loggedAtFrom || '',
    loggedAtTo: timesheetQuery.loggedAtTo || '',
    durationFrom: timesheetQuery.durationFrom || '',
    durationTo: timesheetQuery.durationTo || '',
    startDateFrom: timesheetQuery.startDateFrom || null,
    endDateTo: timesheetQuery.endDateTo || null,
    durationPreset: null,
  }), [timesheetQuery]);

  const toggleAddTaskDrawer = (open) => () => {
    setAddTaskDrawerOpen(open);
    if (!open) {
      dispatch(clearEditingTaskState());
    }
  };

  const toggleAddTodoDrawer = (open) => () => {
    setAddTodoDrawerOpen(open);
    if (!open) {
      dispatch(clearEditingTaskState());
    }
  };

  const toggleAdvancedSortDrawer = (open) => () => {
    setAdvancedSortDrawerOpen(open);
  };

  const toggleFilterTimesheetDrawer = (open) => () => {
    setFilterTimesheetDrawerOpen(open);
  };

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setTasksQuery({ ...query, search: value, page: 1 }));
    }, 400);
  }, [dispatch, query]);

  const handleRemoveFilter = useCallback((filterKey) => {
    let newQuery = { ...query, page: 1 };
    if (filterKey === 'statusNames') {
      newQuery.statusNames = '';
    } else if (filterKey === 'search') {
      newQuery.search = '';
      setSearchInput('');
    } else if (filterKey === 'dateRange') {
      newQuery.startDateFrom = null;
      newQuery.endDateTo = null;
    } else if (filterKey === 'sortBy') {
      newQuery.sortBy = '';
      newQuery.sortOrder = '';
    } else if (filterKey === 'memberUserIds') {
      newQuery.memberUserIds = '';
    } else {
      newQuery[filterKey] = null;
    }
    dispatch(setTasksQuery(newQuery));
  }, [dispatch, query]);

  const handleClearAllFilters = useCallback(() => {
    setSearchInput('');
    dispatch(setTasksQuery({
      ...query,
      sortBy: '',
      sortOrder: '',
      statusNames: '',
      search: '',
      startDateFrom: null,
      endDateTo: null,
      memberUserIds: '',
      page: 1,
    }));
  }, [dispatch, query]);

  const handleCreateTask = (taskData) => {
    dispatch(createTaskRequest(taskData));
  };

  // ============================================================================
  // UPDATED: handleTaskStatusChange with multi-assignee support
  // ============================================================================
  const handleTaskStatusChange = (taskListId, taskId, newStatusName) => {
    const originalTasks = [...localAllTasks];
    const taskToUpdateOriginal = reduxTaskItems.items?.find(t => t.taskId === taskId);

    if (taskToUpdateOriginal) {
      const statusOption = statusData.find(status => status.name === newStatusName);
      if (!statusOption) return;
      const statusId = statusOption?.statusId || statusOption?.id;

      optimisticUpdatePending.current = true;

      setLocalAllTasks(prevTasks =>
        prevTasks.map(task =>
          task.taskId === taskId ? { ...task, status: newStatusName, statusId: statusId } : task
        )
      );

      const priorityIdToSend = taskToUpdateOriginal.priorityId ??
        (priorityOptions.find(p => p.label === taskToUpdateOriginal.priorityName)?.value || 2);

      // UPDATED: Extract all assignee IDs instead of single assignedToUserId
      const assigneeIdsToSend = extractAssigneeIds(taskToUpdateOriginal);

      const apiPayload = {
        title: taskToUpdateOriginal.title,
        statusId: statusId,
        startDate: taskToUpdateOriginal.startDate,
        endDate: taskToUpdateOriginal.endDate,
        priorityId: priorityIdToSend,
        description: taskToUpdateOriginal.description || '',
        taskListId: taskToUpdateOriginal.taskListId,
        // UPDATED: Send array of assignee IDs
        assignedUserIds: assigneeIdsToSend.length > 0 ? assigneeIdsToSend : [currentUser.id],
        estimatedHours: taskToUpdateOriginal.estimatedHours || 0,
      };

      dispatch(updateTaskRequest({
        taskId,
        taskData: apiPayload,
        onSuccess: () => {
          optimisticUpdatePending.current = false;
        },
        onFailure: (error) => {
          toast.error(`Failed to update task: ${error}`);
          setLocalAllTasks(originalTasks);
          optimisticUpdatePending.current = false;
        }
      }));
    }
  };

  // ============================================================================
  // UPDATED: handleEditTask - Fetch full task data before opening drawer
  // ============================================================================
  const handleEditTask = (task) => {
    console.log('✏️ Edit task clicked, fetching full data for taskId:', task.id);
    setIsEditingTask(true);
    dispatch(getTaskDetailsById(task.id));

    // Check if this is a to-do (no project or task list)
    const isTodo = (!task.projectId || task.projectId === 0) &&
      (!task.taskListId || task.taskListId === 0);

    if (isTodo) {
      setAddTodoDrawerOpen(true);
    } else {
      setAddTaskDrawerOpen(true);
    }
  };

  const handleDeleteTask = (taskListId, taskId) => {
    dispatch(deleteTaskRequest({ taskId }));
  };

  // ============================================================================
  // CRITICAL UPDATE: handleTaskClick - Fetch full task data before opening modal
  // ============================================================================
  const handleTaskClick = (task) => {
    // CRITICAL: Fetch fresh task data with full assignedUsers array
    console.log('🖱️ Task clicked, fetching full data for taskId:', task.id);
    dispatch(getTaskDetailsById(task.id));

    // Find the task from Redux items (might have partial data)
    const originalTask = reduxTaskItems.items?.find(t => t.taskId === task.id);

    // Set as selected (will be updated when getTaskByIdSuccess fires)
    setSelectedTaskForDetail(originalTask);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTaskForDetail(null);
  };

  // ============================================================================
  // UPDATED: handleUpdateTaskFromModal with multi-assignee support
  // ============================================================================
  const handleUpdateTaskFromModal = (updatedTaskData) => {
    const taskToUpdate = reduxTaskItems.items?.find(t => t.taskId === updatedTaskData.id);
    if (taskToUpdate) {
      const statusOption = statusData.find(status => status.name === updatedTaskData.statusName);
      const priorityOption = priorityOptions.find(priority => priority.value === updatedTaskData.priority);

      // UPDATED: Extract assignee IDs or use provided ones
      const assigneeIdsToSend = updatedTaskData.assignedUserIds
        || extractAssigneeIds(taskToUpdate);

      const taskData = {
        title: updatedTaskData.title,
        statusId: statusOption?.statusId || statusOption?.id,
        startDate: updatedTaskData.startDate,
        endDate: updatedTaskData.endDate,
        priorityId: priorityOption?.value || 2,
        description: updatedTaskData.description || '',
        taskListId: updatedTaskData.taskListId,
        // UPDATED: Send array of assignee IDs
        assignedUserIds: assigneeIdsToSend.length > 0 ? assigneeIdsToSend : [currentUser.id],
        estimatedHours: updatedTaskData.estimatedHours || 0,
      };
      dispatch(updateTaskRequest({ taskId: updatedTaskData.id, taskData }));
    }
  };

  const handleRetry = () => {
    dispatch(clearTasksError());
    dispatch(fetchUserTasksRequest(query));
  };

  const handleTimesheetRetry = () => {
    dispatch(getFilteredTimelogsRequest(timesheetQuery))
  };

  const handleViewChange = (_, newView) => {
    if (newView !== null && newView !== currentView) {
      setPreviousView(currentView);
      setCurrentView(newView);

      // Update Redux query to keep it in sync with the view
      let newQuery = { ...query, page: 1 };

      if (newView === 'all') {
        newQuery.isAllTasks = true;
        newQuery.type = 'tasks';
      } else if (newView === 'todo') {
        newQuery.isAllTasks = false;
        newQuery.type = 'todos';
      } else {
        // list or kanban
        newQuery.isAllTasks = false;
        newQuery.type = 'tasks';
      }

      dispatch(setTasksQuery(newQuery));
    }
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
        memberUserIds: '',
        page: 1,
      };
    } else {
      const updatedFilters = { ...filtersPayload };

      if (Array.isArray(updatedFilters.statusNames) && updatedFilters.statusNames.length > 0) {
        updatedFilters.statusNames = updatedFilters.statusNames.join(',');
      } else if (Array.isArray(updatedFilters.statusNames) && updatedFilters.statusNames.length === 0) {
        updatedFilters.statusNames = '';
      }

      if (Array.isArray(updatedFilters.memberUserIds) && updatedFilters.memberUserIds.length > 0) {
        updatedFilters.memberUserIds = updatedFilters.memberUserIds.join(',');
      } else if (Array.isArray(updatedFilters.memberUserIds) && updatedFilters.memberUserIds.length === 0) {
        updatedFilters.memberUserIds = '';
      }

      newQueryState = { ...newQueryState, ...updatedFilters, page: 1 };
      if (updatedFilters.search !== undefined) {
        setSearchInput(updatedFilters.search || '');
      }
    }

    dispatch(setTasksQuery(newQueryState));
    setAdvancedSortDrawerOpen(false);
  }, [dispatch, query]);

  const handlePageChange = useCallback((event, newPage) => {
    dispatch(setTasksQuery({ ...query, page: newPage + 1 }));
  }, [dispatch, query]);

  const handleRowsPerPageChange = useCallback((event) => {
    dispatch(setTasksQuery({ ...query, page: 1, pageSize: parseInt(event.target.value, 10) }));
  }, [dispatch, query]);

  const handleTimesheetPageChange = useCallback((event, newPage) => {
    dispatch(setTimesheetsQuery({ ...timesheetQuery, pageNumber: newPage + 1 }));
  }, [dispatch, timesheetQuery]);

  const handleTimesheetRowsPerPageChange = useCallback((event) => {
    dispatch(setTimesheetsQuery({ ...timesheetQuery, pageNumber: 1, pageSize: parseInt(event.target.value, 10) }));
  }, [dispatch, timesheetQuery]);

  const handleSortRequest = useCallback((sortField) => {
    const isAsc = query.sortBy === sortField && query.sortOrder === 'asc';
    const sortOrder = isAsc ? 'desc' : 'asc';
    dispatch(setTasksQuery({ ...query, sortBy: sortField, sortOrder, page: 1 }));
  }, [dispatch, query]);

  const handleTimesheetSortRequest = useCallback((sortField) => {
    const isAsc = timesheetQuery.sortBy === sortField && timesheetQuery.sortOrder === 'asc';
    const sortOrder = isAsc ? 'desc' : 'asc';
    dispatch(setTimesheetsQuery({ ...timesheetQuery, sortBy: sortField, sortOrder, pageNumber: 1 }));
  }, [dispatch, timesheetQuery]);

  const handleApplyTimesheetFilters = useCallback((filters) => {

    const defaultQuery = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: '',
      sortOrder: '',
      userId: currentUser?.id || null,
      projectId: null,
      taskId: null,
      memberUserIds: '',
      search: '',
      loggedAtFrom: '',
      loggedAtTo: '',
      durationFrom: '',
      durationTo: '',
      startDateFrom: null,
      endDateTo: null,
    };

    if (Object.keys(filters).length === 0) {
      dispatch(setTimesheetsQuery(defaultQuery));
      setFilterTimesheetDrawerOpen(false);
      return;
    }

    const processedFilters = { ...filters };

    if (processedFilters.memberUserIds) {
      processedFilters.userId = processedFilters.memberUserIds;
      delete processedFilters.memberUserIds;
    }

    if (processedFilters.startDateFrom) {
      processedFilters.startDateFrom = processedFilters.startDateFrom instanceof Date
        ? processedFilters.startDateFrom.toISOString().split('T')[0]
        : processedFilters.startDateFrom;
    }

    if (processedFilters.endDateTo) {
      processedFilters.endDateTo = processedFilters.endDateTo instanceof Date
        ? processedFilters.endDateTo.toISOString().split('T')[0]
        : processedFilters.endDateTo;
    }

    if (processedFilters.loggedAtFrom) {
      processedFilters.loggedAtFrom = processedFilters.loggedAtFrom instanceof Date
        ? processedFilters.loggedAtFrom.toTimeString().split(' ')[0]
        : processedFilters.loggedAtFrom;
    }

    if (processedFilters.loggedAtTo) {
      processedFilters.loggedAtTo = processedFilters.loggedAtTo instanceof Date
        ? processedFilters.loggedAtTo.toTimeString().split(' ')[0]
        : processedFilters.loggedAtTo;
    }

    if (processedFilters.durationFrom) {
      const duration = parseFloat(processedFilters.durationFrom);
      processedFilters.durationFrom = !isNaN(duration) ? duration.toString() : '';
    }

    if (processedFilters.durationTo) {
      const duration = parseFloat(processedFilters.durationTo);
      processedFilters.durationTo = !isNaN(duration) ? duration.toString() : '';
    }

    Object.keys(processedFilters).forEach(key => {
      if (processedFilters[key] === null || processedFilters[key] === '' ||
        (Array.isArray(processedFilters[key]) && processedFilters[key].length === 0)) {
        delete processedFilters[key];
      }
    });

    const finalQuery = { ...defaultQuery, ...processedFilters };
    dispatch(setTimesheetsQuery(finalQuery));
    setFilterTimesheetDrawerOpen(false);
  }, [dispatch, currentUser]);

  const handleExportTasks = async () => {
    setExportLoading(true);
    try {
      const exportParams = {
        ...query,
        page: 1,
        pageSize: 10000,
      };

      let response;
      if (query.isAllTasks || currentView === 'all') {
        response = await TaskAPI.getCompanyTasks(exportParams);
      } else {
        response = await TaskAPI.getAllTasksForUser(exportParams);
      }

      const tasksList = response.data?.data?.items || response.data?.items || [];

      if (tasksList.length === 0) {
        toast.error('No tasks found to export.');
        setExportLoading(false);
        return;
      }

      const getAssigneesName = (task) => {
        const assignees = getAssigneesFromTask(task);
        if (assignees.length === 0) return 'Unassigned';
        return assignees.map(a => a.name).join(', ');
      };

      tasksList.sort((a, b) => {
        const nameA = getAssigneesName(a);
        const nameB = getAssigneesName(b);
        const nameCompare = nameA.localeCompare(nameB);
        if (nameCompare !== 0) return nameCompare;

        const dateA = a.startDate || a.endDate || a.dueDate || '';
        const dateB = b.startDate || b.endDate || b.dueDate || '';
        return dateB.localeCompare(dateA);
      });

      const exportRows = tasksList.map((task, index) => {
        const startDateFormatted = task.startDate ? format(parseISO(task.startDate), 'dd/MM/yyyy') : 'N/A';
        const dueDateFormatted = (task.endDate || task.dueDate) ? format(parseISO(task.endDate || task.dueDate), 'dd/MM/yyyy') : 'N/A';

        return {
          'S.No': index + 1,
          'Task Name': task.title || task.taskName || 'N/A',
          'Project': task.name || task.projectName || 'To-Do',
          'Assigned To': getAssigneesName(task),
          'Status': task.statusName || task.status || 'N/A',
          'Priority': task.priorityName || task.priority || 'Medium',
          'Start Date': startDateFormatted,
          'Due Date': dueDateFormatted,
          'Progress': `${task.progression || task.completion || 0}%`
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

      const maxColumnWidths = {};
      exportRows.forEach(row => {
        Object.keys(row).forEach(key => {
          const val = row[key] ? row[key].toString() : '';
          const len = val.length;
          if (!maxColumnWidths[key] || len > maxColumnWidths[key]) {
            maxColumnWidths[key] = len;
          }
        });
      });
      worksheet['!cols'] = Object.keys(maxColumnWidths).map(key => ({
        wch: Math.max(maxColumnWidths[key] + 3, 10)
      }));

      const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const fileName = `Tasks_Export_${dateStr}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      // toast.success('Tasks exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export tasks to Excel.');
    } finally {
      setExportLoading(false);
    }
  };

  const shouldShowFullScreenLoader = authLoading || (tasksLoading && !hasFetchedInitial);

  const renderSearchBar = () => (
    <TextField
      size="small"
      placeholder="Search tasks..."
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
            <IconButton size="small" onClick={() => { setSearchInput(''); dispatch(setTasksQuery({ ...query, search: '', page: 1 })); }}>
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </InputAdornment>
        ) : null,
        sx: { borderRadius: '8px' }
      }}
      sx={{ width: { xs: '150px', sm: '350px' } }}
    />
  );

  const renderActiveFilters = () => {
    const chips = [];
    const statusNames = query.statusNames ? (typeof query.statusNames === 'string' ? query.statusNames.split(',').filter(Boolean) : query.statusNames) : [];
    const hasDateRange = query.startDateFrom || query.endDateTo;
    const hasSortBy = query.sortBy;
    const memberUserIds = query.memberUserIds ? (typeof query.memberUserIds === 'string' ? query.memberUserIds.split(',').filter(Boolean) : query.memberUserIds) : [];

    statusNames.forEach(status => {
      chips.push({
        key: `status_${status}`, label: `Status: ${status}`, onDelete: () => {
          const remaining = statusNames.filter(s => s !== status);
          dispatch(setTasksQuery({ ...query, statusNames: remaining.join(','), page: 1 }));
        }
      });
    });

    if (hasSortBy) {
      const sortLabel = { title: 'Task Name', dueDate: 'Due Date', createdAt: 'Creation Date' }[query.sortBy] || query.sortBy;
      chips.push({ key: 'sortBy', label: `Sort: ${sortLabel} (${query.sortOrder || 'asc'})`, onDelete: () => handleRemoveFilter('sortBy') });
    }

    if (hasDateRange) {
      const from = query.startDateFrom || '';
      const to = query.endDateTo || '';
      chips.push({ key: 'dateRange', label: `Date: ${from}${from && to ? ' → ' : ''}${to}`, onDelete: () => handleRemoveFilter('dateRange') });
    }

    if (memberUserIds.length > 0) {
      // Resolve names from userList for each selected ID
      memberUserIds.forEach(userId => {
        const user = userList.items?.find(u => String(u.userId) === String(userId));
        const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userEmail : userId;
        chips.push({
          key: `member_${userId}`,
          label: `Assignee: ${name}`,
          onDelete: () => {
            const remaining = memberUserIds.filter(id => String(id) !== String(userId));
            dispatch(setTasksQuery({ ...query, memberUserIds: remaining.join(','), page: 1 }));
          }
        });
      });
    }

    if (chips.length === 0) return null;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mt: 1, mb: 0.5 }}>
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

  const renderHeaderActions = () => {
    if (currentView === 'list') {
      return (
        <>
          {(currentView === 'list' || currentView === 'all') && renderActiveFilters()}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExportTasks}
            disabled={exportLoading}
            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap', mr: 1.5 }}
          >
            Export
          </Button>
          <Tooltip title={!canCreateTask ? "You don't have permission to add task" : ""} arrow>
            <Box component="span">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={toggleAddTaskDrawer(true)}
                disabled={!canCreateTask}
                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
              >
                Add My Task
              </Button>
            </Box>
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
    }
    if (currentView === 'kanban') {
      return (
        <>
          <Tooltip title={!canCreateTask ? "You don't have permission to add task" : ""} arrow>
            <Box component="span">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={toggleAddTaskDrawer(true)}
                disabled={!canCreateTask}
                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
              >
                Add My Task
              </Button>
            </Box>
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
    }
    if (currentView === 'all') {
      return (
        <>
          {(currentView === 'list' || currentView === 'all') && renderActiveFilters()}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExportTasks}
            disabled={exportLoading}
            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap', mr: 1.5 }}
          >
            Export
          </Button>
          <Tooltip title={!canCreateTask ? "You don't have permission to add task" : ""} arrow>
            <Box component="span">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={toggleAddTaskDrawer(true)}
                disabled={!canCreateTask}
                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
              >
                Add Task
              </Button>
            </Box>
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
    }
    if (currentView === 'todo') {
      return (
        <>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExportTasks}
            disabled={exportLoading}
            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap', mr: 1.5 }}
          >
            Export
          </Button>
          <Tooltip title={!canCreateTask ? "You don't have permission to add task" : ""} arrow>
            <Box component="span">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={toggleAddTodoDrawer(true)}
                disabled={!canCreateTask}
                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
              >
                Add To-Do
              </Button>
            </Box>
          </Tooltip>
        </>
      );
    }
    if (currentView === 'timesheet') {
      return (
        <>
          <Tooltip title={canCreateTimelog ? '' : "You don't have permission to add timelogs."}>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setAddTimelogDrawerOpen(true)}
                disabled={!canCreateTimelog}
                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
              >
                Add Timelog
              </Button>
            </span>
          </Tooltip>
          <IconButton
            onClick={toggleFilterTimesheetDrawer(true)}
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
    }
    return null;
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'list':
        return 'My Tasks';
      case 'todo':
        return 'My To-dos';
      case 'kanban':
        return 'Kanban Board';
      case 'timesheet':
        return 'Timesheet';
      case 'all':
        return 'All Tasks';
      default:
        return 'My Tasks';
    }
  };

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

    if (taskError && !optimisticUpdatePending.current) {
      return (
        <ErrorBoundary
          error={taskError}
          onRetry={handleRetry}
          onDismiss={() => navigate('/tasks')}
          title="Failed to Load Tasks"
          showInline={false}
          showImage={true}
        />
      );
    }

    switch (currentView) {
      case 'list':
      case 'all':
        return (
          <TaskTable
            tasks={localAllTasks}
            isLoading={tasksLoading}
            pagination={pagination}
            sorting={sorting}
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTaskStatusChange={handleTaskStatusChange}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortRequest={handleSortRequest}
            onAddTimelog={handleAddTimelogFromTask}
          />
        );
      case 'todo':
        return (
          <TaskTable
            tasks={localAllTasks}
            isLoading={tasksLoading}
            pagination={pagination}
            sorting={sorting}
            onTaskClick={handleTaskClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTaskStatusChange={handleTaskStatusChange}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortRequest={handleSortRequest}
            onAddTimelog={handleAddTimelogFromTask}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            tasks={localAllTasks}
            onTaskCardClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
          />
        );
      case 'timesheet':
        if (timesheetLoading && allTimelogs.length === 0) {
          return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
        }
        if (timesheetError) {
          const errorMsg = typeof timesheetError === 'string' ? timesheetError : timesheetError?.message || '';

          // Hide technical 500 errors or permission issues for a better UX
          if (errorMsg.includes('500') || errorMsg.includes('403') || errorMsg.includes('permission')) {
            return (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 10,
                textAlign: 'center',
                px: 2
              }}>
                <Box
                  component="img"
                  src="/static/images/error/error-403.svg"
                  sx={{ width: '100%', maxWidth: 280, mb: 2, opacity: 0.8 }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Access Restricted
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                  You don't have the necessary permissions to view these timelogs.
                  Please contact your administrator if you believe this is an error.
                </Typography>
              </Box>
            );
          }

          return (
            <ErrorBoundary
              error={timesheetError}
              onRetry={handleTimesheetRetry}
              onDismiss={() => navigate('/tasks')}
              title="Failed to Load Timesheet"
              showInline={false}
              showImage={true}
            />
          );
        }
        return (
          <UserTimesheetView
            timelogs={allTimelogs}
            pagination={{
              pageNumber: timesheetQuery.pageNumber,
              pageSize: timesheetQuery.pageSize,
              totalCount: timesheetData?.totalCount || 0,
            }}
            sorting={{
              sortField: timesheetQuery.sortBy,
              sortOrder: timesheetQuery.sortOrder,
            }}
            onPageChange={handleTimesheetPageChange}
            onRowsPerPageChange={handleTimesheetRowsPerPageChange}
            onSortRequest={handleTimesheetSortRequest}
            onEditLog={handleEditLog}
            onDeleteLog={handleDeleteLog}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: gridSpacing / 2 }}>
        {/* Search bar on the left — only shown for task views */}
        {(currentView === 'list' || currentView === 'all') ? renderSearchBar() : <Box />}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <ToggleButtonGroup
            value={currentView}
            exclusive
            onChange={handleViewChange}
            aria-label="task view"
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              padding: '4px',
              borderRadius: '12px',
              border: 'none',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '10px !important',
                color: 'text.secondary',
                px: 2,
                py: 0.75,
                mx: 0.25,
                transition: 'all 0.25s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              }
            }}
          >
            <ToggleButton
              value="todo"
              aria-label="todo view"
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#ecfdf5 !important',
                  color: '#059669 !important',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)',
                }
              }}
            >
              <PlaylistAddCheckIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                My To-dos
              </Typography>
            </ToggleButton>
            <ToggleButton
              value="list"
              aria-label="list view"
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#eff6ff !important',
                  color: '#2563eb !important',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                }
              }}
            >
              <ViewListIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                My Tasks
              </Typography>
            </ToggleButton>
            <Can perform="task:read:all">
              <ToggleButton
                value="all"
                aria-label="all view"
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#f5f3ff !important',
                    color: '#7c3aed !important',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
                  }
                }}
              >
                <PeopleAltIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                  All Tasks
                </Typography>
              </ToggleButton>
            </Can>
            <ToggleButton
              value="kanban"
              aria-label="kanban view"
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#fff7ed !important',
                  color: '#ea580c !important',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.15)',
                }
              }}
            >
              <ViewKanbanIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                Kanban
              </Typography>
            </ToggleButton>
            <ToggleButton
              value="timesheet"
              aria-label="timesheet view"
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#f0fdfa !important',
                  color: '#0d9488 !important',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.15)',
                }
              }}
            >
              <TimerIcon sx={{ mr: { xs: 0, sm: 0.5 } }} />
              <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                Timesheet
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <ViewHeader title={getHeaderTitle()}>
        {renderHeaderActions()}
      </ViewHeader>

      <Box sx={{ mt: gridSpacing }}>
        {renderCurrentView()}
      </Box>

      <AddTaskDrawer
        open={isAddTaskDrawerOpen}
        onClose={() => {
          setAddTaskDrawerOpen(false);
          setIsEditingTask(false);
          dispatch(clearEditingTaskState());
        }}
        onSubmitCreate={handleCreateTask}
        editingTask={editingTaskData}
        isEditMode={isEditingTask}
        isMyTasksView={currentView === 'list' || currentView === 'kanban'}
      />

      <AddTaskDrawer
        open={isAddTodoDrawerOpen}
        onClose={() => {
          setAddTodoDrawerOpen(false);
          setIsEditingTask(false);
          dispatch(clearEditingTaskState());
        }}
        isTodo={true}
        editingTask={editingTaskData}
        isEditMode={isEditingTask}
      />

      <AdvancedSortDrawer
        open={isAdvancedSortDrawerOpen}
        onClose={toggleAdvancedSortDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={taskFilterSections}
        initialSelection={initialTaskSelection}
      />

      <AddTimelogDrawer
        open={isAddTimelogDrawerOpen}
        onClose={handleCloseTimelogDrawer}
        onSubmit={handleAddOrUpdateTimelog}
        editingLog={editingTimelogData}
        project={timelogPrefillData}
      />

      <AdvancedSortDrawer
        open={isFilterTimesheetDrawerOpen}
        onClose={toggleFilterTimesheetDrawer(false)}
        onConfirm={handleApplyTimesheetFilters}
        sections={timesheetFilterSections}
        initialSelection={initialTimesheetSelection}
      />

      {
        selectedTaskForDetail && (
          <TaskDetailModal
            open={isTaskDetailModalOpen}
            onClose={handleCloseTaskDetailModal}
            task={selectedTaskForDetail}
            onUpdateTask={handleUpdateTaskFromModal}
          />
        )
      }
    </Box >
  );
}
