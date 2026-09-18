// src/views/shared/TaskDetailModal/ActivityLogSection.js
import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, Divider, Avatar, ListItemAvatar } from '@mui/material';
import { formatDistanceToNow, format } from 'date-fns';

export default function ActivityLogSection({ activityLog = [] }) {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Activity Log</Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {activityLog.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 2}}>
                        No activity recorded yet.
                    </Typography>
                )}
                {activityLog.slice().reverse().map((log, index) => ( // Show newest first
                    <React.Fragment key={log.id || index}>
                        <ListItem alignItems="flex-start" sx={{px:0}}>
                             <ListItemAvatar sx={{mt:0.5, minWidth: '48px'}}>
                                <Avatar alt={log.userName} src={log.userAvatarUrl} sx={{width: 32, height: 32}} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography component="span" variant="body2">
                                        <Typography component="span" fontWeight="600">{log.userName || 'System'}</Typography> {log.action}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        {` (${format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')})`}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < activityLog.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
}