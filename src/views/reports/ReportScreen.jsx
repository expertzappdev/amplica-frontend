import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Paper, CircularProgress,
  Grid, Chip, Alert, Tooltip, Avatar, Select, MenuItem,
  FormControl, Card, CardContent, Divider,
  LinearProgress, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Badge, TablePagination,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Timer as TimerIcon,
  BarChart as BarChartIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  CalendarToday as CalendarTodayIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
// import * as XLSX from 'xlsx';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import ViewHeader from '../../uiComponent/viewheader';
import MemberSelectionModal from '../../uiComponent/memberSelection/MemberSelectionModal';
import ProgressDisplay from '../../uiComponent/progressbar/ProgressDisplay';
import StatusDropdown from '../../uiComponent/statusdropdown/StatusDropdown';
import { gridSpacing } from '../../store/constant';
import { useCan } from '../../hooks/useCan';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
import {
  fetchReportByMemberRequest,
  fetchCompanyReportRequest,
  selectReportData,
  selectCompanyReportData,
  selectReportLoading,
  selectReportQuery,
  setReportQuery,
  clearReportError,
  selectReportError,
} from '../../redux/features/report/reportSlice';
import { selectUser, selectPermissions } from '../../redux/features/auth/authSlice';
import { selectStatusItems } from '../../redux/features/projects/projectSlice';
import { selectUserProfile, getUserProfileRequest } from '../../redux/features/profile/profileSlice';

const cardStyle = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transform: 'translateY(-1px)',
  },
};

const tableCellStyle = {
  borderRight: '1px solid',
  borderColor: 'divider',
  '&:last-of-type': { borderRight: 0 },
  py: 0.7,
  px: 1.5,
};

const tableHeaderCellStyle = {
  ...tableCellStyle,
  fontWeight: 'bold',
  color: 'text.primary',
  backgroundColor: 'grey.100',
  py: 0.5,
};

const metricCardStyle = (variant = 'default') => {
  const variants = {
    primary: {
      background: '#007bff99',
      color: '#333',
    },
    success: {
      background: '#28a74599',
      color: '#333',
    },
    warning: {
      background: '#ffc10799',
      color: '#333',
    },
    error: {
      background: '#dc354599',
      color: '#333',
    },
    info: {
      background: '#007bff99',
      color: '#333',
    },
    default: {
      background: '',
      color: '#333',
    },
  };

  return {
    borderRadius: 4,
    height: '7.5rem',
    ...variants[variant],
  };
};

// Status color mapping
const getStatusColor = (status) => {
  const statusColors = {
    completed: { bg: '#4CAF50', color: '#fff' },
    'in progress': { bg: '#2196F3', color: '#fff' },
    pending: { bg: '#FF9800', color: '#fff' },
    backlog: { bg: '#F44336', color: '#fff' },
    'to do': { bg: '#9E9E9E', color: '#fff' },
    default: { bg: '#757575', color: '#fff' },
  };
  return statusColors[status?.toLowerCase()] || statusColors.default;
};

const dateFilterOptions = [
  // { value: "All Time", label: "All Time" },
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "Current Week", label: "Current Week" },
  { value: "Last Week", label: "Last Week" },
  { value: "Current Month", label: "Current Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "Custom", label: "Custom Range" }
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Delayed', label: 'Delayed' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'InReview', label: 'In Review' },
  { value: 'Open', label: 'Open' },
  { value: 'NotStarted', label: 'Not Started' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

// Table head cells for task breakdown - Updated with S.No
const taskHeadCells = [
  { id: 'serialNumber', label: 'S.No', minWidth: 60, align: 'center' },
  { id: 'title', label: 'Task Name', minWidth: 200 },
  { id: 'projectName', label: 'Project', minWidth: 150 },
  { id: 'statusName', label: 'Status', minWidth: 120 },
  { id: 'estimatedHours', label: 'Est. Hours', minWidth: 100, align: 'center' },
  { id: 'actualHours', label: 'Actual Hours', minWidth: 100, align: 'center' },
  { id: 'progression', label: 'Progress', minWidth: 120, align: 'center' },
];

export default function ReportScreen() {
  const dispatch = useDispatch();

  // Local State
  const [activeFilter, setActiveFilter] = useState('Today');
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isCustomDateModalOpen, setCustomDateModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [allReportsPage, setAllReportsPage] = useState(0);
  const [allReportsPageSize, setAllReportsPageSize] = useState(5);

  // Redux State
  const currentUser = useSelector(selectUser);
  const permissions = useSelector(selectPermissions) || [];

  const canReadAllReports = permissions.includes('report:read:all');
  const canReadDepartmentReports = permissions.includes('report:read:department') || permissions.includes('report:read:adepartment');
  const userProfile = useSelector(selectUserProfile);
  const reportData = useSelector(selectReportData);
  const companyReportData = useSelector(selectCompanyReportData);
  const reportLoading = useSelector(selectReportLoading);
  const reportQuery = useSelector(selectReportQuery);
  const reportError = useSelector(selectReportError);
  const statusData = useSelector(selectStatusItems) || [];

  // Determine if the user can select other members
  const canSelectMember = canReadAllReports || canReadDepartmentReports;

  // Get department filter if restricted to department
  const departmentFilter = (!canReadAllReports && canReadDepartmentReports && userProfile)
    ? userProfile.departmentName
    : "";

  // Fetch current user's profile if needed for department filtering
  useEffect(() => {
    if (currentUser?.id && !userProfile && canReadDepartmentReports && !canReadAllReports) {
      dispatch(getUserProfileRequest({ userId: currentUser.id }));
    }
  }, [currentUser, userProfile, canReadDepartmentReports, canReadAllReports, dispatch]);

  // Initialize with current user (default selection)
  useEffect(() => {
    if (currentUser?.id && !selectedMember) {
      setSelectedMember({ id: currentUser.id, name: currentUser.fullName });
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      dispatch(setReportQuery({
        ...reportQuery,
        id: currentUser.id,
        startDateTo: todayStr,
        endDateTo: todayStr,
        statuses: null,
        pageNumber: 1
      }));
    }
  }, [currentUser, selectedMember, dispatch]);

  // Fetch report data when query changes
  useEffect(() => {
    if (reportQuery.id) {
      if (reportQuery.id === 'all') {
        dispatch(fetchCompanyReportRequest(reportQuery));
      } else {
        dispatch(fetchReportByMemberRequest(reportQuery));
      }
    }
  }, [reportQuery, dispatch]);

  // Handle Errors with Toast
  useEffect(() => {
    if (reportError) {
      toast.error(reportError);
      dispatch(clearReportError());
    }
  }, [reportError, dispatch]);

  const handleRetry = () => {
    dispatch(clearReportError())
  };

  // Event Handlers
  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);

    if (filter === "Custom") {
      setCustomDateModalOpen(true);
      return;
    }

    let startDate = null, endDate = null;
    const today = new Date();
    const year = today.getFullYear();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (filter === "Today") {
      startDate = format(today, 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
    } else if (filter === "Yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = format(yesterday, 'yyyy-MM-dd');
      endDate = format(yesterday, 'yyyy-MM-dd');
    } else if (filter === "Current Week") {
      const firstDay = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      firstDay.setDate(diff);

      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);

      startDate = format(firstDay, 'yyyy-MM-dd');
      endDate = format(lastDay, 'yyyy-MM-dd');
    } else if (filter === "Last Week") {
      const firstDay = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7;
      firstDay.setDate(diff);

      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);

      startDate = format(firstDay, 'yyyy-MM-dd');
      endDate = format(lastDay, 'yyyy-MM-dd');
    } else if (filter === "Current Month") {
      startDate = format(new Date(year, today.getMonth(), 1), 'yyyy-MM-dd');
      endDate = format(new Date(year, today.getMonth() + 1, 0), 'yyyy-MM-dd');
    } else if (filter === "Last Month") {
      startDate = format(new Date(year, today.getMonth() - 1, 1), 'yyyy-MM-dd');
      endDate = format(new Date(year, today.getMonth(), 0), 'yyyy-MM-dd');
    } else if (filter !== "All Time") {
      const monthIndex = monthNames.indexOf(filter);
      if (monthIndex !== -1) {
        startDate = format(new Date(year, monthIndex, 1), 'yyyy-MM-dd');
        endDate = format(new Date(year, monthIndex + 1, 0), 'yyyy-MM-dd');
      }
    }

    dispatch(setReportQuery({
      ...reportQuery,
      startDateTo: startDate,
      endDateTo: endDate,
      pageNumber: 1
    }));
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDateStr = format(customStartDate, 'yyyy-MM-dd');
      const endDateStr = format(customEndDate, 'yyyy-MM-dd');

      dispatch(setReportQuery({
        ...reportQuery,
        startDateTo: startDateStr,
        endDateTo: endDateStr,
        pageNumber: 1
      }));

      setCustomDateModalOpen(false);
    }
  };

  const handleMemberSelect = (selectedMembers) => {
    if (selectedMembers.length > 0) {
      const member = selectedMembers[0];
      setSelectedMember(member);
      dispatch(setReportQuery({ ...reportQuery, id: member.id, pageNumber: 1 }));
    }
    setMemberModalOpen(false);
  };

  const handleRefresh = () => {
    if (reportQuery.id) {
      if (reportQuery.id === 'all') {
        dispatch(fetchCompanyReportRequest(reportQuery));
      } else {
        dispatch(fetchReportByMemberRequest(reportQuery));
      }
    }
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setSelectedStatus(value);

    dispatch(setReportQuery({
      ...reportQuery,
      statuses: value,
      pageNumber: 1
    }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setReportQuery({
      ...reportQuery,
      pageNumber: newPage + 1
    }));
  };

  const handlePageSizeChange = (event) => {
    dispatch(setReportQuery({
      ...reportQuery,
      pageSize: parseInt(event.target.value, 10),
      pageNumber: 1
    }));
  };

  const handleExport = () => {
    let tasksToExport = [];

    if (selectedMember?.id === 'all') {
      if (!companyReportData?.userSummaries) {
        toast.error('No company report data available to export');
        return;
      }

      companyReportData.userSummaries.forEach(userSummary => {
        const memberName = userSummary.userName || 'Unknown User';
        const tasksByDate = userSummary.tasksByDate || [];

        tasksByDate.forEach(dateGroup => {
          const dateStr = dateGroup.date;
          const tasks = dateGroup.tasks || [];

          tasks.forEach(task => {
            tasksToExport.push({
              'Member Name': memberName,
              'Date': format(parseISO(dateStr), 'dd/MM/yyyy'),
              'Task Name': task.title || 'N/A',
              'Project': task.projectName || 'To-Do',
              'Status': task.originalStatus || 'N/A',
              'Estimated Hours': parseFloat(task.estimatedHours || 0),
              'Actual Hours': parseFloat(task.actualHours || 0),
              'Progress': `${task.progression || 0}%`,
              // helper fields for sorting
              _memberNameRaw: memberName,
              _dateRaw: dateStr
            });
          });
        });
      });
    } else {
      if (!reportData?.tasksByDate) {
        toast.error('No report data available to export');
        return;
      }
      const memberName = reportData?.userName || selectedMember?.name || 'Current User';
      const tasksByDate = reportData?.tasksByDate || [];

      tasksByDate.forEach(dateGroup => {
        const dateStr = dateGroup.date;
        const tasks = dateGroup.tasks || [];

        tasks.forEach(task => {
          tasksToExport.push({
            'Member Name': memberName,
            'Date': format(parseISO(dateStr), 'dd/MM/yyyy'),
            'Task Name': task.title || 'N/A',
            'Project': task.projectName || 'To-Do',
            'Status': task.originalStatus || 'N/A',
            'Estimated Hours': parseFloat(task.estimatedHours || 0),
            'Actual Hours': parseFloat(task.actualHours || 0),
            'Progress': `${task.progression || 0}%`,
            // helper fields for sorting
            _memberNameRaw: memberName,
            _dateRaw: dateStr
          });
        });
      });
    }

    if (tasksToExport.length === 0) {
      toast.error('No tasks found to export');
      return;
    }

    // Sort: Member Name alphabetical ascending (A-Z) -> Date descending
    tasksToExport.sort((a, b) => {
      const nameCompare = a._memberNameRaw.localeCompare(b._memberNameRaw);
      if (nameCompare !== 0) return nameCompare;
      return b._dateRaw.localeCompare(a._dateRaw);
    });

    // Remove helper fields
    const exportRows = tasksToExport.map(({ _memberNameRaw, _dateRaw, ...rest }) => rest);

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Report");

      // Auto-fit columns
      const maxColumnWidths = {};
      exportRows.forEach(row => {
        Object.keys(row).forEach(key => {
          const val = row[key] ? row[key].toString() : '';
          const len = val.length;
          if (!maxColumnWidths[key] || len > maxColumnWidths[key]) {
            maxColumnWidths[key] = len;
          }
        });
      });
      worksheet['!cols'] = Object.keys(maxColumnWidths).map(key => ({
        wch: Math.max(maxColumnWidths[key] + 3, 10)
      }));

      const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
      XLSX.writeFile(workbook, `Reports_Export_${dateStr}.xlsx`);
      // toast.success('Report exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report to Excel.');
    }
  };

  // Get display value for time period dropdown
  const getTimeDisplayValue = () => {
    if (activeFilter === "Custom" && customStartDate && customEndDate) {
      const start = format(customStartDate, 'dd/MM/yyyy');
      const end = format(customEndDate, 'dd/MM/yyyy');
      return `${start} - ${end}`;
    }
    return activeFilter;
  };

  const renderFiltersRow = () => (
      
    <Paper elevation={0} sx={{ ...cardStyle, py: 1, px: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
       
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
            Team Member
          </Typography>
          <FormControl fullWidth>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setMemberModalOpen(true)}
              disabled={!canSelectMember || reportLoading}
              endIcon={reportLoading ? <CircularProgress size={18} /> : <KeyboardArrowDownIcon />}
            
              sx={{
  justifyContent: 'space-between',
  textTransform: 'none',
  height: '38px',
  borderRadius: 2,
  borderColor: 'rgba(0, 0, 0, 0.23)',
  borderWidth: '1px',

  '&:hover': {
    borderWidth: '1px',
    borderColor: 'text.primary'
  },

  '&.Mui-disabled': {
    borderWidth: '1px',
    borderColor: 'rgba(0, 0, 0, 0.12)'
  },

  color: !canSelectMember ? 'text.disabled' : 'text.primary',
  px: 1.5
}}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedMember?.name || 'Select Member'}
              </Typography>
            </Button>
          </FormControl>
          {!canSelectMember && (
 <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>              Limited to your own reports
         
            </Typography>
          )}
          {canSelectMember && !canReadAllReports && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', minHeight: '20px' }}>
            
              Limited to your department: {userProfile?.departmentName || '...'}
            </Typography>
          )}
          {(canReadAllReports || (canSelectMember && canReadAllReports)) && (
            <Box sx={{ minHeight: '0px', mt: 0.5 }} />
          )}

    </Grid>
  

        <Grid item size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
            Time Period
          </Typography>
          <FormControl fullWidth>
            <Select
              value={activeFilter}
              onChange={(e) => handleFilterSelect(e.target.value)}
              disabled={reportLoading}
              displayEmpty
              sx={{
                borderRadius: 2,
               
                height: '38px',
                fontSize: '0.825rem',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  py: 0.75
                }
              }}
            >
              {dateFilterOptions.map(option => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  onClick={option.value === "Custom" ? () => setCustomDateModalOpen(true) : undefined}
                >
                  {option.value === "Custom" && activeFilter === "Custom" && customStartDate && customEndDate ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.825rem' }}>
                        Custom Range
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(customStartDate, 'dd/MM')} - {format(customEndDate, 'dd/MM/yyyy')}
                      </Typography>
                    </Box>
                  ) : (
                    option.label
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ minHeight: '0px', mt: 0.5 }} />
        </Grid>

        <Grid item size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
            Task Status
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              disabled={reportLoading}
              displayEmpty
              sx={{
                borderRadius: 2,
                
                height: '38px',
                fontSize: '0.825rem',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  py: 0.75
                }
              }}
            >
              <MenuItem value="">
                All Statuses
              </MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ minHeight: '3px', mt: 0.5 }} />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderCustomDateModal = () => (
    <Dialog open={isCustomDateModalOpen} onClose={() => setCustomDateModalOpen(false)}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon color="primary" />
          Select Custom Date Range
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minWidth: 300, py: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3} sx={{ minWidth: 300, py: 1 }}>
            <DatePicker
              label="Start Date"
              value={customStartDate}
              onChange={setCustomStartDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "DD/MM/YYYY",
                  // helperText: "Format: DD/MM/YYYY"
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={customEndDate}
              onChange={setCustomEndDate}
              minDate={customStartDate}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "DD/MM/YYYY",
                  // helperText: "Format: DD/MM/YYYY"
                }
              }}
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={() => setCustomDateModalOpen(false)}>Cancel</Button>
        <Button
          onClick={handleCustomDateApply}
          variant="contained"
          disabled={!customStartDate || !customEndDate}
          sx={{ borderRadius: 2 }}
        >
          Apply Range
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPerformanceSummary = (summary, displayUserName) => {
    if (reportLoading) {
      return (
        <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            Performance Summary
          </Typography>
          <Grid container spacing={3}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Card sx={{ height: '160px', borderRadius: 4 }}>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}>
                    <CircularProgress size={32} sx={{ mb: 2 }} />
                    <Typography variant="body2">Loading...</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }

    if (!summary) {
      return (
        <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Performance Data Available
            </Typography>
            <Typography variant="body2">
              No report data is available for the selected member and time period.
            </Typography>
          </Alert>
        </Paper>
      );
    }

    const completedTasksCount = summary.completedTasks || 0;
    const pendingTasksCount = summary.pendingTasks || 0;

    const performanceMetrics = [
      {
        label: 'Total Tasks',
        value: summary.totalTasks,
        icon: <PlaylistAddCheckIcon sx={{ fontSize: '1rem' }} />,
        variant: 'primary',
        subtitle: 'All assigned tasks'
      },
      {
        label: 'Completed Tasks',
        value: completedTasksCount,
        icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />,
        variant: 'success',
        subtitle: `${summary.totalTasks > 0 ? Math.round((completedTasksCount / summary.totalTasks) * 100) : 0}% completion rate`
      },
      {
        label: 'Pending Tasks',
        value: pendingTasksCount,
        icon: <PendingIcon sx={{ fontSize: '1rem' }} />,
        variant: 'error',
        subtitle: 'Pending tasks'
      },
      {
        label: 'Estimated Hours',
        value: `${parseFloat(summary.totalEstimatedHours || 0).toFixed(1)}h`,
        icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
        variant: 'info',
        subtitle: 'Planned hours'
      },
      {
        label: 'Actual Time Logged',
        value: `${parseFloat(summary.totalActualHours || 0).toFixed(1)}h`,
        icon: <SpeedIcon sx={{ fontSize: '1rem' }} />,
        variant: 'warning',
        subtitle: 'Time logged'
      },
    ];

    // return (
    //   <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 3 }}>
    //     <Box sx={{
    //       display: 'flex',
    //       justifyContent: 'space-between',
    //       alignItems: 'center',
    //       mb: 3
    //     }}>
    //       <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>
    //         Performance Overview
    //       </Typography>
    //       <Typography variant="body2" color="text.secondary">
    //         {displayUserName}
    //       </Typography>
    //     </Box>

    //     <Grid container spacing={3}>
    //       {performanceMetrics.map((metric, index) => (
    //         <Grid item xs={12} sm={6} md={2.4} key={index}>
    //           <Card sx={metricCardStyle(metric.variant)}>
    //             <CardContent sx={{
    //               height: '100%',
    //               width: '7.5rem',
    //               display: 'flex',
    //               flexDirection: 'column',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //               position: 'relative',
    //               zIndex: 1,
    //               textAlign: 'center'
    //             }}>
    //               <Box sx={{ mb: 0.75, opacity: 0.9 }}>
    //                 {metric.icon}
    //               </Box>
    //               <Typography
    //                 variant="h3"
    //                 sx={{
    //                   fontWeight: 'bold',
    //                   fontSize: '1rem',
    //                   mb: 0.2,
    //                   textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    //                 }}
    //               >
    //                 {metric.value}
    //               </Typography>
    //               <Typography
    //                 variant="h6"
    //                 sx={{
    //                   fontWeight: 600,
    //                   mb: 0.2,
    //                   opacity: 0.95
    //                 }}
    //               >
    //                 {metric.label}
    //               </Typography>
    //             </CardContent>
    //           </Card>
    //         </Grid>
    //       ))}
    //     </Grid>
    //   </Paper>
    // );
  };

  // Updated renderTaskTable with serial/embedded logic
  const renderTaskTable = (tasks, title, emptyMessage, statusCategory, isEmbedded = false) => {
    // Add serial numbers to tasks
    const tasksWithSerialNumbers = tasks.map((task, index) => ({
      ...task,
      serialNumber: index + 1
    }));

    const tableContent = (
      <>
        {!isEmbedded && (
          <Box sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: statusCategory === 'Completed' ?
              'linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)' :
              statusCategory === 'Backlog' ?
                'linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)' :
                'linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                {title}
              </Typography>
              <Badge
                color={statusCategory === 'Completed' ? 'success' : statusCategory === 'Backlog' ? 'error' : 'primary'}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.875rem',
                    height: '24px',
                    minWidth: '24px'
                  }
                }}
              >
                <Chip
                  label={`${tasks.length} Tasks`}
                  variant="outlined"
                  size="small"
                />
              </Badge>
            </Box>
          </Box>
        )}

        {tasksWithSerialNumbers.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {taskHeadCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.align || 'left'}
                      sx={{ ...tableHeaderCellStyle, minWidth: headCell.minWidth }}
                    >
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasksWithSerialNumbers.map((task) => (
                  <TableRow key={task.taskId} hover sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                  }}>
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {task.serialNumber}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        {task.projectName || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Chip
                        label={task.originalStatus}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(task.originalStatus).bg,
                          color: getStatusColor(task.originalStatus).color,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          height: 24,
                          borderRadius: '12px',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {parseFloat(task.estimatedHours || 0).toFixed(1)}h
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        {parseFloat(task.actualHours || 0).toFixed(1)}h
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <ProgressDisplay value={task.progression || 0} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: '32px', color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {emptyMessage}
            </Typography>
          </Box>
        )}
      </>
    );

    if (isEmbedded) {
      return <Box sx={{ mb: 1 }}>{tableContent}</Box>;
    }

    return (
      <Paper elevation={0} sx={{ ...cardStyle, mb: 3 }}>
        {tableContent}
      </Paper>
    );
  };

  const renderTasksByDate = () => {
    if (!reportData?.tasksByDate || reportData.tasksByDate.length === 0) {
      if (reportLoading) return null;
      return (
        <Paper elevation={0} sx={{ ...cardStyle, p: 4, textAlign: 'center', mb: 3 }}>
          <AssignmentIcon sx={{ fontSize: '48px', color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No tasks found for the selected criteria
          </Typography>
        </Paper>
      );
    }

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: '18px', color: 'text.primary' }}>
          Detailed Tasks Breakdown (Date-wise)
        </Typography>
        <Stack spacing={4}>
          {reportData.tasksByDate.map((dateGroup) => (
            <Box key={dateGroup.date}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {format(parseISO(dateGroup.date), 'eeee, MMMM do, yyyy')}
                </Typography>
                <Chip
                  label={`${dateGroup.taskCount} tasks`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              {renderTaskTable(
                dateGroup.tasks,
                `Tasks on ${format(parseISO(dateGroup.date), 'MMM do')}`,
                'No tasks recorded for this day',
                'DateGroup'
              )}
            </Box>
          ))}
        </Stack>

        <TablePagination
          component="div"
          count={reportData?.pagination?.totalTasks || 0}
          page={(reportQuery.pageNumber || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={reportQuery.pageSize || 10}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{
            mt: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500
            }
          }}
        />
      </Box>
    );
  };

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const dateAccordionStyle = {
    boxShadow: 'none',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '10px !important',
    overflow: 'hidden',
    bgcolor: 'background.paper',
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
      boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
    }
  };

  const employeeAccordionStyle = {
    boxShadow: 'none',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '8px !important',
    bgcolor: 'background.paper',
    '&:before': { display: 'none' },
    '&.Mui-expanded': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }
  };

  // Aggregate and sort company tasks by Date and Member (A-Z)
  const aggregatedCompanyTasksByDate = useMemo(() => {
    if (selectedMember?.id !== 'all' || !companyReportData?.userSummaries) return [];

    const dateMap = {};

    companyReportData.userSummaries.forEach(userSummary => {
      const user = { userId: userSummary.userId, userName: userSummary.userName };
      const tasksByDate = userSummary.tasksByDate || [];

      tasksByDate.forEach(dateGroup => {
        const d = dateGroup.date;
        if (!dateMap[d]) {
          dateMap[d] = {
            date: d,
            taskCount: 0,
            totalEstHours: 0,
            totalActHours: 0,
            members: []
          };
        }

        const tasks = dateGroup.tasks || [];
        const totalEstHours = tasks.reduce((sum, t) => {
          const val = parseFloat(t.estimatedHours);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        const totalActHours = tasks.reduce((sum, t) => {
          const val = parseFloat(t.actualHours);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        dateMap[d].taskCount += tasks.length;
        dateMap[d].totalEstHours += totalEstHours;
        dateMap[d].totalActHours += totalActHours;
        dateMap[d].members.push({
          user,
          tasks,
          totalEstHours,
          totalActHours
        });
      });
    });

    const dateList = Object.values(dateMap);

    dateList.forEach(dGroup => {
      dGroup.members.sort((a, b) => a.user.userName.localeCompare(b.user.userName));
    });

    return dateList.sort((a, b) => b.date.localeCompare(a.date));
  }, [companyReportData, selectedMember]);

  const paginatedCompanyDates = useMemo(() => {
    const start = allReportsPage * allReportsPageSize;
    const end = start + allReportsPageSize;
    return aggregatedCompanyTasksByDate.slice(start, end);
  }, [aggregatedCompanyTasksByDate, allReportsPage, allReportsPageSize]);

  // Render company breakdown with accordions per member
  const renderAllMembersTasksByDate = () => {
    if (!companyReportData?.userSummaries || companyReportData.userSummaries.length === 0) {
      if (reportLoading) return null;
      return (
        <Paper elevation={0} sx={{ ...cardStyle, p: 4, textAlign: 'center', mb: 3 }}>
          <AssignmentIcon sx={{ fontSize: '48px', color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No tasks found for the selected criteria across all members
          </Typography>
        </Paper>
      );
    }

    if (aggregatedCompanyTasksByDate.length === 0) {
      return (
        <Paper elevation={0} sx={{ ...cardStyle, p: 4, textAlign: 'center', mb: 3 }}>
          <AssignmentIcon sx={{ fontSize: '48px', color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No task records found for the selected dates/statuses
          </Typography>
        </Paper>
      );
    }

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: '18px', color: 'text.primary' }}>
          Detailed Tasks Breakdown (Date-wise - All Members)
        </Typography>
        <Stack spacing={2}>
          {paginatedCompanyDates.map((dateGroup, index) => (
            <Accordion key={dateGroup.date} defaultExpanded={index === 0} sx={dateAccordionStyle}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" sx={{ fontSize: '1.2rem' }}/>}
                sx={{
                  px: 2,
                  py: 1,
                  minHeight:'14px !important',
                  
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    my: '7px !important'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {format(parseISO(dateGroup.date), 'eeee, MMMM do, yyyy')}
                  </Typography>
                  <Chip
                    label={`${dateGroup.taskCount} tasks`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${dateGroup.members.length} ${dateGroup.members.length === 1 ? 'member' : 'members'}`}
                    size="small"
                    sx={{ fontWeight: 500, bgcolor: 'grey.100', color: 'text.secondary', height: 24 }}
                  />
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                    label={`Est: ${dateGroup.totalEstHours.toFixed(1)}h`}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 24 }}
                  />
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                    label={`Actual: ${dateGroup.totalActHours.toFixed(1)}h`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ height: 24 }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: { xs: 1.5, sm: 0 }, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={0}>
                  {dateGroup.members.map((member) => (
                    <Accordion key={member.user.userId} sx={employeeAccordionStyle}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon color="action" />}
                        sx={{
                          px: 2,
                          py: 0.5,
                          minHeight: 52,
                          bgcolor: 'background.paper',
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                            my: '6px !important'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{ width: 32, height: 32, bgcolor: 'grey.300', fontSize: '0.875rem', fontWeight: 600 }}
                          >
                            {getInitials(member.user.userName)}
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {member.user.userName}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${member.tasks.length} tasks`}
                            size="small"
                            sx={{ fontWeight: 500, bgcolor: 'primary.light', color: 'primary.dark', height: 24 }}
                          />
                          <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                            label={`Est: ${member.totalEstHours.toFixed(1)}h`}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ height: 24 }}
                          />
                          <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                            label={`Actual: ${member.totalActHours.toFixed(1)}h`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ height: 24 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                        {renderTaskTable(
                          member.tasks,
                          `Tasks for ${member.user.userName}`,
                          'No tasks recorded',
                          'Accordion',
                          true
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <TablePagination
          component="div"
          count={aggregatedCompanyTasksByDate.length}
          page={allReportsPage}
          onPageChange={(e, newPage) => setAllReportsPage(newPage)}
          rowsPerPage={allReportsPageSize}
          onRowsPerPageChange={(e) => {
            setAllReportsPageSize(parseInt(e.target.value, 10));
            setAllReportsPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            mt: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500
            }
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: gridSpacing / 2,
        mt: gridSpacing / 2,
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Reports
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={reportLoading}
          sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ mt: gridSpacing }}>
        {reportError && (
          <ErrorBoundary
            error={reportError}
            onRetry={handleRetry}
            onDismiss={() => navigate('/reports')}
            title="Failed to Load Report"
            showInline={false}
            showImage={true}
          />
        )}

        {renderFiltersRow()}

        {selectedMember?.id === 'all'
          ? renderPerformanceSummary(companyReportData?.companySummary, 'All Members')
          : renderPerformanceSummary(reportData?.summary, reportData?.userName || selectedMember?.name || 'Current User')
        }

        {/* Detailed Breakdown */}
        {selectedMember?.id === 'all'
          ? renderAllMembersTasksByDate()
          : (!reportLoading && renderTasksByDate())
        }
      </Box>

      <MemberSelectionModal
        open={isMemberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onConfirm={handleMemberSelect}
        title="Choose Team Member"
        singleSelect={true}
        departmentFilter={departmentFilter}
        showAllOption={true}
      />

      {/* Custom Date Range Modal */}
      {renderCustomDateModal()}
    </Box>
  );
}
