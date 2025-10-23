import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  color?: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MetricCard = ({ 
  title, 
  value, 
  color = 'blue', 
  trend = 'neutral',
  trendValue,
  className = '',
  style
}: MetricCardProps) => {
  const colorConfig = {
    blue: {
      gradient: 'from-metric-blue/20 via-metric-blue/10 to-transparent',
      border: 'border-metric-blue/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-blue)/0.2)]',
      accent: 'text-metric-blue',
    },
    cyan: {
      gradient: 'from-metric-cyan/20 via-metric-cyan/10 to-transparent',
      border: 'border-metric-cyan/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-cyan)/0.2)]',
      accent: 'text-metric-cyan',
    },
    violet: {
      gradient: 'from-metric-violet/20 via-metric-violet/10 to-transparent',
      border: 'border-metric-violet/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-violet)/0.2)]',
      accent: 'text-metric-violet',
    },
    emerald: {
      gradient: 'from-metric-emerald/20 via-metric-emerald/10 to-transparent',
      border: 'border-metric-emerald/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-emerald)/0.2)]',
      accent: 'text-metric-emerald',
    },
    amber: {
      gradient: 'from-metric-amber/20 via-metric-amber/10 to-transparent',
      border: 'border-metric-amber/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-amber)/0.2)]',
      accent: 'text-metric-amber',
    },
    rose: {
      gradient: 'from-metric-rose/20 via-metric-rose/10 to-transparent',
      border: 'border-metric-rose/30',
      glow: 'shadow-[0_0_20px_hsl(var(--metric-rose)/0.2)]',
      accent: 'text-metric-rose',
    },
  };

  const config = colorConfig[color];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-foreground-muted';

  return (
    <div className={`metric-card group ${config.glow} hover:${config.glow.replace('0.2', '0.3')} ${className}`} style={style}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
      
      {/* Animated border accent */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.gradient.replace('transparent', config.accent.replace('text-', 'from-'))} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content - Mobile responsive padding */}
      <div className="relative z-10 p-3 md:p-6">
        <div className="flex items-start justify-between mb-2 md:mb-4">
          <p className="text-foreground-secondary text-xs md:text-sm font-medium leading-tight">
            {title}
          </p>
          {trendValue && (
            <div className={`flex items-center gap-1 ${trendColor} text-xs font-medium`}>
              <TrendIcon size={10} className="md:hidden" />
              <TrendIcon size={12} className="hidden md:block" />
              <span className="text-xs">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-xl md:text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300">
            {value}
          </p>
        </div>
      </div>
      
      {/* Hover effect shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine" />
      </div>
    </div>
  );
};

export default MetricCard;