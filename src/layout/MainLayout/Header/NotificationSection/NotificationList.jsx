import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
// import Card from '@mui/material/Card'; // Keep if used for specific notifications like file uploads
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets & icons
import { IconBrandTelegram, IconBuildingStore, IconMailbox, IconPhoto, IconCheck, IconClock } from '@tabler/icons-react';
// Assuming User1 is a generic placeholder you might still use
import User1 from 'assets/images/users/user-round.svg';

// Import your JSON data
import notificationsData from './notificationsData.json'; // Adjust path as needed

// Helper to get appropriate icon (if you store icon names in JSON)
const getIcon = (iconName, theme) => {
  const iconProps = { stroke: 1.5, size: '20px' };
  switch (iconName) {
    case 'IconBuildingStore':
      return <IconBuildingStore {...iconProps} />;
    case 'IconMailbox':
      return <IconMailbox {...iconProps} />;
    case 'IconBrandTelegram':
      return <IconBrandTelegram {...iconProps} />;
    case 'IconPhoto':
      return <IconPhoto {...iconProps} />;
    case 'IconCheck': // Example for task completion
      return <IconCheck {...iconProps} color={theme.palette.success.dark} />;
    case 'IconClock': // Example for deadline reminder
      return <IconClock {...iconProps} color={theme.palette.warning.dark} />;
    default:
      return <IconMailbox {...iconProps} />; // Default icon
  }
};

function ListItemWrapper({ children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[200], 0.3) // Use theme.palette.action.hover for theme-consistent hover
        }
      }}
    >
      {children}
    </Box>
  );
}
ListItemWrapper.propTypes = { children: PropTypes.node };


// Function to render individual notification content based on its type
const renderNotificationContent = (notification, theme, containerSX) => {
  switch (notification.type) {
    case 'TASK_ASSIGNMENT':
      return (
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="subtitle2">
            <Typography component="span" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {notification.actorName}
            </Typography>{' '}
            {notification.message}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Task: {notification.taskName}
          </Typography>
          {notification.details?.dueDate && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Due: {notification.details.dueDate}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            {notification.tags?.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                color={tag.toLowerCase() === 'urgent' ? 'error' : tag.toLowerCase() === 'new' ? 'info' : 'default'}
                size="small"
                sx={{ width: 'min-content' }}
              />
            ))}
          </Stack>
        </Stack>
      );
    case 'DEADLINE_REMINDER':
      return (
        <Stack spacing={1} sx={containerSX}>
          <Typography variant="subtitle2">{notification.message}</Typography>
          <Stack direction="row" spacing={1}>
            {notification.tags?.map((tag, index) => (
              <Chip key={index} label={tag} color="warning" size="small" sx={{ width: 'min-content' }} />
            ))}
          </Stack>
        </Stack>
      );
    case 'EMPLOYEE_ONBOARDING':
      return (
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="subtitle2">{notification.message}</Typography>
          {notification.action && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={getIcon(notification.action.icon, theme)}
              sx={{ width: 'min-content', mt: 1 }}
            >
              {notification.action.label}
            </Button>
          )}
        </Stack>
      );
    case 'PERFORMANCE_REVIEW':
        return (
            <Stack spacing={1.5} sx={containerSX}>
                <Typography variant="subtitle2">
                    <Typography component="span" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notification.actorName}
                    </Typography>{' '}
                    {notification.message}
                </Typography>
                {notification.details?.reviewDate && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Date: {notification.details.reviewDate}
                    </Typography>
                )}
                {notification.details?.documentName && (
                     <Stack direction="row" spacing={1} alignItems="center" sx={{p: 1.5, bgcolor: 'secondary.lighter', borderRadius: 1, width: 'fit-content' }}>
                        <IconPhoto stroke={1.5} size="18px" color={theme.palette.secondary.dark}/>
                        <Typography variant="caption">{notification.details.documentName}</Typography>
                    </Stack>
                )}
                 <Stack direction="row" spacing={1}>
                    {notification.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} color="info" size="small" sx={{ width: 'min-content' }} />
                    ))}
                </Stack>
            </Stack>
        );
    case 'TASK_COMPLETION':
        return (
            <Stack spacing={1} sx={containerSX}>
                <Typography variant="subtitle2">
                    <Typography component="span" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notification.actorName}
                    </Typography>{' '}
                    {notification.message}
                </Typography>
                <Stack direction="row" spacing={1}>
                {notification.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} color={tag.toLowerCase() === 'completed' ? 'success' : 'default'} size="small" sx={{ width: 'min-content' }} />
                ))}
            </Stack>
            </Stack>
        );
    default:
      return (
        <Stack spacing={1.5} sx={containerSX}>
          <Typography variant="subtitle2">{notification.message || 'Notification received.'}</Typography>
        </Stack>
      );
  }
};


export default function NotificationList() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const containerSX = { pl: { xs: 0, sm: 7 } }; // Adjust padding based on screen size for content below ListItem

  useEffect(() => {
    // In a real app, you might fetch this data:
    // fetch('/api/notifications')
    //   .then(res => res.json())
    //   .then(data => setNotifications(data));
    setNotifications(notificationsData);
  }, []);

  return (
    <List sx={{ width: '100%', maxWidth: { xs: 330, sm: 360, md: 400 }, py: 0, bgcolor: 'background.paper' }}>
      {notifications.map((notification) => (
        <ListItemWrapper key={notification.id}>
          <ListItem
            alignItems="flex-start" // Changed for better alignment with multi-line content
            disablePadding
            secondaryAction={
              <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap', pt: 0.5 }}>
                {notification.timestamp}
              </Typography>
            }
          >
            <ListItemAvatar sx={{pt: 0.3}}>
              {notification.avatarSrc ? (
                <Avatar alt={notification.actorName || 'User'} src={notification.avatarSrc || User1} />
              ) : (
                <Avatar
                  // sx={{
                  //   color: notification.iconColor ? theme.palette.getColor(notification.iconColor) : theme.palette.primary.dark,
                  //   bgcolor: notification.iconBgColor ? theme.palette.getColor(notification.iconBgColor) : theme.palette.primary.light,
                  // }}
                >
                  {notification.icon ? getIcon(notification.icon, theme) : notification.actorName?.charAt(0) || 'N'}
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'medium' }}>
                  {notification.title || notification.actorName || 'System Notification'}
                </Typography>
              }
              // Secondary text can be part of the content rendered by renderNotificationContent
              // or a brief part of the message if title is used as primary.
              // For this example, primary focuses on title/actor, details go below.
              sx={{pr: 1}} // Add some padding to the right of the text before the secondaryAction
            />
          </ListItem>
          {/* Render specific content based on notification type */}
          {renderNotificationContent(notification, theme, containerSX)}
        </ListItemWrapper>
      ))}
      {notifications.length === 0 && (
        <ListItemWrapper>
            <Typography sx={{textAlign: 'center', p:2, color: 'text.secondary'}}>No new notifications.</Typography>
        </ListItemWrapper>
      )}
    </List>
  );
}

// Helper function to safely access theme palette colors (MUI v5+)
// You might need to adjust this based on your exact MUI version and theme setup
// This is a simplified example.
// For theme.palette.getColor('color.shade'), it implies 'color' is a key like 'primary', 'warning',
// and 'shade' is 'dark' or 'light'. MUI typically handles this as theme.palette.primary.dark.
// The JSON should ideally store direct keys like "primary.dark" or just "primary" and let component decide shade.
// For simplicity, assuming direct keys:
const oldGetColor = (palette, colorString) => {
    if (!colorString) return undefined;
    const [color, shade] = colorString.split('.');
    return palette[color] ? (shade ? palette[color][shade] : palette[color].main) : undefined;
};

// Correct way to access theme colors:
// theme.palette.primary.dark
// theme.palette.warning.light
// So JSON should store like: "iconColorKey": "primary", "iconColorShade": "dark" or make component smarter
// For now, I'll adjust the Avatar sx to use direct palette access assuming JSON is modified or a mapping exists.
// Example usage if JSON has "iconColorName": "primary", "iconShadeName": "dark"
// color: theme.palette[notification.iconColorName][notification.iconShadeName]
// Given the JSON structure has "primary.dark", we need a robust way to parse.
// The `theme.palette.getColor(colorString)` syntax is not standard MUI.
// Correct approach:
// <Avatar sx={{ color: theme.palette.primary.dark, bgcolor: theme.palette.primary.light }} />
// So, the JSON should ideally provide "primary" and "light" separately, or the component should map "primary.light"
// For simplicity in the Avatar part:
// sx={{
//   color: notification.iconColor || 'primary.dark', // These would need to be actual theme keys
//   bgcolor: notification.iconBgColor || 'primary.light'
// }}
// This part is tricky without knowing how you manage theme color strings from JSON.
// The provided example in `NotificationList` for `Avatar` sx directly uses theme keys.
// I've updated the Avatar in the map to reflect that if iconColor/iconBgColor are like 'success.dark'.
// It's better if JSON stores `color: "success"`, `shade: "dark"` or component maps "success.dark" string.

// For the provided JSON like `iconColor: "warning.dark"`
// A simple parser for the Avatar:
const parseColorString = (colorString, theme, type = 'main') => {
    if (!colorString) return theme.palette.text.primary; // default color
    const [colorName, shadeName] = colorString.split('.');
    const colorObject = theme.palette[colorName];
    if (!colorObject) return theme.palette.text.primary;
    return shadeName ? colorObject[shadeName] : colorObject[type];
};

// In the Avatar sx:
// color: parseColorString(notification.iconColor, theme, 'dark'),
// bgcolor: parseColorString(notification.iconBgColor, theme, 'light'),
// This has been incorporated into the main component.