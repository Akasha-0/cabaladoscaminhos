// fallow-ignore-file unused-file
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Star, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DivinationAction {
  href: string;
  icon: typeof Sun;
  label: string;
  desc: string;
  gradient: string;
  borderColor: string;
  iconColor: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DIVINATION_METHODS: DivinationAction[] = [
  {
    href: '/dashboard/tarot',
    icon: Sun,
    label: 'Tarot',
    desc: '78 Arcanos',
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    href: '/dashboard/lenormand',
    icon: Moon,
    label: 'Mesa Real',
    desc: '36 Cartas',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    href: '/dashboard/odu',
    icon: Star,
    label: 'Ifá',
    desc: '16 Odús',
    gradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
  },
  {
    href: '/dashboard/iching',
    icon: Zap,
    label: 'I Ching',
    desc: '64 Hexagramas',
    gradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function QuickDivination() {
  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Divinação Rápida
            </span>
          </CardTitle>
          <span className="text-xs text-slate-400">Escolha um método</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3">
          {DIVINATION_METHODS.map((method, index) => {
            const Icon = method.icon;
            return (
              <Link
                key={method.href}
                href={method.href}
                className={cn(
                  'group relative flex flex-col items-center p-4 rounded-xl',
                  'bg-gradient-to-br border transition-all duration-300',
                  'hover:scale-[1.02] hover:shadow-lg',
                  'focus-visible:ring-2 focus-visible:ring-amber-500',
                  method.gradient,
                  method.borderColor
                )}
                aria-label={`${method.label}: ${method.desc}`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.1), transparent 70%)' }} 
                />
                
                <div className="relative z-10 flex flex-col items-center">
                  {/* Icon */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-3',
                    'bg-slate-800/60 border border-slate-700/50',
                    'group-hover:scale-110 transition-transform duration-300'
                  )}>
                    <Icon className={cn('w-7 h-7', method.iconColor)} />
                  </div>
                  
                  {/* Label */}
                  <h3 className="text-base font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors">
                    {method.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    {method.desc}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-amber-400 text-sm">→</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom tip */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <p className="text-xs text-slate-400 text-center">
            <span className="text-amber-400">💡</span> Dica: Cada método revela diferentes aspectos do seu caminho espiritual
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickDivination;