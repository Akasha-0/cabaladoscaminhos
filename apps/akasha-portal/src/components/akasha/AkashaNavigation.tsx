'use client';

/**
 * AkashaNavigation — Responsive Navigation Layout
 *
 * Renders a sticky left sidebar on desktop and a sliding drawer with hamburger menu on mobile.
 * Supports a collapsible desktop sidebar via useCockpitStore.
 * In the bottom-left corner, displays the User profile card with initials avatar and birth info.
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LayoutDashboard,
  Compass,
  BookOpen,
  MessageSquare,
  Calendar,
  Info,
  Settings,
  MapPin,
  Clock,
  ChevronsLeft,
  ChevronsRight,
  Heart,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCockpitStore } from '@/stores/cockpit-store';

interface UserProfile {
  name: string;
  birthDate: Date | string | null;
  birthTime: string | null;
  birthCity: string | null;
}

interface AkashaNavigationProps {
  locale: string;
  user: UserProfile | null;
}

function formatDate(dateInput: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

export function AkashaNavigation({ locale, user }: AkashaNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const sidebarCollapsed = useCockpitStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useCockpitStore((s) => s.toggleSidebar);

  const navLinks = [
    { href: `/${locale}/dashboard`, label: 'Painel', icon: LayoutDashboard },
    { href: `/${locale}/mandala`, label: 'Mandala', icon: Compass },
    { href: `/${locale}/diario`, label: 'Diário', icon: BookOpen },
    { href: `/${locale}/conexoes`, label: 'Conexões', icon: Heart },
    { href: `/${locale}/oraculo`, label: 'Oráculo', icon: MessageSquare },
    { href: `/${locale}/mural`, label: 'Mural', icon: Calendar },
    { href: `/${locale}/sobre`, label: 'Sobre', icon: Info },
  ];

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '✦';
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formattedDate = user?.birthDate ? formatDate(user.birthDate) : '';
  const initials = user?.name ? getInitials(user.name) : '✦';

  // Navigation Links content
  const renderNavLinks = (onClick?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-6 relative z-10 flex flex-col items-stretch">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

        if (sidebarCollapsed && !onClick) {
          // Collapsed state link (Desktop only, since onClick is not defined on Desktop Aside call)
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex items-center justify-center p-3 rounded-xl text-sm transition-all relative ${
                isActive ? 'text-white' : 'text-[#A7AECF]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="navActiveGlowCollapsed"
                  className="absolute inset-0 bg-[#7C5CFF]/15 border-l-2 border-[#7C5CFF] rounded-xl z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} className={`relative z-10 ${isActive ? 'text-[#9D86FF]' : ''}`} />
            </Link>
          );
        }

        // Default expanded state link
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all relative ${
              isActive
                ? 'text-white font-bold'
                : 'text-[#A7AECF]/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="navActiveGlow"
                className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF]/15 to-transparent border-l-3 border-[#7C5CFF] rounded-xl z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon size={18} className={`relative z-10 ${isActive ? 'text-[#9D86FF]' : ''}`} />
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}

      {/* Collapse button on desktop */}
      {!onClick && (
        <button
          onClick={toggleSidebar}
          className={`hidden md:flex items-center rounded-xl text-sm font-semibold tracking-wide text-[#A7AECF]/60 hover:text-white hover:bg-white/5 transition-all mt-auto mb-2 ${
            sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 w-full'
          }`}
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!sidebarCollapsed && <span>Recolher Menu</span>}
        </button>
      )}
    </nav>
  );

  // User Profile Card content
  const renderUserCard = (isAside = false) => {
    if (!user) {
      return (
        <div className="p-4 border-t border-white/10 relative z-10">
          <Link
            href={`/${locale}/onboarding`}
            className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/45 text-xs text-white font-semibold hover:bg-[#7C5CFF]/35 transition-all ${
              sidebarCollapsed && isAside ? 'px-0' : ''
            }`}
          >
            {sidebarCollapsed && isAside ? '✦' : '✦ Iniciar Jornada'}
          </Link>
        </div>
      );
    }

    if (sidebarCollapsed && isAside) {
      // Collapsed user avatar card link (Desktop only)
      return (
        <div className="p-4 border-t border-white/8 bg-[#0B0E1C]/80 relative z-10 flex justify-center">
          <Link
            href={`/${locale}/conta`}
            title={user.name}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] via-[#2DD4BF] to-[#F0B429] text-white font-bold text-xs shadow-[0_0_12px_rgba(124,92,255,0.3)] hover:scale-105 transition-all duration-300"
          >
            {initials}
          </Link>
        </div>
      );
    }

    return (
      <div className="p-4 border-t border-white/8 bg-[#0B0E1C]/80 relative z-10">
        <Link
          href={`/${locale}/conta`}
          className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 active:scale-[0.98] transition-all group"
        >
          {/* Initials Avatar */}
          <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] via-[#2DD4BF] to-[#F0B429] text-white font-bold text-xs shadow-[0_0_12px_rgba(124,92,255,0.3)] animate-pulse-soft">
            {initials}
          </div>

          {/* User Birth Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#9D86FF] transition-colors">
              {user.name}
            </p>

            <div className="flex flex-col mt-0.5 space-y-0.5 text-[9px] text-[#A7AECF]/60">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={8} /> {formattedDate}{' '}
                  {user.birthTime ? `· ${user.birthTime}` : ''}
                </span>
              )}
              {user.birthCity && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={8} className="shrink-0" /> {user.birthCity}
                </span>
              )}
            </div>
          </div>

          {/* Settings icon */}
          <div className="shrink-0 text-[#A7AECF]/40 group-hover:text-white transition-colors">
            <Settings
              size={14}
              className="group-hover:rotate-45 transition-transform duration-300"
            />
          </div>
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 transition-all duration-300 bg-[#0B0E1C]/90 border-r border-[#7C5CFF]/15 backdrop-blur-lg z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand/Logo & Toggle button */}
        {sidebarCollapsed ? (
          <div className="h-16 border-b border-white/5 flex flex-col items-center justify-center gap-1">
            <span className="text-md font-bold text-[#7C5CFF] font-cinzel">✦</span>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#A7AECF] transition-colors"
              title="Expandir menu"
            >
              <ChevronsRight size={12} />
            </button>
          </div>
        ) : (
          <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between">
            <Link
              href={`/${locale}/dashboard`}
              className="text-md font-bold text-white font-cinzel tracking-[0.2em] flex items-center gap-2"
            >
              ✦ AKASHA
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white text-[#A7AECF]/60 transition-colors"
              title="Recolher menu"
            >
              <ChevronsLeft size={14} />
            </button>
          </div>
        )}

        {/* Links */}
        {renderNavLinks()}

        {/* Profile Card */}
        {renderUserCard(true)}
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#06070F]/85 border-b border-[#7C5CFF]/15 backdrop-blur-md flex items-center justify-between px-4 z-30">
        <Link
          href={`/${locale}/dashboard`}
          className="text-sm font-bold text-white font-cinzel tracking-[0.2em]"
        >
          ✦ AKASHA
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-[#A7AECF] hover:text-white transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[#0B0E1C] border-r border-[#7C5CFF]/15 z-50 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-cinzel tracking-[0.2em]">
                    ✦ AKASHA
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-[#A7AECF] hover:text-white transition-colors"
                    aria-label="Fechar menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Links */}
                {renderNavLinks(() => setIsOpen(false))}
              </div>

              {/* Profile Card */}
              {renderUserCard(false)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
