import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Card, CardContent, Box, Button, CircularProgress, Alert } from '@mui/material';
import { IconUsers, IconBuilding, IconDatabase, IconChartBar, IconPlus, IconListDetails, IconSettings } from '@tabler/icons-react';
import { gridSpacing } from 'store/constant';

// Import the updated components
import TopActiveCompanies from './TopActiveCompanies';
import UpcomingRenewals from './UpcomingRenewals';

// Import Redux actions and selectors
import {
  getCompanyStatsRequest,
  fetchCompaniesRequest,
  selectDashboardStats,
  selectDashboardStatsLoading,
  selectDashboardStatsError,
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
  clearStatsError,
  clearCompaniesError
} from '../../redux/features/company/companySlice';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();

  // Redux selectors for dashboard stats
  const dashboardStats = useSelector(selectDashboardStats);
  const statsLoading = useSelector(selectDashboardStatsLoading);
  const statsError = useSelector(selectDashboardStatsError);

  // Redux selectors for companies data
  const companiesData = useSelector(selectAllCompanies);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const companiesError = useSelector(selectCompaniesError);

  // Local state
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (!hasFetchedData) {
      // Fetch dashboard stats
      dispatch(getCompanyStatsRequest());
      
      // Fetch top 5 companies (sorted by creation date or activity)
      dispatch(fetchCompaniesRequest({
        page: 1,
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }));
      
      setHasFetchedData(true);
    }
  }, [dispatch, hasFetchedData]);

  // Transform companies data for TopActiveCompanies component
  const topActiveCompaniesData = React.useMemo(() => {
    if (!companiesData?.items) return [];
    
    return companiesData.items.slice(0, 5).map((company, index) => ({
      id: company.companyId || company.id,
      serialNumber: index + 1,
      name: company.companyName,
      industry: company.industry || 'Not specified',
      lastLogin: company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Never',
      plan: company.packageName || 'Basic', // Assuming package info is available
      isActive: company.isActive,
      createdAt: company.createdAt
    }));
  }, [companiesData]);

  // Mock upcoming renewals data (since we don't have this API yet)
  const mockUpcomingRenewalsData = React.useMemo(() => {
    if (!companiesData?.items) return [];
    
    // Create mock renewal data based on companies
    return companiesData.items.slice(0, 5).map((company, index) => {
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + (index * 15) + 30); // Stagger renewal dates
      return {
        id: `renewal_${company.companyId || company.id}`,
        serialNumber: index + 1,
        companyName: company.companyName,
        renewalDate: renewalDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        status: company.isActive,
        companyId: company.companyId || company.id
      };
    });
  }, [companiesData]);

  // Handle retry functionality
  const handleRetry = () => {
    dispatch(clearStatsError());
    dispatch(clearCompaniesError());
    setHasFetchedData(false);
  };

  // Loading state
  const isLoading = statsLoading || companiesLoading || !hasFetchedData;

  // Error state
  const hasError = statsError || companiesError;

  if (isLoading) {
    return (
      <Box sx={{ p: gridSpacing, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Loading Super Admin Dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box sx={{ p: gridSpacing }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          Error loading dashboard data: {statsError || companiesError}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: gridSpacing / 2, mt: gridSpacing / 2, fontWeight: 600, color: 'text.primary' }}>
        Super Admin Dashboard
      </Typography>

      {/* <Card sx={{ mb: gridSpacing, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Admin Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<IconPlus size="1.2rem" />}
              sx={{
                bgcolor: '#673ab7',
                '&:hover': { bgcolor: '#5e35b1' },
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1.2
              }}
            >
              Add Company
            </Button>
            <Button
              variant="contained"
              startIcon={<IconListDetails size="1.2rem" />}
              sx={{
                bgcolor: '#2196f3',
                '&:hover': { bgcolor: '#1976d2' },
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1.2
              }}
            >
              View Activity Logs
            </Button>
            <Button
              variant="contained"
              startIcon={<IconSettings size="1.2rem" />}
              sx={{
                bgcolor: '#e0e0e0',
                color: '#424242',
                '&:hover': { bgcolor: '#bdbdbd' },
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1.2
              }}
            >
              Global Settings
            </Button>
          </Box>
        </CardContent>
      </Card> */}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: gridSpacing }}>
        {/* Stats Cards */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <IconUsers size="2rem" style={{ marginRight: '1rem', color: '#3f51b5' }} />
              <div>
                <Typography variant="h4">{dashboardStats.totalActiveUsers}</Typography>
                <Typography color="textSecondary">Total Active Users</Typography>
              </div>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <IconBuilding size="2rem" style={{ marginRight: '1rem', color: '#9c27b0' }} />
              <div>
                <Typography variant="h4">{dashboardStats.totalCompanies}</Typography>
                <Typography color="textSecondary">Total Companies</Typography>
              </div>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <IconDatabase size="2rem" style={{ marginRight: '1rem', color: '#00bcd4' }} />
              <div>
                <Typography variant="h4">{dashboardStats.activeCompanies}</Typography>
                <Typography color="textSecondary">Active Companies</Typography>
              </div>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <IconChartBar size="2rem" style={{ marginRight: '1rem', color: '#f44366' }} />
              <div>
                <Typography variant="h4">{dashboardStats.approvedCompanies}</Typography>
                <Typography color="textSecondary">Approved Companies</Typography>
              </div>
            </CardContent>
          </Card>
        </Box>

        {/* Top Active Companies */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <TopActiveCompanies
            data={topActiveCompaniesData}
            isLoading={companiesLoading}
            error={companiesError}
            onRefresh={() => dispatch(fetchCompaniesRequest({
              page: 1,
              pageSize: 5,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }))}
          />
        </Box>

        {/* Upcoming Renewals */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <UpcomingRenewals
            data={mockUpcomingRenewalsData}
            isLoading={companiesLoading}
            error={companiesError}
            onRefresh={() => dispatch(fetchCompaniesRequest({
              page: 1,
              pageSize: 5,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            }))}
          />
        </Box>
      </Box>
    </>
  );
};

export default SuperAdminDashboard;
