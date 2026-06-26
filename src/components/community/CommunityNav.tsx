'use client';

// ============================================================================
// COMMUNITY NAV — Header global da comunidade
// ============================================================================
// Top bar com Feed, Explorar, Biblioteca, Notif, Avatar.
// Mobile-first, sticky, com bottom nav em telas pequenas.
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, BookOpen, Bell, User, Search, Sparkles,
  Menu, X, Plus, LogOut, Settings, Heart,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

// ============================================================
// MAIN
// ============================================================

export function CommunityNav({ user, onSearch, onCompose }: CommunityNavProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {/* TOP NAV (desktop + mobile) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-cinzel text-sm bg-gradient-to-r from-amber-300 to-violet-300 bg-clip-text text-transparent hidden sm:block">
              Akasha
            </span>
          </Link>

          {/* Desktop nav (center) */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/15 to-violet-500/15 text-amber-300 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button (desktop) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            {user && (
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4" />
                {user.notificationsCount !== undefined && user.notificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {user.notificationsCount > 9 ? '9+' : user.notificationsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/50 transition-all"
                >
                  <Avatar className="w-8 h-8 border border-amber-500/20">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 text-xs">
                      {user.displayName[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {profileOpen && (
                  <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0">
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800/50"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar (desktop, expandida) */}
        {searchOpen && (
          <div className="border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar tradições, pessoas, artigos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none"
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
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* BOTTOM NAV (mobile) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-slate-950/95 border-t border-slate-800/50">
          <div className="grid grid-cols-5 h-14">
            {[
              { href: '/feed', icon: Home, label: 'Feed' },
              { href: '/explore', icon: Compass, label: 'Explorar' },
              { href: '/library', icon: BookOpen, label: 'Biblioteca' },
              { href: '/notifications', icon: Bell, label: 'Notif' },
              { href: `/u/${user.handle}`, icon: User, label: 'Perfil' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all',
                    isActive ? 'text-amber-300' : 'text-slate-500'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]')} />
                  {item.label}
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

function ProfileDropdown({ user, onClose }: { user: CommunityUser; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-12 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-40 overflow-hidden">
        <Link
          href={`/u/${user.handle}`}
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/50 text-sm text-slate-300"
        >
          <User className="w-4 h-4" />
          Meu perfil
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/50 text-sm text-slate-300"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        <Link
          href="/mapa"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-800/50 text-sm text-slate-300"
        >
          <Sparkles className="w-4 h-4" />
          Meu mapa espiritual
        </Link>
        <div className="border-t border-slate-800/50" />
        <button
          onClick={() => {
            onClose();
            // logout handler
          }}
          className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-500/10 text-sm text-slate-400 hover:text-red-400 w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </>
  );
}
