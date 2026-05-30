'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTodayCorrelation } from '@/lib/correlation/useTodayCorrelation';
import { getMoonPhases } from '@/lib/calendar/moon-phases';
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequency/frequency-data';
import { Sun, Moon, Zap, Sparkles, Activity } from 'lucide-react';
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
  'Omolu / Obaluaê': '🕸️',
  'Iansã / Oyá': '⚡',
  'Oxum / Iemanjá': '💧',
  'Xangô (Solar)': '🔥',
};

const CHAKRA_COLORS: Record<string, string> = {
  '1º Básico': '#DC2626',
  '2º Sacro': '#EA580C',
  '3º Plexo Solar': '#EAB308',
  '4º Cardíaco': '#22C55E',
  '5º Laríngeo': '#06B6D4',
  '6º Frontal': '#8B5CF6',
  '7º Coronário': '#FFFFFF',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getSolfeggioForElement(element: string): { hz: number; name: string; mantra: string } {
  const elementMap: Record<string, string> = {
    'Fogo': 'sol-528',
    'Água': 'sol-417',
    'Terra': 'sol-396',
    'Ar': 'sol-639',
    'Éter': 'sol-741',
  };
  const freqId = elementMap[element] || 'sol-528';
  const freq = SOLFEGGIO_FREQUENCIES.find(f => f.id === freqId);
  return freq ? { hz: freq.hz, name: freq.name, mantra: freq.mantra } : { hz: 528, name: 'Milagre', mantra: 'RAM' };
}

function getActiveChakras(chakra: string): string[] {
  const chakraOrder = ['1º Básico', '2º Sacro', '3º Plexo Solar', '4º Cardíaco', '5º Laríngeo', '6º Frontal', '7º Coronário'];
  const mainChakraIdx = chakraOrder.findIndex(c => chakra.includes(c.split(' ')[1]));
  if (mainChakraIdx === -1) return [chakra];

  // Return main + 2 adjacent
  const active: string[] = [];
  if (mainChakraIdx > 0) active.push(chakraOrder[mainChakraIdx - 1]);
  active.push(chakraOrder[mainChakraIdx]);
  if (mainChakraIdx < 6) active.push(chakraOrder[mainChakraIdx + 1]);
  return active;
}

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
  const correlation = useTodayCorrelation();
  const moonData = getMoonPhases();
  const solfeggio = getSolfeggioForElement(correlation.element);
  const activeChakras = getActiveChakras(correlation.chakra);
  const intensity = getEnergyIntensity(75);
  const orixaSymbol = ORIXAS_SYMBOLS[correlation.orixa] || '🔮';

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
          style={{ background: `linear-gradient(135deg, ${correlation.primaryColor}15, ${correlation.primaryColor}05)` }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 0% 0%, ${correlation.primaryColor}, transparent 60%)` }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${correlation.primaryColor}20`, border: `2px solid ${correlation.primaryColor}40` }}
            >
              {orixaSymbol}
            </div>
            <div className="flex-1">
              <p
                className="text-xl font-bold"
                style={{ color: correlation.primaryColor }}
              >
                {correlation.orixa}
              </p>
              <p className="text-sm text-slate-400">
                {correlation.planet} • {correlation.chakra}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{correlation.elementEmoji}</span>
                <span className="text-xs text-slate-300">Elemento: {correlation.element}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Element */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-2xl">{correlation.elementEmoji}</p>
            <p className="text-xs text-slate-400">{correlation.element}</p>
          </div>

          {/* Solfeggio */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-lg font-bold text-cyan-400">{solfeggio.hz}Hz</p>
            <p className="text-xs text-slate-400">Solfeggio</p>
          </div>

          {/* Planet */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
            <p className="text-lg font-bold text-white">{correlation.planet.split('/')[0].trim()}</p>
            <p className="text-xs text-slate-400">Planeta</p>
          </div>
        </div>

        {/* Lunar Phase */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200">
              {moonData.phase.emoji} {moonData.phase.displayName}
            </p>
            <p className="text-xs text-slate-400">{moonData.phase.illumination}% iluminada</p>
          </div>
          <Sparkles className="w-4 h-4 text-slate-500" />
        </div>

        {/* Active Chakras */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-2">Chakras Ativos</p>
            <div className="flex flex-wrap gap-1.5">
              {activeChakras.map((chakra) => (
                <span
                  key={chakra}
                  className="px-2 py-0.5 rounded-full text-xs border"
                  style={{
                    color: CHAKRA_COLORS[chakra] || '#22C55E',
                    borderColor: `${CHAKRA_COLORS[chakra] || '#22C55E'}40`,
                    backgroundColor: `${CHAKRA_COLORS[chakra] || '#22C55E'}10`
                  }}
                >
                  {chakra}
                </span>
              ))}
            </div>
          </div>
          <Zap className="w-4 h-4 text-emerald-500" />
        </div>

        {/* Mystery / Spiritual Purpose */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Mistério do Dia</p>
          <p className="text-sm text-slate-300 italic">"{correlation.mystery}"</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RealtimeEnergyWidget;