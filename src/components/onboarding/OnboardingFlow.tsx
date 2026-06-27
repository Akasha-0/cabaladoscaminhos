'use client';

/**
 * OnboardingFlow — fluxo de 5 passos para o mapa espiritual
 * ----------------------------------------------------------------------------
 * Substitui o wizard de 4 passos anterior. Estrutura:
 *   1. Nome completo (certidão)
 *   2. Tradições de interesse (multi-select, min 1)
 *   3. Data de nascimento
 *   4. Hora de nascimento (opcional)
 *   5. Local de nascimento (cidade + país)
 *
 * Após o passo 5, chama `completeOnboardingAction` (server action) que
 * persiste no SpiritualProfile via Prisma e marca `onboardedAt`.
 *
 * O componente é client-side — usa `useAuth` para saber se há sessão
 * (server-side guard em `middleware.ts` impede acesso sem login).
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, User, Star, Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
  TRADITIONS,
  type Tradition,
  type OnboardingStep1Input,
  type OnboardingStep2Input,
  type OnboardingStep3Input,
  type OnboardingStep4Input,
  type OnboardingStep5Input,
} from '@/lib/validation/auth';
import { completeOnboardingAction, type ActionResult } from '@/app/actions/auth';
import { useAuth } from '@/hooks/useAuth';

const STEPS = [
  { key: 'name', title: 'Seu Nome', subtitle: 'Como aparece no documento' },
  { key: 'traditions', title: 'Tradições', subtitle: 'Quais caminhos te chamam' },
  { key: 'birthdate', title: 'Nascimento', subtitle: 'Data do seu despertar' },
  { key: 'birthtime', title: 'Hora', subtitle: 'O instante exato (opcional)' },
  { key: 'birthplace', title: 'Local', subtitle: 'Onde a alma escolheu encarnar' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const TRADITION_LABELS: Record<Tradition, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá / Orixás',
  astrologia: 'Astrologia',
  tantra: 'Numerologia Tântrica',
  xamanismo: 'Xamanismo',
  'cristianismo-mistico': 'Cristianismo Místico',
  umbanda: 'Umbanda',
  budismo: 'Budismo',
  hinduismo: 'Hinduísmo',
  sufismo: 'Sufismo',
};

interface OnboardingFlowProps {
  className?: string;
  onComplete?: (data: {
    fullName: string;
    traditions: string[];
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthCountry: string;
  }) => void;
}

export function OnboardingFlow({ className, onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    fullName: string;
    traditions: Tradition[];
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    birthCountry: string;
  }>({
    fullName: '',
    traditions: [],
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    birthCountry: 'Brasil',
  });

  // Redireciona se não autenticado (defesa em profundidade — middleware já protege)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectTo=/onboarding');
    }
  }, [loading, user, router]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (formData.fullName?.trim().length ?? 0) >= 2;
      case 1:
        return formData.traditions.length > 0 && formData.traditions.length <= 6;
      case 2:
        return /^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate);
      case 3:
        return formData.birthTime === '' || /^\d{2}:\d{2}$/.test(formData.birthTime);
      case 4:
        return formData.birthPlace.trim().length >= 2 && formData.birthCountry.trim().length >= 2;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const update = useCallback(<K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    setServerError(null);
  }, []);

  const toggleTradition = useCallback((t: Tradition) => {
    setFormData((prev) => {
      const has = prev.traditions.includes(t);
      return {
        ...prev,
        traditions: has
          ? prev.traditions.filter((x) => x !== t)
          : [...prev.traditions, t].slice(0, 6),
      };
    });
    setFieldErrors((prev) => ({ ...prev, traditions: '' }));
  }, []);

  const goNext = () => {
    if (!canProceed) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setServerError(null);
    setFieldErrors({});

    // Valida passo a passo (Zod) — server action também valida
    const validations = [
      { schema: onboardingStep1Schema, data: { fullName: formData.fullName } },
      { schema: onboardingStep2Schema, data: { traditions: formData.traditions } },
      { schema: onboardingStep3Schema, data: { birthDate: formData.birthDate } },
      { schema: onboardingStep4Schema, data: { birthTime: formData.birthTime } },
      { schema: onboardingStep5Schema, data: { birthPlace: formData.birthPlace, birthCountry: formData.birthCountry } },
    ];

    for (const v of validations) {
      const parsed = v.schema.safeParse(v.data);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((issue) => {
          errs[String(issue.path[0])] = issue.message;
        });
        setFieldErrors(errs);
        return;
      }
    }

    setSubmitting(true);
    try {
      const result: ActionResult<{ profileId: string; userId: string }> =
        await completeOnboardingAction({
          fullName: formData.fullName.trim(),
          traditions: formData.traditions,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || undefined,
          birthPlace: formData.birthPlace.trim(),
          birthCountry: formData.birthCountry.trim(),
        });

      if (!result.ok) {
        if (result.fieldErrors) {
          const errs: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([k, msgs]) => {
            errs[k] = msgs[0] ?? '';
          });
          setFieldErrors(errs);
        }
        setServerError(result.error);
        return;
      }

      if (onComplete) {
        onComplete({
          fullName: formData.fullName.trim(),
          traditions: formData.traditions,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace.trim(),
          birthCountry: formData.birthCountry.trim(),
        });
      }

      router.push('/feed?welcome=1');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao finalizar onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center gap-2 text-amber-500">
            {[...Array(7)].map((_, i) => (
              <span key={i} className="text-2xl animate-pulse">
                ✦
              </span>
            ))}
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const step = STEPS[currentStep];

  return (
    <CosmicBackground variant="subtle" className={cn('min-h-screen', className)}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2" aria-label="Progresso">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              {i > 0 && (
                <div
                  className={cn(
                    'w-10 h-0.5 mx-1',
                    i <= currentStep ? 'bg-spiritual-gold' : 'bg-white/20'
                  )}
                />
              )}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  i < currentStep && 'bg-spiritual-gold border-spiritual-gold text-slate-900',
                  i === currentStep &&
                    'border-spiritual-gold text-spiritual-gold animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.5)]',
                  i > currentStep && 'border-white/30 bg-transparent text-white/40'
                )}
                aria-current={i === currentStep ? 'step' : undefined}
                aria-label={`Passo ${i + 1} de ${STEPS.length}: ${s.title}`}
              >
                {i < currentStep ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="w-full max-w-md card-spiritual rounded-2xl p-6 sm:p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-2">
              <StepIcon step={step.key as StepKey} />
            </div>
            <h2 className="font-cinzel text-2xl font-bold text-foreground">{step.title}</h2>
            <p className="text-sm text-muted-foreground font-serif italic">{step.subtitle}</p>
            <p className="text-xs text-spiritual-gold/70 font-cinzel tracking-widest">
              PASSO {currentStep + 1} DE {STEPS.length}
            </p>
          </div>

          <MysticDivider variant="subtle" className="my-4" />

          {/* Step content */}
          <div className="space-y-4 mt-6">
            {step.key === 'name' && (
              <Step1Name value={formData.fullName} onChange={(v) => update('fullName', v)} error={fieldErrors.fullName} />
            )}
            {step.key === 'traditions' && (
              <Step2Traditions value={formData.traditions} onToggle={toggleTradition} error={fieldErrors.traditions} />
            )}
            {step.key === 'birthdate' && (
              <Step3BirthDate value={formData.birthDate} onChange={(v) => update('birthDate', v)} error={fieldErrors.birthDate} />
            )}
            {step.key === 'birthtime' && (
              <Step4BirthTime value={formData.birthTime} onChange={(v) => update('birthTime', v)} error={fieldErrors.birthTime} />
            )}
            {step.key === 'birthplace' && (
              <Step5BirthPlace
                place={formData.birthPlace}
                country={formData.birthCountry}
                onChangePlace={(v) => update('birthPlace', v)}
                onChangeCountry={(v) => update('birthCountry', v)}
                errors={fieldErrors}
              />
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
            >
              {serverError}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-3">
            {currentStep > 0 ? (
              <Button variant="ghost" onClick={goBack} disabled={submitting} type="button">
                <ArrowLeft className="mr-2 size-4" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canProceed}
                className="bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light text-slate-900 font-bold hover:scale-[1.02] transition-transform"
              >
                Continuar
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light text-slate-900 font-bold hover:scale-[1.02] transition-transform"
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
      </div>
    </CosmicBackground>
  );
}

// ============================================================================
// SUB-COMPONENTS (passos)
// ============================================================================

function StepIcon({ step }: { step: StepKey }) {
  const cls = 'w-12 h-12 text-spiritual-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]';
  switch (step) {
    case 'name':
      return <User className={cls} />;
    case 'traditions':
      return <Star className={cls} />;
    case 'birthdate':
      return <Calendar className={cls} />;
    case 'birthtime':
      return <Clock className={cls} />;
    case 'birthplace':
      return <MapPin className={cls} />;
  }
}

function Step1Name({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="fullName" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
        Nome Completo
      </Label>
      <Input
        id="fullName"
        type="text"
        autoComplete="name"
        placeholder="Como em sua certidão de nascimento"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-12 text-lg', error && 'border-red-500')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'fullName-error' : undefined}
        autoFocus
      />
      {error && (
        <p id="fullName-error" className="text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

function Step2Traditions({
  value,
  onToggle,
  error,
}: {
  value: Tradition[];
  onToggle: (t: Tradition) => void;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Escolha de 1 a 6 tradições. Você poderá mudar depois.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TRADITIONS.map((t) => {
          const selected = value.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              className={cn(
                'text-left rounded-lg border p-3 transition-all text-sm font-serif',
                selected
                  ? 'border-spiritual-gold bg-spiritual-gold/10 text-spiritual-gold'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-spiritual-gold/50'
              )}
              aria-pressed={selected}
            >
              {selected && <Sparkles className="w-3 h-3 inline mr-1" />}
              {TRADITION_LABELS[t]}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {value.length > 0 && (
        <p className="text-xs text-spiritual-gold/70">{value.length} selecionada(s)</p>
      )}
    </div>
  );
}

function Step3BirthDate({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="birthDate" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
        Data de Nascimento
      </Label>
      <Input
        id="birthDate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-12 text-lg', error && 'border-red-500')}
        max={new Date().toISOString().slice(0, 10)}
        aria-invalid={Boolean(error)}
        autoFocus
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

function Step4BirthTime({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="birthTime" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
        Horário (opcional)
      </Label>
      <Input
        id="birthTime"
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-12 text-lg', error && 'border-red-500')}
        aria-invalid={Boolean(error)}
        autoFocus
      />
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-spiritual-gold" />
        A hora exata aumenta a precisão da sua carta astral.
      </p>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-spiritual-gold/70 underline"
        >
          Não sei a hora exata
        </button>
      )}
    </div>
  );
}

function Step5BirthPlace({
  place,
  country,
  onChangePlace,
  onChangeCountry,
  errors,
}: {
  place: string;
  country: string;
  onChangePlace: (v: string) => void;
  onChangeCountry: (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="birthPlace" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
          Cidade de Nascimento
        </Label>
        <Input
          id="birthPlace"
          type="text"
          autoComplete="address-level2"
          placeholder="Ex: Salvador"
          value={place}
          onChange={(e) => onChangePlace(e.target.value)}
          className={cn('h-12 text-lg', errors.birthPlace && 'border-red-500')}
          aria-invalid={Boolean(errors.birthPlace)}
          autoFocus
        />
        {errors.birthPlace && <p className="text-red-400 text-sm">{errors.birthPlace}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthCountry" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
          País
        </Label>
        <Input
          id="birthCountry"
          type="text"
          autoComplete="country-name"
          placeholder="Brasil"
          value={country}
          onChange={(e) => onChangeCountry(e.target.value)}
          className={cn('h-12 text-lg', errors.birthCountry && 'border-red-500')}
          aria-invalid={Boolean(errors.birthCountry)}
        />
        {errors.birthCountry && <p className="text-red-400 text-sm">{errors.birthCountry}</p>}
      </div>
    </div>
  );
}