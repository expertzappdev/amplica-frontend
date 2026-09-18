import { useEffect, useRef, useState, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import toast from 'react-hot-toast';
import { ASSETS_BASE_URL } from '../../../../services/apiConstants';

// project imports
import MainCard from 'uiComponent/cards/MainCard';
import Transitions from 'uiComponent/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { useNavigate } from 'react-router-dom';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { IconShield } from '@tabler/icons-react';

import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest, selectIsAuthenticated, selectUser } from '../../../../redux/features/auth/authSlice';
import { selectUserProfile, getUserProfileRequest } from '../../../../redux/features/profile/profileSlice';
import { ROLES } from '../../../../utils/roles';

// ==============================|| PROFILE MENU ||============================== //

const generateInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
};

const generateAvatarColor = (name) => {
    const colors = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
        '#ff5722', '#795548', '#9e9e9e', '#607d8b'
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return colors[hash % colors.length];
};

const ProfileAvatar = ({ src, firstName, lastName, size = 140, ...props }) => {
    const initials = generateInitials(firstName, lastName);
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const backgroundColor = generateAvatarColor(name);
    
    const hasValidImage = src && 
        !src.includes('user-round.svg');
    
    return (
        <Avatar
            src={hasValidImage ? src : undefined}
            alt={name}
            sx={{ 
                width: size, 
                height: size, 
                fontSize: size / 3,
                fontWeight: 600,
                backgroundColor: hasValidImage ? 'transparent' : backgroundColor,
                color: 'white',
                border: `4px solid white`, 
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                ...props.sx
            }}
            {...props}
        >
            {!hasValidImage && initials}
        </Avatar>
    );
};

export default function ProfileSection() {
  const theme = useTheme();
  const { borderRadius } = useConfig();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userProfile = useSelector(selectUserProfile);
  const loggedInUser = useSelector(selectUser);

  const isSuperAdmin = useMemo(() => {
      return loggedInUser?.role === ROLES.SUPER_ADMIN || 
             loggedInUser?.roleName === ROLES.SUPER_ADMIN;
  }, [loggedInUser]);

  const getDisplaySubtitle = useMemo(() => {
      if (isSuperAdmin) {
          return 'System Admin';
      }
      return userProfile?.departmentName || 'System User';
  }, [isSuperAdmin, userProfile]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleAccountSettings = () => {
    if (loggedInUser?.role === ROLES.SUPER_ADMIN) {
      navigate('/super-admin/profile');
    } else {
      navigate('/app/profile');
    }
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  useEffect(() => {
      if (loggedInUser?.id) {
          dispatch(getUserProfileRequest({ 
              userId: loggedInUser.id,
              onFailure: (error) => {
                  console.error('Failed to load profile:', error);
              }
          }));
      }
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
      if (userProfile) {
          const imageUrl = userProfile.profilePhotoUrl;
          if (imageUrl ) {
              setProfileImage(imageUrl.startsWith('http') ? imageUrl : `${ASSETS_BASE_URL}${imageUrl}`);
          } else {
              setProfileImage(null);
          }
      }
  }, [userProfile]);

  return (
    <>
      <Chip
        sx={{
          ml: 2,
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={profileImage}
            alt="User-images"
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
        aria-label="user-account"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 14]
                    }
                }
            ]
        }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <ProfileAvatar
                                src={profileImage}
                                firstName={userProfile?.firstName || 'User'}
                                lastName={userProfile?.lastName || 'Name'}
                                size={48}
                            />
                          <Stack>
                            <Typography variant="h4">
                              {userProfile?.firstName || ''} {userProfile?.lastName || ''}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {isSuperAdmin && (
                                <IconShield 
                                  size={16} 
                                  stroke={1.5} 
                                  style={{ color: theme.palette.primary.main }} 
                                />
                              )}
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  color: isSuperAdmin ? 'primary.main' : 'text.secondary',
                                  fontWeight: isSuperAdmin ? 600 : 400
                                }}
                              >
                                {getDisplaySubtitle}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        p: 1,
                        width: '100%',
                        maxWidth: 350,
                        minWidth: 250,
                      }}
                    >
                      <List component="nav">
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleAccountSettings}>
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Account Settings</Typography>} />
                        </ListItemButton>
                        
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
