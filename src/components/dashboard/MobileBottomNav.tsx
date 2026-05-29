'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Sun, Sparkles } from 'lucide-react';

const ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa' },
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 md:hidden z-50">
      <div className="flex justify-around py-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}