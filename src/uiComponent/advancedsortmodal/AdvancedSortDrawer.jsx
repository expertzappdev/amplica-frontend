import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Button, FormControl,
  IconButton, Divider, TextField, Accordion, AccordionSummary,
  AccordionDetails, RadioGroup, FormControlLabel, Radio, Chip,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { gridSpacing } from '../../store/constant';

// Utility functions
const getFormattedDate = (date) => (date ? date.toISOString().split('T')[0] : null);
const getFormattedTime = (time) => (time ? time.toTimeString().split(' ')[0] : null);

const getWeekRange = (offset = 0) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0 for Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (offset * 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return { startDateFrom: getFormattedDate(startOfWeek), endDateTo: getFormattedDate(endOfWeek) };
};

const getMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDateFrom: getFormattedDate(startOfMonth), endDateTo: getFormattedDate(endOfMonth) };
};

const defaultSelections = {
  sortBy: null,
  sortOrder: null,
  statusNames: [],
  memberUserIds: [],
  search: '',
  durationPreset: null,
  startDateFrom: null,
  endDateTo: null,
  roleNames: [],
  departmentNames: [],
  loggedAtFrom: '',
  loggedAtTo: '',
  durationFrom: '',
  isDeletedFilter: false,
};

export default function AdvancedSortDrawer({
  open,
  onClose,
  onConfirm,
  sections = [],
  initialSelection = {},
}) {
  const [expandedSections, setExpandedSections] = useState([]);
  const [selections, setSelections] = useState(defaultSelections);

  useEffect(() => {
    if (open) {
      const initial = { ...defaultSelections, ...initialSelection };
      setSelections(initial);

      const activeSections = [];
      if (initial.sortBy) activeSections.push('sort');
      if (initial.statusNames?.length > 0) activeSections.push('statusNames');
      if (initial.roleNames?.length > 0) activeSections.push('roleNames');
      if (initial.departmentNames?.length > 0) activeSections.push('departmentNames');
      if (initial.memberUserIds?.length > 0) activeSections.push('memberUserIds');
      if (initial.search) activeSections.push('search');
      if (initial.loggedAtFrom) activeSections.push('loggedAtFrom');
      if (initial.loggedAtTo) activeSections.push('loggedAtTo');
      if (initial.durationFrom) activeSections.push('durationFrom');
      if (initial.isDeletedFilter !== undefined) activeSections.push('isDeletedFilter');
      
      if (initial.startDateFrom || initial.endDateTo) {
          const presets = ['today', 'this_week', 'last_week', 'this_month'];
          if (!presets.includes(initial.durationPreset)) {
            initial.durationPreset = 'custom';
            setSelections(s => ({...s, durationPreset: 'custom'}));
          }
      }
      if (initial.durationPreset) activeSections.push('duration');

      setExpandedSections(activeSections);
    }
  }, [open, initialSelection]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSections((prev) =>
      isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)
    );
  };

  const handleSelectionChange = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectToggle = (key, optionKey) => {
    const currentValues = selections[key] || [];
    const newValues = currentValues.includes(optionKey)
      ? currentValues.filter((s) => s !== optionKey)
      : [...currentValues, optionKey];
    handleSelectionChange(key, newValues);
  };

  const handleClearFilters = () => {
    onConfirm({});
  };

  const handleApplyFilters = () => {
    const payload = { ...selections };

    if (payload.durationPreset && payload.durationPreset !== 'custom') {
      let range = {};
      switch (payload.durationPreset) {
        case 'today':
          const today = getFormattedDate(new Date());
          range = { startDateFrom: today, endDateTo: today };
          break;
        case 'this_week': range = getWeekRange(0); break;
        case 'last_week': range = getWeekRange(-1); break;
        case 'this_month': range = getMonthRange(); break;
        default: break;
      }
      payload.startDateFrom = range.startDateFrom;
      payload.endDateTo = range.endDateTo;
    }

    if (payload.startDateFrom instanceof Date) {
      payload.startDateFrom = getFormattedDate(payload.startDateFrom);
    }
    if (payload.endDateTo instanceof Date) {
      payload.endDateTo = getFormattedDate(payload.endDateTo);
    }

    if (payload.loggedAtFrom instanceof Date) {
      payload.loggedAtFrom = getFormattedTime(payload.loggedAtFrom);
    }
    if (payload.loggedAtTo instanceof Date) {
      payload.loggedAtTo = getFormattedTime(payload.loggedAtTo);
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === null || payload[key] === '' || (Array.isArray(payload[key]) && payload[key].length === 0)) {
        delete payload[key];
      }
    });

    delete payload.durationPreset;
    onConfirm(payload);
    onClose();
  };

  // --- Render Methods for Sections ---

  const renderSortSection = (section) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ mt: 1 }}>Sort By</Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="sortBy"
          value={selections.sortBy || ''}
          onChange={(e) => handleSelectionChange('sortBy', e.target.value)}
        >
          {section.options.map((opt) => (
            <FormControlLabel key={opt.key} value={opt.key} control={<Radio />} label={opt.label} />
          ))}
        </RadioGroup>
      </FormControl>
      <Typography variant="subtitle1">Order</Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="sortOrder"
          value={selections.sortOrder || ''}
          onChange={(e) => handleSelectionChange('sortOrder', e.target.value)}
        >
          <FormControlLabel value="asc" control={<Radio />} label="Ascending" />
          <FormControlLabel value="desc" control={<Radio />} label="Descending" />
        </RadioGroup>
      </FormControl>
    </Box>
  );

  const renderStatusSection = (section) => {
    const isAllSelected = !selections.statusNames || selections.statusNames.length === 0;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All Tasks"
          onClick={() => handleSelectionChange('statusNames', [])}
          variant={isAllSelected ? 'filled' : 'outlined'}
          color={isAllSelected ? 'primary' : 'default'}
        />
        {section.options.map((opt) => {
          const isSelected = (selections.statusNames || []).includes(opt.key);
          return (
            <Chip
              key={opt.key}
              label={opt.label}
              onClick={() => handleMultiSelectToggle('statusNames', opt.key)}
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
            />
          );
        })}
      </Box>
    );
  };

  const renderRoleNamesSection = (section) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {section.options.map((opt) => {
        const isSelected = (selections.roleNames || []).includes(opt.key);
        return (
          <Chip
            key={opt.key}
            label={opt.label}
            onClick={() => handleMultiSelectToggle('roleNames', opt.key)}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
          />
        );
      })}
    </Box>
  );

  const renderDepartmentNamesSection = (section) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {section.options.map((opt) => {
        const isSelected = (selections.departmentNames || []).includes(opt.key);
        return (
          <Chip
            key={opt.key}
            label={opt.label}
            onClick={() => handleMultiSelectToggle('departmentNames', opt.key)}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
          />
        );
      })}
    </Box>
  );

  const renderMemberSection = (section) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {section.options.map((opt) => {
        const optionKeyStr = String(opt.key);
        const isSelected = (selections.memberUserIds || []).map(String).includes(optionKeyStr);
        return (
          <Chip
            key={opt.key}
            label={opt.label}
            onClick={() => handleMultiSelectToggle('memberUserIds', optionKeyStr)}
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
          />
        );
      })}
    </Box>
  );

  const renderKeywordSection = () => (
    <TextField
      label="Enter search keyword..."
      variant="outlined"
      fullWidth
      value={selections.search || ''}
      onChange={(e) => handleSelectionChange('search', e.target.value)}
    />
  );

  const renderLoggedAtSection = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Filter entries by logged time range
        </Typography>
        <TimePicker
          label="Logged At From (Time)"
          value={selections.loggedAtFrom ? 
            (typeof selections.loggedAtFrom === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtFrom}`) : 
              selections.loggedAtFrom
            ) : null
          }
          onChange={(time) => handleSelectionChange('loggedAtFrom', time)}
          enableAccessibleFieldDOMStructure={false}
          slots={{ 
            textField: (params) => (
              <TextField 
                {...params} 
                fullWidth 
                variant="outlined"
                placeholder="HH:MM"
              />
            )
          }}
        />
        <TimePicker
          label="Logged At To (Time)"
          value={selections.loggedAtTo ? 
            (typeof selections.loggedAtTo === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtTo}`) : 
              selections.loggedAtTo
            ) : null
          }
          onChange={(time) => handleSelectionChange('loggedAtTo', time)}
          minTime={selections.loggedAtFrom ? 
            (typeof selections.loggedAtFrom === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtFrom}`) : 
              selections.loggedAtFrom
            ) : null
          }
          enableAccessibleFieldDOMStructure={false}
          slots={{ 
            textField: (params) => (
              <TextField 
                {...params} 
                fullWidth 
                variant="outlined"
                placeholder="HH:MM"
              />
            )
          }}
        />
      </Box>
    </LocalizationProvider>
  );

  const renderLoggedAtFromSection = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Filter entries logged from this time onwards
        </Typography>
        <TimePicker
          label="Logged At From (Time)"
          value={selections.loggedAtFrom ? 
            (typeof selections.loggedAtFrom === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtFrom}`) : 
              selections.loggedAtFrom
            ) : null
          }
          onChange={(time) => handleSelectionChange('loggedAtFrom', time)}
          enableAccessibleFieldDOMStructure={false}
          slots={{ 
            textField: (params) => (
              <TextField 
                {...params} 
                fullWidth 
                variant="outlined"
                placeholder="HH:MM"
              />
            )
          }}
        />
      </Box>
    </LocalizationProvider>
  );

  const renderLoggedAtToSection = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Filter entries logged up to this time
        </Typography>
        <TimePicker
          label="Logged At To (Time)"
          value={selections.loggedAtTo ? 
            (typeof selections.loggedAtTo === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtTo}`) : 
              selections.loggedAtTo
            ) : null
          }
          onChange={(time) => handleSelectionChange('loggedAtTo', time)}
          minTime={selections.loggedAtFrom ? 
            (typeof selections.loggedAtFrom === 'string' ? 
              new Date(`1970-01-01T${selections.loggedAtFrom}`) : 
              selections.loggedAtFrom
            ) : null
          }
          enableAccessibleFieldDOMStructure={false}
          slots={{ 
            textField: (params) => (
              <TextField 
                {...params} 
                fullWidth 
                variant="outlined"
                placeholder="HH:MM"
              />
            )
          }}
        />
      </Box>
    </LocalizationProvider>
  );

  const renderDurationFromSection = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Filter entries with duration from this value (in hours)
      </Typography>
      <TextField
        label="Duration From"
        type="number"
        variant="outlined"
        fullWidth
        value={selections.durationFrom || ''}
        onChange={(e) => handleSelectionChange('durationFrom', e.target.value)}
        inputProps={{
          min: 0,
          step: 0.5,
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">hours</InputAdornment>,
        }}
        placeholder="e.g., 2.5"
      />
    </Box>
  );

  const durationPresets = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ];
  
  const renderIsDeletedFilterSection = (section) => (
    <FormControl component="fieldset">
      <RadioGroup
        row
        name="isDeletedFilter"
        value={selections.isDeletedFilter.toString()}
        onChange={(e) => handleSelectionChange('isDeletedFilter', e.target.value === 'true')}
      >
        {section.options.map((opt) => (
          <FormControlLabel 
            key={opt.key.toString()} 
            value={opt.key.toString()} 
            control={<Radio />} 
            label={opt.label} 
          />
        ))}
      </RadioGroup>
    </FormControl>
  );

  const renderDurationSection = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {durationPresets.map(preset => (
            <Chip
              key={preset.key}
              label={preset.label}
              onClick={() => handleSelectionChange('durationPreset', preset.key)}
              variant={selections.durationPreset === preset.key ? 'filled' : 'outlined'}
              color={selections.durationPreset === preset.key ? 'primary' : 'default'}
            />
          ))}
        </Box>
        {selections.durationPreset === 'custom' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <DatePicker
              label="Start Date"
              value={selections.startDateFrom ? new Date(selections.startDateFrom) : null}
              onChange={(date) => handleSelectionChange('startDateFrom', date)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }}
            />
            <DatePicker
              label="End Date"
              value={selections.endDateTo ? new Date(selections.endDateTo) : null}
              onChange={(date) => handleSelectionChange('endDateTo', date)}
              minDate={selections.startDateFrom ? new Date(selections.startDateFrom) : null}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} fullWidth variant="outlined" /> }}
            />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );

  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'sort': return renderSortSection(section);
      case 'statusNames': return renderStatusSection(section);
      case 'roleNames': return renderRoleNamesSection(section);
      case 'departmentNames': return renderDepartmentNamesSection(section);
      case 'member': return renderMemberSection(section);
      case 'keyword': return renderKeywordSection();
      case 'duration': return renderDurationSection();
      case 'loggedAt': return renderLoggedAtSection();
      case 'loggedAtFrom': return renderLoggedAtFromSection();
      case 'loggedAtTo': return renderLoggedAtToSection();
      case 'durationFrom': return renderDurationFromSection();
      case 'isDeletedFilter': return renderIsDeletedFilterSection(section);
      default: return null;
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{ width: { xs: '100%', sm: 380 }, p: gridSpacing, display: 'flex', flexDirection: 'column', height: '100%' }}
        role="presentation"
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">Filter & Sort</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, pr: 1 }}>
          {sections.map((section) => (
            <Accordion
              key={section.key}
              expanded={expandedSections.includes(section.key)}
              onChange={handleAccordionChange(section.key)}
              disableGutters
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${section.key}-content`}
                id={`${section.key}-header`}
                sx={{
                  backgroundColor: 'action.hover',
                  minHeight: 48,
                  '&.Mui-expanded': { minHeight: 48 },
                  '& .MuiAccordionSummary-content': { my: 1 },
                }}
              >
                <Typography variant="subtitle1">{section.title}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2 }}>
                {renderSectionContent(section)}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClearFilters} variant="text" color="secondary">Clear All</Button>
          <Box>
            <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleApplyFilters} variant="contained" color="primary">Apply Filters</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
