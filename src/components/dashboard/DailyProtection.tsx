// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldCheck, ShieldAlert, Eye, Lock, Flame, Droplets, Wind, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DailyProtectionProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const PROTECTION_LEVELS = {
  high: { label: 'Alta Proteção', color: 'emerald', icon: ShieldCheck, description: 'Seus escudo espiritual está fortalecido' },
  medium: { label: 'Proteção Moderada', color: 'amber', icon: Shield, description: 'Mantenha suas práticas de proteção' },
  low: { label: 'Proteção Baixa', color: 'red', icon: ShieldAlert, description: 'Recomendamos reforçar sua proteção' },
};

const PROTECTION_RITUALS = [
  { id: 1, name: 'Asa White', description: 'Limpeza energética básica', duration: '5 min', active: false },
  { id: 2, name: 'Prece de Oxalá', description: 'Proteção divina', duration: '3 min', active: false },
  { id: 3, name: 'Defumação com Palo Santo', description: 'Purificação do ambiente', duration: '10 min', active: false },
  { id: 4, name: 'Banho de Arruda', description: 'Proteção contra energias negativas', duration: '15 min', active: true },
];

const PROTECTION_ITEMS = [
  { name: 'Vela branca', quantity: 3, icon: Flame, color: 'text-amber-400' },
  { name: 'Água de cheiro', quantity: 1, icon: Droplets, color: 'text-cyan-400' },
  { name: 'Palo Santo', quantity: 2, icon: Wind, color: 'text-emerald-400' },
  { name: 'Sal grosso', quantity: 1, icon: Sun, color: 'text-slate-400' },
];

const RECOMMENDATIONS = [
  { text: 'Evite contato com energias densas hoje', priority: 'high' },
  { text: 'Faça sua prece matinal antes de sair', priority: 'medium' },
  { text: 'Mantenha-se hidratado com água mineral', priority: 'low' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayProtectionLevel(): keyof typeof PROTECTION_LEVELS {
  const hour = new Date().getHours();
  // Simulate protection level based on time
  if (hour >= 6 && hour < 12) return 'high';
  if (hour >= 12 && hour < 18) return 'medium';
  return 'low';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function DailyProtection({ className }: DailyProtectionProps) {
  const [activeRituals, setActiveRituals] = useState<number[]>([4]);
  const [showDetails, setShowDetails] = useState(true);

  const protectionLevel = getDayProtectionLevel();
  const level = PROTECTION_LEVELS[protectionLevel];
  const LevelIcon = level.icon;

  const toggleRitual = (id: number) => {
    setActiveRituals(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center',
              level.color === 'emerald' && 'bg-emerald-500/10 border border-emerald-500/20',
              level.color === 'amber' && 'bg-amber-500/10 border border-amber-500/20',
              level.color === 'red' && 'bg-red-500/10 border border-red-500/20'
            )}>
              <Shield className={cn(
                'w-4 h-4',
                level.color === 'emerald' && 'text-emerald-400',
                level.color === 'amber' && 'text-amber-400',
                level.color === 'red' && 'text-red-400'
              )} />
            </div>
            <span className={cn(
              'text-base font-semibold',
              level.color === 'emerald' && 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent',
              level.color === 'amber' && 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent',
              level.color === 'red' && 'bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent'
            )}>
              Proteção Diária
            </span>
          </span>
          <span className={cn(
            'text-xs px-2 py-1 rounded-full',
            level.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
            level.color === 'amber' && 'bg-amber-500/20 text-amber-400',
            level.color === 'red' && 'bg-red-500/20 text-red-400'
          )}>
            {level.label}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Protection Status */}
        <div className={cn(
          'p-4 rounded-xl border',
          level.color === 'emerald' && 'bg-emerald-500/10 border-emerald-500/20',
          level.color === 'amber' && 'bg-amber-500/10 border-amber-500/20',
          level.color === 'red' && 'bg-red-500/10 border-red-500/20'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              level.color === 'emerald' && 'bg-emerald-500/20',
              level.color === 'amber' && 'bg-amber-500/20',
              level.color === 'red' && 'bg-red-500/20'
            )}>
              <LevelIcon className={cn(
                'w-6 h-6',
                level.color === 'emerald' && 'text-emerald-400',
                level.color === 'amber' && 'text-amber-400',
                level.color === 'red' && 'text-red-400'
              )} />
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                level.color === 'emerald' && 'text-emerald-400',
                level.color === 'amber' && 'text-amber-400',
                level.color === 'red' && 'text-red-400'
              )}>
                Escudo Ativo
              </p>
              <p className="text-xs text-slate-400">{level.description}</p>
            </div>
          </div>

          {/* Shield visualization */}
          <div className="mt-3 flex items-center justify-center gap-4">
            {['🛡️', '✨', '🔮'].map((emoji, i) => (
              <div
                key={i}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all',
                  i === 0 && 'bg-emerald-500/20 scale-110',
                  i === 1 && 'bg-slate-800/50',
                  i === 2 && 'bg-slate-800/30'
                )}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Rituals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Rituais de Proteção</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              {showDetails ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {showDetails && (
            <div className="space-y-2">
              {PROTECTION_RITUALS.map((ritual) => (
                <button
                  key={ritual.id}
                  onClick={() => toggleRitual(ritual.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    activeRituals.includes(ritual.id)
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                  )}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                    activeRituals.includes(ritual.id)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-600'
                  )}>
                    {activeRituals.includes(ritual.id) && <ShieldCheck className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      activeRituals.includes(ritual.id) ? 'text-emerald-400' : 'text-slate-300'
                    )}>
                      {ritual.name}
                    </p>
                    <p className="text-xs text-slate-500">{ritual.description}</p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-slate-500">{ritual.duration}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Protection Items */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Inventário de Proteção</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PROTECTION_ITEMS.map((item, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-slate-800/50 text-center"
              >
                <item.icon className={cn('w-4 h-4 mx-auto mb-1', item.color)} />
                <p className="text-xs text-slate-400">{item.quantity}x</p>
                <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          {RECOMMENDATIONS.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/30"
            >
              <div className={cn(
                'w-2 h-2 rounded-full mt-1',
                rec.priority === 'high' && 'bg-red-400',
                rec.priority === 'medium' && 'bg-amber-400',
                rec.priority === 'low' && 'bg-slate-500'
              )} />
              <span className="text-xs text-slate-400">{rec.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyProtection;