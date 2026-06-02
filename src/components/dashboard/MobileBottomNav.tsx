'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Star, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo', color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 md:hidden z-50 safe-area-bottom">
      {/* Glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      
      <div className="flex justify-around items-end py-2 px-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-300 min-w-[70px]',
                isActive 
                  ? item.color 
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {/* Icon container with glow */}
              <div className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300',
                isActive 
                  ? `${item.bgColor} shadow-lg ${item.color.replace('text-', 'shadow-')}`
                  : 'bg-slate-800/50 group-hover:bg-slate-800'
              )}>
                <item.icon className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive && 'scale-110 drop-shadow-lg'
                )} />
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className={cn(
                    'absolute -top-1.5 w-2 h-2 rounded-full animate-pulse',
                    item.color.replace('text-', 'bg-')
                  )} />
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-[11px] font-medium transition-all text-center',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for modern phones */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-slate-900/50" />
    </nav>
  );
}
