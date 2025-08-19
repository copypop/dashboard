import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { WebsiteData, Period } from '../../types/dashboard';
import { DataProcessor } from '../../utils/dataProcessor';

interface WebsiteChartProps {
  data: WebsiteData[];
  period: Period;
  detailed?: boolean;
}

export const WebsiteChart: React.FC<WebsiteChartProps> = ({ data, period, detailed = false }) => {
  const filteredData = data.filter(
    d => d.quarter === period.quarter && d.year === period.year
  );

  const chartData = filteredData.map(d => ({
    month: d.monthName,
    sessions: d.sessions || 0,
    pageviews: d.pageviews || 0,
    uniqueVisitors: d.uniqueVisitors || 0,
    bounceRate: d.bounceRate || 0
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between space-x-4 text-xs">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">
                {entry.name === 'bounceRate' 
                  ? `${entry.value.toFixed(1)}%`
                  : DataProcessor.formatNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005C84" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#005C84" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55A51C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#55A51C" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#005C84"
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#55A51C"
                  fillOpacity={1}
                  fill="url(#colorPageviews)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bounce Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bounceRate"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sessions" fill="#005C84" radius={[4, 4, 0, 0]} />
            <Bar dataKey="uniqueVisitors" fill="#55A51C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};