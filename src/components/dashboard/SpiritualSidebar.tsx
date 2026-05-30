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
  ChevronLeft,
  ChevronRight,
  User,
  Compass,
  Zap,
  BookOpen,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface NavItemType {
  href: string;
  icon: typeof Home;
  label: string;
  gradient: string;
  color: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAIN_NAV: NavItemType[] = [
  { href: '/dashboard', icon: Home, label: 'Início', gradient: 'from-amber-500/20 to-amber-600/10', color: 'text-amber-400' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa da Alma', gradient: 'from-violet-500/20 to-violet-600/10', color: 'text-violet-400' },
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot', gradient: 'from-orange-500/20 to-orange-600/10', color: 'text-orange-400' },
  { href: '/dashboard/lenormand', icon: Moon, label: 'Mesa Real', gradient: 'from-blue-500/20 to-blue-600/10', color: 'text-blue-400' },
  { href: '/dashboard/calendario', icon: Calendar, label: 'Calendário', gradient: 'from-emerald-500/20 to-emerald-600/10', color: 'text-emerald-400' },
];

const SECONDARY_NAV: NavItemType[] = [
  { href: '/dashboard/insights', icon: Compass, label: 'Insights', gradient: 'from-pink-500/20 to-pink-600/10', color: 'text-pink-400' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo IA', gradient: 'from-purple-500/20 to-purple-600/10', color: 'text-purple-400' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil', gradient: 'from-cyan-500/20 to-cyan-600/10', color: 'text-cyan-400' },
];

const SAMPLE_USER = {
  name: 'Maria',
  spiritualName: 'Maria de Oxum',
  oduRegente: 'Alafia',
  nivel: 12,
  xp: 3450,
  xpNext: 5000,
  streak: 7,
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
}

function NavItem({ item, isCollapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
        isActive
          ? `bg-gradient-to-r ${item.gradient} ${item.color} border border-current/20`
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full opacity-50" />
      )}
      
      {/* Icon */}
      <div className={cn(
        'relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300',
        isActive ? item.gradient : 'bg-slate-800/50 group-hover:bg-slate-700/50'
      )}>
        <item.icon className={cn('w-5 h-5', isActive ? item.color : 'text-slate-400 group-hover:text-slate-200')} />
      </div>
      
      {/* Label */}
      {!isCollapsed && (
        <span className={cn('relative z-10 font-medium transition-all', isActive && item.color)}>
          {item.label}
        </span>
      )}

      {/* Hover glow */}
      {!isActive && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-500/5 to-transparent transition-opacity duration-300" />
      )}
    </Link>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-r border-slate-800/50 fixed h-full transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className={cn(
            'flex items-center gap-3 transition-all duration-300',
            isCollapsed && 'justify-center w-full'
          )}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Cabala
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">dos Caminhos</p>
              </div>
            )}
          </div>
          
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all',
              isCollapsed && 'absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center'
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className={cn(
        'p-4 border-b border-slate-800/50 transition-all duration-300',
        isCollapsed && 'p-2'
      )}>
        {!isCollapsed ? (
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 transition-all"
          >
            {/* Avatar & Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-violet-500 to-amber-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {SAMPLE_USER.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              
              <div className="flex-1 text-left">
                <p className="font-semibold text-white">{SAMPLE_USER.name}</p>
                <p className="text-xs text-amber-400">{SAMPLE_USER.spiritualName}</p>
              </div>
              
              <ChevronDown className={cn(
                'w-4 h-4 text-slate-400 transition-transform',
                profileOpen && 'rotate-180'
              )} />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <p className="text-sm font-bold text-amber-400">{SAMPLE_USER.nivel}</p>
                <p className="text-[10px] text-slate-500">Nível</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50">
                <p className="text-sm font-bold text-orange-400">{SAMPLE_USER.streak}🔥</p>
                <p className="text-[10px] text-slate-500">Sequência</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50">
                <p className="text-sm font-bold text-violet-400">{SAMPLE_USER.oduRegente}</p>
                <p className="text-[10px] text-slate-500">Odú</p>
              </div>
            </div>
            
            {/* XP Progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400">Progresso</span>
                <span className="text-amber-400">{Math.round((SAMPLE_USER.xp / SAMPLE_USER.xpNext) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${(SAMPLE_USER.xp / SAMPLE_USER.xpNext) * 100}%` }}
                />
              </div>
            </div>
          </button>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {SAMPLE_USER.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
          </div>
        )}
        
        {/* Profile expanded */}
        {profileOpen && !isCollapsed && (
          <div className="mt-3 space-y-1">
            <Link href="/dashboard/perfil" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <User className="w-4 h-4" />
              <span className="text-sm">Ver Perfil</span>
            </Link>
            <Link href="/dashboard/configuracoes" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Main navigation */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Exploração
            </h3>
          )}
          <div className={cn('space-y-1', isCollapsed && 'flex flex-col items-center')}>
            {MAIN_NAV.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>
        
        {/* Secondary navigation */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Ferramentas
            </h3>
          )}
          <div className={cn('space-y-1', isCollapsed && 'flex flex-col items-center')}>
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Quote */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-slate-800/50 border border-slate-700/30 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -top-4 -right-4 w-16 h-16 opacity-10">
              <Sparkles className="w-full h-full text-amber-400" />
            </div>
            
            <p className="text-xs text-slate-400 italic leading-relaxed text-center relative z-10">
              &ldquo;O caminho se revela para quem caminha com o coração aberto.&rdquo;
            </p>
            <p className="text-[10px] text-amber-500/60 text-center mt-2">
              — Oxumaré
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}