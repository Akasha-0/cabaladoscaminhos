'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSpiritualEnergy } from '@/lib/hooks/useSpiritualEnergy';
import { Sun, Moon, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// CONSTANTS
// ============================================================

const ORIXAS_SYMBOLS: Record<string, string> = {
  'Xangô': '🔥',
  'Iemanjá': '🌊',
  'Iansã': '⚡',
  'Oxalá': '✨',
  'Oxóssi': '🏹',
  'Oxum': '💧',
  'Ogum': '⚔️',
  'Omolu': '🕸️',
  'Nanã': '🌑',
  'Oba': '🔪',
  'Eshu': '👹',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getEnergyIntensity(level: number): { label: string; color: string; icon: string } {
  if (level >= 80) return { label: 'Muito Alta', color: 'emerald', icon: '⚡' };
  if (level >= 60) return { label: 'Alta', color: 'green', icon: '🔥' };
  if (level >= 40) return { label: 'Moderada', color: 'amber', icon: '✨' };
  if (level >= 20) return { label: 'Baixa', color: 'orange', icon: '🌙' };
  return { label: 'Muito Baixa', color: 'slate', icon: '💫' };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function RealtimeEnergyWidget() {
  const energy = useSpiritualEnergy();
  const intensity = getEnergyIntensity(energy.intensity || 70);
  const symbol = ORIXAS_SYMBOLS[energy.orixa] || '🔮';

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden'
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Energia Espiritual
            </span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {intensity.icon} {intensity.label}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main Energy Banner */}
        <div 
          className="relative p-5 rounded-xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${energy.cor}15, ${energy.cor}05)` }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 0% 0%, ${energy.cor}, transparent 60%)` }}
          />
          
          <div className="relative z-10 flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${energy.cor}20`, border: `2px solid ${energy.cor}40` }}
            >
              {symbol}
            </div>
            <div className="flex-1">
              <p 
                className="text-xl font-bold"
                style={{ color: energy.cor }}
              >
                Dia de {energy.orixa}
              </p>
              <p className="text-sm text-slate-400">
                {energy.planeta} • {energy.chakra}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400/80">Energia em ascensão</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Planet */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-lg font-bold text-white">{energy.planeta}</p>
            <p className="text-xs text-slate-400">Planeta</p>
          </div>
          
          {/* Chakra */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-lg font-bold text-emerald-400">{energy.chakra}</p>
            <p className="text-xs text-slate-400">Chakra</p>
          </div>
          
          {/* Intensity */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-lg font-bold text-amber-400">{energy.intensity || 70}%</p>
            <p className="text-xs text-slate-400">Intensidade</p>
          </div>
        </div>

        {/* Lunar Phase */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200">{energy.lunarPhase}</p>
            <p className="text-xs text-slate-400">{energy.lunarIllumination || 50}% iluminada</p>
          </div>
          <Sparkles className="w-4 h-4 text-slate-500" />
        </div>
        
        {/* Activities */}
        <div>
          <p className="text-xs text-slate-400 mb-3">Atividades Favoráveis</p>
          <div className="flex flex-wrap gap-2">
            {energy.activities.map((activity) => (
              <span 
                key={activity}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20"
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

export default RealtimeEnergyWidget;