import React from 'react';
import type { DashboardData, Period } from '../types/dashboard';
import { DataProcessor } from '../utils/dataProcessor';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonViewProps {
  data: DashboardData;
  currentPeriod: Period;
  comparisonPeriod: Period;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  data,
  currentPeriod,
  comparisonPeriod
}) => {
  const getMetrics = (period: Period) => {
    const quarterData = data.websiteData.filter(
      d => d.quarter === period.quarter && d.year === period.year
    );
    
    const trafficData = data.trafficSources.filter(
      d => d.quarter === period.quarter && d.year === period.year
    );
    
    return {
      sessions: quarterData.reduce((sum, d) => sum + (d.sessions || 0), 0),
      pageviews: quarterData.reduce((sum, d) => sum + (d.pageviews || 0), 0),
      uniqueVisitors: quarterData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0),
      avgBounceRate: quarterData.length > 0 
        ? quarterData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / quarterData.length 
        : 0,
      directTraffic: trafficData.reduce((sum, d) => sum + d.directTraffic, 0),
      searchTraffic: trafficData.reduce((sum, d) => sum + d.searchEngines, 0),
      socialTraffic: trafficData.reduce((sum, d) => sum + d.socialMedia, 0)
    };
  };
  
  const currentMetrics = getMetrics(currentPeriod);
  const comparisonMetrics = getMetrics(comparisonPeriod);
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const comparisons = [
    {
      name: 'Sessions',
      current: currentMetrics.sessions,
      previous: comparisonMetrics.sessions,
      change: calculateChange(currentMetrics.sessions, comparisonMetrics.sessions)
    },
    {
      name: 'Page Views',
      current: currentMetrics.pageviews,
      previous: comparisonMetrics.pageviews,
      change: calculateChange(currentMetrics.pageviews, comparisonMetrics.pageviews)
    },
    {
      name: 'Unique Visitors',
      current: currentMetrics.uniqueVisitors,
      previous: comparisonMetrics.uniqueVisitors,
      change: calculateChange(currentMetrics.uniqueVisitors, comparisonMetrics.uniqueVisitors)
    },
    {
      name: 'Bounce Rate',
      current: currentMetrics.avgBounceRate,
      previous: comparisonMetrics.avgBounceRate,
      change: calculateChange(currentMetrics.avgBounceRate, comparisonMetrics.avgBounceRate),
      isPercentage: true,
      inverseGood: true
    },
    {
      name: 'Direct Traffic',
      current: currentMetrics.directTraffic,
      previous: comparisonMetrics.directTraffic,
      change: calculateChange(currentMetrics.directTraffic, comparisonMetrics.directTraffic),
      isPercentage: true
    },
    {
      name: 'Search Traffic',
      current: currentMetrics.searchTraffic,
      previous: comparisonMetrics.searchTraffic,
      change: calculateChange(currentMetrics.searchTraffic, comparisonMetrics.searchTraffic),
      isPercentage: true
    }
  ];
  
  const getTrendIcon = (change: number, inverseGood: boolean = false) => {
    if (change === 0) return <Minus className="h-5 w-5 text-gray-500" />;
    
    const isPositive = change > 0;
    const isGood = inverseGood ? !isPositive : isPositive;
    
    return isPositive ? (
      <TrendingUp className={cn("h-5 w-5", isGood ? "text-green-600" : "text-red-600")} />
    ) : (
      <TrendingDown className={cn("h-5 w-5", isGood ? "text-green-600" : "text-red-600")} />
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Period Comparison: {currentPeriod.quarter} {currentPeriod.year} vs {comparisonPeriod.quarter} {comparisonPeriod.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((item) => (
              <div key={item.name} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(item.change, item.inverseGood)}
                    <span className={cn(
                      "font-semibold",
                      item.change > 0 && !item.inverseGood && "text-green-600",
                      item.change > 0 && item.inverseGood && "text-red-600",
                      item.change < 0 && !item.inverseGood && "text-red-600",
                      item.change < 0 && item.inverseGood && "text-green-600",
                      item.change === 0 && "text-gray-500"
                    )}>
                      {item.change > 0 && '+'}
                      {item.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Current: </span>
                    <span className="font-medium">
                      {item.isPercentage 
                        ? `${item.current.toFixed(1)}%`
                        : DataProcessor.formatNumber(item.current)
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Previous: </span>
                    <span className="font-medium">
                      {item.isPercentage 
                        ? `${item.previous.toFixed(1)}%`
                        : DataProcessor.formatNumber(item.previous)
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      item.change > 0 && !item.inverseGood && "bg-green-600",
                      item.change > 0 && item.inverseGood && "bg-red-600",
                      item.change < 0 && !item.inverseGood && "bg-red-600",
                      item.change < 0 && item.inverseGood && "bg-green-600",
                      item.change === 0 && "bg-gray-400"
                    )}
                    style={{
                      width: `${Math.min(Math.abs(item.change), 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};