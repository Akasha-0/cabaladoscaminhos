// fallow-ignore-file unused-file
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================================
// WIDGET WRAPPER
// ============================================================

interface WidgetWrapperProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  title?: string;
  icon?: React.ReactNode;
  iconColor?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'slate';
  gradient?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'slate';
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const GRADIENT_MAP = {
  amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
  violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
  emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
  pink: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
  slate: 'from-slate-500/10 to-slate-600/10 border-slate-500/20',
};

const ICON_COLOR_MAP = {
  amber: 'text-amber-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
  slate: 'text-slate-400',
};

// fallow-ignore-next-line complexity
export function WidgetWrapper({
  children,
  className,
  loading = false,
  error = null,
  title,
  icon,
  iconColor = 'amber',
  gradient = 'slate',
  actions,
  collapsible = false,
  defaultCollapsed = false,
}: WidgetWrapperProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (loading) {
    return (
      <Card className={cn('card-spiritual overflow-hidden', className)}>
        <CardHeader className="pb-3 border-b border-slate-800/50">
          {title && (
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 animate-pulse" />
              <span className="h-5 w-24 bg-slate-800 rounded animate-pulse" />
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('card-spiritual overflow-hidden', className)}>
        <CardContent className="pt-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      {title && (
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-lg bg-gradient-to-br border flex items-center justify-center',
                gradient !== 'slate' ? `from-${iconColor}-500/10 to-${iconColor}-600/10 border-${iconColor}-500/20` : 'from-slate-500/10 to-slate-600/10 border-slate-500/20'
              )}>
                {icon && <span className={ICON_COLOR_MAP[iconColor]}>{icon}</span>}
              </div>
              <span className={cn(
                'text-base font-semibold',
                gradient !== 'slate' ? `bg-gradient-to-r from-${iconColor}-400 to-${iconColor}-400 bg-clip-text text-transparent` : 'text-white'
              )}>
                {title}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {actions}
              {collapsible && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400"
                >
                  {collapsed ? '▼' : '▲'}
                </button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      {!collapsed && (
        <CardContent className="pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================
// WIDGET STAT
// ============================================================

interface WidgetStatProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'slate';
  trend?: 'up' | 'down' | 'stable';
}

const STAT_COLORS = {
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  slate: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};
// fallow-ignore-next-line complexity

export function WidgetStat({ label, value, unit, icon, color = 'amber', trend }: WidgetStatProps) {
  const colors = STAT_COLORS[color];

  return (
    <div className="text-center">
      {icon && (
        <div className={cn('w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center', colors.bg)}>
          <span className={colors.text}>{icon}</span>
        </div>
      )}
      <p className="text-xl font-bold text-white">
        {value}
        {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
      {trend && (
        <span className={cn(
          'text-xs',
          trend === 'up' && 'text-emerald-400',
          trend === 'down' && 'text-red-400',
          trend === 'stable' && 'text-slate-400'
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'stable' && '→'}
        </span>
      )}
    </div>
  );
}

// ============================================================
// WIDGET GRID
// ============================================================

interface WidgetGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WidgetGrid({ children, cols = 2, gap = 'md', className }: WidgetGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// ============================================================
// WIDGET EMPTY STATE
// ============================================================

interface WidgetEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function WidgetEmpty({ icon, title, description, action }: WidgetEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3 text-slate-500">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs mb-3">{description}</p>
      )}
      {action}
    </div>
  );
}

// ============================================================
// WIDGET PROGRESS
// ============================================================

interface WidgetProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'slate';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
// fallow-ignore-next-line complexity
}

export function WidgetProgress({ 
  value, 
  max = 100, 
  label, 
  color = 'amber', 
  showPercentage = true,
  size = 'sm'
}: WidgetProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = STAT_COLORS[color];
  
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          {showPercentage && <span className={colors.text}>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-800/50 overflow-hidden', heightClass[size])}>
        <div 
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors.bg.replace('bg-', 'bg-'))}
          style={{ width: `${percentage}%`, backgroundColor: color === 'amber' ? '#fbbf24' : color === 'violet' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : color === 'cyan' ? '#06b6d4' : color === 'pink' ? '#ec4899' : '#64748b' }}
        />
      </div>
    </div>
  );
}