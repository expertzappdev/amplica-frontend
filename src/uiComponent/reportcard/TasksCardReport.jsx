import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';

export default function TasksCardReport({ data: initialData, isLoading }) {
    const [filter, setFilter] = useState("This Week"); // Example filter state
    const [chartDisplayData, setChartDisplayData] = useState([]);
    const [legendData, setLegendData] = useState([]);

    // This useEffect would typically refetch or re-filter data based on the 'filter' state.
    // For this static example, we'll just re-map the initialData if it were structured for filtering.
    // Since initialData here is simple, the filter doesn't change the data source itself.
    useEffect(() => {
        if (initialData && initialData.labels && initialData.series && initialData.colors) {
            // If your data structure had different sets for "This Week", "This Month", etc.
            // you would select the appropriate dataset here based on `filter`.
            // For now, we use the passed initialData directly.
            const currentSeries = initialData.series;
            const currentLabels = initialData.labels;
            const currentColors = initialData.colors;

            const newChartData = currentLabels.map((label, index) => ({
                name: label,
                value: currentSeries[index],
                fill: currentColors[index % currentColors.length]
            }));
            setChartDisplayData(newChartData);

            const newLegendData = currentLabels.map((label, index) => ({
                name: `${label} (${currentSeries[index]}%)`, // As per previous TasksCard example
                color: currentColors[index % currentColors.length]
            }));
            setLegendData(newLegendData);
        }
    }, [filter, initialData]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    if (isLoading || !initialData) {
        return <Card><CardContent><Typography>Loading Tasks...</Typography></CardContent></Card>;
    }

    return (
        <Card elevation={3}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="div" fontWeight="600">Tasks Overview</Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="tasks-filter-label">Period</InputLabel>
                        <Select
                            labelId="tasks-filter-label"
                            value={filter}
                            label="Period"
                            onChange={handleFilterChange}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="This Week">This Week</MenuItem>
                            <MenuItem value="This Month">This Month</MenuItem>
                            <MenuItem value="This Year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    {chartDisplayData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={chartDisplayData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    fill="#8884d8" // Default, overridden by Cell
                                    dataKey="value"
                                    nameKey="name"
                                    labelLine={false}
                                    // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Example label
                                >
                                    {chartDisplayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{mt: 5}}>No data available.</Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: chartDisplayData.length > 0 ? 2 : 0, gap: '10px', width: '100%' }}>
                        {legendData.map((item) => (
                            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                                <Box sx={{ width: 10, height: 10, backgroundColor: item.color, mr: 0.5, borderRadius: '2px' /* square-ish */ }} />
                                <Typography variant="caption" color="textSecondary">{item.name}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}