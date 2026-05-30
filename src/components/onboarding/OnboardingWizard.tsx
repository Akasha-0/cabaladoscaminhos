'use client';

import { useState, useEffect, useRef } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
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

// Brazilian states
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

  // Auto-focus first input on step change
  useEffect(() => {
    if (currentStep > 0 && currentStep < 3) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  // Handle keyboard navigation
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
        {/* Progress Indicator */}
        <div
          role="tablist"
          aria-label="Progresso do onboarding"
          className="flex items-center gap-2 mb-12"
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div key={index} className="flex items-center">
              {/* Connector line */}
              {index < TOTAL_STEPS - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-1 transition-all duration-500',
                    index < currentStep
                      ? 'bg-gradient-to-r from-[var(--spiritual-gold)] to-[var(--spiritual-gold-light)]'
                      : 'bg-white/20'
                  )}
                />
              )}

              {/* Step indicator */}
              <div
                role="tab"
                aria-selected={currentStep === index}
                aria-label={`Passo ${index + 1}${index < currentStep ? ' - completado' : index === currentStep ? ' - atual' : ''}`}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                  index < currentStep && 'bg-gradient-to-br from-[var(--spiritual-gold)] to-[var(--spiritual-gold-dark)] text-black',
                  index === currentStep && 'bg-[var(--spiritual-gold)] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)]',
                  index > currentStep && 'border-2 border-white/30 bg-transparent text-white/30'
                )}
              >
                {index < currentStep ? (
                  <span className="text-sm font-bold">✦</span>
                ) : index === currentStep ? (
                  <span className="text-sm font-bold">{index + 1}</span>
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content Card */}
        <div
          role="tabpanel"
          aria-label={`Passo ${currentStep + 1} de ${TOTAL_STEPS}`}
          key={animationKey}
          className={cn(
            'step-content w-full max-w-md',
            direction === 'forward' ? 'slide-in-right' : 'slide-in-left'
          )}
          onKeyDown={handleKeyDown}
        >
          <div className="card-spiritual bg-[var(--card)] border border-[var(--spiritual-gold-muted)] rounded-2xl p-8 shadow-[var(--shadow-glow-gold)]">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                {/* Cosmic decorative element */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--spiritual-gold)] to-[var(--spiritual-violet)] opacity-20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[var(--spiritual-violet)] to-[var(--spiritual-gold)] opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">✦</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="font-[family-name:var(--font-cinzel)] text-3xl font-bold text-[var(--spiritual-gold)] tracking-wide">
                    Desperte sua Alma
                  </h1>
                  <p className="font-[family-name:var(--font-cormorant)] text-xl text-[var(--muted-foreground)] italic">
                    Bem-vindo à Cabala dos Caminhos
                  </p>
                </div>

                <MysticDivider variant="subtle" className="my-6" />

                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Prepare-se para uma jornada de autodescoberta através dos antigos caminhos da Cabala. 
                  Seu mapa astral aguardava por você.
                </p>

                <Button
                  variant="golden"
                  size="lg"
                  onClick={goNext}
                  className="mt-6 w-full group"
                >
                  <span>Começar Jornada</span>
                  <span className="ml-2 group-hover:animate-pulse">✦</span>
                </Button>
              </div>
            )}

            {/* Step 1: Name */}
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
                    className="flex-1"
                  >
                    Continuar
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Birth Date & Time */}
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
                    className="flex-1"
                  >
                    Continuar
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
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
                    className="flex-1 group"
                  >
                    <span>Gerar Meu Mapa</span>
                    <span className="ml-2 group-hover:animate-pulse">✦</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes stepEnter {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes stepExit {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-30px);
          }
        }

        .step-content {
          animation: stepEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </CosmicBackground>
  );
}