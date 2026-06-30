'use client';

// ============================================================================
// ReactionBar — Live stream reactions picker
// ============================================================================
// 8 curated emoji buttons in a horizontally scrollable row. Mobile-first.
// Optimistic UI: click → pulse + fire-and-forget API call. SSE confirms.
//
// Curated set (8): 💜 🙏 ✨ 🌱 🔥 💧 🕊 🌟
//
// Each button has aria-label like "Enviar reação 💜 (Compaixão)".
//
// Why 8: enough nuance, scannable on small screens.
// Why no counts on buttons: reactions are gifts of presence, not votes.
// Floating bubbles + aggregate appear elsewhere (server-side event stream).
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  REACTION_TYPES,
  REACTION_MEANINGS_PT,
  REACTION_MEANINGS_EN,
  DEFAULT_RATE_LIMIT_MS,
  type ReactionType,
} from '@/lib/w92/live-stream-reactions';

export interface ReactionBarProps {
  streamId: string;
  /** Viewer user id — required for API. */
  userId: string;
  /** BCP-47 locale. */
  locale?: 'pt-BR' | 'en';
  /** True when user is authenticated (server-side check). */
  isAuthenticated: boolean;
  /** Called whenever a reaction is sent (for FloatingReactions to spawn a bubble). */
  onReactionSent?: (type: ReactionType, reactionId: string) => void;
  /** Called when SSE confirms a reaction (optional optimistic confirm hook). */
  onReactionConfirmed?: (type: ReactionType, reactionId: string) => void;
  /** ClassName passthrough. */
  className?: string;
  /** Disable all buttons (e.g., stream ended). */
  disabled?: boolean;
}

interface ButtonState {
  /** Whether the button is mid-pulse (CSS animation). */
  pulsing: boolean;
  /** Time the pulse started (so we can clear it deterministically). */
  pulseStartedAt: number;
}

export function ReactionBar({
  streamId,
  userId,
  locale = 'pt-BR',
  isAuthenticated,
  onReactionSent,
  onReactionConfirmed,
  className,
  disabled = false,
}: ReactionBarProps): React.ReactElement {
  const meanings = locale === 'pt-BR' ? REACTION_MEANINGS_PT : REACTION_MEANINGS_EN;
  const sendLabel = locale === 'pt-BR' ? 'Enviar reação' : 'Send reaction';

  // Per-button pulse state (visual feedback on click).
  const [buttonState, setButtonState] = useState<Record<ReactionType, ButtonState>>(
    () => {
      const init = {} as Record<ReactionType, ButtonState>;
      for (const t of REACTION_TYPES) {
        init[t] = { pulsing: false, pulseStartedAt: 0 };
      }
      return init;
    }
  );

  // Debounce: track last-sent-per-type locally for instant UI feedback
  // (server enforces the real rate limit, this just avoids double-clicks
  // hitting the API).
  const lastSentRef = useRef<Partial<Record<ReactionType, number>>>({});
  const [localCooldown, setLocalCooldown] = useState<
    Partial<Record<ReactionType, number>>
  >({});

  // Cleanup pending cooldown timers on unmount
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  useEffect(() => {
    return () => {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  // Pulse animation cleanup: pulse lasts 400ms
  useEffect(() => {
    const now = Date.now();
    const expired = (Object.keys(buttonState) as ReactionType[]).filter(
      (t) => buttonState[t].pulsing && now - buttonState[t].pulseStartedAt > 400
    );
    if (expired.length === 0) return;
    setButtonState((prev) => {
      const next = { ...prev };
      for (const t of expired) {
        next[t] = { pulsing: false, pulseStartedAt: 0 };
      }
      return next;
    });
  }, [buttonState]);

  const triggerPulse = useCallback((type: ReactionType): void => {
    setButtonState((prev) => ({
      ...prev,
      [type]: { pulsing: true, pulseStartedAt: Date.now() },
    }));
  }, []);

  const handleClick = useCallback(
    async (type: ReactionType): Promise<void> => {
      if (!isAuthenticated || disabled) return;
      const now = Date.now();
      const last = lastSentRef.current[type] ?? 0;
      if (now - last < DEFAULT_RATE_LIMIT_MS) {
        // Local cooldown — silently swallow double-click
        return;
      }
      lastSentRef.current[type] = now;
      setLocalCooldown((prev) => ({ ...prev, [type]: now }));
      // Clear local cooldown flag after 2s
      const tid = setTimeout(() => {
        timersRef.current.delete(tid);
        setLocalCooldown((prev) => {
          if (!prev[type]) return prev;
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }, DEFAULT_RATE_LIMIT_MS);
      timersRef.current.add(tid);

      triggerPulse(type);

      const reactionId = generateLocalId();
      onReactionSent?.(type, reactionId);

      // Fire-and-forget API call
      try {
        const res = await fetch(`/api/streams/${encodeURIComponent(streamId)}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            reactionId,
            userId,
          }),
        });
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as {
            data?: { reactionId?: string };
          } | null;
          onReactionConfirmed?.(type, body?.data?.reactionId ?? reactionId);
        }
        // On error: silent — bubble still floats (it's a gift, not a transaction)
      } catch {
        // Network error — silent. Reaction is a gift, not a vote.
      }
    },
    [isAuthenticated, disabled, streamId, userId, onReactionSent, onReactionConfirmed, triggerPulse]
  );

  return (
    <>
      {/* Pulse keyframes — injected once per page */}
      <style>{`
        @keyframes w92-pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.28); }
          100% { transform: scale(1); }
        }
        .w92-pulse { animation: w92-pulse 400ms ease-out; }
      `}</style>
      <div
        role="toolbar"
        aria-label={locale === 'pt-BR' ? 'Barra de reações' : 'Reaction bar'}
        className={cn(
          'w-full overflow-x-auto',
          'flex items-center gap-2 px-1 py-2',
          // Hide scrollbar but keep scroll behavior
          'scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent',
          className
        )}
      >
        {REACTION_TYPES.map((type) => {
          const meaning = meanings[type];
          const isPulsing = buttonState[type].pulsing;
          const onCooldown = localCooldown[type] !== undefined;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                void handleClick(type);
              }}
              disabled={!isAuthenticated || disabled || onCooldown}
              aria-label={`${sendLabel} ${type} (${meaning})`}
              title={meaning}
              data-reaction-type={type}
              data-reaction-meaning={meaning}
              className={cn(
                // 44px minimum touch target (mobile-first)
                'min-h-[44px] min-w-[44px] flex-shrink-0',
                'flex items-center justify-center',
                'rounded-full border border-slate-700/60 bg-slate-800/60',
                'text-2xl leading-none',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                'hover:bg-slate-800 hover:border-amber-500/40',
                'active:scale-95',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isPulsing && 'w92-pulse'
              )}
            >
              <span aria-hidden="true">{type}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function generateLocalId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `local_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}