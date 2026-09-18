import React from 'react';
import { 
  Card, CardContent, Typography, Box, Table, TableBody, TableCell, 
  TableHead, TableRow, Select, MenuItem, FormControl, Chip, IconButton,
  Tooltip, CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { gridSpacing } from 'store/constant';

const getStatusChipStyle = (isActive) => ({
  backgroundColor: isActive ? 'success.lighter' : 'error.lighter',
  color: isActive ? 'success.dark' : 'error.dark',
  border: '1px solid',
  borderColor: isActive ? 'success.main' : 'error.main',
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
});

const TopActiveCompanies = ({ data, isLoading, error, onRefresh }) => {
  const [timeframe, setTimeframe] = React.useState('last30days');

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
    // You can add logic here to filter data based on timeframe
    // For now, we'll keep the same data but you can extend this
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Top 5 Companies</Typography>
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
            <Typography variant="h5">Top 5 Companies</Typography>
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
          <Typography variant="h5">Top 5 Companies</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl variant="outlined" size="small">
              <Select
                value={timeframe}
                onChange={handleTimeframeChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Timeframe select' }}
              >
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="last60days">Last 60 Days</MenuItem>
                <MenuItem value="last90days">Last 90 Days</MenuItem>
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
              <TableCell sx={{ fontWeight: 'bold' }}>INDUSTRY</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CREATED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {company.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {company.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.industry}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={getStatusChipStyle(company.isActive)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {company.lastLogin}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No companies found.
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

export default TopActiveCompanies;
