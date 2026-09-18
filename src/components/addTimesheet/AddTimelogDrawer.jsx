import React, { useState, useEffect, useMemo } from 'react';
import {
    Drawer, Box, Typography, TextField, Button, IconButton, Divider, Autocomplete
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { isValid, parse, format } from 'date-fns';
import { gridSpacing } from '../../store/constant';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../redux/features/auth/authSlice';
import { fetchDropdownProjectsRequest, selectDropdownProjects } from '../../redux/features/projects/projectSlice';

export default function AddTimelogDrawer({ open, onClose, onSubmit, editingLog, project }) {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectUser);
    const projectsResponse = useSelector(selectDropdownProjects);
    const isEditing = !!editingLog;

    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [notes, setNotes] = useState('');
    const [durationDate, setDurationDate] = useState(null);
    const [notesError, setNotesError] = useState(false);

    // Use selectDropdownProjects to avoid paging limits of the main projects table.
    const projectOptions = useMemo(() => {
        const projects = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse?.items;
        if (!Array.isArray(projects)) return [];
        return projects.map(p => ({
            id: p.projectId,
            name: p.name,
            taskLists: p.taskLists || [],
        }));
    }, [projectsResponse]);

    // Filtered to only display tasks that match "Completed" or "Cancelled" statuses
    const availableTasks = useMemo(() => {
        if (!selectedProject) return [];
        return selectedProject.taskLists
            .flatMap(list => list.tasks || [])
            .filter(t => {
                const status = (t.statusName || t.status || '').toLowerCase();
                return status === 'completed' || status === 'cancelled';
            })
            .map(t => ({
                id: t.taskId,
                name: t.title
            }));
    }, [selectedProject]);

    useEffect(() => {
        if (open) {
            // FIX: Always dispatch the request when the drawer opens to catch fresh status updates without re-logging in.
            dispatch(fetchDropdownProjectsRequest({
                page: 1,
                pageSize: 200,
                statusNames: 'Active,Delayed,InProgress,InReview,Open,NotStarted,Backlog'
            }));

            if (isEditing && editingLog) {
                // Pre-fill for EDIT mode
                const projectForLog = projectOptions.find(p => p.id.toString() === editingLog.project?.projectId?.toString());
                setSelectedProject(projectForLog);

                if (projectForLog) {
                    const taskForLog = projectForLog.taskLists.flatMap(tl => tl.tasks).find(t => t.taskId.toString() === editingLog.task?.taskId?.toString());
                    if (taskForLog) {
                        setSelectedTask({ id: taskForLog.taskId, name: taskForLog.title });
                    }
                }

                setNotes(editingLog.description || '');

                if (editingLog.duration) {
                    const parsedTime = parse(editingLog.duration, 'HH:mm', new Date());
                    if (isValid(parsedTime)) setDurationDate(parsedTime);
                }
            } else if (project) {
                // Pre-fill for ADD mode from a specific context (like TaskView)
                const preselectedProject = projectOptions.find(p => p.id === project.id);
                setSelectedProject(preselectedProject);

                if (project.taskLists?.[0]?.tasks?.[0]) {
                    const preselectedTask = {
                        id: project.taskLists[0].tasks[0].id,
                        name: project.taskLists[0].tasks[0].taskName
                    };
                    setSelectedTask(preselectedTask);
                }
            } else {
                // Reset for ADD mode from the global timesheet view
                setSelectedProject(null);
                setSelectedTask(null);
                setNotes('');
                setDurationDate(null);
                setNotesError(false);
            }
        }
        // Note: projectsResponse and projectOptions are purposefully excluded from dependencies to prevent infinite re-fetching loops.
    }, [open, isEditing, editingLog, project, dispatch]);

    const handleSubmit = () => {
        setNotesError(false);
        if (!selectedProject || !selectedTask || !durationDate || !notes.trim()) {
            if (!notes.trim()) setNotesError(true);
            alert("Please fill all required fields.");
            return;
        }

        const duration = format(durationDate, 'HH:mm');

        const timelogData = {
            projectId: selectedProject.id,
            taskId: selectedTask.id,
            userId: currentUser.id,
            loggedAt: new Date().toISOString(),
            duration: duration,
            description: notes,
        };

        if (isEditing) {
            onSubmit({ ...timelogData, id: editingLog.id }, true);
        } else {
            onSubmit(timelogData, false);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100%', sm: 400 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">{isEditing ? 'Edit Timelog' : 'Add Timelog'}</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 0.5, pt: 2 }}>
                    <Autocomplete
                        options={projectOptions}
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={selectedProject}
                        onChange={(event, newValue) => {
                            setSelectedProject(newValue);
                            setSelectedTask(null); // Reset task when project changes
                        }}
                        renderInput={(params) => <TextField {...params} label="Select Project" variant="outlined" required />}
                        disabled={isEditing}
                    />
                    <Autocomplete
                        options={availableTasks}
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={selectedTask}
                        onChange={(event, newValue) => setSelectedTask(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Task" variant="outlined" required />}
                        disabled={!selectedProject}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                            label="Duration"
                            value={durationDate}
                            onChange={(newValue) => setDurationDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                            ampm={false}
                            views={['hours', 'minutes']}
                            format="HH:mm"
                        />
                    </LocalizationProvider>

                    <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        required
                        error={notesError}
                        helperText={notesError ? 'Notes are required' : ''}
                    />
                </Box>

                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditing ? 'Save Changes' : 'Save Log'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
