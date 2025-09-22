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
  AreaChart,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EventsData, Period } from '../../types/dashboard';
import { DataProcessor } from '../../utils/dataProcessor';

interface EventsChartProps {
  data: EventsData[];
  period: Period;
  detailed?: boolean;
}

export const EventsChart: React.FC<EventsChartProps> = ({ data, period, detailed = false }) => {
  console.log('EventsChart - data length:', data.length);
  console.log('EventsChart - period:', period);
  console.log('EventsChart - first few data items:', data.slice(0, 3));

  const filteredData = data.filter(d => {
    if (period.quarter) {
      // Filter by specific quarter
      return d.quarter === period.quarter && d.year === period.year;
    } else {
      // Show all quarters for the year
      return d.year === period.year;
    }
  });

  console.log('EventsChart - filteredData length:', filteredData.length);
  console.log('EventsChart - filteredData:', filteredData);

  const hasData = filteredData.some(d => d.registered !== null);

  // Aggregate data by month to handle multiple events per month
  const monthlyAggregated = filteredData.reduce((acc, d) => {
    const monthKey = `${d.month}-${d.monthName}`;
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: d.month,
        monthName: d.monthName,
        events: 0,
        registered: 0,
        attended: 0,
        mql: 0,
        sal: 0,
        opportunity: 0
      };
    }

    acc[monthKey].events += d.numberEvents || 0;
    acc[monthKey].registered += d.registered || 0;
    acc[monthKey].attended += d.attended || 0;
    acc[monthKey].mql += d.mql || 0;
    acc[monthKey].sal += d.sal || 0;
    acc[monthKey].opportunity += d.opportunity || 0;

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and sort by month number
  const chartData = Object.values(monthlyAggregated)
    .sort((a: any, b: any) => a.month - b.month)
    .map((d: any) => ({
      month: d.monthName,
      events: d.events,
      registered: d.registered,
      attended: d.attended,
      mql: d.mql,
      sal: d.sal,
      opportunity: d.opportunity,
      attendanceRate: d.registered > 0 ? (d.attended / d.registered) * 100 : 0,
      conversionRate: d.attended > 0 ? (d.mql / d.attended) * 100 : 0
    }));

  // Aggregate data by event source
  const sourceData = filteredData.reduce((acc, d) => {
    const source = d.source || 'Unknown';
    if (!acc[source]) {
      acc[source] = { source, registered: 0, attended: 0, mql: 0 };
    }
    acc[source].registered += d.registered || 0;
    acc[source].attended += d.attended || 0;
    acc[source].mql += d.mql || 0;
    return acc;
  }, {} as Record<string, any>);

  const sourceChartData = Object.values(sourceData);
  const COLORS = ['#005C84', '#55A51C', '#FF6B6B', '#FFB347', '#87CEEB', '#DDA0DD', '#98FB98'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between space-x-4 text-xs">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">
                {entry.name.includes('Rate')
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

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Marketing Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No event data available for this period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Registration and Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Event Registration & Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005C84" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#005C84" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55A51C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#55A51C" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="registered"
                  stroke="#005C84"
                  fillOpacity={1}
                  fill="url(#colorRegistered)"
                  strokeWidth={2}
                  name="Registered"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="attended"
                  stroke="#55A51C"
                  fillOpacity={1}
                  fill="url(#colorAttended)"
                  strokeWidth={2}
                  name="Attended"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Attendance Rate (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Event Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="attended" fill="#55A51C" name="Attended" />
                <Bar dataKey="mql" fill="#005C84" name="MQL" />
                <Bar dataKey="sal" fill="#FFB347" name="SAL" />
                <Bar dataKey="opportunity" fill="#FF6B6B" name="Opportunities" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Event Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-4">Registration by Source</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="registered"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">Source Performance Metrics</h4>
                <div className="space-y-3">
                  {sourceChartData.map((source, index) => (
                    <div key={source.source} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{source.source}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Registered</div>
                          <div className="font-medium">{source.registered}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Attended</div>
                          <div className="font-medium">{source.attended}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">MQL</div>
                          <div className="font-medium">{source.mql}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple overview chart for non-detailed view
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Marketing Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005C84" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#005C84" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="registered"
              stroke="#005C84"
              fillOpacity={1}
              fill="url(#colorRegistered)"
              strokeWidth={2}
              name="Registered"
            />
            <Area
              type="monotone"
              dataKey="attended"
              stroke="#55A51C"
              fillOpacity={1}
              fill="url(#colorAttended)"
              strokeWidth={2}
              name="Attended"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};