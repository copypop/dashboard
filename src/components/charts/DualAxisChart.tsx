import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  ReferenceArea
} from 'recharts';
import { Info } from 'lucide-react';

interface DataPoint {
  [key: string]: any;
  name: string;
  period?: string;
  label?: string;
}

interface SeriesConfig {
  dataKey: string;
  name: string;
  yAxisId: 'left' | 'right';
  type: 'line' | 'area' | 'bar';
  color: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeDasharray?: string;
  gradient?: boolean;
  showDots?: boolean;
  stackId?: string;
}

interface DualAxisChartProps {
  data: DataPoint[];
  leftAxisSeries: SeriesConfig[];
  rightAxisSeries: SeriesConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showBrush?: boolean;
  showTooltip?: boolean;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  leftAxisDomain?: [number | 'dataMin' | 'dataMax', number | 'dataMin' | 'dataMax'];
  rightAxisDomain?: [number | 'dataMin' | 'dataMax', number | 'dataMin' | 'dataMax'];
  leftAxisFormatter?: (value: number) => string;
  rightAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  tooltipFormatter?: (value: number, name: string) => string;
  gradientColors?: { [key: string]: { start: string; end: string } };
  referenceLines?: Array<{
    y?: number;
    x?: string;
    yAxisId?: 'left' | 'right';
    label?: string;
    stroke?: string;
    strokeDasharray?: string;
  }>;
  referenceAreas?: Array<{
    y1?: number;
    y2?: number;
    x1?: string;
    x2?: string;
    yAxisId?: 'left' | 'right';
    fill?: string;
    fillOpacity?: number;
    label?: string;
  }>;
  animate?: boolean;
  animationDuration?: number;
}

const DualAxisChart: React.FC<DualAxisChartProps> = ({
  data,
  leftAxisSeries,
  rightAxisSeries,
  height = 400,
  showGrid = true,
  showLegend = true,
  showBrush = false,
  showTooltip = true,
  leftAxisLabel,
  rightAxisLabel,
  leftAxisDomain,
  rightAxisDomain,
  leftAxisFormatter = (value) => value.toLocaleString(),
  rightAxisFormatter = (value) => value.toLocaleString(),
  xAxisFormatter,
  tooltipFormatter,
  gradientColors = {},
  referenceLines = [],
  referenceAreas = [],
  animate = true,
  animationDuration = 800
}) => {
  const allSeries = [...leftAxisSeries, ...rightAxisSeries];

  // Default gradient colors
  const defaultGradients = {
    blue: { start: '#3b82f6', end: '#1e40af' },
    green: { start: '#10b981', end: '#047857' },
    purple: { start: '#8b5cf6', end: '#6d28d9' },
    orange: { start: '#f59e0b', end: '#d97706' },
    pink: { start: '#ec4899', end: '#be185d' },
    cyan: { start: '#06b6d4', end: '#0891b2' }
  };

  const mergedGradients = { ...defaultGradients, ...gradientColors };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const leftAxisData = payload.filter((p: any) => 
        leftAxisSeries.some(s => s.dataKey === p.dataKey)
      );
      const rightAxisData = payload.filter((p: any) => 
        rightAxisSeries.some(s => s.dataKey === p.dataKey)
      );

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-3 border-b pb-2">
            {xAxisFormatter ? xAxisFormatter(label) : label}
          </p>
          
          {leftAxisData.length > 0 && (
            <div className="mb-2">
              {leftAxisLabel && (
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {leftAxisLabel}
                </p>
              )}
              {leftAxisData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600">{entry.name}:</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {tooltipFormatter 
                      ? tooltipFormatter(entry.value, entry.name)
                      : leftAxisFormatter(entry.value)
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {rightAxisData.length > 0 && (
            <div className="pt-2 border-t">
              {rightAxisLabel && (
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 mt-2">
                  {rightAxisLabel}
                </p>
              )}
              {rightAxisData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600">{entry.name}:</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {tooltipFormatter 
                      ? tooltipFormatter(entry.value, entry.name)
                      : rightAxisFormatter(entry.value)
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderSeries = (series: SeriesConfig, index: number) => {
    const key = `${series.type}-${series.dataKey}-${index}`;
    const gradientId = `gradient-${series.dataKey}`;
    const shouldUseGradient = series.gradient && series.type === 'area';

    switch (series.type) {
      case 'line':
        return (
          <Line
            key={key}
            yAxisId={series.yAxisId}
            type="monotone"
            dataKey={series.dataKey}
            name={series.name}
            stroke={series.color}
            strokeWidth={series.strokeWidth || 2}
            strokeDasharray={series.strokeDasharray}
            dot={series.showDots !== false}
            activeDot={{ r: 6 }}
            animationDuration={animate ? animationDuration : 0}
            animationBegin={animate ? index * 100 : 0}
          />
        );
      
      case 'area':
        return (
          <Area
            key={key}
            yAxisId={series.yAxisId}
            type="monotone"
            dataKey={series.dataKey}
            name={series.name}
            stroke={series.color}
            strokeWidth={series.strokeWidth || 2}
            fill={shouldUseGradient ? `url(#${gradientId})` : series.color}
            fillOpacity={series.fillOpacity ?? 0.3}
            stackId={series.stackId}
            animationDuration={animate ? animationDuration : 0}
            animationBegin={animate ? index * 100 : 0}
          />
        );
      
      case 'bar':
        return (
          <Bar
            key={key}
            yAxisId={series.yAxisId}
            dataKey={series.dataKey}
            name={series.name}
            fill={series.color}
            fillOpacity={series.fillOpacity ?? 1}
            stackId={series.stackId}
            animationDuration={animate ? animationDuration : 0}
            animationBegin={animate ? index * 100 : 0}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Axis Labels */}
      <div className="flex justify-between mb-2">
        {leftAxisLabel && (
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {leftAxisLabel}
          </div>
        )}
        {rightAxisLabel && (
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
            {rightAxisLabel}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          {/* Define gradients */}
          <defs>
            {allSeries.filter(s => s.gradient && s.type === 'area').map(series => {
              const gradientKey = series.dataKey;
              const gradient = (series.color in mergedGradients ? mergedGradients[series.color as keyof typeof mergedGradients] : null) || 
                              { start: series.color, end: series.color };
              
              return (
                <linearGradient
                  key={gradientKey}
                  id={`gradient-${gradientKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={gradient.start} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={gradient.end} stopOpacity={0.1} />
                </linearGradient>
              );
            })}
          </defs>

          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb"
              vertical={false}
            />
          )}
          
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={xAxisFormatter}
            axisLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={leftAxisFormatter}
            domain={leftAxisDomain}
            axisLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={rightAxisFormatter}
            domain={rightAxisDomain}
            axisLine={{ stroke: '#d1d5db' }}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
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

          {/* Reference Areas */}
          {referenceAreas.map((area, index) => (
            <ReferenceArea
              key={`area-${index}`}
              {...area}
              fillOpacity={area.fillOpacity ?? 0.1}
            />
          ))}

          {/* Reference Lines */}
          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={`line-${index}`}
              {...line}
              stroke={line.stroke || '#94a3b8'}
              strokeDasharray={line.strokeDasharray || '3 3'}
            />
          ))}

          {/* Render all series */}
          {leftAxisSeries.map((series, index) => renderSeries(series, index))}
          {rightAxisSeries.map((series, index) => 
            renderSeries(series, index + leftAxisSeries.length)
          )}
          
          {showBrush && (
            <Brush 
              dataKey="name"
              height={30}
              stroke="#94a3b8"
              fill="#f3f4f6"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend with additional info */}
      {(leftAxisSeries.length > 0 || rightAxisSeries.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>Left Axis: {leftAxisLabel || 'Primary Metric'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>Right Axis: {rightAxisLabel || 'Secondary Metric'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualAxisChart;