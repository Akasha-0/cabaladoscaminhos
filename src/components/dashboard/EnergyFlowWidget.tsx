'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Flame, Droplets, Wind, Mountain, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface EnergyFlowWidgetProps {
  className?: string;
  userData?: {
    orixaRegente?: string;
    numeroPessoal?: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const ELEMENTS = {
  fire: { 
    name: 'Fogo', 
    icon: Flame, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    traits: ['Paixão', 'Energia', 'Transformação'],
    chakra: '3º Plexo Solar',
  },
  water: { 
    name: 'Água', 
    icon: Droplets, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    traits: ['Emoção', 'Intuição', 'Purificação'],
    chakra: '4º Cardíaco',
  },
  earth: { 
    name: 'Terra', 
    icon: Mountain, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    traits: ['Estabilidade', 'Abundância', 'Segurança'],
    chakra: '1º Básico',
  },
  air: { 
    name: 'Ar', 
    icon: Wind, 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    traits: ['Comunicação', 'Liberdade', 'Clareza'],
    chakra: '5º Laríngeo',
  },
};

const HOURS_ENERGY = [
  { hour: '05-07', element: 'earth', activity: 'Ioga matinal, gratidão' },
  { hour: '07-09', element: 'fire', activity: 'Exercícios intensos' },
  { hour: '09-11', element: 'fire', activity: 'Trabalhos criativos' },
  { hour: '11-13', element: 'fire', activity: 'Reuniões importantes' },
  { hour: '13-15', element: 'air', activity: 'Estudos, aprendizado' },
  { hour: '15-17', element: 'air', activity: 'Comunicação, networking' },
  { hour: '17-19', element: 'water', activity: 'Meditação, reflexões' },
  { hour: '19-21', element: 'water', activity: 'Tempo com família' },
  { hour: '21-23', element: 'water', activity: 'Rituais, descanso' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getDominantElement(): keyof typeof ELEMENTS {
  const dayOfYear = getDayOfYear();
  const elements: (keyof typeof ELEMENTS)[] = ['fire', 'water', 'earth', 'air'];
  return elements[dayOfYear % 4];
}

// fallow-ignore-next-line complexity
function getCurrentHourIndex(): number {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 0;
  if (hour >= 7 && hour < 9) return 1;
  if (hour >= 9 && hour < 11) return 2;
  if (hour >= 11 && hour < 13) return 3;
  if (hour >= 13 && hour < 15) return 4;
  if (hour >= 15 && hour < 17) return 5;
  if (hour >= 17 && hour < 19) return 6;
  if (hour >= 19 && hour < 21) return 7;
  return 8;
}

function getCurrentElement(): keyof typeof ELEMENTS {
  const hourIndex = getCurrentHourIndex();
  return HOURS_ENERGY[hourIndex].element as keyof typeof ELEMENTS;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function EnergyFlowWidget({ className, userData }: EnergyFlowWidgetProps) {
  const currentElement = getCurrentElement();
  const dominantElement = getDominantElement();
  const currentHourIndex = getCurrentHourIndex();
  
  const currentElementData = ELEMENTS[currentElement];
  const dominantElementData = ELEMENTS[dominantElement];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Fluxo Energético
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Current Energy */}
        <div className={cn(
          'p-4 rounded-xl border',
          currentElementData.bg,
          currentElementData.border
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', currentElementData.bg)}>
              <currentElementData.icon className={cn('w-5 h-5', currentElementData.color)} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Energia atual</p>
              <p className={cn('text-lg font-bold', currentElementData.color)}>
                {currentElementData.name}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {currentElementData.traits.map((trait) => (
              <span 
                key={trait}
                className={cn('px-2 py-0.5 rounded-full text-xs', currentElementData.bg, currentElementData.color)}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Hour Timeline */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Fluxo do dia</p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700/50" />
            
            {/* Timeline items */}
            <div className="space-y-2 relative">
              {HOURS_ENERGY.slice(0, 6).map((slot, index) => {
                const element = ELEMENTS[slot.element as keyof typeof ELEMENTS];
                const isCurrent = index === currentHourIndex || (currentHourIndex >= 6 && index === 5);
                
                return (
                  <div 
                    key={slot.hour}
                    className="flex items-center gap-3 pl-2"
                  >
                    {/* Hour marker */}
                    <div className={cn(
                      'relative z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all',
                      isCurrent 
                        ? `${element.bg} ${element.color} border-current` 
                        : 'bg-slate-800/50 border-slate-700/30 text-slate-500'
                    )}>
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current" />
                      )}
                      <span className="text-[10px] font-medium">
                        {slot.hour.split('-')[0]}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className={cn(
                      'flex-1 p-2 rounded-lg text-xs transition-all',
                      isCurrent 
                        ? `${element.bg} border ${element.border}` 
                        : 'bg-slate-800/30 border border-transparent'
                    )}>
                      <span className={isCurrent ? element.color : 'text-slate-400'}>
                        {slot.activity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dominant Element for Today */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Elemento do dia</span>
            </div>
            <div className="flex items-center gap-2">
              <dominantElementData.icon className={cn('w-4 h-4', dominantElementData.color)} />
              <span className={cn('text-sm font-medium', dominantElementData.color)}>
                {dominantElementData.name}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chakra: {dominantElementData.chakra}
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ritual recomendado: {currentElementData.name.toLowerCase()}</span>
          <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300">
            Ver mais <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnergyFlowWidget;