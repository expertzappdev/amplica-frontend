import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Paper, CircularProgress,
  Grid, Card, CardContent, Switch, FormControlLabel, TextField,
  Select, MenuItem, FormControl, InputLabel, Divider, Chip,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorageIcon from '@mui/icons-material/Storage';
import EmailIcon from '@mui/icons-material/Email';
import PaletteIcon from '@mui/icons-material/Palette';

import ViewHeader from '../../uiComponent/viewheader';
import Can from '../../uiComponent/Can';
import { gridSpacing } from '../../store/constant';
import toast from 'react-hot-toast';

// Dummy settings data - replace with actual API when available
const DUMMY_SETTINGS = {
  general: {
    appName: "Task Manager Pro",
    appDescription: "Professional task management solution",
    timezone: "UTC",
    dateFormat: "MM-DD-YYYY",
    timeFormat: "12",
    language: "en",
    currency: "USD"
  },
  security: {
    requireTwoFactor: false,
    passwordMinLength: 8,
    passwordExpiration: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    accountLockoutDuration: 15
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    projectUpdates: true,
    systemAlerts: true,
    digestFrequency: "daily"
  },
  storage: {
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png"],
    storageQuota: 1000,
    autoDeleteOldFiles: false,
    retentionPeriod: 365
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "tls",
    fromEmail: "noreply@taskmanager.com",
    fromName: "Task Manager"
  },
  theme: {
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
    darkMode: false,
    compactMode: false,
    showAvatars: true,
    animationsEnabled: true
  }
};

export default function AppSettingsView() {
  // State management
  const [settings, setSettings] = useState(DUMMY_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DUMMY_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanged);
  }, [settings, originalSettings]);

  // Handle setting change
  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSettings(originalSettings);
    setIsResetDialogOpen(false);
    toast.info('Settings reset to last saved state');
  };

  // Handle reset to defaults
  const handleResetToDefaults = () => {
    setSettings(DUMMY_SETTINGS);
    setIsResetDialogOpen(false);
    toast.info('Settings reset to defaults');
  };

  // Settings sections configuration
  const settingSections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <SettingsIcon />,
      description: 'Basic application configuration'
    },
    {
      id: 'security',
      title: 'Security & Authentication',
      icon: <SecurityIcon />,
      description: 'Security policies and authentication settings'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <NotificationsIcon />,
      description: 'Email and push notification preferences'
    },
    {
      id: 'storage',
      title: 'Storage & Files',
      icon: <StorageIcon />,
      description: 'File upload and storage configuration'
    },
    {
      id: 'email',
      title: 'Email Configuration',
      icon: <EmailIcon />,
      description: 'SMTP and email delivery settings'
    },
    {
      id: 'theme',
      title: 'Appearance',
      icon: <PaletteIcon />,
      description: 'Theme and visual customization'
    }
  ];

  // Render general settings
  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Application Name"
          value={settings.general.appName}
          onChange={(e) => handleSettingChange('general', 'appName', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={settings.general.timezone}
            label="Timezone"
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <MenuItem value="UTC">UTC</MenuItem>
            <MenuItem value="EST">Eastern Time</MenuItem>
            <MenuItem value="PST">Pacific Time</MenuItem>
            <MenuItem value="GMT">Greenwich Mean Time</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Application Description"
          value={settings.general.appDescription}
          onChange={(e) => handleSettingChange('general', 'appDescription', e.target.value)}
          multiline
          rows={3}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Date Format</InputLabel>
          <Select
            value={settings.general.dateFormat}
            label="Date Format"
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
          >
            <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
            <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Time Format</InputLabel>
          <Select
            value={settings.general.timeFormat}
            label="Time Format"
            onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
          >
            <MenuItem value="12">12 Hour</MenuItem>
            <MenuItem value="24">24 Hour</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={settings.general.language}
            label="Language"
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Render security settings
  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.security.requireTwoFactor}
              onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
            />
          }
          label="Require Two-Factor Authentication"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Minimum Password Length"
          value={settings.security.passwordMinLength}
          onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Password Expiration (days)"
          value={settings.security.passwordExpiration}
          onChange={(e) => handleSettingChange('security', 'passwordExpiration', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Session Timeout (minutes)"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Max Login Attempts"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  // Render notification settings
  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
          }
          label="Enable Email Notifications"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            />
          }
          label="Enable Push Notifications"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.taskReminders}
              onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
            />
          }
          label="Task Due Date Reminders"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications.projectUpdates}
              onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
            />
          }
          label="Project Update Notifications"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Digest Frequency</InputLabel>
          <Select
            value={settings.notifications.digestFrequency}
            label="Digest Frequency"
            onChange={(e) => handleSettingChange('notifications', 'digestFrequency', e.target.value)}
          >
            <MenuItem value="hourly">Hourly</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="never">Never</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Render storage settings
  const renderStorageSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Max File Size (MB)"
          value={settings.storage.maxFileSize}
          onChange={(e) => handleSettingChange('storage', 'maxFileSize', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Storage Quota (GB)"
          value={settings.storage.storageQuota}
          onChange={(e) => handleSettingChange('storage', 'storageQuota', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Allowed File Types
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {settings.storage.allowedFileTypes.map((type) => (
            <Chip key={type} label={type.toUpperCase()} size="small" />
          ))}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.storage.autoDeleteOldFiles}
              onChange={(e) => handleSettingChange('storage', 'autoDeleteOldFiles', e.target.checked)}
            />
          }
          label="Auto-delete old files"
        />
      </Grid>
      {settings.storage.autoDeleteOldFiles && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Retention Period (days)"
            value={settings.storage.retentionPeriod}
            onChange={(e) => handleSettingChange('storage', 'retentionPeriod', parseInt(e.target.value))}
            variant="outlined"
          />
        </Grid>
      )}
    </Grid>
  );

  // Render email settings
  const renderEmailSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Host"
          value={settings.email.smtpHost}
          onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="SMTP Port"
          value={settings.email.smtpPort}
          onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SMTP Username"
          value={settings.email.smtpUsername}
          onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="password"
          label="SMTP Password"
          value={settings.email.smtpPassword}
          onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="From Email"
          value={settings.email.fromEmail}
          onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="From Name"
          value={settings.email.fromName}
          onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  // Render theme settings
  const renderThemeSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.darkMode}
              onChange={(e) => handleSettingChange('theme', 'darkMode', e.target.checked)}
            />
          }
          label="Dark Mode"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.compactMode}
              onChange={(e) => handleSettingChange('theme', 'compactMode', e.target.checked)}
            />
          }
          label="Compact Mode"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.showAvatars}
              onChange={(e) => handleSettingChange('theme', 'showAvatars', e.target.checked)}
            />
          }
          label="Show User Avatars"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.animationsEnabled}
              onChange={(e) => handleSettingChange('theme', 'animationsEnabled', e.target.checked)}
            />
          }
          label="Enable Animations"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Primary Color"
          type="color"
          value={settings.theme.primaryColor}
          onChange={(e) => handleSettingChange('theme', 'primaryColor', e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Secondary Color"
          type="color"
          value={settings.theme.secondaryColor}
          onChange={(e) => handleSettingChange('theme', 'secondaryColor', e.target.value)}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  // Render settings content based on active tab
  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'storage':
        return renderStorageSettings();
      case 'email':
        return renderEmailSettings();
      case 'theme':
        return renderThemeSettings();
      default:
        return renderGeneralSettings();
    }
  };

  // Header actions
  const renderHeaderActions = () => (
    <>
      <Button
        variant="outlined"
        startIcon={<RestoreIcon />}
        onClick={() => setIsResetDialogOpen(true)}
        disabled={!hasChanges}
        sx={{ borderRadius: '8px', height: '36.5px' }}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={!hasChanges || isLoading}
        sx={{ borderRadius: '8px', height: '36.5px' }}
      >
        {isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
      </Button>
    </>
  );

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: gridSpacing / 2
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          App Settings
        </Typography>
      </Box>

      <ViewHeader title="General Settings">
        {renderHeaderActions()}
      </ViewHeader>

      {hasChanges && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          You have unsaved changes. Don't forget to save your settings.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: gridSpacing / 2 }}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Settings Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {settingSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeTab === section.id ? 'contained' : 'text'}
                  startIcon={section.icon}
                  onClick={() => setActiveTab(section.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    borderRadius: 2
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {section.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.description}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {settingSections.find(s => s.id === activeTab)?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {settingSections.find(s => s.id === activeTab)?.description}
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {renderSettingsContent()}
          </Paper>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onClose={() => setIsResetDialogOpen(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            What would you like to do?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="warning">
            Reset to Last Saved
          </Button>
          <Button onClick={handleResetToDefaults} color="error">
            Reset to Defaults
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
