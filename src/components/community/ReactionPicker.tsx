'use client';

// ============================================================================
// ReactionPicker — Popover com 8 emojis espiritualizados (curados)
// ============================================================================
// Componente leve (sem lib externa). Abre como popover ancorado ao botão
// gatilho. Click num emoji dispara onSelect(emoji). Foco gerenciado (ESC +
// click-outside) e acessível (aria-haspopup, aria-expanded, role=dialog).
//
// Mobile-first: 44px touch targets no gatilho, grid 4x2 no popover
// (suficiente para polegar).
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALLOWED_EMOJIS,
  EMOJI_MEANINGS,
  type AllowedEmoji,
} from '@/lib/community/reactions';

export interface ReactionPickerProps {
  /** Callback disparado ao clicar num emoji */
  onSelect: (emoji: AllowedEmoji) => void;
  /** Emojis que o viewer já usou (renderiza como "selected") */
  selectedEmojis?: AllowedEmoji[];
  /** Estado disabled (ex.: usuário não autenticado) */
  disabled?: boolean;
  /** Label acessível do gatilho */
  label?: string;
  /** Visual size: "sm" para inline em comment, "md" para post */
  size?: 'sm' | 'md';
  /** Classes extras aplicadas ao wrapper */
  className?: string;
}

export function ReactionPicker({
  onSelect,
  selectedEmojis = [],
  disabled = false,
  label = 'Reagir',
  size = 'md',
  className,
}: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Fecha ao clicar fora ou pressionar ESC
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const handleSelect = useCallback(
    (emoji: AllowedEmoji) => {
      onSelect(emoji);
      // Fecha o popover após seleção — UX padrão (Slack, Discord, GitHub).
      close();
    },
    [onSelect, close]
  );

  const selectedSet = new Set<AllowedEmoji>(selectedEmojis);

  return (
    <div ref={wrapperRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
          size === 'sm' ? 'min-h-[36px] min-w-[36px] px-2' : 'min-h-[44px] min-w-[44px] px-3'
        )}
      >
        <Plus className={size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'} aria-hidden="true" />
        {size === 'md' && <span className="text-xs">Reagir</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Escolher reação"
          className={cn(
            'absolute right-0 top-full mt-2 z-20',
            'rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-lg shadow-black/50',
            'p-2 animate-in fade-in slide-in-from-top-1'
          )}
          // 8 emojis em grid 4x2 (suficiente para a curadoria)
          style={{ width: size === 'sm' ? '208px' : '240px' }}
        >
          <div className="grid grid-cols-4 gap-1">
            {ALLOWED_EMOJIS.map((emoji) => {
              const isSelected = selectedSet.has(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  title={`${emoji} — ${EMOJI_MEANINGS[emoji]}`}
                  aria-label={`Reagir com ${EMOJI_MEANINGS[emoji]}`}
                  aria-pressed={isSelected}
                  onClick={() => handleSelect(emoji)}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg transition-all',
                    'min-h-[44px] min-w-[44px] text-xl',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
                    isSelected
                      ? 'bg-amber-500/20 ring-1 ring-amber-500/40'
                      : 'hover:bg-slate-800/70 active:scale-95'
                  )}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 px-1.5 text-[10px] text-slate-500 leading-tight">
            Reações carregam emoção, não só “curtir”.
          </p>
        </div>
      )}
    </div>
  );
}