'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Calendar, User, Sparkles } from 'lucide-react';

const ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa' },
  { href: '/dashboard/calendario', icon: Calendar, label: 'Calendário' },
  { href: '/dashboard/perfil', icon: User, label: 'Perfil' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState('');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/90 backdrop-blur-xl border-t border-slate-800/50 md:hidden z-50 safe-area-bottom">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      <div className="flex justify-around py-2 px-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-amber-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {/* Icon container */}
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-amber-500/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                  : 'group-hover:bg-slate-800/50'
              }`}>
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                
                {/* Active dot */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium transition-all ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for modern phones */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </nav>
  );
}

import React from 'react';