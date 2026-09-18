import React from 'react';
import ReactPlayer from 'react-player';
import { Box } from '@mui/material';

export default function VideoPlayer({ url, controls = true, width = '100%', height = '360px' }) {
  return (
    <Box sx={{ position: 'relative', paddingTop: '56.25%', width }}>
      <ReactPlayer
        url={url}
        controls={controls}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </Box>
  );
}
