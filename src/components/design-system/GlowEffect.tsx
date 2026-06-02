// fallow-ignore-file unused-file
'use client';

import { cn } from '@/lib/utils';

interface GlowEffectProps {
  variant?: 'gold' | 'purple' | 'aurora' | 'white';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function GlowEffect({
  variant = 'gold',
  intensity = 'medium',
  animated = false,
  className,
  children,
}: GlowEffectProps) {
  return (
    <div
      className={cn('glow-wrapper', className, {
        [`glow-${variant}`]: true,
        [`glow-intensity-${intensity}`]: true,
        'glow-animated': animated && intensity === 'high',
      })}
    >
      <div className="glow-orb" aria-hidden="true" />
      {children}
    </div>
  );
}