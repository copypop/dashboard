import React from 'react';
import {
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
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { EventsData, Period } from '../../types/dashboard';
import { DataProcessor } from '../../utils/dataProcessor';

interface EventsChartProps {
  data: EventsData[];
  period: Period;
  detailed?: boolean;
  compareEnabled?: boolean;
  compareType?: 'prev_quarter' | 'prev_year';
  comparisonData?: EventsData[];
}

export const EventsChart: React.FC<EventsChartProps> = ({
  data,
  period,
  detailed = false,
  compareEnabled = false,
  compareType = 'prev_quarter',
  comparisonData = []
}) => {

  const filteredData = data.filter(d => {
    if (period.quarter) {
      // Filter by specific quarter
      return d.quarter === period.quarter && d.year === period.year;
    } else {
      // Show all quarters for the year
      return d.year === period.year;
    }
  });


  // Use comparison data as-is since it's already filtered for the correct period by getComparisonData
  const filteredComparisonData = compareEnabled ? comparisonData : [];


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

  // Aggregate comparison data by month if comparison is enabled
  const comparisonMonthlyAggregated = compareEnabled ? filteredComparisonData.reduce((acc, d) => {
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
  }, {} as Record<string, any>) : {};

  // Convert comparison data to array and sort by month number
  const comparisonChartData = compareEnabled ? Object.values(comparisonMonthlyAggregated)
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
    })) : [];


  // Create combined chart data for comparison charts
  const combinedChartData = compareEnabled ? chartData.map((current, index) => {
    // For quarter comparisons, match by position in quarter (0=first month, 1=second, 2=third)
    // For year comparisons, match by month name
    let comparison;
    if (compareType === 'prev_year') {
      comparison = comparisonChartData.find(comp => comp.month === current.month);
    } else {
      // For previous quarter, match by position within quarter
      comparison = comparisonChartData[index];
    }

    const periodLabel = compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter';

    const combinedItem = {
      month: current.month,
      // Current period data
      [`Registered (Current)`]: current.registered,
      [`Attended (Current)`]: current.attended,
      [`MQL (Current)`]: current.mql,
      [`SAL (Current)`]: current.sal,
      [`Opportunities (Current)`]: current.opportunity,
      [`Attendance Rate (Current)`]: current.attendanceRate,
      [`Conversion Rate (Current)`]: current.conversionRate,
      // Previous period data
      [`Registered (${periodLabel})`]: comparison?.registered || 0,
      [`Attended (${periodLabel})`]: comparison?.attended || 0,
      [`MQL (${periodLabel})`]: comparison?.mql || 0,
      [`SAL (${periodLabel})`]: comparison?.sal || 0,
      [`Opportunities (${periodLabel})`]: comparison?.opportunity || 0,
      [`Attendance Rate (${periodLabel})`]: comparison?.attendanceRate || 0,
      [`Conversion Rate (${periodLabel})`]: comparison?.conversionRate || 0,
      // For backward compatibility
      registered: current.registered,
      attended: current.attended,
      mql: current.mql,
      sal: current.sal,
      opportunity: current.opportunity,
      attendanceRate: current.attendanceRate,
      conversionRate: current.conversionRate
    };


    return combinedItem;
  }) : chartData;


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

  // Aggregate comparison data by event source if comparison is enabled
  const comparisonSourceData = compareEnabled ? filteredComparisonData.reduce((acc, d) => {
    const source = d.source || 'Unknown';
    if (!acc[source]) {
      acc[source] = { source, registered: 0, attended: 0, mql: 0 };
    }
    acc[source].registered += d.registered || 0;
    acc[source].attended += d.attended || 0;
    acc[source].mql += d.mql || 0;
    return acc;
  }, {} as Record<string, any>) : {};

  const sourceChartData = Object.values(sourceData);
  const comparisonSourceChartData = compareEnabled ? Object.values(comparisonSourceData) : [];

  // Combine source data with comparison data for metrics display
  const combinedSourceData = compareEnabled ? sourceChartData.map(current => {
    const comparison = comparisonSourceChartData.find((comp: any) => comp.source === current.source);
    const periodLabel = compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter';

    return {
      ...current,
      [`registered_${periodLabel.replace(' ', '_').toLowerCase()}`]: comparison?.registered || 0,
      [`attended_${periodLabel.replace(' ', '_').toLowerCase()}`]: comparison?.attended || 0,
      [`mql_${periodLabel.replace(' ', '_').toLowerCase()}`]: comparison?.mql || 0,
      periodLabel
    };
  }) : sourceChartData;

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
              <ComposedChart data={compareEnabled ? combinedChartData : chartData}>
                <defs>
                  <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005C84" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#005C84" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55A51C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#55A51C" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorRegisteredPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#87CEEB" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAttendedPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#98FB98" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#98FB98" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Current Period Data */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey={compareEnabled ? "Registered (Current)" : "registered"}
                  stroke="#005C84"
                  fillOpacity={1}
                  fill="url(#colorRegistered)"
                  strokeWidth={2}
                  name={compareEnabled ? "Registered (Current)" : "Registered"}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey={compareEnabled ? "Attended (Current)" : "attended"}
                  stroke="#55A51C"
                  fillOpacity={1}
                  fill="url(#colorAttended)"
                  strokeWidth={2}
                  name={compareEnabled ? "Attended (Current)" : "Attended"}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={compareEnabled ? "Attendance Rate (Current)" : "attendanceRate"}
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={compareEnabled ? "Attendance Rate (Current) (%)" : "Attendance Rate (%)"}
                />

                {/* Previous Period Data - Only show when comparison is enabled */}
                {compareEnabled && (
                  <>
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey={`Registered (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      stroke="#87CEEB"
                      fillOpacity={0.6}
                      fill="url(#colorRegisteredPrev)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={`Registered (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      stroke="#98FB98"
                      fillOpacity={0.6}
                      fill="url(#colorAttendedPrev)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={`Attendance Rate (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      stroke="#DDA0DD"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      name={`Attendance Rate (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'}) (%)`}
                    />
                  </>
                )}
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
              <BarChart data={compareEnabled ? combinedChartData : chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Current Period Data */}
                <Bar
                  dataKey={compareEnabled ? "Attended (Current)" : "attended"}
                  fill="#55A51C"
                  name={compareEnabled ? "Attended (Current)" : "Attended"}
                />
                <Bar
                  dataKey={compareEnabled ? "MQL (Current)" : "mql"}
                  fill="#005C84"
                  name={compareEnabled ? "MQL (Current)" : "MQL"}
                />
                <Bar
                  dataKey={compareEnabled ? "SAL (Current)" : "sal"}
                  fill="#FFB347"
                  name={compareEnabled ? "SAL (Current)" : "SAL"}
                />
                <Bar
                  dataKey={compareEnabled ? "Opportunities (Current)" : "opportunity"}
                  fill="#FF6B6B"
                  name={compareEnabled ? "Opportunities (Current)" : "Opportunities"}
                />

                {/* Previous Period Data - Only show when comparison is enabled */}
                {compareEnabled && (
                  <>
                    <Bar
                      dataKey={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      fill="#98FB98"
                      name={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      opacity={0.7}
                    />
                    <Bar
                      dataKey={`MQL (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      fill="#87CEEB"
                      name={`MQL (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      opacity={0.7}
                    />
                    <Bar
                      dataKey={`SAL (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      fill="#DDA0DD"
                      name={`SAL (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      opacity={0.7}
                    />
                    <Bar
                      dataKey={`Opportunities (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      fill="#FFB6C1"
                      name={`Opportunities (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                      opacity={0.7}
                    />
                  </>
                )}
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
                <h4 className="text-sm font-medium mb-4">
                  Registration by Source
                  {compareEnabled && (
                    <span className="text-xs text-gray-500 ml-2">
                      vs {compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'}
                    </span>
                  )}
                </h4>
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

                {/* Trend Indicators - Only show when comparison is enabled */}
                {compareEnabled && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">Registration Share Changes</div>
                    <div className="space-y-1">
                      {sourceChartData.map((current, index) => {
                        const comparison = comparisonSourceChartData.find((comp: any) => comp.source === current.source);
                        const currentTotal = sourceChartData.reduce((sum, s) => sum + (s.registered || 0), 0);
                        const comparisonTotal = comparisonSourceChartData.reduce((sum: number, s: any) => sum + (s.registered || 0), 0);

                        const currentPercent = currentTotal > 0 ? (current.registered / currentTotal) * 100 : 0;
                        const prevPercent = comparison && comparisonTotal > 0 ? (comparison.registered / comparisonTotal) * 100 : 0;
                        const percentChange = prevPercent > 0 ? currentPercent - prevPercent : 0;
                        const hasSignificantChange = Math.abs(percentChange) >= 0.5;

                        return (
                          <div key={current.source} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-gray-700">{current.source}</span>
                            </div>
                            {hasSignificantChange ? (
                              <div className={`flex items-center gap-1 ${percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {percentChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                <span>{Math.abs(percentChange).toFixed(1)}pp</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">
                  Source Performance Metrics
                  {compareEnabled && (
                    <span className="text-xs text-gray-500 ml-2">
                      vs {compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'}
                    </span>
                  )}
                </h4>
                <div className="space-y-3">
                  {(compareEnabled ? combinedSourceData : sourceChartData).map((source, index) => (
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
                          {compareEnabled && (() => {
                            const prevValue = source[`registered_${source.periodLabel?.replace(' ', '_').toLowerCase()}`] || 0;
                            const currentValue = source.registered || 0;
                            const trend = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
                            const isPositive = trend > 0;
                            const hasChange = Math.abs(trend) >= 0.1;

                            return (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">prev: {prevValue}</span>
                                {hasChange && (
                                  <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    <span className="ml-0.5">{Math.abs(trend).toFixed(0)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-gray-500">Attended</div>
                          <div className="font-medium">{source.attended}</div>
                          {compareEnabled && (() => {
                            const prevValue = source[`attended_${source.periodLabel?.replace(' ', '_').toLowerCase()}`] || 0;
                            const currentValue = source.attended || 0;
                            const trend = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
                            const isPositive = trend > 0;
                            const hasChange = Math.abs(trend) >= 0.1;

                            return (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">prev: {prevValue}</span>
                                {hasChange && (
                                  <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    <span className="ml-0.5">{Math.abs(trend).toFixed(0)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-gray-500">MQL</div>
                          <div className="font-medium">{source.mql}</div>
                          {compareEnabled && (() => {
                            const prevValue = source[`mql_${source.periodLabel?.replace(' ', '_').toLowerCase()}`] || 0;
                            const currentValue = source.mql || 0;
                            const trend = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
                            const isPositive = trend > 0;
                            const hasChange = Math.abs(trend) >= 0.1;

                            return (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">prev: {prevValue}</span>
                                {hasChange && (
                                  <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    <span className="ml-0.5">{Math.abs(trend).toFixed(0)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
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
          <AreaChart data={compareEnabled ? combinedChartData : chartData}>
            <defs>
              <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005C84" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#005C84" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#55A51C" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#55A51C" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRegisteredPrevSimple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#87CEEB" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAttendedPrevSimple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#98FB98" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#98FB98" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Current Period Data */}
            <Area
              type="monotone"
              dataKey={compareEnabled ? "Registered (Current)" : "registered"}
              stroke="#005C84"
              fillOpacity={1}
              fill="url(#colorRegistered)"
              strokeWidth={2}
              name={compareEnabled ? "Registered (Current)" : "Registered"}
            />
            <Area
              type="monotone"
              dataKey={compareEnabled ? "Attended (Current)" : "attended"}
              stroke="#55A51C"
              fillOpacity={1}
              fill="url(#colorAttended)"
              strokeWidth={2}
              name={compareEnabled ? "Attended (Current)" : "Attended"}
            />

            {/* Previous Period Data - Only show when comparison is enabled */}
            {compareEnabled && (
              <>
                <Area
                  type="monotone"
                  dataKey={`Registered (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                  stroke="#87CEEB"
                  fillOpacity={0.6}
                  fill="url(#colorRegisteredPrevSimple)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={`Registered (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                />
                <Area
                  type="monotone"
                  dataKey={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                  stroke="#98FB98"
                  fillOpacity={0.6}
                  fill="url(#colorAttendedPrevSimple)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={`Attended (${compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'})`}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};