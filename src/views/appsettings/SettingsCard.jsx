import React from 'react';
import {
  Card, CardContent, CardHeader, Typography, Box, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function SettingsCard({ 
  title, 
  description, 
  icon, 
  children, 
  expanded = true, 
  onExpandChange 
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={icon}
        title={title}
        subheader={description}
        action={
          onExpandChange && (
            <ExpandMore
              expand={expanded}
              onClick={() => onExpandChange(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          )
        }
      />
      {expanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
