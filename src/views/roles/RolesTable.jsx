import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Box, Typography, IconButton, 
  Tooltip, Paper, Chip, Avatar, Switch, CircularProgress
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SecurityIcon from '@mui/icons-material/Security';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { format, parseISO, isValid } from 'date-fns';
import { useCan } from '../../hooks/useCan';

const roleHeadCells = [
  { id: 'serialNumber', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
  { id: 'roleName', label: 'Role Name', minWidth: 300, sortable: false },
  { id: 'defaultRole', label: 'Type', minWidth: 100, sortable: false },
  { id: 'isActive', label: 'Status', minWidth: 100, sortable: false },
  { id: 'createdAt', label: 'Created Date', minWidth: 170, sortable: false },
  { id: 'createdByName', label: 'Created By', minWidth: 150, sortable: false },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'center', sortable: false },
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

const getRoleTypeChipStyle = (isDefault) => {
  if (isDefault) {
    return {
      backgroundColor: 'primary.lighter',
      color: 'primary.dark',
      border: '1px solid',
      borderColor: 'primary.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  }
  return {
    backgroundColor: 'secondary.lighter',
    color: 'secondary.dark',
    border: '1px solid',
    borderColor: 'secondary.main',
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
  };
};

const getStatusChipStyle = (isActive) => {
  if (isActive) {
    return {
      backgroundColor: 'success.lighter',
      color: 'success.dark',
      border: '1px solid',
      borderColor: 'success.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  }
  return {
    backgroundColor: 'error.lighter',
    color: 'error.dark',
    border: '1px solid',
    borderColor: 'error.main',
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 500,
  };
};

const formatDate = (dateStr) => {
  try {
    if (!dateStr) return 'N/A';
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch {
    return 'N/A';
  }
};

const getAvatarLetters = (name) => {
  if (!name) return '';
  const initials = name.match(/\b\w/g) || [];
  return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

function EnhancedRoleTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {roleHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
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

export default function RolesTable({
  roles = [],
  isLoading,
  pagination,
  sorting,
  onRoleClick,
  onEditRole,
  onDeleteRole,
  onStatusToggle,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const { can } = useCan();
  const canUpdateRole = can('companyrole:update') || can('role:update');
  const canDeleteRole = can('companyrole:delete') || can('role:delete');

  const handleDeleteClick = (role) => {
    if (role.defaultRole) {
      return;
    }
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete && onDeleteRole) {
      onDeleteRole(roleToDelete.companyRoleId);
    }
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="roles table" sx={{ minWidth: 1000 }}>
          <EnhancedRoleTableHead
            order={sorting.sortOrder}
            orderBy={sorting.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {isLoading && roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={roleHeadCells.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 2 }}>Loading roles...</Typography>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={roleHeadCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No roles found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                return (
                  <TableRow
                    hover
                    key={role.companyRoleId}
                    sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                  >
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {role.serialNumber}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={tableCellStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon 
                          sx={{ 
                            fontSize: 20, 
                            color: role.defaultRole ? 'primary.main' : 'secondary.dark' 
                          }} 
                        />
                        <Typography
                          variant="body2"
                          onClick={() => onRoleClick && onRoleClick(role)}
                          sx={{
                            fontWeight: role.defaultRole ? 600 : 500,
                            cursor: 'pointer',
                            color: 'text.primary',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {role.roleName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Chip
                        label={role.defaultRole ? 'Default' : 'Custom'}
                        size="small"
                        sx={getRoleTypeChipStyle(role.defaultRole)}
                      />
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={role.isActive}
                          onChange={() => onStatusToggle && onStatusToggle(role)}
                          disabled={role.defaultRole}
                          size="small"
                          color="success"
                        />
                        <Chip
                          label={role.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={getStatusChipStyle(role.isActive)}
                        />
                      </Box>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(role.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      {role.createdByName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={role.createdByName}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.200',
                              }}
                            >
                              {getAvatarLetters(role.createdByName)}
                            </Avatar>
                          </Tooltip>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {role.createdByName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          System
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      {canUpdateRole || canDeleteRole ? (
                        <>
                          {canUpdateRole && (
                            <Tooltip title={role.defaultRole ? "Cannot edit default role" : "Edit Role"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => onEditRole && onEditRole(role)}
                                  sx={{ mr: 0.5 }}
                                  disabled={role.defaultRole}
                                >
                                  <EditIcon fontSize="small" color={role.defaultRole ? "disabled" : "primary"} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canDeleteRole && (
                            <Tooltip title={role.defaultRole ? "Cannot delete default role" : "Delete Role"}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(role)}
                                  disabled={role.defaultRole}
                                >
                                  <DeleteOutlineIcon
                                    fontSize="small"
                                    color={role.defaultRole ? "disabled" : "error"}
                                  />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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
        title={`Delete Role: ${roleToDelete?.roleName}?`}
        message={`Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to this role.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </Paper>
  );
}
