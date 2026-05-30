'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Calendar, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início', color: 'text-amber-400' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo', color: 'text-violet-400' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa', color: 'text-pink-400' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil', color: 'text-cyan-400' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 md:hidden z-50 safe-area-bottom">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      
      <div className="flex justify-around items-end py-2 px-1">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[60px]',
                isActive 
                  ? item.color 
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {/* Icon container */}
              <div className={cn(
                'relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300',
                isActive 
                  ? cn('bg-current/10 shadow-lg', item.color.replace('text-', 'shadow-'))
                  : 'group-hover:bg-slate-800/50'
              )}>
                <item.icon className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )} />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 rounded-full bg-current animate-pulse" />
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-[10px] font-medium transition-all text-center',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </nav>
  );
}