'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Sun, Moon, Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DayEnergyData {
  orixa: string;
  orixaEmoji: string;
  element: string;
  elementEmoji: string;
  chakra: string;
  planet: string;
  sefirah: string;
  colors: string[];
  activities: string[];
  mystery: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DAY_ENERGIES: Record<number, DayEnergyData> = {
  0: { // Sunday
    orixa: 'Xangô',
    orixaEmoji: '🔥',
    element: 'Fogo',
    elementEmoji: '🔥',
    chakra: '3º Plexo Solar',
    planet: 'Sol',
    sefirah: 'Tiphereth',
    colors: ['#f59e0b', '#fbbf24'],
    activities: ['Liderança', 'Criatividade', 'Decisões importantes'],
    mystery: 'Dia do fogo purificador e realeza solar',
  },
  1: { // Monday
    orixa: 'Omolu',
    orixaEmoji: '🕷️',
    element: 'Terra',
    elementEmoji: '🌍',
    chakra: '1º Raiz / 6º Frontal',
    planet: 'Lua',
    sefirah: 'Malkuth',
    colors: ['#dc2626', '#7c2d12'],
    activities: ['Aterramento', 'Limpeza', 'Ancestralidade'],
    mystery: 'Dia de transmutação e respeito aos ancestrais',
  },
  2: { // Tuesday
    orixa: 'Iansã',
    orixaEmoji: '⚡',
    element: 'Fogo',
    elementEmoji: '🔥',
    chakra: '2º Sacro',
    planet: 'Marte',
    sefirah: 'Geburah',
    colors: ['#f97316', '#ea580c'],
    activities: ['Força', 'Movimento', 'Cortes de demandas'],
    mystery: 'Dia de guerra justa e transformação rápida',
  },
  3: { // Wednesday
    orixa: 'Xangô',
    orixaEmoji: '☀️',
    element: 'Fogo',
    elementEmoji: '🔥',
    chakra: '3º Plexo Solar',
    planet: 'Mercúrio',
    sefirah: 'Hod',
    colors: ['#eab308', '#ca8a04'],
    activities: ['Estudos', 'Comunicação', 'Justiça'],
    mystery: 'Dia da mente concreta e verdade',
  },
  4: { // Thursday
    orixa: 'Oxóssi',
    orixaEmoji: '🏹',
    element: 'Terra',
    elementEmoji: '🌳',
    chakra: '4º Cardíaco',
    planet: 'Júpiter',
    sefirah: 'Chesed',
    colors: ['#22c55e', '#16a34a'],
    activities: ['Conhecimento', 'Expansão', 'Fartura'],
    mystery: 'Dia da busca e cura nas matas',
  },
  5: { // Friday
    orixa: 'Oxalá',
    orixaEmoji: '✧',
    element: 'Ar',
    elementEmoji: '💨',
    chakra: '7º Coronário',
    planet: 'Vênus',
    sefirah: 'Kether',
    colors: ['#f8fafc', '#a78bfa'],
    activities: ['Paz', 'Pureza', 'Conexão divina'],
    mystery: 'Dia do silêncio e luz espiritual',
  },
  6: { // Saturday
    orixa: 'Oxum',
    orixaEmoji: '💧',
    element: 'Água',
    elementEmoji: '🌊',
    chakra: '4º Cardíaco / 6º Frontal',
    planet: 'Saturno',
    sefirah: 'Binah',
    colors: ['#ec4899', '#be185d'],
    activities: ['Amor', 'Intuição', 'Águas profundas'],
    mystery: 'Dia das Grandes Mães e fertilidade',
  },
};

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DayEnergyWidget() {
  const [energy, setEnergy] = useState<DayEnergyData | null>(null);
  const [dayName, setDayName] = useState('');

  useEffect(() => {
    const today = new Date().getDay();
    setEnergy(DAY_ENERGIES[today]);
    setDayName(DAY_NAMES[today]);
  }, []);

  if (!energy) {
    return (
      <Card className="card-spiritual">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Energia do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Energia do Dia
            </span>
          </CardTitle>
          <span className="text-xs text-slate-400">{dayName}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main Energy Banner */}
        <div 
          className="p-4 rounded-xl text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${energy.colors[0]}15, ${energy.colors[1]}10)`,
            borderLeft: `4px solid ${energy.colors[0]}`,
          }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${energy.colors[0]}40, transparent 70%)`,
            }}
          />
          
          <div className="relative z-10">
            <p className="text-3xl mb-2">{energy.orixaEmoji}</p>
            <p className="text-xl font-bold text-white">{energy.orixa}</p>
            <p className="text-xs text-slate-400 mt-2">{energy.mystery}</p>
          </div>
        </div>

        {/* Element & Chakra Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{energy.elementEmoji}</span>
              <span className="text-xs text-slate-400">Elemento</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{energy.element}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔮</span>
              <span className="text-xs text-slate-400">Chakra</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{energy.chakra}</p>
          </div>
        </div>

        {/* Planet & Sefirah */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌍</span>
              <span className="text-xs text-slate-400">Planeta</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{energy.planet}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✡️</span>
              <span className="text-xs text-slate-400">Sefirá</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{energy.sefirah}</p>
          </div>
        </div>

        {/* Color Indicators */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <span className="text-xs text-slate-400">Cores do dia</span>
          <div className="flex items-center gap-2">
            {energy.colors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-slate-700"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400 font-medium mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Atividades Favoráveis
          </p>
          <div className="flex flex-wrap gap-2">
            {energy.activities.map((activity, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DayEnergyWidget;