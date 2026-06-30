// ============================================================================
// AdminNav — navegação entre áreas do painel admin (Wave 20)
// ============================================================================
// Mobile-first: bottom tab bar no mobile, sidebar lateral no desktop.
// Server Component (sem 'use client') para que links sejam <a> puros.
// ============================================================================

import Link from 'next/link';
import { LayoutDashboard, Users, ShieldAlert, ScrollText, UserPlus } from 'lucide-react';

const ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/waitlist',
    label: 'Waitlist',
    icon: UserPlus,
  },
  {
    href: '/admin/users',
    label: 'Usuários',
    icon: Users,
  },
  {
    href: '/admin/moderation',
    label: 'Moderação',
    icon: ShieldAlert,
  },
  {
    href: '/admin/audit',
    label: 'Audit Log',
    icon: ScrollText,
  },
] as const;

export function AdminNav({ active }: { active?: (typeof ITEMS)[number]['href'] }) {
  return (
    <>
      {/* Mobile: bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden"
        aria-label="Navegação admin"
      >
        <ul className="flex items-stretch justify-around">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop: sidebar */}
      <aside
        className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-slate-800 md:bg-slate-950 md:px-3 md:py-6"
        aria-label="Sidebar admin"
      >
        <h2 className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Admin
        </h2>
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto px-2 text-[10px] text-slate-600">
          Akasha Portal · Admin · Wave 20
        </div>
      </aside>
    </>
  );
}
