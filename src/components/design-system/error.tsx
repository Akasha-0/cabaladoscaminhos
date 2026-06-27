'use client';

/**
 * ============================================================================
 * Error — User-facing error state (NOT a React Error Boundary)
 * ============================================================================
 * Use when an async fetch / mutation failed and you want to communicate the
 * failure with a recovery action. Pair with retry logic in the parent.
 *
 * For caught render exceptions use Next.js `error.tsx` files instead.
 * ============================================================================
 */

import * as React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ErrorSeverity = 'error' | 'warning' | 'critical';

export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading shown to the user. */
  title?: string;
  /** Optional longer description of what went wrong. */
  description?: string;
  /** Underlying error object — message is exposed via `aria-label`. */
  error?: Error | string;
  /** Recovery callback — typically `() => mutate()` or `() => refetch()`. */
  onRetry?: () => void;
  /** Custom retry button label. */
  retryLabel?: string;
  /** Severity tone. */
  severity?: ErrorSeverity;
  /** Layout density. */
  size?: 'sm' | 'md' | 'lg';
  /** Render as an inline alert (compact) instead of full panel. */
  inline?: boolean;
  /** Hide the retry button. */
  hideRetry?: boolean;
}

const severityIcon: Record<ErrorSeverity, React.ReactNode> = {
  error: <AlertTriangle className="h-1/2 w-1/2" aria-hidden />,
  warning: <AlertTriangle className="h-1/2 w-1/2" aria-hidden />,
  critical: <XCircle className="h-1/2 w-1/2" aria-hidden />,
};

const severityPanel: Record<ErrorSeverity, string> = {
  error:
    'border-destructive/30 bg-destructive/5 text-destructive-foreground',
  warning:
    'border-yellow-500/30 bg-yellow-500/5 text-foreground',
  critical:
    'border-destructive bg-destructive/10 text-destructive-foreground',
};

const severityIconWrap: Record<ErrorSeverity, string> = {
  error: 'bg-destructive/15 text-destructive',
  warning: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  critical: 'bg-destructive/25 text-destructive',
};

const sizeStyles = {
  sm: { wrap: 'p-3 gap-2', icon: 'h-8 w-8', title: 'text-sm font-medium', desc: 'text-xs' },
  md: { wrap: 'p-5 gap-3', icon: 'h-12 w-12', title: 'text-base font-semibold', desc: 'text-sm' },
  lg: { wrap: 'p-8 gap-4', icon: 'h-16 w-16', title: 'text-xl font-semibold', desc: 'text-base' },
} as const;

const defaultTitle: Record<ErrorSeverity, string> = {
  error: 'Algo deu errado',
  warning: 'Atenção',
  critical: 'Erro crítico',
};

function getErrorMessage(error: Error | string | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  return error.message;
}

function Error({
  title,
  description,
  error,
  onRetry,
  retryLabel = 'Tentar novamente',
  severity = 'error',
  size = 'md',
  inline = false,
  hideRetry = false,
  className,
  ...props
}: ErrorProps) {
  const sz = sizeStyles[size];
  const errMsg = getErrorMessage(error);
  const resolvedTitle = title ?? defaultTitle[severity];
  const resolvedDescription = description ?? errMsg;

  const icon = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        sz.icon,
        severityIconWrap[severity]
      )}
      aria-hidden
    >
      {severityIcon[severity]}
    </div>
  );

  const body = (
    <div className="min-w-0 flex-1 space-y-1">
      <p className={cn('text-foreground', sz.title)}>{resolvedTitle}</p>
      {resolvedDescription && (
        <p
          className={cn('text-muted-foreground', sz.desc)}
          // Developers can inspect via dev tools; end users see description only.
          aria-label={errMsg ? `Detalhes: ${errMsg}` : undefined}
        >
          {resolvedDescription}
        </p>
      )}
      {!hideRetry && onRetry && (
        <div className="pt-1">
          <Button
            type="button"
            onClick={onRetry}
            size={size === 'lg' ? 'default' : 'sm'}
            variant="outline"
            className="border-current/30"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div
        role="alert"
        className={cn(
          'flex w-full items-start rounded-lg border',
          sz.wrap,
          severityPanel[severity],
          className
        )}
        {...props}
      >
        {icon}
        {body}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border text-center',
        sz.wrap,
        severityPanel[severity],
        className
      )}
      {...props}
    >
      {icon}
      <div className="space-y-1">{body.props.children}</div>
      {!hideRetry && onRetry && (
        <div className="pt-2">
          <Button
            type="button"
            onClick={onRetry}
            variant={severity === 'critical' ? 'destructive' : 'outline'}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export { Error };
export type { ErrorProps, ErrorSeverity };
