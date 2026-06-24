'use client';

/**
 * BreathOrb — Wave 9.1 AnsiosoView
 *
 * SVG-based 4-7-8 breathing animation. Used in the "Ansioso" view because:
 *   - 4-7-8 is the most clinically-replicated calming breath (Weil 2011).
 *   - It anchors the user's attention visually + rhythmically while the
 *     rest of the screen loads.
 *   - Pure SVG + framer-motion — works even if reduced motion is on.
 *
 * Phases (one cycle = 19s):
 *   inhale   (4s) — orb grows from 60% → 100% size, bright
 *   hold     (7s) — orb stays at 100%, gentle pulse
 *   exhale   (8s) — orb shrinks back to 60%, dims
 *
 * We honor `prefers-reduced-motion`: the animation pauses and a static
 * "Respira" badge is shown instead. The orb remains visible.
 *
 * Why no framer-motion here:
 *   framer-motion has a small startup cost and we want the breath to start
 *   immediately on render. CSS keyframes are free.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface BreathOrbProps {
  /** Optional click-to-start gate. When true, the orb shows a "começar" prompt. */
  paused?: boolean;
  /** Total cycles to run before stopping. Defaults to 3. */
  cycles?: number;
  /** Size in pixels. Defaults to 200. */
  size?: number;
}

const CYCLE_MS = 19000;
const PHASE_INHALE = 4000;
const PHASE_HOLD = 7000;
const PHASE_EXHALE = 8000;

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

export function BreathOrb({ paused = false, cycles = 3, size = 200 }: BreathOrbProps) {
  const [phase, setPhase] = useState<Phase>(paused ? 'idle' : 'inhale');
  const [completed, setCompleted] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // matchMedia isn't available in all jsdom/test environments, and the
    // orb's behaviour is non-critical when it isn't. Default to "motion
    // allowed" so the animation runs.
    if (typeof window.matchMedia !== 'function') {
      setReducedMotion(false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    if (completed >= cycles) return;
    const id = setTimeout(() => {
      if (phase === 'inhale') setPhase('hold');
      else if (phase === 'hold') setPhase('exhale');
      else if (phase === 'exhale') {
        setCompleted((c) => c + 1);
        setPhase('inhale');
      }
    }, phase === 'inhale' ? PHASE_INHALE : phase === 'hold' ? PHASE_HOLD : PHASE_EXHALE);
    return () => clearTimeout(id);
  }, [phase, completed, cycles, paused, reducedMotion]);

  const label =
    phase === 'inhale'
      ? 'Inspire (4)'
      : phase === 'hold'
        ? 'Segure (7)'
        : phase === 'exhale'
          ? 'Expire (8)'
          : 'Pronto?';

  const radius = size / 2;

  // The orb's r grows/shrinks via framer-motion `animate`.
  const orbScale =
    phase === 'inhale' ? 1 : phase === 'hold' ? 1 : phase === 'exhale' ? 0.6 : 0.8;

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      data-testid="breath-orb"
      data-phase={phase}
      data-completed={completed}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Orb de respiração 4-7-8 — ${label}`}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block"
        >
          <defs>
            <radialGradient id="orbCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#3B82F6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orbRing" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#60A5FA" stopOpacity="0" />
              <stop offset="85%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer ring — fades with phase */}
          <circle
            cx={radius}
            cy={radius}
            r={radius * 0.95}
            fill="url(#orbRing)"
            style={{
              opacity: phase === 'idle' ? 0.3 : 0.6,
              transition: 'opacity 800ms ease',
            }}
          />

          {/* Core orb — grows on inhale, holds, shrinks on exhale */}
          <motion.circle
            cx={radius}
            cy={radius}
            initial={false}
            animate={{
              r: radius * orbScale,
              opacity: phase === 'idle' ? 0.7 : 1,
            }}
            transition={
              phase === 'inhale'
                ? { duration: 4, ease: 'easeOut' }
                : phase === 'hold'
                  ? { duration: 7, ease: 'linear' }
                  : { duration: 8, ease: 'easeIn' }
            }
            fill="url(#orbCore)"
          />

          {/* Inner highlight — fixed */}
          <circle
            cx={radius - radius * 0.18}
            cy={radius - radius * 0.22}
            r={radius * 0.15}
            fill="rgba(255,255,255,0.35)"
            style={{
              opacity: phase === 'hold' ? 0.55 : 0.3,
              transition: 'opacity 600ms ease',
            }}
          />
        </svg>

        {/* Centre label — phase + countdown */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-semibold">
              {paused ? 'Toque para começar' : reducedMotion ? 'Respire' : label}
            </div>
            {!paused && !reducedMotion && (
              <div className="text-xs text-white/40 mt-1 tabular-nums">
                {completed}/{cycles} ciclos
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-white/55 text-center max-w-xs leading-relaxed">
        {phase === 'idle'
          ? 'Quando estiver pronto, toque para iniciar. Inspire por 4, segure 7, expire 8.'
          : reducedMotion
            ? 'Respire no seu ritmo. A técnica 4-7-8: 4 segundos inspirando, 7 segurando, 8 expirando.'
            : 'Siga o ritmo da orb. Se o ciclo ficar difícil, pare e volte ao seu tempo natural.'}
      </p>
    </div>
  );
}

export default BreathOrb;