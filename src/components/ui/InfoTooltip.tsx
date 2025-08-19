import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  example?: string;
  icon?: 'info' | 'help';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  title, 
  description, 
  calculation,
  example,
  icon = 'info',
  position = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position === 'auto' ? 'top' : position);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const Icon = icon === 'help' ? HelpCircle : Info;
  
  useEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      let top = 0;
      let left = 0;
      let finalPosition = position === 'auto' ? 'top' : position;
      
      // Calculate position based on available space
      const padding = 8; // Space between tooltip and button
      const viewportMargin = 10; // Minimum distance from viewport edge
      
      if (position === 'auto') {
        // Check available space in each direction
        const spaceTop = buttonRect.top;
        const spaceBottom = window.innerHeight - buttonRect.bottom;
        const spaceLeft = buttonRect.left;
        const spaceRight = window.innerWidth - buttonRect.right;
        
        // Prefer top/bottom over left/right for better readability
        if (spaceTop > tooltipRect.height + viewportMargin) {
          finalPosition = 'top';
        } else if (spaceBottom > tooltipRect.height + viewportMargin) {
          finalPosition = 'bottom';
        } else if (spaceRight > tooltipRect.width + viewportMargin) {
          finalPosition = 'right';
        } else if (spaceLeft > tooltipRect.width + viewportMargin) {
          finalPosition = 'left';
        } else {
          // Default to bottom if no ideal space
          finalPosition = 'bottom';
        }
      } else {
        finalPosition = position;
      }
      
      // Calculate exact position based on final position
      switch (finalPosition) {
        case 'top':
          top = buttonRect.top + scrollY - tooltipRect.height - padding;
          left = buttonRect.left + scrollX + (buttonRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = buttonRect.bottom + scrollY + padding;
          left = buttonRect.left + scrollX + (buttonRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = buttonRect.top + scrollY + (buttonRect.height / 2) - (tooltipRect.height / 2);
          left = buttonRect.left + scrollX - tooltipRect.width - padding;
          break;
        case 'right':
          top = buttonRect.top + scrollY + (buttonRect.height / 2) - (tooltipRect.height / 2);
          left = buttonRect.right + scrollX + padding;
          break;
      }
      
      // Ensure tooltip stays within viewport
      const maxLeft = window.innerWidth + scrollX - tooltipRect.width - viewportMargin;
      const minLeft = scrollX + viewportMargin;
      const maxTop = window.innerHeight + scrollY - tooltipRect.height - viewportMargin;
      const minTop = scrollY + viewportMargin;
      
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
      
      setActualPosition(finalPosition);
      setTooltipStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      });
    }
  }, [isVisible, position]);
  
  const getArrowStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };
    
    switch (actualPosition) {
      case 'top':
        return {
          ...baseStyle,
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '8px 8px 0 8px',
          borderColor: '#111827 transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 8px 8px 8px',
          borderColor: 'transparent transparent #111827 transparent',
        };
      case 'left':
        return {
          ...baseStyle,
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 0 8px 8px',
          borderColor: 'transparent transparent transparent #111827',
        };
      case 'right':
        return {
          ...baseStyle,
          left: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 8px 8px 0',
          borderColor: 'transparent #111827 transparent transparent',
        };
      default:
        return baseStyle;
    }
  };
  
  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="w-72 p-4 bg-gray-900 text-white rounded-lg shadow-2xl pointer-events-none animate-fadeIn"
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
      <div style={getArrowStyle()} />
    </div>
  );
  
  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors relative z-10"
        aria-label="More information"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
      
      {isVisible && typeof document !== 'undefined' && 
        createPortal(tooltipContent, document.body)
      }
    </>
  );
};