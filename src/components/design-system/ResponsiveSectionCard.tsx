'use client';

import { useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface ResponsiveCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  reducedAnimations?: boolean;
  animationDelay?: number;
}

/**
 * ResponsiveSectionCard - Mobile-optimized section card
 * 
 * Features:
 * - Respects reduced motion preferences
 * - Disables animations on mobile
 * - Touch-friendly toggle
 * - Responsive padding and sizing
 */
export function ResponsiveSectionCard({
  title,
  icon,
  children,
  variant = 'primary',
  className = '',
  collapsed = false,
  onToggle,
  reducedAnimations = false,
  animationDelay = 0,
}: ResponsiveSectionCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const variantStyles = {
    primary: 'border-amber-500/20 hover:border-amber-500/40',
    secondary: 'border-violet-500/20 hover:border-violet-500/40',
    accent: 'border-emerald-500/20 hover:border-emerald-500/40',
  };

  // Determine animation class
  const animationClass = reducedAnimations || isMobile
    ? '' // No animations on mobile or if reduced
    : `animate-in slide-in-from-bottom-8 duration-500`;
  
  const delayClass = animationDelay > 0 && !reducedAnimations && !isMobile
    ? `delay-[${animationDelay}]`
    : '';

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-slate-900/80 to-slate-950/80',
        'backdrop-blur-sm border',
        variantStyles[variant],
        'transition-all duration-300',
        animationClass,
        delayClass,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          'border-b border-slate-800/50'
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-slate-800/50'
            )}>
              {icon}
            </div>
          )}
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-slate-800/30 hover:bg-slate-800/50',
              'transition-all duration-200',
              collapsed && 'rotate-180'
            )}
            aria-label={collapsed ? 'Expandir' : 'Recolher'}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Content */}
      {!collapsed && (
        <div className={cn(
          'p-4 pt-0',
          // Responsive padding for mobile
          isMobile ? 'px-3 py-3' : ''
        )}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile-optimized glow card
 */
export function ResponsiveGlowCard({
  children,
  className = '',
  glowColor = 'amber',
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: 'amber' | 'violet' | 'emerald' | 'cyan';
  disabled?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const glowStyles = {
    amber: 'hover:shadow-amber-500/20 hover:border-amber-500/40',
    violet: 'hover:shadow-violet-500/20 hover:border-violet-500/40',
    emerald: 'hover:shadow-emerald-500/20 hover:border-emerald-500/40',
    cyan: 'hover:shadow-cyan-500/20 hover:border-cyan-500/40',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        'bg-gradient-to-br from-slate-900/80 to-slate-950/80',
        'backdrop-blur-sm border border-slate-700/30',
        'transition-all duration-300',
        disabled ? '' : glowStyles[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}