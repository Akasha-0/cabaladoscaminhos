/**
 * Dashboard Animations
 * Using Tailwind + tw-animate-css for consistent animations
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// CSS ANIMATION CLASSES
// ============================================================

export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  
  // Scale animations
  zoomIn: 'animate-in zoom-in duration-300',
  zoomOut: 'animate-out zoom-out duration-200',
  
  // Spin
  spin: 'animate-spin',
  
  // Pulse
  pulse: 'animate-pulse',
  
  // Bounce
  bounce: 'animate-bounce',
};

// ============================================================
// REUSABLE ANIMATED CARD
// ============================================================

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  index?: number;
  animation?: 'fade-in' | 'slide-up' | 'slide-in-right' | 'zoom-in';
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  animation = 'fade-in' 
}: AnimatedCardProps) {
  const animationClasses: Record<string, string> = {
    'fade-in': 'animate-in fade-in duration-300',
    'slide-up': 'animate-in slide-in-from-bottom-4 duration-300',
    'slide-in-right': 'animate-in slide-in-from-right-4 duration-300',
    'zoom-in': 'animate-in zoom-in-95 duration-300',
  };

  return (
    <div
      className={cn(
        animationClasses[animation],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================
// ANIMATED SECTION WRAPPER
// ============================================================

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  stagger?: boolean;
}

export function AnimatedSection({ 
  children, 
  className, 
  title, 
  description,
  stagger = true 
}: AnimatedSectionProps) {
  return (
    <section 
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        className
      )}
    >
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-playfair font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
      )}
      
      {stagger ? (
        <div className="space-y-4 [&>*:nth-child(n)]:animate-in [&>*:nth-child(n)]:fade-in [&>*:nth-child(n)]:slide-in-from-bottom-4 [&>*:nth-child(n)]:duration-300">
          {children}
        </div>
      ) : children}
    </section>
  );
}

// ============================================================
// PULSE GLOW EFFECT
// ============================================================

interface PulseGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
  active?: boolean;
}

export function PulseGlow({ 
  children, 
  className, 
  color = 'amber',
  active = true 
}: PulseGlowProps) {
  const colorMap = {
    amber: 'shadow-amber-500/50',
    violet: 'shadow-violet-500/50',
    emerald: 'shadow-emerald-500/50',
    cyan: 'shadow-cyan-500/50',
    pink: 'shadow-pink-500/50',
  };

  if (!active) return <>{children}</>;

  return (
    <div 
      className={cn(
        'animate-pulse shadow-lg',
        colorMap[color],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// HOVER SCALE EFFECT
// ============================================================

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({ children, className, scale = 1.02 }: HoverScaleProps) {
  return (
    <div 
      className={cn(
        'transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// FLOATING ANIMATION
// ============================================================

interface FloatingProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function Floating({ children, className, duration = 3, delay = 0 }: FloatingProps) {
  return (
    <div
      className={cn('animate-bounce', className)}
      style={{ 
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// GRADIENT ANIMATION
// ============================================================

interface GradientShiftProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientShift({ children, className }: GradientShiftProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-amber-500/10 animate-pulse" />
      {children}
    </div>
  );
}

// ============================================================
// STAGGERED GRID
// ============================================================

interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function StaggeredGrid({ 
  children, 
  className, 
  cols = 2,
  gap = 'md'
}: StaggeredGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4',
    lg: 'gap-4 md:gap-6',
  };

  return (
    <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-slate-800/70 rounded-lg animate-pulse',
            className
          )}
        />
      ))}
    </>
  );
}

// ============================================================
// PROGRESS BAR ANIMATION
// ============================================================

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'slate';
  showLabel?: boolean;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className,
  color = 'amber',
  showLabel = false
}: AnimatedProgressProps) {
  const colorMap = {
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    pink: 'bg-pink-500',
    slate: 'bg-slate-500',
  };

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}