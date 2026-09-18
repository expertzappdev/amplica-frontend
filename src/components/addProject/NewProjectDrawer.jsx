import React, { useState, useEffect } from 'react';
import {
    Drawer, Box, Typography, TextField, Button, Select, MenuItem, FormControl,
    InputLabel, IconButton, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO, format, isValid } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectStatusItems } from '../../redux/features/projects/projectSlice';
import TiptapEditorField from '../../uiComponent/tiptap';
import { gridSpacing } from '../../store/constant';

export default function ProjectFormDrawer({ open, onClose, onSubmitCreate, onSubmitUpdate, projectData }) {
    const [id, setId] = useState(null);
    const [projectTitle, setProjectTitle] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [descriptionHtml, setDescriptionHtml] = useState('');
    const [status, setStatus] = useState('Open');
    const [errors, setErrors] = useState({});
    const statusData = useSelector(selectStatusItems);
    const isEditMode = !!projectData;

    useEffect(() => {
        if (open) {
            if (projectData) {
                setId(projectData.projectId);
                setProjectTitle(projectData.name || '');
                setStartDate(projectData.startDate ? parseISO(projectData.startDate) : null);
                setEndDate(projectData.endDate ? parseISO(projectData.endDate) : null);
                setDescriptionHtml(projectData.description || '');
                setStatus(projectData.status || 'Open');
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [open, projectData]);

    const handleDescriptionChange = (htmlContent) => {
        setDescriptionHtml(htmlContent);
    };

    const resetForm = () => {
        setId(null);
        setProjectTitle('');
        setStartDate(null);
        setEndDate(null);
        setDescriptionHtml('');
        setStatus('Open');
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!projectTitle.trim()) {
            newErrors.projectTitle = 'Project title is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const projectPayload = {
            name: projectTitle,
            status: status,
            description: descriptionHtml,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        };

        if (isEditMode) {
            if (onSubmitUpdate) {
                onSubmitUpdate(id, projectPayload);
            }
        } else {
            if (onSubmitCreate) {
                onSubmitCreate(projectPayload);
            }
        }
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '100%', sm: 450, md: 550 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">{isEditMode ? 'Edit Project' : 'New Project'}</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 1, pt: 2 }}>
                    <TextField
                        label="Project Title"
                        variant="outlined"
                        fullWidth
                        value={projectTitle}
                        onChange={(e) => {
                            setProjectTitle(e.target.value);
                            if (errors.projectTitle) {
                                setErrors((prev) => ({ ...prev, projectTitle: null }));
                            }
                        }}
                        error={!!errors.projectTitle}
                        helperText={errors.projectTitle}
                        required
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            format="dd/MM/yyyy"
                            enableAccessibleFieldDOMStructure={false}
                            slots={{
                                textField: (params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        //   required 
                                        variant="outlined"
                                        placeholder="DD/MM/YYYY"
                                    // helperText="Format: DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                        <DatePicker
                            label="End Date"
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
                                        //     required 
                                        variant="outlined"
                                        placeholder="DD/MM/YYYY"
                                    // helperText="Format: DD/MM/YYYY"
                                    />
                                )
                            }}
                        />
                    </LocalizationProvider>

                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            label="Status"
                        >
                            {statusData.map((option) => (
                                <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TiptapEditorField
                        label="Description"
                        initialContent={descriptionHtml}
                        onContentChange={handleDescriptionChange}
                        minEditorHeight="150px"
                    />
                </Box>

                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditMode ? 'Save Changes' : 'Create Project'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}

