'use client';

// ============================================================================
// WelcomeCarousel — Carrossel de 4 passos (Wave 35)
// ============================================================================
// Mobile-first: swipe entre steps via dots + setas, 44px touch targets,
// WCAG AA (foco visível, ARIA live region para anúncios).
//
// Cada step:
//   1. Mission — texto + ícone central
//   2. Traditions — grid 2x4 com símbolos + nomes
//   3. Features — grid 2x2 com ícones Lucide
//   4. Community — grid 2x3 com ícones + descrição curta
//
// Estado:
//   - Local: `currentStep` (0..3)
//   - Persistido: a cada mudança, PUT /api/onboarding/state com `welcomeStep`
//   - Avança estado: ao chegar no step 3 + clicar "Continuar"
//
// Eventos registrados via POST /api/onboarding/event:
//   - WELCOME_VIEWED (mount)
//   - WELCOME_STEP_CHANGED (cada step)
//   - WELCOME_COMPLETED ou WELCOME_SKIPPED (saída)
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  BookOpen,
  MessageCircle,
  ShoppingBag,
  Users,
  Compass,
  Calendar,
  CheckCircle2,
  CircleHelp,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WELCOME_STEPS } from '@/lib/onboarding/state-machine';

// ============================================================================
// Sub-components — Visual cards para cada step
// ============================================================================

function TraditionCard({
  symbol,
  name,
  description,
}: {
  symbol: string;
  name: string;
  description: string;
}) {
  return (
    <div className="card-spiritual p-3 sm:p-4 text-left">
      <div className="text-2xl sm:text-3xl mb-1" aria-hidden="true">
        {symbol}
      </div>
      <div className="font-cinzel text-sm font-bold text-amber-200">{name}</div>
      <p className="text-tiny text-slate-400 mt-1 leading-tight">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card-spiritual p-3 sm:p-4 text-left">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 text-amber-300 flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="font-serif text-sm font-bold text-slate-100">{title}</div>
      <p className="text-tiny text-slate-400 mt-1 leading-tight">{description}</p>
    </div>
  );
}

function CommunityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/40">
      <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-300 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="font-serif text-sm font-bold text-slate-100">{title}</div>
        <p className="text-tiny text-slate-400 mt-0.5 leading-tight">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Steps content
// ============================================================================

function MissionStep() {
  return (
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="text-5xl sm:text-6xl mb-2" aria-hidden="true">
        ✦
      </div>
      <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
        Bem-vindo(a) à Cabala dos Caminhos
      </h2>
      <p className="font-serif text-base sm:text-lg text-slate-200 leading-relaxed max-w-md mx-auto">
        Um portal que reúne praticantes de diferentes tradições espirituais em um
        espaço seguro de estudo, partilha e transformação.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto pt-2">
        <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-2xl mb-1" aria-hidden="true">
            🕎
          </div>
          <div className="text-tiny text-amber-200">Estudo</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-2xl mb-1" aria-hidden="true">
            🌿
          </div>
          <div className="text-tiny text-amber-200">Prática</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="text-2xl mb-1" aria-hidden="true">
            🤝
          </div>
          <div className="text-tiny text-amber-200">Comunidade</div>
        </div>
      </div>
    </div>
  );
}

function TraditionsStep() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center mb-3">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
          7 tradições
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Praticamos e dialogamos entre múltiplos caminhos.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto">
        <TraditionCard symbol="🕎" name="Cabala" description="Tradição mística judaica" />
        <TraditionCard symbol="🌍" name="Ifá / Orixás" description="Caminhos iorubás" />
        <TraditionCard symbol="♈" name="Astrologia" description="Ciclos celestes e mapas" />
        <TraditionCard symbol="🧘" name="Tantra" description="Práticas tântricas" />
        <TraditionCard symbol="🌬️" name="Xamanismo" description="Tradições indígenas" />
        <TraditionCard symbol="✝️" name="Cristianismo Místico" description="Esoterismo cristão" />
        <TraditionCard symbol="🪶" name="Umbanda" description="Caminhos brasileiros" />
        <TraditionCard symbol="☸️" name="Budismo" description="Dharma e meditação" />
      </div>
    </div>
  );
}

function FeaturesStep() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center mb-3">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
          O que você pode fazer
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          4 recursos principais disponíveis desde o dia 1.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto">
        <FeatureCard
          icon={<Sparkles className="w-5 h-5" aria-hidden />}
          title="Akasha IA"
          description="Mentor simbólico com curadoria ética"
        />
        <FeatureCard
          icon={<CircleHelp className="w-5 h-5" aria-hidden />}
          title="Oráculo"
          description="Tiragens de Runas, I Ching, Tarô"
        />
        <FeatureCard
          icon={<ShoppingBag className="w-5 h-5" aria-hidden />}
          title="Marketplace"
          description="Cursos, mentorias, rituais"
        />
        <FeatureCard
          icon={<BookOpen className="w-5 h-5" aria-hidden />}
          title="Biblioteca"
          description="Artigos, podcasts, grimórios"
        />
      </div>
    </div>
  );
}

function CommunityStep() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center mb-3">
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
          Comunidade viva
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Você nunca caminha sozinho(a).
        </p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <CommunityCard
          icon={<Users className="w-4 h-4" aria-hidden />}
          title="Grupos de prática"
          description="Círculos temáticos por tradição e nível."
        />
        <CommunityCard
          icon={<Compass className="w-4 h-4" aria-hidden />}
          title="Mentoria 1:1"
          description="Conecte-se com praticantes experientes."
        />
        <CommunityCard
          icon={<Calendar className="w-4 h-4" aria-hidden />}
          title="Eventos ao vivo"
          description="Meditações, rituais, círculos de partilha."
        />
        <CommunityCard
          icon={<MessageCircle className="w-4 h-4" aria-hidden />}
          title="Feed e journals"
          description="Compartilhe reflexões e acompanhe outros."
        />
        <CommunityCard
          icon={<Star className="w-4 h-4" aria-hidden />}
          title="Trilhas de estudo"
          description="Currículos progressivos por tradição."
        />
      </div>
    </div>
  );
}

const STEP_CONTENT = [MissionStep, TraditionsStep, FeaturesStep, CommunityStep];

// ============================================================================
// Component
// ============================================================================

export interface WelcomeCarouselProps {
  initialStep?: number;
  nextRouteOnComplete?: string;
}

export function WelcomeCarousel({
  initialStep = 0,
  nextRouteOnComplete = '/onboarding/profile',
}: WelcomeCarouselProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(Math.max(0, Math.min(initialStep, 3)));
  const [submitting, setSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState<string>(
    WELCOME_STEPS[currentStep]?.title ?? ''
  );
  const startTimeRef = useRef<number>(Date.now());

  // --- Persist + log --------------------------------------------------
  const persist = useCallback(
    async (opts: { step: number; eventKind: 'WELCOME_STEP_CHANGED' | 'WELCOME_VIEWED' }) => {
      try {
        await fetch('/api/onboarding/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ welcomeStep: opts.step }),
        });
        await fetch('/api/onboarding/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: opts.eventKind, metadata: { step: opts.step } }),
        });
      } catch {
        // best-effort
      }
    },
    []
  );

  // Mount: log WELCOME_VIEWED + state transition.
  useEffect(() => {
    void persist({ step: currentStep, eventKind: 'WELCOME_VIEWED' });
    void fetch('/api/onboarding/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ welcomeStep: currentStep, transitionEvent: 'welcome_viewed' }),
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToStep = (n: number) => {
    if (n < 0 || n > 3) return;
    const next = n;
    setCurrentStep(next);
    setAnnouncement(`Passo ${next + 1} de 4: ${WELCOME_STEPS[next]?.title}`);
    void persist({ step: next, eventKind: 'WELCOME_STEP_CHANGED' });
  };

  const complete = useCallback(
    async (kind: 'WELCOME_COMPLETED' | 'WELCOME_SKIPPED') => {
      setSubmitting(true);
      try {
        await fetch('/api/onboarding/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            metadata: {
              finalStep: currentStep,
              durationMs: Date.now() - startTimeRef.current,
            },
          }),
        });
        await fetch('/api/onboarding/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            welcomeStep: currentStep,
            transitionEvent: kind === 'WELCOME_COMPLETED' ? 'welcome_completed' : 'welcome_skipped',
          }),
        });
        router.push(nextRouteOnComplete);
      } catch {
        setSubmitting(false);
      }
    },
    [currentStep, nextRouteOnComplete, router]
  );

  const StepContent = STEP_CONTENT[currentStep];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 sm:py-10 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="text-tiny text-amber-300/80 font-cinzel tracking-widest">
          BEM-VINDO(A) · {currentStep + 1}/4
        </div>
        <button
          type="button"
          onClick={() => complete('WELCOME_SKIPPED')}
          disabled={submitting}
          className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-2 inline-flex items-center gap-1 px-3 py-2 min-h-[44px]"
        >
          <SkipForward className="w-4 h-4" aria-hidden="true" />
          Pular
        </button>
      </header>

      {/* Progress dots */}
      <div
        className="flex items-center justify-center gap-2 mb-6 sm:mb-8"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-label={`Passo ${currentStep + 1} de 4`}
      >
        {WELCOME_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goToStep(i)}
            aria-label={`Ir para passo ${i + 1}: ${s.title}`}
            className={cn(
              'h-2 rounded-full transition-all',
              i === currentStep ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div role="region" aria-label={announcement}>
          <StepContent />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 sm:mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 0}
          className={cn(
            'inline-flex items-center justify-center gap-1 px-4 py-3 rounded-lg min-h-[44px] min-w-[44px] text-sm font-medium',
            currentStep === 0
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-200 hover:bg-slate-800/60'
          )}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => goToStep(currentStep + 1)}
            className="inline-flex items-center justify-center gap-1 px-5 py-3 rounded-lg min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold hover:brightness-110"
          >
            Continuar
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => complete('WELCOME_COMPLETED')}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-1 px-5 py-3 rounded-lg min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold hover:brightness-110"
          >
            {submitting ? (
              'Salvando...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Começar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}