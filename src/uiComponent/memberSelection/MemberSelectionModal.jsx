// uiComponent/memberSelection/MemberSelectionModal.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemButton, ListItemText,
  ListItemAvatar, Avatar, TextField, InputAdornment,
  Typography, Box, CircularProgress, IconButton, Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllUsersRequest,
  setUsersQuery,
  selectUserList,
  selectUsersQuery,
  selectUserProfileLoading,
} from '../../redux/features/profile/profileSlice';
import { ROLES } from '../../utils/roles';
import { ASSETS_BASE_URL } from '../../services/apiConstants';

const modalStyle = {
  '& .MuiDialog-paper': {
    borderRadius: 2,
    maxWidth: '500px',
    width: '100%',
    maxHeight: '600px',
  },
};

const searchFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
  },
};

const memberItemStyle = {
  borderRadius: 1,
  py: 0,
  px: 0.5,
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: 'action.hover',
    borderColor: 'primary.main',
  },
};

export default function MemberSelectionModal({
  open,
  onClose,
  onConfirm,
  title = "Select Team Member",
  departmentFilter = "",
  showAllOption = false,
  multiSelect = false,
}) {
  const dispatch = useDispatch();
  
  const { items: userList, totalCount } = useSelector(selectUserList);
  const loading = useSelector(selectUserProfileLoading);
  const currentQuery = useSelector(selectUsersQuery);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalActive, setIsModalActive] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const originalQuery = useRef(null);

  const createModalQuery = useCallback((searchValue = '') => ({
    page: 1,
    pageSize: 10000,
    sortBy: 'firstName',
    sortOrder: 'asc',
    statusNames: '',
    search: searchValue,
    roleNames: '',
    departmentNames: departmentFilter,
    memberUserId: null,
  }), [departmentFilter]);

  // Initialize modal state on open
  useEffect(() => {
    if (open) {
      if (!isModalActive) {
        // Store original query to restore it later
        originalQuery.current = { ...currentQuery };
        
        // Setup modal specific query
        const modalQuery = createModalQuery('');
        dispatch(setUsersQuery(modalQuery));
        
        setIsModalActive(true);
        setSearchTerm('');
      }
    } else if (isModalActive) {
      // Modal just closed, restore original state
      if (originalQuery.current) {
        dispatch(setUsersQuery(originalQuery.current));
      }
      
      setIsModalActive(false);
      setSearchTerm('');
      originalQuery.current = null;
    }
  }, [open, isModalActive, currentQuery, createModalQuery, dispatch]);

  // Handle search (debounce is handled by the saga)
  useEffect(() => {
    if (isModalActive && open && currentQuery.search !== searchTerm) {
      const modalQuery = createModalQuery(searchTerm);
      dispatch(setUsersQuery(modalQuery));
    }
  }, [searchTerm, isModalActive, open, currentQuery?.search, createModalQuery, dispatch]);


  // Handle member selection
  const handleMemberSelect = useCallback((user) => {
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.userEmail || 'Unknown User';
    const member = {
      id: user.userId,
      name: name,
      email: user.userEmail,
      avatar: user.profilePhotoUrl
    };

    if (multiSelect) {
      if (user.userId === 'all') {
        setSelectedUsers([member]);
      } else {
        setSelectedUsers(prev => {
          // If 'all' was selected, remove it
          const currentWithoutAll = prev.filter(m => m.id !== 'all');
          const isSelected = currentWithoutAll.some(m => m.id === member.id);
          if (isSelected) {
            return currentWithoutAll.filter(m => m.id !== member.id);
          } else {
            return [...currentWithoutAll, member];
          }
        });
      }
    } else {
      onConfirm([member]);
      onClose();
    }
  }, [onConfirm, onClose, multiSelect]);

  const handleConfirmMultiSelect = () => {
    onConfirm(selectedUsers);
    onClose();
  };

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Generate user initials
  const getInitials = useCallback((firstName, lastName) => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    return `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase() || '?';
  }, []);

  // Filter users (exclude admin users) - Memoized to prevent redundant renders
  const displayUsers = useMemo(() => {
    return userList.filter(user => user.roleName !== ROLES.ADMIN);
  }, [userList]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={modalStyle}>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0 }}>
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2, ...searchFieldStyle }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
              Loading team members...
            </Typography>
          </Box>
        ) : (
          /* User List */
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {displayUsers.length > 0 ? (
              <>
                <List sx={{ px: 0 }}>
                  {showAllOption && (
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleMemberSelect({ userId: 'all', firstName: 'All', lastName: 'Members', userEmail: 'All team members' })}
                        sx={memberItemStyle}
                      >
                        {multiSelect && (
                          <Checkbox
                            edge="start"
                            checked={selectedUsers.some(m => m.id === 'all')}
                            tabIndex={-1}
                            disableRipple
                            sx={{ mr: 1 }}
                          />
                        )}
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: '#fff' }}>
                            <PeopleIcon sx={{ fontSize: '1.2rem' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              All Members
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Show combined report for all members
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                  {displayUsers.map((user) => (
                    <ListItem key={user.userId} disablePadding>
                      <ListItemButton
                        onClick={() => handleMemberSelect(user)}
                        sx={memberItemStyle}
                      > 
                        {multiSelect && (
                          <Checkbox
                            edge="start"
                            checked={selectedUsers.some(m => m.id === user.userId)}
                            tabIndex={-1}
                            disableRipple
                            sx={{ mr: 1 }}
                          />
                        )}
                        <ListItemAvatar>
                          <Avatar
                            src={user?.profilePhotoUrl ? `${ASSETS_BASE_URL}${user?.profilePhotoUrl}` : ''}
                            alt={`${user.firstName} ${user.lastName}`}
                            sx={{ 
                              width: 32, 
                              height: 32,
                              fontWeight: 600,
                              fontSize: '1rem',
                              bgcolor: 'grey.300'
                            }}
                          >
                            {getInitials(user.firstName, user.lastName)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userEmail || 'Unknown User'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {user.userEmail}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                {/* Results Summary */}
                {/* <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing {displayUsers.length} of {totalCount} team members
                    {searchTerm && ` matching "${searchTerm}"`}
                  </Typography>
                </Box> */}
              </>
            ) : (
              /* Empty State */
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'grey.50',
                borderRadius: 1
              }}>
                <PersonIcon sx={{ fontSize: '48px', color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {searchTerm ? 'No members found' : 'No team members available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 
                    `No results found for "${searchTerm}". Try a different search term.` : 
                    'Please contact your administrator to add team members.'
                  }
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {multiSelect && (
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit" variant="text">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmMultiSelect} 
            color="primary" 
            variant="contained"
            disabled={selectedUsers.length === 0}
          >
            Confirm Selection {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
