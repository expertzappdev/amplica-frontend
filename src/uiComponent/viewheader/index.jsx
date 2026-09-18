import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { gridSpacing } from '../../store/constant';

const ViewHeader = ({ title, children }) => {
    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: gridSpacing - 1,
            flexWrap: 'wrap',
            gap: 2
        }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
            </Typography>

            {/* This is where the action buttons will be rendered */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                {children}
            </Box>
        </Box>
    );
};

export default ViewHeader;