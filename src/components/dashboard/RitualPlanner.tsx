// fallow-ignore-file unused-file
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Droplets, Wind, Moon, Sun, Star, Heart, Shield, Sparkles, Clock, ChevronRight, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface RitualPlannerProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const RITUAL_CATEGORIES = [
  { id: 'cura', name: 'Cura', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500' },
  { id: 'protecao', name: 'Proteção', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500' },
  { id: 'prosperidade', name: 'Prosperidade', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500' },
  { id: 'amor', name: 'Amor', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500' },
];

const WEEKLY_PLAN = [
  { day: 0, name: 'Domingo', rituals: ['ofxenda-oxala', 'meditacao-sol'], icon: Sun, color: 'text-amber-400' },
  { day: 1, name: 'Segunda', rituals: ['eboa-limpeza'], icon: Moon, color: 'text-violet-400' },
  { day: 2, name: 'Terça', rituals: ['guerra-igba'], icon: Flame, color: 'text-red-400' },
  { day: 3, name: 'Quarta', rituals: ['oferenda-oxum'], icon: Droplets, color: 'text-cyan-400' },
  { day: 4, name: 'Quinta', rituals: ['ritual-xango'], icon: Star, color: 'text-orange-400' },
  { day: 5, name: 'Sexta', rituals: ['auto-cuidado'], icon: Heart, color: 'text-pink-400' },
  { day: 6, name: 'Sábado', rituals: [' ancestral'], icon: Shield, color: 'text-emerald-400' },
];

const TODAY_RITUALS = [
  { id: 1, name: 'Oferenda para Oxum', time: '06:00', duration: '15 min', completed: false, type: 'amor' },
  { id: 2, name: 'Banho de Ervas', time: '07:00', duration: '20 min', completed: true, type: 'cura' },
  { id: 3, name: 'Meditação Lunar', time: '20:00', duration: '30 min', completed: false, type: 'cura' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function RitualPlanner({ className }: RitualPlannerProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [completedRituals, setCompletedRituals] = useState<number[]>([2]);
  const [showPlanner, setShowPlanner] = useState(false);

  const todayRituals = WEEKLY_PLAN[selectedDay];

  const toggleRitual = (id: number) => {
    setCompletedRituals(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const completedCount = TODAY_RITUALS.filter(r => completedRituals.includes(r.id)).length;

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Ritual Planner
            </span>
          </span>
          <button 
            onClick={() => setShowPlanner(!showPlanner)}
            className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all"
          >
            {showPlanner ? 'Hoje' : 'Ver semana'}
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {showPlanner ? (
          <>
            {/* Week Overview */}
            <div className="grid grid-cols-7 gap-1">
              {WEEKLY_PLAN.map((day) => {
                const isSelected = day.day === selectedDay;
                const isToday = day.day === new Date().getDay();
                const Icon = day.icon;
                
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                      isSelected
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : isToday
                          ? 'bg-slate-800/50 border border-slate-700/30'
                          : 'hover:bg-slate-800/30'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] font-medium',
                      isSelected ? 'text-amber-400' : 'text-slate-400'
                    )}>
                      {day.name.slice(0, 3)}
                    </span>
                    <Icon className={cn('w-4 h-4', isSelected ? day.color : 'text-slate-500')} />
                    <span className="text-[10px] text-slate-500">{day.rituals.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Details */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg bg-current/10', todayRituals.color)}>
                  {React.createElement(todayRituals.icon, { className: cn('w-5 h-5', todayRituals.color) })}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{todayRituals.name}</p>
                  <p className="text-xs text-slate-400">{todayRituals.rituals.length} ritais programados</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {todayRituals.rituals.map((ritual, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-slate-300 capitalize">{ritual}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Today's Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Rituais de Hoje</span>
                <span className="text-sm font-medium text-amber-400">
                  {completedCount}/{TODAY_RITUALS.length}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                  style={{ width: `${(completedCount / TODAY_RITUALS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Today's Rituals */}
            <div className="space-y-2">
// fallow-ignore-next-line complexity
              {TODAY_RITUALS.map((ritual) => {
                const isCompleted = completedRituals.includes(ritual.id);
                const category = RITUAL_CATEGORIES.find(c => c.id === ritual.type);
                
                return (
                  <div
                    key={ritual.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                    )}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => toggleRitual(ritual.id)}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all',
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-amber-400'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : null}
                    </button>

                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      isCompleted ? 'bg-emerald-500/20' : category?.bg + '/20'
                    )}>
                      {category && React.createElement(category.icon, {
                        className: cn('w-5 h-5', isCompleted ? 'text-emerald-400' : category.color)
                      })}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className={cn(
                        'text-sm font-medium',
                        isCompleted ? 'text-slate-400 line-through' : 'text-white'
                      )}>
                        {ritual.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {ritual.time}
                        <span>•</span>
                        {ritual.duration}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Quick Add */}
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/50 text-slate-400 text-sm font-medium border border-slate-700/30 hover:bg-slate-800 hover:text-white transition-all">
          <Plus className="w-4 h-4" />
          Adicionar Ritual
        </button>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50">
          {RITUAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/50 text-xs text-slate-400 hover:bg-slate-700/50 transition-all"
            >
              <div className={cn('w-2 h-2 rounded-full', cat.bg)} />
              {cat.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RitualPlanner;