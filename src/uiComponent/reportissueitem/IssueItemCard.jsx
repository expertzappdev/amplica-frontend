import React from 'react';
import { Box, Typography, Button, Avatar, IconButton, Paper } from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'; // Sun icon
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'; // Chat icon

const IssueItemCard = ({ title, issueNumber, openedAgo, openedBy, avatarSrc, icon }) => {
  const IconComponent = icon || WbSunnyOutlinedIcon; // Use provided icon or default to Sun icon

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: '12px',
        mb: 2,
        border: '1px solid grey.300',
      }}
    >
      <IconComponent sx={{ color: 'text.secondary', fontSize: '28px' }} />
      <Box sx={{ flexGrow: 1, ml: 1 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: '600', lineHeight: 1.4 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          #{issueNumber} Opened {openedAgo} by <strong>{openedBy}</strong>
        </Typography>
      </Box>
      <Button
        variant="contained"
        sx={{
          textTransform: 'none',
          borderRadius: '20px',       // Pill shape
          fontWeight: '500',
          px: 2.5,
          py: 0.5,
          fontSize: '0.875rem',
          boxShadow: 'none',
        }}
      >
        View
      </Button>
      <Avatar alt={openedBy} src={avatarSrc} sx={{ width: 36, height: 36, ml: 1 }} />
      <IconButton size="small" sx={{ ml: 0.5 }}>
        <ChatBubbleOutlineOutlinedIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default IssueItemCard;