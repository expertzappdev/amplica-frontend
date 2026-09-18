import React from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, FormControl, Chip, IconButton,
  Tooltip, CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { gridSpacing } from 'store/constant';

const getStatusChipStyle = (status) => ({
  backgroundColor: status ? 'success.lighter' : 'error.lighter',
  color: status ? 'success.dark' : 'error.dark',
  border: '1px solid',
  borderColor: status ? 'success.main' : 'error.main',
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
});

const UpcomingRenewals = ({ data, isLoading, error, onRefresh }) => {
  const [timeframe, setTimeframe] = React.useState('next30days');

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
    // You can add logic here to filter data based on timeframe
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Upcoming Renewals</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Upcoming Renewals</Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Upcoming Renewals</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl variant="outlined" size="small">
              <Select
                value={timeframe}
                onChange={handleTimeframeChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Timeframe select' }}
              >
                <MenuItem value="next30days">Next 30 Days</MenuItem>
                <MenuItem value="next60days">Next 60 Days</MenuItem>
                <MenuItem value="next90days">Next 90 Days</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>COMPANY NAME</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>RENEWAL DATE</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((renewal) => (
                <TableRow key={renewal.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {renewal.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {renewal.companyName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {renewal.renewalDate}
                    </Typography>
                  </TableCell>
                  {/* <TableCell>
                    <Chip
                      label={renewal.status}
                      color={getStatusChipColor(renewal.status)}
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell> */}
                  <TableCell>
                    <Chip
                      label={renewal.status ? 'Active' : 'Inactive'}
                      size="small"
                      sx={getStatusChipStyle(renewal.status)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No upcoming renewals found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UpcomingRenewals;
