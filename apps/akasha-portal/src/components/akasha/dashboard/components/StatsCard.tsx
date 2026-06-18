'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useCountUp } from '../../animations';

// Safe color validation - only allow valid hex colors
const SAFE_COLORS = new Set([
  '#7C5CFF',
  '#F0B429',
  '#2DD4BF',
  '#30D158',
  '#FF9500',
  '#FB5781',
  '#0A84FF',
  '#BF5AF2',
]);
function safeColor(color: string, fallback: string): string {
  return SAFE_COLORS.has(color) ? color : fallback;
}

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: ReactNode;
  suffix?: string;
  accentColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  suffix,
  accentColor = '#7C5CFF',
}: StatsCardProps) {
  const animatedValue = useCountUp(value, 2000);
  const safeAccent = safeColor(accentColor, '#7C5CFF');

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-[#0B0E1C]/60 border border-white/[0.06] p-5 backdrop-blur-sm group cursor-default"
      style={{
        boxShadow: `0 0 0 1px ${safeAccent}10, 0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Animated gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${safeAccent}15 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {title}
        </span>
        {icon && (
          <motion.span
            className="text-2xl"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </div>

      {/* Value */}
      <div className="relative flex items-baseline gap-1.5">
        <motion.span
          className="text-4xl font-bold text-white tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {animatedValue}
        </motion.span>
        {suffix && <span className="text-lg text-white/50 font-medium">{suffix}</span>}
      </div>

      {/* Subtitle */}
      {subtitle && <p className="relative mt-1.5 text-xs text-white/40">{subtitle}</p>}

      {/* Decorative glow */}
      <div
        className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${safeAccent}25 0%, transparent 70%)` }}
      />
    </motion.div>
  );
}
