'use client';

// ============================================================================
// BottomSheet — Modal bottom-anchored mobile-first (Material 3 pattern)
// ============================================================================
// Substitui <dialog>/<modal> em fluxos mobile. Inclui:
//  - Swipe-down-to-close (touch + pointer events, sem libs)
//  - Safe area inset (iPhone bottom bar)
//  - Backdrop fade
//  - Esc + click-outside
//  - Focus trap básico (focus first focusable on open)
//  - Scroll lock do body enquanto aberto
//  - Animações GPU (transform/opacity)
//  - Acessibilidade: role=dialog, aria-modal, aria-labelledby
// ============================================================================

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

export interface BottomSheetProps {
  /** Estado aberto (controlled) */
  open: boolean;
  /** Callback ao fechar (backdrop, esc, swipe, X button) */
  onClose: () => void;
  /** Título (acessibilidade + visual no header) */
  title?: string;
  /** Subtítulo opcional */
  description?: string;
  /** Altura inicial: 'auto' = conteúdo, 'half' = 50vh, 'full' = 90vh */
  height?: 'auto' | 'half' | 'full';
  /** Se true, esconde o botão X (use onClose externo) */
  hideCloseButton?: boolean;
  /** Se true, esconde o grabber (linha no topo) */
  hideGrabber?: boolean;
  /** Conteúdo */
  children: React.ReactNode;
  /** Classes adicionais pro sheet (não pro backdrop) */
  sheetClassName?: string;
}

const HEIGHTS: Record<NonNullable<BottomSheetProps['height']>, string> = {
  auto: 'max-h-[85vh]',
  half: 'h-[50vh]',
  full: 'h-[90vh]',
};

const SWIPE_CLOSE_THRESHOLD = 100; // px arrastados pra fechar
const SWIPE_VELOCITY_THRESHOLD = 0.5; // px/ms

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  height = 'auto',
  hideCloseButton = false,
  hideGrabber = false,
  children,
  sheetClassName = '',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const lastTRef = useRef<number>(0);
  const draggingRef = useRef<boolean>(false);
  const titleId = useId();
  const { light: lightHaptic, medium: mediumHaptic } = useHaptic();

  // Esc fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        lightHaptic();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, lightHaptic]);

  // Lock body scroll + focus first element
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus first focusable
    const t = window.setTimeout(() => {
      const el = sheetRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      el?.focus();
    }, 100);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open]);

  // Pointer/touch swipe handlers
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!sheetRef.current) return;
    // Só inicia drag se tocou no header/grabber ou se está no topo do scroll
    const isGrabberArea = (e.target as HTMLElement).closest('[data-bs-grabber]');
    const scrollTop = sheetRef.current.scrollTop;
    if (!isGrabberArea && scrollTop > 0) return;
    draggingRef.current = true;
    startYRef.current = e.clientY;
    lastYRef.current = e.clientY;
    lastTRef.current = e.timeStamp;
    sheetRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !sheetRef.current) return;
    const delta = e.clientY - startYRef.current;
    if (delta < 0) return; // só swipe-down
    sheetRef.current.style.transform = `translateY(${delta}px)`;
    lastYRef.current = e.clientY;
    lastTRef.current = e.timeStamp;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || !sheetRef.current) return;
      const delta = e.clientY - startYRef.current;
      const dt = e.timeStamp - lastTRef.current;
      const velocity = dt > 0 ? delta / dt : 0;
      const shouldClose =
        delta > SWIPE_CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

      if (shouldClose) {
        // Anima saindo
        sheetRef.current.style.transition = 'transform 200ms ease-in';
        sheetRef.current.style.transform = 'translateY(100%)';
        mediumHaptic();
        window.setTimeout(onClose, 200);
      } else {
        // Volta pro lugar
        sheetRef.current.style.transition = 'transform 200ms ease-out';
        sheetRef.current.style.transform = 'translateY(0)';
        window.setTimeout(() => {
          if (sheetRef.current) sheetRef.current.style.transition = '';
        }, 220);
      }
      draggingRef.current = false;
      try {
        sheetRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // pointerId pode já estar liberado
      }
    },
    [mediumHaptic, onClose],
  );

  const onBackdropClick = () => {
    lightHaptic();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onBackdropClick}
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          'animate-in fade-in duration-200',
        )}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? `${titleId}-desc` : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          'relative z-10 w-full flex flex-col',
          'bg-slate-900 dark:bg-slate-950 border-t border-slate-700/50 rounded-t-3xl shadow-2xl',
          HEIGHTS[height],
          'animate-in slide-in-from-bottom duration-300 ease-out',
          sheetClassName,
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        {/* Grabber */}
        {!hideGrabber && (
          <div
            data-bs-grabber
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            aria-hidden="true"
          >
            <div className="h-1.5 w-12 rounded-full bg-slate-700/60" />
          </div>
        )}

        {/* Header */}
        {(title || !hideCloseButton) && (
          <div
            data-bs-grabber
            className="flex items-start justify-between gap-3 px-5 py-3 border-b border-slate-800/50 touch-none"
          >
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-slate-100 font-cinzel truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={`${titleId}-desc`}
                  className="text-xs text-slate-400 mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={() => {
                  lightHaptic();
                  onClose();
                }}
                aria-label="Fechar"
                className="p-2 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;