import React, { useState, useRef } from 'react';
import {
    Box, Grid, Paper, Typography, Avatar, Chip, Tooltip, Divider,
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Link,
    IconButton, Button, List, ListItem, ListItemAvatar, ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    CircularProgressbarWithChildren,
    buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ASSETS_BASE_URL } from '../../../services/apiConstants';
// --- Icon Imports (from original) ---
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachmentIcon from '@mui/icons-material/Attachment';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';

import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { gridSpacing } from '../../../store/constant';

// --- Added for functionality ---
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteProjectMemberRequest,
    uploadDocumentRequest,
    deleteProjectDocumentRequest,
    selectIsDeletingProjectDocument
} from '../../../redux/features/projects/projectSlice';
import AddMemberDrawer from '../../../components/addMember/AddMemberDrawer';
import ConfirmationModal from '../../../uiComponent/confirmationmodal';
import Can from '../../../uiComponent/Can';
// -----------------------------

// **CONSTANTS**
const MAX_ATTACHMENTS = 5;

// Helper function to calculate task stats (from original)
const calculateTaskStats = (taskLists = []) => {
    let totalTasks = 0, completedTasks = 0, delayedTasks = 0;

    taskLists.forEach(list => {
        (list.tasks || []).forEach(task => {
            totalTasks++;
            if (task.status === 'Completed' || task.isChecked) {
                completedTasks++;
            } else if (task.status === 'Delayed') {
                delayedTasks++;
            }
        });
    });
    const openTasks = totalTasks - completedTasks;
    return { totalTasks, completedTasks, delayedTasks, openTasks };
};


// Reusable Card for individual stats (from original)
const StatSummaryCard = ({ title, value, icon, color = "primary.main", sx }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', ...sx }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            {icon && React.cloneElement(icon, { sx: { fontSize: '1.75rem', color: color, mr: 1.5, opacity: 0.9 } })}
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
            {value}
        </Typography>
    </Paper>
);

// Reusable Card for main dashboard sections (from original)
const DashboardSectionCard = ({ title, icon, children, sx, actions }) => (
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
);

export default function ProjectDashboard({ project }) {
    // --- Added for functionality ---
    const dispatch = useDispatch();
    const [isAddMemberDrawerOpen, setAddMemberDrawerOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // **NEW: Attachment functionality**
    const fileInputRef = useRef(null);
    const [isDeleteDocumentModalOpen, setIsDeleteDocumentModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const isDeletingDocument = useSelector(selectIsDeletingProjectDocument);

    // **ATTACHMENT LIMIT CHECK**
    const currentAttachmentCount = project?.projectDocuments?.length || 0;
    const isAttachmentLimitReached = currentAttachmentCount >= MAX_ATTACHMENTS;

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (memberToDelete) {
            dispatch(deleteProjectMemberRequest({ projectId: project.id, userId: memberToDelete.id }));
        }
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
    };

    // **NEW: Attachment handlers**
    const handleAttachmentClick = () => {
        if (!isAttachmentLimitReached) {
            fileInputRef.current?.click();
        }
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file && !isAttachmentLimitReached) {
            const formData = new FormData();
            formData.append('File', file);
            formData.append('DocumentName', file.name);
            dispatch(uploadDocumentRequest({ projectId: project.id, formData }));
        }
        if (event.target) event.target.value = null;
    };

    const handleDeleteDocumentClick = (document) => {
        setDocumentToDelete(document);
        setIsDeleteDocumentModalOpen(true);
    };

    const handleConfirmDocumentDelete = () => {
        if (documentToDelete) {
            dispatch(deleteProjectDocumentRequest({
                projectId: project.id,
                documentId: documentToDelete.documentId
            }));
        }
        setIsDeleteDocumentModalOpen(false);
        setDocumentToDelete(null);
    };

    const handleViewDocument = (document) => {
        if (document.filePath) {
            window.open(`${ASSETS_BASE_URL}${document.filePath}`, '_blank');
        }
    };

    if (!project) {
        return (
            <Box sx={{ p: gridSpacing, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                <Typography variant="h6" color="text.secondary">No project data available.</Typography>
            </Box>
        );
    }

    const { totalTasks, completedTasks, delayedTasks, openTasks } = calculateTaskStats(project.taskLists);
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const deadlineDate = project.deadline ? parseISO(project.deadline) : null;
    let daysRemainingText = 'N/A';
    let deadlineChipColor = 'default';

    if (deadlineDate && isValid(deadlineDate)) {
        const daysDiff = differenceInDays(deadlineDate, new Date());
        if (daysDiff < 0) {
            daysRemainingText = `${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} overdue`;
            deadlineChipColor = 'error';
        } else if (daysDiff === 0) {
            daysRemainingText = `Today`;
            deadlineChipColor = 'warning';
        } else {
            daysRemainingText = `${daysDiff} day${daysDiff === 1 ? '' : 's'} left`;
            deadlineChipColor = daysDiff < 7 ? 'warning' : 'success';
        }
    }

    const getProgressColor = (progress) => {
        if (progress <= 33) return 'error.main';
        if (progress <= 66) return 'warning.main';
        return 'success.main';
    };

    const cardMinHeight = '30vh';
    const timelineCardHeight = '45vh';

    const stripHtmlTags = (htmlString) => {
        const doc = new DOMParser().parseFromString(htmlString, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <Box sx={{ p: { xs: gridSpacing / 6, sm: gridSpacing / 2, md: gridSpacing }, flexGrow: 1, backgroundColor: (theme) => theme.palette.background.neutral || theme.palette.grey[50] }}>
            <Grid container spacing={gridSpacing}>
                <Grid container spacing={gridSpacing} size={{ xs: 12, md: 12, lg: 12 }}>
                    <Grid item size={{ xs: 6, md: 3, lg: 3 }}>
                        <StatSummaryCard title="Total Tasks" value={totalTasks} icon={<PlaylistAddCheckIcon />} color="info.main" />
                    </Grid>
                    <Grid item size={{ xs: 6, md: 3, lg: 3 }}>
                        <StatSummaryCard title="Completed" value={completedTasks} icon={<CheckCircleOutlineIcon />} color="success.main" />
                    </Grid>
                    <Grid item size={{ xs: 6, md: 3, lg: 3 }}>
                        <StatSummaryCard title="Open Tasks" value={openTasks} icon={<PendingActionsIcon />} color="warning.dark" />
                    </Grid>
                    <Grid item size={{ xs: 6, md: 3, lg: 3 }}>
                        <StatSummaryCard title="Delayed" value={delayedTasks} icon={<DonutLargeIcon />} color="error.dark" />
                    </Grid>
                </Grid>


                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <DashboardSectionCard title="Overall Progress" icon={<TrendingUpIcon />} sx={{ height: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 2 }}>
                            <Box sx={{ width: '80%', maxWidth: 220, mb: 2 }}>
                                <CircularProgressbarWithChildren
                                    value={overallProgress}
                                    strokeWidth={8}
                                    styles={buildStyles({
                                        pathColor: getProgressColor(overallProgress),
                                        trailColor: (theme) => theme.palette.grey[200],
                                        strokeLinecap: 'butt',
                                    })}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, color: getProgressColor(overallProgress) }}>
                                        {`${overallProgress}%`}
                                    </Typography>
                                    <Typography variant="body2" display="block" color="text.secondary" sx={{ mt: -0.5 }}>Completed</Typography>
                                </CircularProgressbarWithChildren>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {completedTasks} of {totalTasks} tasks completed.
                            </Typography>
                        </Box>
                    </DashboardSectionCard>
                </Grid>

                <Grid item size={{ xs: 12, md: 6, lg: 4 }}>
                    <DashboardSectionCard title="Project Timeline" icon={<CalendarTodayIcon />} sx={{ minHeight: cardMinHeight }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                                <Typography variant="subtitle1" fontWeight="500">{project.startDate ? format(parseISO(project.startDate), 'MMMM dd, yyyy') : 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Deadline:</Typography>
                                <Typography variant="subtitle1" fontWeight="500">{project.deadline ? format(parseISO(project.deadline), 'MMMM dd, yyyy') : 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Time Remaining:</Typography>
                                <Chip
                                    icon={<AccessAlarmIcon fontSize="small" />}
                                    label={daysRemainingText}
                                    size="small"
                                    sx={{
                                        backgroundColor: deadlineChipColor !== 'default' ? `${deadlineChipColor}.lighter` : 'grey.200',
                                        color: deadlineChipColor !== 'default' ? `${deadlineChipColor}.dark` : 'text.primary',
                                        fontWeight: 500,
                                        mt: 0.5
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Time Logged:</Typography>
                                <Typography variant="subtitle1" fontWeight="500">{project.timeSpent || 'Not tracked'}</Typography>
                            </Box>
                        </Box>
                    </DashboardSectionCard>
                </Grid>

                <Grid item size={{ xs: 12, md: 6, lg: 4 }}>
                    <DashboardSectionCard title="Project Description" icon={<AssignmentIcon />} sx={{ minHeight: cardMinHeight }}>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, whiteSpace: 'pre-line', overflowY: 'auto', maxHeight: `calc(${cardMinHeight} - 90px)` }}>
                            {project.description ? stripHtmlTags(project.description) : 'No description provided.'}
                        </Typography>
                    </DashboardSectionCard>
                </Grid>

                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard
                        title="Team Members"
                        icon={<GroupIcon />}
                        actions={
                            <Can perform="project-member:create">
                                <Tooltip title="Add Team Member">
                                    <IconButton aria-label="add team member" onClick={() => setAddMemberDrawerOpen(true)}>
                                        <AddCircleOutlineIcon color="primary" />
                                    </IconButton>
                                </Tooltip>
                            </Can>
                        }
                    >
                        <TableContainer>
                            <Table stickyHeader size="small" aria-label="team members table">
                                <TableBody>
                                    {project.members?.length > 0 ? project.members.map(member => (
                                        <TableRow key={member.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar
                                                        src={member?.avatarUrl ? member?.avatarUrl : ''}
                                                        alt={member.name}
                                                        sx={{
                                                            mr: 1.5,
                                                            width: 32,
                                                            height: 32,
                                                            fontWeight: 600,
                                                            fontSize: '1rem',
                                                            bgcolor: 'grey.300'
                                                        }}
                                                    ></Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="500">{member.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{member.email || 'N/A'}</Typography>
                                                    </Box>
                                                </Box>
                                                <Can perform="project-member:delete">
                                                    <Tooltip title="Delete Member">
                                                        <IconButton
                                                            aria-label={`delete ${member.name}`}
                                                            onClick={() => handleDeleteClick(member)}
                                                            size="small"
                                                        >
                                                            <DeleteOutlineIcon color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Can>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={1} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">No team members assigned.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DashboardSectionCard>
                </Grid>

                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard
                        title={`Project Attachments (${currentAttachmentCount}/${MAX_ATTACHMENTS})`}
                        icon={<AttachmentIcon />}
                        sx={{ minHeight: cardMinHeight }}
                        actions={
                            <Can perform="project-document:create">
                                <Tooltip title={isAttachmentLimitReached ? `Maximum ${MAX_ATTACHMENTS} attachments allowed` : "Add Attachment"}>
                                    <span>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<AddPhotoAlternateOutlinedIcon />}
                                            onClick={handleAttachmentClick}
                                            disabled={isAttachmentLimitReached}
                                            sx={{
                                                textTransform: 'none',
                                                ...(isAttachmentLimitReached && {
                                                    opacity: 0.5,
                                                    cursor: 'not-allowed'
                                                })
                                            }}
                                        >
                                            Add File
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Can>
                        }
                    >
                        {isAttachmentLimitReached && (
                            <Box sx={{
                                mb: 2,
                                p: 1,
                                backgroundColor: 'warning.light',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'warning.main'
                            }}>
                                <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 500 }}>
                                    Maximum attachment limit ({MAX_ATTACHMENTS}) reached. Remove existing files to add new ones.
                                </Typography>
                            </Box>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelected}
                            accept="*/*"
                            disabled={isAttachmentLimitReached}
                        />

                        {project.projectDocuments && project.projectDocuments.length > 0 ? (
                            <List dense sx={{ overflowY: 'auto' }}>
                                {project.projectDocuments.map((doc, index) => (
                                    <ListItem
                                        key={doc.documentId || index}
                                        sx={{
                                            py: 1,
                                            px: 0,
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'stretch', sm: 'center' }
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            mb: { xs: 1, sm: 0 }
                                        }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                                                    <AttachFileOutlinedIcon fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="500">{doc.documentName}</Typography>}
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary">
                                                        {doc.documentType} • {doc.createdAt ? format(parseISO(doc.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                                                    </Typography>
                                                }
                                            />
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            gap: 1,
                                            alignSelf: { xs: 'flex-end', sm: 'center' },
                                            ml: { xs: 0, sm: 'auto' },
                                            flexShrink: 0
                                        }}>
                                            {doc.filePath && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleViewDocument(doc)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    View
                                                </Button>
                                            )}
                                            <Can perform="project-document:delete">
                                                <IconButton
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteDocumentClick(doc)}
                                                    size="small"
                                                    disabled={isDeletingDocument}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" color='error' />
                                                </IconButton>
                                            </Can>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                        ) : (
                            <Box sx={{
                                textAlign: 'center',
                                py: 4,
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                minHeight: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <AttachFileOutlinedIcon sx={{ fontSize: '2rem', color: 'text.secondary', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">No attachments yet</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    <Can perform="project-document:create" fallback="No documents available">
                                        Click "Add File" to upload documents
                                    </Can>
                                </Typography>
                            </Box>
                        )}
                    </DashboardSectionCard>
                </Grid>
            </Grid>

            <Can perform="project-member:create">
                <AddMemberDrawer
                    open={isAddMemberDrawerOpen}
                    onClose={() => setAddMemberDrawerOpen(false)}
                    projectId={project.id}
                    projectMembers={project.members}
                />
            </Can>

            <ConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Member"
                message={`Are you sure you want to remove ${memberToDelete?.name} from this project?`}
                confirmButtonText="Remove"
                confirmButtonColor="error"
            />

            <ConfirmationModal
                open={isDeleteDocumentModalOpen}
                onClose={() => setIsDeleteDocumentModalOpen(false)}
                onConfirm={handleConfirmDocumentDelete}
                title="Delete Attachment"
                message={`Are you sure you want to delete "${documentToDelete?.documentName}"? This action cannot be undone.`}
                confirmButtonText="Delete"
                confirmButtonColor="error"
            />
        </Box>
    );
}
