import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Drawer, Box, Typography, IconButton, TextField, Button, Grid, Avatar, Chip, Divider,
    FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
    Tabs, Tab, Checkbox, ListSubheader, Tooltip, AvatarGroup
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import Can from '../../../uiComponent/Can';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { useCan } from '../../../hooks/useCan';
import { ASSETS_BASE_URL } from '../../../services/apiConstants';
import { useDispatch, useSelector } from 'react-redux';
import { selectStatusItems } from '../../../redux/features/projects/projectSlice';
import {
    uploadDocumentRequest,
    deleteTaskDocumentRequest,
    selectTaskData,
    createSubTaskRequest,
    updateTaskRequest,
    deleteTaskRequest,
    getTaskByIdRequest
} from '../../../redux/features/tasks/taskSlice';

import StatusDropdown from '../../../uiComponent/statusdropdown/StatusDropdown';
import TiptapEditorField from '../../../uiComponent/tiptap';
import { gridSpacing } from '../../../store/constant';
import SubTasksSection from '../innertabs/SubTasksSection';

const MAX_ATTACHMENTS = 5;

const priorityOptions = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 },
];

const extractAssigneeIds = (task) => {
    if (!task) return [];

    if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
        if (task.assignedUsers.length > 0) {
            return task.assignedUsers.map(user => user.userId);
        }
    }

    if (task.assignedToUserId) {
        return [task.assignedToUserId];
    }

    return [];
};


const getAssignees = (task) => {
    if (!task) return [];

    if (task.assignedUsers && Array.isArray(task.assignedUsers) && task.assignedUsers.length > 0) {
        return task.assignedUsers.map(user => ({
            id: user.userId,
            name: user.userName,
            avatarUrl: user.avatarUrl ? `${ASSETS_BASE_URL}${user.avatarUrl}` : null
        }));
    }

    if (task.assignedToUserId && task.assignedToUserName) {
        return [{
            id: task.assignedToUserId,
            name: task.assignedToUserName,
            avatarUrl: task.assignedToUserAvatarUrl ? `${ASSETS_BASE_URL}${task.assignedToUserAvatarUrl}` : null
        }];
    }

    return [];
};

const DetailRow = ({ icon, label, children, fullWidth }) => (
    <Grid item size={{ xs: 12, sm: fullWidth ? 12 : 6, md: 6, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', py: 0.5, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '110px', color: 'text.secondary', mr: 1.5 }}>
            {React.cloneElement(icon, { sx: { fontSize: '1.25rem', mr: 1.5, color: 'text.secondary' } })}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', '& .MuiInputBase-input': { fontWeight: 500, fontSize: '0.875rem', py: '6px' }, '& .MuiSelect-select': { fontWeight: 500, fontSize: '0.875rem', py: '6px !important', pr: '24px !important' } }}>
            {children}
        </Box>
    </Grid>
);

function CommentsSectionInner({ comments = [], onAddComment }) {
    const [newComment, setNewComment] = useState('');
    const currentVirtualUser = { id: 'currentUser', name: 'Current User', avatarUrl: 'https://i.pravatar.cc/150?img=7' };

    const handleAdd = () => {
        if (newComment.trim() && currentVirtualUser) {
            const commentData = { userId: currentVirtualUser.id, userName: currentVirtualUser.name, avatarUrl: currentVirtualUser.avatarUrl, text: newComment.trim() };
            onAddComment(commentData);
            setNewComment('');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
                <Avatar src={currentVirtualUser?.avatarUrl} sx={{ width: 36, height: 36, mt: 0.5 }} >{currentVirtualUser?.name?.charAt(0)}</Avatar>
                <TextField fullWidth multiline minRows={2} variant="outlined" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleAdd} disabled={!newComment.trim()} startIcon={<SendIcon />} size="small">Post</Button>
            </Box>
            <List dense sx={{ maxHeight: 250, overflow: 'auto', mt: 2 }}>
                {comments.length === 0 && (<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No comments yet.</Typography>)}
                {comments.slice().reverse().map((comment, index) => (
                    <React.Fragment key={comment.id || `comm-${index}`}>
                        <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                            <ListItemAvatar sx={{ mt: 0.5 }}><Avatar alt={comment.userName} src={comment.avatarUrl} sx={{ width: 32, height: 32 }} /></ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="subtitle2" component="span" fontWeight="600">{comment.userName}</Typography>}
                                secondary={
                                    <><Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', whiteSpace: 'pre-wrap' }}>{comment.text}</Typography>
                                        <Typography variant="caption" color="text.secondary">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</Typography></>
                                }
                            />
                        </ListItem>
                        {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
}

function ActivityLogSectionInner({ activityLog = [] }) {
    return (
        <Box>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {activityLog.length === 0 && (<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No activity recorded yet.</Typography>)}
                {activityLog.slice().reverse().map((log, index) => (
                    <React.Fragment key={log.id || `log-${index}`}>
                        <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                            <ListItemAvatar sx={{ mt: 0.5, minWidth: '48px' }}><Avatar alt={log.userName} src={log.userAvatarUrl} sx={{ width: 32, height: 32 }} /></ListItemAvatar>
                            <ListItemText
                                primary={<Typography component="span" variant="body2"><Typography component="span" fontWeight="600">{log.userName || 'System'}</Typography> {log.action}</Typography>}
                                secondary={<Typography variant="caption" color="text.secondary">{formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })} - {format(parseISO(log.timestamp), 'MMM dd, yyyy HH:mm')}</Typography>}
                            />
                        </ListItem>
                        {index < activityLog.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`task-detail-sub-tabpanel-${index}`} aria-labelledby={`task-detail-sub-tab-${index}`} {...other}>
            {value === index && <Box sx={{ py: 2, px: 0.5 }}>{children}</Box>}
        </div>
    );
}

export default function TaskDetailModal({
    open,
    onClose,
    task: initialTask, // CRITICAL: Renamed from 'task' to 'initialTask'
    onUpdateTask,
    projectContextName = "Task",
    isSubTask = false
}) {
    const dispatch = useDispatch();
    const [editableTask, setEditableTask] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(1);
    const fileInputRef = useRef(null);
    const statusData = useSelector(selectStatusItems) || [];

    // CRITICAL: Use Redux taskData which has full assignedUsers
    const taskDataFromRedux = useSelector(selectTaskData);

    const isUpdatingFromExternal = useRef(false);
    const updateTimeoutRef = useRef(null);

    const [selectedSubTask, setSelectedSubTask] = useState(null);
    const [subTaskDetailModalOpen, setSubTaskDetailModalOpen] = useState(false);
    const { can } = useCan();
    const canUpdateTask = can('task:update');

    const currentAttachmentCount = editableTask?.documents?.length || 0;
    const isAttachmentLimitReached = currentAttachmentCount >= MAX_ATTACHMENTS;

    // ============================================================================
    // CRITICAL: Sync with Redux taskData when it updates
    // ============================================================================
    useEffect(() => {
        if (taskDataFromRedux && taskDataFromRedux.taskId === initialTask?.taskId && !isUpdatingFromExternal.current) {
            console.log('🔄 TaskDetailModal - Syncing with Redux data:', {
                taskId: taskDataFromRedux.taskId,
                assignedUsers: taskDataFromRedux.assignedUsers,
                assignedUsersCount: taskDataFromRedux.assignedUsers?.length || 0
            });

            setEditableTask(prevTask => {
                if (!prevTask) return null;
                return {
                    ...prevTask,
                    ...taskDataFromRedux,
                    startDate: prevTask.startDate || (taskDataFromRedux.startDate ? parseISO(taskDataFromRedux.startDate) : null),
                    endDate: prevTask.endDate || (taskDataFromRedux.endDate ? parseISO(taskDataFromRedux.endDate) : null),
                    documents: Array.isArray(taskDataFromRedux.documents) ? taskDataFromRedux.documents : (prevTask?.documents || []),
                    attachments: Array.isArray(taskDataFromRedux.attachments) ? taskDataFromRedux.attachments : (prevTask?.attachments || []),
                    subtasks: Array.isArray(taskDataFromRedux.subtasks) ? taskDataFromRedux.subtasks : (prevTask?.subtasks || []),
                    // CRITICAL: Use Redux assignedUsers (full data)
                    assignedUsers: Array.isArray(taskDataFromRedux.assignedUsers) ? taskDataFromRedux.assignedUsers : (prevTask?.assignedUsers || null),
                };
            });
        }
    }, [taskDataFromRedux, initialTask?.taskId]);

    const findValueByLabel = (options, label) => {
        if (!label || !Array.isArray(options)) return null;
        const found = options.find(opt => opt.label.toLowerCase() === label.toLowerCase());
        return found ? found.value : null;
    };

    // ============================================================================
    // CRITICAL: Initialize with taskDataFromRedux if available, fallback to initialTask
    // ============================================================================
    useEffect(() => {
        if (initialTask && open) {
            // Use Redux data if available for this task, otherwise use initialTask
            const taskToUse = (taskDataFromRedux && taskDataFromRedux.taskId === initialTask.taskId)
                ? taskDataFromRedux
                : initialTask;

            console.log('🚀 TaskDetailModal - Initializing with task:', {
                taskId: taskToUse.taskId,
                source: taskToUse === taskDataFromRedux ? 'Redux (full data)' : 'Props (list data)',
                assignedUsers: taskToUse.assignedUsers,
                assignedUsersCount: taskToUse.assignedUsers?.length || 0
            });

            const priorityValue = typeof taskToUse.priority === 'number'
                ? taskToUse.priority
                : findValueByLabel(priorityOptions, taskToUse.priorityName);

            const estimatedHours = taskToUse.estimatedHours || 0;

            const initialTaskState = {
                ...taskToUse,
                priority: priorityValue,
                startDate: taskToUse.startDate ? parseISO(taskToUse.startDate) : null,
                endDate: taskToUse.endDate ? parseISO(taskToUse.endDate) : null,
                documents: Array.isArray(taskToUse.documents) ? taskToUse.documents : [],
                attachments: Array.isArray(taskToUse.attachments) ? taskToUse.attachments : [],
                subtasks: Array.isArray(taskToUse.subtasks) ? taskToUse.subtasks : [],
                description: taskToUse.description || "",
                comments: Array.isArray(taskToUse.comments) ? taskToUse.comments : [],
                activityLog: Array.isArray(taskToUse.activityLog) ? taskToUse.activityLog : [],
                estimatedHours: estimatedHours,
                assignedToUserId: taskToUse.assignedToUserId,
                assignedToUserName: taskToUse.assignedToUserName,
                // CRITICAL: Use assignedUsers from Redux if available
                assignedUsers: Array.isArray(taskToUse.assignedUsers) ? taskToUse.assignedUsers : null,
            };

            setEditableTask(initialTaskState);
            setElapsedTime(taskToUse.timeTracked || 0);
            setActiveSubTab(1);
        } else if (!open) {
            setEditableTask(null);
        }
    }, [initialTask, open, taskDataFromRedux]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setElapsedTime(prevTime => prevTime + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // ============================================================================
    // UPDATED: debouncedUpdate with multi-assignee support
    // ============================================================================
    const debouncedUpdate = useCallback((updatedTaskData, immediate = false) => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        const performUpdate = () => {
            isUpdatingFromExternal.current = true;

            if (isSubTask) {
                const dataToSubmit = {
                    title: updatedTaskData.title || initialTask.title,
                    description: updatedTaskData.description || initialTask.description || '',
                    startDate: updatedTaskData.startDate && isValid(updatedTaskData.startDate) ?
                        format(updatedTaskData.startDate, 'yyyy-MM-dd') :
                        (initialTask.startDate || null),
                    endDate: updatedTaskData.endDate && isValid(updatedTaskData.endDate) ?
                        format(updatedTaskData.endDate, 'yyyy-MM-dd') :
                        (initialTask.endDate || null),
                    statusId: (() => {
                        if (updatedTaskData.statusName) {
                            const statusItem = statusData.find(status => status.name === updatedTaskData.statusName);
                            return statusItem?.id || initialTask.statusId;
                        }
                        return initialTask.statusId;
                    })(),
                    priorityId: updatedTaskData.priority || initialTask.priority || 2,
                    // UPDATED: Send assignedUserIds array
                    assignedUserIds: extractAssigneeIds(initialTask),
                    estimatedHours: updatedTaskData.estimatedHours || initialTask.estimatedHours || 0,
                    actualHours: initialTask.actualHours || 0,
                    taskListId: initialTask.taskListId,
                    projectId: initialTask.projectId,
                    parentTaskId: initialTask.parentTaskId,
                    taskOrder: initialTask.taskOrder || 1,
                    isCompleted: updatedTaskData.statusName ?
                        (updatedTaskData.statusName.toLowerCase().includes('completed') ||
                            updatedTaskData.statusName.toLowerCase().includes('done') ||
                            updatedTaskData.statusName.toLowerCase().includes('closed'))
                        : initialTask.isCompleted || false
                };

                dispatch(updateTaskRequest({ taskId: initialTask.taskId, taskData: dataToSubmit }));

            } else if (onUpdateTask) {
                const dataToSubmit = {
                    ...updatedTaskData,
                    startDate: updatedTaskData.startDate && isValid(updatedTaskData.startDate) ?
                        format(updatedTaskData.startDate, 'yyyy-MM-dd') :
                        (updatedTaskData.startDate === null ? null : initialTask.startDate),
                    endDate: updatedTaskData.endDate && isValid(updatedTaskData.endDate) ?
                        format(updatedTaskData.endDate, 'yyyy-MM-dd') :
                        (updatedTaskData.endDate === null ? null : initialTask.endDate),
                    timeTracked: elapsedTime,
                    id: initialTask.taskId,
                    taskListId: initialTask.taskListId,
                    title: initialTask.title,
                    // UPDATED: Include assignedUserIds
                    assignedUserIds: extractAssigneeIds(initialTask),
                };

                onUpdateTask(dataToSubmit);
            }

            setTimeout(() => {
                isUpdatingFromExternal.current = false;
            }, 1000);
        };

        if (immediate) {
            performUpdate();
        } else {
            updateTimeoutRef.current = setTimeout(performUpdate, 500);
        }
    }, [dispatch, isSubTask, onUpdateTask, elapsedTime, initialTask, statusData]);

    const handleFieldChange = (field, value, immediate = false) => {
        setEditableTask(prevTask => {
            const updatedTask = { ...prevTask, [field]: value };
            debouncedUpdate(updatedTask, immediate);
            return updatedTask;
        });
    };

    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    const handleClose = () => {
        if (isTimerRunning) setIsTimerRunning(false);

        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        if (!isSubTask && onUpdateTask && editableTask && elapsedTime !== (initialTask?.timeTracked || 0)) {
            const finalUpdate = { ...editableTask, timeTracked: elapsedTime };
            debouncedUpdate(finalUpdate, true);
        }

        onClose();
    };

    const handleAttachmentClick = () => {
        if (!isAttachmentLimitReached) {
            fileInputRef.current?.click();
        }
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file && !isAttachmentLimitReached) {
            const formData = new FormData();
            formData.append('File', file);
            formData.append('DocumentName', file.name);
            dispatch(uploadDocumentRequest({ taskId: initialTask.taskId, formData }));
        }
        if (event.target) event.target.value = null;
    };

    const handleRemoveDocument = (documentId) => {
        dispatch(deleteTaskDocumentRequest({ taskId: initialTask.taskId, documentId }));
    };

    const handleDownloadDocument = (document) => {
        const link = document.createElement('a');
        link.href = document.filePath;
        link.download = document.documentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubTabChange = (event, newValue) => {
        setActiveSubTab(newValue);
    };

    const handleAddComment = (commentData) => {
        const newComment = { id: `comm-${Date.now()}`, timestamp: new Date().toISOString(), ...commentData };
        setEditableTask(prevTask => {
            const updatedTask = { ...prevTask, comments: [...(prevTask.comments || []), newComment] };
            debouncedUpdate(updatedTask, true);
            return updatedTask;
        });
    };

    const handleSubTaskClick = (subTask) => {
        setSelectedSubTask(subTask);
        setSubTaskDetailModalOpen(true);
    };

    const handleCloseSubTaskModal = () => {
        setSubTaskDetailModalOpen(false);
        setSelectedSubTask(null);
        setTimeout(() => {
            dispatch(getTaskByIdRequest(initialTask.taskId));
        }, 500);
    };

    const handleUpdateSubTaskFromModal = (updatedSubTaskData) => {
    };

    // ============================================================================
    // Helper to render assignees display
    // ============================================================================
    const getAvatarLetters = (name) => {
        if (!name) return '';
        const initials = name.match(/\b\w/g) || [];
        return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    };

    const renderAssignees = () => {
        const assignees = getAssignees(editableTask);

        if (assignees.length === 0) {
            return (
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    Unassigned
                </Typography>
            );
        }

        if (assignees.length === 1) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                        src={assignees[0].avatarUrl}
                        sx={{ width: 28, height: 28, fontSize: '0.7rem' }}
                    >
                        {getAvatarLetters(assignees[0].name)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {assignees[0].name}
                    </Typography>
                </Box>
            );
        }

        // Multiple assignees
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AvatarGroup
                    max={3}
                    sx={{
                        '& .MuiAvatar-root': {
                            width: 28,
                            height: 28,
                            fontSize: '0.7rem',
                            border: '2px solid white'
                        }
                    }}
                >
                    {assignees.map(assignee => (
                        <Tooltip key={assignee.id} title={assignee.name} arrow>
                            <Avatar src={assignee.avatarUrl}>
                                {getAvatarLetters(assignee.name)}
                            </Avatar>
                        </Tooltip>
                    ))}
                </AvatarGroup>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {assignees.length} member{assignees.length > 1 ? 's' : ''}
                </Typography>
            </Box>
        );
    };

    if (!editableTask) return null;

    const getPriorityIcon = (priorityValue) => {
        const priority = priorityOptions.find(opt => opt.value === priorityValue);
        const pLabel = priority ? priority.label.toLowerCase() : '';
        if (pLabel === 'high') return <FlagOutlinedIcon color="error" />;
        if (pLabel === 'medium') return <FlagOutlinedIcon color="warning" />;
        if (pLabel === 'low') return <FlagOutlinedIcon color="success" />;
        return <FlagOutlinedIcon color="disabled" />;
    };

    const shouldShowAllTabs = !isSubTask;

    return (
        <>
            <Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{ sx: { width: { xs: '100%', sm: 550, md: 700 }, p: 0 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                            {isSubTask ? 'Subtask' : editableTask.name || 'Task'} / {editableTask.title}
                        </Typography>
                        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: gridSpacing }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <TextField
                                value={editableTask.title || ""}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                                variant="standard"
                                fullWidth
                                placeholder={isSubTask ? "Sub-task Name" : "Task Name"}
                                InputProps={{
                                    disableUnderline: true,
                                    sx: { fontSize: '1.6rem', fontWeight: 600, py: 0 }
                                }}
                            />
                        </Box>

                        <Grid container columnSpacing={gridSpacing} rowSpacing={0.5} sx={{ mb: 2.5 }}>
                            <DetailRow icon={getPriorityIcon(editableTask.priority)} label="Priority">
                                {canUpdateTask ? (
                                    <FormControl variant="standard" size="small" fullWidth>
                                        <Select
                                            value={editableTask.priority || ''}
                                            onChange={(e) => {
                                                handleFieldChange('priority', e.target.value, true);
                                            }}
                                            disableUnderline
                                            sx={{ fontWeight: 500, '.MuiSelect-select': { py: 0.25, px: 0 }, '.MuiSvgIcon-root': { right: 0 } }}
                                        >
                                            {priorityOptions.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {priorityOptions.find(opt => opt.value === editableTask.priority)?.label || 'Medium'}
                                    </Typography>
                                )}
                            </DetailRow>

                            <DetailRow icon={<AssignmentTurnedInOutlinedIcon />} label="Status">
                                {canUpdateTask ? (
                                    <StatusDropdown
                                        currentStatus={editableTask.statusName}
                                        projectId={editableTask.taskId}
                                        onStatusChange={(id, newStatus) => {
                                            handleFieldChange('statusName', newStatus, true);
                                        }}
                                        sx={{
                                            height: '30px',
                                            backgroundColor: 'transparent',
                                            '& .MuiSelect-select': { py: 0, px: 0, justifyContent: 'flex-start' },
                                            '.MuiSvgIcon-root': { right: 0 }
                                        }}
                                    />
                                ) : (
                                    <Box sx={{
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontWeight: 500,
                                        color: statusData.find(s => s.name === editableTask.statusName)?.statusColor || 'text.secondary',
                                    }}>
                                        {editableTask.statusName}
                                    </Box>
                                )}
                            </DetailRow>

                            {/* UPDATED: Assignees Display with Multi-Assignee Support */}
                            <DetailRow icon={<PersonOutlineIcon />} label="Assignees" fullWidth>
                                {renderAssignees()}
                            </DetailRow>

                            {selectedSubTask && (
                                <DetailRow icon={<CalendarTodayIcon />} label="Start Date">
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                        {editableTask.startDate
                                            ? format(editableTask.startDate, 'MMM dd, yyyy')
                                            : 'Not set'
                                        }
                                    </Typography>
                                </DetailRow>
                            )}

                            <DetailRow icon={<CalendarTodayIcon />} label="Due Date">
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {editableTask.endDate
                                        ? format(editableTask.endDate, 'MMM dd, yyyy')
                                        : 'Not set'
                                    }
                                </Typography>
                            </DetailRow>

                            <DetailRow icon={<TimelapseIcon />} label="Estimation">
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                    {editableTask.estimatedHours > 0
                                        ? `${Math.floor(editableTask.estimatedHours)}h ${Math.round((editableTask.estimatedHours % 1) * 60)}m`
                                        : 'Not set'
                                    }
                                </Typography>
                            </DetailRow>
                        </Grid>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DescriptionOutlinedIcon sx={{ fontSize: '1.25rem', mr: 1.5, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Description</Typography>
                            </Box>
                            <Box
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'grey.50',
                                    minHeight: '150px'
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ whiteSpace: 'pre-wrap' }}
                                    dangerouslySetInnerHTML={{
                                        __html: editableTask.description || '<em style="color: #999;">No description provided</em>'
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2.5 }} />

                        {shouldShowAllTabs && (
                            <Box sx={{ mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AttachFileOutlinedIcon sx={{ fontSize: '1.25rem', mr: 1.5, color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Attachments ({currentAttachmentCount}/{MAX_ATTACHMENTS})
                                        </Typography>
                                    </Box>
                                    {canUpdateTask && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AddPhotoAlternateOutlinedIcon />}
                                            onClick={handleAttachmentClick}
                                            disabled={isAttachmentLimitReached}
                                            sx={{
                                                borderRadius: '6px',
                                                textTransform: 'none',
                                                ...(isAttachmentLimitReached && {
                                                    opacity: 0.5,
                                                    cursor: 'not-allowed'
                                                })
                                            }}
                                            title={isAttachmentLimitReached ? `Maximum ${MAX_ATTACHMENTS} attachments allowed` : 'Add File'}
                                        >
                                            Add File
                                        </Button>
                                    )}
                                </Box>

                                {isAttachmentLimitReached && (
                                    <Box sx={{
                                        mb: 1,
                                        p: 1,
                                        backgroundColor: 'warning.light',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'warning.main'
                                    }}>
                                        <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 500 }}>
                                            Maximum attachment limit ({MAX_ATTACHMENTS}) reached. Remove existing files to add new ones.
                                        </Typography>
                                    </Box>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelected}
                                    accept="*/*"
                                    disabled={isAttachmentLimitReached}
                                />
                                {editableTask.documents && editableTask.documents.length > 0 ? (
                                    <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                        {editableTask.documents.map((doc, index) => (
                                            <ListItem key={doc.documentId || index} sx={{ py: 1 }}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                                                        <AttachFileOutlinedIcon fontSize="small" />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={<Typography variant="body2" fontWeight="500">{doc.documentName}</Typography>}
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary">
                                                            {doc.documentType} • {doc.createdAt ? format(parseISO(doc.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                                                        </Typography>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    {doc.filePath && (
                                                        <Button
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                            variant="outlined"
                                                            onClick={() => window.open(`${ASSETS_BASE_URL}${doc.filePath}`, '_blank')}
                                                        >
                                                            View
                                                        </Button>
                                                    )}
                                                    {canUpdateTask && (
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            onClick={() => handleRemoveDocument(doc.documentId)}
                                                            size="small"
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" color='error' />
                                                        </IconButton>
                                                    )}
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover' }}>
                                        <AttachFileOutlinedIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">No attachments yet</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Divider sx={{ my: 2.5 }} />

                        {shouldShowAllTabs && (
                            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                                <Tabs
                                    value={activeSubTab}
                                    onChange={handleSubTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{ mb: 1 }}
                                >
                                    <Tab
                                        icon={<AccountTreeOutlinedIcon />}
                                        iconPosition="start"
                                        label={`Sub-tasks (${editableTask.subtasks?.length || 0})`}
                                        sx={{ minHeight: 'auto', py: 1, fontSize: '0.875rem' }}
                                    />
                                </Tabs>

                                <TabPanel value={activeSubTab} index={0}>
                                    <CommentsSectionInner
                                        comments={editableTask.comments || []}
                                        onAddComment={handleAddComment}
                                    />
                                </TabPanel>

                                <TabPanel value={activeSubTab} index={1}>
                                    <SubTasksSection
                                        parentTask={editableTask}
                                        subTasks={editableTask.subtasks || []}
                                        onSubTaskClick={handleSubTaskClick}
                                    />
                                </TabPanel>

                                <TabPanel value={activeSubTab} index={2}>
                                    <ActivityLogSectionInner activityLog={editableTask.activityLog || []} />
                                </TabPanel>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>

            {selectedSubTask && (
                <TaskDetailModal
                    open={subTaskDetailModalOpen}
                    onClose={handleCloseSubTaskModal}
                    task={selectedSubTask}
                    onUpdateTask={handleUpdateSubTaskFromModal}
                    projectContextName="Subtask"
                    isSubTask={true}
                />
            )}
        </>
    );
}
