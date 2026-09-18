import { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Box, Typography, TablePagination, Paper,
  IconButton, Tooltip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { visuallyHidden } from '@mui/utils';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StatusDropdown from '../../uiComponent/statusdropdown/StatusDropdown';
import ProgressDisplay from '../../uiComponent/progressbar/ProgressDisplay';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import Can from '../../uiComponent/Can';
import { useCan } from '../../hooks/useCan';

const headCells = [
  { id: 'serialNumber', numeric: false, label: 'S.No', sortable: false, minWidth: 70 },
  { id: 'name', numeric: false, label: 'Project Name', sortable: true, minWidth: 230 },
  { id: 'progress', numeric: false, label: '%', sortable: false, minWidth: 120 },
  { id: 'statusName', numeric: false, label: 'Status', sortable: true, minWidth: 120 },
  { id: 'tasks', numeric: false, label: 'Tasks', sortable: false, minWidth: 110 },
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
        {headCells.map((headCell) => {
          // Special handling for statusName column
          if (headCell.id === 'statusName') {
            return (
              <Can key={headCell.id} perform="project:update">
                <TableCell
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
              </Can>
            );
          }

          // Regular rendering for all other columns
          return (
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
          );
        })}
      </TableRow>
    </TableHead>
  );
}

export default function ProjectsTable({
  projects = [],
  pagination,
  sorting,
  onProjectStatusChange,
  onEditProject,
  onDeleteProject,
  onPageChange,
  onRowsPerPageChange,
  onSortRequest,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { can } = useCan();
  const canUpdateProject = can('project:update');
  const canDeleteProject = can('project:delete');

  // Calculate serial numbers based on pagination
  const projectsWithSerialNumbers = useMemo(() => {
    return projects.map((project, index) => ({
      ...project,
      serialNumber: (pagination.pageNumber - 1) * pagination.pageSize + index + 1
    }));
  }, [projects, pagination.pageNumber, pagination.pageSize]);

  const getStartDateDisplay = (startDateStr) => {
    try {
      const start = parseISO(startDateStr);
      if (!isValid(start)) return startDateStr;
      return format(start, 'dd/MM/yyyy');
    } catch {
      return startDateStr;
    }
  };

  const getEndDateDisplay = (endDateStr) => {
    try {
      const end = parseISO(endDateStr);
      if (!isValid(end)) return endDateStr;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const endDateNormalized = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      const daysDiff = differenceInDays(endDateNormalized, now);
      let relativeText = '';
      let textColor = 'text.secondary';

      if (daysDiff < 0) {
        relativeText = `(${Math.abs(daysDiff)} days ago)`;
        textColor = 'error.main';
      } else if (daysDiff === 0) {
        relativeText = `(Today)`;
        textColor = 'warning.main';
      } else if (daysDiff <= 10) {
        relativeText = `(${daysDiff} days remaining)`;
        textColor = 'warning.main';
      } else {
        relativeText = `(${daysDiff} days remaining)`;
        textColor = 'success.main';
      }

      return (
        <Box component="span">
          {format(end, 'dd/MM/yyyy')}
          <Typography variant="caption" sx={{ ml: 0.5, color: textColor }}>
            {relativeText}
          </Typography>
        </Box>
      );
    } catch {
      return endDateStr;
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete && onDeleteProject) {
      onDeleteProject(projectToDelete.projectId);
    }
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="projects table" sx={{ minWidth: 900 }}>
          <EnhancedTableHead
            order={sorting.sortOrder}
            orderBy={sorting.sortField}
            onRequestSort={onSortRequest}
          />
          <TableBody>
            {projectsWithSerialNumbers.map((row) => {
              return (
                <TableRow hover key={row.projectId} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                  <TableCell sx={tableCellStyle}>{row.serialNumber}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        component={RouterLink}
                        to={`/app/project-detail/${row.projectId}`}
                        sx={{
                          fontWeight: 500,
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="left" sx={tableCellStyle}>
                    <ProgressDisplay value={row.progression || 0} />
                  </TableCell>

                  {/* Conditionally render Status cell */}
                  <Can perform="project:update">
                    <TableCell
                      sx={{
                        ...tableCellStyle,
                        p: 0,
                        height: '40px',
                      }}
                    >
                      <StatusDropdown
                        currentStatus={row.status}
                        projectId={row.projectId}
                        onStatusChange={onProjectStatusChange}
                      />
                    </TableCell>
                  </Can>

                  <TableCell sx={tableCellStyle}>
                    {`${row.progression || 0}%`}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    {row.startDate ? getStartDateDisplay(row.startDate) : '-'}
                  </TableCell>
                  <TableCell sx={{
                    ...tableCellStyle,
                    color: row.endDate && differenceInDays(parseISO(row.endDate), new Date()) < 0
                      ? 'error.main'
                      : 'inherit'
                  }}>
                    {row.endDate ? getEndDateDisplay(row.endDate) : '-'}
                  </TableCell>
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    {canUpdateProject || canDeleteProject ? (
                      <>
                        {canUpdateProject && (
                          <Tooltip title="Edit Project">
                            <IconButton size="small" onClick={() => onEditProject(row.projectId)} sx={{ mr: 0.5 }}>
                              <EditIcon fontSize="small" color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDeleteProject && (
                          <Tooltip title="Delete Project">
                            <IconButton size="small" onClick={() => handleDeleteClick(row)}>
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
            })}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No projects found.</Typography>
                </TableCell>
              </TableRow>
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
        title={`Delete Project: ${projectToDelete?.name}?`}
        message={`Are you sure you want to delete this project? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
      />
    </Paper>
  );
}
