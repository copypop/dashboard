import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Activity,
  Award,
  Minus
} from 'lucide-react';

export type PerformanceStatus = 
  | 'EXCELLENT' 
  | 'GROWING' 
  | 'GOOD' 
  | 'STABLE' 
  | 'WARNING' 
  | 'DECLINING' 
  | 'CRITICAL'
  | 'NEW'
  | 'TRENDING';

interface PerformanceBadgeProps {
  status: PerformanceStatus;
  label?: string;
  value?: string | number;
  trend?: number;
  showIcon?: boolean;
  showTrend?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
  animated?: boolean;
  tooltip?: string;
  customColors?: {
    bg?: string;
    text?: string;
    border?: string;
  };
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<PerformanceStatus, {
  colors: {
    solid: string;
    outline: string;
    subtle: string;
  };
  icon: React.FC<{ className?: string }>;
  label: string;
}> = {
  EXCELLENT: {
    colors: {
      solid: 'bg-green-500 text-white border-green-600',
      outline: 'bg-transparent text-green-700 border-green-500',
      subtle: 'bg-green-100 text-green-800 border-green-200'
    },
    icon: Award,
    label: 'Excellent'
  },
  GROWING: {
    colors: {
      solid: 'bg-blue-500 text-white border-blue-600',
      outline: 'bg-transparent text-blue-700 border-blue-500',
      subtle: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    icon: TrendingUp,
    label: 'Growing'
  },
  GOOD: {
    colors: {
      solid: 'bg-cyan-500 text-white border-cyan-600',
      outline: 'bg-transparent text-cyan-700 border-cyan-500',
      subtle: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    },
    icon: CheckCircle,
    label: 'Good'
  },
  STABLE: {
    colors: {
      solid: 'bg-gray-500 text-white border-gray-600',
      outline: 'bg-transparent text-gray-700 border-gray-500',
      subtle: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    icon: Minus,
    label: 'Stable'
  },
  WARNING: {
    colors: {
      solid: 'bg-yellow-500 text-white border-yellow-600',
      outline: 'bg-transparent text-yellow-700 border-yellow-500',
      subtle: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    icon: AlertTriangle,
    label: 'Warning'
  },
  DECLINING: {
    colors: {
      solid: 'bg-orange-500 text-white border-orange-600',
      outline: 'bg-transparent text-orange-700 border-orange-500',
      subtle: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    icon: TrendingDown,
    label: 'Declining'
  },
  CRITICAL: {
    colors: {
      solid: 'bg-red-500 text-white border-red-600',
      outline: 'bg-transparent text-red-700 border-red-500',
      subtle: 'bg-red-100 text-red-800 border-red-200'
    },
    icon: XCircle,
    label: 'Critical'
  },
  NEW: {
    colors: {
      solid: 'bg-purple-500 text-white border-purple-600',
      outline: 'bg-transparent text-purple-700 border-purple-500',
      subtle: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    icon: Zap,
    label: 'New'
  },
  TRENDING: {
    colors: {
      solid: 'bg-indigo-500 text-white border-indigo-600',
      outline: 'bg-transparent text-indigo-700 border-indigo-500',
      subtle: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    icon: Activity,
    label: 'Trending'
  }
};

const sizeClasses = {
  xs: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  sm: {
    badge: 'px-2.5 py-1 text-sm',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-2'
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2.5'
  }
};

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  status,
  label,
  value,
  trend,
  showIcon = true,
  showTrend = false,
  size = 'sm',
  variant = 'subtle',
  animated = false,
  tooltip,
  customColors,
  onClick,
  className = ''
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;
  const sizes = sizeClasses[size];

  const getTrendIcon = () => {
    if (!showTrend || trend === undefined) return null;
    
    if (trend > 0) {
      return <TrendingUp className={`${sizes.icon} text-inherit`} />;
    } else if (trend < 0) {
      return <TrendingDown className={`${sizes.icon} text-inherit`} />;
    } else {
      return <Minus className={`${sizes.icon} text-inherit`} />;
    }
  };

  const getTrendColor = () => {
    if (trend === undefined) return '';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const baseClasses = `
    inline-flex items-center ${sizes.gap} ${sizes.badge}
    font-semibold rounded-md border transition-all duration-200
    ${config.colors[variant]}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    ${animated ? 'animate-pulse' : ''}
  `;

  const badgeContent = (
    <>
      {showIcon && <Icon className={sizes.icon} />}
      <span>{displayLabel}</span>
      {value !== undefined && (
        <span className="font-bold ml-1">{value}</span>
      )}
      {showTrend && trend !== undefined && (
        <span className={`flex items-center ${sizes.gap} ml-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="font-bold">
            {Math.abs(trend)}%
          </span>
        </span>
      )}
    </>
  );

  if (tooltip) {
    return (
      <div className="relative inline-block group">
        <div
          className={`${baseClasses} ${className}`}
          onClick={onClick}
          style={customColors ? {
            backgroundColor: customColors.bg,
            color: customColors.text,
            borderColor: customColors.border
          } : undefined}
        >
          {badgeContent}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      style={customColors ? {
        backgroundColor: customColors.bg,
        color: customColors.text,
        borderColor: customColors.border
      } : undefined}
    >
      {badgeContent}
    </div>
  );
};

// Utility function to determine status based on performance metrics
export const getPerformanceStatus = (
  current: number,
  previous?: number,
  thresholds?: {
    excellent?: number;
    good?: number;
    warning?: number;
    critical?: number;
  }
): PerformanceStatus => {
  // If we have thresholds, use them
  if (thresholds) {
    if (thresholds.excellent && current >= thresholds.excellent) return 'EXCELLENT';
    if (thresholds.good && current >= thresholds.good) return 'GOOD';
    if (thresholds.warning && current >= thresholds.warning) return 'WARNING';
    if (thresholds.critical && current < thresholds.critical) return 'CRITICAL';
    return 'STABLE';
  }

  // If we have previous value, calculate trend
  if (previous !== undefined) {
    const change = ((current - previous) / previous) * 100;
    
    if (change > 20) return 'EXCELLENT';
    if (change > 10) return 'GROWING';
    if (change > 5) return 'GOOD';
    if (change > -5) return 'STABLE';
    if (change > -10) return 'WARNING';
    if (change > -20) return 'DECLINING';
    return 'CRITICAL';
  }

  // Default to stable if no comparison available
  return 'STABLE';
};

// Compound component for badge groups
export const PerformanceBadgeGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
}> = ({ 
  children, 
  className = '', 
  orientation = 'horizontal',
  spacing = 'normal' 
}) => {
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
    normal: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    loose: orientation === 'horizontal' ? 'gap-4' : 'gap-4'
  };

  return (
    <div className={`
      flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} 
      ${spacingClasses[spacing]} ${className}
    `}>
      {children}
    </div>
  );
};

export default PerformanceBadge;