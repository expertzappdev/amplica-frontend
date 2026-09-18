import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Grid, Paper } from '@mui/material'; // Added Paper

// Assuming gridSpacing is correctly defined elsewhere
import { gridSpacing } from '../../store/constant'; // Adjust path

// Import your cards (ensure paths are correct for your project structure)
import ProjectWorkLogReport from './ProjectWorkLogReport';
import TasksCardReport from '../../uiComponent/reportcard/TasksCardReport';
import UserReportsCards from '../../uiComponent/reportcard/UserReportsCard';
import HoursLoggedCard from '../../uiComponent/hoursloggedcard/HoursLoggedCard';
import IssueItemCard from '../../uiComponent/reportissueitem/IssueItemCard';

// Static data for the entire report page
const staticUserReportData = {
  projectWorkLog: {
    series: [44, 55, 30, 25, 15],
    labels: ["Alpha Project", "Beta Initiative", "Gamma Taskforce", "Delta Ops", "Epsilon R&D"],
    colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
  },
  tasks: {
    series: [32, 25, 25, 18],
    labels: ["Completed", "On Hold", "In Progress", "Pending"],
    colors: ["#4CAF50", "#FF9800", "#2196F3", "#F44336"]
  },
  reports: {
    achieved: [45, 52, 38, 60, 70, 65, 50],
    target: [40, 50, 45, 55, 65, 70, 60],
    labels: ["Oct 2023", "Nov 2023", "Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024"]
  },
  // HoursLoggedCard manages its own internal static data for different filters in this example
};

// Static data for the new issue items
const issueItemsData = [
  {
    id: 1,
    title: 'Make an Automatic Payment System that enable the design',
    issueNumber: '402235',
    openedAgo: '10 days ago',
    openedBy: 'Yash Ghori',
    // You can use a direct link to an image or a local import
    // For the brown silhouette avatar from the image, you might need an actual image URL or an SVG.
    // Using a placeholder from MUI for now.
    avatarSrc: 'https://mui.com/static/images/avatar/1.jpg', // Replace with actual avatar URL if available
  },
  {
    id: 2,
    title: 'Make an Automatic Payment System that enable the design',
    issueNumber: '402235',
    openedAgo: '10 days ago',
    openedBy: 'Yash Ghori',
    avatarSrc: 'https://mui.com/static/images/avatar/1.jpg', // Replace with actual avatar URL
  },
];


export default function UserReport() {
  const [isLoading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    setTimeout(() => {
        setReportData(staticUserReportData);
        setLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p:3, height: 'calc(100vh - 100px)'}}><CircularProgress /></Box>;
  }

  if (!reportData) {
    return <Typography sx={{p:3, textAlign:'center'}}>Error: User report data is not available.</Typography>;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ mb: gridSpacing/2, mt:gridSpacing/2, fontWeight: 600, color: 'text.primary' }}>
      User Activity Report
      </Typography>
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: gridSpacing }}>
        <Box
          sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <ProjectWorkLogReport data={reportData.projectWorkLog} isLoading={isLoading} />
        </Box>

        <Box
          sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <TasksCardReport data={reportData.tasks} isLoading={isLoading} />
        </Box>

        <Box
          sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <UserReportsCards data={reportData.reports} isLoading={isLoading} />
        </Box>

        <Box
          sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }}}>
          <HoursLoggedCard isLoading={isLoading} />
        </Box>
      </Box>

      {/* New Section for Issue Items */}
      <Typography variant="h5" component="h2" sx={{ mt: gridSpacing * 2, mb: gridSpacing, color: '#444' }}>
        Recent Issues
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {issueItemsData.map((item) => (
          <IssueItemCard
            key={item.id}
            title={item.title}
            issueNumber={item.issueNumber}
            openedAgo={item.openedAgo}
            openedBy={item.openedBy}
            avatarSrc={item.avatarSrc}
            // If you have a specific icon for "Yash Ghori" or this type of item, pass it as a prop
            // icon={CustomIcon}
          />
        ))}
      </Box>
    </Box>
  );
}