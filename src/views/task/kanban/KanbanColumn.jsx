import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { gridSpacing } from '../../../store/constant';
import { useTheme, alpha } from '@mui/material/styles';

const getStripColor = (colorHex, theme) => {
  if (colorHex && typeof colorHex === 'string') {
    if (colorHex.startsWith('#')) {
      return colorHex;
    }
    
    switch (colorHex.toLowerCase()) {
      case 'yellow':
        return theme.palette.warning.main;
      case 'blue':
        return theme.palette.info.main;
      case 'green':
        return theme.palette.success.main;
      case 'red':
        return theme.palette.error.main;
      case 'orange':
        return theme.palette.warning.main;
      case 'purple':
        return theme.palette.secondary.main;
      case 'grey':
      case 'gray':
        return theme.palette.grey[400];
      default:
        return colorHex;
    }
  }
  
  return theme.palette.grey[300];
};

export default function KanbanColumn({ 
  column, 
  onTaskCardClick, 
  isOverlay = false 
}) {
  const theme = useTheme();
  const currentGridSpacing = typeof gridSpacing === 'number' ? gridSpacing : 3;

  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setSortableNodeRef,
    transform: columnTransform,
    transition: columnTransition,
    isDragging: isColumnDragging,
  } = useSortable({ 
    id: column.id.toString(), 
    data: { type: 'COLUMN', column },
    disabled: true, 
  });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver: isTaskOverColumn,
  } = useDroppable({
    id: column.id.toString(),
    data: { type: 'COLUMN', column },
    disabled: isOverlay
  });

  const columnStripColor = getStripColor(column.stripColor, theme);

  const columnStyle = {
    transform: CSS.Transform.toString(columnTransform),
    transition: columnTransition || `transform 250ms ease, box-shadow 200ms ease, border-color 200ms ease`,
    opacity: isColumnDragging ? 0.85 : 1,
    display: 'flex',
    flexDirection: 'column',
    width: 320,
    flexShrink: 0,
    minHeight: `calc(100vh - ${theme.spacing(currentGridSpacing * 2 + 10)})`,
    // maxHeight: `calc(100vh - ${theme.spacing(currentGridSpacing * 2 + 10)})`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    boxShadow: isColumnDragging || isOverlay ? theme.shadows[8] : theme.shadows[2],
    border: isTaskOverColumn ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    cursor: 'default', 
    userSelect: 'none',
  };

  const taskListStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    p: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    backgroundColor: isTaskOverColumn ? alpha(theme.palette.primary.light, 0.1) : 'transparent',
    borderRadius: '0 0 14px 14px',
    transition: 'background-color 0.2s ease-out',
    minHeight: '150px',
  };
  
  
  return (
    <Paper
      ref={setDroppableNodeRef} 
      style={columnStyle}
      elevation={0}
      
    >
      <Box sx={{ 
        height: '6px', 
        backgroundColor: columnStripColor, 
        width: '100%', 
        flexShrink: 0 
      }} />
      
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.3),
          minHeight: '56px',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            color: 'text.primary', 
            fontSize: '1rem',
            lineHeight: 1.2
          }}>
            {column.title}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontSize: '0.75rem',
            mt: 0.25
          }}>
            {column.tasks?.length || 0} tasks
          </Typography>
        </Box>
      </Box>

      <Box sx={taskListStyle}>
        <SortableContext 
          items={column.tasks?.map(task => task.id.toString()) || []} 
          strategy={verticalListSortingStrategy}
        >
          {column.tasks?.map(task => (
            <KanbanCard 
              key={task.id} 
              task={task} 
              onClick={onTaskCardClick}
              disabled={isOverlay}
            />
          )) || []}
        </SortableContext>
        
        {(!column.tasks || column.tasks.length === 0) && (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            border: `2px dashed ${isTaskOverColumn ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: '12px',
            opacity: 0.6,
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isTaskOverColumn ? alpha(theme.palette.primary.light, 0.05) : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ 
              fontStyle: 'italic',
              fontSize: '0.875rem'
            }}>
              {isTaskOverColumn ? 'Drop task here' : 'No tasks yet'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}