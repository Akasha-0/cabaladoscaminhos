'use client';

// ============================================================================
// DMComposer — Input de mensagem com Enter to send, Shift+Enter newline (W90s-B)
//
// Comportamento:
//   - maxLength = 2000 (alinhado ao engine MAX_MESSAGE_LENGTH).
//   - Enter envia; Shift+Enter quebra linha.
//   - Botão "Enviar" desabilitado até canSubmit = text.trim().length >= MIN.
//   - Char counter para usuários no escuro sobre limite.
//   - 44px touch targets.
//
// ARIA:
//   - Textarea com aria-label.
//   - Status live region com role="status".
//
// data-testid:
//   - dm-composer-form
//   - dm-composer-input
//   - dm-composer-send
//   - dm-composer-counter
//   - dm-composer-status
// ============================================================================

import React, { useCallback, useMemo, useRef } from 'react';
import { Send } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface DMComposerProps {
  readonly draft: string;
  readonly onSend?: (text: string) => void;
  readonly onDraftChange?: (draft: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clipped(text: string): string {
  return text.slice(0, MAX_MESSAGE_LENGTH);
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export function DMComposer({
  draft,
  onSend,
  onDraftChange,
  disabled = false,
  placeholder = 'Escreva uma mensagem',
  className,
}: DMComposerProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const text = clipped(draft ?? '');
  const trimmed = text.trim();
  const canSubmit = trimmed.length >= MIN_MESSAGE_LENGTH && !disabled;

  const counterColor = useMemo(() => {
    const pct = text.length / MAX_MESSAGE_LENGTH;
    if (pct >= 0.9) return 'text-destructive';
    if (pct >= 0.75) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  }, [text.length]);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      const next = clipped(e.target.value);
      onDraftChange?.(next);
    },
    [onDraftChange],
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLTextAreaElement>>(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (canSubmit) {
          onSend?.(trimmed);
          onDraftChange?.('');
          if (ref.current) {
            ref.current.value = '';
          }
        }
      }
    },
    [canSubmit, onSend, onDraftChange, trimmed],
  );

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!canSubmit) return;
      onSend?.(trimmed);
      onDraftChange?.('');
      if (ref.current) {
        ref.current.value = '';
      }
    },
    [canSubmit, onSend, onDraftChange, trimmed],
  );

  return (
    <form
      data-testid="dm-composer-form"
      onSubmit={handleSubmit}
      aria-label="Compor mensagem"
      className={cn('flex flex-col gap-2', className)}
    >
      <label htmlFor="dm-composer-input" className="sr-only">
        Mensagem
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="dm-composer-input"
          ref={ref}
          data-testid="dm-composer-input"
          defaultValue={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={placeholder}
          aria-label="Mensagem direta"
          className={cn(
            'min-h-[64px] max-h-48 w-full flex-1 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
        <Button
          type="submit"
          variant="golden"
          size="lg"
          disabled={!canSubmit}
          data-testid="dm-composer-send"
          aria-label="Enviar mensagem"
          className="min-h-[44px] min-w-[44px]"
        >
          <Send aria-hidden="true" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <span
          role="status"
          aria-live="polite"
          data-testid="dm-composer-status"
          className="text-muted-foreground"
        >
          {disabled
            ? 'Composer desabilitado.'
            : 'Enter envia · Shift+Enter quebra linha'}
        </span>
        <span
          data-testid="dm-composer-counter"
          className={cn('tabular-nums', counterColor)}
          aria-label={`${text.length} de ${MAX_MESSAGE_LENGTH} caracteres`}
        >
          {text.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
}

export default DMComposer;
