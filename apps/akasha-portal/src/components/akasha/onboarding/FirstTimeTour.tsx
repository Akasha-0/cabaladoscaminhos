'use client';

/**
 * FirstTimeTour — Wave 13.1 First-time user onboarding + Wave 18.5
 * persistence (resume mid-tour + skip from any step).
 *
 * Three full-screen steps that introduce the /meu-dia experience to a user
 * who has never picked an emotional state. The tour:
 *
 *   Step 0 — Welcome + how to pick an emotional state
 *   Step 1 — (Preview of the breathing orb, shown to *all* users — it's
 *            the most distinctive affordance of the Ansioso view)
 *   Step 2 — Mentor CTA: a friendly nudge toward the conversational AI
 *            that lives at /mentor.
 *
 * Wave 18.5 persistence changes:
 *   - The current step is written to localStorage on every change. If the
 *     user leaves and comes back, the tour resumes at the saved step
 *     instead of restarting at step 0.
 *   - A subtle "resuming from step X" banner appears when the tour mounts
 *     with a persisted step > 0. Banner uses `prefers-reduced-motion`
 *     (no animations) and is dismissable by any user interaction.
 *   - "Pular tour" (skip-all) button is available on EVERY step, not just
 *     step 1. Tapping it finalises the tour (same effect as advancing past
 *     the last step).
 *
 * Why 3 steps (not 4+):
 *   - Gabriel's grill-me feedback (2026-06-24): "minimalista e objetiva".
 *     Anything beyond step 3 feels like a tutorial. The emotional state
 *     picker is the actual onboarding — the tour just frames it.
 *   - Each step must deliver one (and only one) concrete idea.
 *
 * Visibility:
 *   - The component is a pure presentational overlay. The caller decides
 *     whether to render it (typically via `useOnboarding().completed`).
 *   - We DO NOT auto-dismiss on backdrop click; the user must explicitly
 *     tap "Pular" or advance through all 3 dots. This keeps the tour
 *     intentional, not accidental.
 *
 * Animations:
 *   - framer-motion is used for the cross-fade between steps and the
 *     dot-indicator pulse. If framer-motion ever becomes a problem, the
 *     animations degrade to instant transitions because they're CSS-only
 *     in the keyframes fallback.
 *
 * Mobile-first:
 *   - Full viewport (min-h-screen), tap to advance, large touch targets
 *     (44×44 minimum per Apple HIG / WCAG 2.5.5). The "Avançar" button
 *     stretches full-width on small screens.
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" + aria-labelledby for screen readers
 *   - The dots have role="tablist" and each dot is role="tab" with
 *     aria-selected reflecting the current step
 *   - prefers-reduced-motion: framer-motion's MotionConfig (up the tree)
 *     handles it; we don't add per-component opt-outs.
 *
 * No i18n runtime:
 *   - Copy is hardcoded PT-BR (matches Wave 9.1 / 10 pattern in the
 *     my-day components). The canonical i18n keys for these strings
 *     live in src/i18n/{en,pt-BR}.json under the `onboarding.tour.*`
 *     namespace — they exist for parity and future runtime wiring, not
 *     for direct consumption by this component.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import { BreathOrb } from '@/components/akasha/my-day/ansioso/BreathOrb';
import {
  ONBOARDING_COMPLETED_STEP,
  type OnboardingStep,
  type AnyOnboardingStep,
} from '@/lib/state/onboarding-state';

export type { OnboardingStep };

export interface FirstTimeTourProps {
  /** Called when the user advances past the last step OR skips from any
   *  step (the skip button is available on all 3 steps, not just step 1). */
  onComplete: () => void;
  /**
   * Optional: called when the user clicks the "Pular por agora" link on
   * step 1. The skip-all button on steps 2/3 (Wave 18.5) always calls
   * `onComplete`, never `onSkip`. The two skips are semantically distinct:
   *   - step-1 skip = "I'm not ready, leave me alone"
   *   - skip-all    = "I've seen enough, dismiss the tour"
   */
  onSkip?: () => void;
  /**
   * The starting step. Wave 18.5: callers pass `useOnboarding().currentStep`
   * so the tour resumes mid-flight. Out-of-range values are clamped to 0.
   * Defaults to 0 for fresh users.
   */
  initialStep?: AnyOnboardingStep;
  /**
   * Wave 18.5 — called whenever the step changes. The host (MeuDiaHub)
   * forwards this to `useOnboarding().setStep` so progress is persisted.
   * Receives `OnboardingStep` (0|1|2) for live steps and
   * `ONBOARDING_COMPLETED_STEP` (3) when the user finalises the tour.
   */
  onStepChange?: (step: AnyOnboardingStep) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy
// ─────────────────────────────────────────────────────────────────────────────
//
// Hardcoded PT-BR to match the Wave 9.1/10 convention (other my-day
// components do the same). The canonical i18n keys live in src/i18n/.
//
// KEEP IN SYNC with onboarding.tour.* in src/i18n/pt-BR.json + en.json.
// ─────────────────────────────────────────────────────────────────────────────

interface StepContent {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: string;
}

const STEPS: readonly StepContent[] = [
  {
    eyebrow: 'Passo 1 de 3',
    title: 'Bem-vindo ao Akasha',
    body:
      'Para começar, escolha como você está se sentindo agora. O portal se adapta ao que você precisa hoje — não amanhã.',
    primaryCta: 'Continuar',
  },
  {
    eyebrow: 'Passo 2 de 3',
    title: 'Respire comigo',
    body:
      'Se você escolher "ansioso", este orb te guia pela respiração 4-7-8: 4 segundos inspirando, 7 segurando, 8 expirando. Três ciclos acalmam o sistema nervoso.',
    primaryCta: 'Continuar',
  },
  {
    eyebrow: 'Passo 3 de 3',
    title: 'Converse com o Mentor',
    body:
      'A qualquer momento, abra o Mentor — um guia simbólico que cruza Cabala, Astrologia, Ifá e Tantra para responder suas perguntas mais profundas.',
    primaryCta: 'Começar',
  },
] as const;

const SKIP_LABEL = 'Pular por agora';
const SKIP_ALL_LABEL = 'Pular tour';
const ARIA_LABEL = 'Tour de primeiros passos';

/** Banner shown when the tour resumes from a non-zero persisted step. */
function resumeBannerText(step: OnboardingStep): string {
  // Wave 18.5 i18n keys live under `onboarding.tour.resume` in both locale
  // files. We hardcode the template here to match the Wave 9.1/10 pattern
  // used by every other my-day component — see the file header for the
  // rationale.
  const humanStep = step + 1;
  return `Continuando do passo ${humanStep} de ${STEPS.length}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clamp the persisted `currentStep` from the hook into a valid live
 * step (0|1|2). `3` (the completed sentinel) is NOT a valid initial step —
 * callers must not mount the tour when `completed=true`. We still defend
 * against it here because Wave 18.5 widens the prop type to accept any
 * step value (host may pass `currentStep` before the `!completed` guard
 * settles in some race scenarios).
 */
function clampInitial(step: AnyOnboardingStep | undefined): OnboardingStep {
  if (step === 1) return 1;
  if (step === 2) return 2;
  return 0;
}

export function FirstTimeTour({
  onComplete,
  onSkip,
  initialStep = 0,
  onStepChange,
}: FirstTimeTourProps) {
  const [step, setStepLocal] = useState<OnboardingStep>(
    clampInitial(initialStep)
  );
  // Wave 18.5 — show the "resuming from step X" banner when the persisted
  // step is > 0 at mount. The banner auto-hides on first user interaction.
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(
    initialStep > 0 && initialStep < ONBOARDING_COMPLETED_STEP
  );

  const total = STEPS.length;

  /**
   * Single mutation path for the live step. Persists via `onStepChange`
   * if provided so the host's `useOnboarding` can mirror it. Also hides
   * the resume banner on the first interaction.
   */
  const setStep = useCallback(
    (next: OnboardingStep) => {
      setStepLocal(next);
      setShowResumeBanner(false);
      if (onStepChange) onStepChange(next);
    },
    [onStepChange]
  );

  const advance = useCallback(() => {
    if (step < total - 1) {
      setStep((step + 1) as OnboardingStep);
    } else {
      // Final advance — fire completion + step=3 sentinel.
      if (onStepChange) onStepChange(ONBOARDING_COMPLETED_STEP);
      onComplete();
    }
  }, [step, total, onComplete, onStepChange, setStep]);

  const goTo = useCallback(
    (next: OnboardingStep) => {
      setStep(next);
    },
    [setStep]
  );

  const handleSkip = useCallback(() => {
    // Step-1 "Pular por agora" — semantically "I'm not ready", delegates
    // to onSkip if provided so the host can distinguish it from a
    // skip-all (which always finalises the tour).
    if (onStepChange) onStepChange(ONBOARDING_COMPLETED_STEP);
    if (onSkip) onSkip();
    else onComplete();
  }, [onSkip, onComplete, onStepChange]);

  /**
   * Wave 18.5 — skip-all from any step. Finalises the tour and fires
   * `onComplete` directly. Distinct from `handleSkip` (step-1 only) which
   * may call `onSkip` first.
   */
  const handleSkipAll = useCallback(() => {
    if (onStepChange) onStepChange(ONBOARDING_COMPLETED_STEP);
    onComplete();
  }, [onComplete, onStepChange]);

  // Keyboard support: Enter advances, Escape skips. Wave 18.5 — Escape
  // skips from ANY step (not just step 1). Consistent with the new
  // visible skip-all button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkipAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, handleSkipAll]);

  const current = STEPS[step];
  const isLast = step === total - 1;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-tour-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between min-h-screen px-5 py-8"
      style={{
        background:
          'radial-gradient(ellipse at top, rgba(28,28,30,0.97) 0%, rgba(10,10,12,0.99) 70%)',
        backdropFilter: 'blur(16px)',
        // Dynamic viewport units override the 100vh fallback above on
        // browsers that support it (mobile browsers with collapsing
        // toolbars). Older browsers fall back to the className's 100vh.
        minHeight: '100dvh',
      }}
      data-testid="first-time-tour"
      data-step={step}
    >
      {/* Top bar — skip-all button on EVERY step (Wave 18.5), step-1
          "Pular por agora" on step 1 only. The skip-all is a small
          text link so it doesn't compete with the primary CTA visually. */}
      <div className="w-full max-w-[var(--ak-container-narrow)] flex justify-between items-start gap-2">
        {step === 0 ? (
          <>
            <button
              type="button"
              onClick={handleSkip}
              className="min-h-[44px] px-3 text-xs text-white/50 hover:text-white/80 underline-offset-2 hover:underline transition-colors"
              data-testid="first-time-tour-skip"
              aria-label={SKIP_LABEL}
            >
              {SKIP_LABEL}
            </button>
            <button
              type="button"
              onClick={handleSkipAll}
              className="min-h-[44px] px-3 text-xs text-white/50 hover:text-white/80 underline-offset-2 hover:underline transition-colors"
              data-testid="first-time-tour-skip-all"
              aria-label={SKIP_ALL_LABEL}
            >
              {SKIP_ALL_LABEL}
            </button>
          </>
        ) : (
          <>
            {/* Reserved slot on non-first steps so the layout doesn't
                shift between steps when the skip link appears/disappears. */}
            <span aria-hidden="true" />
            <button
              type="button"
              onClick={handleSkipAll}
              className="min-h-[44px] px-3 text-xs text-white/50 hover:text-white/80 underline-offset-2 hover:underline transition-colors"
              data-testid="first-time-tour-skip-all"
              aria-label={SKIP_ALL_LABEL}
            >
              {SKIP_ALL_LABEL}
            </button>
          </>
        )}
      </div>

      {/* Resume banner — Wave 18.5. Shown when the tour reopens with a
          persisted step > 0. Subtle, doesn't block the dialog, and
          disappears on any step change. */}
      <AnimatePresence>
        {showResumeBanner && (
          <motion.div
            key="resume-banner"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[var(--ak-container-narrow)] mt-2"
            data-testid="first-time-tour-resume-banner"
            role="status"
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 text-center m-0">
              {resumeBannerText(step)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area — flex-1 so the footer stays pinned to the
          bottom of the viewport. We do NOT use `mode="wait"` on the
          AnimatePresence so the new step renders immediately while the
          old one exits. This keeps tests deterministic (the new title
          is in the DOM right after `setState`) and matches the
          "tap-to-advance" mobile UX where the user wants instant
          feedback. */}
      <div className="flex-1 w-full max-w-[var(--ak-container-narrow)] flex items-center justify-center">
        <AnimatePresence initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center gap-6 w-full"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-semibold">
              {current.eyebrow}
            </span>

            <h2
              id="first-time-tour-title"
              className="text-3xl sm:text-4xl text-white leading-tight m-0"
              style={{ fontFamily: 'var(--ak-font-cinzel)' }}
            >
              {current.title}
            </h2>

            <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-md m-0">
              {current.body}
            </p>

            {/* Step 2 only: small BreathOrb preview */}
            {step === 1 && (
              <div
                className="mt-2 scale-75 origin-center"
                data-testid="first-time-tour-breath-preview"
              >
                <BreathOrb paused cycles={1} size={220} />
              </div>
            )}

            {/* Step 3 only: inline CTA visual */}
            {step === 2 && (
              <div
                className="mt-2 px-5 py-3 rounded-2xl border border-white/15 bg-white/[0.04] text-sm text-white/80"
                data-testid="first-time-tour-mentor-cta"
              >
                <span className="text-white/55 text-xs uppercase tracking-wider block mb-1">
                  Disponível em
                </span>
                <span className="font-mono text-white">/mentor</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — dots + primary CTA */}
      <div className="w-full max-w-[var(--ak-container-narrow)] flex flex-col items-center gap-5">
        {/* Dot indicators — tablist for screen readers */}
        <div
          role="tablist"
          aria-label="Progresso do tour"
          className="flex items-center gap-2"
          data-testid="first-time-tour-dots"
        >
          {STEPS.map((_, i) => {
            const active = i === step;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir para passo ${i + 1} de ${total}`}
                onClick={() => goTo(i as OnboardingStep)}
                className="rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  background: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                }}
                data-testid={`first-time-tour-dot-${i}`}
                data-active={active}
              />
            );
          })}
        </div>

        {/* Primary CTA — full width on mobile, large touch target */}
        <motion.button
          type="button"
          onClick={advance}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto sm:min-w-[200px] min-h-[52px] px-8 rounded-2xl bg-white text-black font-semibold text-base tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          data-testid="first-time-tour-advance"
        >
          {current.primaryCta}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default FirstTimeTour;

// Exported for tests + the (out-of-scope) "Replay tour" affordance.
export const FIRST_TIME_TOUR_TOTAL_STEPS = STEPS.length;