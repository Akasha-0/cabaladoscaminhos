'use client';

// ============================================================================
// PullToRefresh — Pull-to-refresh gesture (Wave 24)
// ============================================================================
// Implementação própria em vez de lib externa — zero KB adicionado.
//
// Mechanics:
//   - touchstart em <N px> do topo → começa tracking
//   - touchmove → atualiza offset (clamped a PULL_MAX)
//   - touchend → se offset >= THRESHOLD, dispara onRefresh + haptic
//   - durante pull: spinner gira + opacity cresce
//
// Touch-only (mobile-first). Em desktop, é no-op (pointer events coarse).
//
// A11y:
//   - role="button" no spinner wrapper, aria-label dinâmico
//   - respeita prefers-reduced-motion (sem animação no spinner)
// ============================================================================

import * as React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

const PULL_THRESHOLD = 80; // px — distância mínima pra disparar
const PULL_MAX = 140;       // px — clamp superior
const TOP_GUARD = 80;       // px do topo — só ativa perto do scrollTop=0

export interface PullToRefreshProps {
  /** Callback async disparado quando o usuário solta após o threshold. */
  onRefresh: () => Promise<void> | void;
  /** Conteúdo rolável que será observado. */
  children: React.ReactNode;
  /** Visual hint enquanto puxando (default "Puxe para atualizar"). */
  pullHint?: string;
  /** Visual hint quando atinge threshold (default "Solte para atualizar"). */
  releaseHint?: string;
  /** Visual hint durante refresh (default "Atualizando..."). */
  refreshingHint?: string;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  pullHint = 'Puxe para atualizar',
  releaseHint = 'Solte para atualizar',
  refreshingHint = 'Atualizando...',
  className,
}: PullToRefreshProps) {
  const { medium: mediumHaptic, light: lightHaptic } = useHaptic();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const startYRef = React.useRef<number | null>(null);
  const pullDistanceRef = React.useRef(0);
  const triggeredRef = React.useRef(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [hint, setHint] = React.useState<string | null>(null);

  // Detecta prefers-reduced-motion (uma vez, com subscribe para mudanças)
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const onTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return;
      const el = containerRef.current;
      if (!el) return;
      // Só inicia se estamos no topo
      if (el.scrollTop > TOP_GUARD) return;
      startYRef.current = e.touches[0]?.clientY ?? null;
    },
    [refreshing],
  );

  const onTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return;
      if (startYRef.current === null) return;
      const el = containerRef.current;
      if (!el || el.scrollTop > TOP_GUARD) {
        startYRef.current = null;
        return;
      }
      const currentY = e.touches[0]?.clientY ?? 0;
      const delta = currentY - startYRef.current;
      if (delta <= 0) {
        // Ignora pull-up (sem utilidade)
        return;
      }
      // Resistência: 0.4 (mobile-feel padrão)
      const damped = Math.min(PULL_MAX, delta * 0.4);
      pullDistanceRef.current = damped;
      setPullDistance(damped);

      // Haptic leve ao cruzar o threshold (uma vez)
      if (damped >= PULL_THRESHOLD && !triggeredRef.current) {
        triggeredRef.current = true;
        lightHaptic();
        setHint(releaseHint);
      } else if (damped < PULL_THRESHOLD && triggeredRef.current) {
        triggeredRef.current = false;
        setHint(pullHint);
      } else if (!triggeredRef.current) {
        setHint(pullHint);
      }
    },
    [refreshing, lightHaptic, pullHint, releaseHint],
  );

  const onTouchEnd = React.useCallback(async () => {
    startYRef.current = null;
    if (refreshing) return;
    const triggered = triggeredRef.current;
    const distance = pullDistanceRef.current;

    if (!triggered || distance < PULL_THRESHOLD) {
      // Cancelou
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setHint(null);
      triggeredRef.current = false;
      return;
    }

    // Dispara refresh
    setRefreshing(true);
    setHint(refreshingHint);
    mediumHaptic();
    pullDistanceRef.current = PULL_THRESHOLD; // mantém spinner visível
    setPullDistance(PULL_THRESHOLD);
    try {
      await onRefresh();
    } finally {
      // Mantém o spinner visível pelo menos 400ms pra dar feedback
      window.setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
        setHint(null);
        pullDistanceRef.current = 0;
        triggeredRef.current = false;
      }, reducedMotion ? 0 : 400);
    }
  }, [refreshing, mediumHaptic, onRefresh, refreshingHint, reducedMotion]);

  // Calcula rotation: 0..360 conforme distância
  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Spinner overlay */}
      <div
        aria-hidden={pullDistance === 0 && !refreshing}
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center transition-opacity',
          pullDistance > 4 || refreshing ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transform: `translateY(${pullDistance - 28}px)`,
          transition: reducedMotion ? 'opacity 100ms linear' : 'transform 80ms ease-out',
        }}
      >
        <div
          role="status"
          aria-live="polite"
          aria-label={refreshing ? refreshingHint : hint ?? ''}
          className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/85 px-3 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur"
        >
          {refreshing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : (
            <ArrowDown
              className={cn(
                'h-3.5 w-3.5 text-amber-400 transition-transform',
                progress >= 1 && 'text-emerald-400',
              )}
              style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 60ms linear' }}
            />
          )}
          <span>{refreshing ? refreshingHint : hint ?? pullHint}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default PullToRefresh;
