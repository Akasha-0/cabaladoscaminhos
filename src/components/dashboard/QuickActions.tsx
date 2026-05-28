'use client';

import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const actions: QuickAction[] = [
  {
    id: 'meditate',
    label: 'Meditar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    href: '/meditar',
  },
  {
    id: 'draw-card',
    label: 'Sorteio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="14" height="18" rx="2" />
        <path d="M8 4v18" />
        <path d="M14 4v18" />
      </svg>
    ),
    href: '/sorteio',
  },
  {
    id: 'check-odu',
    label: 'Odu',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    href: '/odu',
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex gap-2 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => router.push(action.href)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          title={action.label}
        >
          {action.icon}
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}