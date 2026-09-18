import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, Box, Typography, TextField, Button, IconButton, Divider, Autocomplete } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { gridSpacing } from '../../store/constant';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserList, getAllUsersRequest } from '../../redux/features/profile/profileSlice';
import { format, parseISO } from 'date-fns';
export default function FilterTimesheetDrawer({ open, onClose, onApplyFilters, currentFilters, projectMembers, projectTasks }) {
    const dispatch = useDispatch();
    const { items: allUsers } = useSelector(selectUserList);
    const [projectName, setProjectName] = useState('');
    const [taskName, setTaskName] = useState('');
    const [assignedTo, setAssignedTo] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const userOptions = useMemo(() => {
        if (!allUsers) return [];
        return allUsers.map(user => ({
            id: user.userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
    }, [allUsers]);
    const taskOptions = useMemo(() => {
        return projectTasks.map(task => ({
            id: task.id,
            name: task.taskName,
            projectName: task.project?.name
        }));
    }, [projectTasks]);
    const projectOptions = useMemo(() => {
        const uniqueProjectNames = new Set(taskOptions.map(task => task.projectName).filter(Boolean));
        return Array.from(uniqueProjectNames).map(name => ({ name }));
    }, [taskOptions]);
    useEffect(() => {
        if (open) {
            dispatch(getAllUsersRequest({ page: 1, pageSize: 100 }));
        }
    }, [open, dispatch]);
    useEffect(() => {
        if (open && currentFilters) {
            setProjectName(currentFilters.projectName || '');
            setTaskName(currentFilters.taskName || '');
            const initialAssignedTo = currentFilters.userId
                ? userOptions.find(user => user.id === currentFilters.userId) || null
                : null;
            setAssignedTo(initialAssignedTo);
            setStartTime(currentFilters.startDateFrom ? parseISO(currentFilters.startDateFrom) : null);
            setEndTime(currentFilters.endDateTo ? parseISO(currentFilters.endDateTo) : null);
        } else if (!open) {
            resetFilters();
        }
    }, [open, currentFilters, userOptions]);
    const resetFilters = () => {
        setProjectName('');
        setTaskName('');
        setAssignedTo(null);
        setStartTime(null);
        setEndTime(null);
    };
    const handleApply = () => {
        const filters = {
            projectId: projectOptions.find(opt => opt.name === projectName)?.id || undefined,
            projectName: projectName || undefined,
            taskName: taskName || undefined,
            taskId: taskOptions.find(opt => opt.name === taskName)?.id || undefined,
            userId: assignedTo ? assignedTo.id : undefined,
            startDateFrom: startTime ? format(startTime, 'yyyy-MM-dd') : undefined,
            endDateTo: endTime ? format(endTime, 'yyyy-MM-dd') : undefined,
        };
        onApplyFilters(filters);
        onClose();
    };
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100%', sm: 380 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">Filter Timesheet</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 0.5 }}>
                    <Autocomplete
                        options={projectOptions}
                        getOptionLabel={(option) => option.name}
                        value={projectOptions.find(opt => opt.name === projectName) || null}
                        onChange={(event, newValue) => {
                            setProjectName(newValue ? newValue.name : '');
                        }}
                        renderInput={(params) => <TextField {...params} label="Filter by Project Name" variant="outlined" />}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                    />
                    <Autocomplete
                        options={taskOptions}
                        getOptionLabel={(option) => option.name}
                        value={taskOptions.find(opt => opt.name === taskName) || null}
                        onChange={(event, newValue) => {
                            setTaskName(newValue ? newValue.name : '');
                        }}
                        renderInput={(params) => <TextField {...params} label="Filter by Task Name" variant="outlined" />}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                    <Autocomplete
                        options={userOptions}
                        getOptionLabel={(option) => option.name}
                        value={assignedTo}
                        onChange={(event, newValue) => {
                            setAssignedTo(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Filter by Assigned To" variant="outlined" />}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: -1.5, color: 'text.secondary' }}>Time Range:</Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Start Time From"
                            value={startTime}
                            onChange={setStartTime}
                            ampm={false}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                        />
                        <DateTimePicker
                            label="End Time To"
                            value={endTime}
                            onChange={setEndTime}
                            minDateTime={startTime}
                            ampm={false}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                        />
                    </LocalizationProvider>
                </Box>
                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => { resetFilters(); onApplyFilters({}); }} variant="text" color="secondary">Clear All</Button>
                    <Box>
                        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>Cancel</Button>
                        <Button onClick={handleApply} variant="contained" color="primary">Apply</Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
}