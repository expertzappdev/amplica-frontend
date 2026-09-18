import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend as RechartsLegend } from 'recharts';

export default function ProjectWorkLogReport({ data: initialData, isLoading }) {
    const [filter, setFilter] = useState("All Projects");
    const [chartDisplayData, setChartDisplayData] = useState([]); // For recharts Pie data
    const [legendData, setLegendData] = useState([]); // For custom legend

    useEffect(() => {
        if (initialData && initialData.labels && initialData.series && initialData.colors) {
            let filteredSeries = initialData.series;
            let filteredLabels = initialData.labels;
            let filteredColors = initialData.colors;

            if (filter !== "All Projects") {
                const projectIndex = initialData.labels.indexOf(filter);
                if (projectIndex !== -1) {
                    filteredSeries = [initialData.series[projectIndex]];
                    filteredLabels = [initialData.labels[projectIndex]];
                    filteredColors = [initialData.colors[projectIndex]];
                } else {
                    // If filter doesn't match any label, show no data or handle as needed
                    filteredSeries = [];
                    filteredLabels = [];
                    filteredColors = [];
                }
            }

            const newChartData = filteredLabels.map((label, index) => ({
                name: label,
                value: filteredSeries[index],
                fill: filteredColors[index % filteredColors.length]
            }));
            setChartDisplayData(newChartData);

            const newLegendData = filteredLabels.map((label, index) => ({
                name: label,
                color: filteredColors[index % filteredColors.length]
            }));
            setLegendData(newLegendData);
        }
    }, [filter, initialData]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    if (isLoading || !initialData) {
        return <Card><CardContent><Typography>Loading Project Work Log...</Typography></CardContent></Card>;
    }

    return (
        <Card elevation={3}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="div" fontWeight="600">
                        Project Work Log
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="project-worklog-filter-label">Filter</InputLabel>
                        <Select
                            labelId="project-worklog-filter-label"
                            value={filter}
                            label="Filter"
                            onChange={handleFilterChange}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="All Projects">All Projects</MenuItem>
                            {initialData.labels && initialData.labels.map(label => (
                                <MenuItem key={label} value={label}>{label}</MenuItem>
                            ))}
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
                                    innerRadius={50} // Donut chart
                                    outerRadius={90}
                                    fill="#8884d8" // Default fill, overridden by Cell
                                    paddingAngle={chartDisplayData.length > 1 ? 2 : 0}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartDisplayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} units`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{mt: 5}}>No data for selected filter.</Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: chartDisplayData.length > 0 ? 2 : 0, gap: '10px', width: '100%' }}>
                        {legendData.map((item) => (
                            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                                <Box sx={{ width: 10, height: 10, backgroundColor: item.color, mr: 0.5, borderRadius: '50%' }} />
                                <Typography variant="caption" color="textSecondary">{item.name}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}