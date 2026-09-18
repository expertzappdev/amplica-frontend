// src/views/Projects/FilterDrawer.js
import React, { useState } from 'react';
import {
  Drawer, Box, Typography, Button, Select, MenuItem, FormControl,
  InputLabel, IconButton, Divider, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { statusOptionsWithColors } from '../../uiComponent/statusdropdown/StatusDropdown'; // Reuse status options
import { gridSpacing } from '../../store/constant'; // Adjust path

export default function FilterDrawer({ open, onClose, onApply }) {
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleApplyFilters = () => {
    onApply({
      projectName: projectName.trim() || undefined,
      status: status === 'All' ? undefined : status,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setProjectName('');
    setStatus('All');
    setStartDate(null);
    setEndDate(null);
    onApply({});
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: {xs: '100%', sm: 380}, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">Filters</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 1 }}>
          <TextField
            label="Project Name"
            variant="outlined"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              {[{ value: 'All', label: 'All', color: 'text.primary' }, ...statusOptionsWithColors].map(option => (
                <MenuItem key={option.value} value={option.value} sx={{ color: option.color }}>
                  {option.value !== 'All' && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: option.bgColor, border: `1px solid ${option.color}`, mr: 1.5 }} />}
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1, mb: -1.5 }}>Date Range:</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date After"
              value={startDate}
              onChange={setStartDate}
              enableAccessibleFieldDOMStructure={false} // <--- ADD THIS PROP
              slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }}
            />
            <DatePicker
              label="End Date Before"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              enableAccessibleFieldDOMStructure={false} // <--- ADD THIS PROP
              slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }}
            />
          </LocalizationProvider>
        </Box>

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClearFilters} variant="text" color="secondary">Clear Filters</Button>
          <Box>
            <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleApplyFilters} variant="contained" color="primary">Apply</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}