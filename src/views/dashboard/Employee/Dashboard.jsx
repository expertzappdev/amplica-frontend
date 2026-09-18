import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import { Typography, Stack, Box } from '@mui/material';
import { gridSpacing } from 'store/constant';
import MyTasksCard from './MyTasksCard';
import MyProjectCard from './MyProjectCard';
import MissionVisionGoalsCard from './MissionVisionGoalsCard';
import Can from '../../../uiComponent/Can';

// Import task-related Redux functionality
import {
  fetchUserTasksRequest,
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
  selectTasksQuery
} from '../../../redux/features/tasks/taskSlice';

// Import project-related Redux functionality
import {
  fetchProjectsRequest,
  selectAllProjects,
  selectProjectsLoading,
  selectProjectsError,
  selectQuery as selectProjectQuery
} from '../../../redux/features/projects/projectSlice';

import { 
  selectCompanyIdData, 
  getCompanyByIdRequest 
} from '../../../redux/features/company/companySlice';

import { 
  selectUserCompanyId,
  selectUser,
  selectIsAuthenticated
} from '../../../redux/features/auth/authSlice';

import { format, parseISO, isValid } from 'date-fns';

const staticDashboardData = {
  projectWorkLog: {
    series: [44, 55, 30, 25],
    labels: ["Project 1", "Project 2", "Project 3", "Project 4"],
    colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
  },
  tasks: {
    series: [32, 25, 25, 18],
    labels: ["Completed", "On Hold", "On Progress", "Pending"],
    colors: ["#3f51b5", "#9c27b0", "#00bcd4", "#f44336"]
  }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [hasFetchedTasks, setHasFetchedTasks] = useState(false);
  const [hasFetchedProjects, setHasFetchedProjects] = useState(false);

  // Redux selectors
  const userCompanyId = useSelector(selectUserCompanyId);
  const company = useSelector(selectCompanyIdData);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);
  
  // Task-related selectors
  const taskItems = useSelector(selectAllTasks) || { items: [], totalCount: 0 };
  const tasksLoading = useSelector(selectTasksLoading);
  const taskError = useSelector(selectTasksError);

  // Project-related selectors
  const projectItems = useSelector(selectAllProjects) || { items: [], totalCount: 0 };
  const projectsLoading = useSelector(selectProjectsLoading);
  const projectError = useSelector(selectProjectsError);

  // Fetch company data
  useEffect(() => {
    setDashboardData(staticDashboardData);
    if (userCompanyId) {
      dispatch(getCompanyByIdRequest(userCompanyId));
    }
    setLoading(false);
  }, [dispatch, userCompanyId]);

  // Fetch task data
  useEffect(() => {
    if (isAuthenticated && currentUser && !hasFetchedTasks) {
      dispatch(fetchUserTasksRequest({
        page: 1,
        pageSize: 10,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        search: '',
        statusNames: '',
        startDateFrom: null,
        endDateTo: null,
        memberUserId: null,
      }));
      setHasFetchedTasks(true);
    }
  }, [dispatch, isAuthenticated, currentUser, hasFetchedTasks]);

  // Fetch project data
  useEffect(() => {
    if (isAuthenticated && currentUser && !hasFetchedProjects) {
      dispatch(fetchProjectsRequest({
        page: 1,
        pageSize: 10,
        sortBy: '',
        sortOrder: '',
        search: '',
        statusNames: '',
        startDateFrom: null,
        endDateTo: null,
        memberUserId: null,
      }));
      setHasFetchedProjects(true);
    }
  }, [dispatch, isAuthenticated, currentUser, hasFetchedProjects]);

  // Transform task data for the component
  const transformTasksForDisplay = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map((task) => ({
      id: task.taskId,
      title: task.title,
      category: task.projectName || 'Personal Task',
      dueDate: task.endDate ? (
        isValid(parseISO(task.endDate)) 
          ? format(parseISO(task.endDate), 'dd-MM-yyyy')
          : task.endDate
      ) : 'No due date',
      status: task.statusName || 'Pending',
      priority: task.priorityName,
      assignedToUserName: task.assignedToUserName,
      projectId: task.projectId,
      taskListId: task.taskListId,
      startDate: task.startDate,
      endDate: task.endDate,
      description: task.description,
      progression: task.progression || 0
    }));
  };

  // Transform project data for the component
  const transformProjectsForDisplay = (projects) => {
    if (!projects || !Array.isArray(projects)) return [];
    
    return projects.map((project) => ({
      projectId: project.projectId,
      name: project.name,
      status: project.status || 'Active',
      progression: project.progression || 0,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description
    }));
  };

  if (isLoading && !dashboardData) {
    return <Typography>Loading dashboard...</Typography>;
  }

  if (!dashboardData) {
    return <Typography>Error: Dashboard data is not available.</Typography>;
  }

  // Transform real data
  const realTasks = transformTasksForDisplay(taskItems.items);
  const realProjects = transformProjectsForDisplay(projectItems.items);
  const isTasksLoading = tasksLoading || !hasFetchedTasks;
  const isProjectsLoading = projectsLoading || !hasFetchedProjects;

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: gridSpacing/2, mt:gridSpacing/2, fontWeight: 600, color: 'text.primary' }}>
        Dashboard
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: gridSpacing }}>

        {/* Mission Vision Goals - Full Width */}
        <Box sx={{ flex: '1 1 100%' }}>
          <MissionVisionGoalsCard company={company} isLoading={!company && isLoading} />
        </Box>

        <Can perform="project:read">
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <MyProjectCard 
            projects={realProjects} 
            isLoading={isProjectsLoading}
            error={projectError}
          />
        </Box>
        </Can>

        <Can perform="task:read">
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <MyTasksCard 
            tasks={realTasks} 
            isLoading={isTasksLoading}
            error={taskError}
          />
        </Box>
        </Can>
      </Box>
    </>
  );
}
