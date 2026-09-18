// src/views/task/kanban/KanbanView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTheme, alpha } from '@mui/material/styles';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
// Import for cards, but not for columns anymore
import { SortableContext } from '@dnd-kit/sortable';

import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { gridSpacing } from '../../../store/constant';
import { useDispatch, useSelector } from 'react-redux';
import { selectStatusItems } from '../../../redux/features/projects/projectSlice';
import { useCan } from '../../../hooks/useCan';
import toast from 'react-hot-toast';

const transformTasksToStatusColumns = (tasks, statusData) => {
  const columnsMap = {};
  
  if (statusData && Array.isArray(statusData)) {
    statusData.forEach(status => {
      if (status && status.id !== undefined && status.id !== null) {
        columnsMap[status.id] = { 
          id: status.id, 
          title: status.name || 'Untitled',
          stripColor: status.statusColor || '#808080',
          tasks: []
        };
      } else {
        console.warn('transformTasksToStatusColumns: Invalid status object found, skipping:', status);
      }
    });
  }

  if (tasks && Array.isArray(tasks)) {
    tasks.forEach(task => {
      if (task && task.id !== undefined && task.id !== null) {
        let matchingStatusId = null;
        
        if (task.statusId !== undefined && task.statusId !== null) {
          matchingStatusId = task.statusId;
        } 
        else if (task.status) { 
          const status = statusData.find(s => s && s.name === task.status);
          matchingStatusId = status ? status.id : null; 
        }
        
        if (matchingStatusId !== null && columnsMap[matchingStatusId]) {
          columnsMap[matchingStatusId].tasks.push({
            ...task,
            currentStatusId: matchingStatusId 
          });
        } else {
          console.warn(`transformTasksToStatusColumns: Task ${task.id} (status: "${task.status || task.statusId}") could not be mapped to an existing column. Attempting fallback.`);
          const firstValidStatus = statusData.find(s => s && s.id !== undefined && s.id !== null);
          if (firstValidStatus && columnsMap[firstValidStatus.id]) { 
            columnsMap[firstValidStatus.id].tasks.push({
              ...task,
              currentStatusId: firstValidStatus.id
            });
          } else {
            console.error(`transformTasksToStatusColumns: Failed to add task ${task.id}: No matching column found and no valid first column for fallback.`);
          }
        }
      } else {
        console.warn('transformTasksToStatusColumns: Invalid task object found, skipping:', task);
      }
    });
  }

  return columnsMap;
};

export default function KanbanView({ 
  tasks = [], 
  onTaskCardClick,
  onTaskStatusChange,
  onAddTask
}) {
  const theme = useTheme();
  const statusData = useSelector(selectStatusItems) || []; 
  const { can } = useCan();
  const canUpdateTask = can('task:update');
  
  const [columns, setColumns] = useState({});
  const [columnsOrder, setColumnsOrder] = useState([]);
  const [activeItem, setActiveItem] = useState(null); 

  useEffect(() => {
    if (statusData && Array.isArray(statusData) && statusData.length > 0) {
      const order = statusData
        .filter(status => status && status.id !== undefined && status.id !== null)
        .map(status => ({
          id: status.id, 
          title: status.name || 'Untitled',
          stripColor: status.statusColor || '#808080'
        }));
      setColumnsOrder(order);
    } else {
      setColumnsOrder([]);
    }
  }, [statusData]);

  useEffect(() => {
    if (tasks.length > 0 && statusData.length > 0) {
      const transformed = transformTasksToStatusColumns(tasks, statusData);
      setColumns(transformed);
    } else if (tasks.length === 0 && statusData.length > 0) {
      const transformed = transformTasksToStatusColumns([], statusData); 
      setColumns(transformed);
    } else {
      setColumns({});
    }
  }, [tasks, statusData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  const findColumnOfTask = useCallback((taskId, currentCols = columns) => {
    const taskIdString = taskId?.toString(); 
    if (!currentCols || !taskIdString) return null;
    
    for (const columnId in currentCols) {
      if (currentCols[columnId]?.tasks?.find(task => task && task.id?.toString() === taskIdString)) {
        return columnId;
      }
    }
    return null;
  }, [columns]); 

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (!active || !active.data?.current) return;
    
    const type = active.data.current.type;
    if (type === 'TASK') {
      setActiveItem({ id: active.id, type: 'TASK', data: { ...active.data.current.task, originalColumnId: active.data.current.task.currentStatusId } });
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over || !active.id || active.id === over.id || !active.data?.current) return;

    const activeType = active.data.current.type;
    const overType = over.data?.current?.type;

    if (activeType === 'TASK') {
      const sourceColumnId = findColumnOfTask(active.id);
      const targetColumnId = overType === 'COLUMN' ? over.id : findColumnOfTask(over.id);

      if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) return;

      setColumns((prev) => {
        const newCols = { ...prev };
        
        const sourceTasks = newCols[sourceColumnId]?.tasks || [];
        const destTasks = newCols[targetColumnId]?.tasks || [];
        
        const activeIndexInSource = sourceTasks.findIndex(t => t && t.id === active.id);
        if (activeIndexInSource === -1) {
            return prev; 
        }

        const [movedItem] = newCols[sourceColumnId].tasks.splice(activeIndexInSource, 1);
        
        let newIndexInDest = destTasks.length; 
        if (overType === 'TASK' && over.id !== active.id) {
          const overTaskIndex = destTasks.findIndex(t => t && t.id === over.id);
          if (overTaskIndex !== -1) {
            newIndexInDest = overTaskIndex;
          }
        }
        
        movedItem.currentStatusId = parseInt(targetColumnId);
        newCols[targetColumnId].tasks.splice(newIndexInDest, 0, movedItem);

        return newCols;
      });
    }
  }, [findColumnOfTask]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveItem(null); 

    if (!over || !active.data?.current) {
        setColumns(transformTasksToStatusColumns(tasks, statusData)); 
        return;
    }

    const activeType = active.data.current.type;
    
    if (activeType === 'TASK') {
      const taskData = active.data.current.task;
      const sourceColumnId = activeItem?.data?.originalColumnId; 
      
      let destinationColumnId = null;
      if (over.data?.current?.type === 'COLUMN') {
          destinationColumnId = over.id; 
      } 
      else if (over.data?.current?.type === 'TASK') {
          destinationColumnId = findColumnOfTask(over.id, columns); 
      }

      if (over.id === active.id && over.data?.current?.type === 'TASK' && sourceColumnId !== findColumnOfTask(active.id, columns)) {
          const currentVisualColumnId = findColumnOfTask(active.id, columns);
          if (currentVisualColumnId) {
            destinationColumnId = currentVisualColumnId;
          } else {
            setColumns(transformTasksToStatusColumns(tasks, statusData)); 
            return;
          }
      }
      
      if (!sourceColumnId || !destinationColumnId || !taskData) {
          setColumns(transformTasksToStatusColumns(tasks, statusData)); 
          return;
      }

      if (parseInt(sourceColumnId) !== parseInt(destinationColumnId)) { 
        const targetStatus = statusData.find(s => s && s.id === parseInt(destinationColumnId));

        if (!canUpdateTask) {
          toast.error("You don't have permission to update task.");
          setColumns(transformTasksToStatusColumns(tasks, statusData));
          return;
        }

        if (targetStatus && onTaskStatusChange) {
          onTaskStatusChange(taskData.taskListId, taskData.taskId, targetStatus.name);
        } else {
            setColumns(transformTasksToStatusColumns(tasks, statusData));
        }
      }
    }
  }, [columns, findColumnOfTask, statusData, onTaskStatusChange, activeItem, tasks]); 

  const handleAddTaskToColumn = (columnId) => {
    if (onAddTask && columnId !== undefined) {
      const status = statusData.find(s => s && s.id === parseInt(columnId));
      onAddTask(status ? status.name : 'To Do');
    }
  };

  const currentGridSpacing = typeof gridSpacing === 'number' ? gridSpacing : 3;
  const validColumnsOrder = columnsOrder.filter(col => col && col.id !== undefined);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <Box sx={{
        display: 'flex',
        gap: `${currentGridSpacing * 8}px`, 
        overflowX: 'auto',
        pb: 2,
        alignItems: 'flex-start',
        flexGrow: 1,
        minHeight: 'calc(100vh - 350px)',
        px: 1
      }}>
        {validColumnsOrder.map(colDetails => {
            const column = columns[colDetails.id];
            return column ? (
              <KanbanColumn
                key={column.id}
                column={{ ...column, stripColor: colDetails.stripColor }} 
                onTaskCardClick={onTaskCardClick}
                onAddTaskToColumn={() => handleAddTaskToColumn(colDetails.id)}
              />
            ) : (
              <Box key={colDetails.id} sx={{ width: 320, flexShrink: 0 }} /> 
            );
        })}

        {validColumnsOrder.length === 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '200px',
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: '16px',
            backgroundColor: alpha(theme.palette.background.default, 0.5)
          }}>
            <Typography variant="h6" color="text.secondary">
              No status columns available. Please ensure statuses are configured in your backend.
            </Typography>
          </Box>
        )}
      </Box>
      
      <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.9' } } })}>
        {activeItem?.type === 'TASK' && activeItem.data ? (
          <KanbanCard task={activeItem.data} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}