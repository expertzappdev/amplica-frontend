import React from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Example using Recharts

const ReportsCard = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <Typography>Loading...</Typography>;
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    Achieved: data.achieved[index],
    Target: data.target[index],
  }));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            Reports
          </Typography>
          <FormControl size="small">
            <Select defaultValue="this_week" sx={{fontSize: '0.875rem'}}>
              <MenuItem value="this_week">This Week</MenuItem>
              {/* Add other filter options */}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} />
              <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} />
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, marginRight: '10px', fontSize: '0.8rem' }}>{value}</span>
                )}
              />
              <Line type="monotone" dataKey="Achieved" stroke="#FF6384" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Achieved" />
              <Line type="monotone" dataKey="Target" stroke="#36A2EB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsCard;