// src/uiComponent/statusdropdown/StatusDropdown.jsx
import React from 'react';
import { FormControl, Select, MenuItem, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectStatusItems } from '../../redux/features/projects/projectSlice';


// Define statusOptionsWithColors here and EXPORT it
export const statusOptionsWithColors = [ // <-- ADD 'export' HERE
  { value: 'All', label: 'All', color: 'text.primary', bgColor: 'transparent' },
  { value: 'Open', label: 'Open', color: '#007bff', bgColor: '#e6f2ff' },
  { value: 'InProgress', label: 'In Progress', color: '#ffc107', bgColor: '#fff8e6' },
  { value: 'Completed', label: 'Completed', color: '#28a745', bgColor: '#e6ffe6' },
  { value: 'Delayed', label: 'Delayed', color: '#dc3545', bgColor: '#ffe6e6' },
  { value: 'InReview', label: 'In Review', color: '#17a2b8', bgColor: '#e6f7f9' },
  { value: 'NotStarted', label: 'Not Started', color: '#999999', bgColor: '#f2f2f2' },
  { value: 'Cancelled', label: 'Cancelled', color: '#F44336', bgColor: '#ffe0d4' },
];

export default function StatusDropdown({ currentStatus, projectId, onStatusChange, sx }) {
  const statusData = useSelector(selectStatusItems) || [];
  // dynamicStatusOptions is derived from Redux for actual statuses, not static.
  const dynamicStatusOptions = statusData.map(status => ({
    value: status.name,
    label: status.name,
    color: status.statusColor || 'text.primary',
    bgColor: status.statusColor ? `${status.statusColor}99` : 'transparent', 
  }));

  const selectedStatusDetails = dynamicStatusOptions.find(s => s.value === currentStatus) ||
                                { label: currentStatus, color: 'text.primary', bgColor: 'transparent' };

  const handleChange = (event) => {
    if (onStatusChange) {
      onStatusChange(projectId, event.target.value);
    }
  };

  return (
    <FormControl variant="standard" sx={{ m: 0, width: '100%', height: '100%', ...sx }}>
      <Select
        value={currentStatus}
        onChange={handleChange}
        disableUnderline
        sx={{
          height: '100%',
          backgroundColor: selectedStatusDetails.bgColor,
          color: selectedStatusDetails.color,
          fontWeight: 500,
          borderRadius: 0,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          '& .MuiSelect-select': {
            paddingRight: '24px !important',
            display: 'flex',
            alignItems: 'center',
            '&:focus': {
                backgroundColor: 'transparent',
            }
          },
          '& .MuiSvgIcon-root': {
            color: selectedStatusDetails.color,
            right: '4px',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: '4px',
              mt: 0.5,
            },
          },
        }}
      >
        {dynamicStatusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ color: option.color, fontWeight: 500 }}>
            <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: option.bgColor, border: `1px solid ${option.color}`, mr: 1.5 }} />
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}