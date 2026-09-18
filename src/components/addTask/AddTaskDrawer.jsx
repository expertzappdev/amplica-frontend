import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Chip, Checkbox, ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import TiptapEditorField from '../../uiComponent/tiptap';
import { gridSpacing } from '../../store/constant';

// --- Redux Imports ---
import {
    createTaskRequest,
    updateTaskRequest,
    createSubTaskRequest
} from '../../redux/features/tasks/taskSlice';
import { fetchDropdownProjectsRequest, selectDropdownProjects, selectStatusItems, selectDropdownLoading } from '../../redux/features/projects/projectSlice';
import { selectUser } from '../../redux/features/auth/authSlice';
import { ROLES } from '../../utils/roles';
import { useCan } from '../../hooks/useCan';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const priorityOptions = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 },
];

const findValueByLabel = (options, label) => {
    if (!label || !Array.isArray(options)) return null;
    const found = options.find(opt => opt.label.toLowerCase() === label.toLowerCase());
    return found ? found.value : null;
};

const formatDecimalToHHMM = (decimalHours) => {
    if (typeof decimalHours !== 'number' || isNaN(decimalHours) || decimalHours < 0) return '';
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert "HH:mm" string to Date object to use with TimePicker
const convertHHMMStringToDate = (hhmm) => {
    if (!hhmm) return null;
    const [hours, minutes] = hhmm.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

/**
 * Extract assignee IDs from task object (handles both API formats)
 */
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

    // Handle direct assignedUserIds array (if API sends this)
    if (task.assignedUserIds && Array.isArray(task.assignedUserIds)) {
        return task.assignedUserIds;
    }

    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AddTaskDrawer({
    open,
    onClose,
    editingTask,
    isSubTask = false,
    parentTask = null,
    isTodo = false,
    isEditMode = false,
    isAllTasksView = false,
    isMyTasksView = false,
    projectIdForNewTask = null,
    taskListIdForNewTask = null
}) {
    const dispatch = useDispatch();
    const isEditModeInternal = !!editingTask || isEditMode;
    const isTodoMode = isTodo; // Logic for To-Do mode

    const currentUser = useSelector(selectUser);
    const projectsResponse = useSelector(selectDropdownProjects);
    const statusData = useSelector(selectStatusItems);
    const isDropdownLoading = useSelector(selectDropdownLoading);
    const { can } = useCan();
    const canReadAllProjects = can('project:read:all');
    
    // Ref to track if we've fetched projects for the current open session
    const hasFetchedOnOpen = React.useRef(false);

    const [taskName, setTaskName] = useState('');
    const [descriptionHtml, setDescriptionHtml] = useState('');
    const [projectId, setProjectId] = useState('');
    const [taskListId, setTaskListId] = useState('');

    // UPDATED: Changed from single assigneeId to array assigneeIds
    const [assigneeIds, setAssigneeIds] = useState([]);

    const [statusId, setStatusId] = useState('');
    const [priorityId, setPriorityId] = useState(2);
    const [startDate, setStartDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [estimatedHours, setEstimatedHours] = useState(null);
    const [errors, setErrors] = useState({});

    const projectOptions = useMemo(() => {
        // Handle both paginated response object and direct array
        const projects = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse?.items;
        if (!Array.isArray(projects)) return [];
        
        return projects.map(p => ({
            label: p.name,
            value: p.projectId,
            members: p.projectMembers || [],
            taskLists: p.taskLists || [],
        }));
    }, [projectsResponse]);

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map(status => ({
            label: status.name,
            value: status.id,
        }));
    }, [statusData]);

    const [taskListOptions, setTaskListOptions] = useState([]);
    const [assigneeOptions, setAssigneeOptions] = useState([]);

    const getDrawerTitle = () => {
        if (isEditModeInternal) return 'Edit Task';
        if (isSubTask) return 'Add New Sub-task';
        if (isTodoMode) return 'Add New To-Do';
        return 'Add New Task';
    };

    const getButtonText = () => {
        if (isEditModeInternal) return 'Save Changes';
        if (isSubTask) return 'Add Sub-task';
        if (isTodoMode) return 'Add To-Do';
        return 'Add Task';
    };

    useEffect(() => {
        if (open) {
            if (!hasFetchedOnOpen.current && !isTodoMode) {
                const fetchParams = { 
                    page: 1, 
                    pageSize: 150,
                    statusNames: 'Active,Delayed,InProgress,InReview,Open,NotStarted,Backlog'
                };
                
                const shouldFilterByMember = isMyTasksView || !canReadAllProjects;

                if (shouldFilterByMember) {
                    fetchParams.memberUserId = currentUser?.id || currentUser?.userId;
                }
                
                dispatch(fetchDropdownProjectsRequest(fetchParams));
                hasFetchedOnOpen.current = true;
            }
        } else {
            // Reset the flag when the drawer closes
            hasFetchedOnOpen.current = false;
        }
    }, [open, isTodoMode, dispatch, currentUser, isMyTasksView, canReadAllProjects]);

    useEffect(() => {
        if (!projectId) {
            setTaskListOptions([]);
            setAssigneeOptions([]);
            if (isTodoMode && currentUser) {
                // For todo mode, current user is the only assignee option initially
                setAssigneeOptions([{ label: `${currentUser.firstName} ${currentUser.lastName}`, value: currentUser.id }]);
            }
            return;
        }
        const selectedProject = projectOptions.find(p => String(p.value) === String(projectId));
        if (selectedProject) {
            const mappedTaskLists = selectedProject.taskLists.map(tl => ({ label: tl.listName, value: tl.taskListId }));
            setTaskListOptions(mappedTaskLists);
            setAssigneeOptions(selectedProject.members.map(m => {
                const user = m.user;
                const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown User';
                return { label: name, value: user?.userId };
            }));

            // Auto-fill tasklist: prefer "Default", fallback to first available
            if (!isEditMode && !isSubTask) {
                const defaultList = mappedTaskLists.find(tl => tl.label.toLowerCase() === 'default');
                setTaskListId(defaultList ? defaultList.value : (mappedTaskLists[0]?.value || ''));
                // UPDATED: Reset to empty array instead of empty string
                setAssigneeIds([]);
            }
        } else {
            if (!isEditMode && !isSubTask) {
                setTaskListId('');
                setAssigneeIds([]);
            }
        }
    }, [projectId, projectOptions, isEditMode, editingTask, isSubTask, isTodoMode, currentUser]);

    // ============================================================================
    // UPDATED: Form initialization with multi-assignee support
    // ============================================================================
    useEffect(() => {
        if (open) {
            if (isEditModeInternal && editingTask) {
                // EDIT MODE: Populate form
                setTaskName(editingTask.title || '');
                setDescriptionHtml(editingTask.description || '');
                setProjectId(editingTask.projectId || '');
                setTaskListId(editingTask.taskListId || '');

                // UPDATED: Extract all assignee IDs using helper function
                const extractedIds = extractAssigneeIds(editingTask);
                console.log('Edit Mode - Extracted Assignee IDs:', extractedIds);
                setAssigneeIds(extractedIds);

                setStartDate(editingTask.startDate ? new Date(editingTask.startDate) : null);
                setDueDate(editingTask.endDate ? new Date(editingTask.endDate) : null);

                // Convert decimal estimatedHours to HH:mm string, then to Date for TimePicker
                const hhmmString = formatDecimalToHHMM(editingTask.estimatedHours);
                setEstimatedHours(convertHHMMStringToDate(hhmmString));

                setStatusId(findValueByLabel(statusOptions, editingTask.statusName) || '');
                setPriorityId(findValueByLabel(priorityOptions, editingTask.priorityName) || 2);
            } else if (isSubTask && parentTask) {
                // SUBTASK MODE: Pre-fill from parent task
                const openStatus = statusOptions.find(opt => opt.label === 'Open');
                setTaskName('');
                setDescriptionHtml('');
                setProjectId(parentTask.projectId || '');
                setTaskListId(parentTask.taskListId || '');

                // UPDATED: Inherit parent's assignees
                const parentAssigneeIds = extractAssigneeIds(parentTask);
                console.log('SubTask Mode - Parent Assignee IDs:', parentAssigneeIds);
                setAssigneeIds(parentAssigneeIds);

                setStartDate(null);
                setDueDate(null);
                setEstimatedHours(null);
                setStatusId(openStatus ? openStatus.value : (statusOptions[0]?.value || ''));
                setPriorityId(2);
            } else if (isTodoMode) {
                // TODO MODE: Reset form specifically for Todo
                const openStatus = statusOptions.find(opt => opt.label === 'Open');
                setTaskName('');
                setDescriptionHtml('');
                setProjectId(''); // No project
                setTaskListId(''); // No task list
                setAssigneeIds([currentUser.id]); // Default to current user
                setStartDate(null);
                setDueDate(null);
                setEstimatedHours(null);
                setStatusId(openStatus ? openStatus.value : (statusOptions[0]?.value || ''));
                setPriorityId(2);
            } else {
                // ADD MODE: Initialize from props if provided
                if (projectIdForNewTask) {
                    // Ensure projectId is a number if possible, or matches the type in projectOptions
                    const prefilledId = isNaN(Number(projectIdForNewTask)) ? projectIdForNewTask : Number(projectIdForNewTask);
                    setProjectId(prefilledId);
                    
                    if (taskListIdForNewTask) {
                        setTaskListId(taskListIdForNewTask);
                    }
                } else {
                    setProjectId('');
                    setTaskListId('');
                }
                
                const openStatus = statusOptions.find(opt => opt.label === 'Open');
                setTaskName('');
                setDescriptionHtml('');
                setAssigneeIds([]);
                setStartDate(null);
                setDueDate(null);
                setEstimatedHours(null);
                setStatusId(openStatus ? openStatus.value : (statusOptions[0]?.value || ''));
                setPriorityId(2);
            }
            setErrors({});
        }
    }, [open, isEditModeInternal, editingTask, isSubTask, parentTask, projectIdForNewTask, taskListIdForNewTask, statusOptions, isTodoMode, currentUser?.id]);

    const validateForm = () => {
        const newErrors = {};
        if (!taskName.trim()) newErrors.taskName = 'Task name is required';
        if (!isTodoMode && !taskListId) newErrors.taskListId = 'Task list is required';
        if (!dueDate) newErrors.dueDate = 'Due date is required';
        if (!startDate) newErrors.startDate = 'Start date is required';

        // UPDATED: Validate that at least one assignee is selected
        if (assigneeIds.length === 0) {
            newErrors.assigneeIds = 'At least one assignee is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================================================
    // UPDATED: handleSubmit with multi-assignee support
    // ============================================================================
    const handleSubmit = () => {
        if (!validateForm()) return;

        // Convert estimatedHours Date object to decimal hours for API
        let estimatedHoursInDecimal = 0;
        if (estimatedHours) {
            const durationString = format(estimatedHours, 'HH:mm');
            const [hours, minutes] = durationString.split(':').map(Number);
            estimatedHoursInDecimal = hours + (minutes / 60);
        }

        const apiPayload = {
            title: taskName,
            description: descriptionHtml,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            endDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
            statusId,
            priorityId,
            // UPDATED: Send array of assignee IDs instead of single ID
            assignedUserIds: assigneeIds.length > 0 ? assigneeIds : [currentUser.id],
            estimatedHours: estimatedHoursInDecimal,
            taskListId: isTodoMode ? 0 : (taskListId || null),
            projectId: isTodoMode ? 0 : (projectId || null),
        };

        console.log('Submitting task with payload:', apiPayload);

        if (isEditModeInternal) {
            dispatch(updateTaskRequest({ taskId: editingTask.taskId, taskData: apiPayload }));
        } else if (isSubTask && parentTask) {
            const subTaskData = {
                ...apiPayload,
                taskListId: taskListId,
                parentTaskId: parentTask.taskId,
                taskOrder: (parentTask.subtasks?.length || 0) + 1,
                actualHours: 0,
            };
            dispatch(createSubTaskRequest({
                parentTaskId: parentTask.taskId,
                subTaskData
            }));
        } else if (isTodoMode) {
            dispatch(createTaskRequest({ taskListId: 0, taskData: apiPayload }));
        } else {
            dispatch(createTaskRequest({ taskListId, taskData: apiPayload }));
        }
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100%', sm: 450, md: 500 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                        {getDrawerTitle()}
                    </Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 1, pt: 1 }}>
                    {/* Task Name */}
                    <TextField
                        label={isSubTask ? "Sub-task Name" : "Task Name"}
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        required
                        fullWidth
                        error={!!errors.taskName}
                        helperText={errors.taskName}
                    />

                    {/* Project Selection - Hidden in To-Do Mode */}
                    {!isTodoMode && (
                        <FormControl fullWidth error={!!errors.projectId}>
                            <InputLabel id="project-select-label">Project *</InputLabel>
                            <Select
                                labelId="project-select-label"
                                label="Project *"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                disabled={isSubTask}
                            >
                                {projectOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                            {errors.projectId && <FormHelperText>{errors.projectId}</FormHelperText>}
                            {isSubTask && (
                                <FormHelperText>Inherited from parent task</FormHelperText>
                            )}
                        </FormControl>
                    )}

                    {/* Task List Selection - Hidden in To-Do Mode */}
                    {!isTodoMode && (
                        <FormControl fullWidth disabled={!projectId || isSubTask} error={!!errors.taskListId}>
                            <InputLabel id="tasklist-select-label">Task List *</InputLabel>
                            <Select
                                labelId="tasklist-select-label"
                                label="Task List *"
                                value={taskListId}
                                onChange={(e) => setTaskListId(e.target.value)}
                            >
                                {taskListOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                            {errors.taskListId && <FormHelperText>{errors.taskListId}</FormHelperText>}
                            {isSubTask && (
                                <FormHelperText>Inherited from parent task</FormHelperText>
                            )}
                        </FormControl>
                    )}

                    {/* Description Editor */}
                    <TiptapEditorField
                        label="Description"
                        initialContent={descriptionHtml}
                        onContentChange={setDescriptionHtml}
                        minEditorHeight="120px"
                    />

                    {/* ============================================================================ */}
                    {/* UPDATED: Multi-Select Assignees Dropdown */}
                    {/* ============================================================================ */}
                    {!isTodoMode && (
                        <FormControl fullWidth disabled={!projectId} error={!!errors.assigneeIds}>
                            <InputLabel id="assignee-select-label">Assignees *</InputLabel>
                            <Select
                                labelId="assignee-select-label"
                                label="Assignees *"
                                multiple
                                value={assigneeIds}
                                onChange={(e) => {
                                    setAssigneeIds(e.target.value);
                                    setErrors(prev => ({ ...prev, assigneeIds: null }));
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((userId) => {
                                            const assignee = assigneeOptions.find(opt => opt.value === userId);
                                            return (
                                                <Chip
                                                    key={userId}
                                                    label={assignee ? assignee.label : userId}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        '& .MuiChip-label': { px: 1 }
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                {assigneeOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        <Checkbox checked={assigneeIds.indexOf(opt.value) > -1} />
                                        <ListItemText primary={opt.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.assigneeIds && <FormHelperText>{errors.assigneeIds}</FormHelperText>}
                            {isSubTask && assigneeIds.length > 0 && (
                                <FormHelperText>
                                    {assigneeIds.length === 1
                                        ? 'Inherited from parent task'
                                        : `${assigneeIds.length} members inherited from parent task`
                                    }
                                </FormHelperText>
                            )}
                        </FormControl>
                    )}

                    {/* Date Pickers */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            format="dd/MM/yyyy"
                            required
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: (params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.startDate}
                                        helperText={errors.startDate}
                                        placeholder="DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                        <DatePicker
                            label="Due Date"
                            value={dueDate}
                            onChange={setDueDate}
                            minDate={startDate}
                            format="dd/MM/yyyy"
                            required
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: (params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.dueDate}
                                        helperText={errors.dueDate}
                                        placeholder="DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                        <TimePicker
                            label="Estimated Hours (HH:mm)"
                            value={estimatedHours}
                            onChange={(newValue) => setEstimatedHours(newValue)}
                            ampm={false}
                            views={['hours', 'minutes']}
                            format="HH:mm"
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </LocalizationProvider>

                    {/* Status and Priority */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                label="Status"
                                value={statusId}
                                onChange={(e) => setStatusId(e.target.value)}
                            >
                                {statusOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="priority-label">Priority</InputLabel>
                            <Select
                                labelId="priority-label"
                                label="Priority"
                                value={priorityId}
                                onChange={(e) => setPriorityId(e.target.value)}
                            >
                                {priorityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {getButtonText()}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
