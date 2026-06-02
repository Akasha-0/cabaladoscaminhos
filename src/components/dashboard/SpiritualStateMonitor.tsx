// fallow-ignore-file unused-file
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap,
  Heart,
  Brain,
  Sparkles,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Sun,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserSpiritualData } from '@/lib/ai/insight-generator';
import { getMoonPhaseForDate } from '@/lib/calendar/moon-phases';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualStateMonitorProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  refreshInterval?: number;
}

export interface SpiritualState {
  id: string;
  label: string;
  value: number;
  max: number;
  color: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'cyan' | 'orange' | 'indigo';
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
}

export interface MoonPhaseInfluence {
  phase: string;
  name: string;
  illumination: number;
  energyModifier: number;
  description: string;
}

export interface OrixaOfTheDay {
  name: string;
  message: string;
  color: string;
  element: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STATE_COLORS = {
  amber: { bg: 'bg-amber-500/10', fill: 'bg-gradient-to-r from-amber-500 to-amber-400', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
  emerald: { bg: 'bg-emerald-500/10', fill: 'bg-gradient-to-r from-emerald-500 to-emerald-400', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
  blue: { bg: 'bg-blue-500/10', fill: 'bg-gradient-to-r from-blue-500 to-blue-400', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  purple: { bg: 'bg-purple-500/10', fill: 'bg-gradient-to-r from-purple-500 to-purple-400', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  rose: { bg: 'bg-rose-500/10', fill: 'bg-gradient-to-r from-rose-500 to-rose-400', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
  cyan: { bg: 'bg-cyan-500/10', fill: 'bg-gradient-to-r from-cyan-500 to-cyan-400', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
  orange: { bg: 'bg-orange-500/10', fill: 'bg-gradient-to-r from-orange-500 to-orange-400', text: 'text-orange-400', glow: 'shadow-orange-500/30' },
  indigo: { bg: 'bg-indigo-500/10', fill: 'bg-gradient-to-r from-indigo-500 to-indigo-400', text: 'text-indigo-400', glow: 'shadow-indigo-500/30' },
} as const;

const ORIXA_DAY_MAP: Record<number, { name: string; element: string; message: string }> = {
  0: { name: 'Oxalá', element: 'Éter', message: 'Paz e luz emanam de sua presença hoje.' },
  1: { name: 'Iemanjá', element: 'Água', message: 'A profundidade do seu coração revela verdades ocultas.' },
  2: { name: 'Ogum', element: 'Fogo', message: 'Coragem para enfrentar os desafios que surgem.' },
  3: { name: 'Oxum', element: 'Água', message: 'A sabedoria do amor flui através de suas decisões.' },
  4: { name: 'Xangô', element: 'Fogo', message: 'A justiça se manifesta em seus caminhos hoje.' },
  5: { name: 'Iansã', element: 'Fogo', message: 'Sua força interior desperta para novas conquistas.' },
  6: { name: 'Nanã', element: 'Terra', message: 'A purificação traz renovação para sua alma.' },
};

const TIME_MODIFIERS = {
  morning: { energy: 0.8, clarity: 1.0, harmony: 0.9 },
  afternoon: { energy: 1.0, clarity: 0.9, harmony: 0.85 },
  evening: { energy: 0.7, clarity: 0.85, harmony: 1.0 },
  night: { energy: 0.6, clarity: 0.95, harmony: 0.9 },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// fallow-ignore-next-line complexity
function getTimeOfDay(): keyof typeof TIME_MODIFIERS {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-rose-400" />;
    default: return <Minus className="w-4 h-4 text-slate-400" />;
  }
}

function calculateBaseValue(seed: number, modifier: number, maxValue = 100): number {
  const normalizedSeed = ((seed % 30) + 30) % 30;
  const base = 50 + normalizedSeed * (modifier - 0.5);
  const fluctuating = base + Math.sin(Date.now() / 60000) * 5;
  return Math.min(maxValue, Math.max(10, Math.round(fluctuating)));
}

function getMoonPhaseInfluence(): MoonPhaseInfluence {
  const moonData = getMoonPhaseForDate(new Date());
  const phaseDescriptions: Record<string, string> = {
    new: 'Energia de renovação e novos começos. Momento propício para introspecção.',
    waxing_crescent: 'Energia crescente de manifestação. Ideal para plantar sementes de intenção.',
    first_quarter: 'Energia de ação e determinação. Hora de avançar com seus planos.',
    waxing_gibbous: 'Energia de refinamento. Período de ajustes e preparação.',
    full: 'Pico de energia espiritual. Abertura para revelações e conexões ancestrais.',
    waning_gibbous: 'Energia de gratidão e avaliação. Momento de reconhecer progressos.',
    last_quarter: 'Energia de soltura. Período para liberar o que não serve mais.',
    waning_crescent: 'Energia de descanso e integração. Preparação para um novo ciclo.',
  };
  return {
    phase: moonData.phase.name,
    name: moonData.phase.displayName,
    illumination: moonData.phase.illumination,
    energyModifier: 0.7 + (moonData.phase.illumination / 100) * 0.6,
    description: phaseDescriptions[moonData.phase.name] || 'Energia lunar em transformação.',
  };
}

function getOrixaOfTheDay(): OrixaOfTheDay {
  const dayOfWeek = new Date().getDay();
  const orixaData = ORIXA_DAY_MAP[dayOfWeek] ?? ORIXA_DAY_MAP[0];
  return { name: orixaData.name, element: orixaData.element, message: orixaData.message, color: 'text-cyan-400' };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function GaugeBar({ state, index }: { state: SpiritualState; index: number }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const colors = STATE_COLORS[state.color];
  const percentage = (state.value / state.max) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 100 + index * 150);
    return () => clearTimeout(timer);
  }, [percentage, index]);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={colors.text}>{state.icon}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{state.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {getTrendIcon(state.trend)}
            <span className="text-xs text-slate-500 dark:text-slate-400">{state.trendValue > 0 ? '+' : ''}{state.trendValue}%</span>
          </div>
          <span className={cn('text-sm font-semibold', colors.text)}>{state.value}</span>
        </div>
      </div>
      <div className="relative h-2.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-lg', colors.fill)}
          style={{ width: `${animatedWidth}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300', colors.bg)} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">{state.description}</p>
    </div>
  );
}

function MoonPhaseDisplay({ influence }: { influence: MoonPhaseInfluence }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30">
      <Moon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{influence.name}</span>
          <span className="text-xs text-slate-500">{influence.illumination}% iluminada</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{influence.description}</p>
      </div>
    </div>
  );
}

function OrixaIndicator({ orixa }: { orixa: OrixaOfTheDay }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
        <span className="text-lg font-bold text-cyan-400">{orixa.name[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-cyan-400">{orixa.name}</span>
          <span className="text-xs text-slate-500">• {orixa.element}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{orixa.message}</p>
      </div>
    </div>
  );
}

function TimeIndicator({ timeOfDay }: { timeOfDay: keyof typeof TIME_MODIFIERS }) {
  const config = {
    morning: { icon: Sun, label: 'Manhã', color: 'text-amber-500' },
    afternoon: { icon: Sun, label: 'Tarde', color: 'text-orange-500' },
    evening: { icon: Clock, label: 'Noite', color: 'text-purple-400' },
    night: { icon: Moon, label: 'Madrugada', color: 'text-blue-400' },
  };
  const { icon: Icon, label, color } = config[timeOfDay];
  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/30', color)}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// Loading skeleton
function MonitorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 rounded-lg skeleton-spiritual" />
      <div className="h-12 rounded-lg skeleton-spiritual" />
      <div className="h-10 rounded-lg skeleton-spiritual" />
      <div className="h-10 rounded-lg skeleton-spiritual" />
      <div className="h-10 rounded-lg skeleton-spiritual" />
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualStateMonitor({ userData, userId, className = '', refreshInterval = 30000 }: SpiritualStateMonitorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const timeOfDay = getTimeOfDay();
  const timeMods = TIME_MODIFIERS[timeOfDay];

  const spiritualStates = useMemo< SpiritualState[]>(() => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const seed = (hour * 60 + minute + userData.numeroPessoal) % 100;

    const calculateState = (id: string, label: string, color: SpiritualState['color'], icon: React.ReactNode, seedModifier: number, modifier: number, description: string): SpiritualState => {
      const value = calculateBaseValue(seed + seedModifier, modifier);
      const prevValue = previousValues[id] ?? 0;
      let trend: SpiritualState['trend'] = 'stable';
      let trendValue = 0;
      if (prevValue > 0) {
        if (value > prevValue) { trend = 'up'; trendValue = Math.round(((value - prevValue) / prevValue) * 100); }
        else if (value < prevValue) { trend = 'down'; trendValue = Math.round(((value - prevValue) / prevValue) * 100); }
      }
      return { id, label, value, max: 100, color, icon, trend, trendValue, description };
    };

    return [
      calculateState('energy', 'Energia Espiritual', 'amber', <Zap className="w-4 h-4" />, 0, timeMods.energy, 'Sua energia vital e capacidade de manifestação espiritual.'),
      calculateState('harmony', 'Harmonia Interior', 'emerald', <Heart className="w-4 h-4" />, 10, timeMods.harmony + (userData.numeroPessoal % 20) / 100, 'Equilíbrio entre mente, corpo e espírito.'),
      calculateState('clarity', 'Clareza Mental', 'blue', <Brain className="w-4 h-4" />, 20, timeMods.clarity + (userData.numeroPessoal % 15) / 100, 'Capacidade de percepção e discernimento espiritual.'),
      calculateState('connection', 'Conexão Ancestral', 'purple', <Sparkles className="w-4 h-4" />, 30, timeMods.energy * 0.9, 'Laços com ancestrais e guias espirituais.'),
      calculateState('intuition', 'Intuição', 'rose', <Eye className="w-4 h-4" />, 40, timeMods.clarity * 1.1, 'Acesso à sabedoria interior e orientações divinas.'),
    ];
  }, [currentTime, userData.numeroPessoal, timeMods, previousValues]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousValues(spiritualStates.reduce((acc, state) => ({ ...acc, [state.id]: state.value }), {}));
    }, 2000);
    return () => clearTimeout(timer);
  }, [spiritualStates]);

  const moonInfluence = useMemo(() => getMoonPhaseInfluence(), []);
  const orixaOfTheDay = useMemo(() => getOrixaOfTheDay(), []);

  if (!userData || !userId) {
    return (
      <Card className={cn('card-spiritual p-4', className)}>
        <MonitorSkeleton />
      </Card>
    );
  }

  return (
    <Card className={cn('card-spiritual relative overflow-hidden', className)}>
      {/* Sacred corner decorations */}
      <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1 left-1 w-5 h-5 border-l border-t border-cyan-500/20 rounded-tl" />
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-violet-500/15 rounded-tl" />
      </div>
      <div className="absolute top-0 right-0 w-10 h-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1 right-1 w-5 h-5 border-r border-t border-cyan-500/20 rounded-tr" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Monitor Espiritual
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atualizado em tempo real</p>
          </div>
          <TimeIndicator timeOfDay={timeOfDay} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <OrixaIndicator orixa={orixaOfTheDay} />
        <MoonPhaseDisplay influence={moonInfluence} />
        <div className="space-y-4">
          {spiritualStates.map((state, index) => (<GaugeBar key={state.id} state={state} index={index} />))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs text-slate-400 text-center">
            Orixá Regente: <span className="text-cyan-400">{userData.orixaRegente || 'N/A'}</span>
            {' • '}{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpiritualStateMonitor;
