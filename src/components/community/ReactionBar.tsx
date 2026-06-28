'use client';

// ============================================================================
// ReactionBar — Lista agregada de reactions + picker (Post variant)
// ============================================================================
// Renderiza os emojis já reagidos como pílulas (com count) + um picker
// ancorado para adicionar novos. UI otimista: ao clicar, atualiza local
// antes da confirmação do servidor (rollback em erro).
//
// Visual: pílulas compactas com fundo âmbar quando userHasReacted,
// slate-800 quando não. Hover revela tooltip com significado.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ALLOWED_EMOJIS,
  EMOJI_MEANINGS,
  type AllowedEmoji,
  type ReactionAggregate,
} from '@/lib/community/reactions';
import { ReactionPicker } from './ReactionPicker';
import { useHaptic } from '@/hooks/useHaptic';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export interface ReactionBarProps {
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  /** Se o viewer está autenticado (desabilita picker se false) */
  isAuthenticated: boolean;
  /** Estado inicial (do SSR/parent) — opcional */
  initialReactions?: ReactionAggregate[];
  /** Classes extras */
  className?: string;
  /** Visual variant — "post" é mais espaçado, "comment" é inline compacto */
  variant?: 'post' | 'comment';
}

export function ReactionBar({
  targetType,
  targetId,
  isAuthenticated,
  initialReactions = [],
  className,
  variant = 'post',
}: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionAggregate[]>(initialReactions);
  const [loading, setLoading] = useState(initialReactions.length === 0);
  const [pending, setPending] = useState<AllowedEmoji | null>(null);
  const { light: lightHaptic, success: successHaptic, error: errorHaptic } = useHaptic();
  const { tap: tapSound, success: successSound, error: errorSound } = useSoundEffects();

  // Carrega reactions no mount se não vierem do SSR
  useEffect(() => {
    if (initialReactions.length > 0) return;
    let cancelled = false;

    fetch(`/api/reactions?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`)
      .then((r) => r.json().then((j) => ({ status: r.status, body: j })))
      .then(({ status, body }) => {
        if (cancelled) return;
        if (status === 200 && body?.data && Array.isArray(body.data)) {
          setReactions(body.data);
        }
      })
      .catch(() => {
        // Silent — UI degrada gracefully (sem reactions)
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, initialReactions.length]);

  // Toggle otimista
  const handleToggle = useCallback(
    async (emoji: AllowedEmoji) => {
      if (!isAuthenticated || pending) return;
      lightHaptic();
      tapSound();

      // Snapshot para rollback
      const snapshot = reactions;

      // Calcula novo estado local
      const existing = reactions.find((r) => r.emoji === emoji);
      let next: ReactionAggregate[];
      if (existing) {
        if (existing.userHasReacted && existing.count <= 1) {
          // Remove pílula
          next = reactions.filter((r) => r.emoji !== emoji);
        } else {
          next = reactions.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.userHasReacted ? r.count - 1 : r.count + 1,
                  userHasReacted: !r.userHasReacted,
                }
              : r
          );
        }
      } else {
        next = [
          ...reactions,
          { emoji, count: 1, userHasReacted: true },
        ];
      }
      // Re-ordena por count desc (consistente com GET)
      next.sort((a, b) => b.count - a.count);
      setReactions(next);
      setPending(emoji);

      try {
        const res = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId, emoji }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data) {
          // Rollback
          setReactions(snapshot);
          errorHaptic();
          errorSound();
        } else {
          // Confirma com o servidor
          const server = json.data as { emoji: AllowedEmoji; count: number; userHasReacted: boolean };
          setReactions((prev) => {
            const without = prev.filter((r) => r.emoji !== server.emoji);
            const merged = [
              ...without,
              { emoji: server.emoji, count: server.count, userHasReacted: server.userHasReacted },
            ];
            merged.sort((a, b) => b.count - a.count);
            return merged;
          });
          successHaptic();
          successSound();
        }
      } catch {
        setReactions(snapshot);
        errorHaptic();
        errorSound();
      } finally {
        setPending(null);
      }
    },
    [isAuthenticated, pending, reactions, targetType, targetId, lightHaptic, successHaptic, errorHaptic, tapSound, successSound, errorSound]
  );

  const selectedEmojis = useMemo(
    () => reactions.filter((r) => r.userHasReacted).map((r) => r.emoji),
    [reactions]
  );

  if (loading && reactions.length === 0) {
    // Não renderiza skeleton pesado — apenas mantém o picker funcional
    return (
      <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
        <ReactionPicker
          onSelect={handleToggle}
          selectedEmojis={[]}
          disabled={!isAuthenticated}
          size={variant === 'comment' ? 'sm' : 'md'}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5',
        variant === 'comment' && 'gap-1',
        className
      )}
      role="group"
      aria-label="Reações"
    >
      {reactions.map((r) => {
        const isPending = pending === r.emoji;
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => handleToggle(r.emoji)}
            disabled={!isAuthenticated || isPending}
            aria-pressed={r.userHasReacted}
            aria-label={`${r.count} ${EMOJI_MEANINGS[r.emoji] ?? r.emoji}${r.userHasReacted ? ' (você reagiu)' : ''}`}
            title={EMOJI_MEANINGS[r.emoji] ?? r.emoji}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              'disabled:cursor-not-allowed disabled:opacity-60',
              variant === 'comment' ? 'min-h-[28px] px-2 py-0.5 text-xs' : 'min-h-[36px] px-2.5 py-1 text-xs',
              r.userHasReacted
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600',
              isPending && 'opacity-60'
            )}
          >
            <span className="text-base leading-none" aria-hidden="true">{r.emoji}</span>
            <span className="font-medium tabular-nums">{r.count}</span>
          </button>
        );
      })}

      <ReactionPicker
        onSelect={handleToggle}
        selectedEmojis={selectedEmojis}
        disabled={!isAuthenticated || pending !== null}
        size={variant === 'comment' ? 'sm' : 'md'}
      />
    </div>
  );
}