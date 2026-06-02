// fallow-ignore-file unused-file
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Sun, Moon, Star, Heart, Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface SpiritualSummaryProps {
  className?: string;
  orixaRegente?: string;
  odu?: string;
  numeroPessoal?: number;
  birthDate?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  ether: '✨',
};

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  fire: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  water: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  earth: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  air: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  ether: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getOrixaElement(orixa?: string): string {
  const elements: Record<string, string> = {
    'Oxum': 'water',
    'Iemanjá': 'water',
    'Oxalá': 'ether',
    'Ogum': 'fire',
    'Xangô': 'fire',
    'Iansã': 'fire',
    'Oxóssi': 'earth',
    'Omolu': 'earth',
    'Nanã': 'earth',
    'Oya': 'air',
    'Logunedê': 'ether',
    'Eshu': 'fire',
  };
  return elements[orixa || ''] || 'ether';
}

function getLunarPhase(): { emoji: string; name: string; element: string } {
  const dayOfYear = getDayOfYear();
  const phases = [
    { emoji: '🌑', name: 'Lua Nova', element: 'introspecção' },
    { emoji: '🌒', name: 'Crescente', element: 'crescimento' },
    { emoji: '🌓', name: 'Quarto Crescente', element: 'ação' },
    { emoji: '🌔', name: 'Gibosa Crescente', element: 'expansão' },
    { emoji: '🌕', name: 'Lua Cheia', element: 'culminação' },
    { emoji: '🌖', name: 'Gibosa Minguante', element: 'liberação' },
    { emoji: '🌗', name: 'Quarto Minguante', element: 'avaliação' },
    { emoji: '🌘', name: 'Minguante', element: 'descanso' },
  ];
  return phases[dayOfYear % 8];
}

function getAffirmation(orixa?: string): string {
  const affirmations: Record<string, string> = {
    fire: 'Eu abraço minha força interior e transformo obstáculos em oportunidades.',
    water: 'Eu flutuo com grace, permitindo que a vida me guie suavemente.',
    earth: 'Eu solidifico meus propósitos e construo uma vida de abundância.',
    air: 'Eu respiro liberdade e deixo que meus pensamentos voem alto.',
    ether: 'Eu sou luz pura, conectado à sabedoria divina do universo.',
  };
  const element = getOrixaElement(orixa);
  return affirmations[element] || affirmations.ether;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function SpiritualSummary({ 
  className, 
  orixaRegente = 'Oxalá',
  odu = 'Alafia',
  numeroPessoal = 1,
}: SpiritualSummaryProps) {
  const lunarPhase = getLunarPhase();
  const element = getOrixaElement(orixaRegente);
  const elementColors = ELEMENT_COLORS[element];
  const affirmation = getAffirmation(orixaRegente);
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Get time-based energy
  const hour = today.getHours();
  const timeEnergy = hour >= 5 && hour < 12 ? 'matinal' : hour >= 12 && hour < 18 ? 'vespertina' : 'noturna';
  const timeIcon = hour >= 5 && hour < 18 ? '☀️' : '🌙';

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
            Resumo Espiritual
          </span>
          <span className="ml-auto text-xs text-slate-500">{dateStr}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Date & Time Energy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{timeIcon}</span>
            <div>
              <p className="text-sm font-medium text-white capitalize">{timeEnergy}</p>
              <p className="text-xs text-slate-400">Energia do momento</p>
            </div>
          </div>
          <div className={cn('px-3 py-1.5 rounded-full', elementColors.bg, elementColors.text, 'text-xs font-medium')}>
            {ELEMENT_ICONS[element]} {element.charAt(0).toUpperCase() + element.slice(1)}
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Orixá */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <Sun className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-bold text-white">{orixaRegente}</p>
            <p className="text-xs text-slate-400">Orixá Regente</p>
          </div>

          {/* Odú */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-violet-400" />
            <p className="text-lg font-bold text-white">{odu}</p>
            <p className="text-xs text-slate-400">Odú Pessoal</p>
          </div>

          {/* Número */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <p className="text-lg font-bold text-white">{numeroPessoal}</p>
            <p className="text-xs text-slate-400">Número</p>
          </div>
        </div>

        {/* Lunar Phase */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{lunarPhase.emoji}</span>
            <div>
              <p className="text-sm font-medium text-white">{lunarPhase.name}</p>
              <p className="text-xs text-slate-400">Período de {lunarPhase.element}</p>
            </div>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-amber-400 font-medium">Afirmação do Elemento</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{affirmation}&rdquo;
          </p>
        </div>

        {/* Quick Tips */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Pratique gratidão ao amanhecer</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Moon className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-300">Reserve tempo para meditação esta noite</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpiritualSummary;