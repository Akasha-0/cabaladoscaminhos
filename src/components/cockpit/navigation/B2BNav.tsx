// src/components/cockpit/navigation/B2BNav.tsx
// Navegação B2B única (Doc 05 §2 / Doc 16 AD-11).
// 4 itens canônicos: Nova Consulta · Consulentes · Dashboard · Leituras.
// Item ativo = border-l-primary (laranja) + bg-secondary/15 (royal dim).

'use client';

import type { Operator } from '@prisma/client';
import { Sparkles, Users, LayoutDashboard, FileText, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface B2BNavProps {
  operator: Pick<Operator, 'id' | 'name' | 'email'>;
}

const NAV_ITEMS = [
  { label: 'Nova Consulta', href: '/cockpit', icon: Sparkles, match: 'exact' as const },
  { label: 'Consulentes', href: '/cockpit/consulentes', icon: Users, match: 'prefix' as const },
  {
    label: 'Dashboard',
    href: '/cockpit/dashboard',
    icon: LayoutDashboard,
    match: 'exact' as const,
  },
  { label: 'Leituras', href: '/cockpit/leituras', icon: FileText, match: 'prefix' as const },
];

function isActive(pathname: string, href: string, match: 'exact' | 'prefix') {
  if (match === 'exact') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function B2BNav({ operator }: B2BNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/operator/auth/logout', { method: 'POST' });
    } finally {
      router.push('/cockpit/login');
      router.refresh();
    }
  }

  return (
    <aside className="w-72 h-screen sticky top-0 bg-card/80 border-r border-border flex flex-col">
      {/* Header — Logo + nome */}
      <header className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cabala dos Caminhos
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Cockpit Oracular
            </p>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.match);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'text-sm text-muted-foreground hover:text-foreground hover:bg-muted',
                active && 'bg-secondary/15 text-primary border-l-2 border-primary font-medium'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Perfil do operador + Sair */}
      <footer className="p-4 border-t border-border/50 space-y-2">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground/90 truncate">{operator.name}</p>
          <p className="text-xs text-muted-foreground/70 truncate">{operator.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            'text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
          )}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </footer>
    </aside>
  );
}
