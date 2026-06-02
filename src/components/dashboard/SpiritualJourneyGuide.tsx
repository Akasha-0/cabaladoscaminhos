// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Flame,
  Cpu,
  Link2,
  Heart,
  Infinity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserSpiritualData } from '@/lib/ai/types';

// ============================================================
// TYPES
// ============================================================

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  duration: string;
  practices: string[];
}

export interface SpiritualJourneyGuideProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  onMilestone?: (milestone: string) => void;
}

type JourneyPhase = 'despertar' | 'exploracao' | 'integracao' | 'aplicacao' | 'evolucao';

interface PhaseConfig {
  id: JourneyPhase;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const PHASES: PhaseConfig[] = [
  {
    id: 'despertar',
    title: 'Despertar',
    subtitle: 'Consciência Espiritual',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'exploracao',
    title: 'Exploração',
    subtitle: 'Sistemas Espirituais',
    icon: <Target className="w-4 h-4" />,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'integracao',
    title: 'Integração',
    subtitle: 'Conexões Profundas',
    icon: <Link2 className="w-4 h-4" />,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'aplicacao',
    title: 'Aplicação',
    subtitle: 'Prática Diária',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-red-500/20',
  },
  {
    id: 'evolucao',
    title: 'Evolução',
    subtitle: 'Crescimento Contínuo',
    icon: <Infinity className="w-4 h-4" />,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
];

const PHASE_PRACTICES: Record<JourneyPhase, string[]> = {
  despertar: [
    'Meditação matinal de 10 minutos',
    'Journaling espiritual',
    'Respiração consciente',
    'Conexão com a natureza',
    'Reflexão sobre sonhos',
  ],
  exploracao: [
    'Estudo de Kabbalah',
    'Prática de Tarot',
    'Numerologia pessoal',
    'Astromologia básica',
    'Meditações orientadas',
  ],
  integracao: [
    'Análise de correlações',
    'Mapeamento de arquétipos',
    'Práticas interdisciplinares',
    'Rituais sincréticos',
    'Diário de insights',
  ],
  aplicacao: [
    'Yoga espiritual',
    'Rituais diários',
    'Afirmações personalizadas',
    'Visualização criativa',
    'Aplicação nos negócios',
  ],
  evolucao: [
    'Mentoria e ensino',
    'Práticas avançadas',
    'Expansão consciente',
    'Criação de rituais',
    'Transcendência pessoal',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPhaseFromStep(stepId: string): JourneyPhase {
  if (stepId.startsWith('1')) return 'despertar';
  if (stepId.startsWith('2')) return 'exploracao';
  if (stepId.startsWith('3')) return 'integracao';
  if (stepId.startsWith('4')) return 'aplicacao';
  return 'evolucao';
}

function generateDefaultSteps(): JourneyStep[] {
  const steps: JourneyStep[] = [];
  
// fallow-ignore-next-line complexity
  PHASES.forEach((phase, phaseIndex) => {
    const baseStepNum = phaseIndex * 3 + 1;
    
    for (let i = 0; i < 3; i++) {
      const stepNum = baseStepNum + i;
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      
      if (phaseIndex < 2) status = 'completed';
      else if (phaseIndex === 2 && i < 2) status = 'completed';
      else if (phaseIndex === 2 && i === 2) status = 'current';
      
      const descriptions: Record<JourneyPhase, string[]> = {
        despertar: [
          'Reconhecendo padrões espirituais em sua vida',
          'Despertando para a conexão entre sistemas',
          'Iniciando práticas de autoconhecimento',
        ],
        exploracao: [
          'Estudando os fundamentos de cada tradição',
          'Identificando suas affinity naturais',
          'Mapeando seu perfil espiritual completo',
        ],
        integracao: [
          'Conectando insights de múltiplos sistemas',
          'Descobrindo correlações profundas',
          'Sintetizando sua wisdom única',
        ],
        aplicacao: [
          'Implementando práticas no dia a dia',
          'Adaptando ensinamentos ao seu contexto',
          'Criando rituais personalizados',
        ],
        evolucao: [
          'Aprofundando sua prática existente',
          'Expandindo para novas dimensões',
          'Preparando-se para ensinar outros',
        ],
      };
      
      steps.push({
        id: `${stepNum}`,
        title: `${phase.title} - ${i + 1}`,
        description: descriptions[phase.id][i],
        status,
        duration: `${15 + (i * 10)} dias`,
        practices: PHASE_PRACTICES[phase.id].slice(0, 3 - i),
      });
    }
  });
  
  return steps;
}

function calculateProgress(steps: JourneyStep[]): number {
  const total = steps.length;
  const completed = steps.filter((s) => s.status === 'completed').length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface TimelineStepProps {
  step: JourneyStep;
  isLast: boolean;
  onComplete: (stepId: string) => void;
}

// fallow-ignore-next-line complexity
function TimelineStep({ step, isLast, onComplete }: TimelineStepProps) {
  const phase = getPhaseFromStep(step.id);
  const phaseConfig = PHASES.find((p) => p.id === phase)!;
  const isCompleted = step.status === 'completed';
  const isCurrent = step.status === 'current';

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => !isCompleted && onComplete(step.id)}
          disabled={isCompleted}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
            isCompleted && 'bg-emerald-500/20 border-emerald-500',
            isCurrent && `bg-gradient-to-br ${phaseConfig.gradient} border-${phaseConfig.color.split('-')[1]}-500`,
            !isCompleted && !isCurrent && 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
          )}
          aria-label={isCompleted ? 'Concluído' : isCurrent ? 'Em andamento' : 'Pendente'}
        >
          {isCompleted ? (
            <CheckCircle2 className={cn('w-5 h-5 text-emerald-400')} />
          ) : isCurrent ? (
            <div className={cn('w-3 h-3 rounded-full bg-current', phaseConfig.color)} />
          ) : (
            <Circle className="w-5 h-5 text-slate-500" />
          )}
        </button>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 my-2',
              isCompleted ? 'bg-emerald-500/50' : 'bg-slate-700'
            )}
          />
        )}
      </div>

      {/* Step content */}
      <div
        className={cn(
          'flex-1 pb-8',
          isCurrent && 'animate-pulse-slow'
        )}
      >
        <div
          className={cn(
            'p-4 rounded-lg border transition-all duration-300',
            isCompleted && 'bg-slate-800/30 border-emerald-500/30',
            isCurrent && `bg-gradient-to-br ${phaseConfig.gradient} border-${phaseConfig.color.split('-')[1]}-500/50`,
            !isCompleted && !isCurrent && 'bg-slate-800/20 border-slate-700/50'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4
                className={cn(
                  'font-medium text-sm',
                  isCompleted && 'text-emerald-300',
                  isCurrent && 'text-white',
                  !isCompleted && !isCurrent && 'text-slate-400'
                )}
              >
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{step.description}</p>
            </div>
            {isCurrent && (
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-full bg-current/20',
                  phaseConfig.color
                )}
              >
                Atual
              </span>
            )}
          </div>

          {/* Practices */}
          <div className="mt-3 space-y-2">
            {step.practices.map((practice, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-2 text-xs',
                  isCompleted ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                  )}
                />
                {practice}
              </div>
            ))}
          </div>

          {/* Duration */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{step.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PhaseSummaryProps {
  phase: PhaseConfig;
  steps: JourneyStep[];
  isExpanded: boolean;
  onToggle: () => void;
}

function PhaseSummary({ phase, steps, isExpanded, onToggle }: PhaseSummaryProps) {
  const phaseSteps = steps.filter((s) => getPhaseFromStep(s.id) === phase.id);
  const completed = phaseSteps.filter((s) => s.status === 'completed').length;
  const total = phaseSteps.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          'w-full p-4 flex items-center justify-between transition-all duration-300',
          'bg-slate-800/30 hover:bg-slate-800/50',
          isExpanded && `bg-gradient-to-br ${phase.gradient}`
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg bg-gradient-to-br',
              phase.gradient
            )}
          >
            {phase.icon}
          </div>
          <div className="text-left">
            <h3 className={cn('font-semibold text-white', phase.color)}>
              {phase.title}
            </h3>
            <p className="text-xs text-slate-400">{phase.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-300">
              {completed}/{total}
            </span>
            <span className="text-xs text-slate-500">etapas</span>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700">
        <div
          className={cn(
            'h-full transition-all duration-500',
            progress === 100
              ? 'bg-emerald-500'
              : `bg-gradient-to-r ${phase.gradient.replace('/20', '')}`
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 bg-slate-800/20 space-y-4 animate-fadeIn">
          <h4 className="text-sm font-medium text-slate-300">
            Práticas Recomendadas
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {PHASE_PRACTICES[phase.id].map((practice, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded bg-slate-800/50 border border-slate-700/30"
              >
                <div className={cn('w-2 h-2 rounded-full bg-current', phase.color)} />
                <span className="text-sm text-slate-300">{practice}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MilestoneCelebrationProps {
  phase: PhaseConfig;
  onDismiss: () => void;
}

function MilestoneCelebration({ phase, onDismiss }: MilestoneCelebrationProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div
        className={cn(
          'p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50',
          'max-w-md mx-4 text-center shadow-2xl shadow-black/50'
        )}
      >
        <div
          className={cn(
            'w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center',
            phase.gradient
          )}
        >
          <Award className={cn('w-10 h-10', phase.color)} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Conquistas Desbloqueadas!
        </h3>
        <p className="text-slate-400 mb-6">
          Você completou a fase <span className={phase.color}>{phase.title}</span>.
          Sua jornada espiritual continua!
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['Determinação', 'Sabedoria', 'Crescimento'].map((trait) => (
            <span
              key={trait}
              className={cn(
                'px-3 py-1 rounded-full text-sm bg-slate-800/50 border border-slate-700/30 text-slate-300'
              )}
            >
              {trait}
            </span>
          ))}
        </div>
        <button
          onClick={onDismiss}
          className={cn(
            'px-6 py-2 rounded-lg font-medium transition-all duration-300',
            `bg-gradient-to-r ${phase.gradient.replace('/20', '')} text-white`,
            'hover:opacity-90'
          )}
        >
          Continuar Jornada
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualJourneyGuide({
  userData,
  userId,
  className = '',
  onMilestone,
}: SpiritualJourneyGuideProps) {
  const [expandedPhase, setExpandedPhase] = useState<JourneyPhase>('integracao');
  const [celebratingPhase, setCelebratingPhase] = useState<PhaseConfig | null>(null);
  const [steps, setSteps] = useState<JourneyStep[]>(() => generateDefaultSteps());

  const progress = useMemo(() => calculateProgress(steps), [steps]);

  const currentPhaseIndex = useMemo(() => {
    const currentStep = steps.find((s) => s.status === 'current');
    if (!currentStep) return 0;
    return PHASES.findIndex((p) => p.id === getPhaseFromStep(currentStep.id));
  }, [steps]);

  const totalDuration = useMemo(() => {
    const daysPerPhase = 45;
    return `${PHASES.length * daysPerPhase} dias`;
  }, []);

  const handleCompleteStep = useCallback(
    (stepId: string) => {
      const step = steps.find((s) => s.id === stepId);
      if (!step || step.status !== 'current') return;

      const currentIndex = steps.findIndex((s) => s.id === stepId);
      
      setSteps(prevSteps => {
        const updatedSteps = prevSteps.map((s, idx) => {
          if (idx === currentIndex) return { ...s, status: 'completed' as const };
          return s;
        });

        for (let i = currentIndex + 1; i < updatedSteps.length; i++) {
          if (updatedSteps[i].status === 'upcoming') {
            updatedSteps[i] = { ...updatedSteps[i], status: 'current' as const };
            break;
          }
        }

        const phase = getPhaseFromStep(stepId);
        const phaseConfig = PHASES.find((p) => p.id === phase);
        const phaseSteps = updatedSteps.filter((s) => getPhaseFromStep(s.id) === phase);
        const allPhaseCompleted = phaseSteps.every((s) => s.status === 'completed');

        if (allPhaseCompleted && phaseConfig) {
          setCelebratingPhase(phaseConfig);
          onMilestone?.(phase);
        }

        return updatedSteps;
      });
    },
    [steps, onMilestone]
  );

  const handleDismissCelebration = useCallback(() => {
    setCelebratingPhase(null);
  }, []);

  const togglePhase = useCallback((phase: JourneyPhase) => {
    setExpandedPhase((prev) => (prev === phase ? 'despertar' : phase));
  }, []);

  return (
    <div
      className={cn(
        'bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-3 rounded-xl bg-gradient-to-br',
                PHASES[currentPhaseIndex].gradient
              )}
            >
              <Flame className={cn('w-6 h-6', PHASES[currentPhaseIndex].color)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Guia da Jornada Espiritual</h2>
              <p className="text-slate-400 text-sm">
                {userData?.nome || 'Seekers'} • Caminho de Evolução
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">{progress}%</p>
              <p className="text-slate-500 text-xs">Progresso Total</p>
            </div>
          </div>
        </div>

        {/* Timeline progress */}
        <div className="flex items-center gap-2">
// fallow-ignore-next-line complexity
          {PHASES.map((phase, idx) => {
            const phaseSteps = steps.filter((s) => getPhaseFromStep(s.id) === phase.id);
            const completed = phaseSteps.filter((s) => s.status === 'completed').length;
            const phaseProgress = phaseSteps.length > 0 ? completed / phaseSteps.length : 0;
            const isActive = idx === currentPhaseIndex;
            const isPast = idx < currentPhaseIndex;
            const isFuture = idx > currentPhaseIndex;

            return (
              <React.Fragment key={phase.id}>
                <button
                  onClick={() => togglePhase(phase.id)}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-all duration-500',
                    isPast && 'bg-emerald-500',
                    isActive && `bg-gradient-to-r ${phase.gradient.replace('/20', '')}`,
                    isFuture && 'bg-slate-700'
                  )}
                  style={{ opacity: isFuture ? 0.4 : 1 }}
                  aria-label={phase.title}
                />
                {idx < PHASES.length - 1 && (
                  <div
                    className={cn(
                      'w-1 h-1 rounded-full',
                      isPast ? 'bg-emerald-500' : 'bg-slate-600'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Duration estimate */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Fase Atual: <span className={PHASES[currentPhaseIndex].color}>{PHASES[currentPhaseIndex].title}</span>
          </span>
          <span>Duração Estimada: {totalDuration}</span>
        </div>
      </div>

      {/* Phase Icons */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex justify-around">
          {PHASES.map((phase, idx) => {
            const isActive = idx === currentPhaseIndex;
            const isPast = idx < currentPhaseIndex;

            return (
              <button
                key={phase.id}
                onClick={() => togglePhase(phase.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300',
                  isActive && `bg-gradient-to-br ${phase.gradient} border border-${phase.color.split('-')[1]}-500/30`,
                  isPast && 'text-emerald-400',
                  !isActive && !isPast && 'text-slate-500'
                )}
              >
                {phase.icon}
                <span className="text-xs">{phase.title.charAt(0)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
        {/* Current Phase Steps */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-300">Progresso Atual</h3>
          </div>
          <div className="pl-2">
            {steps
              .filter((s) => s.status === 'completed' || s.status === 'current')
              .slice(-4)
              .map((step, idx, arr) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  isLast={idx === arr.length - 1}
                  onComplete={handleCompleteStep}
                />
              ))}
          </div>
        </div>

        {/* Phase Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-300">Detalhes das Fases</h3>
          </div>
          <div className="space-y-3">
            {PHASES.map((phase) => (
              <PhaseSummary
                key={phase.id}
                phase={phase}
                steps={steps}
                isExpanded={expandedPhase === phase.id}
                onToggle={() => togglePhase(phase.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-400">
              Continue sua jornada de autoconhecimento
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Etapas: {steps.filter((s) => s.status === 'completed').length}/{steps.length}</span>
          </div>
        </div>
      </div>

      {/* Milestone Celebration Modal */}
      {celebratingPhase && (
        <MilestoneCelebration
          phase={celebratingPhase}
          onDismiss={handleDismissCelebration}
        />
      )}
    </div>
  );
}

export default SpiritualJourneyGuide;