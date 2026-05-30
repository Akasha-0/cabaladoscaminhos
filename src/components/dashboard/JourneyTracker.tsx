'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Award, ChevronRight, ChevronUp, Flame, Star, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface JourneyTrackerProps {
  className?: string;
  userData?: {
    nome?: string;
    nivel?: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const STAGES = [
  { id: 1, name: 'Despertar', icon: Sparkles, progress: 100, color: 'text-amber-400', bg: 'bg-amber-500' },
  { id: 2, name: 'Purificação', icon: Flame, progress: 100, color: 'text-orange-400', bg: 'bg-orange-500' },
  { id: 3, name: 'Transformação', icon: Zap, progress: 65, color: 'text-violet-400', bg: 'bg-violet-500' },
  { id: 4, name: 'Iluminação', icon: Star, progress: 0, color: 'text-cyan-400', bg: 'bg-cyan-500' },
  { id: 5, name: 'Mestria', icon: Award, progress: 0, color: 'text-emerald-400', bg: 'bg-emerald-500' },
];

const MILESTONES = [
  { id: 1, title: 'Primeiro Mapa', description: 'Criou seu primeiro mapa da alma', completed: true, date: '15/01' },
  { id: 2, title: '7 Dias de Meditação', description: 'Concluiu 7 dias consecutivos', completed: true, date: '22/01' },
  { id: 3, title: 'Ritual de Oxum', description: 'Realizou oferenda para Oxum', completed: true, date: '05/02' },
  { id: 4, title: 'Conexão Ancestral', description: 'Completou prática ancestral', completed: false, date: '—' },
  { id: 5, title: '10 Mil Pontos', description: 'Acumulou 10.000 pontos XP', completed: false, date: '—' },
];

const CURRENT_USER = {
  level: 3,
  title: 'Caminhante do Fogo',
  totalPoints: 8740,
  pointsToNext: 10000,
  streak: 12,
  achievements: 8,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function JourneyTracker({ className, userData }: JourneyTrackerProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(3);
  const [showMilestones, setShowMilestones] = useState(true);

  const completedStages = STAGES.filter(s => s.progress === 100).length;
  const completedMilestones = MILESTONES.filter(m => m.completed).length;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Jornada Espiritual
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
              {completedStages}/{STAGES.length} estágios
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* User Level Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-xl font-bold text-white">{CURRENT_USER.level}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{CURRENT_USER.title}</p>
                <p className="text-xs text-amber-400">Nível {CURRENT_USER.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{CURRENT_USER.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-slate-400">/ {CURRENT_USER.pointsToNext.toLocaleString()} XP</p>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
              style={{ width: `${(CURRENT_USER.totalPoints / CURRENT_USER.pointsToNext) * 100}%` }}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="p-2 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-bold text-orange-400">{CURRENT_USER.streak}🔥</p>
              <p className="text-[10px] text-slate-400">Sequência</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-bold text-violet-400">{CURRENT_USER.achievements}</p>
              <p className="text-[10px] text-slate-400">Conquistas</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/50 text-center">
              <p className="text-lg font-bold text-emerald-400">{completedMilestones}</p>
              <p className="text-[10px] text-slate-400">Marcos</p>
            </div>
          </div>
        </div>

        {/* Stages Timeline */}
        <div>
          <p className="text-xs text-slate-400 mb-3">Estágios da Jornada</p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-slate-700/50" />
            
            <div className="space-y-2">
              {STAGES.map((stage) => {
                const isActive = expandedStage === stage.id;
                const isComplete = stage.progress === 100;
                const Icon = stage.icon;
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => setExpandedStage(isActive ? null : stage.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                      isActive
                        ? `${stage.bg}/10 border-${stage.color.replace('text-', '')}/30`
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50',
                      isComplete && 'opacity-70'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'relative z-10 w-11 h-11 rounded-xl flex items-center justify-center border-2',
                      isComplete 
                        ? `${stage.bg} border-transparent` 
                        : isActive
                          ? `${stage.bg}/20 ${stage.color} border-current`
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                    )}>
                      <Icon className={cn('w-5 h-5', isComplete || isActive ? 'text-white' : '')} />
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-current" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={cn('text-sm font-medium', isComplete ? 'text-slate-400' : isActive ? stage.color : 'text-slate-300')}>
                          {stage.name}
                        </p>
                        {isActive ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full transition-all', stage.bg)}
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">Marcos da Jornada</span>
            </div>
            <span className="text-xs text-slate-400">
              {completedMilestones}/{MILESTONES.length}
            </span>
          </button>
          
          {showMilestones && (
            <div className="mt-2 space-y-2 animate-fade-in">
              {MILESTONES.map((milestone) => (
                <div
                  key={milestone.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    milestone.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-800/30 border-slate-700/30 opacity-60'
                  )}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center',
                    milestone.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600'
                  )}>
                    {milestone.completed && <span className="text-xs">✓</span>}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      milestone.completed ? 'text-slate-300' : 'text-slate-400'
                    )}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-slate-500">{milestone.description}</p>
                  </div>
                  
                  {/* Date */}
                  <span className="text-xs text-slate-500">{milestone.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </Card>
  );
}

export default JourneyTracker;