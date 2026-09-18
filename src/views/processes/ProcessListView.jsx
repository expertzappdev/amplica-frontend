import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Paper, CircularProgress } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ProcessTable from './ProcessTable';
import ProcessFormDrawer from './ProcessFormDrawer'
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from '../../store/constant';
import Can from '../../uiComponent/Can';

const dummyProcesses = Array.from({ length: 25 }, (_, i) => ({
  processId: `P${i + 1}`,
  name: `Process ${i + 1}`,
  category: ['HR', 'Operations', 'Finance'][i % 3],
  status: ['Active', 'Inactive'][i % 2],
  startDate: new Date(2025, i % 12, 1).toISOString(),
  endDate: new Date(2025, (i % 12) + 1, 15).toISOString(),
}));

export default function ProcessListView() {
  const [isProcessFormDrawerOpen, setIsProcessFormDrawerOpen] = useState(false);
  const [isAdvancedSortDrawerOpen, setAdvancedSortDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [processes, setProcesses] = useState(dummyProcesses);

  // Sorting handler
  const handleSortRequest = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort helper
  const sortedProcesses = useMemo(() => {
    return [...processes].sort((a, b) => {
      if (orderBy === 'startDate' || orderBy === 'endDate') {
        return (new Date(a[orderBy]) - new Date(b[orderBy])) * (order === 'asc' ? 1 : -1);
      }
      return a[orderBy].localeCompare(b[orderBy]) * (order === 'asc' ? 1 : -1);
    });
  }, [processes, order, orderBy]);

  // Paginated data
  const paginatedProcesses = useMemo(() => {
    return sortedProcesses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedProcesses, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: gridSpacing / 2
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Processes
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* <Can perform="process:create"> */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsProcessFormDrawerOpen(true)}
              sx={{ borderRadius: '8px', px: { xs: 1.5, sm: 2 }, whiteSpace: 'nowrap' }}
            >
              New Process
            </Button>
          {/* </Can> */}
          <IconButton onClick={() => setAdvancedSortDrawerOpen(true)} sx={{ backgroundColor: 'background.default', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
            <FilterListIcon color="primary" />
          </IconButton>
        </Box>
      </Box>

      <ProcessTable
        processes={paginatedProcesses}
        pagination={{ pageNumber: page + 1, pageSize: rowsPerPage, totalCount: processes.length }}
        sorting={{ sortField: orderBy, sortOrder: order }}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSortRequest={handleSortRequest}
        onEditProcess={(id) => alert(`Edit ${id} clicked`)}
        onDeleteProcess={(id) => alert(`Delete ${id} clicked`)}
      />

      <ProcessFormDrawer
        open={isProcessFormDrawerOpen}
        onClose={() => setIsProcessFormDrawerOpen(false)}
        onSubmitCreate={(data) => {
          alert('Create process: ' + JSON.stringify(data));
          setIsProcessFormDrawerOpen(false);
        }}
      />

      <AdvancedSortDrawer
        open={isAdvancedSortDrawerOpen}
        onClose={() => setAdvancedSortDrawerOpen(false)}
        onConfirm={(filters) => {
          alert('Apply filters: ' + JSON.stringify(filters));
          setAdvancedSortDrawerOpen(false);
        }}
        sections={[]}
      />
    </Box>
  );
}
