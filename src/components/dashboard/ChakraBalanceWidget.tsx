'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WidgetProgress } from './SpiritualWidgetSystem';
import { CircleDot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface ChakraData {
  nome: string;
  nomeSanscrito: string;
  cor: string;
  energia: number;
  planeta: string;
  elemento: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const CHAKRAS_BASE: Omit<ChakraData, 'energia'>[] = [
  { nome: 'Raiz', nomeSanscrito: 'Muladhara', cor: '#dc2626', planeta: 'Saturno', elemento: 'Terra' },
  { nome: 'Sacro', nomeSanscrito: 'Svadhisthana', cor: '#ea580c', planeta: 'Júpiter', elemento: 'Água' },
  { nome: 'Plexo', nomeSanscrito: 'Manipura', cor: '#eab308', planeta: 'Marte', elemento: 'Fogo' },
  { nome: 'Coração', nomeSanscrito: 'Anahata', cor: '#22c55e', planeta: 'Vênus', elemento: 'Ar' },
  { nome: 'Laríngeo', nomeSanscrito: 'Vishuddha', cor: '#06b6d4', planeta: 'Mercúrio', elemento: 'Éter' },
  { nome: 'Frontal', nomeSanscrito: 'Ajna', cor: '#3b82f6', planeta: 'Lua', elemento: 'Light' },
  { nome: 'Coronário', nomeSanscrito: 'Sahasrara', cor: '#8b5cf6', planeta: 'Sol', elemento: 'Cosmos' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getChakrasEnergia(): ChakraData[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Variação baseada no dia da semana para simulação
  const dayModifiers: Record<number, number[]> = {
    0: [5, 0, 8, 0, 0, 3, 10], // Domingo - Coronário mais ativo
    1: [10, 0, 0, 0, 0, 12, 0], // Segunda - Raiz e Frontal
    2: [0, 12, 0, 5, 0, 0, 0], // Terça - Sacro e Coração
    3: [0, 0, 8, 0, 5, 0, 0], // Quarta - Plexo e Laríngeo
    4: [0, 5, 0, 15, 0, 0, 0], // Quinta - Coração mais ativo
    5: [0, 0, 3, 0, 0, 0, 18], // Sexta - Coronário mais ativo
    6: [0, 0, 0, 10, 0, 10, 5], // Sábado - Coração e Frontal
  };

  return CHAKRAS_BASE.map((chakra, i) => ({
    ...chakra,
    energia: Math.min(100, Math.max(40, 70 + (dayModifiers[dayOfWeek]?.[i] || 0) + Math.random() * 15)),
  }));
}

// ============================================================
// COMPONENTS
// ============================================================

function ChakraBar({ chakra, isHighlight }: { chakra: ChakraData; isHighlight: boolean }) {
  return (
    <div className={cn(
      'p-3 rounded-xl transition-all duration-300',
      isHighlight ? 'bg-slate-800/70 border border-slate-700/50' : 'bg-slate-800/30 border border-transparent'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Chakra color dot */}
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: chakra.cor, boxShadow: isHighlight ? `0 0 8px ${chakra.cor}` : 'none' }}
          />
          <div>
            <span className="text-sm font-medium text-white">{chakra.nome}</span>
            <span className="text-xs text-slate-500 ml-2">{chakra.nomeSanscrito}</span>
          </div>
        </div>
        <span className={cn(
          'text-sm font-semibold',
          isHighlight ? 'text-amber-400' : 'text-slate-400'
        )}>
          {Math.round(chakra.energia)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-500')}
          style={{ 
            width: `${chakra.energia}%`,
            backgroundColor: chakra.cor,
            boxShadow: isHighlight ? `0 0 10px ${chakra.cor}` : 'none',
          }}
        />
      </div>
    </div>
  );
}

function ChakraCircle({ chakras, activeIndex }: { chakras: ChakraData[]; activeIndex: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-4">
      {chakras.map((chakra, i) => (
        <div 
          key={chakra.nome}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
            i === activeIndex && 'scale-125 shadow-lg'
          )}
          style={{ 
            backgroundColor: `${chakra.cor}30`,
            border: `2px solid ${chakra.cor}`,
            boxShadow: i === activeIndex ? `0 0 20px ${chakra.cor}` : 'none',
          }}
          title={`${chakra.nome}: ${Math.round(chakra.energia)}%`}
        >
          <span 
            className="text-xs font-bold"
            style={{ color: chakra.cor }}
          >
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const ChakraBalanceWidget = React.memo(function ChakraBalanceWidget({ className = '' }: { className?: string }) {
  const chakras = React.useMemo(() => getChakrasEnergia(), []);
  
  // Find most active chakra
  const mostActiveIndex = chakras.reduce((maxIdx, chakra, idx, arr) => 
    chakra.energia > arr[maxIdx].energia ? idx : maxIdx, 0);
  
  const mostActive = chakras[mostActiveIndex];
  
  // Calculate average
  const average = Math.round(chakras.reduce((sum, c) => sum + c.energia, 0) / chakras.length);
  
  // Color based on average
  const avgColor = average >= 80 ? 'emerald' : average >= 60 ? 'amber' : 'red';

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Chakras
            </span>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Média: <span className={`text-${avgColor}-400 font-semibold`}>{average}%</span></span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Chakra visual circle */}
        <ChakraCircle chakras={chakras} activeIndex={mostActiveIndex} />

        {/* Chakra bars */}
        <div className="space-y-2">
          {chakras.map((chakra, i) => (
            <ChakraBar 
              key={chakra.nome} 
              chakra={chakra} 
              isHighlight={i === mostActiveIndex}
            />
          ))}
        </div>

        {/* Most active info */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: mostActive.cor, boxShadow: `0 0 10px ${mostActive.cor}` }}
            />
            <div>
              <p className="text-xs text-slate-400">Chakra mais ativo</p>
              <p className="text-sm font-semibold text-white">
                {mostActive.nome} ({mostActive.nomeSanscrito})
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {mostActive.planeta} • {mostActive.elemento}
          </p>
        </div>

        {/* Overall balance progress */}
        <WidgetProgress label="Equilíbrio geral" value={average} max={100} color={avgColor} />
      </CardContent>
    </Card>
  );
});

export { ChakraBalanceWidget };
export default ChakraBalanceWidget;