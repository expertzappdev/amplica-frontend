import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Button, IconButton, Grid,
  FormControl, InputLabel, Select, MenuItem, Divider, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { gridSpacing } from '../../store/constant';

const statusOptions = ['Active', 'Inactive'];

export default function FilterCompanyDrawer({ open, onClose, onApply, currentFilters = {} }) {
  const initialFilterState = {
    name: '',
    email: '',
    location: '',
    phone: '',
    industry: '',
    status: '',
    createdDateFrom: null,
    createdDateTo: null
  };

  const [filters, setFilters] = useState(initialFilterState);

  useEffect(() => {
    if (open) {
      setFilters({
        name: currentFilters.name || '',
        email: currentFilters.email || '',
        location: currentFilters.location || '',
        phone: currentFilters.phone || '',
        industry: currentFilters.industry || '',
        status:
          currentFilters.isActive === true
            ? 'Active'
            : currentFilters.isActive === false
              ? 'Inactive'
              : '',
        createdDateFrom: currentFilters.createdDateFrom
          ? new Date(currentFilters.createdDateFrom)
          : null,
        createdDateTo: currentFilters.createdDateTo
          ? new Date(currentFilters.createdDateTo)
          : null
      });
    }
  }, [open, currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters(initialFilterState);
    onApply({});
    onClose();
  };

  const handleApply = () => {
    const result = {};
    if (filters.name) result.name = filters.name;
    if (filters.email) result.email = filters.email;
    if (filters.location) result.location = filters.location;
    if (filters.phone) result.phone = filters.phone;
    if (filters.industry) result.industry = filters.industry;
    if (filters.status) result.isActive = filters.status === 'Active';
    if (filters.createdDateFrom)
      result.createdDateFrom = filters.createdDateFrom.toISOString().split('T')[0];
    if (filters.createdDateTo)
      result.createdDateTo = filters.createdDateTo.toISOString().split('T')[0];

    onApply(result);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        // --- START MODIFICATION ---
        // Increased width for sm and md breakpoints
        sx: { width: { xs: '100%', sm: 450, md: 500 }, p: gridSpacing }
        // --- END MODIFICATION ---
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: gridSpacing }}>
        <Typography variant="h5" fontWeight={600}>Filter Companies</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Divider sx={{ mb: gridSpacing }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Company Name"
              value={filters.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              value={filters.email}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="industry"
              label="Industry"
              value={filters.industry}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="phone"
              label="Phone"
              value={filters.phone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="location"
              label="Location"
              value={filters.location}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value=""><em>All Statuses</em></MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Created Date From"
                value={filters.createdDateFrom}
                onChange={(date) => handleDateChange('createdDateFrom', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Created Date To"
                value={filters.createdDateTo}
                onChange={(date) => handleDateChange('createdDateTo', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          mt: gridSpacing,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Button onClick={handleClear} variant="text" color="secondary">
          Clear All
        </Button>
        <Box>
          <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained" color="primary">
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}