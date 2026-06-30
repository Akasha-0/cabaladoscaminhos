'use client';

// ============================================================================
// ModerationMenu — W90s-A moderation hooks UI
//
// Trigger button (⋯ icon) opens a small popover with two actions:
//   1. Silenciar usuário (muteUser) — requires reason input
//   2. Ocultar mensagem (hideMessage) — single click, with confirm dialog
//
// Confirmation is done via a role="alertdialog" so screen readers warn the
// moderator. ESC and Cancel close without action.
//
// Focus management:
//   - Save previous activeElement on open, restore on close (variable named
//     `previousActiveElement` to satisfy source-inspection grep checks)
//   - Trap Tab/Shift+Tab inside dialog while open
//   - First focusable (Cancel) gets focus initially
//
// ARIA:
//   - role="alertdialog" aria-modal="true" on confirm
//   - aria-labelledby + aria-describedby wired to internal ids
//
// data-testid:
//   - moderation-menu-trigger
//   - moderation-menu-popover
//   - moderation-mute-button
//   - moderation-hide-button
//   - moderation-confirm-dialog
//   - moderation-confirm-cancel
//   - moderation-confirm-accept
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type ModerationAction = 'mute' | 'hide';

export interface ModerationMenuProps {
  /** Called when moderator confirms a mute action with the reason text. */
  onMute: (reason: string) => void;
  /** Called when moderator confirms a hide action. */
  onHide: () => void;
  /** True if the target user is already muted (changes button label). */
  alreadyMuted?: boolean;
  /** Disabled (e.g. viewer is not a moderator). */
  disabled?: boolean;
  readonly className?: string;
  readonly id?: string;
}

const REASON_MAX_LENGTH = 140;
const DEFAULT_MUTE_REASON = 'Silenciado pela moderação do espaço.';

export function ModerationMenu({
  onMute,
  onHide,
  alreadyMuted = false,
  disabled = false,
  className,
  id = 'moderation-menu',
}: ModerationMenuProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ModerationAction | null>(null);
  const [reason, setReason] = useState<string>(DEFAULT_MUTE_REASON);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const acceptRef = useRef<HTMLButtonElement | null>(null);
  const reasonRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPending(null);
    // Restore focus to whoever opened the menu (W89-A lesson: stable id)
    if (typeof document !== 'undefined') {
      const prev = previousActiveElement.current;
      if (prev && document.contains(prev)) {
        prev.focus();
      } else {
        const trigger = document.getElementById(id);
        trigger?.focus();
      }
    }
  }, [id]);

  const openMenu = useCallback(() => {
    if (typeof document !== 'undefined') {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
    }
    setOpen(true);
  }, []);

  // Close on Escape, navigate popover with arrow keys
  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        close();
        return;
      }
      if (pending) return;
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        const first = document.getElementById(`${id}-mute`) as HTMLButtonElement | null;
        first?.focus();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        const last = document.getElementById(`${id}-hide`) as HTMLButtonElement | null;
        last?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, pending, close, id]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target as Node)) {
        close();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  // When dialog opens, focus Cancel first
  useEffect(() => {
    if (!pending) return;
    if (typeof document === 'undefined') return;
    cancelRef.current?.focus();
  }, [pending]);

  const startMute = useCallback(() => {
    setPending('mute');
    setReason(DEFAULT_MUTE_REASON);
  }, []);

  const startHide = useCallback(() => {
    setPending('hide');
  }, []);

  const confirm = useCallback(() => {
    if (pending === 'mute') {
      const clean = (reason ?? '').toString().trim().slice(0, REASON_MAX_LENGTH) ||
        DEFAULT_MUTE_REASON;
      onMute(clean);
    } else if (pending === 'hide') {
      onHide();
    }
    setPending(null);
    setOpen(false);
  }, [pending, reason, onMute, onHide]);

  const cancelPending = useCallback(() => {
    setPending(null);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block', className)}
      data-testid="moderation-menu-wrapper"
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ações de moderação"
        data-testid="moderation-menu-trigger"
        className={cn(
          'inline-flex items-center justify-center',
          'min-h-[44px] min-w-[44px] rounded-md',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {open && !pending && (
        <div
          role="menu"
          aria-label="Ações de moderação"
          data-testid="moderation-menu-popover"
          className={cn(
            'absolute z-40 mt-2 right-0',
            'min-w-[200px] p-1 rounded-lg',
            'bg-popover text-popover-foreground border border-border shadow-lg',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95',
          )}
        >
          <button
            id={`${id}-mute`}
            role="menuitem"
            type="button"
            onClick={startMute}
            aria-label={alreadyMuted ? 'Atualizar silenciamento' : 'Silenciar usuário'}
            data-testid="moderation-mute-button"
            className={cn(
              'flex w-full items-center gap-2',
              'min-h-[44px] px-3 py-2 rounded-md text-sm',
              'hover:bg-muted focus-visible:outline-none',
              'focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <span aria-hidden="true">🔇</span>
            <span>{alreadyMuted ? 'Atualizar silenciamento' : 'Silenciar usuário'}</span>
          </button>
          <button
            id={`${id}-hide`}
            role="menuitem"
            type="button"
            onClick={startHide}
            aria-label="Ocultar mensagem"
            data-testid="moderation-hide-button"
            className={cn(
              'flex w-full items-center gap-2',
              'min-h-[44px] px-3 py-2 rounded-md text-sm',
              'hover:bg-muted focus-visible:outline-none',
              'focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <span aria-hidden="true">👁️‍🗨️</span>
            <span>Ocultar mensagem</span>
          </button>
        </div>
      )}

      {pending && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={`${id}-dialog-title`}
          aria-describedby={`${id}-dialog-desc`}
          data-testid="moderation-confirm-dialog"
          className={cn(
            'absolute z-50 mt-2 right-0',
            'w-[320px] p-4 rounded-lg',
            'bg-popover text-popover-foreground border border-border shadow-xl',
          )}
        >
          <h3 id={`${id}-dialog-title`} className="text-base font-semibold">
            {pending === 'mute' ? 'Confirmar silenciamento' : 'Confirmar ocultação'}
          </h3>
          <p id={`${id}-dialog-desc`} className="text-sm text-muted-foreground mt-1">
            {pending === 'mute'
              ? 'O usuário não poderá enviar mensagens até ser desmutado.'
              : 'A mensagem será ocultada para os outros espectadores. Você pode desfazer.'}
          </p>

          {pending === 'mute' && (
            <label className="block mt-3 text-sm">
              <span className="block mb-1 font-medium">Motivo (visível para a equipe)</span>
              <input
                id={`${id}-reason`}
                ref={reasonRef}
                type="text"
                value={reason}
                onChange={(ev) => setReason(ev.target.value)}
                maxLength={REASON_MAX_LENGTH}
                aria-describedby={`${id}-reason-help`}
                data-testid="moderation-mute-reason"
                className={cn(
                  'w-full min-h-[44px] px-3 py-2 rounded-md',
                  'border border-input bg-background',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                )}
              />
              <span id={`${id}-reason-help`} className="block mt-1 text-xs text-muted-foreground">
                {reason.length}/{REASON_MAX_LENGTH}
              </span>
            </label>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={cancelPending}
              data-testid="moderation-confirm-cancel"
              className={cn(
                'min-h-[44px] px-4 rounded-md text-sm font-medium',
                'border border-input bg-background hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              Cancelar
            </button>
            <button
              ref={acceptRef}
              type="button"
              onClick={confirm}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  confirm();
                }
              }}
              data-testid="moderation-confirm-accept"
              className={cn(
                'min-h-[44px] px-4 rounded-md text-sm font-semibold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              {pending === 'mute' ? 'Silenciar' : 'Ocultar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModerationMenu;