'use client';

/**
 * PullToRefreshIndicator — feedback visual durante pull-to-refresh.
 * ----------------------------------------------------------------------------
 * Mostra um spinner com:
 *   - Ícone rotacionando de acordo com a distância (0-360deg)
 *   - Texto: "Puxe para atualizar" / "Solte para atualizar" / "Atualizando..."
 *   - Gradiente místico (gold → violet) alinhado com o brand
 *
 * Usado em conjunto com `usePullToRefresh`:
 *   <PullToRefreshIndicator
 *     pullDistance={pullDistance}
 *     isRefreshing={isRefreshing}
 *     threshold={80}
 *   />
 */

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
  className,
}: PullToRefreshIndicatorProps) {
  // Renderiza sempre que há drag OU refresh ativo
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const ready = pullDistance >= threshold;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        isRefreshing
          ? 'Atualizando conteúdo'
          : ready
          ? 'Solte para atualizar'
          : 'Puxe para baixo para atualizar'
      }
      className={cn(
        'absolute top-0 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-10',
        'transition-opacity duration-200',
        isRefreshing || pullDistance > 8 ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <RefreshCw
          className={cn(
            'w-5 h-5 transition-colors duration-200',
            isRefreshing
              ? 'text-amber-300 animate-spin'
              : ready
              ? 'text-amber-300'
              : 'text-slate-500',
          )}
          style={{
            transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
            transition: 'transform 100ms linear',
          }}
          aria-hidden="true"
        />
        <span
          className={cn(
            'text-[10px] font-medium uppercase tracking-wider',
            isRefreshing
              ? 'text-amber-300'
              : ready
              ? 'text-amber-200'
              : 'text-slate-500',
          )}
        >
          {isRefreshing
            ? 'Atualizando...'
            : ready
            ? 'Solte para atualizar'
            : 'Puxe para atualizar'}
        </span>
      </div>
    </div>
  );
}

export default PullToRefreshIndicator;
