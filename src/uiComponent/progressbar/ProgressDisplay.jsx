import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressDisplay({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '120px' }}> {/* Adjusted width slightly */}
      <Typography variant="body2" sx={{ minWidth: 38, mr: 1, fontWeight: 500, color: 'text.secondary' }}>{`${Math.round(value || 0)}%`}</Typography>
      <Box sx={{ width: '100%'}}> {/* Removed mr:1 to allow bar to fill its space */}
        <LinearProgress
            variant="determinate"
            value={value || 0}
            sx={{
                height: 8,
                borderRadius: 0,
                [`& .MuiLinearProgress-bar`]: {
                    borderRadius: 0,
                    backgroundColor: 'success.main', // Green color
                },
                backgroundColor: 'grey.300' // Background of the track
            }}
        />
      </Box>
    </Box>
  );
}