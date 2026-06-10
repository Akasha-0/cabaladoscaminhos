'use client';

import type { ReactNode } from 'react';
import { useCountUp } from '../../animations';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: ReactNode;
  suffix?: string;
}

export function StatsCard({ title, value, subtitle, icon, suffix }: StatsCardProps) {
  const animatedValue = useCountUp(value, 2000);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-800/50 p-6 backdrop-blur-sm transition-all hover:bg-slate-800/70">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <span className="text-2xl">
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">
          {animatedValue}
        </span>
        {suffix && (
          <span className="text-xl text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>
      )}

      {/* Decorative gradient */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl" />
    </div>
  );
}
