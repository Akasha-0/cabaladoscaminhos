'use client';

/**
 * OnboardingEspiritual — Componente central do Akasha Portal
 * ----------------------------------------------------------------------------
 * Fluxo de 5 passos que gera o mapa espiritual inicial do usuário:
 *   1. Nome completo (como em certidão)
 *   2. Data de nascimento (+ preview Caminho de Vida em tempo real)
 *   3. Hora de nascimento (opcional)
 *   4. Local de nascimento (cidade + estado + país)
 *   5. Tradições de interesse (multi-select, 1-5)
 *
 * Ao completar, chama o server action `generateInitialMapaAction`
 * que calcula o mapa inicial (Cabalística + Tântrica + Odu + Astrologia)
 * e redireciona para `/mapa`.
 *
 * UX:
 *   - Mobile-first
 *   - Progress bar (passo X / 5)
 *   - Voltar / Próximo
 *   - Loading state entre passos
 *   - Persistência em localStorage (progresso pode ser retomado)
 *   - Animações CSS (transition + fade slide)
 *
 * Server action: `app/actions/mapa.ts` → `generateInitialMapaAction`.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { OnboardingProgress } from './OnboardingProgress';
import { StepNome } from './steps/StepNome';
import { StepDataNascimento } from './steps/StepDataNascimento';
import { StepHoraNascimento } from './steps/StepHoraNascimento';
import { StepLocal, type StepLocalValues } from './steps/StepLocal';
import { StepTradicoes } from './steps/StepTradicoes';

import {
  validateStep,
  INITIAL_FORM_STATE,
  type OnboardingFormState,
  type StepKey,
  type Tradition,
} from '@/lib/schemas/onboarding';
import { generateInitialMapaAction } from '@/app/actions/mapa';

// ============================================================================
// CONSTANTS
// ============================================================================

const STEP_KEYS: readonly StepKey[] = [
  'fullName',
  'birthDate',
  'birthTime',
  'local',
  'traditions',
];

const STEP_LABELS: readonly string[] = [
  'Seu Nome',
  'Nascimento',
  'Hora',
  'Local',
  'Tradições',
];

const STORAGE_KEY = 'akasha:onboarding:v1';
const TOTAL_STEPS = STEP_KEYS.length;

// ============================================================================
// TYPES
// ============================================================================

export interface OnboardingEspiritualProps {
  className?: string;
  onComplete?: (data: OnboardingFormState & { profileId?: string }) => void;
  /** Redireciona aqui após gerar o mapa. Default: /mapa */
  redirectTo?: string;
}

export function OnboardingEspiritual({
  className,
  onComplete,
  redirectTo = '/mapa',
}: OnboardingEspiritualProps) {
  const router = useRouter();

  // Estado do formulário — espelha SpiritualProfile.
  const [formData, setFormData] = useState<OnboardingFormState>(INITIAL_FORM_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Hidrata do localStorage (retomar progresso)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          formData?: Partial<OnboardingFormState>;
          currentStep?: number;
        };
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...parsed.formData }));
        }
        if (
          typeof parsed.currentStep === 'number' &&
          parsed.currentStep >= 0 &&
          parsed.currentStep < TOTAL_STEPS
        ) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch {
      // localStorage indisponível / corrompido — segue com defaults
    }
    setHydrated(true);
  }, []);

  // Persiste no localStorage (somente após hidratação)
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ formData, currentStep })
      );
    } catch {
      // ignore quota / private mode
    }
  }, [formData, currentStep, hydrated]);

  // ============================================================================
  // DERIVATIONS
  // ============================================================================

  const canProceed = useMemo<boolean>(() => {
    const step = STEP_KEYS[currentStep];
    if (step === 'fullName') return formData.fullName.trim().length >= 3;
    if (step === 'birthDate') return /^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate);
    if (step === 'birthTime') {
      return formData.birthTime === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(formData.birthTime);
    }
    if (step === 'local') {
      return (
        formData.birthCity.trim().length >= 2 &&
        formData.birthState.trim().length >= 2 &&
        formData.birthCountry.trim().length >= 2
      );
    }
    if (step === 'traditions') {
      return formData.traditions.length >= 1 && formData.traditions.length <= 5;
    }
    return false;
  }, [currentStep, formData]);

  // ============================================================================
  // UPDATERS
  // ============================================================================

  const updateField = useCallback(
    <K extends keyof OnboardingFormState>(key: K, value: OnboardingFormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
      setServerError(null);
    },
    []
  );

  const toggleTradition = useCallback((t: Tradition) => {
    setFormData((prev) => {
      const has = prev.traditions.includes(t);
      if (has) {
        return {
          ...prev,
          traditions: prev.traditions.filter((x) => x !== t),
        };
      }
      // Limita a MAX_TRADITIONS=5
      if (prev.traditions.length >= 5) return prev;
      return { ...prev, traditions: [...prev.traditions, t] };
    });
    setFieldErrors((prev) => ({ ...prev, traditions: '' }));
  }, []);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const validateCurrent = useCallback((): boolean => {
    const step = STEP_KEYS[currentStep];
    const values =
      step === 'local'
        ? {
            birthCity: formData.birthCity,
            birthState: formData.birthState,
            birthCountry: formData.birthCountry,
          }
        : step === 'fullName'
        ? { fullName: formData.fullName }
        : step === 'birthDate'
        ? { birthDate: formData.birthDate }
        : step === 'birthTime'
        ? { birthTime: formData.birthTime }
        : { traditions: formData.traditions };

    const result = validateStep(step, values);
    if (!result.ok) {
      setFieldErrors(result.errors);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [currentStep, formData]);

  const goNext = useCallback(() => {
    if (!validateCurrent()) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setAnimKey((k) => k + 1);
      setCurrentStep((s) => s + 1);
      // Scroll para o topo do card em mobile
      requestAnimationFrame(() => {
        stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [validateCurrent, currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('back');
      setAnimKey((k) => k + 1);
      setCurrentStep((s) => s - 1);
      setFieldErrors({});
      setServerError(null);
    }
  }, [currentStep]);

  // ============================================================================
  // SUBMIT — gerar mapa inicial
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    if (!validateCurrent()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const result = await generateInitialMapaAction({
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        birthTime: formData.birthTime || undefined,
        birthCity: formData.birthCity.trim(),
        birthState: formData.birthState.trim(),
        birthCountry: formData.birthCountry.trim(),
        traditions: formData.traditions,
      });

      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(result.fieldErrors).map(([k, v]) => [k, v[0] ?? ''])
            )
          );
        }
        setServerError(result.error);
        setSubmitting(false);
        return;
      }

      // Limpa o progresso salvo
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      onComplete?.({ ...formData, profileId: result.data?.profileId });

      // Pequeno delay pra UX apreciar o "✨ Mapa gerado"
      setTimeout(() => {
        router.push(redirectTo);
      }, 400);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao gerar mapa');
      setSubmitting(false);
    }
  }, [formData, validateCurrent, router, redirectTo, onComplete]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <CosmicBackground variant="subtle" className={cn('min-h-screen', className)}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        {/* SR-only live region para acessibilidade */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {`Passo ${currentStep + 1} de ${TOTAL_STEPS}: ${STEP_LABELS[currentStep]}`}
        </div>

        <OnboardingProgress
          current={currentStep}
          total={TOTAL_STEPS}
          labels={[...STEP_LABELS]}
          className="w-full max-w-md mb-6"
        />

        <div
          ref={stepContentRef}
          key={animKey}
          data-direction={direction}
          data-step={currentStep}
          className={cn(
            'step-content-wrapper w-full max-w-md card-spiritual rounded-2xl p-5 sm:p-8',
            direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward'
          )}
        >
          {STEP_KEYS[currentStep] === 'fullName' && (
            <StepNome
              value={formData.fullName}
              onChange={(v) => updateField('fullName', v)}
              error={fieldErrors.fullName}
            />
          )}

          {STEP_KEYS[currentStep] === 'birthDate' && (
            <StepDataNascimento
              value={formData.birthDate}
              onChange={(v) => updateField('birthDate', v)}
              error={fieldErrors.birthDate}
            />
          )}

          {STEP_KEYS[currentStep] === 'birthTime' && (
            <StepHoraNascimento
              value={formData.birthTime}
              onChange={(v) => updateField('birthTime', v)}
              error={fieldErrors.birthTime}
            />
          )}

          {STEP_KEYS[currentStep] === 'local' && (
            <StepLocal
              value={
                {
                  city: formData.birthCity,
                  state: formData.birthState,
                  country: formData.birthCountry,
                } satisfies StepLocalValues
              }
              onChange={(v) => {
                setFormData((prev) => ({
                  ...prev,
                  birthCity: v.city,
                  birthState: v.state,
                  birthCountry: v.country,
                }));
                setFieldErrors((prev) => ({
                  ...prev,
                  birthCity: '',
                  birthState: '',
                  birthCountry: '',
                }));
                setServerError(null);
              }}
              errors={{
                city: fieldErrors.birthCity,
                state: fieldErrors.birthState,
                country: fieldErrors.birthCountry,
              }}
            />
          )}

          {STEP_KEYS[currentStep] === 'traditions' && (
            <StepTradicoes
              value={formData.traditions}
              onToggle={toggleTradition}
              error={fieldErrors.traditions}
            />
          )}

          {serverError && (
            <div
              role="alert"
              data-testid="server-error"
              className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{serverError}</span>
            </div>
          )}

          <MysticDivider variant="subtle" className="my-6" />

          {/* Navegação */}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 0 || submitting}
              className="text-foreground/80"
              data-testid="btn-back"
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>

            {currentStep < TOTAL_STEPS - 1 ? (
              <Button
                type="button"
                variant="golden"
                onClick={goNext}
                disabled={!canProceed}
                className="font-bold"
                data-testid="btn-next"
              >
                Próximo
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="golden"
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="font-bold cta-final"
                data-testid="btn-submit"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" variant="gold" className="mr-2" />
                    Gerando mapa...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Gerar Meu Mapa
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-md">
          Seu mapa fica salvo no perfil e pode ser revisitado a qualquer
          momento. Nada é publicado sem sua permissão.
        </p>
      </div>

      <style>{`
        @keyframes stepEnterForward {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes stepEnterBackward {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-content-wrapper {
          animation-duration: 280ms;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }
        .step-enter-forward  { animation-name: stepEnterForward; }
        .step-enter-backward { animation-name: stepEnterBackward; }
        .cta-final:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(212,175,55,0.5);
          transform: scale(1.02);
        }
        @media (prefers-reduced-motion: reduce) {
          .step-content-wrapper { animation: none !important; }
          .cta-final:hover:not(:disabled) { transform: none !important; }
        }
      `}</style>
    </CosmicBackground>
  );
}

export default OnboardingEspiritual;