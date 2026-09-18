import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, Box, Typography, TablePagination, Paper, Tooltip, IconButton, Skeleton
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { format, parseISO, isValid } from 'date-fns';

import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import ConfirmationModal from '../../uiComponent/confirmationmodal';

const sortByApiMapping = {
    serialNumber: 'companyId', // Serial number maps to companyId for API sorting
    companyName: 'companyName',
    companyEmail: 'companyEmail',
    companyAddress: 'companyAddress',
    companySize: 'companySize',
    JoinedAt: 'createdAt',
};

// Updated head cells with S.No
const headCells = [
    { id: 'serialNumber', label: 'S.No', sortable: false, minWidth: 70 },
    { id: 'companyName', label: 'Company Name', sortable: true, minWidth: 200 },
    { id: 'companyEmail', label: 'Email', sortable: true, minWidth: 180 },
    { id: 'companyAddress', label: 'Address', sortable: true, minWidth: 200 },
    { id: 'companyPhone', label: 'Phone', sortable: false, minWidth: 130 },
    { id: 'isActive', label: 'Active', sortable: false, minWidth: 80 },
    { id: 'JoinedAt', label: 'Joined Date', sortable: true, minWidth: 130 },
    { id: 'actions', label: 'Actions', sortable: false, align: 'center', minWidth: 160 },
];

const tableCellStyle = {
    borderRight: '1px solid',
    borderColor: 'divider',
    '&:last-of-type': { borderRight: 0 },
    py: 0.7,
    px: 1.5,
    fontSize: '0.875rem',
};

const tableHeaderCellStyle = {
    ...tableCellStyle,
    fontWeight: 600,
    color: 'text.primary',
    backgroundColor: (theme) =>
        theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
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
                                {orderBy === headCell.id && (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                )}
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

// Updated date format function for DD/MM/YYYY
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/A';
    } catch (error) {
        return 'N/A';
    }
};

export default function CompanyTable({
    companies,
    totalCount,
    query,
    onQueryChange,
    onEditCompany,
    onDeleteCompany,
    onImpersonateCompany,
    loading,
}) {
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    const currentQuery = query || {};
    const currentOrderBy = Object.keys(sortByApiMapping).find(
        (key) => sortByApiMapping[key] === currentQuery.sortBy
    ) || 'serialNumber';
    const currentSortOrder = currentQuery.sortOrder || 'desc';
    const currentPage = currentQuery.page || 1;
    const currentPageSize = currentQuery.pageSize || 10;

    const handleRequestSort = (event, property) => {
        const apiSortBy = sortByApiMapping[property] || property;

        const isAsc = currentQuery.sortBy === apiSortBy && currentQuery.sortOrder === 'asc';
        const newSortOrder = isAsc ? 'desc' : 'asc';

        onQueryChange({
            sortBy: apiSortBy,
            sortOrder: newSortOrder,
            page: 1,
        });
    };

    const handleChangePage = (event, newPage) => {
        onQueryChange({ page: newPage + 1 });
    };

    const handleChangeRowsPerPage = (event) => {
        onQueryChange({ pageSize: parseInt(event.target.value, 10), page: 1 });
    };

    const handleDeleteClick = (company) => {
        setCompanyToDelete(company);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (companyToDelete) {
            onDeleteCompany(companyToDelete.id);
        }
        setIsDeleteModalOpen(false);
        setCompanyToDelete(null);
    };

    const handleCompanyNameClick = (companyId) => {
        navigate(`/super-admin/companies/${companyId}`);
    };

    // Safe array check
    const safeCompanies = Array.isArray(companies) ? companies : [];

    return (
        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <TableContainer sx={{ borderRadius: '12px 12px 0 0', overflowX: 'auto' }}>
                <Table stickyHeader aria-label="companies table" sx={{ minWidth: 1000 }}>
                    <EnhancedTableHead
                        order={currentSortOrder}
                        orderBy={currentOrderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {loading && safeCompanies.length === 0 ? (
                            Array.from(new Array(currentPageSize)).map((_, index) => (
                                <TableRow key={index}>
                                    {headCells.map((cell) => (
                                        <TableCell key={cell.id} sx={tableCellStyle}>
                                            <Skeleton />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : safeCompanies.length > 0 ? (
                            safeCompanies.map((company) => (
                                <TableRow 
                                    hover 
                                    key={company.id || company.companyId}
                                    sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}
                                >
                                    <TableCell sx={tableCellStyle}>
                                        <Typography variant="body2" color="text.secondary">
                                            {company.serialNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            ...tableCellStyle,
                                            cursor: 'pointer',
                                            '&:hover .company-name': {
                                                color: 'primary.main',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                        onClick={() => handleCompanyNameClick(company.id || company.companyId)}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            className="company-name"
                                            sx={{ 
                                                fontWeight: 500,
                                                color: 'text.primary',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {company.companyName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyle}>
                                        <Typography
                                            variant="body2"
                                            component="a"
                                            href={`mailto:${company.companyEmail}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                }
                                            }}
                                        >
                                            {company.companyEmail}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyle}>
                                        <Typography variant="body2" noWrap>
                                            {company.companyAddress || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyle}>
                                        <Typography variant="body2">
                                            {company.companyPhone || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyle}>
                                        <Typography 
                                            variant="body2" 
                                            color={company.isActive ? 'success.main' : 'error.main'}
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {company.isActive ? 'Yes' : 'No'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyle}>
                                        <Typography variant="body2">
                                            {formatDate(company.JoinedAt || company.createdAt)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ ...tableCellStyle, textAlign: 'center' }}>
                                        <Tooltip title="Impersonate Company">
                                            <IconButton
                                                id={`impersonate-btn-${company.id || company.companyId}`}
                                                size="small"
                                                onClick={() => onImpersonateCompany && onImpersonateCompany(company.id || company.companyId, company.companyName)}
                                                sx={{ mr: 0.5, color: 'warning.dark' }}
                                            >
                                                <ManageAccountsIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Company">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => onEditCompany(company.id || company.companyId)} 
                                                sx={{ mr: 0.5 }}
                                            >
                                                <EditIcon fontSize="small" color="primary" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Company">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleDeleteClick(company)}
                                            >
                                                <DeleteOutlineIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        No companies found
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
                count={totalCount || 0}
                rowsPerPage={currentPageSize}
                page={currentPage - 1}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />

            {companyToDelete && (
                <ConfirmationModal
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title={`Delete Company: ${companyToDelete?.companyName}?`}
                    message="Are you sure you want to delete this company? This action cannot be undone."
                    confirmButtonText="Delete"
                    confirmButtonColor="error"
                />
            )}
        </Paper>
    );
}
