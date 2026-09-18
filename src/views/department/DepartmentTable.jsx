import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Box, Typography, IconButton, 
  Tooltip, Paper, Avatar, CircularProgress
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { format, parseISO, isValid } from 'date-fns';
import { useCan } from '../../hooks/useCan';

const departmentHeadCells = [
  { id: 'serialNumber', label: 'S.No', minWidth: 60, align: 'center', sortable: false },
  { id: 'departmentName', label: 'Department Name', minWidth: 250, sortable: true },
  // { id: 'description', label: 'Description', minWidth: 300, sortable: false },
  { id: 'departmentHeadUserId', label: 'Department Head', minWidth: 150, sortable: false },
  { id: 'createdAt', label: 'Created Date', minWidth: 170, sortable: true },
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

function EnhancedDepartmentTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    if (onRequestSort) {
      onRequestSort(property);
    }
  };

  return (
    <TableHead>
      <TableRow>
        {departmentHeadCells.map((headCell) => (
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

export default function DepartmentTable({
  departments = [],
  isLoading,
  pagination,
  sorting,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  onUpdateDepartment,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
}) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const { can } = useCan();
  const canUpdateDepartment = can('department:update');
  const canDeleteDepartment = can('department:delete');

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete && onDeleteDepartment) {
      onDeleteDepartment(departmentToDelete.deptId);
    }
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  const handleViewDetails = (department, event) => {
    if (event && event.target.closest('button')) {
      return;
    }
    
    if (onDepartmentClick) {
      onDepartmentClick(department);
    } else {
      navigate(`/app/departments/${department.deptId}`);
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="departments table" sx={{ minWidth: 1000 }}>
          <EnhancedDepartmentTableHead
            order={sorting.sortOrder}
            orderBy={sorting.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {isLoading && departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={departmentHeadCells.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 2 }}>Loading departments...</Typography>
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={departmentHeadCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No departments found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => {
                return (
                  <TableRow
                    hover
                    key={department.deptId}
                    sx={{ 
                      '&:last-child td, &:last-child th': { borderBottom: 0 },
                      cursor: 'pointer'
                    }}
                    onClick={(event) => handleViewDetails(department, event)}
                  >
                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {department.serialNumber}
                      </Typography>
                    </TableCell>
                    
                    <TableCell sx={tableCellStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            '&:hover': {
                              color: 'primary.main',
                              textDecoration: 'underline' 
                            },
                          }}
                        >
                          {department.departmentName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* <TableCell sx={tableCellStyle}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 300
                        }}
                        title={department.description}
                      >
                        {department.description || 'No description provided'}
                      </Typography>
                    </TableCell> */}

                    <TableCell sx={tableCellStyle}>
                      {department.departmentHeadName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={department.departmentHeadName}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.200',
                              }}
                            >
                              {getAvatarLetters(department.departmentHeadName)}
                            </Avatar>
                          </Tooltip>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {department.departmentHeadName}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Not assigned
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(department.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      {department.createdByName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={department.createdByName}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.200',
                              }}
                            >
                              {getAvatarLetters(department.createdByName)}
                            </Avatar>
                          </Tooltip>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {department.createdByName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          System
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                      {canUpdateDepartment || canDeleteDepartment ? (
                        <>
                          {canUpdateDepartment && (
                            <Tooltip title="Edit Department">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onEditDepartment && onEditDepartment(department);
                                }}
                                sx={{ mr: 0.5 }}
                              >
                                <EditIcon fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDeleteDepartment && (
                            <Tooltip title="Delete Department">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteClick(department);
                                }}
                              >
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
        title={`Delete Department: ${departmentToDelete?.departmentName}?`}
        message={`Are you sure you want to delete this department? This action cannot be undone and may affect employees assigned to this department.`}
        confirmButtonText="Delete Department"
        confirmButtonColor="error"
      />
    </Paper>
  );
}
