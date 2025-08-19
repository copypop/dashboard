import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  example?: string;
  icon?: 'info' | 'help';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  description, 
  calculation,
  example,
  icon = 'info',
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const Icon = icon === 'help' ? HelpCircle : Info;
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  };
  
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="More information"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
      
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-72 p-4 bg-gray-900 text-white rounded-lg shadow-xl pointer-events-none animate-fadeIn`}
          role="tooltip"
        >
          <div className="font-semibold text-sm mb-2 text-gray-100">{title}</div>
          <div className="text-xs text-gray-300 space-y-2">
            <p>{description}</p>
            {calculation && (
              <div className="pt-2 border-t border-gray-700">
                <span className="font-semibold text-gray-100">Calculation:</span>
                <p className="mt-1 font-mono text-xs bg-gray-800 p-2 rounded">{calculation}</p>
              </div>
            )}
            {example && (
              <div className="pt-2">
                <span className="font-semibold text-gray-100">Example:</span>
                <p className="mt-1 text-xs italic">{example}</p>
              </div>
            )}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            style={{
              borderLeftColor: position === 'right' ? '#111827' : 'transparent',
              borderRightColor: position === 'left' ? '#111827' : 'transparent',
              borderTopColor: position === 'bottom' ? '#111827' : 'transparent',
              borderBottomColor: position === 'top' ? '#111827' : 'transparent',
            }}
          />
        </div>
      )}
    </div>
  );
};