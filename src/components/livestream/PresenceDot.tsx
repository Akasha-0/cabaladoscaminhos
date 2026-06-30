'use client';

// ============================================================================
// PresenceDot — Live stream presence indicator (count only)
// ============================================================================
// Small green dot + count: "47 pessoas presentes" (pt-BR) / "47 people
// present" (EN).
//
// PRIVACY: no names, no avatars. Just a count. The "presence" is a
// gentle witness to who else is here — not a leaderboard or ranking.
//
// Updates via SSE on a debounced 1s window (see engine).
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PresenceDotProps {
  /** Initial count (from SSR snapshot). */
  initialCount: number;
  /** BCP-47 locale. */
  locale?: 'pt-BR' | 'en';
  /** Stream id (for SSE subscription). */
  streamId: string;
  /** Optional className passthrough. */
  className?: string;
}

function formatCount(n: number, locale: 'pt-BR' | 'en'): string {
  if (n === 0) {
    return locale === 'pt-BR' ? 'Ninguém presente agora' : 'No one present right now';
  }
  if (n === 1) {
    return locale === 'pt-BR' ? '1 pessoa presente' : '1 person present';
  }
  // Use Intl for thousands separator (PT-BR uses "." for thousands, EN uses ",")
  const formatter = new Intl.NumberFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US');
  const formatted = formatter.format(n);
  return locale === 'pt-BR'
    ? `${formatted} pessoas presentes`
    : `${formatted} people present`;
}

export function PresenceDot({
  initialCount,
  locale = 'pt-BR',
  streamId,
  className,
}: PresenceDotProps): React.ReactElement {
  const [count, setCount] = useState<number>(initialCount);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE subscription to /api/streams/[id]/presence
  useEffect(() => {
    if (typeof globalThis.EventSource === 'undefined') {
      // SSR or unsupported environment — no-op
      return undefined;
    }
    const url = `/api/streams/${encodeURIComponent(streamId)}/presence`;
    const es = new globalThis.EventSource(url);
    eventSourceRef.current = es;

    const onMessage = (ev: MessageEvent<string>): void => {
      try {
        const payload = JSON.parse(ev.data) as {
          kind?: string;
          count?: number;
          event?: { count?: number };
        };
        if (payload.kind === 'snapshot' && typeof payload.count === 'number') {
          setCount(payload.count);
        } else if (
          payload.kind === 'presence' &&
          payload.event &&
          typeof payload.event.count === 'number'
        ) {
          setCount(payload.event.count);
        }
      } catch {
        // Bad payload — ignore
      }
    };

    const onError = (): void => {
      // EventSource auto-reconnects; no manual handling needed.
      // We don't set state — UI keeps last known good count.
    };

    es.addEventListener('message', onMessage);
    es.addEventListener('error', onError);

    return () => {
      es.removeEventListener('message', onMessage);
      es.removeEventListener('error', onError);
      es.close();
      eventSourceRef.current = null;
    };
  }, [streamId]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={formatCount(count, locale)}
      data-component="presence-dot"
      data-stream-id={streamId}
      data-presence-count={count}
      className={cn(
        'inline-flex items-center gap-2',
        'rounded-full border border-slate-700/60 bg-slate-900/70 backdrop-blur',
        'px-3 py-1.5',
        'text-sm text-slate-200',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-block h-2.5 w-2.5 rounded-full bg-emerald-500',
          'shadow-[0_0_8px_rgba(16,185,129,0.6)]'
        )}
      >
        {/* Subtle pulse halo */}
        <span
          className={cn(
            'absolute inset-0 rounded-full bg-emerald-500/40',
            'animate-ping'
          )}
          style={{ animationDuration: '2s' }}
        />
      </span>
      <span className="tabular-nums">
        {formatCount(count, locale)}
      </span>
    </div>
  );
}