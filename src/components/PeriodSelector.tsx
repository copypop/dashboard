import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { Calendar } from 'lucide-react';
import { Button } from './ui/button';

export const PeriodSelector: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod } = useDashboardStore();
  
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-1">
        <Calendar className="h-4 w-4 text-white/80 ml-2" />
        
        {/* Year Selector */}
        <select
          value={selectedPeriod.year}
          onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
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