'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, Search, Plus, Sparkles, Moon, Calendar } from 'lucide-react';
import { EnergyIndicator } from './EnergyIndicator';
import { NotificationBell } from './NotificationBell';
import { UserProfileMenu } from './UserProfileMenu';

const GREETINGS = {
  morning: { text: 'Bom dia', icon: '☀️' },
  afternoon: { text: 'Boa tarde', icon: '🌤️' },
  evening: { text: 'Boa noite', icon: '🌙' },
};

const ODUS_REGENTS = [
  { name: 'Okaran', symbol: '🌟', meaning: 'Novos começos' },
  { name: 'Ogbe', symbol: '⚡', meaning: 'Vitória garantida' },
  { name: 'Oyeku', symbol: '🌙', meaning: 'Silêncio e reflexão' },
  { name: 'Irosun', symbol: '👁️', meaning: 'Visão spiritual' },
  { name: 'Owonrin', symbol: '🌪️', meaning: 'Mudança rápida' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

function getCurrentOdu(): typeof ODUS_REGENTS[0] {
  const day = new Date().getDay();
  // Map days to Odu for demo (0=Domingo, 1=Segunda, etc.)
  // In production this would use real Odu calculations
  return ODUS_REGENTS[day % ODUS_REGENTS.length];
}

interface QuickAction {
  icon: typeof Sparkles;
  label: string;
  href: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: Sparkles, label: 'Novo Mapa', href: '/dashboard/mapa', color: 'text-violet-400 bg-violet-500/20 hover:bg-violet-500/30' },
  { icon: Moon, label: 'Consultar Odú', href: '/dashboard/oraculo', color: 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30' },
  { icon: Calendar, label: 'Ver Calendário', href: '/dashboard/calendario', color: 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30' },
];

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const greeting = getGreeting();
  const currentOdu = getCurrentOdu();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-4 bg-slate-950/80 backdrop-blur border-b border-slate-800/50">
        <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950/95 via-slate-950/90 to-slate-950/95 backdrop-blur-xl border-b border-slate-800/30">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Greeting + Odu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{greeting.icon}</span>
              <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                {greeting.text}
              </h1>
            </div>
            
            {/* Odu do dia + energy indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20">
                <span className="text-lg">{currentOdu.symbol}</span>
                <div>
                  <p className="text-xs text-amber-400 font-medium">Odú do Dia</p>
                  <p className="text-xs text-slate-400">{currentOdu.name} — {currentOdu.meaning}</p>
                </div>
              </div>
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
            
            <div className="hidden md:flex items-center gap-2">
              {/* Quick Actions */}
              {QUICK_ACTIONS.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${action.color} transition-all`}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden lg:inline">{action.label}</span>
                </Link>
              ))}
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

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <div className="mt-4 animate-fade-in">
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
                {['Mapa da Alma', 'Odú de hoje', 'Tarot', 'Chakras', 'Calendário'].map((suggestion) => (
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