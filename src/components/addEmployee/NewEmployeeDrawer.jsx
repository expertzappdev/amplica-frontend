import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  FormHelperText,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { validateEmailStrict } from '../../utils/emailValidation';
import Divider from '@mui/material/Divider';
import { gridSpacing } from '../../store/constant';

import {
  selectUserProfileLoading,
  selectUserProfileError,
  clearUserProfileError,
  getAllUsersRequest,
  selectUserList
} from '../../redux/features/profile/profileSlice';

import {
  getCompanyRolesRequest,
  getCompanyDepartmentsRequest,
  selectCompanyRoles,
  selectCompanyDepartments,
  selectCompanyRolesLoading,
  selectCompanyDepartmentsLoading,
  selectCompanyRolesError,
  selectCompanyDepartmentsError,
  clearRolesError,
  clearDepartmentsError
} from '../../redux/features/company/companySlice';

// Auth
import { selectUserCompanyId } from '../../redux/features/auth/authSlice';

export default function NewEmployeeDrawer({ open, onClose, onSubmit, employeeToEdit }) {
  const dispatch = useDispatch();

  // Profile loading states
  const isLoading = useSelector(selectUserProfileLoading);
  const apiError = useSelector(selectUserProfileError);
  const { items: usersList = [] } = useSelector(selectUserList) || { items: [] };
  // Company data
  const userCompanyId = useSelector(selectUserCompanyId);
  const companyRoles = useSelector(selectCompanyRoles);
  const companyDepartments = useSelector(selectCompanyDepartments);
  const rolesLoading = useSelector(selectCompanyRolesLoading);
  const departmentsLoading = useSelector(selectCompanyDepartmentsLoading);
  const rolesError = useSelector(selectCompanyRolesError);
  const departmentsError = useSelector(selectCompanyDepartmentsError);

  const isEditMode = !!employeeToEdit;

  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    roleId: '',
    joiningDate: null,
    status: 'Active',
    reportToUserId: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Fetch company roles, departments, and a lightweight users list when drawer opens
  useEffect(() => {
    if (open && userCompanyId) {
      dispatch(getCompanyRolesRequest());
      dispatch(getCompanyDepartmentsRequest());
      dispatch(
        getAllUsersRequest({
          page: 1,
          pageSize: 100,
          sortBy: 'firstName',
          sortOrder: 'asc',
          statusNames: 'Active',
          memberUserId: null
        })
      );
    }
  }, [open, userCompanyId, dispatch]);

  useEffect(() => {
    if (open) {
      if (isEditMode && employeeToEdit) {
        setFormData({
          firstName: employeeToEdit.firstName || '',
          lastName: employeeToEdit.lastName || '',
          email: employeeToEdit.userEmail || '',
          departmentId: employeeToEdit.departmentId || '',
          roleId: employeeToEdit.roleId || '',
          joiningDate: employeeToEdit.joiningDate ? parseISO(employeeToEdit.joiningDate) : null,
          status: employeeToEdit.status || 'Active',
          companyId: userCompanyId,
          reportToUserId: employeeToEdit.reportToUserId ? Number(employeeToEdit.reportToUserId) : ''
        });
      } else {
        setFormData({ ...initialFormState });
      }
      setErrors({});
      dispatch(clearUserProfileError());
      dispatch(clearRolesError());
      dispatch(clearDepartmentsError());
    }
  }, [open, employeeToEdit, isEditMode, userCompanyId, dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (newValue) => {
    setFormData((prev) => ({ ...prev, joiningDate: newValue }));
    if (errors.joiningDate) {
      setErrors((prev) => ({ ...prev, joiningDate: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmailStrict(formData.email.trim());
      if (!emailValidation.isValid) {
        tempErrors.email = emailValidation.message;
      }
    }
    if (!formData.departmentId) tempErrors.departmentId = 'Department is required';
    if (!formData.roleId) tempErrors.roleId = 'Role is required';
    if (!formData.joiningDate) tempErrors.joiningDate = 'Joining date is required';

    // Optional: Enforce a manager selection if business rules require it
    // if (!isEditMode && !formData.reportToUserId) tempErrors.reportToUserId = "Reports To is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    // Find selected role and department details
    const selectedRole = companyRoles.find((role) => role.companyRoleId === formData.roleId);
    const selectedDepartment = companyDepartments.find((dept) => dept.deptId === formData.departmentId);

    const coreData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      userEmail: formData.email,
      departmentId: formData.departmentId,
      companyRoleId: formData.roleId,
      description: selectedRole?.roleName || '',
      companyId: userCompanyId
    };

    const normalizedReportToUserId =
      formData.reportToUserId === '' || Number.isNaN(Number(formData.reportToUserId))
        ? null
        : Number(formData.reportToUserId);

    const placeholderData = {
      employmentType: 'Full-time',
      employeeCode: isEditMode ? employeeToEdit?.employeeCode || `EMP${Date.now()}` : `EMP${Date.now()}`,
      joiningDate: format(formData.joiningDate, 'yyyy-MM-dd'),
      reportToUserId: normalizedReportToUserId
    };

    let finalPayload = {};
    if (isEditMode) {
      finalPayload = { ...placeholderData, ...coreData };
    } else {
      const createOnlyData = {
        userPasswordHash: 'DefaultPassword@123',
        userRoleId: formData.roleId
      };
      finalPayload = { ...placeholderData, ...coreData, ...createOnlyData };
    }

    onSubmit(finalPayload);
  };

  const selectedReportToId =
    formData.reportToUserId === '' || formData.reportToUserId === null ? '' : Number(formData.reportToUserId);

  const managerOptions = (usersList || [])
    .filter(
      (u) =>
        !isEditMode ||
        (u.userId !== employeeToEdit?.userId && u.companyEmployeeId !== employeeToEdit?.companyEmployeeId)
    )
    .map((u) => ({
      // API returns and expects reportToUserId as companyEmployeeId.
      id: Number(u.companyEmployeeId ?? u.userId),
      label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userEmail,
      email: u.userEmail
    }))
    .filter((mgr) => Number.isFinite(mgr.id));

  const isSelectedManagerPresent =
    selectedReportToId === '' ? true : managerOptions.some((mgr) => Number(mgr.id) === selectedReportToId);

  const managerOptionsWithFallback =
    !isSelectedManagerPresent && selectedReportToId !== ''
      ? [
          {
            id: selectedReportToId,
            label: employeeToEdit?.reportToUserName || `User ID: ${selectedReportToId}`,
            email: ''
          },
          ...managerOptions
        ]
      : managerOptions;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 450, md: 450, lg: 450 },
          p: gridSpacing
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: gridSpacing
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {isEditMode ? 'Edit Details' : 'Add New Member'}
        </Typography>
        <IconButton onClick={onClose} disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: gridSpacing }} />

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: gridSpacing }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Error {isEditMode ? 'Updating' : 'Creating'} Team Member
              </Typography>
              <Typography variant="body2">{apiError}</Typography>
            </Alert>
          )}

          {(rolesError || departmentsError) && (
            <Alert severity="warning" sx={{ mb: gridSpacing }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Failed to load company data
              </Typography>
              <Typography variant="body2">
                {rolesError && `Roles: ${rolesError}`}
                {rolesError && departmentsError && ' | '}
                {departmentsError && `Departments: ${departmentsError}`}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={gridSpacing - 0.5}>
            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={isLoading}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={isLoading}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <TextField
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl fullWidth required error={!!errors.departmentId}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  label="Department"
                  onChange={handleChange}
                  disabled={isLoading || departmentsLoading}
                >
                  {departmentsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading departments...
                    </MenuItem>
                  ) : companyDepartments.length > 0 ? (
                    companyDepartments.map((department) => (
                      <MenuItem key={department.deptId} value={department.deptId}>
                        {department.departmentName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
                {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl fullWidth required error={!!errors.roleId}>
                <InputLabel>Role</InputLabel>
                <Select name="roleId" value={formData.roleId} label="Role" onChange={handleChange} disabled={isLoading || rolesLoading}>
                  {rolesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading roles...
                    </MenuItem>
                  ) : companyRoles.length > 0 ? (
                    companyRoles
                      .filter((role) => role.isActive)
                      .map((role) => (
                        <MenuItem key={role.companyRoleId} value={role.companyRoleId}>
                          {role.roleName}
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
                {errors.roleId && <FormHelperText>{errors.roleId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl fullWidth error={!!errors.reportToUserId}>
                <InputLabel>Reports To</InputLabel>
                <Select
                  name="reportToUserId"
                  value={selectedReportToId}
                  label="Reports To"
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {managerOptionsWithFallback.map((mgr) => (
                    <MenuItem key={mgr.id} value={mgr.id}>
                      {mgr.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.reportToUserId && <FormHelperText>{errors.reportToUserId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Joining Date"
                  value={formData.joiningDate}
                  onChange={handleDateChange}
                  disabled={isLoading}
                  format="dd/MM/yyyy"
                  enableAccessibleFieldDOMStructure={false}
                  slots={{
                    textField: (params) => <TextField {...params} fullWidth required variant="outlined" placeholder="DD/MM/YYYY" />
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            mt: gridSpacing,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            pt: 1,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button onClick={onClose} variant="outlined" color="secondary" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || rolesLoading || departmentsLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                {isEditMode ? 'Saving...' : 'Adding...'}
              </Box>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Add New Member'
            )}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
