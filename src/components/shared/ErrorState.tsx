import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/design-system/Typography';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'spiritual' | 'warning' | 'critical';
  className?: string;
}

const DEFAULT_MESSAGES = {
  spiritual: 'O cosmos pediu licença para reorganizar este momento.',
  warning: 'Algo merece sua atenção.',
  critical: 'Um erro inesperado ocorreu. Por favor, tente novamente.',
};

const ICONS = {
  spiritual: '✦',
  warning: '⚠',
  critical: '⚠⚠⚠',
};

const TITLES = {
  spiritual: 'Algo não alignou',
  warning: 'Atenção',
  critical: 'Erro detectado',
};

export function ErrorState({
  title,
  message,
  onRetry,
  variant = 'spiritual',
  className,
}: ErrorStateProps) {
  const icon = ICONS[variant];
  const defaultTitle = TITLES[variant];
  const defaultMessage = DEFAULT_MESSAGES[variant];

  return (
    <div
      className={cn(
        'card-spiritual p-8 flex flex-col items-center text-center',
        'animate-fade-in',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'text-4xl mb-4',
          variant === 'spiritual' && 'text-[var(--spiritual-gold)]',
          variant === 'warning' && 'text-yellow-500',
          variant === 'critical' && 'text-red-500'
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <Heading
        variant="section"
        className={cn(
          'mb-4',
          variant === 'spiritual' && 'text-[var(--spiritual-gold)]',
          variant === 'warning' && 'text-yellow-400',
          variant === 'critical' && 'text-red-400'
        )}
      >
        {title ?? defaultTitle}
      </Heading>

      {/* Message */}
      <p className="text-spiritual-text-secondary mb-6 max-w-sm">
        {message ?? defaultMessage}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button
          variant="golden-outline"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw size={16} />
          <span>Tentar Novamente</span>
          <span className="text-[var(--spiritual-gold)]">✦</span>
        </Button>
      )}
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ?? (
        <ErrorState message={this.state.error.message} />
      );
    }
    return this.props.children;
  }
}