'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, MousePointer2, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
}

export interface TutorialOverlayProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
  autoProgress?: boolean;
  progressDelay?: number;
}

export function TutorialOverlay({
  steps,
  isOpen,
  onComplete,
  onSkip,
  storageKey = 'tutorial-completed',
  autoProgress = true,
  progressDelay = 3000,
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateTargetRect = useCallback(() => {
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step?.targetSelector]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      updateTargetRect();
    }
  }, [isOpen, updateTargetRect]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  useEffect(() => {
    if (autoProgress && isOpen && step && !step.targetSelector) {
      const timer = setTimeout(() => {
        handleNext();
      }, progressDelay);
      return () => clearTimeout(timer);
    }
  }, [autoProgress, isOpen, step, progressDelay]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'skipped');
    }
    onSkip();
  };

  const getPositionStyles = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 12;
    const position = step?.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: targetRect.top - 10,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - 10,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const getArrowPosition = () => {
    if (!targetRect) return null;
    const position = step?.position || 'bottom';

    const arrowMap: Record<string, string> = {
      top: 'border-t-transparent border-x-transparent border-b-primary',
      bottom: 'border-b-transparent border-x-transparent border-t-primary',
      left: 'border-l-transparent border-y-transparent border-r-primary',
      right: 'border-r-transparent border-y-transparent border-l-primary',
    };

    return arrowMap[position];
  };

  const getDefaultIcon = () => {
    const iconMap: Record<number, React.ReactNode> = {
      0: <MousePointer2 className="w-5 h-5" />,
      1: <Eye className="w-5 h-5" />,
      2: <Check className="w-5 h-5" />,
    };
    return iconMap[currentStep] || <HelpCircle className="w-5 h-5" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay with cutout for target */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-violet-400 rounded-lg shadow-lg shadow-violet-500/50 animate-pulse pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute pointer-events-auto max-w-sm"
        style={getPositionStyles()}
      >
        {/* Arrow */}
        {targetRect && (
          <div
            className={`absolute w-0 h-0 border-8 ${getArrowPosition()}`}
            style={{
              [step?.position === 'top' ? 'bottom' : 'top']: '-16px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}

        <div
          className={`
            bg-gradient-to-br from-slate-900/95 to-slate-950/95 
            border border-violet-500/50 rounded-xl shadow-2xl 
            backdrop-blur-sm overflow-hidden
            transition-all duration-200
            ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-violet-900/30 to-indigo-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/50 flex items-center justify-center text-violet-400">
                {step?.icon || getDefaultIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  {step?.title || 'Tutorial'}
                </h3>
                <p className="text-xs text-slate-400">
                  Passo {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              {step?.description}
            </p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-violet-500'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  Pular
                </Button>

                {isLastStep ? (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Concluir
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Skip hint */}
          <div className="px-4 pb-3 text-center">
            <p className="text-xs text-slate-500">
              Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Esc</kbd> para pular
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut handler */}
      <KeyboardShortcutHandler onSkip={handleSkip} onNext={handleNext} onPrevious={handlePrevious} />
    </div>
  );
}

function KeyboardShortcutHandler({
  onSkip,
  onNext,
  onPrevious,
}: {
  onSkip: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onSkip();
          break;
        case 'Enter':
        case ' ':
          onNext();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip, onNext, onPrevious]);

  return null;
}

// Hook for managing tutorial state
export function useTutorial(steps: TutorialStep[], storageKey?: string) {
  const [isComplete, setIsComplete] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'true' || stored === 'skipped') {
        setIsComplete(true);
      }
    }
  }, [storageKey]);

  const start = useCallback(() => {
    if (!isComplete) {
      setIsOpen(true);
    }
  }, [isComplete]);

  const stop = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    isComplete,
    start,
    stop,
    setIsComplete,
  };
}

// Default tutorial steps for dashboard
export const DEFAULT_DASHBOARD_TUTORIAL: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao seu Dashboard',
    description: 'Este é o seu centro de controle espiritual pessoal. Aqui você encontrará todas as ferramentas para sua jornada de autoconhecimento.',
    position: 'center',
  },
  {
    id: 'navigation',
    title: 'Navegação do Menu',
    description: 'Use o menu lateral para acessar diferentes seções: Mapas, Rituais, Meditações e muito mais. Cada área é dedicada a um aspecto do seu desenvolvimento.',
    targetSelector: '[data-tutorial="nav"]',
    position: 'right',
  },
  {
    id: 'cosmic-calendar',
    title: 'Calendário Cósmico',
    description: 'Acompanhe as fases lunares, eclipses e eventos astrológicos importantes. O momento certo pode potencializar seus rituais.',
    targetSelector: '[data-tutorial="cosmic-calendar"]',
    position: 'top',
  },
  {
    id: 'daily-reading',
    title: 'Leitura Diária',
    description: 'Receba orientações personalizadas baseadas na posição dos astros hoje. Um novo insight esperando por você a cada amanhecer.',
    targetSelector: '[data-tutorial="daily-reading"]',
    position: 'top',
  },
  {
    id: 'quick-actions',
    title: 'Ações Rápidas',
    description: 'Acesse rapidamente suas ferramentas mais usadas. Personalize para ter sempre à mão o que precisa.',
    targetSelector: '[data-tutorial="quick-actions"]',
    position: 'top',
  },
  {
    id: 'complete',
    title: 'Pronto para começar!',
    description: 'Você está preparado para explorar todas as funcionalidades. Seu caminho espiritual está à sua frente.',
    position: 'center',
  },
];