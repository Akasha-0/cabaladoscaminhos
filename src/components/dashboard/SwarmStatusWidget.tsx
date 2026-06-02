'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Brain, Cpu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwarmStatusWidgetProps {
  className?: string;
}

// ============================================================
// SWARM STATUS - Indicador da saúde do Swarm + KB
// ============================================================

export function SwarmStatusWidget({ className }: SwarmStatusWidgetProps) {
  const [kb, setKB] = useState<any>(null);
  const [swarm, setSwarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/swarm/knowledge').then(r => r.json()),
      fetch('/api/swarm').then(r => r.json()),
    ]).then(([kbData, swarmData]) => {
      setKB(kbData.stats);
      setSwarm(swarmData.state);
      setLoading(false);
    }).catch(err => {
      console.error('Erro ao carregar swarm status:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Card className={cn('card-spiritual bg-slate-900/60 border-slate-800/50', className)}>
        <CardContent className="p-3 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="text-xs text-slate-400">Conectando ao Swarm...</span>
        </CardContent>
      </Card>
    );
  }

  if (!kb) return null;

  const domains = Object.keys(kb.byDomain || {});

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-r from-amber-500/5 via-violet-500/5 to-cyan-500/5 border-amber-500/20 overflow-hidden',
      className
    )}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* KB Stats */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Knowledge Base</p>
              <p className="text-[10px] text-slate-400">{kb.entries} entradas • {kb.domains} domínios</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/30">
              <Brain className="w-2.5 h-2.5 text-violet-400" />
              <span className="text-[10px] text-violet-400 font-medium">M3</span>
            </div>
          </div>
        </div>

        {/* Domains bar */}
        <div className="mt-2 flex flex-wrap gap-1">
          {domains.slice(0, 10).map(d => (
            <span
              key={d}
              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400"
              title={`${d}: ${kb.byDomain[d]} entradas`}
            >
              {d} ({kb.byDomain[d]})
            </span>
          ))}
          {domains.length > 10 && (
            <span className="text-[9px] text-slate-500">+{domains.length - 10}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SwarmStatusWidget;
