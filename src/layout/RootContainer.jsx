import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { fetchRootDataStart } from '../redux/rootData/rootDataSlice';
import MainLayout from './MainLayout';
import { selectRootLoading, selectRootError } from '../redux/rootData/rootDataSlice';
import { getAllUsersRequest, getUserProfileRequest } from '../redux/features/profile/profileSlice';
import { fetchStatusesRequest, fetchProjectsRequest } from '../redux/features/projects/projectSlice';
import { fetchUserTasksRequest } from '../redux/features/tasks/taskSlice';
import { getCompanyByIdRequest, getCompanyRolesRequest, getCompanyDepartmentsRequest } from '../redux/features/company/companySlice';
import { selectUserCompanyId, selectUser } from '../redux/features/auth/authSlice';
import { useCan } from '../hooks/useCan';

const RootContainer = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectRootLoading) || [];
  const error = useSelector(selectRootError) || [];
  const userCompanyId = useSelector(selectUserCompanyId);
  const loggedInUser = useSelector(selectUser);
  const { can } = useCan();

  useEffect(() => {
    if (loading === 'idle') {
      dispatch(fetchRootDataStart());
    }
    if (can('employee:read:all')) {
      dispatch(getAllUsersRequest());
    }
    if (can('companyrole:read')) {
      dispatch(getCompanyRolesRequest());
    }
    if (can('department:read')) {
      dispatch(getCompanyDepartmentsRequest());
    }

    dispatch(fetchStatusesRequest());
    dispatch(fetchUserTasksRequest());
    dispatch(getCompanyByIdRequest(userCompanyId));
    dispatch(fetchProjectsRequest());
    if (loggedInUser?.id) {
      dispatch(getUserProfileRequest({ userId: loggedInUser.id }));
    }
  }, []);

  if (loading === 'pending' || loading === 'idle') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (loading === 'failed') {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 2, backgroundColor: 'error.light', color: 'error.main' }}>
        <Typography variant="h6">error</Typography>
        <Typography>{error}</Typography>
        <Button onClick={() => dispatch(fetchRootDataStart())}>Retry</Button>
      </Paper>
    );
  }
  if (loading === 'succeeded') {
    return <MainLayout />;
  }

  return null;
};

export default RootContainer;
