import React from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

interface FunnelStage {
  stage: string;
  value: number;
  previousValue?: number;
  color?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  showConversionRates?: boolean;
  showPreviousComparison?: boolean;
  showPercentages?: boolean;
  animate?: boolean;
  colorScheme?: 'blue' | 'green' | 'purple' | 'gradient' | 'custom';
  customColors?: string[];
  orientation?: 'vertical' | 'horizontal';
  maxWidth?: string;
  showArrows?: boolean;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
}

const colorSchemes = {
  blue: [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-blue-600 to-blue-700',
    'from-indigo-600 to-indigo-700',
    'from-blue-700 to-blue-800'
  ],
  green: [
    'from-emerald-400 to-emerald-500',
    'from-green-500 to-green-600',
    'from-emerald-600 to-emerald-700',
    'from-green-700 to-green-800',
    'from-emerald-800 to-emerald-900'
  ],
  purple: [
    'from-purple-400 to-purple-500',
    'from-violet-500 to-violet-600',
    'from-purple-600 to-purple-700',
    'from-violet-700 to-violet-800',
    'from-purple-800 to-purple-900'
  ],
  gradient: [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600'
  ],
  custom: []
};

const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 500,
  showConversionRates = true,
  showPreviousComparison = false,
  showPercentages = true,
  animate = true,
  colorScheme = 'gradient',
  customColors = [],
  orientation = 'vertical',
  maxWidth = '100%',
  showArrows = true,
  showValues = true,
  valueFormatter = (value) => value.toLocaleString()
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = customColors.length > 0 ? customColors : colorSchemes[colorScheme];

  const getWidth = (value: number, index: number) => {
    // Create funnel effect by gradually reducing width
    const baseWidth = (value / maxValue) * 100;
    const funnelFactor = 1 - (index * 0.15); // Reduce by 15% each stage
    return Math.max(baseWidth * funnelFactor, 40); // Minimum 40% width
  };

  const getConversionRate = (currentValue: number, previousValue: number) => {
    return ((currentValue / previousValue) * 100).toFixed(1);
  };

  const getPercentageOfTotal = (value: number) => {
    return ((value / data[0].value) * 100).toFixed(1);
  };

  const getChangeFromPrevious = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  if (orientation === 'horizontal') {
    return (
      <div className="w-full" style={{ maxWidth }}>
        <div className="flex items-center gap-4">
          {data.map((stage, index) => {
            const change = showPreviousComparison && stage.previousValue 
              ? getChangeFromPrevious(stage.value, stage.previousValue)
              : null;

            return (
              <React.Fragment key={stage.stage}>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {stage.stage}
                  </div>
                  <div
                    className={`
                      relative bg-gradient-to-r ${colors[index % colors.length] || colors[0]}
                      text-white rounded-lg p-4 transition-all duration-500
                      ${animate ? 'hover:scale-105 hover:shadow-lg' : ''}
                    `}
                    style={{ 
                      height: `${height}px`,
                      opacity: animate ? 0 : 1,
                      animation: animate ? `fadeInScale 0.5s ${index * 0.1}s forwards` : 'none'
                    }}
                  >
                    <div className="flex flex-col justify-center h-full">
                      {showValues && (
                        <div className="text-2xl font-bold mb-1">
                          {valueFormatter(stage.value)}
                        </div>
                      )}
                      {showPercentages && (
                        <div className="text-sm opacity-90">
                          {getPercentageOfTotal(stage.value)}% of total
                        </div>
                      )}
                      {change && (
                        <div className={`flex items-center gap-1 text-xs mt-2 ${
                          change.direction === 'up' ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {change.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {change.value}% vs prev
                        </div>
                      )}
                    </div>
                  </div>
                  {showConversionRates && index > 0 && (
                    <div className="text-center mt-2 text-xs text-gray-500">
                      {getConversionRate(stage.value, data[index - 1].value)}% conversion
                    </div>
                  )}
                </div>
                {showArrows && index < data.length - 1 && (
                  <ChevronDown className="h-5 w-5 text-gray-400 rotate-[-90deg]" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical orientation (default)
  return (
    <div className="w-full" style={{ maxWidth, minHeight: `${height}px` }}>
      <div className="space-y-3">
        {data.map((stage, index) => {
          const widthPercent = getWidth(stage.value, index);
          const change = showPreviousComparison && stage.previousValue 
            ? getChangeFromPrevious(stage.value, stage.previousValue)
            : null;

          return (
            <React.Fragment key={stage.stage}>
              <div className="relative">
                <div
                  className={`
                    relative bg-gradient-to-r ${stage.color || colors[index % colors.length] || colors[0]}
                    text-white rounded-lg p-4 transition-all duration-500 mx-auto
                    ${animate ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''}
                  `}
                  style={{ 
                    width: `${widthPercent}%`,
                    opacity: animate ? 0 : 1,
                    animation: animate ? `fadeInScale 0.5s ${index * 0.1}s forwards` : 'none'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {stage.icon && <div>{stage.icon}</div>}
                      <div>
                        <span className="font-semibold text-lg">{stage.stage}</span>
                        {stage.description && (
                          <div className="text-sm opacity-90 mt-1">{stage.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {showValues && (
                        <span className="text-2xl font-bold">{valueFormatter(stage.value)}</span>
                      )}
                      {showPercentages && (
                        <div className="text-sm opacity-90 mt-1">
                          {getPercentageOfTotal(stage.value)}% of total
                        </div>
                      )}
                    </div>
                  </div>
                  {change && (
                    <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs ${
                      change.direction === 'up' ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {change.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {change.value}%
                    </div>
                  )}
                </div>
                
                {/* Conversion Rate Badge */}
                {showConversionRates && index > 0 && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                      {getConversionRate(stage.value, data[index - 1].value)}% conversion
                    </div>
                  </div>
                )}
              </div>
              
              {/* Arrow between stages */}
              {showArrows && index < data.length - 1 && (
                <div className="flex justify-center">
                  <ChevronDown className="h-5 w-5 text-gray-400 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      {showConversionRates && data.length > 1 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Conversion</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {getConversionRate(data[data.length - 1].value, data[0].value)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Stages</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{data.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Biggest Drop</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {Math.max(...data.slice(1).map((stage, i) => 
                  100 - parseFloat(getConversionRate(stage.value, data[i].value))
                )).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Average Conv</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {(data.slice(1).reduce((sum, stage, i) => 
                  sum + parseFloat(getConversionRate(stage.value, data[i].value)), 0
                ) / (data.length - 1)).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FunnelChart;