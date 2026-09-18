// ProgressDisplay.js
import React from 'react';
import { Box, LinearProgress, CircularProgress, Typography } from '@mui/material';

const ProgressDisplay = ({
  variant = 'linear',
  value = 0,
  showValueLabel = true,
  size = 40,
  thickness = 3.6,
  linearColor = 'primary',
  circularColor = 'primary',
  valueLabelVariant = 'caption',
  sx,
  ...rest
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const progressLabel = `${Math.round(clampedValue)}%`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: variant === 'linear' ? '100%' : 'auto',
        ...sx,
      }}
    >
      {variant === 'linear' && (
        <Box sx={{ width: '100%', mr: showValueLabel ? 1 : 0, display: 'flex', alignItems: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={clampedValue}
            color={linearColor}
            sx={{ flexGrow: 1, height: '8px', borderRadius: '4px' }}
            {...rest}
          />
          {showValueLabel && (
            <Typography variant={valueLabelVariant} color="text.secondary" sx={{ minWidth: 35, textAlign: 'right', ml:1 }}>
              {progressLabel}
            </Typography>
          )}
        </Box>
      )}

      {variant === 'circular' && (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={clampedValue}
            size={size}
            thickness={thickness}
            color={circularColor}
            {...rest}
          />
          {showValueLabel && (
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant={valueLabelVariant} component="div" color="text.secondary">
                {progressLabel}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/*
// How to use ProgressDisplay:
//
// import ProgressDisplay from './ProgressDisplay'; // Adjust path
// import { Grid, Paper, Typography } from '@mui/material'; // For demo
//
// function MyProgressDemo() {
//   const [progress, setProgress] = React.useState(10);
//
//   React.useEffect(() => {
//     const timer = setInterval(() => {
//       setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
//     }, 800);
//     return () => {
//       clearInterval(timer);
//     };
//   }, []);
//
//   return (
//     <Paper sx={{ p: 3, m: 2 }}>
//       <Typography variant="h5" gutterBottom>Progress Indicators</Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Typography variant="subtitle1">Linear Progress</Typography>
//           <ProgressDisplay variant="linear" value={progress} linearColor="secondary" />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <Typography variant="subtitle1">Linear Progress (No Label)</Typography>
//           <ProgressDisplay variant="linear" value={75} showValueLabel={false} />
//         </Grid>
//         <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
//           <Typography variant="subtitle1">Circular Progress</Typography>
//           <ProgressDisplay variant="circular" value={progress} size={60} thickness={5} circularColor="success" />
//         </Grid>
//         <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
//           <Typography variant="subtitle1">Circular (No Label)</Typography>
//           <ProgressDisplay variant="circular" value={33} showValueLabel={false} size={50} circularColor="warning"/>
//         </Grid>
//       </Grid>
//     </Paper>
//   );
// }
*/

export default ProgressDisplay;