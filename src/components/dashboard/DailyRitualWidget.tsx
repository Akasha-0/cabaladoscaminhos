'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Flame, Droplets, Wind, Moon, Star, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DailyRitualWidgetProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const RITUALS = [
  {
    id: 1,
    title: 'Gratidão Matinal',
    description: 'Agradeça 3 coisas antes de sunrise',
    duration: '5 min',
    icon: Sun,
    color: 'amber',
    completed: false,
  },
  {
    id: 2,
    title: 'Meditação Lunar',
    description: 'Conexão com a energia da lua',
    duration: '15 min',
    icon: Moon,
    color: 'violet',
    completed: false,
  },
  {
    id: 3,
    title: 'Ofxenda de Oxum',
    description: 'Água doce e flores para Oxum',
    duration: '10 min',
    icon: Droplets,
    color: 'cyan',
    completed: true,
  },
];

const TIME_BASED_SUGGESTIONS: Record<number, string> = {
  0: 'Descanso espiritual - evite rituais intensos',
  1: 'Rituais de cura e purificação',
  2: 'Proteção espiritual - Guerra de Igbã',
  3: 'Rituais de amor e relacionamentos',
  4: 'Rituais de prosperidade e abundância',
  5: 'Rituais de beleza e auto-cuidado',
  6: 'Ancestralidade e conexão com Omolu',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDaySuggestion(): string {
  const dayOfWeek = new Date().getDay();
  return TIME_BASED_SUGGESTIONS[dayOfWeek] || 'Dia neutro para rituais';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DailyRitualWidget({ className }: DailyRitualWidgetProps) {
  const suggestion = getDaySuggestion();
  const completedCount = RITUALS.filter(r => r.completed).length;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Rituals do Dia
            </span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {completedCount}/{RITUALS.length} completos
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* Day suggestion */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Recomendação</span>
          </div>
          <p className="text-sm text-slate-300">{suggestion}</p>
        </div>

        {/* Ritual list */}
        <div className="space-y-2">
          {RITUALS.map((ritual) => {
            const Icon = ritual.icon;
            const colors: Record<string, { bg: string; border: string; text: string }> = {
              amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
              violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
              cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
            };
            const c = colors[ritual.color];

            return (
              <div
                key={ritual.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                  ritual.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                    : `${c.bg} ${c.border} hover:border-slate-500/30`
                )}
              >
                {/* Checkbox */}
                <button className={cn(
                  'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                  ritual.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-600 hover:border-slate-500'
                )}>
                  {ritual.completed && <span>✓</span>}
                </button>

                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  ritual.completed ? 'bg-emerald-500/20' : c.bg
                )}>
                  <Icon className={cn('w-5 h-5', ritual.completed ? 'text-emerald-400' : c.text)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    ritual.completed ? 'text-slate-400 line-through' : 'text-white'
                  )}>
                    {ritual.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{ritual.description}</p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {ritual.duration}
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 text-sm font-medium border border-amber-500/20 hover:bg-amber-500/20 transition-all">
          Ver todos os rituais →
        </button>
      </CardContent>
    </Card>
  );
}

import { Sun } from 'lucide-react';

export default DailyRitualWidget;