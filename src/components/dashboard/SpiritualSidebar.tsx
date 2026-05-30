'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Star,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Settings,
  LogOut,
  ChevronDown,
  User,
  BookOpen,
  TrendingUp,
  Heart,
  Compass,
  Zap,
} from 'lucide-react';

const MAIN_NAV = [
  { href: '/dashboard', icon: Home, label: 'Início', gradient: 'from-amber-500/20 to-amber-600/10' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa da Alma', gradient: 'from-violet-500/20 to-violet-600/10' },
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot', gradient: 'from-orange-500/20 to-orange-600/10' },
  { href: '/dashboard/lenormand', icon: Moon, label: 'Mesa Real', gradient: 'from-blue-500/20 to-blue-600/10' },
  { href: '/dashboard/calendario', icon: Calendar, label: 'Calendário', gradient: 'from-emerald-500/20 to-emerald-600/10' },
];

const SECONDARY_NAV = [
  { href: '/dashboard/insights', icon: TrendingUp, label: 'Insights', gradient: 'from-pink-500/20 to-pink-600/10' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo', gradient: 'from-purple-500/20 to-purple-600/10' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil', gradient: 'from-cyan-500/20 to-cyan-600/10' },
];

// Sample user data - in production, this would come from auth context
const SAMPLE_USER = {
  name: 'Maria',
  spiritualName: 'Maria de Oxum',
  avatar: null,
  oduRegente: 'Alafia',
  nivel: 12,
  xp: 3450,
  xpNext: 5000,
};

export function SpiritualSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const NavItem = ({ item, showGradient = false }: { item: typeof MAIN_NAV[0]; showGradient?: boolean }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
        )}
        
        {/* Icon */}
        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
          isActive
            ? 'bg-amber-500/20'
            : 'bg-slate-800/50 group-hover:bg-amber-500/10'
        }`}>
          <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
        </div>
        
        {/* Label */}
        <span className={`relative z-10 font-medium transition-all ${
          isActive ? 'text-amber-300' : ''
        }`}>
          {item.label}
        </span>
        
        {/* Hover glow */}
        {!isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-300" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50 fixed h-full transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-400 font-playfair">Cabala</h1>
                <p className="text-xs text-slate-500">dos Caminhos</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-800/50">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20 hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {SAMPLE_USER.name.charAt(0)}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              
              {/* Info */}
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{SAMPLE_USER.name}</p>
                <p className="text-xs text-amber-400/80">{SAMPLE_USER.spiritualName}</p>
              </div>
              
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Level progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Nível {SAMPLE_USER.nivel}</span>
                <span className="text-amber-400">{SAMPLE_USER.xp}/{SAMPLE_USER.xpNext} XP</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${(SAMPLE_USER.xp / SAMPLE_USER.xpNext) * 100}%` }}
                />
              </div>
            </div>
          </button>
          
          {/* Profile expanded content */}
          {profileOpen && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Ver Perfil</span>
              </Link>
              <Link
                href="/dashboard/configuracoes"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configurações</span>
              </Link>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main navigation */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exploração
            </h3>
          )}
          <div className="space-y-1">
            {MAIN_NAV.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
        
        {/* Secondary navigation */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ferramentas
            </h3>
          )}
          <div className="space-y-1">
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/30">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              &ldquo;O caminho se revela para quem caminha.&rdquo;
            </p>
            <p className="text-xs text-amber-500/60 text-center mt-1">
              — Oxumaré
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}