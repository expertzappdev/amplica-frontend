import React, { useState } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemText, Box, Chip,
  Button, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { differenceInDays, parseISO, isValid } from 'date-fns';

// Import task detail modal and related redux
import TaskDetailModal from '../../task/taskDetail/TaskDetailModal';
import {
  updateTaskRequest,
  selectAllTasks,
  updateTaskSuccess,
  getTaskByIdRequest as getTaskDetailsById
} from '../../../redux/features/tasks/taskSlice';
import { selectUser } from '../../../redux/features/auth/authSlice';
import { selectStatusItems } from '../../../redux/features/projects/projectSlice';

const MyTasksCard = ({ tasks, isLoading, error }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Modal state
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);

  // Redux selectors for task update functionality
  const taskItems = useSelector(selectAllTasks) || { items: [], totalCount: 0 };
  const statusData = useSelector(selectStatusItems) || [];
  const currentUser = useSelector(selectUser);

  // Priority options (should match your TaskView)
  const priorityOptions = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              My Tasks
            </Typography>
          </Box>
          <Typography>Loading tasks...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              My Tasks
            </Typography>
          </Box>
          <Alert severity="error">Failed to load tasks: {error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    const statusMap = {
      'Completed': 'success',
      'InProgress': 'warning',
      'On Progress': 'primary',
      'Delayed': 'error',
      'InReview': 'default',
      'Open': 'info',
      'Cancelled': 'error',
      'Active': 'primary',
      'NotStarted': 'default',
    };
    return statusMap[status] || 'default';
  };

  // Determine if task is overdue
  const getTaskStatus = (task) => {
    if (task.status) return task.status;

    if (task.endDate) {
      try {
        const dueDate = parseISO(task.endDate);
        if (isValid(dueDate)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysDiff = differenceInDays(dueDate, today);

          if (daysDiff < 0) {
            return 'Overdue';
          }
        }
      } catch (e) {
        console.error('Date parsing error:', e);
      }
    }

    return 'Pending';
  };

  const handleShowAllTasks = () => {
    navigate('/app/tasks');
  };

  // Handle task click to open detail modal
  const handleTaskClick = (task) => {
    // CRITICAL: Fetch fresh task data with full assignedUsers array
    if (task.id || task.taskId) {
        dispatch(getTaskDetailsById(task.id || task.taskId));
    }

    // Find the original task data from the Redux store
    const originalTask = taskItems.items?.find(t => t.taskId === task.id);

    if (originalTask) {
      setSelectedTaskForDetail(originalTask);
      setTaskDetailModalOpen(true);
    } else {
      console.warn('Original task data not found for task ID:', task.id);
      // Fallback: create a mock task object with available data
      const mockTask = {
        taskId: task.id,
        title: task.title,
        statusName: task.status,
        endDate: task.endDate,
        startDate: task.startDate,
        description: task.description || '',
        projectName: task.category,
        projectId: task.projectId,
        taskListId: task.taskListId,
        assignedToUserName: task.assignedToUserName,
        priorityName: task.priority || 'Medium',
        progression: task.progression || 0
      };
      setSelectedTaskForDetail(mockTask);
      setTaskDetailModalOpen(true);
    }
  };

  const handleCloseTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTaskForDetail(null);
  };

  // Handle task update from modal (similar to TaskView)
  const handleUpdateTaskFromModal = (updatedTaskData) => {
    // Fallback to selectedTaskForDetail if the task was removed from the list (e.g., filtered out)
    const taskToUpdate = taskItems.items?.find(t => t.taskId === updatedTaskData.id) || selectedTaskForDetail;

    if (taskToUpdate) {
      const statusOption = statusData.find(status => status.name === updatedTaskData.statusName);
      const priorityOption = priorityOptions.find(priority => priority.value === updatedTaskData.priority);

      const extractAssigneeIds = (t) => {
        if (!t) return [];
        if (t.assignedUsers && Array.isArray(t.assignedUsers)) {
          if (t.assignedUsers.length > 0) {
            return t.assignedUsers.map(user => user.userId);
          }
        }
        if (t.assignedToUserId) {
          return [t.assignedToUserId];
        }
        return [];
      };

      // UPDATED: Extract assignee IDs or use provided ones
      const assigneeIdsToSend = updatedTaskData.assignedUserIds
        || extractAssigneeIds(taskToUpdate);

      const taskData = {
        title: updatedTaskData.title || taskToUpdate.title,
        statusId: statusOption?.statusId || statusOption?.id,
        startDate: updatedTaskData.startDate || taskToUpdate.startDate,
        endDate: updatedTaskData.endDate || taskToUpdate.endDate,
        priorityId: priorityOption?.value || 2,
        description: updatedTaskData.description || taskToUpdate.description || '',
        taskListId: updatedTaskData.taskListId,
        // UPDATED: Send array of assignee IDs
        assignedUserIds: assigneeIdsToSend.length > 0 ? assigneeIdsToSend : [currentUser?.id],
        estimatedHours: updatedTaskData.estimatedHours || 0,
      };

      // OPTIMISTIC UPDATE
      // This immediately updates Redux state (and therefore the dashboard background) 
      // AND updates the modal state so it doesn't flicker/revert when the API fetch finishes.
      const optimisticTask = {
        ...taskToUpdate,
        status: updatedTaskData.statusName,
        statusName: updatedTaskData.statusName,
        statusId: statusOption?.statusId || statusOption?.id,
        title: taskData.title,
        description: taskData.description,
      };

      dispatch(updateTaskSuccess(optimisticTask));
      setSelectedTaskForDetail(optimisticTask);

      dispatch(updateTaskRequest({ taskId: updatedTaskData.id, taskData }));
    }
  };

  // Show only first 5 tasks
  const displayTasks = (tasks || []).slice(0, 5);

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              My Tasks
            </Typography>
            <Button
              variant="outlined"
              size="small"
              // endIcon={<ArrowForwardIcon />}
              onClick={handleShowAllTasks}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                py: 0.5
              }}
            >
              Show All Tasks
            </Button>
          </Box>

          <List sx={{ minHeight: 280, overflow: 'auto' }}>
            {displayTasks.length > 0 ? (
              displayTasks.map((task, index) => {
                const taskStatus = getTaskStatus(task);

                return (
                  <ListItem
                    key={task.id || index}
                    disablePadding
                    sx={{
                      borderBottom: index < displayTasks.length - 1 ? '1px solid #eee' : 'none',
                      // py: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '8px'
                      },
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <ListItemText
                      primary={task.title}
                      secondary={task.category}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        mb: 0.5,
                        fontWeight: 500,
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '250px',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Box sx={{ textAlign: 'right', minWidth: 'fit-content', ml: 1 }}>
                      <Chip
                        label={taskStatus}
                        color={getStatusColor(taskStatus)}
                        size="small"
                        sx={{
                          mb: 0.5,
                          fontSize: '0.7rem',
                          height: '20px'
                        }}
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {task.dueDate}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ py: 4 }}
                    >
                      No tasks available
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>

          {/* Footer with total count */}
          {/* {tasks && tasks.length > 5 && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid #eee',
              textAlign: 'center'
            }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                Showing 5 of {tasks.length} tasks
              </Typography>
            </Box>
          )} */}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          open={isTaskDetailModalOpen}
          onClose={handleCloseTaskDetailModal}
          task={selectedTaskForDetail}
          onUpdateTask={handleUpdateTaskFromModal}
        />
      )}
    </>
  );
};

export default MyTasksCard;
