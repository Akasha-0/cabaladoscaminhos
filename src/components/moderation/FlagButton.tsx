'use client';

// ============================================================================
// FlagButton — Discreto, acessível, abre FlagModal
// ============================================================================
// Aparece em PostCard e CommentThread. Ícone de bandeira pequeno que abre
// um modal respeitoso (não um report "agressivo" estilo redes grandes).
//
// Mobile-first: touch target ≥ 44px, modal full-screen no mobile.
// ============================================================================

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { FlagModal } from './FlagModal';
import { cn } from '@/lib/utils';

export type FlagTargetType = 'POST' | 'COMMENT' | 'USER' | 'GROUP';

export interface FlagButtonProps {
  targetType: FlagTargetType;
  targetId: string;
  /** Rótulo custom (default: "Denunciar") */
  label?: string;
  /** Variante visual: 'icon' (padrão) | 'menu-item' */
  variant?: 'icon' | 'menu-item';
  /** Callback após envio bem-sucedido */
  onReported?: (info: { id: string; alreadyReported: boolean }) => void;
  className?: string;
}

export function FlagButton({
  targetType,
  targetId,
  label = 'Denunciar',
  variant = 'icon',
  onReported,
  className,
}: FlagButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Não propaga para evitar que outros handlers (ex: link do post) disparem
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          title={label}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 rounded-lg text-xs text-slate-500 hover:text-amber-300 hover:bg-slate-800/50 active:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            className
          )}
        >
          <Flag className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ) : (
        <button
          type="button"
          role="menuitem"
          onClick={handleClick}
          className={cn(
            'w-full text-left px-3 py-2.5 min-h-[44px] text-sm text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 flex items-center gap-2 focus-visible:outline-none focus-visible:bg-slate-800/70 focus-visible:text-slate-100',
            className
          )}
        >
          <Flag className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </button>
      )}

      <FlagModal
        open={open}
        onOpenChange={setOpen}
        targetType={targetType}
        targetId={targetId}
        onReported={onReported}
      />
    </>
  );
}
