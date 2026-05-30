'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Calendar, Star, ChevronRight, Flame, Droplets, Wind, Zap } from 'lucide-react';

// Sample user journey data - in production this would come from API
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
  { icon: Flame, label: 'Odú Atual', value: 'Alafia', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { icon: Star, label: 'Mapas', value: '5', color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { icon: Calendar, label: 'Consultas', value: '47', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { icon: TrendingUp, label: 'Sequência', value: '12 dias', color: 'text-pink-400', bg: 'bg-pink-500/20' },
];

const ELEMENTAL_ENERGY = [
  { icon: Flame, name: 'Fogo', percentage: 75, color: '#ef4444' },
  { icon: Droplets, name: 'Água', percentage: 60, color: '#3b82f6' },
  { icon: Wind, name: 'Ar', percentage: 85, color: '#a3e635' },
  { icon: Zap, name: 'Terra', percentage: 45, color: '#f97316' },
];

interface WelcomeCardProps {
  userName?: string;
}

export function WelcomeCard({ userName = 'Maria' }: WelcomeCardProps) {
  const [mounted, setMounted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('manhã');
    else if (hour < 18) setTimeOfDay('tarde');
    else setTimeOfDay('noite');
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20 p-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded mb-4" />
        <div className="h-4 w-64 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
        
        {/* Stars */}
        <div className="absolute top-4 right-4 w-1 h-1 bg-amber-400/60 rounded-full" />
        <div className="absolute top-8 right-12 w-0.5 h-0.5 bg-amber-300/40 rounded-full" />
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-violet-400/60 rounded-full" />
      </div>

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">
                Bom {timeOfDay}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-playfair">
              Bem-vinda, {userName} ✨
            </h2>
            <p className="text-slate-400 mt-1">
              Seu mapa está pronto para exploração
            </p>
          </div>
          
          {/* Level badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{USER_STATS.nivel}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Nível</p>
              <p className="text-sm font-medium text-amber-400">Caminhante</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progresso para nível {USER_STATS.nivel + 1}</span>
            <span className="text-sm font-medium text-amber-400">{USER_STATS.xp}/{USER_STATS.xpNext} XP</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-500 relative"
              style={{ width: `${(USER_STATS.xp / USER_STATS.xpNext) * 100}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {SPIRITUAL_STATS.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${stat.bg} border border-slate-700/30 hover:border-slate-600/50 transition-all group`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Elemental Energy */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">Energia Elemental</p>
          <div className="flex gap-3">
            {ELEMENTAL_ENERGY.map((element, index) => (
              <div
                key={index}
                className="flex-1 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <element.icon className="w-4 h-4" style={{ color: element.color }} />
                  <span className="text-xs text-slate-400">{element.name}</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            Explorar Mapa
          </Link>
          <Link
            href="/dashboard/calendario"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 font-medium hover:bg-slate-700/50 hover:text-white transition-all border border-slate-700/30"
          >
            <Calendar className="w-4 h-4" />
            Ver Calendário
          </Link>
          <Link
            href="/dashboard/oraculo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 text-slate-300 font-medium hover:bg-slate-700/50 hover:text-white transition-all border border-slate-700/30"
          >
            <Star className="w-4 h-4" />
            Consultar Odú
          </Link>
        </div>

        {/* Decorative quote */}
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <p className="text-sm text-amber-400/70 italic font-cormorant text-center">
            &ldquo;Cada passo na jornada espiritual fortalece sua conexão com o cosmos.&rdquo;
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}