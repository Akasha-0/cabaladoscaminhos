'use client';

// ============================================================================
// TourOverlay — Wave 35 Beta Onboarding
// ============================================================================
// Spotlight tour de 7 passos sobre os elementos-chave da interface.
// Diferente do WelcomeCarousel (que é página cheia), este é overlay
// transparente que destaca elementos reais da UI via `data-tour`.
//
// 7 steps:
//   1. CommunityNav (header)
//   2. Feed principal
//   3. Compose post (criar)
//   4. Akasha IA (chat)
//   5. Oráculo
//   6. Marketplace
//   7. Biblioteca + Comunidade
//
// Cada step:
//   - Calcula bounding rect do `[data-tour="ID"]` element no DOM
//   - Renderiza backdrop semi-transparente com "cutout" via box-shadow
//   - Tooltip posiciona abaixo (mobile-first) ou ao lado (desktop)
//   - Botão "Próximo" / "Pular" / "Voltar"
//
// Auto-mount via query param `?tour=1` OU prop `autoStart`.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Tipos
// ============================================================================

export interface TourStep {
  /** ID do elemento no DOM (atributo `data-tour="ID"`). */
  targetId: string;
  /** Título exibido no tooltip. */
  title: string;
  /** Descrição curta. */
  description: string;
  /** Posição preferencial: 'top' | 'bottom' | 'auto'. */
  position?: 'top' | 'bottom' | 'auto';
}

export interface TourOverlayProps {
  steps?: TourStep[];
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  /** Nome da query string que triggera auto-start. Default: 'tour'. */
  triggerParam?: string;
}

const DEFAULT_STEPS: TourStep[] = [
  {
    targetId: 'primary-nav',
    title: 'Sua navegação principal',
    description:
      'Aqui você acessa feed, grupos, marketplace, biblioteca e seu perfil. Tudo organizado por afinidade.',
    position: 'bottom',
  },
  {
    targetId: 'tour-feed',
    title: 'Feed da comunidade',
    description:
      'Posts, rituais, partilhas e reflexões dos praticantes que você segue ou da sua tradição.',
    position: 'auto',
  },
  {
    targetId: 'tour-compose',
    title: 'Compartilhe sua primeira reflexão',
    description:
      'O botão de criar posta abre o editor. Você pode escrever, anexar imagens e marcar tradições.',
    position: 'auto',
  },
  {
    targetId: 'tour-akasha',
    title: 'Converse com Akasha',
    description:
      'Nossa IA curadora responde perguntas sobre símbolos, tradições e sua jornada com base na nossa biblioteca curada.',
    position: 'auto',
  },
  {
    targetId: 'tour-oraculo',
    title: 'Consulte o Oráculo',
    description:
      'Tiragens de Runas, I Ching, Tarô e Odú — com interpretações geradas pela Akasha e revisadas por praticantes.',
    position: 'auto',
  },
  {
    targetId: 'tour-marketplace',
    title: 'Marketplace ético',
    description:
      'Cursos, mentorias e rituais de praticantes verificados. Repasse justo e curadoria humana.',
    position: 'auto',
  },
  {
    targetId: 'tour-library',
    title: 'Biblioteca curada',
    description:
      'Artigos, podcasts e grimórios organizados por tradição e nível. Tudo começa com fontes confiáveis.',
    position: 'auto',
  },
];

// ============================================================================
// Helpers
// ============================================================================

function getRect(el: HTMLElement | null): DOMRect | null {
  if (!el) return null;
  return el.getBoundingClientRect();
}

function calcTooltipPosition(
  rect: DOMRect,
  tooltipW: number,
  tooltipH: number,
  prefer: 'top' | 'bottom' | 'auto',
  padding = 12
): { top: number; left: number; actualPos: 'top' | 'bottom' } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Decide top/bottom: se rect está no terço superior, prefere bottom.
  const preferBottom = prefer === 'bottom' || (prefer === 'auto' && rect.top < vh / 3);
  let top = preferBottom ? rect.bottom + padding : rect.top - tooltipH - padding;
  let actualPos: 'top' | 'bottom' = preferBottom ? 'bottom' : 'top';

  // Clamp top dentro do viewport.
  if (top < 8) top = 8;
  if (top + tooltipH > vh - 8) top = Math.max(8, vh - tooltipH - 8);

  // Centraliza horizontalmente sobre o target.
  let left = rect.left + rect.width / 2 - tooltipW / 2;
  if (left < 8) left = 8;
  if (left + tooltipW > vw - 8) left = Math.max(8, vw - tooltipW - 8);

  return { top, left, actualPos };
}

// ============================================================================
// Component
// ============================================================================

export function TourOverlay({
  steps = DEFAULT_STEPS,
  autoStart = false,
  onComplete,
  onSkip,
  triggerParam = 'tour',
}: TourOverlayProps) {
  const [active, setActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // --- Auto-start via query param -----------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(triggerParam) === '1') {
      setActive(true);
    } else if (autoStart) {
      setActive(true);
    }
  }, [autoStart, triggerParam]);

  // --- Recalcula rect ao mudar step + resize ------------------------
  const recompute = useCallback(() => {
    if (!active) return;
    const step = steps[currentIdx];
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.targetId}"]`);
    const rect = getRect(el);
    if (!rect) {
      // Target ausente — pula para o próximo (defesa contra mudança de DOM).
      if (currentIdx < steps.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        handleComplete();
      }
      return;
    }
    setTargetRect(rect);

    // Tooltip position
    requestAnimationFrame(() => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const ttRect = tooltip.getBoundingClientRect();
      const pos = calcTooltipPosition(
        rect,
        ttRect.width || 320,
        ttRect.height || 140,
        step.position ?? 'auto'
      );
      setTooltipPos({ top: pos.top, left: pos.left });
    });
  }, [active, currentIdx, steps]);

  useEffect(() => {
    recompute();
    const onResize = () => recompute();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [recompute]);

  // --- Ações --------------------------------------------------------
  const logEvent = useCallback(
    async (kind: string, metadata?: Record<string, unknown>) => {
      try {
        await fetch('/api/onboarding/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, metadata: metadata ?? {} }),
        });
      } catch {
        // best-effort
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    void logEvent('TOUR_STEP_VIEWED', { step: currentIdx, action: 'next' });
    if (currentIdx < steps.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, steps.length, logEvent]);

  const handlePrev = useCallback(() => {
    void logEvent('TOUR_STEP_VIEWED', { step: currentIdx, action: 'prev' });
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }, [currentIdx, logEvent]);

  const handleSkip = useCallback(async () => {
    await logEvent('TOUR_SKIPPED', { atStep: currentIdx });
    try {
      await fetch('/api/onboarding/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitionEvent: 'tour_skipped' }),
      });
    } catch {
      // best-effort
    }
    setActive(false);
    onSkip?.();
  }, [currentIdx, logEvent, onSkip]);

  const handleComplete = useCallback(async () => {
    await logEvent('TOUR_COMPLETED');
    try {
      await fetch('/api/onboarding/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitionEvent: 'tour_completed' }),
      });
    } catch {
      // best-effort
    }
    setActive(false);
    onComplete?.();
  }, [logEvent, onComplete]);

  // --- Render --------------------------------------------------------
  if (!active || !targetRect) return null;

  const step = steps[currentIdx];
  if (!step) return null;

  const padding = 8;
  const highlightStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    borderRadius: 12,
    boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.75), 0 0 0 2px rgba(251, 191, 36, 0.8)',
    pointerEvents: 'none',
    zIndex: 100,
    transition: 'all 200ms ease-out',
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="fixed inset-0 z-[100]">
      {/* Backdrop com cutout via box-shadow */}
      <div style={highlightStyle} aria-hidden="true" />

      {/* Click-through para elemento destacado (não capturar clicks). */}
      <button
        type="button"
        onClick={handleNext}
        aria-label={`Destacado: ${step.title}. Clique para continuar.`}
        style={{
          position: 'fixed',
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          zIndex: 101,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          'fixed z-[102] bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl',
          'p-4 sm:p-5 max-w-sm w-[calc(100vw-2rem)] sm:w-96'
        )}
        style={{
          top: tooltipPos?.top ?? targetRect.bottom + 12,
          left: tooltipPos?.left ?? 16,
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <h2 id="tour-title" className="font-cinzel text-base sm:text-lg font-bold text-amber-200">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Fechar tour"
            className="text-slate-400 hover:text-slate-200 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-4">{step.description}</p>

        {/* Step indicator */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-tiny text-slate-400 font-cinzel tracking-wider">
            {currentIdx + 1} / {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={cn(
                'inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-lg text-sm',
                currentIdx === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-200 hover:bg-slate-800/60'
              )}
              aria-label="Passo anterior"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={currentIdx === steps.length - 1 ? handleComplete : handleNext}
              className="inline-flex items-center gap-1 px-4 py-2.5 min-h-[44px] rounded-lg bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110"
            >
              {currentIdx === steps.length - 1 ? 'Concluir' : 'Próximo'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Live region para screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Passo {currentIdx + 1} de {steps.length}: {step.title}
      </div>
    </div>
  );
}