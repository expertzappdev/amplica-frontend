import React from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'; 

const TasksCard = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <Typography>Loading...</Typography>;
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.series[index],
  }));

  const legendPayload = data.labels.map((label, index) => ({
    value: `${label} (${data.series[index]}%)`,
    type: 'square',
    id: label,
    color: data.colors[index],
  }));


  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            Tasks
          </Typography>
           <FormControl size="small">
            <Select defaultValue="this_week" sx={{fontSize: '0.875rem'}}>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="this_week">This Month</MenuItem>
              <MenuItem value="this_week">This Year</MenuItem>
              {/* Add other filter options */}
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
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={data.colors[index % data.colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
           <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2, gap: '10px' }}>
            {legendPayload.map((entry) => (
              <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box sx={{ width: 10, height: 10, backgroundColor: entry.color, mr: 1 }} />
                <Typography variant="caption">{entry.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TasksCard;