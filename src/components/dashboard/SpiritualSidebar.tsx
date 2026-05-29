'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Star, Sun, Moon, Sparkles, Calendar } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/dashboard/mapa', icon: Star, label: 'Mapa da Alma' },
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot' },
  { href: '/dashboard/lenormand', icon: Moon, label: 'Mesa Real' },
  { href: '/dashboard/oraculo', icon: Sparkles, label: 'Oráculo' },
  { href: '/dashboard/calendario', icon: Calendar, label: 'Calendário' },
];

export function SpiritualSidebar() {
  const pathname = usePathname();
  
  return (
    <nav className="flex-1 px-4 py-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}