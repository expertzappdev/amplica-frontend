import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

export default function ProcessCard({ process }) {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {process.name}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Chip label={process.category} color="primary" size="small" sx={{ mr: 1 }} />
          <Chip label={process.status} color={process.status === 'Active' ? 'success' : 'default'} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Start Date: {process.startDate}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          End Date: {process.endDate}
        </Typography>
      </CardContent>
    </Card>
  );
}
