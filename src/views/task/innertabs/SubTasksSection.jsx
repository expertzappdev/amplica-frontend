import React, { useState } from 'react';
import {
    Box, Typography, Button, List, ListItem, ListItemText, IconButton, Avatar, ListItemAvatar,
    Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useDispatch, useSelector } from 'react-redux';
import { 
    createSubTaskRequest, 
    updateTaskRequest, 
    deleteTaskRequest,
    getTaskByIdRequest
} from '../../../redux/features/tasks/taskSlice';
import { selectStatusItems } from '../../../redux/features/projects/projectSlice';
import { format, parseISO, isValid } from 'date-fns';
import { useCan } from '../../../hooks/useCan';
import AddTaskDrawer from '../../../components/addTask/AddTaskDrawer';

const priorityOptions = [
    { label: 'Low', value: 1, color: 'success' },
    { label: 'Medium', value: 2, color: 'warning' },
    { label: 'High', value: 3, color: 'error' },
];

export default function SubTasksSection({ 
    parentTask, 
    subTasks = [], 
    onSubTaskClick 
}) {
    const dispatch = useDispatch();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [addSubTaskDrawerOpen, setAddSubTaskDrawerOpen] = useState(false);
    const statusData = useSelector(selectStatusItems) || [];
    const { can } = useCan();
    const canUpdateTask = can('task:update');
    const canDeleteTask = can('task:delete');

    const handleOpenAddSubTaskDrawer = () => {
        setAddSubTaskDrawerOpen(true);
    };

    const handleCloseAddSubTaskDrawer = () => {
        setAddSubTaskDrawerOpen(false);
        // Refresh parent task to get updated subtasks after creation
        setTimeout(() => {
            dispatch(getTaskByIdRequest(parentTask.taskId));
        }, 500);
    };

    const handleDeleteSubTask = (subTaskId, event) => {
        // Prevent event bubbling to avoid opening task detail modal
        event.stopPropagation();
        const subTask = subTasks.find(st => st.taskId === subTaskId);
        setTaskToDelete(subTask);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            dispatch(deleteTaskRequest({ taskId: taskToDelete.taskId }));
            setDeleteDialogOpen(false);
            setTaskToDelete(null);
            
            // Refresh parent task to get updated subtasks
            setTimeout(() => {
                dispatch(getTaskByIdRequest(parentTask.taskId));
            }, 500);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
    };

    const getPriorityColor = (priorityName) => {
        const priority = priorityOptions.find(p => p.label.toLowerCase() === priorityName?.toLowerCase());
        return priority?.color || 'default';
    };

    const isTaskCompleted = (statusName) => {
        return statusName && (
            statusName.toLowerCase().includes('completed') || 
            statusName.toLowerCase().includes('done') ||
            statusName.toLowerCase().includes('closed')
        );
    };

    const handleSubTaskClick = (subTask, event) => {
        // Prevent click if it's on delete button
        if (event.target.closest('.delete-subtask-btn')) {
            return;
        }
        
        if (onSubTaskClick) {
            onSubTaskClick(subTask);
        }
    };

    return (
        <Box>
            {/* Add new subtask button */}
            {canUpdateTask && (
                <Box sx={{ mb: 2 }}>
                    <Button 
                        variant="outlined" 
                        onClick={handleOpenAddSubTaskDrawer}
                        startIcon={<AddIcon />} 
                        fullWidth
                        sx={{ 
                            borderStyle: 'dashed',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderStyle: 'solid',
                                backgroundColor: 'primary.lighter'
                            }
                        }}
                    >
                        Add Sub-task
                    </Button>
                </Box>
            )}
            
            {/* Subtasks list */}
            <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {subTasks.length === 0 && (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 3, 
                        border: '2px dashed', 
                        borderColor: 'divider', 
                        borderRadius: 2,
                        backgroundColor: 'action.hover'
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No sub-tasks added yet
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Add a sub-task to break down this task into smaller pieces
                        </Typography>
                    </Box>
                )}
                
                {subTasks.map((subTask, index) => {
                    const isCompleted = isTaskCompleted(subTask.statusName);
                    
                    return (
                        <ListItem 
                            key={subTask.taskId} 
                            disablePadding 
                            sx={{ 
                                mb: 1,
                                border: '1px solid',
                                borderColor: isCompleted ? 'success.light' : 'divider',
                                borderRadius: 2,
                                p: 1.5,
                                backgroundColor: isCompleted ? 'success.lighter' : 'background.paper',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: isCompleted ? 'success.light' : 'action.hover',
                                    '& .delete-subtask-btn': { 
                                        opacity: 1 
                                    },
                                    transform: 'translateX(2px)',
                                    boxShadow: 1
                                },
                                transition: 'all 0.2s ease'
                            }}
                            onClick={(event) => handleSubTaskClick(subTask, event)}
                        >
                            <ListItemAvatar sx={{ minWidth: 36 }}>
                                <Avatar 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        backgroundColor: isCompleted ? 'success.main' : 'grey.300',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {subTask.title.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            
                            <ListItemText 
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                textDecoration: isCompleted ? 'line-through' : 'none', 
                                                color: isCompleted ? 'text.disabled' : 'text.primary',
                                                fontWeight: 500,
                                                flexGrow: 1
                                            }}
                                        >
                                            {subTask.title}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                        {/* Status Chip - Display Only */}
                                        <Chip 
                                            label={subTask.statusName} 
                                            size="small" 
                                            variant="outlined"
                                            color={isCompleted ? 'success' : 'default'}
                                            sx={{ 
                                                fontSize: '0.7rem', 
                                                height: 20
                                            }}
                                        />

                                        {/* Priority Chip - Display Only */}
                                        <Chip 
                                            label={subTask.priorityName} 
                                            size="small" 
                                            variant="outlined"
                                            color={getPriorityColor(subTask.priorityName)}
                                            sx={{ 
                                                fontSize: '0.7rem', 
                                                height: 20
                                            }}
                                        />

                                        {/* Assignee Info */}
                                        {subTask.assignedToUserName && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {subTask.assignedToUserName}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Due Date */}
                                        {subTask.endDate && (
                                            <Typography variant="caption" color="text.secondary">
                                                Due: {format(parseISO(subTask.endDate), 'MMM dd')}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                            
                            {/* Delete Button */}
                            {canDeleteTask && (
                                <IconButton
                                    className="delete-subtask-btn"
                                    edge="end"
                                    aria-label="delete"
                                    onClick={(event) => handleDeleteSubTask(subTask.taskId, event)}
                                    sx={{ 
                                        opacity: 0, 
                                        transition: 'opacity 0.2s',
                                        color: 'error.main',
                                        p: 0.5,
                                        '&:hover': {
                                            backgroundColor: 'error.lighter'
                                        }
                                    }}
                                    size="small"
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            )}
                        </ListItem>
                    );
                })}
            </List>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete Sub-task
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete the sub-task "{taskToDelete?.title}"? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add SubTask Drawer */}
            <AddTaskDrawer
                open={addSubTaskDrawerOpen}
                onClose={handleCloseAddSubTaskDrawer}
                isSubTask={true}
                parentTask={parentTask}
            />
        </Box>
    );
}
