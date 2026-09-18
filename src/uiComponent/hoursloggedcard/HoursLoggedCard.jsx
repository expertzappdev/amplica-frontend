import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

// Sample data structure for different filter periods
const hoursDataByPeriod = {
    "This Week": [
        { day: "Mon", hours: 4.5 }, { day: "Tue", hours: 6 }, { day: "Wed", hours: 5 },
        { day: "Thu", hours: 7.5 }, { day: "Fri", hours: 4 }, { day: "Sat", hours: 0 }, { day: "Sun", hours: 0 }
    ],
    "Last Week": [
        { day: "Mon", hours: 5 }, { day: "Tue", hours: 5.5 }, { day: "Wed", hours: 6 },
        { day: "Thu", hours: 4 }, { day: "Fri", hours: 7 }, { day: "Sat", hours: 1 }, { day: "Sun", hours: 0 }
    ],
    "This Month": [ // For "This Month", data points could be days or weeks
        { day: "Wk 1", hours: 25 }, { day: "Wk 2", hours: 30 },
        { day: "Wk 3", hours: 22 }, { day: "Wk 4", hours: 28 }
    ]
};

export default function HoursLoggedCard({ isLoading: initialLoading }) { // Can accept an initial loading prop
    const [filter, setFilter] = useState("This Week");
    const [chartData, setChartData] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [isLoading, setIsLoading] = useState(initialLoading || false); // Internal loading for filter changes

    useEffect(() => {
        // Simulate fetching/filtering data when filter changes
        setIsLoading(true);
        setTimeout(() => { // Simulate API delay
            const dataForFilter = hoursDataByPeriod[filter] || [];
            setChartData(dataForFilter);
            setTotalHours(dataForFilter.reduce((acc, entry) => acc + entry.hours, 0).toFixed(1));
            setIsLoading(false);
        }, 500);
    }, [filter]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" component="div" fontWeight="600">
                        Hours Logged
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="hours-filter-label">Period</InputLabel>
                        <Select
                            labelId="hours-filter-label"
                            id="hours-filter"
                            value={filter}
                            label="Period"
                            onChange={handleFilterChange}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="This Week">This Week</MenuItem>
                            <MenuItem value="Last Week">Last Week</MenuItem>
                            <MenuItem value="This Month">This Month</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {isLoading ? (
                    <Box sx={{ height: 270, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography>Loading data...</Typography></Box>
                ) : (
                    <>
                        <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 700, color: 'primary.main' }}>
                            {totalHours}
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', ml:0.5 }}>hrs</Typography>
                        </Typography>
                        <Box sx={{ height: 235 }}>
                            {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} />
                                    <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.75rem' }} unit="h" width={40}/>
                                    <Tooltip formatter={(value) => [`${value} hrs`, "Hours"]} />
                                    <RechartsLegend verticalAlign="top" align="right" wrapperStyle={{fontSize: '0.8rem', top: -5}}/>
                                    <Bar dataKey="hours" fill="#82ca9d" name="Logged" barSize={30} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{mt: 5, textAlign:'center'}}>No data for selected period.</Typography>
                            )}
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};