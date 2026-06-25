'use client';

/**
 * ZeladorFirstTimeTour — Wave 26.2 — First-time onboarding for the Zelador.
 *
 * The Zelador enters the /atendimento space to walk a cliente through a
 * session. On the FIRST visit, this tour frames the space so they
 * understand the moving parts before the cliente arrives. Three steps:
 *
 *   Step 0 — Welcome to /atendimento: who you are here, what the space is.
 *   Step 1 — The 4 emotional states + Discovery cards (the IA's output).
 *            We surface the 4 estados emocionais (curioso/ansioso/perdido/
 *            centrado) and explain that the IA generates "discovery cards"
 *            inline in the chat — these are the actionable insights the
 *            Zelador quotes, saves, and reflects back to the cliente.
 *   Step 2 — Feedback loop (thumbs): how the Zelador's 👍/👎 shapes the IA.
 *            Every thumbs is a teaching moment — the IA learns the Zelador's
 *            voice, the tradição they follow, and the clientes they serve.
 *
 * Persistence (separate from the end-user Wave 13.1 onboarding):
 *   - `akasha.zelador.onboarding.completed` — boolean. Written on completion.
 *   - `akasha.zelador.onboarding.step`       — 0|1|2|3 (3 = complete).
 *   - Distinct namespace from `akasha.onboarding.*` so the end-user
 *     "Welcome to Akasha" tour (Wave 13.1) is NOT shadowed by the Zelador
 *     tour, and vice versa. A Zelador can be a first-time user of the
 *     cliente side AND the Zelador side simultaneously.
 *
 * Why this tour exists (Gabriel 25/06 repositioning):
 *   - Akasha = consciência viva. The Zelador is the human who channels
 *     that consciência for the cliente. Without framing, /atendimento
 *     looks like a generic chat — the visceral/evidencial/curativo
 *     dimensions are invisible.
 *   - One concrete idea per step. Step 1 is the "what you'll see" preview
 *     (the estados + discovery cards). Step 2 is the "your feedback
 *     matters" preview. Step 0 frames WHO the Zelador is here.
 *
 * Mobile-first:
 *   - Full viewport, tap to advance, large touch targets (44×44 min).
 *   - Designed for 360px first (small Android). Layout collapses gracefully
 *     up to desktop.
 *
 * Accessibility:
 *   - role="dialog" + aria-modal + aria-labelledby.
 *   - Dots have role="tab" inside role="tablist".
 *   - prefers-reduced-motion handled by framer-motion MotionConfig up-tree.
 *
 * i18n:
 *   - All copy lives under `atendimento.onboarding.*` in pt-BR.json + en.json.
 *   - The component reads via props (`copy`) — no direct t() call here.
 *     The host (Wave 26.1's /atendimento page) injects the localized
 *     copy via the `useTranslations('atendimento.onboarding')` hook,
 *     keeping this component testable in isolation with a stub `copy`.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Storage contract — distinct namespace from Wave 13.1 end-user onboarding
// ─────────────────────────────────────────────────────────────────────────────

/** Boolean completion flag. Mirrors the Wave 13.1 contract but isolated
 *  to the Zelador subspace so end-user + Zelador tours don't collide. */
export const ZELADOR_ONBOARDING_STORAGE_KEY =
  'akasha.zelador.onboarding.completed';
/** Live step (0|1|2) + sentinel "3" for completion. Mirrors Wave 18.5. */
export const ZELADOR_ONBOARDING_STEP_KEY =
  'akasha.zelador.onboarding.step';
/** Sentinel meaning "the tour is done". */
export const ZELADOR_ONBOARDING_COMPLETED_STEP: 3 = 3 as const;
export type ZeladorOnboardingStep = 0 | 1 | 2;
export type ZeladorAnyOnboardingStep =
  | ZeladorOnboardingStep
  | typeof ZELADOR_ONBOARDING_COMPLETED_STEP;

// ─────────────────────────────────────────────────────────────────────────────
// Copy shape — host injects localized strings via props (i18n parity)
// ─────────────────────────────────────────────────────────────────────────────

export interface ZeladorOnboardingCopy {
  /** Step 0 — Welcome to /atendimento */
  step1Eyebrow: string;
  step1Title: string;
  step1Body: string;
  /** Step 1 — 4 estados + discovery cards */
  step2Eyebrow: string;
  step2Title: string;
  step2Body: string;
  /** Step 2 — Feedback thumbs */
  step3Eyebrow: string;
  step3Title: string;
  step3Body: string;
  /** Shared controls */
  primaryCtaContinue: string;
  primaryCtaStart: string;
  skipLabel: string;
  dialogAriaLabel: string;
  dotsAriaLabel: string;
}

export const DEFAULT_COPY_PT_BR: ZeladorOnboardingCopy = {
  step1Eyebrow: 'Passo 1 de 3',
  step1Title: 'Bem-vindo ao atendimento',
  step1Body:
    'Aqui você caminha com o cliente. Você é o Zelador — o humano que traduz a consciência viva do Akasha em palavra, presença e prática.',
  step2Eyebrow: 'Passo 2 de 3',
  step2Title: '4 estados + descobertas',
  step2Body:
    'O cliente chega em um estado (curioso, ansioso, perdido, centrado). A IA gera discovery cards inline: verdades universais com papers citados. Use-as como espelho.',
  step3Eyebrow: 'Passo 3 de 3',
  step3Title: 'Ensine a IA com o polegar',
  step3Body:
    'Cada 👍 e 👎 que você dá é um ensinamento. A IA aprende sua voz, sua tradição e seus clientes — e evolui com você.',
  primaryCtaContinue: 'Continuar',
  primaryCtaStart: 'Começar a atender',
  skipLabel: 'Pular tour',
  dialogAriaLabel: 'Tour de primeiros passos do Zelador',
  dotsAriaLabel: 'Progresso do tour',
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers (SSR-safe, mirrors Wave 18.5 onboarding-state.ts)
// ─────────────────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isZeladorOnboardingCompleted(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(ZELADOR_ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function getZeladorOnboardingStep(): ZeladorAnyOnboardingStep {
  if (!isBrowser()) return 0;
  try {
    // Legacy boolean flag wins: if completed=true, return the sentinel
    // even if the step key is missing (back-compat with Wave 26.2 readers
    // that only check the boolean).
    if (isZeladorOnboardingCompleted()) {
      return ZELADOR_ONBOARDING_COMPLETED_STEP;
    }
    const raw = window.localStorage.getItem(ZELADOR_ONBOARDING_STEP_KEY);
    if (raw === '3') return ZELADOR_ONBOARDING_COMPLETED_STEP;
    if (raw === '1') return 1;
    if (raw === '2') return 2;
    return 0;
  } catch {
    return 0;
  }
}

export function setZeladorOnboardingStep(
  step: ZeladorAnyOnboardingStep
): void {
  if (!isBrowser()) return;
  try {
    if (step === ZELADOR_ONBOARDING_COMPLETED_STEP) {
      window.localStorage.setItem(ZELADOR_ONBOARDING_STORAGE_KEY, 'true');
      window.localStorage.setItem(ZELADOR_ONBOARDING_STEP_KEY, '3');
    } else {
      window.localStorage.setItem(ZELADOR_ONBOARDING_STEP_KEY, String(step));
    }
  } catch {
    // localStorage may be unavailable (private mode, quota); silently degrade.
  }
}

export function resetZeladorOnboarding(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(ZELADOR_ONBOARDING_STORAGE_KEY);
    window.localStorage.removeItem(ZELADOR_ONBOARDING_STEP_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component props
// ─────────────────────────────────────────────────────────────────────────────

export interface ZeladorFirstTimeTourProps {
  /** Fired when the Zelador advances past the last step OR skips the tour. */
  onComplete: () => void;
  /** Localized copy. Defaults to PT-BR (matches Wave 9.1/10 hardcoded-PT
   *  convention); pass EN copy when locale is 'en'. */
  copy?: ZeladorOnboardingCopy;
  /** Resumed step. If the Zelador left mid-tour, the host passes the
   *  persisted step from `getZeladorOnboardingStep()` (narrowed to live
   *  range 0|1|2). Out-of-range values clamp to 0. */
  initialStep?: ZeladorAnyOnboardingStep;
  /** Called on every step change. The host forwards to setZeladorOnboardingStep
   *  so progress survives reloads. Receives the live step (0|1|2) or the
   *  completed sentinel (3) on finalization. */
  onStepChange?: (step: ZeladorAnyOnboardingStep) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clampInitial(step: ZeladorAnyOnboardingStep | undefined): ZeladorOnboardingStep {
  if (step === 1) return 1;
  if (step === 2) return 2;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ZeladorFirstTimeTour({
  onComplete,
  copy = DEFAULT_COPY_PT_BR,
  initialStep = 0,
  onStepChange,
}: ZeladorFirstTimeTourProps) {
  const [step, setStepLocal] = useState<ZeladorOnboardingStep>(
    clampInitial(initialStep)
  );
  const [resumeFromStep, setResumeFromStep] = useState<boolean>(
    initialStep === 1 || initialStep === 2
  );

  const total = 3;
  const isLast = step === total - 1;

  /** Single mutation path. Persists via onStepChange so the host can
   *  mirror to localStorage. Hides the resume banner on first interaction. */
  const setStep = useCallback(
    (next: ZeladorOnboardingStep) => {
      setStepLocal(next);
      setResumeFromStep(false);
      if (onStepChange) onStepChange(next);
    },
    [onStepChange]
  );

  const advance = useCallback(() => {
    if (step < total - 1) {
      setStep((step + 1) as ZeladorOnboardingStep);
    } else {
      if (onStepChange) onStepChange(ZELADOR_ONBOARDING_COMPLETED_STEP);
      onComplete();
    }
  }, [step, total, onComplete, onStepChange, setStep]);

  const goTo = useCallback(
    (next: ZeladorOnboardingStep) => {
      setStep(next);
    },
    [setStep]
  );

  const handleSkipAll = useCallback(() => {
    if (onStepChange) onStepChange(ZELADOR_ONBOARDING_COMPLETED_STEP);
    onComplete();
  }, [onComplete, onStepChange]);

  // Keyboard: Enter advances, Escape skips.
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

  const eyebrow =
    step === 0 ? copy.step1Eyebrow : step === 1 ? copy.step2Eyebrow : copy.step3Eyebrow;
  const title =
    step === 0 ? copy.step1Title : step === 1 ? copy.step2Title : copy.step3Title;
  const body =
    step === 0 ? copy.step1Body : step === 1 ? copy.step2Body : copy.step3Body;
  const cta = isLast ? copy.primaryCtaStart : copy.primaryCtaContinue;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="zelador-tour-title"
      aria-label={copy.dialogAriaLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between min-h-screen px-5 py-8"
      style={{
        background:
          'radial-gradient(ellipse at top, rgba(28,28,30,0.97) 0%, rgba(10,10,12,0.99) 70%)',
        backdropFilter: 'blur(16px)',
        minHeight: '100dvh',
      }}
      data-testid="zelador-first-time-tour"
      data-step={step}
    >
      {/* Top bar — skip-all on every step */}
      <div className="w-full max-w-[var(--ak-container-narrow)] flex justify-end">
        <button
          type="button"
          onClick={handleSkipAll}
          className="min-h-[44px] px-3 text-xs text-white/50 hover:text-white/80 underline-offset-2 hover:underline transition-colors"
          data-testid="zelador-tour-skip-all"
          aria-label={copy.skipLabel}
        >
          {copy.skipLabel}
        </button>
      </div>

      {/* Resume banner — shown when re-opening with persisted step > 0 */}
      <AnimatePresence>
        {resumeFromStep && (
          <motion.div
            key="resume-banner"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[var(--ak-container-narrow)] mt-2"
            data-testid="zelador-tour-resume-banner"
            role="status"
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 text-center m-0">
              {`Continuando do passo ${step + 1} de ${total}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — flex-1 so footer pins to bottom */}
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
              {eyebrow}
            </span>

            <h2
              id="zelador-tour-title"
              className="text-3xl sm:text-4xl text-white leading-tight m-0"
              style={{ fontFamily: 'var(--ak-font-cinzel)' }}
            >
              {title}
            </h2>

            <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-md m-0">
              {body}
            </p>

            {/* Step 1 — preview of the 4 estados + discovery cards */}
            {step === 1 && (
              <div
                className="mt-2 w-full max-w-sm flex flex-col gap-2"
                data-testid="zelador-tour-states-preview"
              >
                <div className="grid grid-cols-2 gap-2" aria-label="4 estados emocionais">
                  {[
                    { label: 'Curioso', color: 'rgba(120,160,255,0.85)' },
                    { label: 'Ansioso', color: 'rgba(255,140,120,0.85)' },
                    { label: 'Perdido', color: 'rgba(180,140,220,0.85)' },
                    { label: 'Centrado', color: 'rgba(140,220,170,0.85)' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white/80 text-left"
                      style={{ borderLeft: `3px solid ${s.color}` }}
                      data-testid={`zelador-tour-state-${s.label.toLowerCase()}`}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-1 px-4 py-3 rounded-xl border border-white/15 bg-white/[0.05] text-sm text-white/85 text-left"
                  data-testid="zelador-tour-discovery-preview"
                >
                  <span className="text-[10px] uppercase tracking-wider text-white/45 block mb-1">
                    Discovery card
                  </span>
                  <span className="text-white/85">
                    Verdade universal + paper citado
                  </span>
                </div>
              </div>
            )}

            {/* Step 2 — feedback thumbs preview */}
            {step === 2 && (
              <div
                className="mt-2 flex items-center gap-4 px-5 py-3 rounded-2xl border border-white/15 bg-white/[0.04]"
                data-testid="zelador-tour-thumbs-preview"
              >
                <span className="text-2xl" aria-hidden="true">👍</span>
                <span className="text-2xl" aria-hidden="true">👎</span>
                <span className="text-sm text-white/70">
                  Cada voto ensina a IA
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — dots + primary CTA */}
      <div className="w-full max-w-[var(--ak-container-narrow)] flex flex-col items-center gap-5">
        <div
          role="tablist"
          aria-label={copy.dotsAriaLabel}
          className="flex items-center gap-2"
          data-testid="zelador-tour-dots"
        >
          {Array.from({ length: total }).map((_, i) => {
            const active = i === step;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir para passo ${i + 1} de ${total}`}
                onClick={() => goTo(i as ZeladorOnboardingStep)}
                className="rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  background: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                }}
                data-testid={`zelador-tour-dot-${i}`}
                data-active={active}
              />
            );
          })}
        </div>

        <motion.button
          type="button"
          onClick={advance}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto sm:min-w-[200px] min-h-[52px] px-8 rounded-2xl bg-white text-black font-semibold text-base tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          data-testid="zelador-tour-advance"
        >
          {cta}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ZeladorFirstTimeTour;

// Exported for tests + future "Replay tour" affordance.
export const ZELADOR_FIRST_TIME_TOUR_TOTAL_STEPS = 3;
