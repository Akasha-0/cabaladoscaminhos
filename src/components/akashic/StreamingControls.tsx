'use client';

// ============================================================================
// StreamingControls — Pause/Resume/Abort + connection status (W94-A)
// ============================================================================
//
// Cycle 94 · 2026-06-30
// Companion controls to StreamingMessage. Operates via callbacks only —
// own its own state to keep the chat container pure. Status pill mirrors
// the StreamingState discriminated union + translates it to pt-BR.
//
// LGPD: explicit "Interromper e apagar histórico" button requires double-
// confirmation (z.literal(true) — see W92-D). The control surfaces it as
// a destructive action gated behind a hold-to-confirm gesture (~1.5s).
//
// Mobile-first: every tap target ≥44px; safe-area-inset padding on the
// footer strip; reduced-motion respected.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, X, RefreshCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type ConnectionStatus =
  | 'ocioso'
  | 'conectando'
  | 'transmitindo'
  | 'pausado'
  | 'concluído'
  | 'erro';

export interface StreamingControlsProps {
  readonly status: ConnectionStatus;
  readonly attempt?: number;
  readonly retryInMs?: number | null;
  readonly onPause?: () => void;
  readonly onResume?: () => void;
  readonly onAbort?: () => void;
  readonly onRetry?: () => void;
  readonly onWipeHistory?: () => void;
  readonly className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const HOLD_TO_CONFIRM_MS = 1500;
const STATUS_TONE: Readonly<Record<ConnectionStatus, string>> = Object.freeze({
  ocioso: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
  conectando: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  transmitindo: 'bg-amber-500/20 text-amber-100 border-amber-400/50',
  pausado: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  concluído: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  erro: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
});

const STATUS_DOT: Readonly<Record<ConnectionStatus, string>> = Object.freeze({
  ocioso: 'bg-slate-400',
  conectando: 'bg-amber-300 animate-pulse',
  transmitindo: 'bg-amber-400 animate-pulse',
  pausado: 'bg-sky-300',
  concluído: 'bg-emerald-300',
  erro: 'bg-rose-300',
});

// ============================================================================
// StreamingControls
// ============================================================================

export function StreamingControls({
  status,
  attempt = 0,
  retryInMs = null,
  onPause,
  onResume,
  onAbort,
  onRetry,
  onWipeHistory,
  className,
}: StreamingControlsProps) {
  const [wipeHold, setWipeHold] = useState<boolean>(false);
  const [wipeTick, setWipeTick] = useState<number>(0);
  const wipeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // Hold-to-confirm — wipe history requires intentional gesture
  // ─────────────────────────────────────────────────────────────────────

  const beginWipeHold = useCallback(() => {
    if (onWipeHistory === undefined) return;
    setWipeHold(true);
    setWipeTick(0);
    let elapsed = 0;
    const stepMs = 100;
    const id = setInterval(() => {
      elapsed += stepMs;
      setWipeTick(Math.min(1, elapsed / HOLD_TO_CONFIRM_MS));
      if (elapsed >= HOLD_TO_CONFIRM_MS) {
        clearInterval(id);
        setWipeHold(false);
        setWipeTick(0);
        onWipeHistory();
      }
    }, stepMs);
    wipeTimerRef.current = id;
  }, [onWipeHistory]);

  const cancelWipeHold = useCallback(() => {
    if (wipeTimerRef.current !== null) {
      clearInterval(wipeTimerRef.current);
      wipeTimerRef.current = null;
    }
    setWipeHold(false);
    setWipeTick(0);
  }, []);

  useEffect(() => {
    return () => {
      if (wipeTimerRef.current !== null) {
        clearInterval(wipeTimerRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Computed affordances
  // ─────────────────────────────────────────────────────────────────────

  const showPause = status === 'transmitindo' && typeof onPause === 'function';
  const showResume = status === 'pausado' && typeof onResume === 'function';
  const showAbort = (status === 'transmitindo' || status === 'conectando' || status === 'pausado') && typeof onAbort === 'function';
  const showRetry = (status === 'erro' || status === 'ocioso') && typeof onRetry === 'function';
  const showWipe = typeof onWipeHistory === 'function';

  const retryLabel =
    status === 'erro' && attempt > 0 && retryInMs !== null
      ? `Reconectar em ${Math.ceil(retryInMs / 1000)}s (tentativa ${attempt})`
      : 'Tentar novamente';

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <footer
      role="toolbar"
      aria-label="Controles da transmissão da Akasha"
      className={cn(
        'sticky bottom-0 left-0 right-0 z-20',
        'border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md',
        'px-4 sm:px-6 pt-3',
        'pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]',
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
            'border text-caps text-tiny whitespace-nowrap',
            STATUS_TONE[status],
          )}
          data-status={status}
        >
          <span
            aria-hidden="true"
            className={cn('inline-block w-1.5 h-1.5 rounded-full', STATUS_DOT[status])}
          />
          {statusLabel(status)}
        </span>
        {attempt > 0 ? (
          <span className="text-tiny text-slate-500 truncate">tentativa {attempt}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showPause ? (
          <ToolbarButton
            label="Pausar"
            onClick={onPause!}
            icon={<Pause aria-hidden="true" className="w-4 h-4" />}
            variant="ghost"
          />
        ) : null}
        {showResume ? (
          <ToolbarButton
            label="Retomar"
            onClick={onResume!}
            icon={<Play aria-hidden="true" className="w-4 h-4" />}
            variant="ghost"
          />
        ) : null}
        {showAbort ? (
          <ToolbarButton
            label="Interromper"
            onClick={onAbort!}
            icon={<X aria-hidden="true" className="w-4 h-4" />}
            variant="warn"
          />
        ) : null}
        {showRetry ? (
          <ToolbarButton
            label={retryLabel}
            onClick={onRetry!}
            icon={<RefreshCcw aria-hidden="true" className="w-4 h-4" />}
            variant="primary"
          />
        ) : null}
        {showWipe ? (
          <ToolbarButton
            label={
              wipeHold
                ? `Mantenha pressionado… ${Math.round((1 - wipeTick) * HOLD_TO_CONFIRM_MS / 1000)}s`
                : 'Interromper e apagar histórico'
            }
            onPointerDown={beginWipeHold}
            onPointerUp={cancelWipeHold}
            onPointerLeave={cancelWipeHold}
            onPointerCancel={cancelWipeHold}
            icon={<Trash2 aria-hidden="true" className="w-4 h-4" />}
            variant="destructive"
            aria-pressed={wipeHold}
            progress={wipeTick}
          />
        ) : null}
      </div>
    </footer>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function statusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'ocioso':
      return 'ocioso';
    case 'conectando':
      return 'conectando';
    case 'transmitindo':
      return 'transmitindo';
    case 'pausado':
      return 'pausado';
    case 'concluído':
      return 'concluído';
    case 'erro':
      return 'erro';
  }
}

interface ToolbarButtonProps {
  readonly label: string;
  readonly onClick?: () => void;
  readonly onPointerDown?: () => void;
  readonly onPointerUp?: () => void;
  readonly onPointerLeave?: () => void;
  readonly onPointerCancel?: () => void;
  readonly icon: React.ReactNode;
  readonly variant: 'primary' | 'ghost' | 'warn' | 'destructive';
  readonly progress?: number;
  readonly 'aria-pressed'?: boolean;
}

function ToolbarButton({
  label,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  icon,
  variant,
  progress,
  'aria-pressed': ariaPressed,
}: ToolbarButtonProps) {
  const tone =
    variant === 'destructive'
      ? 'bg-rose-500/15 text-rose-100 border-rose-500/50 hover:bg-rose-500/25'
      : variant === 'warn'
        ? 'bg-amber-500/15 text-amber-100 border-amber-500/40 hover:bg-amber-500/25'
        : variant === 'primary'
          ? 'bg-amber-500 text-slate-950 border-amber-300 hover:bg-amber-400'
          : 'bg-slate-800/60 text-slate-100 border-slate-700/60 hover:bg-slate-700/80';
  const progressValue = typeof progress === 'number' ? Math.max(0, Math.min(1, progress)) : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      aria-pressed={ariaPressed}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'px-3.5 min-h-[44px] min-w-[44px] rounded-full border',
        'text-body-sm font-medium tracking-tight',
        'transition-colors duration-150 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300',
        'disabled:opacity-40 disabled:pointer-events-none',
        'overflow-hidden',
        tone,
      )}
    >
      {progressValue > 0 ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-rose-500/30 transition-[width] duration-100"
          style={{ width: `${progressValue * 100}%` }}
        />
      ) : null}
      <span className="relative inline-flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
    </button>
  );
}

export default StreamingControls;
