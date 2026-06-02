// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Star, Droplets, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface MoonTrackerProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const MOON_PHASES = [
  { id: 'new', name: 'Lua Nova', symbol: '🌑', illumination: 0, description: 'Ideal para novos começos e intenções' },
  { id: 'waxing-crescent', name: 'Lua Crescente', symbol: '🌒', illumination: 25, description: 'Momento de crescimento e ação' },
  { id: 'first-quarter', name: 'Quarto Crescente', symbol: '🌓', illumination: 50, description: 'Hora de tomar decisões' },
  { id: 'waxing-gibbous', name: 'Gibosa Crescente', symbol: '🌔', illumination: 75, description: 'Período de refinamento' },
  { id: 'full', name: 'Lua Cheia', symbol: '🌕', illumination: 100, description: 'Culminação e celebrações' },
  { id: 'waning-gibbous', name: 'Gibosa Minguante', symbol: '🌖', illumination: 75, description: 'Gratidão e compartilhamento' },
  { id: 'last-quarter', name: 'Quarto Minguante', symbol: '🌗', illumination: 50, description: 'Período de perdão' },
  { id: 'waning-crescent', name: ' Balsâmica', symbol: '🌘', illumination: 25, description: 'Descanso e regeneração' },
];

const LUNAR_ACTIVITIES = {
  new: ['Definir intenções', 'Iniciar projetos', 'Rituais de novos começos'],
  'waxing-crescent': ['Trabalhar objetivos', 'Manifestar desejos', 'Construir momentum'],
  'first-quarter': ['Tomar decisões', 'Ação decisiva', 'Superar obstáculos'],
  'waxing-gibbous': ['Refinar planos', 'Ajustar detalhes', 'Persistência'],
  full: ['Celebrações', 'Rituais de luz', 'Manifestação completa'],
  'waning-gibbous': ['Gratidão', 'Compartilhar bênçãos', 'Ensinar outros'],
  'last-quarter': ['Perdão', 'Liberação', 'Limpeza interior'],
  'waning-crescent': ['Descanso', 'Recuperação', 'Planejamento do ciclo'],
};

const RITUALS_BY_MOON = {
  new: { name: 'Ritual de Intenção', icon: '🎯', items: ['Vela branca', 'Papel', 'Caneta'] },
  full: { name: 'Ritual de Luz', icon: '✨', items: ['Vela dourada', 'Cristal', 'Água'] },
  'last-quarter': { name: 'Ritual de Perdão', icon: '🕊️', items: ['Vela azul', 'Sálvia', 'Papel'] },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// fallow-ignore-next-line complexity
function getMoonPhase(daysSinceNewMoon: number): typeof MOON_PHASES[0] {
  const cycle = daysSinceNewMoon % 29.5;
  if (cycle < 3.7) return MOON_PHASES[0];
  if (cycle < 7.4) return MOON_PHASES[1];
  if (cycle < 11.1) return MOON_PHASES[2];
  if (cycle < 14.8) return MOON_PHASES[3];
  if (cycle < 18.5) return MOON_PHASES[4];
  if (cycle < 22.2) return MOON_PHASES[5];
  if (cycle < 25.9) return MOON_PHASES[6];
  return MOON_PHASES[7];
}

function getDaysToNextPhase(currentPhase: string): number {
  const phaseIndex = MOON_PHASES.findIndex(p => p.id === currentPhase);
  const daysInPhase = 29.5 / 8;
  return Math.round((phaseIndex + 1) * daysInPhase);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MoonTracker({ className }: MoonTrackerProps) {
  const [selectedPhase, setSelectedPhase] = useState<typeof MOON_PHASES[0] | null>(null);

  // Calculate current moon phase
  const now = new Date();
  const newMoonDate = new Date(2024, 0, 11); // Known new moon
  const daysSinceNewMoon = Math.floor((now.getTime() - newMoonDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentPhase = getMoonPhase(daysSinceNewMoon);
  const daysToNext = getDaysToNextPhase(currentPhase.id);

  const rituals = LUNAR_ACTIVITIES[currentPhase.id as keyof typeof LUNAR_ACTIVITIES] || [];
  const suggestedRitual = RITUALS_BY_MOON[currentPhase.id as keyof typeof RITUALS_BY_MOON];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Ciclo Lunar
            </span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
            {daysToNext} dias
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Current Moon Display */}
        <div className="text-center py-4">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Moon glow */}
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
            
            {/* Moon */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-inner">
              <span className="text-6xl filter drop-shadow-lg">{currentPhase.symbol}</span>
            </div>

            {/* Illumination indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-xs text-indigo-400">{currentPhase.illumination}%</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{currentPhase.name}</h3>
          <p className="text-sm text-slate-400">{currentPhase.description}</p>
        </div>

        {/* Moon Phase Selector */}
        <div className="relative">
          {/* Phase markers */}
          <div className="flex justify-between items-center mb-3">
            {MOON_PHASES.map((phase, index) => {
              const isActive = phase.id === currentPhase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase)}
                  className={cn(
                    'text-2xl transition-all hover:scale-110',
                    isActive && 'scale-125'
                  )}
                  title={phase.name}
                >
                  <span className={cn(
                    'filter transition-all',
                    isActive ? 'drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'grayscale opacity-50'
                  )}>
                    {phase.symbol}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${currentPhase.illumination}%` }}
            />
          </div>
        </div>

        {/* Activities for Current Phase */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">Atividades Recomendadas</span>
          </div>
          <div className="space-y-2">
            {rituals.map((activity, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-sm text-slate-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Ritual */}
        {suggestedRitual && (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{suggestedRitual.icon}</span>
              <span className="text-sm font-medium text-white">{suggestedRitual.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedRitual.items.map((item, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-slate-700/50 text-xs text-slate-400">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lunar Days */}
        <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-800/50">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => {
            const dayOfWeek = now.getDay();
            const isToday = i === dayOfWeek;
            const moonDay = (daysSinceNewMoon + i) % 29.5 < 15;
            
            return (
              <div key={i} className="text-center">
                <span className={cn(
                  'text-[10px]',
                  isToday ? 'text-indigo-400 font-medium' : 'text-slate-500'
                )}>
                  {day}
                </span>
                <div className={cn(
                  'mt-1 w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-sm',
                  isToday 
                    ? 'bg-indigo-500/20 border border-indigo-500/30' 
                    : 'bg-slate-800/30'
                )}>
                  <Moon className={cn('w-4 h-4', moonDay ? 'text-slate-300' : 'text-slate-600')} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default MoonTracker;