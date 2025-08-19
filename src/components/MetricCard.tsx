import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: 'number' | 'percentage' | 'currency';
  target?: number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  format = 'number',
  target,
  className
}) => {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getProgressPercentage = () => {
    if (!target || typeof value !== 'number') return 0;
    return Math.min((value / target) * 100, 100);
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        
        {change !== undefined && (
          <div className="flex items-center mt-2 text-xs">
            {getTrendIcon()}
            <span
              className={cn(
                "ml-1 font-medium",
                change > 0 && "text-green-600",
                change < 0 && "text-red-600",
                change === 0 && "text-gray-500"
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="ml-1 text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
        
        {target && typeof value === 'number' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage().toFixed(0)}% of target</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  getProgressPercentage() >= 100 && "bg-green-600",
                  getProgressPercentage() >= 75 && getProgressPercentage() < 100 && "bg-blue-600",
                  getProgressPercentage() >= 50 && getProgressPercentage() < 75 && "bg-yellow-600",
                  getProgressPercentage() < 50 && "bg-red-600"
                )}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};