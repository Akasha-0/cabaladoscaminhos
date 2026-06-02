// fallow-ignore-file unused-file
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Flame, Star, Heart, Moon, Sun, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface QuickStatsProps {
  className?: string;
  userData?: {
    nome?: string;
    orixaRegente?: string;
    odu?: string;
    nivel?: number;
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥';
  if (streak >= 7) return '⭐';
  if (streak >= 3) return '✨';
  return '🌱';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function QuickStats({ className, userData }: QuickStatsProps) {
  const dayOfYear = getDayOfYear();
  
  const stats = [
    { 
      icon: Flame, 
      label: 'Sequência', 
      value: 7, 
      unit: 'dias',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      emoji: getStreakEmoji(7)
    },
    { 
      icon: Star, 
      label: 'Práticas', 
      value: 23, 
      unit: 'hoje',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      emoji: '🌟'
    },
    { 
      icon: Heart, 
      label: 'Energia', 
      value: 87, 
      unit: '%',
      color: 'text-pink-400',
      bg: 'bg-pink-500/20',
      emoji: '💫'
    },
    { 
      icon: Moon, 
      label: 'Lua', 
      value: dayOfYear % 30 + 1, 
      unit: 'dias',
      color: 'text-violet-400',
      bg: 'bg-violet-500/20',
      emoji: '🌙'
    },
  ];

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Resumo Rápido
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <span className="text-lg">{stat.emoji}</span>
              </div>
              <p className={cn('text-xl font-bold', stat.color)}>
                {stat.value}
                <span className="text-xs text-slate-500 ml-1">{stat.unit}</span>
              </p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickStats;