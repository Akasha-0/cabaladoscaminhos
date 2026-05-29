'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Map,
  Compass,
  Mountain,
  Flag,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  Award,
  Zap,
  Calendar,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface JourneyTrackerProps {
  userData?: {
    id?: string;
    odu?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
    arcoPessoal?: number;
  };
  milestones?: JourneyMilestone[];
  className?: string;
  currentProgress?: number;
  onMilestoneClick?: (milestone: JourneyMilestone) => void;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: Date;
  icon?: string;
  category?: 'initiation' | 'learning' | 'mastery' | 'transcendence';
  spiritualSystems?: string[];
}

interface JourneyStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  milestones: JourneyMilestone[];
  requiredProgress: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_MILESTONES: JourneyMilestone[] = [
  {
    id: 'awakening',
    title: 'Despertar Espiritual',
    description: 'Primeiro contato consciente com práticas espirituais',
    achieved: true,
    achievedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    category: 'initiation',
    spiritualSystems: ['Numerologia'],
  },
  {
    id: 'first-orixa',
    title: 'Conexão com Orixá',
    description: 'Estabelecimento de vínculo com energia oracular',
    achieved: true,
    achievedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    category: 'initiation',
    spiritualSystems: ['Ifá/Odu', 'Candomblé'],
  },
  {
    id: 'numerology-basics',
    title: 'Fundamentos Numerológicos',
    description: 'Compreensão básica do número pessoal e arcos',
    achieved: true,
    achievedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: 'learning',
    spiritualSystems: ['Numerologia'],
  },
  {
    id: 'first-meditation',
    title: 'Primeira Meditação Guiada',
    description: 'Experiência inicial de prática contemplativa',
    achieved: true,
    achievedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    category: 'learning',
    spiritualSystems: ['Cabala'],
  },
  {
    id: 'tarot-intro',
    title: 'Introdução ao Tarot',
    description: 'Estudo das cartas e seus significados archetypais',
    achieved: false,
    category: 'learning',
    spiritualSystems: ['Tarot'],
  },
  {
    id: 'astrology-basics',
    title: 'Astrologia Fundamental',
    description: 'Compreensão de signos, casas e aspectos',
    achieved: false,
    category: 'learning',
    spiritualSystems: ['Astrologia'],
  },
  {
    id: 'element-mastery',
    title: 'Domínio Elemental',
    description: 'Equilíbrio dos cinco elementos no ser',
    achieved: false,
    category: 'mastery',
    spiritualSystems: ['Elementos'],
  },
  {
    id: 'orixa-integration',
    title: 'Integração Oracular',
    description: 'Sincronização completa com orixá regente',
    achieved: false,
    category: 'mastery',
    spiritualSystems: ['Ifá/Odu', 'Candomblé'],
  },
  {
    id: 'sefirot-connection',
    title: 'Conexão Cabalística',
    description: 'Acesso aos 10 níveis de consciência divina',
    achieved: false,
    category: 'mastery',
    spiritualSystems: ['Cabala'],
  },
  {
    id: 'transcendence',
    title: 'Transcendência Final',
    description: 'União com a consciência universal',
    achieved: false,
    category: 'transcendence',
    spiritualSystems: ['Numerologia', 'Astrologia', 'Ifá/Odu', 'Cabala'],
  },
];

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'awakening',
    name: 'Despertar',
    icon: <Sparkles className="w-4 h-4" />,
    requiredProgress: 0,
    milestones: DEFAULT_MILESTONES.filter(m => ['awakening', 'first-orixa'].includes(m.id)),
  },
  {
    id: 'learning',
    name: 'Aprendizado',
    icon: <BookOpen className="w-4 h-4" />,
    requiredProgress: 25,
    milestones: DEFAULT_MILESTONES.filter(m => ['numerology-basics', 'first-meditation', 'tarot-intro', 'astrology-basics'].includes(m.id)),
  },
  {
    id: 'mastery',
    name: 'Mestria',
    icon: <Award className="w-4 h-4" />,
    requiredProgress: 60,
    milestones: DEFAULT_MILESTONES.filter(m => ['element-mastery', 'orixa-integration', 'sefirot-connection'].includes(m.id)),
  },
  {
    id: 'transcendence',
    name: 'Transcendência',
    icon: <Zap className="w-4 h-4" />,
    requiredProgress: 90,
    milestones: DEFAULT_MILESTONES.filter(m => m.id === 'transcendence'),
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function calculateProgress(milestones: JourneyMilestone[]): number {
  if (milestones.length === 0) return 0;
  const achieved = milestones.filter(m => m.achieved).length;
  return (achieved / milestones.length) * 100;
}

function getStageIcon(category?: string): React.ReactNode {
  switch (category) {
    case 'initiation':
      return <Star className="w-4 h-4 text-blue-400" />;
    case 'learning':
      return <Compass className="w-4 h-4 text-green-400" />;
    case 'mastery':
      return <Award className="w-4 h-4 text-amber-400" />;
    case 'transcendence':
      return <Zap className="w-4 h-4 text-purple-400" />;
    default:
      return <Flag className="w-4 h-4 text-slate-400" />;
  }
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface MilestoneCardProps {
  milestone: JourneyMilestone;
  onClick?: () => void;
  isActive?: boolean;
}

function MilestoneCard({ milestone, onClick, isActive }: MilestoneCardProps) {
  const categoryColors = {
    initiation: 'border-l-blue-500',
    learning: 'border-l-green-500',
    mastery: 'border-l-amber-500',
    transcendence: 'border-l-purple-500',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 border-l-4 transition-all duration-300',
        categoryColors[milestone.category || 'initiation'],
        milestone.achieved && 'bg-emerald-500/10 border-emerald-500/30',
        isActive && 'ring-2 ring-purple-500/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          milestone.achieved ? 'bg-emerald-500/20' : 'bg-slate-600/50'
        )}>
          {milestone.achieved ? (
            <Star className="w-5 h-5 text-emerald-400" />
          ) : (
            <Flag className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn(
            'font-semibold',
            milestone.achieved ? 'text-emerald-400' : 'text-white'
          )}>
            {milestone.title}
          </h4>
          <p className="text-slate-400 text-sm mt-1">{milestone.description}</p>
          {milestone.achieved && milestone.achievedDate && (
            <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {milestone.achievedDate.toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        {milestone.achieved && (
          <div className="p-1 bg-emerald-500/20 rounded-full">
            <Star className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
    </button>
  );
}

interface StageProgressProps {
  stage: JourneyStage;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function StageProgress({ stage, isActive, isCompleted, onClick }: StageProgressProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
        isActive && 'bg-purple-500/20 text-purple-400',
        isCompleted && 'bg-emerald-500/20 text-emerald-400',
        !isActive && !isCompleted && 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30'
      )}
    >
      {stage.icon}
      <span className="text-sm font-medium">{stage.name}</span>
      {isCompleted && <Star className="w-3 h-3" />}
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function JourneyTracker({
  userData,
  milestones = DEFAULT_MILESTONES,
  className = '',
  currentProgress,
  onMilestoneClick,
}: JourneyTrackerProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>('learning');

  const progress = useMemo(() => {
    return currentProgress ?? calculateProgress(milestones);
  }, [milestones, currentProgress]);

  const activeStage = useMemo(() => {
    const current = JOURNEY_STAGES.find((stage, index) => {
      const nextStage = JOURNEY_STAGES[index + 1];
      return progress >= stage.requiredProgress && 
        (nextStage ? progress < nextStage.requiredProgress : true);
    });
    return current?.id || 'awakening';
  }, [progress]);

  const stageMilestones = useMemo(() => {
    if (selectedStage) {
      return milestones.filter(m => m.category === selectedStage);
    }
    return milestones;
  }, [milestones, selectedStage]);

  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
              <Map className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Jornada Espiritual</h3>
              <p className="text-slate-400 text-sm">
                {userData?.orixaRegente ? `${userData.orixaRegente} • ` : ''}Odu {userData?.odu || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">{achievedCount}/{milestones.length}</p>
            <p className="text-slate-500 text-xs">Conquistas</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white bg-slate-800/80 px-2 py-0.5 rounded-full">
              {Math.round(progress)}% Completo
            </span>
          </div>
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex flex-wrap gap-2">
          {JOURNEY_STAGES.map((stage, index) => {
            const isCompleted = progress >= stage.requiredProgress;
            const isActive = activeStage === stage.id;
            
            return (
              <div key={stage.id} className="flex items-center">
                <StageProgress
                  stage={stage}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                />
                {index < JOURNEY_STAGES.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-500 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {stageMilestones.map(milestone => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            onClick={() => onMilestoneClick?.(milestone)}
            isActive={selectedStage === milestone.id}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-blue-400">{milestones.filter(m => m.category === 'learning').length}</p>
            <p className="text-slate-500 text-xs">Aprendizados</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-400">{milestones.filter(m => m.category === 'mastery').length}</p>
            <p className="text-slate-500 text-xs">Mestrias</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-400">{milestones.filter(m => m.category === 'transcendence').length}</p>
            <p className="text-slate-500 text-xs">Transcendências</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JourneyTracker;