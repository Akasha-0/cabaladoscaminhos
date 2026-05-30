'use client';

import { useState, useEffect, useRef } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  city: string;
  state: string;
  country: string;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  className?: string;
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const TOTAL_STEPS = 4;

export function OnboardingWizard({ onComplete, className }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    country: 'Brasil',
  });
  const [animationKey, setAnimationKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFormData = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return (formData.fullName?.length ?? 0) >= 2;
      case 2:
        return !!formData.birthDate;
      case 3:
        return !!formData.city && !!formData.state;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (canProceed() && currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setAnimationKey((prev) => prev + 1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection('back');
      setAnimationKey((prev) => prev + 1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      onComplete({
        fullName: formData.fullName ?? '',
        birthDate: formData.birthDate ?? '',
        birthTime: formData.birthTime ?? '',
        city: formData.city ?? '',
        state: formData.state ?? '',
        country: formData.country ?? 'Brasil',
      });
    }
  };

  useEffect(() => {
    if (currentStep > 0 && currentStep < 3) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed()) {
      if (currentStep === TOTAL_STEPS - 1) {
        handleSubmit();
      } else {
        goNext();
      }
    }
  };

  return (
    <CosmicBackground variant="subtle" className={cn('min-h-screen flex flex-col', className)}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Step change announcement for screen readers */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {currentStep === 0 && 'Bem-vindo à Cabala dos Caminhos. Passo 1 de 4.'}
          {currentStep === 1 && 'Passo 2 de 4: Informe seu nome completo.'}
          {currentStep === 2 && 'Passo 3 de 4: Informe sua data de nascimento.'}
          {currentStep === 3 && 'Passo 4 de 4: Informe sua cidade e estado de nascimento.'}
        </div>
        <div
          role="tablist"
          aria-label="Progresso do onboarding"
          className="flex items-center gap-2 mb-12"
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div key={index} className="flex items-center">
              {index < TOTAL_STEPS - 1 && (
                <div
                  className={cn(
                    'connector-line relative w-12 h-0.5 mx-1 overflow-hidden rounded-full',
                    index < currentStep
                      ? 'bg-[var(--spiritual-gold)]/30'
                      : 'bg-white/20'
                  )}
                >
                  <div
                    className={cn(
                      'connector-fill absolute inset-0 bg-gradient-to-r from-[var(--spiritual-gold)] to-[var(--spiritual-gold-light)] rounded-full',
                      index < currentStep ? 'connector-fill-active' : 'scale-x-0'
                    )}
                  />
                </div>
              )}
              <div
                role="tab"
                aria-selected={currentStep === index}
                aria-label={`Passo ${index + 1}${index < currentStep ? ' - completado' : index === currentStep ? ' - atual' : ''}`}
                className={cn(
                  'step-indicator relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300',
                  index < currentStep && 'step-completed bg-gradient-to-br from-[var(--spiritual-gold)] to-[var(--spiritual-gold-dark)] text-black border-2 border-[var(--spiritual-gold)]',
                  index === currentStep && 'step-active bg-[var(--spiritual-gold)] text-black border-2 border-[var(--spiritual-gold-light)] shadow-[0_0_20px_rgba(212,175,55,0.6)]',
                  index > currentStep && 'border-2 border-white/30 bg-transparent text-white/30'
                )}
              >
                {index < currentStep ? (
                  <span className="checkmark-animate text-sm font-bold">✦</span>
                ) : index === currentStep ? (
                  <span className="text-sm font-bold animate-pulse">{index + 1}</span>
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          role="tabpanel"
          aria-label={`Passo ${currentStep + 1} de ${TOTAL_STEPS}`}
          data-direction={direction}
          className={cn(
            'step-content-wrapper w-full max-w-md',
            direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward'
          )}
          onKeyDown={handleKeyDown}
        >
          <div className="card-spiritual bg-[var(--card)] border border-[var(--spiritual-gold-muted)] rounded-2xl p-4 sm:p-8 shadow-[var(--shadow-glow-gold)]">
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--spiritual-gold)] to-[var(--spiritual-violet)] opacity-20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[var(--spiritual-violet)] to-[var(--spiritual-gold)] opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">✦</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-[var(--spiritual-gold)] tracking-wide">
                    Desperte sua Alma
                  </h1>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl text-[var(--muted-foreground)] italic">
                    Bem-vindo à Cabala dos Caminhos
                  </p>
                </div>
                <MysticDivider variant="subtle" className="my-4 sm:my-6" />
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Prepare-se para uma jornada de autodescoberta através dos antigos caminhos da Cabala.
                  Seu mapa astral aguardava por você.
                </p>

                <Button
                  variant="golden"
                  size="lg"
                  onClick={goNext}
                  className="mt-6 w-full cta-button group"
                >
                  <span>Começar Jornada</span>
                  <span className="ml-2 group-hover:animate-pulse">✦</span>
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-[family-name:var(--font-cinzel)] text-[var(--spiritual-gold)] uppercase tracking-widest">
                    Passo 1 de 4
                  </span>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold">
                    Qual é o seu nome completo?
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Como aparece no seu documento oficial
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.fullName ?? ''}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className="h-12 text-lg"
                    aria-label="Nome completo"
                    autoComplete="name"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Voltar
                  </Button>
                  <Button
                    variant="golden"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1 cta-button"
                  >
                    Continuar
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-[family-name:var(--font-cinzel)] text-[var(--spiritual-gold)] uppercase tracking-widest">
                    Passo 2 de 4
                  </span>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold">
                    Quando você nasceu?
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                      Data de Nascimento
                    </label>
                    <Input
                      ref={inputRef}
                      id="birthDate"
                      type="date"
                      value={formData.birthDate ?? ''}
                      onChange={(e) => updateFormData('birthDate', e.target.value)}
                      className="h-12 text-lg"
                      aria-label="Data de nascimento"
                    />
                  </div>

                  <div>
                    <label htmlFor="birthTime" className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                      Horário de Nascimento <span className="text-xs text-[var(--foreground)]/50">(opcional)</span>
                    </label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={formData.birthTime ?? ''}
                      onChange={(e) => updateFormData('birthTime', e.target.value)}
                      className="h-12 text-lg"
                      aria-label="Horário de nascimento"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-2 flex items-center gap-1">
                      <Sparkles className="size-3 text-[var(--spiritual-gold)]" />
                      A hora exata aumenta a precisão
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Voltar
                  </Button>
                  <Button
                    variant="golden"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1 cta-button"
                  >
                    Continuar
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-[family-name:var(--font-cinzel)] text-[var(--spiritual-gold)] uppercase tracking-widest">
                    Passo 3 de 4
                  </span>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold">
                    Onde você nasceu?
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                      Cidade
                    </label>
                    <Input
                      ref={inputRef}
                      id="city"
                      type="text"
                      placeholder="Sua cidade"
                      value={formData.city ?? ''}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="h-12 text-lg"
                      aria-label="Cidade de nascimento"
                      autoComplete="address-level2"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                      Estado
                    </label>
                    <Select
                      value={formData.state ?? ''}
                      onValueChange={(value) => updateFormData('state', value ?? '')}
                    >
                      <SelectTrigger id="state" className="h-12 text-lg" aria-label="Estado de nascimento">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2 text-[var(--muted-foreground)]">
                      País
                    </label>
                    <Input
                      id="country"
                      type="text"
                      value={formData.country ?? 'Brasil'}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      className="h-12 text-lg"
                      aria-label="País de nascimento"
                      autoComplete="country-name"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Voltar
                  </Button>
                  <Button
                    variant="golden"
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className="flex-1 cta-button-final group"
                  >
                    <span className="cta-text">Gerar Meu Mapa</span>
                    <span className="ml-2 cta-icon">✦</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes stepEnterForward {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes stepEnterBackward {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .step-content-wrapper {
          animation-duration: 300ms;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }

        .step-enter-forward {
          animation-name: stepEnterForward;
        }

        .step-enter-backward {
          animation-name: stepEnterBackward;
        }

        .connector-fill {
          transform-origin: left center;
          transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .connector-fill-active {
          transform: scaleX(1);
        }

        @keyframes goldenGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.4),
                        0 0 30px rgba(212, 175, 55, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.7),
                        0 0 50px rgba(212, 175, 55, 0.4),
                        0 0 75px rgba(212, 175, 55, 0.2);
          }
        }

        .step-active {
          animation: goldenGlow 2s ease-in-out infinite;
        }

        @keyframes checkmarkPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .checkmark-animate {
          animation: checkmarkPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes goldenGlowPulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.3),
                        0 0 30px rgba(212, 175, 55, 0.15);
          }
          50% {
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.6),
                        0 0 50px rgba(212, 175, 55, 0.3),
                        0 0 75px rgba(212, 175, 55, 0.15);
          }
        }

        .cta-button-final {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }

        .cta-button-final:hover:not(:disabled) {
          transform: scale(1.02);
          animation: goldenGlowPulse 1.5s ease-in-out infinite;
        }

        .cta-button-final:hover:not(:disabled) .cta-icon {
          animation: ctaIconPulse 600ms ease-in-out infinite;
        }

        @keyframes ctaIconPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes starSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .cta-button-final:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .cta-button-final.loading .cta-icon {
          animation: starSpin 1s linear infinite;
        }

        .cta-button-final.loading .cta-text {
          opacity: 0.8;
        }

        .cta-button {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }

        .cta-button:hover:not(:disabled) {
          transform: scale(1.02);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </CosmicBackground>
  );
}
