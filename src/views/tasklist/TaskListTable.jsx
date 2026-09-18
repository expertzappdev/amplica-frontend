import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, IconButton, Collapse, Tooltip, Paper, Button, Chip, Avatar, AvatarGroup
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Can from '../../uiComponent/Can';
import StatusDropdown from '../../uiComponent/statusdropdown/StatusDropdown';
import ProgressDisplay from '../../uiComponent/progressbar/ProgressDisplay';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectStatusItems } from '../../redux/features/projects/projectSlice';
import { useCan } from '../../hooks/useCan';

// Updated head cells with S.No instead of taskId
const taskHeadCells = [
  { id: 'groupControl', label: '', minWidth: 50, align: 'center', noBorderRight: true },
  { id: 'serialNumber', label: 'S.No', minWidth: 50 },
  { id: 'taskName', label: 'Task Name', minWidth: 280 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 110 },
  { id: 'status', label: 'Status', minWidth: 150 },
  { id: 'startDate', label: 'Start Date', minWidth: 110 },
  { id: 'dueDate', label: 'Due Date', minWidth: 170 },
  { id: 'priority', label: 'Priority', minWidth: 120 },
  { id: 'completion', label: 'Completion %', minWidth: 120, align: 'right' },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'center' },
];

const commonCellStyle = {
  py: 0.75,
  px: 1.5,
  borderRight: '1px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  '&:last-of-type': {
    borderRight: 0,
  },
};

const tableHeaderCellStyle = {
  ...commonCellStyle,
  fontWeight: 600,
  color: 'text.primary',
  py: 0.75,
  backgroundColor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
  borderBottom: '2px solid',
  borderColor: 'divider',
};

const taskListRowStyle = {
  backgroundColor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.700',
  '& > td': {
    ...commonCellStyle,
    fontWeight: 600,
    color: 'text.primary',
    py: 0.75,
  }
};

const taskRowCellStyle = {
  ...commonCellStyle,
  py: 0,
  backgroundColor: 'background.default',
};

const getPriorityChipStyle = (priority) => {
  const p = priority?.toLowerCase();
  const themeColors = {
    high: { bgColor: 'error.lighter', color: 'error.dark', borderColor: 'error.main' },
    medium: { bgColor: 'warning.lighter', color: 'warning.dark', borderColor: 'warning.main' },
    low: { bgColor: 'success.lighter', color: 'success.dark', borderColor: 'success.main' },
    default: { bgColor: 'grey.200', color: 'text.secondary', borderColor: 'grey.400' },
  };
  const styles = themeColors[p] || themeColors.default;
  return { backgroundColor: styles.bgColor, color: styles.color, border: `1px solid ${styles.borderColor}`, height: '24px', fontSize: '0.75rem', padding: '0px 6px', fontWeight: 500 };
};

// Updated date display functions for DD/MM/YYYY format
const getStartDateDisplay = (startDateStr) => {
  try {
    if (!startDateStr) return 'N/A';
    const date = parseISO(startDateStr);
    if (!isValid(date)) return startDateStr;
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return startDateStr || 'N/A';
  }
};

function EnhancedTaskTableHead() {
  return (
    <TableHead>
      <TableRow>
        {taskHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sx={{
              ...tableHeaderCellStyle,
              minWidth: headCell.minWidth,
              ...(headCell.noBorderRight && { borderRight: 'none' })
            }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function TaskListRowItem({
  taskList,
  onTaskStatusChange,
  onAddTask,
  initiallyExpanded = false,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onDeleteTaskList,
  onEditTaskList
}) {
  const [open, setOpen] = useState(initiallyExpanded);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteTaskListModalOpen, setIsDeleteTaskListModalOpen] = useState(false);
  const { can } = useCan();
  const canUpdateTask = can('task:update');
  const statusData = useSelector(selectStatusItems) || [];

  // Add serial numbers to tasks within each task list
  const tasksWithSerialNumbers = useMemo(() => {
    return (taskList.tasks || []).map((task, index) => ({
      ...task,
      serialNumber: index + 1
    }));
  }, [taskList.tasks]);

  const getDueDateDisplay = (dueDateStr) => {
    try {
      if (!dueDateStr) return <Typography variant="body2" color="text.secondary">N/A</Typography>;
      const due = parseISO(dueDateStr);
      if (!isValid(due)) return <Typography variant="body2" color="text.secondary">{dueDateStr || 'N/A'}</Typography>;

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dueDateNormalized = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const daysDiff = differenceInDays(dueDateNormalized, now);

      let relativeText = '';
      let textColor = 'text.secondary';

      if (daysDiff < 0) {
        relativeText = `(${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago)`;
        textColor = 'error.main';
      } else if (daysDiff === 0) {
        relativeText = `(Today)`;
        textColor = 'warning.main';
      } else if (daysDiff <= 10) {
        relativeText = `(${daysDiff} day${daysDiff === 1 ? '' : 's'} to go)`;
        textColor = 'warning.main';
      } else {
        relativeText = `(${daysDiff} day${daysDiff === 1 ? '' : 's'} to go)`;
        textColor = 'success.main';
      }

      return (
        <Box component="span">
          <Typography variant="body2" component="span">
            {format(due, 'dd/MM/yyyy')}
          </Typography>
          <Typography variant="caption" sx={{ ml: 0.5, color: textColor }}>
            {relativeText}
          </Typography>
        </Box>
      );
    } catch (e) {
      return <Typography variant="body2" color="text.secondary">{dueDateStr || 'N/A'}</Typography>;
    }
  };

  const handleDeleteTaskClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskList.id, taskToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleCancelDeleteTask = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteTaskListClick = () => {
    setIsDeleteTaskListModalOpen(true);
  };

  const handleConfirmDeleteTaskList = () => {
    if (onDeleteTaskList) {
      onDeleteTaskList(taskList.id);
    }
    setIsDeleteTaskListModalOpen(false);
  };

  const handleCancelDeleteTaskList = () => {
    setIsDeleteTaskListModalOpen(false);
  };

  const getAvatarLetters = (name = '') => {
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  }

  return (
    <React.Fragment>
      <TableRow sx={{ ...taskListRowStyle, '&:hover': { backgroundColor: 'action.hover' } }}>
        <TableCell sx={{ width: '50px', textAlign: 'center', ...(!open && { borderBottom: 'none' }) }} >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DragIndicatorIcon sx={{ color: 'text.disabled', fontSize: '1.1rem', mr: 0.5, opacity: 0.5, cursor: 'default' }} />
            <IconButton aria-label="expand task list" size="small" onClick={() => setOpen(!open)} sx={{ p: 0.5 }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
        </TableCell>
        <TableCell colSpan={3} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {taskList.name} ({taskList.tasks?.length || 0})
          </Typography>
        </TableCell>
        <TableCell> {/* Status for Task List - empty */} </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {taskList.startDate ? getStartDateDisplay(taskList.startDate) : ''}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {taskList.endDate ? getStartDateDisplay(taskList.endDate) : ''}
          </Typography>
        </TableCell>
        <TableCell />
        <TableCell align="right">
          {/* <ProgressDisplay value={taskList.overallProgress} /> */}
        </TableCell>
        <TableCell align="center">
          {taskList.name !== 'Default' && (
            <>
              <Can perform="task-list:update">
                <Tooltip title={`Edit Task List '${taskList.name}'`}>
                  <IconButton size="small" onClick={() => onEditTaskList(taskList)}>
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Can>
              <Can perform="task-list:delete">
                <Tooltip title={`Delete Task List '${taskList.name}'`}>
                  <IconButton size="small" onClick={handleDeleteTaskListClick}>
                    <DeleteOutlineIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </Can>
            </>
          )}
        </TableCell>
      </TableRow>

      {open && tasksWithSerialNumbers.map((task) => {
        const fullTaskData = { ...task, taskListId: taskList.id };

        return (
          <TableRow hover key={task.id} sx={{ '&:last-of-type td': { borderBottom: 0 }, backgroundColor: 'background.default' }}>
            <TableCell sx={{ ...taskRowCellStyle, borderRight: 'none' }} />

            <TableCell sx={taskRowCellStyle}>
              <Typography variant="body2" color="text.secondary">
                {task.serialNumber}
              </Typography>
            </TableCell>

            <TableCell sx={taskRowCellStyle}>
              <Typography variant="body2" fontWeight="500" onClick={() => onTaskClick(fullTaskData)} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                {task.taskName}
              </Typography>
            </TableCell>

            <TableCell sx={taskRowCellStyle}>
              <AvatarGroup max={3} sx={{ justifyContent: 'center' }}>
                {(task?.assignees || []).map(assignee => (
                  <Tooltip key={assignee?.id} title={assignee?.name}>
                    <Avatar alt={assignee?.name} src={assignee?.avatarUrl} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {getAvatarLetters(assignee.name)}
                    </Avatar>
                  </Tooltip>
                ))}
                {(task.assignees || []).length === 0 && <Typography variant="caption" color="text.secondary">Unassigned</Typography>}
              </AvatarGroup>
            </TableCell>

            <TableCell sx={{ ...taskRowCellStyle, p: '0 !important' }} onClick={(e) => e.stopPropagation()}>
              {canUpdateTask ? (
                <StatusDropdown currentStatus={task.status} projectId={task.id} onStatusChange={(id, newStatus) => onTaskStatusChange(taskList.id, id, newStatus)} sx={{ height: '40px' }} />
              ) : (
                <Box sx={{ 
                  px: 1.5, 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500,
                  backgroundColor: (statusData.find(s => s.name === task.status)?.statusColor || '#eee') + '33',
                  color: statusData.find(s => s.name === task.status)?.statusColor || 'text.secondary',
                }}>
                  {task.status}
                </Box>
              )}
            </TableCell>

            <TableCell sx={taskRowCellStyle}>
              <Typography variant="body2">
                {task.startDate ? getStartDateDisplay(task.startDate) : 'N/A'}
              </Typography>
            </TableCell>

            <TableCell sx={taskRowCellStyle}>
              {task.dueDate ? getDueDateDisplay(task.dueDate) : <Typography variant="body2" color="text.secondary">N/A</Typography>}
            </TableCell>

            <TableCell sx={{ ...taskRowCellStyle, textAlign: 'center' }}>
              <Chip size="small" label={task.priority || "N/A"} sx={{ ...getPriorityChipStyle(task.priority), borderRadius: '6px', fontWeight: 500, width: '90%' }} />
            </TableCell>

            <TableCell sx={taskRowCellStyle} align="right">
              <ProgressDisplay value={task.completion} />
            </TableCell>

            <TableCell sx={{ ...taskRowCellStyle, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <Can perform="task:update">
                <Tooltip title="Edit Task"><IconButton size="small" onClick={() => onEditTask(taskList.id, task.id)} sx={{ mr: 0.5 }}><EditIcon fontSize="small" color="primary" /></IconButton></Tooltip>
              </Can>
              <Can perform="task:delete">
                <Tooltip title="Delete Task"><IconButton size="small" onClick={() => handleDeleteTaskClick(task)}><DeleteOutlineIcon fontSize="small" color="error" /></IconButton></Tooltip>
              </Can>
            </TableCell>
          </TableRow>
        );
      })}

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCancelDeleteTask}
        onConfirm={handleConfirmDeleteTask}
        title={`Delete Task: ${taskToDelete?.taskName || ''}?`}
        message={`Are you sure you want to delete the task "${taskToDelete?.taskName}" (Serial No: ${taskToDelete?.serialNumber})? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
      <ConfirmationModal
        open={isDeleteTaskListModalOpen}
        onClose={handleCancelDeleteTaskList}
        onConfirm={handleConfirmDeleteTaskList}
        title={`Delete Task List: ${taskList.name}?`}
        message={`Are you sure you want to delete the task list "${taskList.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </React.Fragment>
  );
}

export default function TaskListTable({ taskLists, onTaskStatusChange, onAddTask, onAddTaskList, onTaskClick, onEditTask, onDeleteTask, onDeleteTaskList, onEditTaskList }) {
  if (!taskLists || taskLists.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>No task lists available for this project.</Typography>
        {/* <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddTaskList}>Add First Task List</Button> */}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
      <Table aria-label="collapsible task list table" sx={{ minWidth: 1300 }} size="small">
        <EnhancedTaskTableHead />
        <TableBody>
          {taskLists.map((taskList, index) => (
            <TaskListRowItem
              key={taskList.id}
              taskList={taskList}
              onTaskStatusChange={onTaskStatusChange}
              onAddTask={onAddTask}
              initiallyExpanded={taskLists.length === 1 || index === 0}
              onTaskClick={onTaskClick}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onDeleteTaskList={onDeleteTaskList}
              onEditTaskList={onEditTaskList}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
