// Goals.jsx
import React from 'react';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';



// ==============================|| GOALS PAGE ||============================== //

export default function Goals() {
  

  return (
 
    <Container 
      maxWidth="lg" // Or 'md', 'sm', 'xl', or false to disable max-width
      sx={{ 
        py: { xs: 3, md: 5 }, // Responsive vertical padding
        textAlign: 'center'  // Center-aligns the text content within the container
      }}
    >
      <Typography 
        variant="h2" // Feel free to change to h1, h3, etc. based on your page's heading hierarchy
        component="h1" // Semantic HTML tag for the main heading of this page
        gutterBottom   // Adds a small margin below the typography element
        sx={{ 
          fontWeight: 'medium', // Example: 'normal', 'bold', 'light'
          color: 'primary.main', // Example color from your theme, adjust as needed
          mb: 3 // Additional margin bottom for spacing
        }}
      >
        Goals Screen
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        This is where our Goals listings and related content will be displayed.
      </Typography>
      

    </Container>
  );
}
