import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, List, ListItem, ListItemText, Box, Chip, 
  Button, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

const MyProjectCard = ({ projects, isLoading, error }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              My Projects
            </Typography>
          </Box>
          <Typography>Loading projects...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              My Projects
            </Typography>
          </Box>
          <Alert severity="error">Failed to load projects: {error}</Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    const statusMap = {
      'Completed': 'success',
      'InProgress': 'warning',
      'On Progress': 'primary',
      'Delayed': 'error',
      'InReview': 'default',
      'Open': 'info',
      'Cancelled': 'error',
      'Active': 'primary',
      'NotStarted': 'default',
    };
    return statusMap[status] || 'default';
  };

  // Determine if project is overdue
  const getProjectStatus = (project) => {
    if (project.status) return project.status;
    
    if (project.endDate) {
      try {
        const endDate = parseISO(project.endDate);
        if (isValid(endDate)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysDiff = differenceInDays(endDate, today);
          
          if (daysDiff < 0) {
            return 'Overdue';
          }
        }
      } catch (e) {
        console.error('Date parsing error:', e);
      }
    }
    
    return 'Active';
  };

  const handleShowAllProjects = () => {
    navigate('/app/project'); // Adjust the route according to your routing setup
  };

  const handleProjectClick = (project) => {
    navigate(`/app/project-detail/${project.projectId}`);
  };

  // Show only first 5 projects
  const displayProjects = (projects || []).slice(0, 5);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            My Projects
          </Typography>
          <Button
            variant="outlined"
            size="small"
            // endIcon={<ArrowForwardIcon />}
            onClick={handleShowAllProjects}
            sx={{
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              py: 0.5
            }}
          >
            Show All Projects
          </Button>
        </Box>

        <List sx={{ minHeight: 280, overflow: 'auto' }}>
          {displayProjects.length > 0 ? (
            displayProjects.map((project, index) => {
              const projectStatus = getProjectStatus(project);
              const endDate = project.endDate ? (
                isValid(parseISO(project.endDate)) 
                  ? format(parseISO(project.endDate), 'dd-MM-yyyy')
                  : project.endDate
              ) : 'No end date';
              
              return (
                <ListItem 
                  key={project.projectId || index} 
                  disablePadding 
                  sx={{ 
                    borderBottom: index < displayProjects.length - 1 ? '1px solid #eee' : 'none',
                    // py: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: '8px'
                    },
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => handleProjectClick(project)}
                >
                  <ListItemText
                    primary={project.name}
                    secondary={`Progress: ${project.progression || 0}%`}
                    primaryTypographyProps={{ 
                      variant: 'subtitle2', 
                      mb: 0.5,
                      fontWeight: 500,
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '250px',
                        '&:hover': {
                          color: 'primary.main'
                        }
                      }
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption', 
                      color: 'text.secondary' 
                    }}
                  />
                  <Box sx={{ textAlign: 'right', minWidth: 'fit-content', ml: 1 }}>
                    <Chip 
                      label={projectStatus} 
                      color={getStatusColor(projectStatus)} 
                      size="small" 
                      sx={{ 
                        mb: 0.5, 
                        fontSize: '0.7rem',
                        height: '20px'
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      display="block" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {endDate}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    No projects available
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>

        {/* Footer with total count */}
        {/* {projects && projects.length > 5 && (
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid #eee',
            textAlign: 'center'
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              Showing 5 of {projects.length} projects
            </Typography>
          </Box>
        )} */}
      </CardContent>
    </Card>
  );
};

export default MyProjectCard;
