import PropTypes from 'prop-types';
import { memo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { linearProgressClasses } from '@mui/material/LinearProgress';

// assets
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// ==============================|| PROGRESS BAR WITH LABEL ||============================== //

function LinearProgressWithLabel({ value, ...others }) {
  return (
    <Grid container direction="column" spacing={1} sx={{ mt: 1.5 }}>
      <Grid>
        <Grid container sx={{ justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h6" sx={{ color: 'primary.800' }}>
              System Health
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="h6" color="inherit">{`${Math.round(value)}%`}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        <LinearProgress
          aria-label="system health progress"
          variant="determinate"
          value={value}
          {...others}
          sx={{
            height: 10,
            borderRadius: 30,
            [`&.${linearProgressClasses.colorPrimary}`]: {
              bgcolor: 'background.paper'
            },
            [`& .${linearProgressClasses.bar}`]: {
              borderRadius: 5,
              bgcolor: 'secondary.dark'
            }
          }}
        />
      </Grid>
    </Grid>
  );
}

// ==============================|| SUPER ADMIN SIDEBAR - MENU CARD ||============================== //

function SuperAdminMenuCard() {
  const theme = useTheme();

  // return (
  //   <Card
  //     sx={{
  //       bgcolor: 'secondary.light',
  //       mb: 2.75,
  //       overflow: 'hidden',
  //       position: 'relative',
  //       '&:after': {
  //         content: '""',
  //         position: 'absolute',
  //         width: 157,
  //         height: 157,
  //         bgcolor: 'secondary.200',
  //         borderRadius: '50%',
  //         top: -105,
  //         right: -96
  //       }
  //     }}
  //   >
  //     <Box sx={{ p: 2 }}>
  //       <List disablePadding sx={{ pb: 1 }}>
  //         <ListItem alignItems="flex-start" disableGutters disablePadding>
  //           <ListItemAvatar sx={{ mt: 0 }}>
  //             <Avatar
  //               variant="rounded"
  //               sx={{
  //                 ...theme.typography.commonAvatar,
  //                 ...theme.typography.largeAvatar,
  //                 color: 'secondary.main',
  //                 border: 'none',
  //                 borderColor: 'secondary.main',
  //                 bgcolor: 'background.paper'
  //               }}
  //             >
  //               <AdminPanelSettingsIcon fontSize="inherit" />
  //             </Avatar>
  //           </ListItemAvatar>
  //           <ListItemText
  //             sx={{ mt: 0 }}
  //             primary={
  //               <Typography variant="subtitle1" sx={{ color: 'secondary.800' }}>
  //                 Super Admin Panel
  //               </Typography>
  //             }
  //             secondary={<Typography variant="caption">Monitoring System</Typography>}
  //           />
  //         </ListItem>
  //       </List>
  //       <LinearProgressWithLabel value={92} />
  //     </Box>
  //   </Card>
  // );

  return (null)
}

export default memo(SuperAdminMenuCard);

LinearProgressWithLabel.propTypes = { value: PropTypes.number, others: PropTypes.any };
