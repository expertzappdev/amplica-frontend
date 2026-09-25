import { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Box, Typography, IconButton, 
  Tooltip, Paper, Chip, Avatar, AvatarGroup
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectStatusItems } from '../../redux/features/projects/projectSlice';
import { Link as RouterLink } from 'react-router-dom';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import StatusDropdown from '../../uiComponent/statusdropdown/StatusDropdown';
import ProgressDisplay from '../../uiComponent/progressbar/ProgressDisplay';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { useCan } from '../../hooks/useCan';

const taskHeadCells = [
  { id: 'serialNumber', label: 'S.No', minWidth: 40, align: 'center', sortable: false },
  { id: 'title', label: 'Task Name', minWidth: 230, sortable: true },
  { id: 'projectName', label: 'Project', minWidth: 150, sortable: false },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 150, sortable: false },
  { id: 'statusName', label: 'Status', minWidth: 120, sortable: true },
  { id: 'priority', label: 'Priority', minWidth: 90, sortable: false },
  { id: 'startDate', label: 'Start Date', minWidth: 120, sortable: true },
  { id: 'endDate', label: 'Due Date', minWidth: 220, sortable: true },
  { id: 'completion', label: 'Progress', minWidth: 100, sortable: false },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'center', sortable: false },
];

const tableCellStyle = {
  borderRight: '1px solid',
  borderColor: 'divider',
  '&:last-of-type': {
    borderRight: 0,
  },
  py: 0.7,
  px: 1.5,
};

const tableHeaderCellStyle = {
  ...tableCellStyle,
  fontWeight: 'bold',
  color: 'text.primary',
  backgroundColor: 'grey.100',
  py: 0.5,
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
  return {
    backgroundColor: styles.bgColor,
    color: styles.color,
    border: `1px solid ${styles.borderColor}`,
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
  };
};

const getStartDateDisplay = (startDateStr) => {
  try {
    const start = parseISO(startDateStr);
    if (!isValid(start)) return startDateStr;
    return format(start, 'dd/MM/yyyy');
  } catch {
    return startDateStr;
  }
};

const getDueDateDisplay = (dueDateStr) => {
  try {
    const due = parseISO(dueDateStr);
    if (!isValid(due)) return dueDateStr;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDateNormalized = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const daysDiff = differenceInDays(dueDateNormalized, now);
    let relativeText = '';
    let textColor = 'text.secondary';
    
    if (daysDiff < 0) {
      relativeText = `(${Math.abs(daysDiff)} days ago)`;
      textColor = 'error.main';
    } else if (daysDiff === 0) {
      relativeText = `(Today)`;
      textColor = 'warning.main';
    } else if (daysDiff <= 10) {
      relativeText = `(${daysDiff} days remaining)`;
      textColor = 'warning.main';
    } else {
      relativeText = `(${daysDiff} days remaining)`;
      textColor = 'success.main';
    }
    
    return (
      <Box component="span">
        {format(due, 'dd/MM/yyyy')}
        <Typography variant="caption" sx={{ ml: 0.5, color: textColor }}>
          {relativeText}
        </Typography>
      </Box>
    );
  } catch {
    return dueDateStr;
  }
};

function EnhancedTaskTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {taskHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...tableHeaderCellStyle, minWidth: headCell.minWidth }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                sx={{ '& .MuiTableSortLabel-icon': { opacity: 0.7 } }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function TaskTable({
  tasks = [],
  isLoading,
  pagination,
  sorting,
  onTaskStatusChange,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
  onAddTimelog,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { can } = useCan();
  const canUpdateTask = can('task:update');
  const canDeleteTask = can('task:delete');
  const canCreateTimelog = can('timelog:create');
  const statusData = useSelector(selectStatusItems) || [];

  // Calculate serial numbers based on pagination
  const tasksWithSerialNumbers = useMemo(() => {
    return tasks.map((task, index) => ({
      ...task,
      serialNumber: (pagination.pageNumber - 1) * pagination.pageSize + index + 1
    }));
  }, [tasks, pagination.pageNumber, pagination.pageSize]);

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskToDelete.taskListId, taskToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const getAvatarLetters = (name) => {
    if (!name) return '';
    const initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  };

 
  const renderAssignees = (task) => {
    const assignees = task.assignees || [];

    // No assignees
    if (assignees.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Unassigned
        </Typography>
      );
    }

    // Single assignee - show name and avatar
    if (assignees.length === 1) {
      const assignee = assignees[0];
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={assignee.name} arrow>
            <Avatar 
              alt={assignee.name} 
              src={assignee.avatarUrl} 
              sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
            >
              {getAvatarLetters(assignee.name)}
            </Avatar>
          </Tooltip>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {assignee.name}
          </Typography>
        </Box>
      );
    }

    // Multiple assignees - show avatar group with count
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AvatarGroup 
          max={3} 
          sx={{ 
            '& .MuiAvatar-root': { 
              width: 28, 
              height: 28, 
              fontSize: '0.75rem',
              border: '2px solid white'
            }
          }}
        >
          {assignees.map(assignee => (
            <Tooltip key={assignee.id} title={assignee.name} arrow>
              <Avatar 
                alt={assignee.name} 
                src={assignee.avatarUrl}
              >
                {getAvatarLetters(assignee.name)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        {assignees.length > 3 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            +{assignees.length - 3} more
          </Typography>
        )}
        {assignees.length <= 3 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {assignees.length} members
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="tasks table" sx={{ minWidth: 1200 }}>
          <EnhancedTaskTableHead
            order={sorting.sortOrder}
            orderBy={sorting.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {tasksWithSerialNumbers.map((task) => {
              return (
                <TableRow
                  hover
                  key={task.id}
                  sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                >
                  {/* Serial Number */}
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {task.serialNumber}
                    </Typography>
                  </TableCell>
                  
                  {/* Task Name */}
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        onClick={() => onTaskClick && onTaskClick(task)}
                        sx={{
                          fontWeight: 500,
                          cursor: 'pointer',
                          color: 'text.primary',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        {task.taskName}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Project Name */}
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {task.projectName ? (
                        <Typography
                          variant="body2"
                          component={RouterLink}
                          to={`/app/project-detail/${task.projectId}`}
                          sx={{
                            color: 'text.primary',
                            textDecoration: 'none',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {task.projectName}
                        </Typography>
                      ) : (
                        <Chip
                          label="To-Do"
                          size="small"
                          sx={{
                            backgroundColor: 'grey.200',
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            height: 24,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={tableCellStyle}>
                    {renderAssignees(task)}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    sx={{
                      ...tableCellStyle,
                      p: 0,
                      height: '40px',
                    }}
                  >
                    {canUpdateTask ? (
                      <StatusDropdown
                        currentStatus={task.status}
                        projectId={task.id}
                        onStatusChange={(id, newStatus) => 
                          onTaskStatusChange && onTaskStatusChange(task.taskListId, id, newStatus)
                        }
                      />
                    ) : (
                      <Box sx={{ 
                        px: 1.5, 
                        height: '100%', 
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

                  {/* Priority */}
                  <TableCell sx={tableCellStyle}>
                    <Chip
                      label={task.priority || 'Medium'}
                      size="small"
                      sx={getPriorityChipStyle(task.priority)}
                    />
                  </TableCell>

                  {/* Start Date */}
                  <TableCell sx={tableCellStyle}>
                    {task.startDate ? (
                      getStartDateDisplay(task.startDate)
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell sx={{
                    ...tableCellStyle,
                    color: task.dueDate && differenceInDays(parseISO(task.dueDate), new Date()) < 0 
                      ? 'error.main' 
                      : 'inherit'
                  }}>
                    {task.dueDate ? (
                      getDueDateDisplay(task.dueDate)
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>

                  {/* Progress */}
                  <TableCell align="left" sx={tableCellStyle}>
                    <ProgressDisplay value={task.completion || 0} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    {canUpdateTask || canDeleteTask || canCreateTimelog ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {canCreateTimelog && (
                          <Tooltip title="Add Timelog">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddTimelog && onAddTimelog(task);
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <AccessTimeIcon fontSize="small" color="success" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canUpdateTask && (
                          <Tooltip title="Edit Task">
                            <IconButton
                              size="small"
                              onClick={() => onEditTask && onEditTask(task)}
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDeleteTask && (
                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(task)}
                            >
                              <DeleteOutlineIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={taskHeadCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No tasks found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={pagination.totalCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageNumber - 1}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete Task: ${taskToDelete?.taskName}?`}
        message={`Are you sure you want to delete this task? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </Paper>
  );
}
