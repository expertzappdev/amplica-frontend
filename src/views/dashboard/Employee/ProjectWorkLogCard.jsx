import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'; // Example using Recharts

const ProjectWorkLogCard = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <Typography>Loading...</Typography>; // Or a Skeleton component
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.series[index],
  }));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            Project Work Log
          </Typography>
          <FormControl size="small">
            <Select defaultValue="P" sx={{fontSize: '0.875rem'}}>
              <MenuItem value="P">Project</MenuItem>
              {/* Add other filter options if needed */}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40} // For Donut
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={data.colors[index % data.colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2, gap: '10px' }}>
            {data.labels.map((label, index) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box sx={{ width: 10, height: 10, backgroundColor: data.colors[index], mr: 1, borderRadius: '50%' }} />
                <Typography variant="caption">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectWorkLogCard;