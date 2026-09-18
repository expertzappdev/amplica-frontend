import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Divider, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { format, differenceInDays, parseISO, isBefore, isValid } from 'date-fns';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { gridSpacing } from '../../../store/constant'; 
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const getAllTasks = (taskLists = []) => {
    return taskLists.reduce((acc, list) => acc.concat(list.tasks || []), []);
};

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


export default function ProjectReports({ project }) {
    const theme = useTheme();
    const [taskStatusData, setTaskStatusData] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [teamStatus, setTeamStatus] = useState([]);
    const [summaryChartData, setSummaryChartData] = useState({ series: [], categories: [] });
    const cardMinHeight = '30vh';

    useEffect(() => {
        if (project) {
            const allTasks = getAllTasks(project.taskLists);

            // 1. Task Status Data for Gauges
            const statuses = {
                Open: { count: 0, color: theme.palette.info.main, icon: <RadioButtonUncheckedIcon /> },
                InProgress: { count: 0, color: theme.palette.warning.main, icon: <DonutLargeIcon /> },
                InReview: { count: 0, color: theme.palette.secondary.main, icon: <RateReviewIcon /> },
                Completed: { count: 0, color: theme.palette.success.main, icon: <AssignmentTurnedInIcon /> },
            };

            allTasks.forEach(task => {
                if (task.status === 'Open' || task.status === 'Not Started' || task.status === 'Pending Approval') statuses.Open.count++;
                else if (task.status === 'In Progress') statuses.InProgress.count++;
                else if (task.status === 'In Review') statuses.InReview.count++;
                else if (task.status === 'Completed' || task.isChecked) statuses.Completed.count++;
            });

            const totalTasksForGauge = allTasks.length || 1;
            const gaugeData = Object.entries(statuses)
                .filter(([, data]) => data.count > 0 || Object.keys(statuses).length <= 4)
                .map(([name, data]) => ({
                    name: name.replace(/([A-Z])/g, ' $1').trim(),
                    value: parseFloat(((data.count / totalTasksForGauge) * 100).toFixed(1)),
                    count: data.count,
                    color: data.color,
                    icon: data.icon
                }));
            setTaskStatusData(gaugeData);


            // 2. Overdue Work Items
            const today = new Date();
            const overdue = allTasks.filter(task => {
                if (!task.dueDate || task.status === 'Completed' || task.isChecked) return false;
                const dueDate = parseISO(task.dueDate);
                return isValid(dueDate) && isBefore(dueDate, today);
            }).map(task => ({
                ...task,
                daysOverdue: differenceInDays(today, parseISO(task.dueDate))
            })).sort((a,b) => b.daysOverdue - a.daysOverdue);
            setOverdueTasks(overdue.slice(0, 5));


            // 3. Team Status (Simplified)
            const memberTasks = {};
            project.members.forEach(member => {
                memberTasks[member.name] = {
                    overdue: 0,
                    allOpen: 0,
                    avatarUrl: member.avatarUrl
                };
            });

            allTasks.forEach(task => {
                const assigneeName = task.assignee;
                if (assigneeName && memberTasks[assigneeName]) {
                    const isOverdue = overdue.some(ot => ot.id === task.id);
                    const isOpen = !(task.status === 'Completed' || task.isChecked);

                    if (isOverdue) memberTasks[assigneeName].overdue++;
                    if (isOpen) memberTasks[assigneeName].allOpen++;
                }
            });
            setTeamStatus(Object.entries(memberTasks).map(([name, data]) => ({ name, ...data })));


            // 4. Summary Chart Data
            const completedTasksCount = statuses.Completed.count;
            const openTasksCount = totalTasksForGauge - completedTasksCount;

            setSummaryChartData({
                series: [
                    { name: 'Created', data: [allTasks.length, project.taskLists.length] },
                    { name: 'Completed', data: [completedTasksCount, 0] },
                    { name: 'Still Open', data: [openTasksCount, project.taskLists.length] }
                ],
                categories: ['Tasks', 'Task Lists']
            });
        }
    }, [project, theme.palette]);


    const gaugeOptions = (value, color, name) => ({
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: { margin: 5, size: '50%' },
                dataLabels: {
                    name: { show: false },
                    value: { offsetY: 5, fontSize: '1.1rem', fontWeight: '600', color: color },
                },
                track: { background: theme.palette.grey[200], strokeWidth: '100%' }
            }
        },
        fill: { colors: [color] },
        series: [value],
        stroke: { lineCap: 'round' },
        labels: [name],
        tooltip: {
            y: { formatter: (val) => `${val}%` }
        }
    });

    const summaryChartOptions = {
        chart: { type: 'bar', height: 300, stacked: false, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: { categories: summaryChartData.categories, labels: { style: { colors: theme.palette.text.secondary }}},
        yaxis: { title: { text: 'Number of Items', style: { color: theme.palette.text.secondary }}, labels: { style: { colors: theme.palette.text.secondary }}},
        fill: { opacity: 1 },
        legend: { position: 'top', horizontalAlign: 'right', offsetY: -10, labels: { colors: theme.palette.text.secondary }},
        colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
        grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
        tooltip: { theme: theme.palette.mode }
    };


    if (!project) {
        return (
             <Box sx={{ p: gridSpacing, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
                <Typography variant="h6" color="text.secondary">Loading report data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: gridSpacing, flexGrow: 1, backgroundColor: (theme) => theme.palette.background.neutral || theme.palette.grey[50] }}>
            <Grid container spacing={gridSpacing}>
                {/* Task Status Gauges */}
                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard title="Task Status" icon={<TrendingUpIcon />} sx={{ height: '100%' }}>
                        {taskStatusData.length > 0 ? (
                            <Grid container spacing={1} alignItems="stretch">
                                {taskStatusData.map((status) => (
                                    <Grid item xs={12} sm={6} md={3} lg={6} key={status.name} sx={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
                                        <Box sx={{ width: '100%', maxWidth: 150 }}>
                                            <ReactApexChart options={gaugeOptions(status.value, status.color, status.name)} series={[status.value]} type="radialBar" height={250} />
                                        </Box>
                                        <Box sx={{textAlign: 'center', mt: 1}}>
                                            {React.cloneElement(status.icon, { sx: { color: status.color, fontSize: '1.2rem', verticalAlign: 'middle', mr:0.5 }})}
                                            <Typography variant="caption" component="span" sx={{ fontWeight: 500 }}>
                                                {status.name} ({status.count})
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography color="text.secondary">No task data available.</Typography>
                        )}
                    </DashboardSectionCard>
                </Grid>

                {/* Overdue Work Items */}
                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard title="Overdue Work Items" icon={<HistoryIcon />} sx={{ height: '100%' }}>
                        {overdueTasks.length > 0 ? (
                            <List dense sx={{maxHeight: 300, overflow: 'auto'}}>
                                {overdueTasks.map(task => (
                                    <ListItem key={task.id} divider>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: theme.palette.error.lighter, color: theme.palette.error.dark, width: 36, height: 36 }}>
                                                <EventBusyIcon fontSize="small"/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight="500">{task.taskName}</Typography>}
                                            secondary={`Due: ${format(parseISO(task.dueDate), 'MMM dd, yyyy')}`}
                                        />
                                        <Chip label={`Late by ${task.daysOverdue} day${task.daysOverdue === 1 ? '' : 's'}`} color="error" size="small" variant="outlined"/>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary">No overdue tasks. Great job! 👍</Typography>
                        )}
                    </DashboardSectionCard>
                </Grid>

                {/* Team Status */}
                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard title="Team Status" icon={<GroupIcon />} sx={{ minHeight: cardMinHeight }}>
                        {teamStatus.length > 0 ? (
                             <TableContainer>
                                <Table stickyHeader size="small" aria-label="team status table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{fontWeight:600}}>User</TableCell>
                                            <TableCell align="center" sx={{fontWeight:600, color: theme.palette.error.main}}>Overdue</TableCell>
                                            <TableCell align="center" sx={{fontWeight:600}}>All Open</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teamStatus.map(member => (
                                            <TableRow key={member.name} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar src={member.avatarUrl} sx={{ width: 32, height: 32, mr: 1}} />
                                                        <Typography variant="body2" fontWeight="500">{member.name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" fontWeight={member.overdue > 0 ? 600 : 400} color={member.overdue > 0 ? 'error.main' : 'text.primary'}>
                                                        {member.overdue}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{member.allOpen}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                             <Typography color="text.secondary">No team member data to display.</Typography>
                        )}
                    </DashboardSectionCard>
                </Grid>

                {/* Project Summary Chart */}
                <Grid item size={{ xs: 12, md: 6, lg: 6 }}>
                    <DashboardSectionCard title="Project Creation Summary" icon={<TrendingUpIcon />} sx={{ minHeight: cardMinHeight }}>
                        {summaryChartData.series.length > 0 && summaryChartData.categories.length > 0 ? (
                            <ReactApexChart options={summaryChartOptions} series={summaryChartData.series} type="bar" height={280} />
                        ) : (
                            <Typography color="text.secondary">Insufficient data for summary chart.</Typography>
                        )}
                    </DashboardSectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}