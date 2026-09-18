import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Box, Typography, Paper, IconButton, Tooltip,
  Avatar, TablePagination,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { format, parseISO } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { useCan } from '../../hooks/useCan';

const headCells = [
    { id: 'projectname', label: 'Project Name', sortable: true, minWidth: 200 },
    { id: 'tasktitle', label: 'Task Name', sortable: true, minWidth: 200 },
    { id: 'assignedTo', label: 'Assigned To', sortable: true, minWidth: 180 },
    { id: 'loggedat', label: 'Logged At', sortable: true, minWidth: 120 },
    { id: 'duration', label: 'Duration', sortable: true, minWidth: 130 },
    { id: 'statusname', label: 'Status', sortable: true, minWidth: 130 },
    { id: 'actions', label: 'Actions', sortable: false, minWidth: 100, align: 'center' },
];

const tableCellStyle = {
  py: 1,
  px: 2,
  borderRight: '1px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
  '&:last-of-type': {
    borderRight: 0,
  },
};

const tableHeaderCellStyle = {
  ...tableCellStyle,
  py: 1,
  fontWeight: 'bold',
  color: 'text.primary',
  backgroundColor: 'grey.100',
};

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
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
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...tableHeaderCellStyle, minWidth: headCell.minWidth }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
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

export default function UserTimesheetView({
  timelogs = [], 
  pagination,
  sorting,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
  onEditLog,
  onDeleteLog,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const { can } = useCan();
  const canUpdateTimelog = can('timelog:update');
  const canDeleteTimelog = can('timelog:delete');

  const formatTime = (dateString) => {
    try {
        if (!dateString) return 'N/A';
      return format(parseISO(dateString), 'hh:mm a, dd-MM-yyyy');
    } catch (e) {
      return 'N/A';
    }
  };
  
  const getAvatarLetters = (name = '') => {
      const initials = name.match(/\b\w/g) || [];
      return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  }

  const handleDeleteClick = (log) => {
    setLogToDelete(log);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (logToDelete && onDeleteLog) {
      onDeleteLog(logToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer>
        <Table stickyHeader aria-label="timesheet table">
          <EnhancedTableHead
            order={sorting?.sortOrder}
            orderBy={sorting?.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {timelogs.map((log) => (
              <TableRow hover key={log.id}>
                <TableCell sx={tableCellStyle}>
                    <Typography variant="body2" fontWeight={500}>{log.project?.name || 'N/A'}</Typography>
                </TableCell>
                <TableCell sx={tableCellStyle}>{log.task?.name || 'N/A'}</TableCell>
                <TableCell sx={tableCellStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.75rem' }} src={log.user?.avatarUrl}>
                        {getAvatarLetters(log.user?.name)}
                    </Avatar>
                    <Typography variant="body2">{log.user?.name || 'N/A'}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={tableCellStyle}>{formatTime(log.createdAt)}</TableCell>
                <TableCell sx={tableCellStyle}>{log.duration || 'N/A'}</TableCell>
                <TableCell sx={tableCellStyle}>{log.statusName || 'N/A'}</TableCell>
                <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                  {canUpdateTimelog || canDeleteTimelog ? (
                    <>
                      {canUpdateTimelog && (
                        <Tooltip title="Edit Log">
                          <IconButton size="small" onClick={() => onEditLog(log)} sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteTimelog && (
                        <Tooltip title="Delete Log">
                          <IconButton size="small" onClick={() => handleDeleteClick(log)}>
                            <DeleteOutlineIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {timelogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    No timesheet entries found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={pagination?.totalCount || 0}
        rowsPerPage={pagination?.pageSize || 10}
        page={(pagination?.pageNumber || 1) - 1}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete Timesheet Entry?`}
        message={`Are you sure you want to delete the time log for task "${logToDelete?.task?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </Paper>
  );
}