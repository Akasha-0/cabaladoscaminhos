'use client';

// ============================================================================
// TourPageClient — Wrapper client para /onboarding/tour
// ============================================================================
// Renderiza o TourOverlay sobre o conteúdo padrão da comunidade. O overlay
// detecta os elementos `[data-tour="ID"]` automaticamente — se algum
// elemento não estiver no DOM, pula para o próximo (defesa).
//
// `?tour=1` na URL triggera o auto-start. Botão "Rever tour" também
// chama o overlay manualmente.
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, ArrowLeft } from 'lucide-react';
import { TourOverlay } from './TourOverlay';
import { OnboardingProgress } from './OnboardingProgress';
import type { OnboardingStateLite } from './progress-helpers';

export interface TourPageClientProps {
  userId: string;
  currentState: OnboardingStateLite;
}

export function TourPageClient({ userId, currentState }: TourPageClientProps) {
  const router = useRouter();
  const [tourActive, setTourActive] = useState(true);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="mb-6">
          <button
            type="button"
            onClick={() => router.push('/feed')}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-3 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar para o feed
          </button>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200 flex items-center gap-2">
            <Compass className="w-6 h-6" aria-hidden="true" />
            Tour pela plataforma
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conheça os 7 principais recursos em menos de 2 minutos.
          </p>
        </header>

        <div className="mb-6">
          <OnboardingProgress state={currentState} />
        </div>

        <section className="card-spiritual p-6 sm:p-8 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            ✦
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200 mb-2">
            Pronto(a) para começar?
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Vamos destacar os principais recursos da plataforma. Você pode pular
            a qualquer momento e refazer quando quiser.
          </p>
          <button
            type="button"
            onClick={() => setTourActive(true)}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold hover:brightness-110"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Iniciar tour
          </button>
        </section>
      </div>

      <TourOverlay
        autoStart={tourActive}
        onComplete={() => setTourActive(false)}
        onSkip={() => setTourActive(false)}
      />
    </main>
  );
}