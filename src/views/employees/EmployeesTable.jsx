import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Box, Typography, Avatar, TablePagination, Paper, Link as MuiLink, Tooltip, IconButton, Skeleton, Switch
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { visuallyHidden } from '@mui/utils';
import { format, parseISO, isValid } from 'date-fns';
import { ASSETS_BASE_URL } from '../../services/apiConstants';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { useCan } from '../../hooks/useCan';
import { useDispatch } from 'react-redux';
import { updateUserRequest } from '../../redux/features/profile/profileSlice';

const sortByApiMapping = {
  serialNumber: 'employeeCode',
  name: 'firstName',
  email: 'userEmail',
  department: 'departmentName',
  joiningDate: 'joiningDate',
};

const headCells = [
  { id: 'serialNumber', label: 'S.No', sortable: false },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: false },
  { id: 'department', label: 'Department', sortable: true },
  { id: 'role', label: 'Role', sortable: false },
  { id: 'joiningDate', label: 'Joining Date', sortable: true },
  { id: 'status', label: 'Status', sortable: false },
  { id: 'actions', label: 'Actions', sortable: false, align: 'center' },
];

const tableCellStyle = {
  borderRight: '1px solid',
  borderColor: 'divider',
  '&:last-of-type': { borderRight: 0 },
  py: 0.5,
  px: 1.5,
  fontSize: '0.875rem',
};

const tableHeaderCellStyle = {
  ...tableCellStyle,
  fontWeight: 600,
  color: 'text.primary',
  backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  py: 1.25,
};

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };


  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
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

const generateInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
};

const generateAvatarColor = (name) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return colors[hash % colors.length];
};

const ProfileAvatar = ({ src, firstName, lastName, size = 36, ...props }) => {
  const initials = generateInitials(firstName, lastName);
  const name = `${firstName || ''} ${lastName || ''}`.trim();
  const backgroundColor = generateAvatarColor(name);
  
  const hasValidImage = src && 
    !src.includes('user-round.svg') && 
    !src.includes('default-avatar') &&
    src.trim() !== '';
  
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${ASSETS_BASE_URL}${imageUrl}`;
    return `${ASSETS_BASE_URL}/${imageUrl}`;
  };
  
  const formattedSrc = hasValidImage ? formatImageUrl(src) : undefined;
  
  return (
    <Avatar
      src={formattedSrc}
      alt={name}
      sx={{ 
        width: size, 
        height: size, 
        fontSize: size / 3,
        fontWeight: 600,
        backgroundColor: formattedSrc ? 'transparent' : backgroundColor,
        color: 'white',
        border: size > 40 ? `2px solid white` : 'none',
        boxShadow: size > 40 ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      {!formattedSrc && initials}
    </Avatar>
  );
};

const getJoiningDateDisplay = (joiningDateStr) => {
  try {
    const date = parseISO(joiningDateStr);
    if (!isValid(date)) return joiningDateStr;
    return format(date, 'dd/MM/yyyy');
  } catch {
    return joiningDateStr;
  }
};

export default function EmployeesTable({
  employees,
  totalCount,
  query,
  onQueryChange,
  onEditEmployee,
  onDeleteEmployee,
  loading,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [localStatuses, setLocalStatuses] = useState({});
  const dispatch = useDispatch();
  const { can } = useCan();
  const canUpdateEmployee = can('employee:update');
  const canDeleteEmployee = can('employee:delete');

  const handleRequestSort = (event, property) => {
    const apiField = sortByApiMapping[property] || property;
    const isAsc = query.sortBy === apiField && query.sortOrder === 'asc';
    onQueryChange({
      sortBy: apiField,
      sortOrder: isAsc ? 'desc' : 'asc',
      page: 1, 
    });
  };

  const handleChangePage = (event, newPage) => {
    onQueryChange({ page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event) => {
    onQueryChange({ pageSize: parseInt(event.target.value, 10), page: 1 });
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      onDeleteEmployee(employeeToDelete.userId);
    }
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const getCurrentOrderBy = () => {
    const foundEntry = Object.entries(sortByApiMapping).find(([key, value]) => value === query.sortBy);
    return foundEntry ? foundEntry[0] : 'serialNumber'; 
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <EnhancedTableHead
            order={query.sortOrder || 'asc'}
            orderBy={getCurrentOrderBy()}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {loading && employees.length === 0 ? (
              Array.from(new Array(query.pageSize)).map((_, index) => (
                <TableRow key={index}>
                  {headCells.map((cell) => (<TableCell key={cell.id}><Skeleton /></TableCell>))}
                </TableRow>
              ))
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow hover key={emp.id} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                  <TableCell sx={tableCellStyle}>
                    <Typography variant="body2" color="text.secondary">
                      {emp.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ProfileAvatar
                        src={emp.avatarUrl || emp.profilePhotoUrl}
                        firstName={emp.firstName}
                        lastName={emp.lastName}
                        size={36}
                      />
                      {emp.isDeleted ? (
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="text.primary"
                          sx={{ ml: 1.5 }}
                        >
                          {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || 'Unknown User'}
                        </Typography>
                      ) : (
                        <MuiLink
                          component={RouterLink}
                          to={`/app/employee-profile/${emp.userId}`}
                          state={{ employeeData: emp }}
                          variant="body2"
                          fontWeight="500"
                          color="text.primary"
                          sx={{ ml: 1.5, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || 'Unknown User'}
                        </MuiLink>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <MuiLink href={`mailto:${emp.email}`} variant="body2" color="primary.main" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {emp.email}
                    </MuiLink>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{emp.department}</TableCell>
                  <TableCell sx={tableCellStyle}>{emp.role}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    {emp.joiningDate ? getJoiningDateDisplay(emp.joiningDate) : 'N/A'}
                  </TableCell>
<TableCell sx={tableCellStyle}>
  {emp.isDeleted ? (
    'Deleted'
  ) : (
    <Switch
    checked={
    emp.userId === updatingUserId
      ? localStatuses[emp.userId]
      : emp.isActive
  }
      color="success"
    onChange={(event) => {
  const newStatus = event.target.checked;

  // Show the toggle change immediately
  setLocalStatuses((prev) => ({
    ...prev,
    [emp.userId]: newStatus,
  }));

  setUpdatingUserId(emp.userId);

  dispatch(
    updateUserRequest({
      userId: emp.userId,
      userData: {
        isActive: newStatus,
      },
    })
  );
}}
    />
  )}
</TableCell>
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    {(canUpdateEmployee || canDeleteEmployee) && !emp.isDeleted ? (
                      <>
                        {canUpdateEmployee && (
                          <Tooltip title="Edit Team Member">
                            <IconButton size="small" onClick={() => onEditEmployee(emp.userId)} sx={{ mr: 0.5 }}>
                              <EditIcon fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDeleteEmployee && (
                          <Tooltip title="Delete Team Member">
                            <IconButton size="small" onClick={() => handleDeleteClick(emp)}>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1" color="text.secondary">No employees found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={query.pageSize}
        page={query.page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {employeeToDelete && (
        <ConfirmationModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Delete Team Member: ${`${employeeToDelete?.firstName || ''} ${employeeToDelete?.lastName || ''}`.trim() || employeeToDelete?.email || 'Unknown User'}?`}
          message={`Are you sure you want to delete this Team Member? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonColor="error"
        />
      )}
    </Paper>
  );
}
