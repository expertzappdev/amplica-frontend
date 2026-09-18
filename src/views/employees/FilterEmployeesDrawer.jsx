import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Button, IconButton, Grid,
  FormControl, InputLabel, Select, MenuItem, Divider, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { gridSpacing } from '../../store/constant';

// --- Mappings (can be imported from a shared file) ---
const departmentOptions = ['Engineering', 'Product', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Operations'];
const roleOptions = [
    'Software Engineer', 'Senior Software Engineer', 'Product Manager', 'UX Designer', 'UI Designer',
    'HR Manager', 'Marketing Specialist', 'Sales Executive', 'Team Lead', 'Intern', 'Operations Manager'
];
const departmentMap = {
    'Engineering': 1, 'Product': 2, 'Design': 3, 'Human Resources': 4,
    'Marketing': 5, 'Sales': 6, 'Operations': 7
};
const roleMap = {
    'Software Engineer': 1, 'Senior Software Engineer': 2, 'Product Manager': 3, 'UX Designer': 4,
    'UI Designer': 5, 'HR Manager': 6, 'Marketing Specialist': 7, 'Sales Executive': 8,
    'Team Lead': 9, 'Intern': 10, 'Operations Manager': 11
};
const employeeStatusOptions = ['Active', 'Inactive']; // Assuming API expects boolean true/false
const departmentNameMap = Object.fromEntries(Object.entries(departmentMap).map(([name, id]) => [id, name]));
const roleNameMap = Object.fromEntries(Object.entries(roleMap).map(([name, id]) => [id, name]));

export default function FilterEmployeesDrawer({ open, onClose, onApply, currentFilters = {} }) {
  const initialFilterState = {
    name: '',
    department: '',
    role: '',
    joiningDateFrom: null,
    joiningDateTo: null,
    status: '',
  };
  const [filters, setFilters] = useState(initialFilterState);

  useEffect(() => {
    if (open) {
      // Pre-fill the form with the current active filters from Redux state
      setFilters({
        name: currentFilters.name || '',
        // Convert ID from query back to name for display in the dropdown
        department: departmentNameMap[currentFilters.departmentId] || '',
        role: roleNameMap[currentFilters.roleId] || '',
        status: currentFilters.isActive === true ? 'Active' : currentFilters.isActive === false ? 'Inactive' : '',
        joiningDateFrom: currentFilters.joiningDateFrom ? new Date(currentFilters.joiningDateFrom) : null,
        joiningDateTo: currentFilters.joiningDateTo ? new Date(currentFilters.joiningDateTo) : null,
      });
    }
  }, [open, currentFilters]);

  const handleChange = (event) => {
    setFilters(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleDateChange = (name, newValue) => {
    setFilters(prev => ({ ...prev, [name]: newValue }));
  };

  const handleApplyFilters = () => {
    // --- CONSTRUCT A QUERY OBJECT SUITABLE FOR THE API ---
    const apiQuery = {};

    if (filters.name) apiQuery.name = filters.name;
    // MODIFIED: Convert department name back to ID for the API query
    if (filters.department) apiQuery.departmentId = departmentMap[filters.department];
    // MODIFIED: Convert role name back to ID for the API query
    if (filters.role) apiQuery.roleId = roleMap[filters.role];
    // MODIFIED: Convert status string to boolean for the API query
    if (filters.status) apiQuery.isActive = filters.status === 'Active';
    
    if (filters.joiningDateFrom) apiQuery.joiningDateFrom = format(filters.joiningDateFrom, 'yyyy-MM-dd');
    if (filters.joiningDateTo) apiQuery.joiningDateTo = format(filters.joiningDateTo, 'yyyy-MM-dd');

    // Delegate the application of filters to the parent component
    onApply(apiQuery);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters(initialFilterState);
    // Apply empty filters to reset the view
    onApply({});
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 380, md: 420 }, p: gridSpacing } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: gridSpacing }}>
        <Typography variant="h5" fontWeight={600}>Filter Team Member</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: gridSpacing }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', mt: 1 }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt:1 }}>
          <Grid container spacing={gridSpacing}>
          <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <TextField name="name" label="Search by Name" value={filters.name} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select name="department" value={filters.department} label="Department" onChange={handleChange}>
                  <MenuItem value=""><em>All Departments</em></MenuItem>
                  {departmentOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select name="role" value={filters.role} label="Role" onChange={handleChange}>
                  <MenuItem value=""><em>All Roles</em></MenuItem>
                  {roleOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
             <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={filters.status} label="Status" onChange={handleChange}>
                  <MenuItem value=""><em>All Statuses</em></MenuItem>
                  {employeeStatusOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker label="Joining Date From" value={filters.joiningDateFrom} onChange={(val) => handleDateChange('joiningDateFrom', val)} />
              </LocalizationProvider>
            </Grid>
            <Grid item size={{ xs: 12, sm:12, md: 12, lg: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker label="Joining Date To" value={filters.joiningDateTo} onChange={(val) => handleDateChange('joiningDateTo', val)} />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: gridSpacing, display: 'flex', justifyContent: 'space-between', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClearFilters} variant="text" color="secondary">Clear All</Button>
          <Box>
            <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleApplyFilters} variant="contained" color="primary">Apply Filters</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
