// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTodayCorrelation } from '@/lib/correlation/useTodayCorrelation';
import { getMoonPhases } from '@/lib/calendar/moon-phases';
// fallow-ignore-next-line unresolved-import
import { SOLFEGGIO_FREQUENCIES } from '@/lib/frequency/frequency-data'
import { Sun, Moon, Zap, Sparkles, Activity, Circle, ArrowRight, Orbit } from 'lucide-react';

// ============================================================
// SACRED GEOMETRY COMPONENTS
// ============================================================

const SacredCornerSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0 L40 0 L40 8 L8 8 L8 40 L0 40 Z" fill="url(#cornerGrad)" opacity="0.6" />
    <circle cx="20" cy="20" r="12" stroke="url(#cornerGrad)" strokeWidth="0.5" fill="none" />
    <circle cx="20" cy="20" r="8" stroke="url(#cornerGrad)" strokeWidth="0.3" fill="none" />
    <defs>
      <linearGradient id="cornerGrad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);

// ============================================================
// CONSTANTS
// ============================================================

const CHAKRA_DATA = [
  { num: 1, name: 'Raiz', sanskrit: 'Muladhara', color: '#DC2626', planet: 'Marte', element: 'Terra' },
  { num: 2, name: 'Sacro', sanskrit: 'Svadhisthana', color: '#F97316', planet: 'Lua', element: 'Água' },
  { num: 3, name: 'Plexo', sanskrit: 'Manipura', color: '#EAB308', planet: 'Sol', element: 'Fogo' },
  { num: 4, name: 'Coração', sanskrit: 'Anahata', color: '#22C55E', planet: 'Vênus', element: 'Ar' },
  { num: 5, name: 'Laríngeo', sanskrit: 'Vishuddha', color: '#06B6D4', planet: 'Mercúrio', element: 'Éter' },
  { num: 6, name: 'Frontal', sanskrit: 'Ajna', color: '#3B82F6', planet: 'Júpiter', element: 'Luz' },
  { num: 7, name: 'Coronário', sanskrit: 'Sahasrara', color: '#8B5CF6', planet: 'Saturno', element: 'Cosmos' },
];

const ORIXAS_SYMBOLS: Record<string, string> = {
  'Oxalá': '✨', 'Iemanjá': '🌊', 'Xangô': '🔥', 'Iansã': '⚡',
  'Oxóssi': '🏹', 'Oxum': '💧', 'Ogum': '⚔️', 'Omolu': '🕸️',
  'Nanã': '🌑', 'Eshu': '👹',
};

// ============================================================
// TYPES
// ============================================================

interface UnifiedSpiritualFlowProps {
  className?: string;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function EnergyOrb({ color, intensity = 75, symbol }: { color: string; intensity?: number; symbol: string }) {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-3xl blur-xl animate-pulse"
        style={{ backgroundColor: color, opacity: intensity / 300 }}
      />
      {/* Inner orb */}
      <div 
        className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
          border: `2px solid ${color}60`,
          boxShadow: `0 0 30px ${color}40, inset 0 0 20px ${color}20`
        }}
      >
        <span className="text-3xl">{symbol}</span>
      </div>
      {/* Orbiting particles */}
      <div className="absolute -top-2 -left-2 w-24 h-24">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-orbit"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 1.5}s`,
              top: `${50 + 40 * Math.sin(i * 2.1)}%`,
              left: `${50 + 40 * Math.cos(i * 2.1)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChakraFlowLine({ from, to, color }: { from: string; to: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ 
        backgroundColor: `${color}20`, 
        color,
        border: `1px solid ${color}40` 
      }}>
        {from}
      </span>
      <ArrowRight className="w-3 h-3 text-slate-500" />
      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ 
        backgroundColor: `${color}20`, 
        color,
        border: `1px solid ${color}40` 
      }}>
        {to}
      </span>
    </div>
  );
}

function ChakraOrbit({ chakras, activeChakra }: { chakras: typeof CHAKRA_DATA; activeChakra: number }) {
  const size = 160;
  const center = size / 2;
  const radius = size * 0.35;

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Orbit ring */}
      <div 
        className="absolute inset-4 rounded-full border border-slate-700/50"
        style={{ 
          boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.1)' 
        }}
      />
      
      {/* Chakra dots */}
// fallow-ignore-next-line complexity
      {chakras.map((chakra, i) => {
        const angle = (i / chakras.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isActive = i === activeChakra;

        return (
          <div
            key={chakra.num}
            className="absolute transition-all duration-500"
            style={{
              left: x - (isActive ? 8 : 5),
              top: y - (isActive ? 8 : 5),
              width: isActive ? 16 : 10,
              height: isActive ? 16 : 10,
              borderRadius: '50%',
              backgroundColor: `${chakra.color}40`,
              border: `2px solid ${chakra.color}`,
              boxShadow: isActive ? `0 0 15px ${chakra.color}` : 'none',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {isActive && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: chakra.color }}>
                {chakra.num}
              </span>
            )}
          </div>
        );
      })}

      {/* Center symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Orbit className="w-6 h-6 text-slate-500 animate-spin-slow" />
      </div>
    </div>
  );
}

function SacredStatsGrid({ correlation }: { correlation: ReturnType<typeof useTodayCorrelation> }) {
  const stats = [
    { label: 'Elemento', value: correlation.elemento, emoji: correlation.elementEmoji, color: '#F59E0B' },
    { label: 'Solfeggio', value: `${correlation.frequenciaPrimaria?.frequencia ?? 528}Hz`, emoji: '🎵', color: '#06B6D4' },
    { label: 'Planeta', value: correlation.planeta.split('/')[0].trim(), emoji: '🌍', color: '#8B5CF6' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center"
        >
          <p className="text-xl">{stat.emoji}</p>
          <p className="text-sm font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          <p className="text-xs text-slate-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function EnergyFlowDiagram({ correlation, activeChakraIndex }: { 
  correlation: ReturnType<typeof useTodayCorrelation>; 
  activeChakraIndex: number;
}) {
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800/50">
      {/* Corner decorations */}
      <SacredCornerSVG className="absolute top-0 left-0 w-8 h-8" />
      <SacredCornerSVG className="absolute top-0 right-0 w-8 h-8 transform rotate-90" />
      <SacredCornerSVG className="absolute bottom-0 left-0 w-8 h-8 transform -rotate-90" />
      <SacredCornerSVG className="absolute bottom-0 right-0 w-8 h-8 transform rotate-180" />

      <div className="relative z-10 space-y-4">
        {/* Main flow */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${correlation.primaryColor}20`, border: `1px solid ${correlation.primaryColor}40` }}
            >
              {ORIXAS_SYMBOLS[correlation.orixa] || '✨'}
            </div>
            <span className="text-xs text-slate-400">{correlation.orixa}</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="h-0.5 flex-1 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${correlation.primaryColor}, #8B5CF6)`,
                boxShadow: `0 0 10px ${correlation.primaryColor}60`
              }}
            />
            <Zap className="w-4 h-4 mx-2 text-amber-400" />
            <div 
              className="h-0.5 flex-1 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, #8B5CF6, #22C55E)`,
                boxShadow: '0 0 10px #8B5CF660'
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${CHAKRA_DATA[activeChakraIndex].color}20`, border: `1px solid ${CHAKRA_DATA[activeChakraIndex].color}40` }}
            >
              <Circle className="w-6 h-6" style={{ color: CHAKRA_DATA[activeChakraIndex].color }} />
            </div>
            <span className="text-xs text-slate-400">{CHAKRA_DATA[activeChakraIndex].name}</span>
          </div>
        </div>

        {/* Secondary connections */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400">{correlation.planeta}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{correlation.elemento}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{correlation.frequenciaPrimaria?.frequencia ?? 528}Hz</span>
        </div>
      </div>
    </div>
  );
}

function LunarBanner({ moonData }: { moonData: ReturnType<typeof getMoonPhases> }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
      <Moon className="w-5 h-5 text-violet-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">
          {moonData.phase.emoji} {moonData.phase.displayName}
        </p>
        <p className="text-xs text-slate-400">{moonData.phase.illumination}% iluminada</p>
      </div>
      <Sparkles className="w-4 h-4 text-violet-400" />
    </div>
  );
}

function MysteryBanner({ mystery }: { mystery: string }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20">
      <p className="text-xs text-amber-400 mb-2 font-medium">✧ Mistério do Dia</p>
      <p className="text-sm text-slate-300 italic leading-relaxed">&ldquo;{mystery}&rdquo;</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function UnifiedSpiritualFlow({ className = '' }: UnifiedSpiritualFlowProps) {
  const correlation = useTodayCorrelation();
  const moonData = getMoonPhases();

  // Find active chakra index based on correlation
  const activeChakraIndex = useMemo(() => {
    const chakraMap: Record<string, number> = {
      'Raiz': 0, 'Sacro': 1, 'Plexo Solar': 2, 'Cardíaco': 3,
      'Laríngeo': 4, 'Frontal': 5, 'Coronário': 6
    };
    return chakraMap[correlation.chakra] ?? 3;
  }, [correlation.chakra]);

  const activeChakra = CHAKRA_DATA[activeChakraIndex];

  return (
    <Card className={cn(
      'card-spiritual relative overflow-hidden',
      'bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-md',
      'border border-slate-800/50',
      className
    )}>
      {/* Sacred corners */}
      <SacredCornerSVG className="absolute top-2 left-2 w-10 h-10 opacity-40" />
      <SacredCornerSVG className="absolute top-2 right-2 w-10 h-10 opacity-40 transform rotate-90" />
      <SacredCornerSVG className="absolute bottom-2 left-2 w-10 h-10 opacity-40 transform -rotate-90" />
      <SacredCornerSVG className="absolute bottom-2 right-2 w-10 h-10 opacity-40 transform rotate-180" />

      {/* Glow effect */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
        style={{ backgroundColor: correlation.primaryColor, opacity: 0.15 }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl"
        style={{ backgroundColor: '#8B5CF6', opacity: 0.1 }}
      />

      <CardHeader className="pb-3 border-b border-slate-800/50 relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
              <Orbit className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Fluxo Espiritual Unificado
            </span>
          </span>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-emerald-400 font-medium">Ativo</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5 space-y-5 relative z-10">
        {/* Main Energy + Chakra Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Energy Orb */}
          <div className="flex flex-col items-center gap-4">
            <EnergyOrb 
              color={correlation.primaryColor} 
              symbol={ORIXAS_SYMBOLS[correlation.orixa] || '✨'}
            />
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: correlation.primaryColor }}>
                {correlation.orixa}
              </p>
              <p className="text-sm text-slate-400">{correlation.chakra}</p>
            </div>
          </div>

          {/* Right: Chakra Orbit */}
          <div className="flex flex-col items-center gap-2">
            <ChakraOrbit chakras={CHAKRA_DATA} activeChakra={activeChakraIndex} />
            <div className="text-center mt-2">
              <p className="text-sm font-semibold text-white">
                {activeChakra.name} ({activeChakra.sanskrit})
              </p>
              <p className="text-xs text-slate-400">{activeChakra.planet} • {activeChakra.element}</p>
            </div>
          </div>
        </div>

        {/* Energy Flow Diagram */}
        <EnergyFlowDiagram correlation={correlation} activeChakraIndex={activeChakraIndex} />

        {/* Stats Grid */}
        <SacredStatsGrid correlation={correlation} />

        {/* Lunar Phase */}
        <LunarBanner moonData={moonData} />

        {/* Mystery */}
        <MysteryBanner mystery={correlation.mystery} />

        {/* Flow Connections Legend */}
        <div className="pt-3 border-t border-slate-800/50">
          <p className="text-xs text-slate-500 mb-3 text-center">Conexões Energéticas</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ChakraFlowLine from={correlation.orixa} to="Elemento" color={correlation.primaryColor} />
            <ChakraFlowLine from={correlation.elemento} to="Chakra" color="#22C55E" />
            <ChakraFlowLine from={activeChakra.name} to="Planeta" color={activeChakra.color} />
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(12px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
        }
        .animate-orbit {
          animation: orbit 4s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </Card>
  );
}

export default UnifiedSpiritualFlow;