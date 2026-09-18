import React, { useState, useEffect, useCallback } from 'react';
import {
    Drawer, Box, Typography, Button, IconButton, Divider, List, ListItem, ListItemAvatar,
    Avatar, ListItemText, Checkbox, TextField, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';

import {
    selectUserList,
    selectUsersQuery,
    getAllUsersRequest,
    setUsersQuery
} from '../../redux/features/profile/profileSlice';

import {
    addProjectMemberRequest,
    selectIsManagingMembers
} from '../../redux/features/projects/projectSlice';

import { gridSpacing } from '../../store/constant';
import { ASSETS_BASE_URL } from '../../services/apiConstants';


const AddMemberDrawer = ({ open, onClose, projectId, projectMembers = [] }) => {
    const dispatch = useDispatch();

    // Select users and current query from Redux store
    const { items: allUsers, totalCount } = useSelector(selectUserList);
    const query = useSelector(selectUsersQuery) || { page: 1, pageSize: 1000, search: '' };

      const createModalQuery = useCallback((searchValue = '') => ({
        page: 1,
        pageSize: 10000,
        sortBy: '',
        sortOrder: '',
        statusNames: '',
        search: searchValue,
        roleNames: '',
        departmentNames: '',
        memberUserId: null,
      }), []);
    
      useEffect(() => {
        if (open) {
          const modalQuery = createModalQuery();
          dispatch(setUsersQuery(modalQuery));          
        }
      }, [open, createModalQuery, dispatch]);

    const isAdding = useSelector(selectIsManagingMembers);

    // Local state to manage selected users and search input
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(query.search || '');

    // When drawer opens or query changes, fetch users according to current query
    useEffect(() => {
        if (open) {
            dispatch(getAllUsersRequest(query));
        }
    }, [open, dispatch, query]);

    // Sync local searchTerm if query.search changes (optional)
    useEffect(() => {
        setSearchTerm(query.search || '');
    }, [query.search]);

    // Handle search input: update local state and dispatch Redux query update
    const handleSearchChange = (e) => {
        const newSearch = e.target.value;
        setSearchTerm(newSearch);
        dispatch(setUsersQuery({ ...query, search: newSearch, page: 1, pageSize: 1000 }));
    };

    const handleToggle = (userId) => () => {
        const currentIndex = selectedUsers.indexOf(userId);
        const newSelected = [...selectedUsers];

        if (currentIndex === -1) {
            newSelected.push(userId);
        } else {
            newSelected.splice(currentIndex, 1);
        }

        setSelectedUsers(newSelected);
    };

    const handleAddMembers = () => {
        selectedUsers.forEach(userId => {
            dispatch(addProjectMemberRequest({ projectId, userId }));
        });
        onClose();
        setSelectedUsers([]);
    };

    // Exclude users already members of the project
    const existingMemberIds = projectMembers.map(member => member.id);
    const availableUsers = allUsers.filter(user => !existingMemberIds.includes(user.userId));

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: { xs: '100%', sm: 400 },
                    p: gridSpacing,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="h2">Add Members</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Search Input */}
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search Members"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ mb: 2 }}
                />

                {/* User List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <List dense>
                        {availableUsers.map(user => (
                            <ListItem
                                key={user.userId}
                                secondaryAction={
                                    <Checkbox
                                        edge="end"
                                        onChange={handleToggle(user.userId)}
                                        checked={selectedUsers.indexOf(user.userId) !== -1}
                                    />
                                }
                                disablePadding
                                button
                                onClick={handleToggle(user.userId)}
                            >
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
                          ></Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${user.firstName} ${user.lastName}`}
                                    secondary={user.userEmail}
                                />
                            </ListItem>
                        ))}
                        {/* Show a message if no users found */}
                        {availableUsers.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                No users found.
                            </Typography>
                        )}
                    </List>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        mt: 'auto',
                        pt: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>

                    <Button
                        onClick={handleAddMembers}
                        variant="contained"
                        color="primary"
                        disabled={isAdding || selectedUsers.length === 0}
                    >
                        {isAdding ? <CircularProgress size={24} /> : `Add (${selectedUsers.length})`}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default AddMemberDrawer;
