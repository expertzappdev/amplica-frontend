import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { gridSpacing } from '../../store/constant';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { validateEmailStrict } from '../../utils/emailValidation';

// Import Redux selectors and actions for company management
import {
  selectCompaniesLoading,
  selectCompaniesError,
  clearCompaniesError,
  createCompanyRequest,
  updateCompanyRequest,
} from '../../redux/features/company/companySlice';

// Packages slice imports for package API integration
import {
  fetchPackagesRequest,
  selectAllPackages,
} from '../../redux/features/package/packageSlice';

import {
  industryOptions,
  companySizeOptions,
  statusOptions,
  getCompanySizeLabel,
  getStatusLabel
} from '../../constants/formOptions';

// --- Main NewCompanyDrawer Component ---
export default function NewCompanyDrawer({ open, onClose, onSubmit, companyToEdit, isSubmitting }) {
  const dispatch = useDispatch();
  const isEditMode = !!companyToEdit;

  // Redux state selectors for company form
  const companyLoading = useSelector(selectCompaniesLoading);
  const companyError = useSelector(selectCompaniesError);

  // Packages data from Redux and fetch flag
  const packagesData = useSelector(selectAllPackages);
  const [packagesFetched, setPackagesFetched] = useState(false);

  const initialFormState = {
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyPhone: '',
    companyUrl: '',
    aboutCompany: '',
    industry: '',
    companySize: '',
    vision: '',
    mission: '',
    goal: '',
    isActive: true,
    packageId: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Fetch packages on drawer open
  useEffect(() => {
    if (open && !packagesFetched) {
      dispatch(fetchPackagesRequest());
      setPackagesFetched(true);
    }
  }, [open, dispatch, packagesFetched]);

  // Transform packages for select options
  const packageOptions = useMemo(() => {
    if (!packagesData) return [];
    const list = Array.isArray(packagesData) ? packagesData : packagesData.items || [];
    return list.map(pkg => ({
      id: pkg.packageId,
      name: pkg.packageName,
    }));
  }, [packagesData]);

  useEffect(() => {
    if (open) {
      setErrors({});
      // Clear Redux errors
      dispatch(clearCompaniesError());

      if (isEditMode && companyToEdit) {
        setFormData({
          companyName: companyToEdit.companyName || '',
          companyEmail: companyToEdit.companyEmail || '',
          companyAddress: companyToEdit.companyAddress || '',
          companyPhone: companyToEdit.companyPhone || '',
          companyUrl: companyToEdit.companyUrl || '',
          aboutCompany: companyToEdit.aboutCompany || '',
          industry: companyToEdit.industry || '',
          companySize: companyToEdit.companySize || '',
          vision: companyToEdit.vision || '',
          mission: companyToEdit.mission || '',
          goal: companyToEdit.goal || '',
          isActive: companyToEdit.isActive ?? true,
          packageId: companyToEdit.packageId || '',
        });
      } else {
        setFormData(initialFormState);
      }
    } else {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [open, isEditMode, companyToEdit, dispatch]);

  const handleClose = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    dispatch(clearCompaniesError());
    
    onClose();
  }, [dispatch, onClose]);

  // Form input change handler
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    let processedValue = value;
    if (name === 'companyPhone' || name === 'phoneNumber') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validation including new package field
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.companyName.trim()) {
      tempErrors.companyName = 'Company name is required';
    }
    if (!formData.companyEmail || !formData.companyEmail.trim()) {
      tempErrors.companyEmail = 'Email is required';
    } else {
      const emailValidation = validateEmailStrict(formData.companyEmail.trim());
      if (!emailValidation.isValid) {
        tempErrors.companyEmail = emailValidation.message;
      }
    }
    if (formData.companyPhone && formData.companyPhone.toString().trim()) {
      const phoneStr = formData.companyPhone.toString().trim().replace(/[-\s]/g, '');
      if (!/^\d{10}$/.test(phoneStr)) {
        tempErrors.companyPhone = 'Phone number must be exactly 10 digits';
      }
    }
    if (formData.companyUrl && formData.companyUrl.trim()) {
      if (!/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(formData.companyUrl.trim())) {
        tempErrors.companyUrl = 'Please enter a valid website URL (e.g., example.com)';
      }
    }
    if (formData.companySize && !companySizeOptions.find(option => option.value === Number(formData.companySize))) {
      tempErrors.companySize = 'Please select a valid company size';
    }
    if (!formData.packageId) {
      tempErrors.packageId = 'Please select a package';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit handler for create or update company
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      dispatch(clearCompaniesError());

      const payload = {
        companyName: formData.companyName.trim(),
        companyEmail: formData.companyEmail.trim(),
        companyAddress: formData.companyAddress.trim() || undefined,
        companyPhone: formData.companyPhone ? Number(formData.companyPhone) : undefined,
        companyUrl: formData.companyUrl.trim() || undefined,
        aboutCompany: formData.aboutCompany.trim() || undefined,
        industry: formData.industry.trim() || undefined,
        companySize: formData.companySize ? Number(formData.companySize) : undefined,
        vision: formData.vision.trim() || undefined,
        mission: formData.mission.trim() || undefined,
        goal: formData.goal.trim() || undefined,
        isActive: formData.isActive,
        isApproved: isEditMode ? companyToEdit.isApproved : false,
        adminUserId: isEditMode ? companyToEdit.adminUserId : undefined,
        packageId: formData.packageId,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      let result;
      if (isEditMode) {
        result = await new Promise((resolve, reject) => {
          dispatch(updateCompanyRequest({ companyId: companyToEdit.companyId, companyData: payload, resolve, reject }));
        });
      } else {
        result = await new Promise((resolve, reject) => {
          dispatch(createCompanyRequest({ companyData: payload, resolve, reject }));
        });
      }

      if (!isEditMode && result && result.success) {
        toast.success('Company created! Credentials email has been sent to the admin.');
        handleClose();
      } else if (isEditMode && result.success) {
        toast.success('Company Updated Successfully!');
        handleClose();
      } else if (!result.success) {
        toast.error(result.error || 'Company submission failed.');
      }
    } catch (err) {
      console.error("Submission error in NewCompanyDrawer:", err);
      toast.error(err.error || 'Company submission failed due to an unexpected error.');
    }
  };

  const isDrawerBusy = companyLoading || isSubmitting;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400, md: 480, lg: 520 },
            p: gridSpacing
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: gridSpacing
        }}>
          <Typography variant="h5" fontWeight={600}>
            {isEditMode ? 'Edit Company' : 'Add New Company'}
          </Typography>
          <IconButton onClick={handleClose} disabled={isDrawerBusy}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: gridSpacing }} />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
            {companyError && (
              <Alert
                severity="error"
                sx={{ mb: gridSpacing }}
                onClose={() => { dispatch(clearCompaniesError()); }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Error {isEditMode ? 'Updating' : 'Creating'} Company
                </Typography>
                <Typography variant="body2">{companyError}</Typography>
              </Alert>
            )}

            <Grid container spacing={gridSpacing}>
              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  disabled={isDrawerBusy}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="companyEmail"
                  label="Company Email"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.companyEmail}
                  helperText={errors.companyEmail}
                  disabled={isDrawerBusy}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="companyPhone"
                  label="Phone Number"
                  type="tel"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.companyPhone}
                  helperText={errors.companyPhone}
                  disabled={isDrawerBusy}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="companyUrl"
                  label="Company Website"
                  value={formData.companyUrl}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.companyUrl}
                  helperText={errors.companyUrl}
                  placeholder="https://example.com"
                  disabled={isDrawerBusy}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    name="industry"
                    value={formData.industry}
                    label="Industry"
                    onChange={handleChange}
                    disabled={isDrawerBusy}
                  >
                    {industryOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <FormControl fullWidth error={!!errors.companySize}>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    name="companySize"
                    value={formData.companySize}
                    label="Company Size"
                    onChange={handleChange}
                    disabled={isDrawerBusy}
                  >
                    {companySizeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.companySize && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.companySize}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="companyAddress"
                  label="Company Address"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={7}
                  error={!!errors.companyAddress}
                  helperText={errors.companyAddress}
                  disabled={isDrawerBusy}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <TextField
                  name="aboutCompany"
                  label="About Company"
                  value={formData.aboutCompany}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={7}
                  error={!!errors.aboutCompany}
                  helperText={errors.aboutCompany}
                  disabled={isDrawerBusy}
                />
              </Grid>

              {/* Package selection */}
              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <FormControl fullWidth error={!!errors.packageId} disabled={isDrawerBusy} required>
                  <InputLabel id="package-label">Select Package</InputLabel>
                  <Select
                    labelId="package-label"
                    name="packageId"
                    value={formData.packageId}
                    label="Select Package"
                    onChange={handleChange}
                  >
                    {packageOptions.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.id}>{pkg.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.packageId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.packageId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item size={{ xs: 12, sm:6, md: 6, lg: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="isActive-label">Status</InputLabel>
                  <Select
                    labelId="isActive-label"
                    name="isActive"
                    value={formData.isActive}
                    label="Status"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value
                      }))
                    }
                    disabled={isDrawerBusy}
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.id} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              mt: gridSpacing,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              color="secondary"
              disabled={isDrawerBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isDrawerBusy}
              sx={{ minWidth: 120 }}
            >
              {isDrawerBusy ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  {isEditMode ? 'Saving...' : 'Adding...'}
                </Box>
              ) : (
                isEditMode ? 'Save Changes' : 'Add Company'
              )}
            </Button>
          </Box>
        </Box>
      </Drawer>

    </>
  );
}
