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
  ChevronLeft,
  ChevronRight,
  User,
  SunMedium,
  TreeDeciduous,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface NavItemType {
  href: string;
  icon: typeof Home;
  label: string;
  color: string;
  description?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAIN_NAV: NavItemType[] = [
  { href: '/dashboard', icon: Home, label: 'Início', color: 'text-amber-400', description: 'Visão geral' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa da Alma', color: 'text-violet-400', description: 'Análise completa' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo IA', color: 'text-purple-400', description: 'Consultas' },
];

const DIVINATION_NAV: NavItemType[] = [
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot', color: 'text-orange-400', description: '78 cartas' },
  { href: '/dashboard/lenormand', icon: Moon, label: 'Mesa Real', color: 'text-blue-400', description: '36 cartas' },
  { href: '/dashboard/odukofa', icon: TreeDeciduous, label: 'Odú Kofa', color: 'text-emerald-400', description: 'Ifá tradicional' },
];

const PRACTICES_NAV: NavItemType[] = [
  { href: '/dashboard/meditacao', icon: SunMedium, label: 'Meditação', color: 'text-cyan-400', description: 'Práticas' },
  { href: '/dashboard/rituais', icon: Calendar, label: 'Rituais', color: 'text-pink-400', description: 'Calendário' },
  { href: '/dashboard/protecao', icon: Shield, label: 'Proteção', color: 'text-rose-400', description: 'Escudo espiritual' },
];

const SECONDARY_NAV: NavItemType[] = [
  { href: '/dashboard/calendario', icon: Calendar, label: 'Calendário', color: 'text-emerald-400', description: 'Rituais lunares' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil', color: 'text-cyan-400', description: 'Suas estatísticas' },
];

const SAMPLE_USER = {
  name: 'Maria',
  espiritualName: 'Maria de Oxum',
  oduRegente: 'Alafia',
  nivel: 12,
  xp: 3450,
  xpNext: 5000,
  streak: 7,
  orixa: 'Oxum',
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  badge?: string;
}

// fallow-ignore-next-line complexity
function NavItem({ item, isCollapsed, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
        isActive
          ? 'bg-gradient-to-r from-slate-800/80 to-slate-800/50'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {isActive && (
        <div 
          className="absolute inset-0 rounded-xl opacity-10"
          style={{
            background: `linear-gradient(135deg, ${item.color}20, transparent)`,
            boxShadow: `0 0 20px ${item.color.replace('text-', '')}10`
          }}
        />
      )}
      
      <div className={cn(
        'relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
        isActive 
          ? `bg-gradient-to-br ${item.color.replace('text-', 'from-')}/20 ${item.color.replace('text-', 'to-')}/10 border border-current/20` 
          : 'bg-slate-800/50 group-hover:bg-slate-700/50'
      )}>
        <item.icon className={cn('w-4.5 h-4.5', isActive ? item.color : 'text-slate-400 group-hover:text-slate-200')} />
      </div>
      
      {!isCollapsed && (
        <div className="relative z-10 flex-1 min-w-0">
          <span className={cn('block text-sm font-medium transition-colors', isActive && item.color)}>
            {item.label}
          </span>
          {item.description && (
            <span className="block text-xs text-slate-500">{item.description}</span>
          )}
        </div>
      )}

      {badge && !isCollapsed && (
        <span className={cn(
          'px-1.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400',
          isActive && `${item.color.replace('text-', 'bg-')}/10 ${item.color}`
        )}>
          {badge}
        </span>
      )}
    </Link>
  );
}

interface NavSectionProps {
  title: string;
  items: NavItemType[];
  isCollapsed: boolean;
  defaultOpen?: boolean;
}

function NavSection({ title, items, isCollapsed, defaultOpen = true }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <div className="space-y-1 flex flex-col items-center">
        {items.map((item) => (
          <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
      >
        <span>{title}</span>
        <ChevronLeft className={cn('w-3 h-3 transition-transform', !isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
// fallow-ignore-next-line complexity

export function SpiritualSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const xpPercent = Math.round((SAMPLE_USER.xp / SAMPLE_USER.xpNext) * 100);

  return (
    <aside
      className={cn(
        'flex flex-col bg-gradient-to-b from-slate-950 via-slate-900/98 to-slate-950 border-r border-slate-800/30 fixed h-full transition-all duration-300 z-40',
        'scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/30">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex items-center gap-3 transition-all duration-300',
            isCollapsed && 'justify-center w-full'
          )}>
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-xl border border-amber-400/20 group-hover:border-amber-400/40 transition-colors" />
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
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all',
              isCollapsed 
                ? 'absolute -right-3 top-4 w-7 h-7 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg' 
                : 'bg-slate-800/50'
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className={cn(
        'p-3 border-b border-slate-800/30 transition-all duration-300',
        isCollapsed && 'p-2'
      )}>
        {!isCollapsed ? (
          <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/5 to-amber-500/10 border border-amber-500/20">
            <Link
              href="/dashboard/perfil"
              className="block p-3 hover:bg-white/5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-violet-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {SAMPLE_USER.name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900">
                    <div className="absolute inset-0.5 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{SAMPLE_USER.name}</p>
                  <p className="text-xs text-amber-400 truncate">{SAMPLE_USER.espiritualName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="py-2 rounded-lg bg-slate-900/50">
                  <p className="text-sm font-bold text-amber-400">{SAMPLE_USER.nivel}</p>
                  <p className="text-[10px] text-slate-500">Nível</p>
                </div>
                <div className="py-2 rounded-lg bg-slate-900/50">
                  <p className="text-sm font-bold text-orange-400">{SAMPLE_USER.streak}</p>
                  <p className="text-[10px] text-slate-500">🔥 Dias</p>
                </div>
                <div className="py-2 rounded-lg bg-slate-900/50">
                  <p className="text-sm font-bold text-violet-400 truncate">{SAMPLE_USER.oduRegente}</p>
                  <p className="text-[10px] text-slate-500">Odú</p>
                </div>
                <div className="py-2 rounded-lg bg-slate-900/50">
                  <p className="text-sm font-bold text-pink-400 truncate">{SAMPLE_USER.orixa}</p>
                  <p className="text-[10px] text-slate-500">Orixá</p>
                </div>
              </div>
            </Link>
            
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400">XP para nível {SAMPLE_USER.nivel + 1}</span>
                <span className="text-amber-400">{xpPercent}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/dashboard/perfil" className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {SAMPLE_USER.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950">
                <div className="absolute inset-0.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <NavSection title="Principal" items={MAIN_NAV} isCollapsed={isCollapsed} />
        <NavSection title="Divinação" items={DIVINATION_NAV} isCollapsed={isCollapsed} />
        <NavSection title="Práticas" items={PRACTICES_NAV} isCollapsed={isCollapsed} />
        <NavSection title="Agenda" items={SECONDARY_NAV} isCollapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="pt-4 border-t border-slate-800/30">
            <Link
              href="/dashboard/oraculo"
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 hover:border-violet-500/50 transition-all"
            >
              <Sparkles className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-violet-300">Novo Chat</p>
                <p className="text-xs text-slate-500">Consultar oráculo IA</p>
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/30">
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-slate-800/50 border border-slate-700/30 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-12 h-12 opacity-10">
              <Sparkles className="w-full h-full text-amber-400" />
            </div>
            
            <p className="text-xs text-slate-400 italic leading-relaxed text-center relative z-10">
              &ldquo;O caminho se revela para quem caminha com o coração aberto.&rdquo;
            </p>
            <p className="text-[10px] text-amber-500/60 text-center mt-2">
              — Oxumaré
            </p>
          </div>
          
          <Link
            href="/dashboard/configuracoes"
            className="flex items-center justify-center gap-2 mt-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </Link>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </aside>
  );
}
