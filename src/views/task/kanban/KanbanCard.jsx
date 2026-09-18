// src/views/task/kanban/KanbanCard.jsx
import React from 'react';
import { Paper, Box, Typography, Avatar, Chip, Tooltip, Stack } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SubjectOutlinedIcon from '@mui/icons-material/SubjectOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';

const getPriorityStyles = (priority, theme) => {
  const p = priority?.toLowerCase();
  switch (p) {
    case 'high':
      return { color: theme.palette.error.dark, iconColor: theme.palette.error.main, label: "High" };
    case 'medium':
      return { color: theme.palette.warning.dark, iconColor: theme.palette.warning.main, label: "Medium" };
    case 'low':
      return { color: theme.palette.success.dark, iconColor: theme.palette.success.main, label: "Low" };
    default:
      return { color: theme.palette.text.secondary, iconColor: theme.palette.text.disabled, label: priority || "Medium" };
  }
};

const getAvatarLetters = (name) => {
  if (!name) return '';
  const initials = name.match(/\b\w/g) || [];
  return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

export default function KanbanCard({ 
  task, 
  isOverlay = false, 
  onClick, 
  disabled = false 
}) {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id.toString(), 
    data: { type: 'TASK', task },
    disabled: disabled || isOverlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || `all 200ms ease-in-out`,
    opacity: isDragging && !isOverlay ? 0.65 : 1,
    cursor: disabled ? 'default' : 'grab',
    listStyle: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...(isOverlay && {
      transform: `${CSS.Transform.toString(transform) || ''} rotate(2deg) scale(1.03)`,
      boxShadow: theme.shadows?.[16],
      cursor: 'grabbing',
      zIndex: 1300,
    }),
  };

  const priorityStyles = getPriorityStyles(task.priority, theme);

  const formatDate = (dateString) => {
    if (!dateString || !isValid(parseISO(dateString))) return null;
    return format(parseISO(dateString), 'MMM dd');
  };

  const isOverdue = (dateString) => {
    if (!dateString || !isValid(parseISO(dateString))) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseISO(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleCardClick = (e) => {
    if (isDragging || disabled || (e.target.closest('a, button, [role="button"]') && !e.target.closest('[role="button"]'))) return;
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={0}
      sx={{
        borderRadius: '8px',
        backgroundColor: theme.palette.background.paper,
        userSelect: 'none',
        border: '1px solid',
        borderColor: isDragging || isOverlay ? theme.palette.primary.main : theme.palette.divider,
        transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: !isDragging && !isOverlay && !disabled ? theme.palette.primary.light : undefined,
          boxShadow: !isDragging && !isOverlay && !disabled ? `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}` : undefined,
          transform: !isDragging && !isOverlay && !disabled ? 'translateY(-1px)' : undefined,
        },
        p: 1, // Increased padding slightly
      }}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(e)}
    >
      {/* Progress Bar */}
      <Box sx={{ 
        height: '3px', 
        backgroundColor: theme.palette.grey?.[200], 
        width: '100%', 
        position: 'absolute', 
        top: 0, 
        left: 0 
      }}>
        <Box sx={{ 
          height: '100%', 
          backgroundColor: theme.palette.primary.main, 
          width: `${task.completion || 0}%`, 
          transition: 'width 0.3s ease' 
        }} />
      </Box>

      {/* Main Card Content Area */}
      <Box sx={{ }}>
        {/* Priority and Completion */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlagOutlinedIcon sx={{ 
              fontSize: '0.8rem', // Adjusted size
              color: priorityStyles.iconColor, 
              mr: 0.5 // Adjusted margin
            }} />
            <Typography variant="caption" sx={{ 
              fontWeight: 600, 
              color: priorityStyles.color, 
              lineHeight: 1.2, 
              fontSize: '0.7rem' // Adjusted font size
            }}>
              {priorityStyles.label.toUpperCase()}
            </Typography>
          </Box>
          
          {task.completion !== undefined && (
            <Chip
              label={`${task.completion}%`}
              size="small"
              sx={{
                ml: 0.5,
                fontSize: '0.7rem', // Adjusted font size
                height: '20px', // Adjusted height
                borderRadius: '5px',
                backgroundColor: 'action.selected',
                fontWeight: 500,
                px: '6px'
              }}
            />
          )}
        </Box>

        {/* Task Name */}
        <Typography
          variant="subtitle1" // Reverted to subtitle1, adjust sx for size
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem', // Adjusted font size
            lineHeight: 1.3,
            wordBreak: 'break-word',
            mb: 0.5,
            color: 'text.primary',
            '&:hover': { 
              color: onClick && !disabled ? theme.palette.primary.main : 'text.primary' 
            },
            cursor: onClick && !disabled ? 'pointer' : 'grab',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2, // Allow up to 2 lines for task name
            WebkitBoxOrient: 'vertical',
            minHeight: '2.6em', // Ensure height for 2 lines if needed
          }}
        >
          {task.taskName}
        </Typography>

        {/* Description REMOVED */}
        {/* Avatar REMOVED */}

        {/* Bottom Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mt="auto">
          {/* Task Info */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden', flexGrow: 1 }}>
            <Tooltip title={`Task ID: ${task.id}`}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'text.secondary', 
                minWidth: 0 
              }}>
                <SubjectOutlinedIcon sx={{ 
                  fontSize: '0.875rem', // Adjusted size
                  mr: 0.5, // Adjusted margin
                  flexShrink: 0 
                }} />
                <Typography variant="caption" sx={{ 
                  fontSize: '0.75rem', // Adjusted font size
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  #{task.id}
                </Typography>
              </Box>
            </Tooltip>
            
            {formatDate(task.dueDate) && (
              <Tooltip title={`Due: ${formatDate(task.dueDate)}`}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: isOverdue(task.dueDate) ? 'error.main' : 'text.secondary', 
                  minWidth: 0 
                }}>
                  <CalendarTodayOutlinedIcon sx={{ 
                    fontSize: '0.875rem', // Adjusted size
                    mr: 0.5, // Adjusted margin
                    flexShrink: 0 
                  }} />
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.75rem', // Adjusted font size
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {formatDate(task.dueDate)}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Stack>

          {/* Assignee Avatar (Still removed) */}
        </Stack>

        {/* Project Name */}
        {task.projectName && (
          <Box sx={{ mt: 1, pt: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {task.projectName}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}