import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

const ProjectUserDropdown = ({ members, selectedValue, onChange, label = "Filter by User", disabled = false }) => {
    
    if (!members || members.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No project members available
            </Typography>
        );
    }
    
    return (
        <FormControl sx={{ minWidth: 200, mb: 2 }} size="small" disabled={disabled}>
            <InputLabel id="timesheet-user-select-label">{label}</InputLabel>
            <Select
                labelId="timesheet-user-select-label"
                id="timesheet-user-select"
                value={selectedValue || ''}
                label={label}
                onChange={onChange}
            >
                {members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                        {member.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default ProjectUserDropdown;
