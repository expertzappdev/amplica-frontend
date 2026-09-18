// components/timesheet/TimesheetList.jsx
import React from 'react';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Typography, Box, Chip, IconButton, Paper, Skeleton,
  Button, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format, parseISO } from 'date-fns';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TimesheetChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: '24px',
  backgroundColor: theme.palette.primary.lighter,
  color: theme.palette.primary.main,
}));

export default function TimesheetList({
  timesheets = [],
  onLoadMore,
  hasMore,
  loading,
  onRefresh,
  refreshing,
  myTimesheet = false
}) {

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      return `${diffHours.toFixed(1)}h`;
    } catch {
      return 'N/A';
    }
  };

  if (loading && timesheets.length === 0) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Paper key={index} sx={{ p: 2, mb: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="30%" height={20} />
          </Paper>
        ))}
      </Box>
    );
  }

  if (timesheets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No timesheets found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {myTimesheet ? "You haven't logged any time yet" : "No timesheet entries available"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List>
        {timesheets.map((timesheet, index) => (
          <StyledListItem key={timesheet.id || index}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {timesheet.taskTitle || timesheet.description || 'Time Entry'}
                  </Typography>
                  <TimesheetChip
                    label={calculateDuration(timesheet.startTime, timesheet.endTime)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  {timesheet.projectName && (
                    <Typography variant="body2" color="text.secondary">
                      Project: {timesheet.projectName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(timesheet.loggedAt)} • {formatTime(timesheet.startTime)} - {formatTime(timesheet.endTime)}
                  </Typography>
                  {timesheet.description && timesheet.description !== timesheet.taskTitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {timesheet.description}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small">
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>

      {hasMore && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button
              onClick={onLoadMore}
              disabled={loading}
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
