'use client';

// ============================================================================
// COMMUNITY NAV — Header global da comunidade + bottom nav mobile
// ============================================================================
// Top bar com Feed, Explorar, Biblioteca, Notif, Avatar.
// Bottom nav em mobile com haptic feedback + safe area insets.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, BookOpen, Bell, User, Search, Sparkles,
  Menu, X, LogOut, Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

// ============================================================
// TYPES
// ============================================================

export interface CommunityUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  notificationsCount?: number;
}

interface CommunityNavProps {
  user?: CommunityUser | null;
  onSearch?: (q: string) => void;
  onCompose?: () => void;
}

// ============================================================
// NAV ITEMS
// ============================================================

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explorar', icon: Compass },
  { href: '/library', label: 'Biblioteca', icon: BookOpen },
] as const;

const BOTTOM_NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/explore', icon: Compass, label: 'Explorar' },
  { href: '/library', icon: BookOpen, label: 'Biblioteca' },
  { href: '/notifications', icon: Bell, label: 'Notif' },
] as const;

// ============================================================
// MAIN
// ============================================================

export function CommunityNav({ user, onSearch }: CommunityNavProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { trigger } = useHaptic();

  const handleNavClick = (href: string) => {
    trigger('selection');
    setMobileMenuOpen(false);
  };

  const handleSearchToggle = () => {
    trigger('light');
    setSearchOpen(!searchOpen);
  };

  const handleProfileToggle = () => {
    trigger('light');
    setProfileOpen(!profileOpen);
  };

  return (
    <>
      {/* TOP NAV (desktop + mobile) */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/feed"
            onClick={() => handleNavClick('/feed')}
            className="flex items-center gap-2 flex-shrink-0 min-h-[44px]"
            aria-label="Akasha Portal - Página inicial"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-cinzel text-sm bg-gradient-to-r from-amber-300 to-violet-300 bg-clip-text text-transparent hidden sm:block">
              Akasha
            </span>
          </Link>

          {/* Desktop nav (center) */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]',
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/15 to-violet-500/15 text-amber-300 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search button (desktop) */}
            <button
              onClick={handleSearchToggle}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={searchOpen ? 'Fechar busca' : 'Abrir busca'}
              aria-expanded={searchOpen}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Notifications */}
            {user && (
              <Link
                href="/notifications"
                onClick={() => trigger('selection')}
                className="relative p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Notificações${user.notificationsCount && user.notificationsCount > 0 ? ` (${user.notificationsCount} não lidas)` : ''}`}
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {user.notificationsCount !== undefined && user.notificationsCount > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {user.notificationsCount > 9 ? '9+' : user.notificationsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleProfileToggle}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/50 transition-all min-h-[44px]"
                  aria-label="Abrir menu de perfil"
                  aria-expanded={profileOpen}
                >
                  <Avatar className="w-8 h-8 border border-amber-500/20">
                    <AvatarImage src={user.avatarUrl} alt="" />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-xs">
                      {user.displayName[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {profileOpen && (
                  <ProfileDropdown
                    user={user}
                    onClose={() => {
                      setProfileOpen(false);
                      trigger('light');
                    }}
                    onItemClick={() => trigger('selection')}
                  />
                )}
              </div>
            ) : (
              <Link href="/login" onClick={() => trigger('selection')}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 min-h-[44px]"
                >
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => {
                trigger('light');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Search bar (desktop, expandida) */}
        {searchOpen && (
          <div className="border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar tradições, pessoas, artigos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-base text-slate-200 placeholder-slate-500 outline-none min-h-[44px]"
                  aria-label="Buscar conteúdo"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu (dropdown) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all min-h-[44px]',
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* BOTTOM NAV (mobile) — com safe area inset */}
      {user && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-slate-950/95 border-t border-slate-800/50"
          aria-label="Navegação inferior"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
        >
          <div className="grid grid-cols-5 h-16">
            {[
              ...BOTTOM_NAV_ITEMS,
              { href: `/u/${user.handle}`, icon: User, label: 'Perfil' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    trigger('selection');
                  }}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all min-h-[64px] py-2',
                    'active:scale-95 transition-transform',
                    isActive ? 'text-amber-300' : 'text-slate-500'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all',
                      isActive && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-110'
                    )}
                    aria-hidden="true"
                  />
                  <span className="leading-none">{item.label}</span>
                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-500 to-violet-500 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

// ============================================================
// PROFILE DROPDOWN
// ============================================================

function ProfileDropdown({
  user,
  onClose,
  onItemClick,
}: {
  user: CommunityUser;
  onClose: () => void;
  onItemClick: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-12 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-40 overflow-hidden"
        role="menu"
      >
        <Link
          href={`/u/${user.handle}`}
          onClick={() => { onItemClick(); onClose(); }}
          className="flex items-center gap-2 px-3 py-3 hover:bg-slate-800/50 text-sm text-slate-300 min-h-[44px]"
          role="menuitem"
        >
          <User className="w-4 h-4" aria-hidden="true" />
          Meu perfil
        </Link>
        <Link
          href="/settings"
          onClick={() => { onItemClick(); onClose(); }}
          className="flex items-center gap-2 px-3 py-3 hover:bg-slate-800/50 text-sm text-slate-300 min-h-[44px]"
          role="menuitem"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Configurações
        </Link>
        <Link
          href="/mapa"
          onClick={() => { onItemClick(); onClose(); }}
          className="flex items-center gap-2 px-3 py-3 hover:bg-slate-800/50 text-sm text-slate-300 min-h-[44px]"
          role="menuitem"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Meu mapa espiritual
        </Link>
        <div className="border-t border-slate-800/50" aria-hidden="true" />
        <button
          onClick={() => { onItemClick(); onClose(); }}
          className="flex items-center gap-2 px-3 py-3 hover:bg-red-500/10 text-sm text-slate-400 hover:text-red-400 w-full text-left min-h-[44px]"
          role="menuitem"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sair
        </button>
      </div>
    </>
  );
}