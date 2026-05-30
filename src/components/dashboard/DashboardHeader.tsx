'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, Search, Sparkles, Moon, Sun, Calendar, Flame, Star, Zap } from 'lucide-react';
import { EnergyIndicator } from './EnergyIndicator';
import { NotificationBell } from './NotificationBell';
import { UserProfileMenu } from './UserProfileMenu';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DayInfo {
  name: string;
  orixas: string[];
  element: string;
  planet: string;
  chakra: string;
  color: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const GREETINGS = {
  morning: { text: 'Bom dia', icon: '☀️', color: 'text-amber-400' },
  afternoon: { text: 'Boa tarde', icon: '🌤️', color: 'text-orange-400' },
  evening: { text: 'Boa noite', icon: '🌙', color: 'text-violet-400' },
};

const DAY_ENERGIES: Record<number, DayInfo> = {
  0: { name: 'Domingo', orixas: ['Oxalá', 'Iemanjá'], element: 'Fogo', planet: 'Sol', chakra: '7º Coronário', color: 'bg-amber-500' },
  1: { name: 'Segunda-feira', orixas: ['Omolu', 'Nanã'], element: 'Terra', planet: 'Lua', chakra: '1º Básico', color: 'bg-slate-600' },
  2: { name: 'Terça-feira', orixas: ['Iansã', 'Ogum'], element: 'Fogo', planet: 'Marte', chakra: '2º Sacro', color: 'bg-red-500' },
  3: { name: 'Quarta-feira', orixas: ['Oxum', 'Iemanjá'], element: 'Água', planet: 'Mercúrio', chakra: '4º Cardíaco', color: 'bg-pink-500' },
  4: { name: 'Quinta-feira', orixas: ['Xangô', 'Oxóssi'], element: 'Fogo', planet: 'Júpiter', chakra: '5º Laríngeo', color: 'bg-orange-500' },
  5: { name: 'Sexta-feira', orixas: ['Oxum', 'Obá'], element: 'Água', planet: 'Vênus', chakra: '4º Cardíaco', color: 'bg-cyan-500' },
  6: { name: 'Sábado', orixas: ['Ogum', 'Logunedê'], element: 'Terra', planet: 'Saturno', chakra: '6º Frontal', color: 'bg-indigo-500' },
};

const ODUS_REGENTS = [
  { name: 'Okaran', symbol: '🌟', meaning: 'Novos começos' },
  { name: 'Ogbe', symbol: '⚡', meaning: 'Vitória garantida' },
  { name: 'Oyeku', symbol: '🌙', meaning: 'Silêncio e reflexão' },
  { name: 'Irosun', symbol: '👁️', meaning: 'Visão espiritual' },
  { name: 'Owonrin', symbol: '🌪️', meaning: 'Mudança rápida' },
  { name: 'EjiOgbe', symbol: '🙏', meaning: 'Princípio de tudo' },
  { name: 'Owanrin', symbol: '🌊', meaning: 'Comunicação' },
];

const MOON_PHASES = [
  { name: 'Lua Nova', symbol: '🌑', description: 'Introspecção' },
  { name: 'Crescente', symbol: '🌒', description: 'Crescimento' },
  { name: 'Quarto Crescente', symbol: '🌓', description: 'Ação' },
  { name: 'Gibosa', symbol: '🌔', description: 'Expansão' },
  { name: 'Lua Cheia', symbol: '🌕', description: 'Culminação' },
  { name: 'Minguante', symbol: '🌖', description: 'Liberação' },
  { name: 'Quarto Minguante', symbol: '🌗', description: 'Avaliação' },
  { name: 'Balsâmica', symbol: '🌘', description: 'Descanso' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

function getCurrentDayInfo(): DayInfo {
  const dayOfWeek = new Date().getDay();
  return DAY_ENERGIES[dayOfWeek];
}

function getCurrentOdu() {
  const dayOfMonth = new Date().getDate();
  return ODUS_REGENTS[dayOfMonth % ODUS_REGENTS.length];
}

function getMoonPhase(): typeof MOON_PHASES[0] {
  // Simplified moon phase calculation
  const now = new Date();
  const startOfCycle = new Date(2024, 0, 6); // Known new moon
  const daysSinceNew = Math.floor((now.getTime() - startOfCycle.getTime()) / (1000 * 60 * 60 * 24));
  const phaseIndex = Math.floor(daysSinceNew / 3.69) % 8;
  return MOON_PHASES[phaseIndex];
}

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const greeting = getGreeting();
  const dayInfo = getCurrentDayInfo();
  const currentOdu = getCurrentOdu();
  const moonPhase = getMoonPhase();
  const today = formatDate();

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-4 bg-slate-950/80 backdrop-blur border-b border-slate-800/50">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950/95 via-slate-950/90 to-slate-950/95 backdrop-blur-xl border-b border-slate-800/30">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Greeting + Quick Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{greeting.icon}</span>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {greeting.text}
              </h1>
              <span className="text-sm text-slate-400 hidden md:inline">
                • {today}
              </span>
            </div>
            
            {/* Quick Info Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Odu */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20">
                <span className="text-sm">{currentOdu.symbol}</span>
                <span className="text-xs text-amber-400 font-medium">{currentOdu.name}</span>
              </div>
              
              {/* Day Energy */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
                <div className={cn('w-2 h-2 rounded-full', dayInfo.color)} />
                <span className="text-xs text-slate-300">{dayInfo.name}</span>
              </div>
              
              {/* Element */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-slate-300">{dayInfo.element}</span>
              </div>
              
              {/* Planet */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
                <Star className="w-3 h-3 text-violet-400" />
                <span className="text-xs text-slate-300">{dayInfo.planet}</span>
              </div>
              
              {/* Moon */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
                <span className="text-sm">{moonPhase.symbol}</span>
                <span className="text-xs text-slate-300 hidden sm:inline">{moonPhase.name}</span>
              </div>

              {/* Energy Indicator */}
              <EnergyIndicator />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all md:hidden"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Desktop Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/dashboard/oraculo"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Oráculo</span>
              </Link>
              <Link
                href="/dashboard/mapa"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-violet-400 bg-violet-500/20 hover:bg-violet-500/30 transition-all"
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Mapa</span>
              </Link>
              <Link
                href="/dashboard/calendario"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Calendário</span>
              </Link>
            </div>

            <div className="w-px h-8 bg-slate-700/50 mx-1 hidden md:block" />
            
            {/* Notifications */}
            <NotificationBell />
            
            {/* Profile */}
            <UserProfileMenu />
            
            {/* Settings */}
            <button className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no dashboard..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Search suggestions */}
            <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {['Mapa da Alma', 'Odú de hoje', 'Tarot', 'Chakras', 'Calendário', 'Meditação'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-3 py-1.5 rounded-full bg-slate-700/50 text-sm text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}