import React from 'react';
import type { Insight } from '../types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
  showAll?: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, showAll = false }) => {
  const displayInsights = showAll ? insights : insights.slice(0, 5);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'performance':
        return <Activity className="h-5 w-5" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'comparison':
        return <Target className="h-5 w-5" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />;
      case 'prediction':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'performance':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'trend':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'opportunity':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'risk':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'prediction':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'comparison':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <span className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        colors[priority]
      )}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (displayInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No insights available. Upload data to generate AI-powered insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI-Powered Insights</span>
          {!showAll && insights.length > 5 && (
            <span className="text-sm font-normal text-gray-500">
              Showing 5 of {insights.length} insights
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "p-4 border rounded-lg transition-all hover:shadow-md",
                getInsightColor(insight.type)
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(insight.priority)}
                      <span className="text-xs text-gray-500">
                        {insight.confidence} confidence
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">{insight.description}</p>
                  
                  {insight.value !== undefined && (
                    <div className="flex items-center space-x-4 text-xs mt-2">
                      {insight.metric && (
                        <span className="font-medium">{insight.metric}:</span>
                      )}
                      <span className="font-bold text-lg">
                        {typeof insight.value === 'number' 
                          ? insight.value.toLocaleString() 
                          : insight.value}
                      </span>
                      {insight.change !== undefined && (
                        <span className={cn(
                          "flex items-center",
                          insight.change > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {insight.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {Math.abs(insight.change).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  {insight.actions && insight.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {insight.actions.map((action, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};