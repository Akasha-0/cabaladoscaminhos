// fallow-ignore-file unused-file
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles, Eye, TrendingUp, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AkashicRecordsProps {
  className?: string;
  userId?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SAMPLE_DATA = {
  records: 256,
  accessed: 34,
  readings: 89,
  insights: 156,
};

const RECENT_ENTRIES = [
  { title: 'Linhagem de Oxum', date: '2 dias atrás', type: 'ancestral' },
  { title: 'Mapa de Vida', date: '1 semana atrás', type: 'karma' },
  { title: 'Contratos Espirituais', date: '2 semanas atrás', type: 'contractual' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AkashicRecords({ className = '', userId }: AkashicRecordsProps) {
  const stats = [
    { label: 'Records', value: SAMPLE_DATA.records, icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    { label: 'Accessed', value: SAMPLE_DATA.accessed, icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { label: 'Readings', value: SAMPLE_DATA.readings, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'Insights', value: SAMPLE_DATA.insights, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Registros Akáshicos
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center"
            >
              <div className={cn('w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Access Status */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            <div>
              <p className="text-sm font-medium text-white">Acesso ao Livro</p>
              <p className="text-xs text-slate-400">Nível: Iniciado</p>
            </div>
            <div className="ml-auto">
              <Unlock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Consultas recentes</p>
          <div className="space-y-2">
            {RECENT_ENTRIES.map((entry, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-sm text-slate-300">{entry.title}</span>
                </div>
                <span className="text-xs text-slate-500">{entry.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-2 rounded-lg bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-colors border border-violet-500/20">
          Acessar Registros
        </button>
      </CardContent>
    </Card>
  );
}

export default AkashicRecords;