import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, IconButton, Tooltip, Paper, Chip, Avatar, Switch, 
  Badge, LinearProgress, CircularProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PackageIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { selectUser } from '../../redux/features/auth/authSlice';
import ConfirmationModal from '../../uiComponent/confirmationmodal';
import { format, parseISO, isValid } from 'date-fns';
import Can from '../../uiComponent/Can';

// Updated head cells with S.No
const packageHeadCells = [
  { id: 'serialNumber', label: 'S.No', minWidth: 60, align: 'center' },
  { id: 'packageName', label: 'Package Name', minWidth: 250 },
  { id: 'price', label: 'Price', minWidth: 100, align: 'center' },
  { id: 'isActive', label: 'Status', minWidth: 100 },
  { id: 'createdAt', label: 'Created Date', minWidth: 120 },
  { id: 'createdByName', label: 'Created By', minWidth: 120 },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'center' },
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

const getPriceChipStyle = (price) => {
  if (price === 0) {
    return {
      backgroundColor: 'success.lighter',
      color: 'success.dark',
      border: '1px solid',
      borderColor: 'success.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  } else if (price <= 50) {
    return {
      backgroundColor: 'info.lighter',
      color: 'info.dark',
      border: '1px solid',
      borderColor: 'info.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  } else if (price <= 100) {
    return {
      backgroundColor: 'warning.lighter',
      color: 'warning.dark',
      border: '1px solid',
      borderColor: 'warning.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  } else {
    return {
      backgroundColor: 'error.lighter',
      color: 'error.dark',
      border: '1px solid',
      borderColor: 'error.main',
      height: 24,
      fontSize: '0.75rem',
      fontWeight: 500,
    };
  }
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

// Updated date format function for DD/MM/YYYY
const formatDate = (dateStr) => {
  try {
    if (!dateStr) return 'N/A';
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'N/A';
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return 'N/A';
  }
};

const formatPrice = (price) => {
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
};

const getAvatarLetters = (name) => {
  if (!name) return '';
  const initials = name.match(/\b\w/g) || [];
  return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
};

function EnhancedPackageTableHead() {
  return (
    <TableHead>
      <TableRow>
        {packageHeadCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            padding={'normal'}
            sx={{ ...tableHeaderCellStyle, minWidth: headCell.minWidth }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function PackageTable({
  packages = [],
  isLoading,
  isDeletingPackage,
  onPackageClick,
  onEditPackage,
  onDeletePackage,
  onUpdatePackage,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const currentUser = useSelector(selectUser);

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (packageToDelete && onDeletePackage) {
      onDeletePackage(packageToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setPackageToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPackageToDelete(null);
  };

  const handleStatusToggle = (pkg) => {
    const updatedPackage = {
      packageId: pkg.packageId,
      packageName: pkg.packageName,
      price: pkg.price,
      isActive: !pkg.isActive,
      description: pkg.description,
      trialDays: 7, // Default value
      updatedBy: currentUser.id,
      moduleIds: pkg.modules ? pkg.modules.filter(m => m.isIncluded).map(m => m.moduleId) : []
    };
    
    if (onUpdatePackage) {
      onUpdatePackage({
        packageId: pkg.packageId,
        packageData: updatedPackage
      });
    }
  };

  // Show loading overlay when deleting
  const showLoadingOverlay = isLoading || isDeletingPackage;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
      {showLoadingOverlay && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: 2
        }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer sx={{ borderRadius: '7px 7px 0 0', overflowX: 'auto' }}>
        <Table stickyHeader aria-label="packages table" sx={{ minWidth: 1200 }}>
          <EnhancedPackageTableHead />
          <TableBody>
            {(packages || []).map((pkg) => {
              return (
                <TableRow
                  hover
                  key={pkg.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { borderBottom: 0 },
                    opacity: showLoadingOverlay ? 0.5 : 1
                  }}
                >
                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {pkg.serialNumber}
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PackageIcon 
                        sx={{ 
                          fontSize: 20, 
                          color: 'primary.main' 
                        }} 
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          onClick={() => onPackageClick && onPackageClick(pkg)}
                          sx={{
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'text.primary',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          {pkg.packageName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pkg.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    <Chip
                      label={formatPrice(pkg.price)}
                      size="small"
                      sx={getPriceChipStyle(pkg.price)}
                    />
                  </TableCell>

                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={pkg.isActive}
                        onChange={() => handleStatusToggle(pkg)}
                        size="small"
                        color="success"
                        disabled={showLoadingOverlay}
                      />
                      <Chip
                        label={pkg.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={getStatusChipStyle(pkg.isActive)}
                      />
                    </Box>
                  </TableCell>

                  <TableCell sx={tableCellStyle}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(pkg.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tableCellStyle}>
                    {pkg.createdByName ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {pkg.createdByName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        System
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                    {/* <Can perform="package:update"> */}
                    <Tooltip title="Edit Package">
                      <IconButton
                        size="small"
                        onClick={() => onEditPackage && onEditPackage(pkg)}
                        sx={{ mr: 0.5 }}
                        disabled={showLoadingOverlay}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    {/* </Can> */}
                     {/* <Can perform="package:delete"> */}
                    <Tooltip title="Delete Package">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(pkg)}
                        disabled={showLoadingOverlay}
                      >
                        <DeleteOutlineIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                    {/* </Can> */}
                  </TableCell>
                </TableRow>
              );
            })}
            {packages.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={packageHeadCells.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No packages found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete Package: ${packageToDelete?.packageName}?`}
        message={`Are you sure you want to delete this package? This action cannot be undone and may affect companies using this package.`}
        confirmButtonText="Delete"
        confirmButtonColor="error"
        isLoading={isDeletingPackage}
      />
    </Paper>
  );
}
