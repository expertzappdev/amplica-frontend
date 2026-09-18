// src/views/ProjectDetail/FilterTasksDrawer.js
import React, { useState } from 'react';
import { Drawer, Box, Typography, TextField, Button, IconButton, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { gridSpacing } from '../../../store/constant';
import { statusOptionsWithColors } from '../../../uiComponent/statusdropdown/StatusDropdown'; // Reusing status options

const priorityFilterOptions = ['All', 'High', 'Medium', 'Low'];
const assigneeFilterOptions = ['All', 'Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince']; // Keep consistent

export default function FilterTasksDrawer({ open, onClose, onApply }) {
    const [taskName, setTaskName] = useState('');
    const [status, setStatus] = useState('All');
    const [priority, setPriority] = useState('All');
    const [assignee, setAssignee] = useState('All');
    const [dueDateFrom, setDueDateFrom] = useState(null);
    const [dueDateTo, setDueDateTo] = useState(null);

    const handleApply = () => {
        onApply({
            taskName: taskName.trim() || undefined,
            status: status === 'All' ? undefined : status,
            priority: priority === 'All' ? undefined : priority,
            assignee: assignee === 'All' ? undefined : assignee,
            dueDateFrom: dueDateFrom ? dueDateFrom.toISOString().split('T')[0] : undefined,
            dueDateTo: dueDateTo ? dueDateTo.toISOString().split('T')[0] : undefined,
        });
        onClose();
    };
    
    const handleClear = () => {
        setTaskName(''); setStatus('All'); setPriority('All'); setAssignee('All');
        setDueDateFrom(null); setDueDateTo(null);
        onApply({}); // Apply empty to reset
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100%', sm: 380 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">Filter Tasks</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pr: 1 }}>
                    <TextField label="Task Name contains..." value={taskName} onChange={(e) => setTaskName(e.target.value)} fullWidth variant="outlined"/>
                     <FormControl fullWidth variant="outlined">
                        <InputLabel id="filter-task-status-label">Status</InputLabel>
                        <Select labelId="filter-task-status-label" value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                             {[{value: 'All', label: 'All', color: 'text.primary'}, ...statusOptionsWithColors].map(opt => (
                                 <MenuItem key={opt.value} value={opt.value} sx={{color: opt.color}}>
                                     {opt.value !== 'All' && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: opt.bgColor, border: `1px solid ${opt.color}`, mr: 1.5 }} />}
                                     {opt.label}
                                 </MenuItem>
                             ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="filter-task-priority-label">Priority</InputLabel>
                        <Select labelId="filter-task-priority-label" value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
                            {priorityFilterOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                    </FormControl>
                     <FormControl fullWidth variant="outlined">
                        <InputLabel id="filter-task-assignee-label">Assignee</InputLabel>
                        <Select labelId="filter-task-assignee-label" value={assignee} label="Assignee" onChange={(e) => setAssignee(e.target.value)}>
                            {assigneeFilterOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Typography variant="subtitle2" sx={{mt:1, mb: -1.5, color: 'text.secondary'}}>Due Date Range:</Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker label="From" value={dueDateFrom} onChange={setDueDateFrom} enableAccessibleFieldDOMStructure={false} slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }} />
                        <DatePicker label="To" value={dueDateTo} onChange={setDueDateTo} minDate={dueDateFrom} enableAccessibleFieldDOMStructure={false} slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }} />
                    </LocalizationProvider>
                </Box>
                 <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={handleClear} variant="text" color="secondary">Clear All</Button>
                    <Box>
                        <Button onClick={onClose} variant="outlined" color="secondary" sx={{mr:1}}>Cancel</Button>
                        <Button onClick={handleApply} variant="contained" color="primary">Apply</Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
}