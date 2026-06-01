'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Sparkles, Loader2, AlertCircle, Sun, Moon, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  nome: string;
  dataNascimento: string;
  horaNascimento?: string;
  localNascimento?: string;
  fullName?: string;
  caminhoDeVida?: number;
  signoSolar?: string;
  ascendente?: string;
  oduNascimento?: string;
  orixaRegente?: string;
}

interface ContextData {
  personalDay: { number: number; energy: string; action: string; color: string; chakra: string };
  personalMonth: { number: number; theme: string };
  personalYear: { number: number; theme: string };
  age: number;
  currentPinnacleTheme: string;
  dailyEnergy: {
    overallEnergy: number;
    moonPhase: { name: string; illumination: number; energy: string };
    luckyColor: string;
    luckyNumber: number;
    powerHour: string;
  };
}

interface ContextWidgetProps {
  userData: UserData;
  className?: string;
}

// ============================================================
// WIDGET COMPACTO DE CONTEXTO ESPIRITUAL
// ============================================================

export function SpiritualContextWidget({ userData, className }: ContextWidgetProps) {
  const [context, setContext] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContext();
  }, [userData.nome, userData.dataNascimento]);

  const loadContext = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'context',
          user: userData,
          useAI: false,
        }),
      });

      if (!res.ok) throw new Error('Erro ao carregar contexto');

      const data = await res.json();
      setContext(data.context);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !context) {
    return (
      <Card className={cn(
        'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50',
        className
      )}>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Calculando contexto...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(
        'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50',
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!context) return null;

  const { personalDay, personalMonth, personalYear, age, currentPinnacleTheme, dailyEnergy } = context;
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500">{today}</p>
            <p className="text-sm font-semibold text-white">Contexto Espiritual</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Energia</p>
            <p className="text-lg font-bold text-emerald-400">{dailyEnergy.overallEnergy}/100</p>
          </div>
        </div>

        {/* Day, Month, Year */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <CycleCard
            icon={Sun}
            label="Dia"
            number={personalDay.number}
            theme={personalDay.energy}
            color="amber"
          />
          <CycleCard
            icon={Calendar}
            label="Mês"
            number={personalMonth.number}
            theme={personalMonth.theme}
            color="violet"
          />
          <CycleCard
            icon={Star}
            label="Ano"
            number={personalYear.number}
            theme={personalYear.theme}
            color="emerald"
          />
        </div>

        {/* Moon + Lucky */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400">Lua</span>
            </div>
            <p className="text-xs text-white mt-1">{dailyEnergy.moonPhase.name}</p>
            <p className="text-[10px] text-slate-500">{dailyEnergy.moonPhase.illumination}% ilum.</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-slate-400">Pico</span>
            </div>
            <p className="text-xs text-white mt-1">{dailyEnergy.powerHour}</p>
            <p className="text-[10px] text-slate-500">Cor: {dailyEnergy.luckyColor}</p>
          </div>
        </div>

        {/* Action of the day */}
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20">
          <p className="text-[10px] text-amber-300 font-medium mb-1">⚡ Ação do dia</p>
          <p className="text-xs text-slate-200 leading-relaxed">{personalDay.action}</p>
        </div>

        {/* Pináculo */}
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          📍 {age} anos • {currentPinnacleTheme}
        </p>
      </CardContent>
    </Card>
  );
}

function CycleCard({
  icon: Icon,
  label,
  number,
  theme,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  number: number;
  theme: string;
  color: 'amber' | 'violet' | 'emerald';
}) {
  const colorClasses = {
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  };

  return (
    <div className={cn('p-2 rounded-lg border', colorClasses[color])}>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white mt-1">{number}</p>
      <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{theme}</p>
    </div>
  );
}

export default SpiritualContextWidget;
