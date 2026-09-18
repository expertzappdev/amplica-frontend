import React, { useMemo } from 'react';
import { 
  Card, CardContent, Box, Typography, Paper, Grid, Chip, Avatar
} from '@mui/material';
import { 
  Flag as MissionIcon, 
  Lightbulb as VisionIcon, 
  TrendingUp as GoalIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useTheme } from '@mui/material/styles';

const MissionVisionGoalsCard = ({ company, isLoading }) => {
  const theme = useTheme();

  const getRandomCoreValue = useMemo(() => {
    if (company?.coreValues && Array.isArray(company.coreValues) && company.coreValues.length > 0) {
      const randomIndex = Math.floor(Math.random() * company.coreValues.length);
      return company.coreValues[randomIndex];
    }
    return null;
  }, [company?.coreValues]);

  const getCompanyInitials = (companyName) => {
    if (!companyName) return 'C';
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // const cardData = [
  //   {
  //     type: 'mission',
  //     title: 'OUR MISSION',
  //     content: company?.mission || 'Define your mission statement to guide your organization\'s purpose and direction.',
  //     icon: MissionIcon,
  //     color: '#2196F3', 
  //     bgColor: 'rgba(33, 150, 243, 0.1)',
  //     gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  //   },
  //   {
  //     type: 'vision',
  //     title: 'OUR VISION',
  //     content: company?.vision || 'Define your vision statement to describe what your organization aspires to become.',
  //     icon: VisionIcon,
  //     color: '#FF9800',
  //     bgColor: 'rgba(255, 152, 0, 0.1)',
  //     gradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
  //   },
  //   {
  //     type: 'focus',
  //     title: 'CORE FOCUS',
  //     content: company?.goal || 'Define your core focus to establish the primary areas of concentration for your organization.',
  //     icon: GoalIcon,
  //     color: '#4CAF50',
  //     bgColor: 'rgba(76, 175, 80, 0.1)',
  //     gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  //   }
  // ];

  const cardData = [
    {
      type: 'core_value',
      title: 'CORE VALUE',
      content: getRandomCoreValue || 'Define your core values to guide your organization\'s purpose and direction',
      icon: SparkleIcon,
      color: '#6053db',
      bgColor: 'rgba(96, 83, 219, 0.08)',
      gradient: 'linear-gradient(135deg, #6053db 0%, #764ba2 100%)',
    },
    {
      type: 'vision',
      title: 'OUR VISION',
      content: company?.vision || 'Define your vision statement to describe what your organization aspires to become.',
      icon: VisionIcon,
      color: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      gradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
    },
    {
      type: 'focus',
      title: 'CORE FOCUS',
      content: company?.goal || 'Define your core focus to establish the primary areas of concentration for your organization.',
      icon: GoalIcon,
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    }
  ];

  if (isLoading) {
    return (
      <Card 
        variant="outlined"
        sx={{ 
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Loading company information...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card 
      variant="outlined"
      sx={{ 
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.02)',
          opacity: 0.5
        }}
      />
      
      <CardContent sx={{ p: 4, position: 'relative' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>       
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {company?.companyName || 'Your Company'}
          </Typography>

          {/* ---- Chip showing getRandomCoreValue: Comment this out to hide ---- */}
          {/* 
          {getRandomCoreValue && (
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<SparkleIcon sx={{ fontSize: '1rem' }} />}
                label={`${getRandomCoreValue}`}
                variant="outlined"
                sx={{
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: 'primary.main',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'primary.main'
                  }
                }}
              />
            </Box>
          )}
          */}

          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              opacity: 0.8
            }}
          >
            {/* Mission • Vision • Focus */}
            Values • Vision • Focus
          </Typography>
        </Box>


        <Grid container spacing={3}>
          {cardData.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <Grid item size={{ xs: 12, md: 4, lg: 4 }} key={item.type}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`
                      : item.bgColor,
                    border: `1px solid ${item.color}20`,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                        : `${item.color}12`,
                      borderColor: `${item.color}40`,
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${item.color}20`
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -40,
                      right: -40,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${item.color}10 0%, transparent 70%)`,
                      opacity: 0.6,
                      transition: 'all 0.4s ease'
                    }}
                  />
                  
                  {/* Content */}
                  <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Enhanced header with icon and title */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      gap: 2
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 52,
                        height: 52,
                        borderRadius: '16px',
                        background: item.gradient,
                        color: 'white',
                        boxShadow: `0 8px 24px ${item.color}40`,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(10deg) scale(1.1)'
                        }
                      }}>
                        <IconComponent sx={{ fontSize: '1.5rem' }} />
                      </Box>
                      
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 700,
                            color: item.color,
                            letterSpacing: '0.5px',
                            fontSize: '0.95rem'
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Show getRandomCoreValue in content (already handled via cardData above) */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        lineHeight: 1.7,
                        fontSize: '0.9rem',
                        fontWeight: 400,
                        flex: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        opacity: 0.9
                      }}
                    >
                      {item.content}
                    </Typography>

                    <Box
                      sx={{
                        width: '100%',
                        height: '3px',
                        background: item.gradient,
                        borderRadius: '2px',
                        mt: 2,
                        transition: 'transform 0.3s ease',
                        transformOrigin: 'left',
                        transform: 'scaleX(0.3)',
                        '&:hover': {
                          transform: 'scaleX(1)'
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MissionVisionGoalsCard;
