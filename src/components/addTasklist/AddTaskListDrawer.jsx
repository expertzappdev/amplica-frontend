import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider
} from '@mui/material';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';
import { gridSpacing } from '../../store/constant';

export default function AddTaskListDrawer({ open, onClose, onSubmitCreate, onSubmitUpdate, editingTaskList }) {
    const [taskListName, setTaskListName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const isEditMode = !!editingTaskList;

    useEffect(() => {
        if (open) {
            if (isEditMode && editingTaskList) {
                // Pre-fill form for editing
                setTaskListName(editingTaskList.name || '');
                setDescription(editingTaskList.description || '');
                setStartDate(editingTaskList.startDate ? parseISO(editingTaskList.startDate) : null);
                setEndDate(editingTaskList.endDate ? parseISO(editingTaskList.endDate) : null);
            } else {
                // Reset form for adding
                resetForm();
            }
        }
    }, [open, editingTaskList, isEditMode]);

    const resetForm = () => {
        setTaskListName('');
        setDescription('');
        setStartDate(null);
        setEndDate(null);
    };

    const handleSubmit = () => {
        if (!taskListName) {
            toast.error("Task List Name is required.");
            return;
        }

        // Check if tasklist name is "Default" (case-insensitive) - only for create mode
        if (!isEditMode && taskListName.trim().toLowerCase() === 'default') {
            toast.error("Cannot create a task list named 'Default'. A default task list already exists.");
            return;
        }

        const payload = {
            listName: taskListName,
            description: description,
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        };

        if (isEditMode) {
            onSubmitUpdate(editingTaskList.id, payload);
        } else {
            onSubmitCreate(payload);
        }

        resetForm();
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={() => { resetForm(); onClose(); }}>
            <Box sx={{ width: { xs: '100%', sm: 450, md: 500 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                        {isEditMode ? 'Edit Task List' : 'Add New Task List'}
                    </Typography>
                    <IconButton onClick={() => { resetForm(); onClose(); }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 0.5, pt: 1 }}>
                    <TextField
                        label="Task List Name"
                        value={taskListName}
                        onChange={(e) => setTaskListName(e.target.value)}
                        fullWidth
                        required
                        variant="outlined"
                        autoFocus
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date (Optional)"
                            value={startDate}
                            onChange={setStartDate}
                            format="dd/MM/yyyy"
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: (params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="DD/MM/YYYY"
                                    // helperText="Format: DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                        <DatePicker
                            label="End Date (Optional)"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDate}
                            format="dd/MM/yyyy"
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: (params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="DD/MM/YYYY"
                                    // helperText="Format: DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                    </LocalizationProvider>
                </Box>

                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => { resetForm(); onClose(); }} variant="outlined" color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditMode ? 'Save Changes' : 'Add Task List'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
