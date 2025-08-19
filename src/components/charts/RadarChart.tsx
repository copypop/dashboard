import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RadarDataPoint {
  metric: string;
  value: number;
  previousValue?: number;
  benchmark?: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: {
    primary?: string;
    secondary?: string;
    benchmark?: string;
  };
  fillOpacity?: number;
  strokeWidth?: number;
  animationDuration?: number;
  domain?: [number, number];
  tooltipFormatter?: (value: number, name: string) => string;
  series?: Array<{
    dataKey: string;
    name: string;
    stroke: string;
    fill: string;
    fillOpacity?: number;
    strokeWidth?: number;
  }>;
}

const defaultColors = {
  primary: '#005C84',
  secondary: '#55A51C',
  benchmark: '#ef4444'
};

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  height = 400,
  showLegend = true,
  showGrid = true,
  colors = defaultColors,
  fillOpacity = 0.6,
  strokeWidth = 2,
  animationDuration = 800,
  domain = [0, 100],
  tooltipFormatter,
  series
}) => {
  const mergedColors = { ...defaultColors, ...colors };

  // Prepare data with fullMark if not provided
  const processedData = data.map(point => ({
    ...point,
    fullMark: point.fullMark ?? 100
  }));

  // Default series configuration if not provided
  const defaultSeries = [
    {
      dataKey: 'value',
      name: 'Current Period',
      stroke: mergedColors.primary,
      fill: mergedColors.primary,
      fillOpacity: fillOpacity,
      strokeWidth: strokeWidth
    }
  ];

  // Add previous value series if data contains it
  if (data.some(d => d.previousValue !== undefined)) {
    defaultSeries.push({
      dataKey: 'previousValue',
      name: 'Previous Period',
      stroke: mergedColors.secondary,
      fill: mergedColors.secondary,
      fillOpacity: fillOpacity * 0.7,
      strokeWidth: strokeWidth
    });
  }

  // Add benchmark series if data contains it
  if (data.some(d => d.benchmark !== undefined)) {
    defaultSeries.push({
      dataKey: 'benchmark',
      name: 'Benchmark',
      stroke: mergedColors.benchmark,
      fill: mergedColors.benchmark,
      fillOpacity: 0,
      strokeWidth: strokeWidth - 0.5
    });
  }

  const renderSeries = series || defaultSeries;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-semibold text-gray-900">
                {tooltipFormatter 
                  ? tooltipFormatter(entry.value, entry.name)
                  : `${entry.value}%`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={processedData}>
        {showGrid && (
          <PolarGrid 
            stroke="#e5e7eb"
            strokeDasharray="3 3"
            radialLines={true}
          />
        )}
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          className="text-gray-600"
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={domain}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
        />
        
        {renderSeries.map((seriesItem, index) => (
          <Radar
            key={seriesItem.dataKey}
            name={seriesItem.name}
            dataKey={seriesItem.dataKey}
            stroke={seriesItem.stroke}
            fill={seriesItem.fill}
            fillOpacity={seriesItem.fillOpacity ?? fillOpacity}
            strokeWidth={seriesItem.strokeWidth ?? strokeWidth}
            animationDuration={animationDuration}
            animationBegin={index * 100}
          />
        ))}
        
        <Tooltip content={<CustomTooltip />} />
        
        {showLegend && (
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
            iconType="rect"
            formatter={(value: string) => (
              <span className="text-gray-700">{value}</span>
            )}
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;