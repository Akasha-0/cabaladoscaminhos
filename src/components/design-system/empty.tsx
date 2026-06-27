'use client';

/**
 * ============================================================================
 * Empty — Zero-data / no-results / placeholder states
 * ============================================================================
 * Use whenever a view would otherwise render nothing: no posts, no search
 * results, no notifications yet, no rituals scheduled. Always pair with a
 * helpful next step (CTA).
 * ============================================================================
 */

import * as React from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'spiritual' | 'minimal';

export interface EmptyAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default icon shown when no `icon` is provided. */
  icon?: React.ReactNode;
  /** Required heading. */
  title: string;
  /** Supporting copy. */
  description?: string;
  /** Primary call to action. */
  action?: EmptyAction;
  /** Secondary call to action. */
  secondaryAction?: EmptyAction;
  /** Visual flavor. */
  variant?: Variant;
  /** Vertical density. */
  size?: Size;
}

const sizeStyles: Record<Size, { wrap: string; icon: string; title: string; desc: string }> = {
  sm: {
    wrap: 'py-6 gap-2',
    icon: 'h-10 w-10',
    title: 'text-sm font-medium',
    desc: 'text-xs',
  },
  md: {
    wrap: 'py-12 gap-4',
    icon: 'h-16 w-16',
    title: 'text-lg font-semibold',
    desc: 'text-sm',
  },
  lg: {
    wrap: 'py-20 gap-6',
    icon: 'h-24 w-24',
    title: 'text-2xl font-semibold',
    desc: 'text-base',
  },
};

const variantStyles: Record<Variant, string> = {
  default: '',
  spiritual:
    'rounded-2xl border border-[var(--spiritual-gold)]/20 bg-gradient-to-br from-[var(--spiritual-gold-muted)]/40 to-transparent',
  minimal: '',
};

function ActionButton({
  action,
  variant,
}: {
  action: EmptyAction;
  variant: 'primary' | 'secondary';
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
      : 'border border-border bg-background hover:bg-muted hover:text-foreground';

  if (action.href) {
    return (
      <a href={action.href} className={cn(base, styles)}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cn(base, styles)}>
      {action.label}
    </button>
  );
}

function Empty({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: EmptyProps) {
  const sz = sizeStyles[size];
  const defaultIcon = (
    <Inbox className={cn('h-1/2 w-1/2 text-muted-foreground')} aria-hidden />
  );

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center px-4 text-center',
        sz.wrap,
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground',
          sz.icon
        )}
        aria-hidden
      >
        {icon ?? defaultIcon}
      </div>
      <div className="space-y-1">
        <h3 className={cn('text-foreground', sz.title)}>{title}</h3>
        {description && (
          <p
            className={cn(
              'mx-auto max-w-sm text-muted-foreground',
              sz.desc
            )}
          >
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action && <ActionButton action={action} variant="primary" />}
          {secondaryAction && (
            <ActionButton action={secondaryAction} variant="secondary" />
          )}
        </div>
      )}
    </div>
  );
}

export { Empty };
export type { EmptyProps, EmptyAction, Size as EmptySize, Variant as EmptyVariant };
