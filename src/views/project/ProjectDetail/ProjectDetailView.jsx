import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Paper, Tabs, Tab, Avatar, AvatarGroup, Chip, CircularProgress, Tooltip, IconButton } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import Can from '../../../uiComponent/Can';
import TaskListTable from '../../tasklist/TaskListTable';
import AddTaskDrawer from '../../../components/addTask/AddTaskDrawer';
import AddTaskListDrawer from '../../../components/addTasklist/AddTaskListDrawer';
import TaskDetailModal from '../../task/taskDetail/TaskDetailModal';
import ProjectDashboard from './ProjectDashboard';
import UserTimesheetView from '../../timesheet/UserTimesheetView';
import AdvancedSortDrawer from '../../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from '../../../store/constant';
import { ASSETS_BASE_URL } from '../../../services/apiConstants';
import { getProjectByIdRequest, selectEditingProjectData, selectProjectsLoading, selectProjectsError, clearEditingState, selectStatusItems } from '../../../redux/features/projects/projectSlice';
import { updateTaskRequest, deleteTaskRequest, getTaskByIdRequest as getTaskDetailsById, clearEditingTaskState, selectTaskData } from '../../../redux/features/tasks/taskSlice';
import { createTaskListRequest, deleteTaskListRequest, updateTaskListRequest } from '../../../redux/features/tasklists/taskListSlice';
import { getFilteredTimelogsRequest, createTimesheetRequest, updateTimesheetRequest, deleteTimesheetRequest, setTimesheetsQuery, selectTimeSheetFilterLoading, selectTimeSheetFilterError, selectTimeSheetFilterTimeSheet, selectTimesheetsQuery } from '../../../redux/features/timesheet/timesheetSlice';
import { selectUser } from '../../../redux/features/auth/authSlice';
import AddTimelogDrawer from '../../../components/addTimesheet/AddTimelogDrawer';
import ProjectUserDropdown from './ProjectUserDropdown';
import { useCan } from '../../../hooks/useCan';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`project-tabpanel-${index}`} aria-labelledby={`project-tab-${index}`} {...other}>
            {value === index && (<Box sx={{ p: 2 }}>{children}</Box>)}
        </div>
    );
}
function a11yProps(index) {
    return { id: `project-tab-${index}`, 'aria-controls': `project-tabpanel-${index}` };
}
const projectHeaderStatusOptions = [
    { value: 'InProgress', label: 'In Progress', color: 'success.dark', bgColor: 'success.light' },
    { value: 'NotStarted', label: 'Not Started', color: 'warning.dark', bgColor: 'warning.light' },
    { value: 'Delayed', label: 'Delayed', color: 'error.dark', bgColor: 'error.light' },
    { value: 'Cancelled', label: 'Cancelled', color: 'error.dark', bgColor: 'error.light' },
    { value: 'Open', label: 'Open', color: 'info.dark', bgColor: 'info.light' },
    { value: 'Completed', label: 'Completed', color: 'primary.dark', bgColor: 'primary.light' },
    { value: 'Active', label: 'Active', color: 'success.dark', bgColor: 'success.light' },
];

export default function ProjectDetailView() {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const projectDataFromStore = useSelector(selectEditingProjectData);
    const isDetailLoading = useSelector(selectProjectsLoading);
    const error = useSelector(selectProjectsError);
    const editingTaskData = useSelector(selectTaskData);
    const detailedTaskData = useSelector(selectTaskData);
    const statusData = useSelector(selectStatusItems);
    const currentUser = useSelector(selectUser);
    const timelogsData = useSelector(selectTimeSheetFilterTimeSheet);
    const isTimelogLoading = useSelector(selectTimeSheetFilterLoading);
    const timelogError = useSelector(selectTimeSheetFilterError);
    const timesheetQuery = useSelector(selectTimesheetsQuery);

    const [project, setProject] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [isAddTaskDrawerOpen, setAddTaskDrawerOpen] = useState(false);
    const [activeTaskListIdForNewTask, setActiveTaskListIdForNewTask] = useState(null);
    const [isAddTaskListDrawerOpen, setAddTaskListDrawerOpen] = useState(false);
    const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
    const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);
    const [taskFilters, setTaskFilters] = useState({});
    const [editingTaskList, setEditingTaskList] = useState(null);
    const [selectedTimesheetUser, setSelectedTimesheetUser] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('loggedAt');
    const [isAddTimelogDrawerOpen, setAddTimelogDrawerOpen] = useState(false);
    const [selectedTimelogForEdit, setSelectedTimelogForEdit] = useState(null);
    const [isFilterTimesheetDrawerOpen, setFilterTimesheetDrawerOpen] = useState(false);

    const hasInitializedTimesheet = useRef(false);
    const lastTimesheetQueryRef = useRef(null);

    const priorityOptions = useMemo(() => [
        { label: 'Low', value: 1 },
        { label: 'Medium', value: 2 },
        { label: 'High', value: 3 },
    ], []);

    const { can } = useCan();
    const canViewAllTimesheets = useMemo(() => {
        return can('timelog:read:all');
    }, [can]);

    const isCurrentUserProjectMember = useMemo(() => {
        if (!currentUser || !project?.members) {
            return false;
        }
        const currentUserId = String(currentUser.id);
        return project.members.some(member => String(member.id) === currentUserId);
    }, [currentUser, project?.members]);
    const canCreateTimelog = can('timelog:create');

    useEffect(() => {
        if (projectId) {
            dispatch(getProjectByIdRequest(projectId));
        }
        return () => { dispatch(clearEditingState()); };
    }, [dispatch, projectId]);

    useEffect(() => {
        if (detailedTaskData && selectedTaskForDetail && (detailedTaskData.taskId === selectedTaskForDetail.taskId || detailedTaskData.taskId === selectedTaskForDetail.id)) {
            const enhancedTaskData = {
                ...selectedTaskForDetail,
                documents: detailedTaskData.documents || selectedTaskForDetail.documents || [],
                subtasks: detailedTaskData.subtasks || selectedTaskForDetail.subtasks || [],
                attachments: detailedTaskData.documents || selectedTaskForDetail.documents || [],
                comments: detailedTaskData.comments || [],
                activityLog: detailedTaskData.activityLog || [],
                timeTracked: detailedTaskData.timeTracked || 0,
                priority: detailedTaskData.priorityId || selectedTaskForDetail.priorityId || priorityOptions.find(p => p.label === selectedTaskForDetail.priorityName)?.value || 2,
            };
            setSelectedTaskForDetail(enhancedTaskData);
        }
    }, [detailedTaskData, priorityOptions]);

    const projectWithDetailedTasks = useMemo(() => {
        if (!projectDataFromStore) return null;

        const getStatusValue = (statusName) => {
            const statusMap = {
                'In Progress': 'InProgress',
                'InProgress': 'InProgress',
                'Not Started': 'NotStarted',
                'NotStarted': 'NotStarted',
                'Delayed': 'Delayed',
                'Cancelled': 'Cancelled',
                'Open': 'Open',
                'Completed': 'Completed',
                'Active': 'Active',
                // Backward compatibility with old status names
                'OnTrack': 'InProgress',
                'AtRisk': 'Delayed',
                'OffTrack': 'Delayed',
                'OnHold': 'Open'
            };
            return statusMap[statusName] || 'Open';
        };

        const members = (projectDataFromStore.projectMembers || []).map((member, index) => {
            const user = member.user;
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || `User ${index + 1}`;
            return {
                id: user.userId,
                name: fullName,
                avatarUrl: user.profilePhotoUrl ? `${ASSETS_BASE_URL}${user.profilePhotoUrl}` : null,
                email: user.email,
            };
        });

        const mapAssignees = (assignee) => {
            if (!assignee) return [];
            const name = `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email || "Unknown User";
            return [{
                id: assignee.userId,
                name,
                avatarUrl: assignee.profilePhotoUrl ? `${ASSETS_BASE_URL}${assignee.profilePhotoUrl}` : null,
            }];
        };

        const calculateTaskListProgress = (tasks) => {
            if (!tasks || tasks.length === 0) return 0;
            const totalProgress = tasks.reduce((sum, task) => sum + (task.progression || 0), 0);
            return Math.round(totalProgress / tasks.length);
        };

        const taskLists = (projectDataFromStore.taskLists || []).map(tl => ({
            id: tl.taskListId,
            name: tl.listName,
            taskCount: tl.tasks?.length || 0,
            overallProgress: calculateTaskListProgress(tl.tasks),
            startDate: tl.startDate || tl.createdAt,
            endDate: tl.endDate || tl.updatedAt,
            tasks: (tl.tasks || []).map(task => ({
                id: task.taskId,
                taskName: task.title || 'Untitled Task',
                status: task.statusName || 'Unknown',
                assignees: mapAssignees(task.assignedTo),
                startDate: task.startDate,
                dueDate: task.endDate,
                duration: `${task.estimatedHours || 0} hours`,
                priority: task.priorityName || 'Normal',
                completion: task.progression || 0,
                isChecked: false,
                taskId: task.taskId,
                title: task.title,
                description: task.description,
                statusName: task.statusName,
                endDate: task.endDate,
                priorityName: task.priorityName,
                priorityId: (() => {
                    const priorityOption = priorityOptions.find(p => p.label === task.priorityName);
                    return priorityOption?.value || 2;
                })(),
                companyId: task.companyId,
                taskListId: task.taskListId,
                estimatedHours: task.estimatedHours,
                actualHours: task.actualHours,
                taskOrder: task.taskOrder,
                isActive: task.isActive,
                createdAt: task.createdAt,
                assignedTo: task.assignedTo,
                progression: task.progression,
                parentTaskId: task.parentTaskId,
                documents: task.taskDocuments || [],
                subtasks: task.subTasks || [],
                attachments: task.taskDocuments || [],
                timeTracked: 0,
                assignedToUserId: task.assignedTo?.userId,
                assignedToUserName: task.assignedTo ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim() : null,
                projectId: projectDataFromStore.projectId,
                name: task.title,
            })).filter(Boolean),
        }));

        return {
            id: projectDataFromStore.projectId,
            projectName: projectDataFromStore.name,
            description: projectDataFromStore.description,
            members,
            status: getStatusValue(projectDataFromStore.status),
            timeSpent: 'N/A',
            deadline: projectDataFromStore.endDate,
            overallDeadlineFormatted: 'N/A',
            startDate: projectDataFromStore.startDate,
            projectDocuments: projectDataFromStore.projectDocuments || [],
            taskLists,
            originalProjectData: projectDataFromStore,
        };
    }, [projectDataFromStore, priorityOptions]);

    useEffect(() => {
        setProject(projectWithDetailedTasks);
    }, [projectWithDetailedTasks]);

    useEffect(() => {
        if (project && !selectedTimesheetUser && !hasInitializedTimesheet.current) {
            const initialUser = canViewAllTimesheets ? project.members[0]?.id : currentUser?.id;
            if (initialUser) {
                setSelectedTimesheetUser(initialUser);
                hasInitializedTimesheet.current = true;
            }
        }
    }, [project, canViewAllTimesheets, currentUser]);

    useEffect(() => {
        if (currentTab === 2 && projectId && selectedTimesheetUser) {
            const currentQueryKey = `${currentTab}-${projectId}-${page}-${rowsPerPage}-${orderBy}-${order}-${selectedTimesheetUser}`;

            if (lastTimesheetQueryRef.current === currentQueryKey) {
                return;
            }

            const queryParams = {
                pageNumber: page + 1,
                pageSize: rowsPerPage,
                sortBy: orderBy,
                sortOrder: order,
                userId: selectedTimesheetUser,
                projectId: projectId,
                ...(timesheetQuery?.search && { search: timesheetQuery.search }),
                ...(timesheetQuery?.loggedAtFrom && { loggedAtFrom: timesheetQuery.loggedAtFrom }),
                ...(timesheetQuery?.loggedAtTo && { loggedAtTo: timesheetQuery.loggedAtTo }),
                ...(timesheetQuery?.durationFrom && { durationFrom: timesheetQuery.durationFrom }),
                ...(timesheetQuery?.durationTo && { durationTo: timesheetQuery.durationTo }),
                ...(timesheetQuery?.startDateFrom && { startDateFrom: timesheetQuery.startDateFrom }),
                ...(timesheetQuery?.endDateTo && { endDateTo: timesheetQuery.endDateTo }),
            };

            lastTimesheetQueryRef.current = currentQueryKey;
            dispatch(setTimesheetsQuery(queryParams));
            dispatch(getFilteredTimelogsRequest(queryParams));
        }
    }, [currentTab, projectId, page, rowsPerPage, orderBy, order, selectedTimesheetUser, dispatch]);

    useEffect(() => {
        if (currentTab === 2 && projectId && selectedTimesheetUser && timesheetQuery) {
            const filterChangeKey = JSON.stringify({
                search: timesheetQuery.search,
                loggedAtFrom: timesheetQuery.loggedAtFrom,
                loggedAtTo: timesheetQuery.loggedAtTo,
                durationFrom: timesheetQuery.durationFrom,
                durationTo: timesheetQuery.durationTo,
                startDateFrom: timesheetQuery.startDateFrom,
                endDateTo: timesheetQuery.endDateTo,
            });

            if (lastTimesheetQueryRef.current !== filterChangeKey) {
                lastTimesheetQueryRef.current = filterChangeKey;
                setPage(0);

                const queryParams = {
                    pageNumber: 1,
                    pageSize: rowsPerPage,
                    sortBy: orderBy,
                    sortOrder: order,
                    userId: selectedTimesheetUser,
                    projectId: projectId,
                    ...timesheetQuery,
                };

                dispatch(getFilteredTimelogsRequest(queryParams));
            }
        }
    }, [timesheetQuery?.search, timesheetQuery?.loggedAtFrom, timesheetQuery?.loggedAtTo, timesheetQuery?.durationFrom, timesheetQuery?.durationTo, timesheetQuery?.startDateFrom, timesheetQuery?.endDateTo]);

    const handleTabChange = (event, newValue) => { setCurrentTab(newValue); };

    const toggleAddTaskListDrawer = (open) => () => {
        if (!open) { setEditingTaskList(null); }
        setAddTaskListDrawerOpen(open);
    };

    const handleCreateTaskList = (taskListData) => {
        dispatch(createTaskListRequest({ projectId, taskListData }));
        setAddTaskListDrawerOpen(false);
    };

    const handleUpdateTaskList = (taskListId, taskListData) => {
        dispatch(updateTaskListRequest({ projectId, taskListId, taskListData }));
        setAddTaskListDrawerOpen(false);
    };

    const handleDeleteTaskList = (taskListId) => {
        dispatch(deleteTaskListRequest({ projectId, taskListId }));
    };

    const handleEditTaskList = (taskList) => {
        setEditingTaskList(taskList);
        setAddTaskListDrawerOpen(true);
    };

    const handleTaskStatusChange = (taskListId, taskId, newStatusName) => {
        const taskList = project?.taskLists?.find(tl => tl.id === taskListId);
        const taskToUpdate = taskList?.tasks?.find(t => t.id === taskId);
        if (taskToUpdate) {
            const statusOption = statusData.find(status => status.name === newStatusName);
            const statusId = statusOption?.statusId || statusOption?.id;
            if (!statusId) {
                console.error(`Status "${newStatusName}" not found.`);
                return;
            }
            const priorityOption = priorityOptions.find(p => p.label === taskToUpdate.priorityName);
            const priorityId = priorityOption?.value || 2;
            const taskData = {
                title: taskToUpdate.title || taskToUpdate.taskName,
                statusId,
                priorityId,
                startDate: taskToUpdate.startDate,
                endDate: taskToUpdate.endDate || taskToUpdate.dueDate,
                description: taskToUpdate.description || '',
                taskListId,
                assignedToUserId: taskToUpdate.assignedToUserId,
                estimatedHours: taskToUpdate.estimatedHours || 0,
            };
            dispatch(updateTaskRequest({ taskId, projectId: projectDataFromStore.projectId, taskData }));
        }
    };

    const handleTaskClick = (taskData) => {
        setSelectedTaskForDetail(taskData);
        setTaskDetailModalOpen(true);
        if (taskData.taskId || taskData.id) {
            dispatch(getTaskDetailsById(taskData.taskId || taskData.id));
        }
    };

    const handleCloseTaskDetailModal = () => {
        setTaskDetailModalOpen(false);
        setSelectedTaskForDetail(null);
        dispatch(clearEditingTaskState());
        setTimeout(() => {
            dispatch(getProjectByIdRequest(projectId));
        }, 500);
    };

    const handleDeleteTask = (taskListId, taskId) => {
        dispatch(deleteTaskRequest({ taskId }));
    };

    const handleAddTaskClick = (taskListId = null) => {
        dispatch(clearEditingTaskState());
        setActiveTaskListIdForNewTask(taskListId);
        setAddTaskDrawerOpen(true);
    };

    const handleEditTask = (taskListId, taskId) => {
        dispatch(getTaskDetailsById(taskId));
        setActiveTaskListIdForNewTask(taskListId);
        setAddTaskDrawerOpen(true);
    };

    const handleToggleAddTaskDrawer = (open) => {
        setAddTaskDrawerOpen(open);
        if (!open) {
            dispatch(clearEditingTaskState());
            setActiveTaskListIdForNewTask(null);
        }
    };

    const handleUpdateTaskFromModal = useCallback((updatedTaskData) => {
        let taskToUpdate = null;
        if (project?.taskLists) {
            for (const taskList of project.taskLists) {
                const foundTask = taskList.tasks?.find(t => t.taskId === updatedTaskData.id || t.id === updatedTaskData.id);
                if (foundTask) {
                    taskToUpdate = foundTask;
                    break;
                }
            }
        }
        if (taskToUpdate) {
            const statusOption = statusData.find(status => status.name === updatedTaskData.statusName);
            const priorityOption = priorityOptions.find(priority => priority.value === updatedTaskData.priority);
            const taskData = {
                title: updatedTaskData.title || taskToUpdate.title,
                statusId: statusOption?.statusId || statusOption?.id || taskToUpdate.statusId,
                startDate: updatedTaskData.startDate || taskToUpdate.startDate,
                endDate: updatedTaskData.endDate || taskToUpdate.endDate,
                priorityId: priorityOption?.value || taskToUpdate.priorityId || 2,
                description: updatedTaskData.description || taskToUpdate.description || '',
                taskListId: updatedTaskData.taskListId || taskToUpdate.taskListId,
                assignedToUserId: updatedTaskData.assignedToUserId || taskToUpdate.assignedToUserId,
                estimatedHours: updatedTaskData.estimatedHours || taskToUpdate.estimatedHours || 0,
                actualHours: taskToUpdate.actualHours || 0,
                taskOrder: taskToUpdate.taskOrder || 1,
                timeTracked: updatedTaskData.timeTracked || 0,
            };
            dispatch(updateTaskRequest({ taskId: updatedTaskData.id, projectId: projectId, taskData }));
        }
    }, [dispatch, project, statusData, priorityOptions, projectId]);

    const handleApplyFilters = useCallback((filters) => {
        setTaskFilters(filters);
    }, []);

    const toggleAddTimelogDrawer = (open, logToEdit = null) => () => {
        setSelectedTimelogForEdit(logToEdit);
        setAddTimelogDrawerOpen(open);
    };

    const toggleFilterTimesheetDrawer = (open) => () => setFilterTimesheetDrawerOpen(open);

    const handleAddOrUpdateTimelog = useCallback((logData, isEditing) => {
        if (isEditing) {
            dispatch(updateTimesheetRequest({ timesheetId: logData.id, timesheetData: logData }));
        } else {
            dispatch(createTimesheetRequest(logData));
        }
        setAddTimelogDrawerOpen(false);
        setSelectedTimelogForEdit(null);
    }, [dispatch]);

    const handleEditLog = (log) => {
        toggleAddTimelogDrawer(true, log.originalLogData)();
    };

    const handleDeleteTimelog = useCallback((logId) => dispatch(deleteTimesheetRequest(logId)), [dispatch]);

    const handleUserSelectChange = (event) => {
        setSelectedTimesheetUser(event.target.value);
        setPage(0);
        lastTimesheetQueryRef.current = null;
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSortRequest = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0);
        lastTimesheetQueryRef.current = null;
    }, [order, orderBy]);

    const handleApplyTimesheetFilters = useCallback((filters) => {
        if (Object.keys(filters).length === 0) {
            const defaultQuery = {
                pageNumber: 1,
                pageSize: rowsPerPage,
                sortBy: '',
                sortOrder: '',
                userId: selectedTimesheetUser || currentUser?.id,
                projectId: projectId,
                search: '',
                loggedAtFrom: '',
                loggedAtTo: '',
                durationFrom: '',
                durationTo: '',
                startDateFrom: null,
                endDateTo: null,
            };

            dispatch(setTimesheetsQuery(defaultQuery));
        } else {
            const processedFilters = { ...filters };

            if (processedFilters.memberUserId) {
                processedFilters.userId = processedFilters.memberUserId;
                setSelectedTimesheetUser(processedFilters.memberUserId);
                delete processedFilters.memberUserId;
            }

            if (processedFilters.startDateFrom instanceof Date) {
                processedFilters.startDateFrom = processedFilters.startDateFrom.toISOString().split('T')[0];
            }

            if (processedFilters.endDateTo instanceof Date) {
                processedFilters.endDateTo = processedFilters.endDateTo.toISOString().split('T')[0];
            }

            if (processedFilters.loggedAtFrom instanceof Date) {
                processedFilters.loggedAtFrom = processedFilters.loggedAtFrom.toTimeString().split(' ')[0];
            }

            if (processedFilters.loggedAtTo instanceof Date) {
                processedFilters.loggedAtTo = processedFilters.loggedAtTo.toTimeString().split(' ')[0];
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

            const finalQuery = {
                pageNumber: 1,
                pageSize: rowsPerPage,
                sortBy: orderBy,
                sortOrder: order,
                userId: selectedTimesheetUser || currentUser?.id,
                projectId: projectId,
                ...processedFilters,
            };

            dispatch(setTimesheetsQuery(finalQuery));
        }

        setPage(0);
        setFilterTimesheetDrawerOpen(false);
        lastTimesheetQueryRef.current = null;
    }, [dispatch, currentUser, projectId, rowsPerPage, selectedTimesheetUser, orderBy, order]);

    const filteredTaskLists = useMemo(() => {
        if (!project?.taskLists) return [];
        if (Object.keys(taskFilters).length === 0) return project.taskLists;
        return project.taskLists.map(taskList => {
            const filteredTasks = taskList.tasks.filter(task => {
                let isMatch = true;
                if (taskFilters.search && !task.taskName.toLowerCase().includes(taskFilters.search.toLowerCase())) {
                    isMatch = false;
                }
                if (taskFilters.statusNames && taskFilters.statusNames.length > 0 && !taskFilters.statusNames.includes(task.status)) {
                    isMatch = false;
                }
                return isMatch;
            });
            return { ...taskList, tasks: filteredTasks };
        });
    }, [project?.taskLists, taskFilters]);

    const processedTimelogs = useMemo(() => {
        if (!timelogsData?.items) return [];
        return timelogsData.items.map(log => ({
            id: log.id,
            project: { name: log.project?.name || project?.projectName || 'N/A' },
            task: { name: log.task?.name || 'N/A' },
            user: { name: log.user?.name || 'N/A', avatarUrl: log.user?.avatarUrl },
            createdAt: log.loggedAt || log.createdAt,
            duration: log.duration,
            description: log.description,
            originalLogData: log,
        }));
    }, [timelogsData, project?.projectName]);

    const timesheetFilterSections = useMemo(() => {
        const sections = [
            {
                key: 'sort',
                title: 'Sort By',
                type: 'sort',
                options: [
                    { key: 'loggedAt', label: 'Log Date' },
                    { key: 'duration', label: 'Duration' }
                ]
            },
            { key: 'search', title: 'Keyword', type: 'keyword' },
        ];
        return sections;
    }, [canViewAllTimesheets, project?.members]);

    const initialTimesheetSelection = useMemo(() => ({
        sortBy: timesheetQuery.sortBy || null,
        sortOrder: timesheetQuery.sortOrder || null,
        memberUserId: selectedTimesheetUser || null,
        search: timesheetQuery.search || '',
        loggedAtFrom: timesheetQuery.loggedAtFrom || '',
        loggedAtTo: timesheetQuery.loggedAtTo || '',
        durationFrom: timesheetQuery.durationFrom || '',
        durationTo: timesheetQuery.durationTo || '',
        startDateFrom: timesheetQuery.startDateFrom || null,
        endDateTo: timesheetQuery.endDateTo || null,
        durationPreset: null,
    }), [timesheetQuery, selectedTimesheetUser]);

    if (isDetailLoading || !project) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="h5" sx={{ textAlign: 'center', mt: 5, color: 'error.main' }}>
                Error: {error}
            </Typography>
        );
    }

    const projectStatusDetail = projectHeaderStatusOptions.find(s => s.value === project.status) || {
        label: project.status,
        bgColor: 'grey.300',
        color: 'text.primary'
    };

    // Enhanced deadline color logic
    const deadlineDate = project.deadline ? parseISO(project.deadline) : null;
    let deadlineRelativeString = 'N/A';
    let deadlineColor = 'text.secondary'; // default color
    let deadlineIconColor = 'text.secondary'; // default icon color

    if (deadlineDate && isValid(deadlineDate)) {
        const daysDiff = differenceInDays(deadlineDate, new Date());

        if (daysDiff < 0) {
            // Overdue - RED
            deadlineRelativeString = `${Math.abs(daysDiff)} days overdue`;
            deadlineColor = 'error.main';
            deadlineIconColor = 'error.main';
        } else if (daysDiff === 0) {
            // Due today - RED
            deadlineRelativeString = 'Today';
            deadlineColor = 'error.main';
            deadlineIconColor = 'error.main';
        } else if (daysDiff <= 10) {
            // 10 days or less remaining - YELLOW/WARNING
            deadlineRelativeString = `${daysDiff} days left`;
            deadlineColor = 'warning.main';
            deadlineIconColor = 'warning.main';
        } else {
            // More than 10 days remaining - GREEN
            deadlineRelativeString = `${daysDiff} days left`;
            deadlineColor = 'success.main';
            deadlineIconColor = 'success.main';
        }
    }

    const taskFilterSections = [
        {
            type: 'statusNames',
            key: 'statusNames',
            title: 'Filter by Status',
            options: statusData.map(s => ({ key: s.name, label: s.name }))
        },
        { type: 'keyword', key: 'search', title: 'Filter by Keyword' },
        { type: 'duration', key: 'duration', title: 'Filter by Duration' },
    ];

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Projects / <Typography component="span" fontWeight="500" color="text.primary">
                    {project.projectName}
                </Typography>
            </Typography>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: gridSpacing,
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: { xs: 1, md: 1.5 }
                }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                        {project.projectName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1.5 } }}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem' } }}>
                            {project.members.map(member => (
                                <Tooltip title={member.name} key={member.id}>
                                    <Avatar alt={member.name} src={member.avatarUrl} />
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                        <Chip
                            label={projectStatusDetail.label}
                            size="small"
                            sx={{
                                backgroundColor: projectStatusDetail.bgColor,
                                color: projectStatusDetail.color,
                                fontWeight: 500
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: gridSpacing, alignItems: 'center' }}>
                    <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary" display="block">
                            Deadline
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" sx={{ color: deadlineIconColor }} />
                            <Typography variant="caption" sx={{ fontWeight: 500, color: deadlineColor }}>
                                {deadlineRelativeString}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Paper elevation={0} sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                mt: gridSpacing
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} aria-label="project detail tabs">
                        <Tab label="Dashboard" {...a11yProps(0)} />
                        <Tab label="Tasks" {...a11yProps(1)} />
                        <Tab label="Timesheet" {...a11yProps(2)} />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <ProjectDashboard project={project} />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mb: 2,
                        gap: 1.5,
                        pt: 2
                    }}>
                        <Can perform="task-list:create">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={toggleAddTaskListDrawer(true)}
                                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
                            >
                                Add Task List
                            </Button>
                        </Can>

                        <Can perform="task:create">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddTaskClick(null)}
                                sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
                            >
                                Add Task
                            </Button>
                        </Can>
                        <IconButton
                            onClick={() => setAdvancedSortDrawerOpen(true)}
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
                    </Box>
                    <TaskListTable
                        taskLists={filteredTaskLists}
                        onTaskStatusChange={handleTaskStatusChange}
                        onAddTask={handleAddTaskClick}
                        onTaskClick={handleTaskClick}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onDeleteTaskList={handleDeleteTaskList}
                        onAddTaskList={toggleAddTaskListDrawer(true)}
                        onEditTaskList={handleEditTaskList}
                    />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip
                                    title={
                                        !isCurrentUserProjectMember
                                            ? "You must be a project member to add timelogs."
                                            : canCreateTimelog
                                                ? ''
                                                : "You don't have permission to add timelogs."
                                    }
                                >
                                    <span>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AddIcon />}
                                            onClick={toggleAddTimelogDrawer(true, null)}
                                            sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
                                            disabled={!isCurrentUserProjectMember || !canCreateTimelog}
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
                            </Box>
                        </Box>
                        {canViewAllTimesheets && (
                            <ProjectUserDropdown
                                members={project.members}
                                selectedValue={selectedTimesheetUser}
                                onChange={handleUserSelectChange}
                                label="Filter by User"
                            />
                        )}
                        {isTimelogLoading ? (
                            <CircularProgress />
                        ) : timelogError ? (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                py: 8,
                                textAlign: 'center'
                            }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                                    Access Restricted
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450 }}>
                                    You don't have the necessary permissions to view the timesheet for this project. 
                                    Please contact your administrator for access.
                                </Typography>
                            </Box>
                        ) : (
                            <UserTimesheetView
                                timelogs={processedTimelogs}
                                pagination={{
                                    pageNumber: page + 1,
                                    pageSize: rowsPerPage,
                                    totalCount: timelogsData?.totalCount || 0
                                }}
                                sorting={{ sortField: orderBy, sortOrder: order }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                onSortRequest={handleSortRequest}
                                onEditLog={handleEditLog}
                                onDeleteLog={handleDeleteTimelog}
                            />
                        )}
                    </Box>
                </TabPanel>
            </Paper>

            <AddTaskDrawer
                open={isAddTaskDrawerOpen}
                onClose={() => handleToggleAddTaskDrawer(false)}
                editingTask={editingTaskData}
                projectIdForNewTask={projectId}
                taskListIdForNewTask={activeTaskListIdForNewTask}
            />

            <AddTaskListDrawer
                open={isAddTaskListDrawerOpen}
                onClose={toggleAddTaskListDrawer(false)}
                onSubmitCreate={handleCreateTaskList}
                onSubmitUpdate={handleUpdateTaskList}
                editingTaskList={editingTaskList}
            />

            <AdvancedSortDrawer
                open={isAdvancedSortDrawerOpen}
                onClose={() => setAdvancedSortDrawerOpen(false)}
                onConfirm={handleApplyFilters}
                sections={taskFilterSections}
                initialSelection={taskFilters}
            />

            {selectedTaskForDetail && (
                <TaskDetailModal
                    open={isTaskDetailModalOpen}
                    onClose={handleCloseTaskDetailModal}
                    task={selectedTaskForDetail}
                    onUpdateTask={handleUpdateTaskFromModal}
                />
            )}

            <AddTimelogDrawer
                open={isAddTimelogDrawerOpen}
                onClose={toggleAddTimelogDrawer(false)}
                onSubmit={handleAddOrUpdateTimelog}
                editingLog={selectedTimelogForEdit}
                project={project}
            />

            <AdvancedSortDrawer
                open={isFilterTimesheetDrawerOpen}
                onClose={toggleFilterTimesheetDrawer(false)}
                onConfirm={handleApplyTimesheetFilters}
                sections={timesheetFilterSections}
                initialSelection={initialTimesheetSelection}
            />
        </Box>
    );
}
