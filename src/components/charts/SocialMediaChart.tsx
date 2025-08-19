import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { SocialData, Period } from '../../types/dashboard';

interface SocialMediaChartProps {
  data: SocialData[];
  period: Period;
}

export const SocialMediaChart: React.FC<SocialMediaChartProps> = ({ data, period }) => {
  const filteredData = data.filter(
    d => d.quarter === period.quarter && d.year === period.year
  );

  const hasData = filteredData.some(d => d.impressions !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No social media data available for this period</p>
          </div>
        ) : (
          <div className="h-64">
            {/* Chart implementation here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};