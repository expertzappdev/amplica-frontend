import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Box, Typography, TablePagination, Paper,
  IconButton, Tooltip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Can from '../../uiComponent/Can';
import ConfirmationModal from '../../uiComponent/confirmationmodal';

const headCells = [
  { id: 'processId', numeric: false, label: 'ID', sortable: false, minWidth: 70 },
  { id: 'name', numeric: false, label: 'Process Name', sortable: true, minWidth: 230 },
  { id: 'category', numeric: false, label: 'Category', sortable: true, minWidth: 150 },
  { id: 'status', numeric: false, label: 'Status', sortable: true, minWidth: 120 },
  { id: 'startDate', numeric: false, label: 'Start Date', sortable: true, minWidth: 150 },
  { id: 'endDate', numeric: false, label: 'End Date', sortable: true, minWidth: 180 },
  { id: 'actions', numeric: false, label: 'Actions', sortable: false, minWidth: 120, align: 'center' },
];

const tableCellStyle = {
  borderRight: '1px solid',
  borderColor: 'divider',
  '&:last-of-type': {
    borderRight: 0,
  },
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

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...tableHeaderCellStyle, minWidth: headCell.minWidth }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                sx={{ '& .MuiTableSortLabel-icon': { opacity: 0.7 } }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function ProcessTable({
  processes = [],
  pagination,
  sorting,
  onEditProcess,
  onDeleteProcess,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState(null);

  const getEndDateDisplay = (endDateStr) => {
    try {
      const end = parseISO(endDateStr);
      if (!isValid(end)) return endDateStr;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const endDateNormalized = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const daysDiff = differenceInDays(endDateNormalized, now);

      let relativeText = '';
      if (daysDiff < 0) relativeText = `(${Math.abs(daysDiff)} days ago)`;
      else if (daysDiff === 0) relativeText = `(Today)`;
      else relativeText = `(${daysDiff} days remaining)`;

      return (
        <Box component="span">
          {format(end, 'MM-dd-yyyy')}
          <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
            {relativeText}
          </Typography>
        </Box>
      );
    } catch {
      return endDateStr;
    }
  };

  const handleDeleteClick = (process) => {
    setProcessToDelete(process);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (processToDelete && onDeleteProcess) {
      onDeleteProcess(processToDelete.processId);
    }
    setIsDeleteModalOpen(false);
    setProcessToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProcessToDelete(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="processes table" sx={{ minWidth: 900 }}>
          <EnhancedTableHead
            order={sorting.sortOrder}
            orderBy={sorting.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No processes found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              processes.map((row) => (
                <TableRow hover key={row.processId} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                  <TableCell sx={tableCellStyle}>{row.processId}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: 'text.primary',
                        whiteSpace: 'normal',
                      }}
                    >
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{row.category || 'N/A'}</TableCell>
                  <TableCell sx={tableCellStyle}>{row.status || 'N/A'}</TableCell>
                  <TableCell sx={tableCellStyle}>{row.startDate ? format(parseISO(row.startDate), 'MM-dd-yyyy') : 'N/A'}</TableCell>
                  <TableCell sx={{ ...tableCellStyle, color: row.endDate && differenceInDays(parseISO(row.endDate), new Date()) < 0 ? 'error.main' : 'inherit' }}>
                    {row.endDate ? getEndDateDisplay(row.endDate) : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    {/* <Can perform="process:update"> */}
                      <Tooltip title="Edit Process">
                        <IconButton size="small" onClick={() => onEditProcess(row.processId)} sx={{ mr: 0.5 }}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    {/* </Can>
                    <Can perform="process:delete"> */}
                      <Tooltip title="Delete Process">
                        <IconButton size="small" onClick={() => handleDeleteClick(row)}>
                          <DeleteOutlineIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    {/* </Can> */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 25]}
        component="div"
        count={pagination.totalCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageNumber - 1}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete Process: ${processToDelete?.name}?`}
        message={`Are you sure you want to delete this process? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </Paper>
  );
}
