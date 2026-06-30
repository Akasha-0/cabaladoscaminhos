'use client';

// ============================================================================
// FloatingReactions — Canvas-free floating emoji bubbles
// ============================================================================
// Pure CSS animation (translateY + opacity + slight horizontal drift).
// No <canvas> element — just absolutely positioned <div>s. Easier a11y,
// easier SSR fallback, easier to debug.
//
// Curated reactions: 💜 🙏 ✨ 🌱 🔥 💧 🕊 🌟
//
// Cap: MAX_FLOATING_BUBBLES (30). Older bubbles get culled when over cap.
//
// Random horizontal start (0-100%) gives a "firework" feel without
// requiring a canvas element.
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MAX_FLOATING_BUBBLES, type ReactionType } from '@/lib/w92/live-stream-reactions';

export interface FloatingReactionsProps {
  /** Called by ReactionBar when a reaction is sent. Adds a bubble. */
  onSpawn?: (type: ReactionType, reactionId: string) => void;
  /** Externally controlled: child component receives spawn commands. */
  spawnRef?: React.MutableRefObject<((type: ReactionType, reactionId: string) => void) | null>;
  /** ClassName for the container. */
  className?: string;
  /** BCP-47 locale. */
  locale?: 'pt-BR' | 'en';
}

interface Bubble {
  id: string;
  type: ReactionType;
  /** When spawned (epoch ms). */
  startedAt: number;
  /** Horizontal position (0-100, %). */
  x: number;
  /** Vertical drift variant (px) — keeps successive bubbles from stacking exactly. */
  drift: number;
  /** Hue rotation (0-30deg) — subtle visual variety. */
  hue: number;
}

const BUBBLE_DURATION_MS = 3_000;

export function FloatingReactions({
  onSpawn,
  spawnRef,
  className,
  locale = 'pt-BR',
}: FloatingReactionsProps): React.ReactElement {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  // Cull expired bubbles every 500ms
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setBubbles((prev) => {
        const next = prev.filter((b) => now - b.startedAt < BUBBLE_DURATION_MS);
        return next.length === prev.length ? prev : next;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  const spawn = useCallback(
    (type: ReactionType, reactionId: string): void => {
      onSpawn?.(type, reactionId);
      const bubble: Bubble = {
        id: reactionId,
        type,
        startedAt: Date.now(),
        x: 5 + Math.random() * 90, // 5%..95% to keep bubbles on screen
        drift: -20 + Math.random() * 40, // -20..+20 px lateral drift
        hue: Math.random() * 30 - 15, // -15..+15 deg subtle hue rotation
      };
      setBubbles((prev) => {
        // Cap: cull oldest if over MAX_FLOATING_BUBBLES
        const next = [...prev, bubble];
        if (next.length > MAX_FLOATING_BUBBLES) {
          next.splice(0, next.length - MAX_FLOATING_BUBBLES);
        }
        return next;
      });
      // Auto-cleanup after animation duration (belt + suspenders alongside interval)
      const tid = setTimeout(() => {
        timersRef.current.delete(tid);
        setBubbles((prev) => prev.filter((b) => b.id !== reactionId));
      }, BUBBLE_DURATION_MS + 100);
      timersRef.current.add(tid);
    },
    [onSpawn]
  );

  // Expose spawn via ref (so parent can trigger without prop drilling)
  useEffect(() => {
    if (spawnRef) {
      spawnRef.current = spawn;
      return () => {
        spawnRef.current = null;
      };
    }
    return undefined;
  }, [spawnRef, spawn]);

  return (
    <>
      {/* Float keyframes — once per page */}
      <style>{`
        @keyframes w92-float-up {
          0% {
            transform: translate(0, 0) scale(0.6);
            opacity: 0;
          }
          10% {
            transform: translate(0, -10px) scale(1);
            opacity: 1;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate(var(--w92-drift, 0px), -260px) scale(1.05);
            opacity: 0;
          }
        }
        .w92-bubble {
          animation: w92-float-up 3000ms ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>
      <div
        aria-hidden="true"
        data-component="floating-reactions"
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden',
          className
        )}
      >
        {bubbles.map((b) => (
          <span
            key={b.id}
            data-bubble-id={b.id}
            data-bubble-type={b.type}
            style={
              {
                left: `${b.x}%`,
                bottom: '0',
                position: 'absolute',
                fontSize: '2.5rem',
                lineHeight: 1,
                filter: `hue-rotate(${b.hue}deg)`,
                ['--w92-drift' as string]: `${b.drift}px`,
              } as React.CSSProperties
            }
            className="w92-bubble"
          >
            {b.type}
          </span>
        ))}
      </div>
      {/* SR-only status announcement when bubbles spawn */}
      <span
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {locale === 'pt-BR'
          ? `${bubbles.length} reações flutuando`
          : `${bubbles.length} reactions floating`}
      </span>
    </>
  );
}