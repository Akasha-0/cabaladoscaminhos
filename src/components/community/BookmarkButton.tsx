'use client';

// ============================================================================
// BookmarkButton — "Salvar para ler depois"
// ============================================================================
// Botão de bookmark com toggle otimista. Standalone (recebe o estado
// inicial) — pode ser usado dentro de PostCard, página de detalhe do
// post, e na lista de bookmarks para "remover".
//
// Comportamento:
//   - onClick otimista → flip local + POST /api/posts/[id]/bookmark
//   - rollback em caso de erro
//   - 44px touch target (mobile-first)
//   - aria-pressed para acessibilidade
// ============================================================================

import React, { useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BookmarkButtonProps {
  postId: string;
  bookmarked: boolean;
  /** Callback após toggle bem-sucedido (servidor confirmou) */
  onChange?: (bookmarked: boolean) => void;
  /** Label acessível (i18n) */
  label?: string;
  /** Visual size — 'sm' para usar em card, 'md' para destaque */
  size?: 'sm' | 'md';
  /** Collection opcional (default = 'default') */
  collectionName?: string;
  /** Se desabilitado (ex: usuário não autenticado — desabilita + mostra CTA) */
  disabled?: boolean;
  className?: string;
}

export function BookmarkButton({
  postId,
  bookmarked: initialBookmarked,
  onChange,
  label = 'Salvar post',
  size = 'sm',
  collectionName,
  disabled = false,
  className,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Sincroniza quando a prop muda externamente (ex: feed refresh)
  React.useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || pending) return;
    setError(null);

    // Optimistic flip
    const prev = bookmarked;
    setBookmarked(!prev);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/bookmark`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            collectionName ? { collectionName } : {}
          ),
        });
        if (!res.ok) {
          // Rollback
          setBookmarked(prev);
          const json = (await res.json().catch(() => null)) as
            | { error?: { message?: string } }
            | null;
          setError(json?.error?.message ?? 'Não foi possível salvar');
          return;
        }
        const json = (await res.json().catch(() => null)) as
          | { data?: { bookmarked?: boolean } }
          | null;
        // Confirma com o servidor
        if (json?.data?.bookmarked !== undefined) {
          setBookmarked(json.data.bookmarked);
          onChange?.(json.data.bookmarked);
        } else {
          onChange?.(!prev);
        }
      } catch (err) {
        // Rollback
        setBookmarked(prev);
        setError(err instanceof Error ? err.message : 'Erro de rede');
      }
    });
  };

  const Icon = bookmarked ? BookmarkCheck : Bookmark;
  const sizeClass =
    size === 'md' ? 'min-h-[44px] min-w-[44px] p-2.5' : 'min-h-[44px] min-w-[44px] p-2';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-label={label}
      aria-pressed={bookmarked}
      title={bookmarked ? 'Salvo — clique para remover' : 'Salvar para ler depois'}
      className={cn(
        sizeClass,
        'inline-flex items-center justify-center rounded-lg transition-all',
        'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        bookmarked
          ? 'text-amber-400 bg-amber-500/10'
          : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/5',
        disabled && 'opacity-50 cursor-not-allowed',
        pending && 'opacity-70',
        className
      )}
    >
      {pending ? (
        <Loader2 className={cn('animate-spin', size === 'md' ? 'w-5 h-5' : 'w-4 h-4')} />
      ) : (
        <Icon
          className={cn(size === 'md' ? 'w-5 h-5' : 'w-4 h-4', bookmarked && 'fill-amber-400')}
          aria-hidden="true"
        />
      )}
      {error && (
        <span role="alert" className="sr-only">
          {error}
        </span>
      )}
    </button>
  );
}
