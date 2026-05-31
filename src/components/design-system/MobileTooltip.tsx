'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * MobileTooltip - Touch-friendly tooltip component
 * 
 * Features:
 * - Tap to show (mobile) / hover to show (desktop)
 * - Tap outside to dismiss
 * - Positioned to avoid screen edges
 * - Respects reduced motion preferences
 */
interface MobileTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  tooltipClassName?: string;
  delay?: number;
  disabled?: boolean;
}

export function MobileTooltip({
  children,
  content,
  position = 'top',
  className = '',
  tooltipClassName = '',
  delay = 300,
  disabled = false,
}: MobileTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const handleClick = () => {
    if (isTouchDevice) {
      // Toggle on tap for touch devices
      setIsVisible(prev => !prev);
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Position styles
  const getPositionStyles = () => {
    const base = 'absolute z-50';
    switch (position) {
      case 'top':
        return `${base} bottom-full left-1/2 -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base} top-full left-1/2 -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 -translate-y-1/2 ml-2`;
      default:
        return `${base} bottom-full left-1/2 -translate-x-1/2 mb-2`;
    }
  };

  // Check for reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const animationClass = reducedMotion
    ? ''
    : 'animate-in fade-in zoom-in-95 duration-200';

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        ref={triggerRef}
        onMouseEnter={!isTouchDevice ? showTooltip : undefined}
        onMouseLeave={!isTouchDevice ? hideTooltip : undefined}
        onClick={isTouchDevice ? handleClick : undefined}
        onTouchStart={isTouchDevice ? showTooltip : undefined}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            getPositionStyles(),
            'bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 shadow-xl shadow-amber-500/10',
            'min-w-[150px] max-w-[280px]',
            animationClass,
            tooltipClassName
          )}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div className={cn(
            'absolute w-3 h-3 bg-slate-900/95 border-l border-b border-slate-700/50 rotate-45',
            position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1.5',
            position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 mt-1.5',
            position === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1.5',
            position === 'right' && 'right-full top-1/2 -translate-y-1/2 ml-1.5'
          )} />
        </div>
      )}
    </div>
  );
}

/**
 * TooltipContent - Standardized tooltip content structure
 */
export function TooltipContent({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="font-semibold text-white text-sm">{title}</span>
      </div>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

export default MobileTooltip;