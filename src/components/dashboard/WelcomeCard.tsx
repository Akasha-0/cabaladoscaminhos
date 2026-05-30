'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Calendar, Star, ChevronRight, Flame, Droplets, Wind, Zap, Sparkle, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface WelcomeCardProps {
  userName?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const USER_STATS = {
  nivel: 12,
  xp: 3450,
  xpNext: 5000,
  totalConsultas: 47,
  mapasGerados: 5,
  streakDias: 12,
  ultimoOdú: 'Alafia',
};

const SPIRITUAL_STATS = [
  { icon: Star, label: 'Mapas', value: '5', color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
  { icon: Calendar, label: 'Consultas', value: '47', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { icon: Flame, label: 'Sequência', value: '12 dias', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  { icon: Moon, label: 'Odú', value: 'Alafia', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
];

const ELEMENTAL_ENERGY = [
  { icon: Flame, name: 'Fogo', percentage: 75, color: '#ef4444' },
  { icon: Droplets, name: 'Água', percentage: 60, color: '#3b82f6' },
  { icon: Wind, name: 'Ar', percentage: 85, color: '#a3e635' },
  { icon: Zap, name: 'Terra', percentage: 45, color: '#f97316' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Bom dia', icon: Sun, color: 'text-amber-400' };
  if (hour >= 12 && hour < 18) return { greeting: 'Boa tarde', icon: Sparkle, color: 'text-orange-400' };
  return { greeting: 'Boa noite', icon: Moon, color: 'text-violet-400' };
}

function getDayElement() {
  const dayOfWeek = new Date().getDay();
  const elements = ['Fogo', 'Terra', 'Fogo', 'Água', 'Fogo', 'Água', 'Terra'];
  return elements[dayOfWeek];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WelcomeCard({ userName = 'Maria' }: WelcomeCardProps) {
  const [mounted, setMounted] = useState(false);
  const timeInfo = getTimeOfDay();
  const dayElement = getDayElement();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/50 p-6 animate-pulse">
        <div className="h-24 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-16 right-24 w-1 h-1 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
      </div>

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <timeInfo.icon className={cn('w-5 h-5', timeInfo.color)} />
              <span className={cn('text-xs font-medium uppercase tracking-wider', timeInfo.color)}>
                {timeInfo.greeting}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Olá, {userName} <span className="animate-wiggle inline-block">✨</span>
            </h2>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              Elemento do dia: <span className="text-amber-400 font-medium">{dayElement}</span>
            </p>
          </div>
          
          {/* Level badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-500/20 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-lg font-bold text-white">{USER_STATS.nivel}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Nível</p>
              <p className="text-sm font-semibold text-amber-400">Caminhante</p>
            </div>
            <div className="w-px h-8 bg-slate-700/50 mx-1" />
            <div className="text-right">
              <p className="text-xs text-slate-400">Streak</p>
              <p className="text-sm font-semibold text-orange-400">{USER_STATS.streakDias} 🔥</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progresso para nível {USER_STATS.nivel + 1}</span>
            <span className="text-sm font-medium text-amber-400">{USER_STATS.xp}/{USER_STATS.xpNext} XP</span>
          </div>
          <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${(USER_STATS.xp / USER_STATS.xpNext) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SPIRITUAL_STATS.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer',
                stat.bg,
                'border',
                stat.border,
                'hover:border-slate-500/30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg bg-slate-900/50', stat.bg)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Elemental Energy Bars */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Energia Elemental
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ELEMENTAL_ENERGY.map((element, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <element.icon className="w-4 h-4" style={{ color: element.color }} />
                  <span className="text-xs text-slate-400">{element.name}</span>
                  <span className="ml-auto text-xs font-medium" style={{ color: element.color }}>
                    {element.percentage}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${element.percentage}%`, backgroundColor: element.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/mapa"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            <Sparkles className="w-4 h-4" />
            Explorar Mapa
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/oraculo"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition-all border border-violet-500/30 hover:border-violet-500/50"
          >
            <Star className="w-4 h-4" />
            Consultar Oráculo
          </Link>
          <Link
            href="/dashboard/calendario"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/50 text-slate-300 font-medium hover:bg-slate-700/50 hover:text-white transition-all border border-slate-700/30 hover:border-slate-600/50"
          >
            <Calendar className="w-4 h-4" />
            Calendário
          </Link>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}