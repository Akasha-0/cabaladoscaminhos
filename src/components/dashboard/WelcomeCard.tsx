// fallow-ignore-file unused-file
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Calendar, Star, ChevronRight, Flame, Droplets, Wind, Zap, Sparkle, Moon, Sun, Compass, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface WelcomeCardProps {
  userName?: string;
  userData?: {
    nivel?: number;
    xp?: number;
    xpNext?: number;
    streakDias?: number;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

const ELEMENTAL_ENERGY = [
  { icon: Flame, name: 'Fogo', percentage: 75, color: '#ef4444' },
  { icon: Droplets, name: 'Água', percentage: 60, color: '#3b82f6' },
  { icon: Wind, name: 'Ar', percentage: 85, color: '#a3e635' },
  { icon: Zap, name: 'Terra', percentage: 45, color: '#f97316' },
];

const QUICK_STATS = [
  { icon: Star, label: 'Nível', value: '12', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { icon: Calendar, label: 'Consultas', value: '47', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { icon: Flame, label: 'Sequência', value: '12 dias', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { icon: Eye, label: 'Odú', value: 'Alafia', color: 'text-violet-400', bg: 'bg-violet-500/20' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Bom dia', icon: Sun, color: 'text-amber-400', bg: 'from-amber-500/10' };
  if (hour >= 12 && hour < 18) return { greeting: 'Boa tarde', icon: Sparkle, color: 'text-orange-400', bg: 'from-orange-500/10' };
  return { greeting: 'Boa noite', icon: Moon, color: 'text-violet-400', bg: 'from-violet-500/10' };
}

function getDayElement() {
  const dayOfWeek = new Date().getDay();
  const elements = ['Fogo', 'Terra', 'Fogo', 'Água', 'Fogo', 'Água', 'Terra'];
  return elements[dayOfWeek];
}

function getUserLevel(level: number) {
  const levels = ['Iniciante', 'Explorador', 'Caminhante', 'Praticante', 'Devoto', 'Mestre'];
  return levels[Math.min(level - 1, levels.length - 1)] || 'Iniciante';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WelcomeCard({ userName = 'Maria', userData = {} }: WelcomeCardProps) {
  const [mounted, setMounted] = useState(false);
  const timeInfo = getTimeOfDay();
  const dayElement = getDayElement();

  // User stats with defaults
  const stats = useMemo(() => ({
    nivel: userData.nivel || 12,
    xp: userData.xp || 3450,
    xpNext: userData.xpNext || 5000,
    streakDias: userData.streakDias || 12,
  }), [userData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/50 p-6 animate-pulse">
        <div className="h-32 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  const xpProgress = (stats.xp / stats.xpNext) * 100;
  const TimeIcon = timeInfo.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/50">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-16 right-24 w-1 h-1 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
      </div>

      <div className="relative p-5 md:p-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20',
              'flex items-center justify-center border border-amber-500/20',
              timeInfo.color
            )}>
              <TimeIcon className="w-6 h-6" />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wider', timeInfo.color)}>
                {timeInfo.greeting}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Olá, {userName} <span className="animate-wiggle inline-block">✨</span>
              </h2>
              <p className="text-sm text-slate-400">
                Elemento do dia: <span className="text-amber-400 font-medium">{dayElement}</span>
              </p>
            </div>
          </div>
          
          {/* Level & Streak badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-lg font-bold text-white">{stats.nivel}</span>
              </div>
              <div className="pr-2 border-r border-slate-700/50">
                <p className="text-xs text-slate-400">Nível</p>
                <p className="text-sm font-semibold text-amber-400">{getUserLevel(stats.nivel)}</p>
              </div>
            </div>
            <div className="pl-2">
              <p className="text-xs text-slate-400">🔥 Sequência</p>
              <p className="text-sm font-semibold text-orange-400">{stats.streakDias} dias</p>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">XP para nível {stats.nivel + 1}</span>
            <span className="text-sm font-medium text-amber-400">{stats.xp}/{stats.xpNext}</span>
          </div>
          <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${xpProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Stats & Elements row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3">
            {QUICK_STATS.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-xl backdrop-blur-sm transition-all duration-300',
                  'hover:scale-[1.02] cursor-pointer',
                  'border border-slate-700/30',
                  'hover:border-slate-600/50 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('p-1.5 rounded-lg bg-slate-900/50', stat.bg)}>
                    <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                  </div>
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Elemental Energy */}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Energia Elemental
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENTAL_ENERGY.map((element, index) => (
                <div key={index} className="flex items-center gap-2">
                  <element.icon className="w-3.5 h-3.5" style={{ color: element.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-400">{element.name}</span>
                      <span className="text-xs font-medium" style={{ color: element.color }}>
                        {element.percentage}%
                      </span>
                    </div>
                    <div className="h-1 bg-slate-900/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${element.percentage}%`, backgroundColor: element.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
