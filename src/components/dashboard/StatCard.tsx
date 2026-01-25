import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}) => {
  const variants = {
    default: 'bg-card border-border',
    primary: 'gradient-primary text-primary-foreground border-transparent',
    accent: 'gradient-accent text-accent-foreground border-transparent',
    success: 'bg-success text-success-foreground border-transparent',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-white/20 text-white',
    accent: 'bg-white/20 text-white',
    success: 'bg-white/20 text-white',
  };

  return (
    <div 
      className={cn(
        "p-4 md:p-6 rounded-xl md:rounded-2xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
          <p className={cn(
            "text-xs md:text-sm font-medium truncate",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {title}
          </p>
          <p className="text-xl md:text-3xl font-bold truncate">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs md:text-sm",
              trend.isPositive ? 'text-success' : 'text-destructive',
              variant !== 'default' && 'opacity-90'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0",
          iconVariants[variant]
        )}>
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;