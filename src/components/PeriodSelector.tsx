import React, { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Calendar } from 'lucide-react';
import { Button } from './ui/button';

export const PeriodSelector: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod, data } = useDashboardStore();

  // Dynamically get available years from the data
  const years = useMemo(() => {
    if (!data || !data.websiteData) {
      // Fallback to current year if no data available
      const currentYear = new Date().getFullYear();
      return [currentYear];
    }

    // Extract unique years from website data and sort them
    const availableYears = [...new Set(data.websiteData.map(item => item.year))]
      .filter(year => year != null)
      .sort((a, b) => a - b);

    return availableYears.length > 0 ? availableYears : [new Date().getFullYear()];
  }, [data]);

  // Dynamically get available quarters for the selected year
  const quarters = useMemo(() => {
    if (!data || !data.websiteData || !selectedPeriod.year) {
      return ['Q1', 'Q2', 'Q3', 'Q4']; // Fallback to all quarters
    }

    // Get quarters that have data for the selected year
    const availableQuarters = [...new Set(
      data.websiteData
        .filter(item => item.year === selectedPeriod.year)
        .map(item => item.quarter)
        .filter(quarter => quarter != null)
    )].sort();

    return availableQuarters.length > 0 ? availableQuarters : ['Q1', 'Q2', 'Q3', 'Q4'];
  }, [data, selectedPeriod.year]);
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-1">
        <Calendar className="h-4 w-4 text-white/80 ml-2" />
        
        {/* Year Selector */}
        <select
          value={selectedPeriod.year}
          onChange={(e) => {
            const newYear = parseInt(e.target.value);
            // Check if current quarter exists for the new year
            const quartersForNewYear = [...new Set(
              data?.websiteData
                ?.filter(item => item.year === newYear)
                ?.map(item => item.quarter)
                ?.filter(quarter => quarter != null) || []
            )].sort();

            const newQuarter = quartersForNewYear.includes(selectedPeriod.quarter!)
              ? selectedPeriod.quarter
              : quartersForNewYear[0] || 'Q1';

            setSelectedPeriod({ year: newYear, quarter: newQuarter });
          }}
          className="bg-transparent text-white border-none focus:outline-none cursor-pointer px-2 py-1"
        >
          {years.map(year => (
            <option key={year} value={year} className="text-gray-900">
              {year}
            </option>
          ))}
        </select>
        
        {/* Quarter Selector */}
        <div className="flex space-x-1">
          {quarters.map(quarter => (
            <button
              key={quarter}
              onClick={() => setSelectedPeriod({ ...selectedPeriod, quarter })}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod.quarter === quarter
                  ? 'bg-white text-caat-blue'
                  : 'text-white/80 hover:bg-white/20'
              }`}
            >
              {quarter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Comparison Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
      >
        Compare Periods
      </Button>
    </div>
  );
};