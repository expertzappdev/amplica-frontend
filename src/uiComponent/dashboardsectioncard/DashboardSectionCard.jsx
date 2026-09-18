import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { gridSpacing } from '../../store/constant'; 



export default function DashboardSectionCard({ title, icon, children, sx, actions }) {
    <Paper variant="outlined" sx={{ p: gridSpacing, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: gridSpacing - 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: 'primary.main', fontSize: '1.5rem' } })}
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
            </Box>
            {actions && <Box>{actions}</Box>}
        </Box>
        <Divider sx={{ mb: gridSpacing }} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {children}
        </Box>
    </Paper>
};