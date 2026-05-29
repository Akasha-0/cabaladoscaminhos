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
        <CardTitle id="quick-divination-title">Divinação Rápida</CardTitle>
        <p id="quick-divination-desc" className="text-sm text-slate-400 mt-1">
          Escolha um método de divinação para explorar
        </p>
      </CardHeader>
      <CardContent>
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          role="group"
          aria-labelledby="quick-divination-title"
          aria-describedby="quick-divination-desc"
        >
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
              aria-label={`${action.label}: ${action.desc}`}
            >
              <action.icon className="w-8 h-8 mb-2" style={{ color: action.color }} aria-hidden="true" />
              <span className="font-medium text-sm">{action.label}</span>
              <span className="text-xs text-slate-500 mt-1">{action.desc}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickDivination;
