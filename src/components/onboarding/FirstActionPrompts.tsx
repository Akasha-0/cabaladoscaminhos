'use client';

// ============================================================================
// FirstActionPrompts — Wave 35 Beta Onboarding
// ============================================================================
// Apresenta 5 first-action CTAs (post, akasha chat, mapa, leitura, mentoria).
// Tracking: cada CTA click registra `FIRST_ACTION_CTA_CLICKED`. Quando
// usuário volta da ação externa, registra `FIRST_ACTION_COMPLETED` e marca
// state = ONBOARDED.
//
// Layout: lista vertical mobile-first, cada item com:
//   - Ícone + título + descrição
//   - ETA estimado (minutos)
//   - Botão CTA (44px touch target)
//   - Estado "completed" (check verde) após retorno
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PenLine,
  Sparkles,
  Compass,
  BookOpen,
  Users,
  ArrowRight,
  Check,
  PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIRST_ACTIONS, progressPercent, justHitMilestone } from '@/lib/onboarding/state-machine';
import { OnboardingProgress } from './OnboardingProgress';

// ============================================================================
// Icon map — FIRST_ACTIONS.icon (string) → componente Lucide
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  PenLine,
  Sparkles,
  Compass,
  BookOpen,
  Users,
};

// ============================================================================
// Component
// ============================================================================

export function FirstActionPrompts() {
  const router = useRouter();

  // Estado local de qual ação já foi completada (vinda do localStorage para
  // sobreviver entre reloads cross-device via DB).
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [prevState, setPrevState] = useState<string>('TRADITION_CHOSEN');
  const [showConfetti, setShowConfetti] = useState(false);

  // Carrega estado inicial (DB) + completed actions (localStorage).
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/onboarding/state');
        const json = await res.json();
        if (json.ok && json.state) {
          setPrevState(json.state.onboardingState);
          // Recupera ações completadas via evento mais recente FIRST_ACTION_COMPLETED.
          // Para simplicidade: começamos com Set vazio — usuário clica "Marcar como feito"
          // após voltar da ação externa (botão "Voltei!").
        }
      } catch {
        // best-effort
      }
      // Hydrate from localStorage too (cross-tab resilience).
      try {
        const raw = localStorage.getItem('w35:completedActions');
        if (raw) setCompleted(new Set(JSON.parse(raw)));
      } catch {
        // best-effort
      }
    })();
  }, []);

  // Persiste completed actions.
  useEffect(() => {
    try {
      localStorage.setItem('w35:completedActions', JSON.stringify(Array.from(completed)));
    } catch {
      // best-effort
    }
  }, [completed]);

  const logEvent = useCallback(
    async (kind: string, metadata?: Record<string, unknown>, applyTransition?: string) => {
      try {
        await fetch('/api/onboarding/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            metadata: metadata ?? {},
            applyTransition: applyTransition ?? 'no_op',
          }),
        });
      } catch {
        // best-effort
      }
    },
    []
  );

  const handleCtaClick = useCallback(
    (actionId: string, href: string) => {
      void logEvent('FIRST_ACTION_CTA_CLICKED', { actionId });
      // Avança estado para FIRST_ACTION.
      void fetch('/api/onboarding/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitionEvent: 'first_action_started' }),
      }).catch(() => undefined);
      router.push(href);
    },
    [logEvent, router]
  );

  const handleMarkCompleted = useCallback(
    async (actionId: string) => {
      const next = new Set(completed);
      next.add(actionId);
      setCompleted(next);

      const wasJustStarted = prevState !== 'FIRST_ACTION';
      // Se for a primeira conclusão E ainda não está ONBOARDED, marca.
      const before = wasJustStarted ? 'TRADITION_CHOSEN' : prevState;
      const after = 'ONBOARDED';

      await logEvent('FIRST_ACTION_COMPLETED', { actionId, totalCompleted: next.size });

      if (next.size === 1) {
        // Primeira ação completada → ONBOARDED.
        await logEvent('FIRST_ACTION_COMPLETED', { actionId, milestone: 'first_done' }, 'first_action_completed');
        if (justHitMilestone(before as never, after, 100)) {
          await logEvent('MILESTONE_REACHED', { milestone: 100 });
        }
        setShowConfetti(true);
        setTimeout(() => {
          router.push('/feed?welcome=done');
        }, 2500);
      }
    },
    [completed, logEvent, prevState, router]
  );

  const handleFinishLater = useCallback(async () => {
    await logEvent('TOUR_SKIPPED', { reason: 'first_actions_skip_all' }, 'onboarding_skipped_all');
    router.push('/feed?welcome=skipped');
  }, [logEvent, router]);

  // --- Render --------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 relative">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-bounce">
            <div className="text-6xl" aria-hidden="true">
              🎉
            </div>
            <div className="font-cinzel text-2xl font-bold text-amber-300">
              Onboarding completo!
            </div>
            <p className="text-slate-200">Bem-vindo(a) à Cabala dos Caminhos</p>
          </div>
        </div>
      )}

      <header className="text-center">
        <div className="text-4xl mb-2" aria-hidden="true">
          ✦
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-200">
          Sua primeira ação
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Escolha por onde começar sua jornada.
        </p>
      </header>

      <OnboardingProgress state="FIRST_ACTION" />

      <div className="space-y-3">
        {FIRST_ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.icon] ?? Sparkles;
          const isDone = completed.has(action.id);
          return (
            <article
              key={action.id}
              className={cn(
                'card-spiritual p-4 sm:p-5 transition-all',
                isDone && 'opacity-70 border-green-500/40 bg-green-500/5'
              )}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={cn(
                    'w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    isDone ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/10 text-amber-300'
                  )}
                  aria-hidden="true"
                >
                  {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100">
                      {action.title}
                    </h3>
                    <span className="text-tiny text-slate-500">~{action.estimatedMinutes} min</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-snug">
                    {action.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCtaClick(action.id, action.href)}
                      disabled={isDone}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-bold transition-all',
                        isDone
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 hover:brightness-110'
                      )}
                    >
                      {isDone ? 'Concluído' : 'Começar'}
                      {!isDone && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                    </button>
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(action.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-700"
                      >
                        Já fiz isso
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="text-center pt-4 pb-8 space-y-3">
        <button
          type="button"
          onClick={handleFinishLater}
          className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-2 px-4 py-2 min-h-[44px]"
        >
          Vou explorar sozinho(a)
        </button>
        <p className="text-tiny text-slate-500">
          Pode voltar a essa lista pelo menu <span className="text-slate-300">Configurações &rarr; Onboarding</span>.
        </p>
      </div>
    </div>
  );
}