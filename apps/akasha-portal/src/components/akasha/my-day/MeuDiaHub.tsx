'use client';

/**
 * MeuDiaHub — Wave 9.1 client island + Wave 13.1 FirstTimeTour integration
 *
 * Lives in /meu-dia/page.tsx (a server-component shell). This component:
 *   - Loads the persisted emotional state via `useEmotionalState`.
 *   - Shows the StatePicker if no state is recorded or it is stale (>24h).
 *   - Once the user picks (or skips), renders <AdaptiveContent> with the
 *     matching state-specific view.
 *   - Fetches the synthesis via the existing `useAkashaSynthesis` hook
 *     (one-shot on mount) and passes the data through.
 *
 * Wave 13.1 — FirstTimeTour overlay:
 *   - On first visit (no `akasha.onboarding.completed` flag in localStorage),
 *     renders a full-screen 3-step onboarding tour BEFORE the hub content.
 *   - The tour wraps the hub in a fragment; when active, the hub underneath
 *     is still mounted (so picking a state inside the picker would also
 *     dismiss the tour — handled by the `handleStateSelect` wrapper below).
 *   - The tour itself is purely presentational — the parent decides whether
 *     to mount it. We mount it via `useOnboarding().completed`.
 *
 * Why client + not server:
 *   - localStorage and document.cookie are browser-only.
 *   - The 4-7-8 BreathOrb animation uses window.matchMedia.
 *   - Next 16 forces a 'use client' boundary if any imported hook touches
 *     the window. The legacy /meu-dia (F-224 MyDayScreen) was already
 *     client-side, so this stays consistent.
 *
 * Why a separate file from page.tsx:
 *   - page.tsx can stay a server-component shell (for metadata + auth).
 *     Actually for /meu-dia we keep it simple — the entire page is a
 *     client island since auth (JWT cookie) is already established.
 *     The page.tsx wrapper just imports <MeuDiaHub>.
 */

import { useCallback } from 'react';

import { FirstTimeTour } from '@/components/akasha/onboarding/FirstTimeTour';
import { useAkashaSynthesis } from '@/components/akasha/dashboard/hooks/useAkashaSynthesis';
import { StatePicker } from '@/components/akasha/state-picker/StatePicker';
import { type EmotionalState, useEmotionalState } from '@/lib/state/emotional-state';
import { useOnboarding } from '@/lib/state/onboarding-state';

import { AdaptiveContent } from './AdaptiveContent';

export interface MeuDiaHubProps {
  locale: string;
  userName: string;
}

export function MeuDiaHub({ locale, userName }: MeuDiaHubProps) {
  const { state, hydrated, setState, needsPrompt } = useEmotionalState();
  // Wave 13.1: FirstTimeTour is gated by its own localStorage flag
  // (`akasha.onboarding.completed`). It is shown over the hub until the
  // user either advances through the 3 steps or skips on step 1. The flag
  // is also set when the user picks a state via the StatePicker (see the
  // wrapped `setState` below).
  const {
    hydrated: onboardingHydrated,
    completed: onboardingCompleted,
    currentStep: onboardingCurrentStep,
    setStep: setOnboardingStep,
    markCompleted: markOnboardingCompleted,
  } = useOnboarding();
  const { data, loading } = useAkashaSynthesis({ userId: 'me' });

  // Wave 13.1: any state-pick counts as onboarding completion, so the
  // tour never reappears for returning users who skipped it previously.
  const handleStateSelect = useCallback(
    (next: EmotionalState) => {
      markOnboardingCompleted();
      setState(next);
    },
    [markOnboardingCompleted, setState]
  );

  const hoje = new Date();
  const hora = hoje.getHours();
  const saudacaoTemporal =
    hora < 6
      ? 'Boa madrugada'
      : hora < 12
        ? 'Bom dia'
        : hora < 18
          ? 'Boa tarde'
          : 'Boa noite';

  return (
    <>
      {/* Wave 13.1 — FirstTimeTour. Shown over the hub until the user
          completes (advances) or skips (step 1). Gated by the
          `useOnboarding` hydrated flag so the SSR HTML stays a clean
          match for the first client paint. Wave 18.5 — pass the
          persisted `currentStep` so the tour resumes mid-flight instead
          of restarting, and forward `onStepChange` so progress is
          written back on every step change. */}
      {onboardingHydrated && !onboardingCompleted && (
        <FirstTimeTour
          onComplete={markOnboardingCompleted}
          initialStep={onboardingCurrentStep}
          onStepChange={setOnboardingStep}
        />
      )}

      <main
        className="bg-ak-bg-cosmic-gradient min-h-[calc(100vh-56px)] px-5 py-6 pb-20"
        data-testid="meu-dia-hub"
      >
        <div className="max-w-[var(--ak-container-narrow)] mx-auto flex flex-col gap-4">
          {/* Header — only when not prompting, so the picker owns the top */}
          {!needsPrompt && (
            <header>
              <p className="text-xs text-ak-text-subtle uppercase tracking-[0.2em] m-0">
                {saudacaoTemporal}
              </p>
              <h1
                className="text-3xl text-ak-text-primary mt-1.5 mb-1 leading-tight"
                style={{ fontFamily: 'var(--ak-font-cinzel)' }}
              >
                {userName}.
              </h1>
            </header>
          )}

          {/* State picker — first paint + after stale. */}
          {hydrated && needsPrompt && (
            <StatePicker onSelect={handleStateSelect} />
          )}

          {/* Adaptive content — once a state is recorded */}
          {hydrated && state && (
            <>
              <AdaptiveContent
                state={state}
                locale={locale}
                data={data ? {
                  climate: data.climate,
                  ritual: data.ritual ?? null,
                  oneProfile: data.synthesis?.oneProfile ?? null,
                  synthesisParagraph: data.synthesis?.synthesisParagraph ?? null,
                } : null}
                loading={loading}
              />
              {/* "Trocar estado" affordance — small, low-emphasis */}
              <button
                type="button"
                onClick={() => setState(state)}
                className="text-[11px] text-white/40 hover:text-white/70 underline-offset-2 hover:underline self-center mt-2 transition-colors"
                data-testid="meu-dia-change-state"
                aria-label="Trocar estado emocional"
              >
                Trocar estado
              </button>
            </>
          )}

          {/* Pre-hydration skeleton — same height as picker so no jump */}
          {!hydrated && (
            <div
              className="rounded-3xl border border-white/10 bg-white/[0.02] animate-pulse"
              style={{ height: 280 }}
              data-testid="meu-dia-skeleton"
            />
          )}
        </div>
      </main>
    </>
  );
}

export default MeuDiaHub;