import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

export default function ReportsCard({ data: initialData, isLoading }) {
    const [filter, setFilter] = useState("Last 6 Months"); // Example filter
    const [chartDisplayData, setChartDisplayData] = useState([]);

    // Simulate filtering or data transformation based on filter
    useEffect(() => {
        if (initialData && initialData.labels && initialData.achieved && initialData.target) {
            // In a real app, 'filter' would change which data segment is used.
            // For this example, we'll just use the full initialData regardless of filter,
            // but you'd slice or fetch new data here.
            const currentLabels = initialData.labels; // Apply filter logic here
            const currentAchieved = initialData.achieved;
            const currentTarget = initialData.target;

            const newChartData = currentLabels.map((label, index) => ({
                name: label,
                Achieved: currentAchieved[index],
                Target: currentTarget[index],
            }));
            setChartDisplayData(newChartData);
        }
    }, [filter, initialData]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    if (isLoading || !initialData) {
        return <Card><CardContent><Typography>Loading Reports...</Typography></CardContent></Card>;
    }

    return (
        <Card elevation={3}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="div" fontWeight="600">
                        Performance Metrics
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="reports-filter-label">Period</InputLabel>
                        <Select
                            labelId="reports-filter-label"
                            value={filter}
                            label="Period"
                            onChange={handleFilterChange}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="This Week">This Week</MenuItem>
                            <MenuItem value="This Month">This Month</MenuItem>
                            <MenuItem value="Last 6 Months">Last 6 Months</MenuItem>
                            <MenuItem value="This Year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ height: 280 }}>
                    {chartDisplayData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartDisplayData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} />
                                <Tooltip />
                                <RechartsLegend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '0.8rem'}}/>
                                <Line type="monotone" dataKey="Achieved" stroke="#36A2EB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Achieved" />
                                <Line type="monotone" dataKey="Target" stroke="#FF6384" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Target" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <Typography variant="body2" color="textSecondary" sx={{mt: 5, textAlign:'center'}}>No data for selected filter.</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};