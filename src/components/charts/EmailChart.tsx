import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EmailData, Period } from '../../types/dashboard';

interface EmailChartProps {
  data: EmailData[];
  period: Period;
}

export const EmailChart: React.FC<EmailChartProps> = ({ data, period }) => {
  const filteredData = data.filter(
    d => d.quarter === period.quarter && d.year === period.year
  );

  const hasData = filteredData.some(d => d.emailsSent !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No email data available for this period</p>
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