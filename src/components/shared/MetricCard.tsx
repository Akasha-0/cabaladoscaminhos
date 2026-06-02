// fallow-ignore-file unused-file
// Shared metric card component for dashboard widgets

import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  className?: string;
  iconColor?: string;
}

/**
 * Shared metric card component for displaying stats/metrics in dashboard widgets.
 * Standardized card with icon, value, and label in a centered layout.
 */
// fallow-ignore-next-line unused-export
export function MetricCard({ icon, value, label, className = '', iconColor = 'text-amber-400' }: MetricCardProps) {
  return (
    <div className={cn(
      'p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center',
      className
    )}>
      <div className={cn('w-5 h-5 mx-auto mb-1', iconColor)}>
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
