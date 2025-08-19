import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { TrafficSource, Period } from '../../types/dashboard';

interface TrafficSourcesChartProps {
  data: TrafficSource[];
  period: Period;
  detailed?: boolean;
}

export const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ 
  data, 
  period, 
  detailed = false 
}) => {
  const filteredData = data.filter(
    d => d.quarter === period.quarter && d.year === period.year
  );

  // Aggregate data for pie chart
  const aggregatedData = {
    directTraffic: 0,
    searchEngines: 0,
    internalReferrers: 0,
    externalReferrers: 0,
    socialMedia: 0
  };

  filteredData.forEach(d => {
    aggregatedData.directTraffic += d.directTraffic;
    aggregatedData.searchEngines += d.searchEngines;
    aggregatedData.internalReferrers += d.internalReferrers;
    aggregatedData.externalReferrers += d.externalReferrers;
    aggregatedData.socialMedia += d.socialMedia;
  });

  const pieData = [
    { name: 'Direct Traffic', value: aggregatedData.directTraffic, color: '#005C84' },
    { name: 'Search Engines', value: aggregatedData.searchEngines, color: '#55A51C' },
    { name: 'Internal Referrers', value: aggregatedData.internalReferrers, color: '#4A90E2' },
    { name: 'External Referrers', value: aggregatedData.externalReferrers, color: '#F5A623' },
    { name: 'Social Media', value: aggregatedData.socialMedia, color: '#BD10E0' }
  ];

  const monthlyData = filteredData.map(d => ({
    month: d.monthName,
    'Direct Traffic': d.directTraffic,
    'Search Engines': d.searchEngines,
    'Internal Referrers': d.internalReferrers,
    'External Referrers': d.externalReferrers,
    'Social Media': d.socialMedia
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{payload[0].name}</p>
          <p className="text-xs">
            <span className="font-medium">{payload[0].value.toFixed(1)}%</span> of traffic
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Traffic Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Direct Traffic" stackId="a" fill="#005C84" />
                  <Bar dataKey="Search Engines" stackId="a" fill="#55A51C" />
                  <Bar dataKey="Internal Referrers" stackId="a" fill="#4A90E2" />
                  <Bar dataKey="External Referrers" stackId="a" fill="#F5A623" />
                  <Bar dataKey="Social Media" stackId="a" fill="#BD10E0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};