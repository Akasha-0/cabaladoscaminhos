'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Star, Zap } from 'lucide-react';

const ACTIONS = [
  { href: '/dashboard/tarot', icon: Sun, label: 'Tarot', color: '#D4A843', desc: 'Arcanos Maiores' },
  { href: '/dashboard/lenormand', icon: Moon, label: 'Mesa Real', color: '#1E3A5F', desc: 'Baralho Cigano' },
  { href: '/dashboard/odu', icon: Star, label: 'Ifá', color: '#C45C26', desc: 'Merindilogun' },
  { href: '/dashboard/iching', icon: Zap, label: 'I Ching', color: '#7C6EB3', desc: 'Hexagramas' },
];

export function QuickDivination() {
  return (
    <Card className="card-spiritual">
      <CardHeader>
        <CardTitle>Divinação Rápida</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <action.icon className="w-8 h-8 mb-2" style={{ color: action.color }} />
              <span className="font-medium text-sm">{action.label}</span>
              <span className="text-xs text-slate-500 mt-1">{action.desc}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}