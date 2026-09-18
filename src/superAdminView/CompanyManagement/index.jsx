import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

import CompanyTable from './CompanyTable';
import NewCompanyDrawer from './NewCompanyDrawer';
import AdvancedSortDrawer from '../../uiComponent/advancedsortmodal/AdvancedSortDrawer';
import { gridSpacing } from 'store/constant';

import {
  fetchCompaniesRequest,
  deleteCompanyRequest,
  createCompanyRequest,
  updateCompanyRequest,
  getCompanyByIdRequest,
  setQuery,
  clearEditingCompanyState,
  clearCompaniesError,
  selectCompaniesLoading,
  selectCompaniesError,
  selectAllCompanies,
  selectTotalCompanyCount,
  selectQuery,
  selectCompanyIdData,
} from '../../redux/features/company/companySlice';
import { impersonateRequest } from '../../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CompanyManagement = () => {
  const dispatch = useDispatch();
  
  // Redux selectors - updated for new architecture
  const companiesData = useSelector(selectAllCompanies);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompaniesError);
  const query = useSelector(selectQuery) || {
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt', 
    sortOrder: 'desc', 
    search: '',
  };
  const totalCount = useSelector(selectTotalCompanyCount);
  const companyToEdit = useSelector(selectCompanyIdData);

  const [isNewDrawerOpen, setNewDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companies = companiesData?.items || [];

  const prevLoading = useRef(loading);

  useEffect(() => {
    if (!loading && !hasFetchedInitial) {
      dispatch(fetchCompaniesRequest(query));
      setHasFetchedInitial(true);
    }
  }, [dispatch, query, loading, hasFetchedInitial]);

  // Query change effect
  useEffect(() => {
    if (hasFetchedInitial) {
      dispatch(fetchCompaniesRequest(query));
    }
  }, [dispatch, query, hasFetchedInitial]);

  const handleEditClick = useCallback((companyId) => {
    dispatch(clearEditingCompanyState()); // Clear previous data
    dispatch(getCompanyByIdRequest(companyId));
    setNewDrawerOpen(true);
  }, [dispatch]);

  const handleQueryChange = useCallback((newQueryParams) => {
    dispatch(setQuery({ ...query, ...newQueryParams }));
  }, [dispatch, query]);

  const toggleDrawer = (open) => {
    if (!open) {
      dispatch(clearEditingCompanyState());
    }
    setNewDrawerOpen(open);
  };

  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };

  const handleDeleteCompany = useCallback((companyId) => {
    dispatch(deleteCompanyRequest({ companyId }));
  }, [dispatch]);

  const navigate = useNavigate();
  const handleImpersonateCompany = useCallback((companyId, companyName) => {
    const loadingToast = toast.loading(`Starting impersonation for ${companyName}...`);
    dispatch(impersonateRequest({
      companyId,
      onSuccess: (data) => {
        toast.dismiss(loadingToast);
        toast.success(`Now impersonating ${companyName}`);
        navigate('/app/dashboard');
      },
      onFailure: (errorMsg) => {
        toast.dismiss(loadingToast);
        toast.error(errorMsg || 'Impersonation failed');
      },
    }));
  }, [dispatch, navigate]);

  // --- MODIFIED handleFormSubmit ---
  const handleFormSubmit = useCallback(async (data) => {
    setIsSubmitting(true);

    return new Promise((resolve, reject) => { 
      try {
        if (companyToEdit) {
          dispatch(updateCompanyRequest({
            companyId: companyToEdit.companyId,
            changes: data,
          }));
          resolve({ success: true }); 
        } else {
          dispatch(createCompanyRequest({ payload: data, resolve, reject }));
        }
      } catch (err) {
        console.error("Company submission failed in parent:", err);
        setIsSubmitting(false);
        reject({ success: false, error: err.message });
      }
    }).finally(() => {
      setIsSubmitting(false);
    });
  }, [dispatch, companyToEdit]);

  useEffect(() => {
    if (hasFetchedInitial && prevLoading.current && !loading && !error) {
    }
    if (isSubmitting && error) {
      setIsSubmitting(false);
    }

    prevLoading.current = loading;
  }, [loading, error, hasFetchedInitial, isSubmitting]);

  const filterSections = useMemo(
    () => [
      {
        type: 'sort',
        key: 'sort',
        title: 'Sort Companies',
        options: [
          { key: 'companyName', label: 'Company Name' },
          { key: 'createdAt', label: 'Created Date' },
          { key: 'companyEmail', label: 'Email' },
        ],
      },
      {
        type: 'keyword',
        key: 'search',
        title: 'Filter by Keyword',
      },
    ],
    []
  );

  const initialFilterSelection = useMemo(() => ({
    sortBy: query.sortBy || null,
    sortOrder: query.sortOrder || null,
    search: query.search || null,
  }), [query]);

  const handleApplyFilters = useCallback(
    (filtersPayload) => {
      let newQueryState = { ...query, page: 1 };

      const defaultQueryParams = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
      };

      if (Object.keys(filtersPayload).length === 0) {
        newQueryState = {
          ...newQueryState,
          ...defaultQueryParams,
        };
      } else {
        newQueryState = {
          ...newQueryState,
          ...filtersPayload,
        };
      }

      dispatch(setQuery(newQueryState));
      setFilterDrawerOpen(false);
    },
    [dispatch, query]
  );

  const formattedCompanies = useMemo(() => {
    if (!Array.isArray(companies)) {
      console.warn('Expected an array for companies but got:', companies);
      return [];
    }

    return companies.map((company, index) => ({
      ...company,
      id: company.companyId,
      serialNumber: (query.page - 1) * query.pageSize + index + 1,
      JoinedAt: company.createdAt,
    }));
  }, [companies, query.page, query.pageSize]);

  const shouldShowFullScreenLoader = loading && !hasFetchedInitial;

  const handleClearError = () => {
    dispatch(clearCompaniesError());
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: gridSpacing/2,
          mt:gridSpacing/2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          Company Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search companies..."
            variant="outlined"
            size="small"
            value={query.search || ''}
            onChange={(e) => handleQueryChange({ search: e.target.value, page: 1 })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: '250px' },
              backgroundColor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => toggleDrawer(true)}
            sx={{
              borderRadius: '12px',
              px: { xs: 1.5, sm: 2.5 },
              height: '40px',
              whiteSpace: 'nowrap',
            }}
          >
            Add Company
          </Button>

          <Tooltip title="Filter Companies">
            <IconButton
              onClick={toggleFilterDrawer(true)}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                height: '40px',
                width: '40px',
              }}
            >
              <FilterListIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={handleClearError}
        >
          {error}
        </Alert>
      )}

      {shouldShowFullScreenLoader ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 300px)'
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <CompanyTable
          companies={formattedCompanies}
          totalCount={totalCount}
          query={query}
          onQueryChange={handleQueryChange}
          onEditCompany={handleEditClick}
          onDeleteCompany={handleDeleteCompany}
          onImpersonateCompany={handleImpersonateCompany}
          loading={loading}
        />
      )}

      <NewCompanyDrawer
        open={isNewDrawerOpen}
        onClose={() => toggleDrawer(false)}
        onSubmit={handleFormSubmit}
        companyToEdit={companyToEdit}
        isSubmitting={isSubmitting}
      />

      <AdvancedSortDrawer
        open={isFilterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
        onConfirm={handleApplyFilters}
        sections={filterSections}
        initialSelection={initialFilterSelection}
      />
    </Box>
  );
};

export default CompanyManagement;
