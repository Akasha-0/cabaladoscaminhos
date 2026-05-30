'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Flame, Star, Droplets, Sun, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface SacredCalendarProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DAYS_PORTUGUESE = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ORYXAS_DAYS = {
  0: { name: 'Oxalá/Iemanjá', symbol: '🕊️', color: 'amber' },
  1: { name: 'Omolu/Nanã', symbol: '🕸️', color: 'slate' },
  2: { name: 'Iansã/Ogum', symbol: '⚡', color: 'red' },
  3: { name: 'Oxum/Iemanjá', symbol: '💧', color: 'cyan' },
  4: { name: 'Xangô/Oxóssi', symbol: '⚡', color: 'orange' },
  5: { name: 'Oxum/Obá', symbol: '💎', color: 'pink' },
  6: { name: 'Ogum/Logunedê', symbol: '⚔️', color: 'indigo' },
};

const SACRED_DATES = [
  { day: 1, month: 1, name: 'Confraternização Universal', type: 'universal' },
  { day: 15, month: 1, name: 'Dia de Iemanjá', type: 'orixa' },
  { day: 2, month: 2, name: 'Dia de Oxalá', type: 'orixa' },
  { day: 8, month: 3, name: 'Dia Internacional da Mulher', type: 'universal' },
  { day: 15, month: 4, name: 'Dia de Oxum', type: 'orixa' },
  { day: 13, month: 5, name: 'Dia de Iansã', type: 'orixa' },
  { day: 20, month: 6, name: 'Festa Junina', type: 'cultural' },
  { day: 13, month: 8, name: 'Dia de Ogum', type: 'orixa' },
  { day: 15, month: 8, name: 'Dia de Nossa Senhora', type: 'religious' },
  { day: 8, month: 9, name: 'Dia de Nossa Senhora', type: 'religious' },
  { day: 15, month: 9, name: 'Dia de Iemanjá', type: 'orixa' },
  { day: 15, month: 10, name: 'Dia dos Professores', type: 'universal' },
  { day: 2, month: 11, name: 'Dia de Finados', type: 'universal' },
  { day: 15, month: 11, name: 'Dia da Proclamação', type: 'universal' },
  { day: 25, month: 12, name: 'Natal', type: 'religious' },
  { day: 31, month: 12, name: 'Reveillon', type: 'universal' },
];

const TODAY_EVENTS = [
  { name: 'Dia de Ogum', time: '06:00', type: 'orixa' },
  { name: 'Ritual de Proteção', time: '18:00', type: 'ritual' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMonthDays(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSacredDate(day: number, month: number): typeof SACRED_DATES[0] | null {
  return SACRED_DATES.find(d => d.day === day && d.month === month) || null;
}

function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SacredCalendar({ className }: SacredCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayDay = today.getMonth() === month ? today.getDate() : null;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Calendário Sagrado
            </span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Month Header */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">{getMonthName(month)} {year}</h3>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_PORTUGUESE.map((day, i) => (
            <div key={i} className="text-center text-xs text-slate-500 font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first day offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const sacredDate = isSacredDate(day, month + 1);
            const isToday = todayDay === day;
            const dayOfWeek = new Date(year, month, day).getDay();
            const orixaDay = ORYXAS_DAYS[dayOfWeek as keyof typeof ORYXAS_DAYS];

            return (
              <button
                key={day}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-xs',
                  isToday
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-slate-800/30 hover:bg-slate-800/50',
                  sacredDate && 'ring-1 ring-amber-500/50'
                )}
              >
                <span className={cn(
                  'font-medium',
                  isToday ? 'text-amber-400' : 'text-slate-300'
                )}>
                  {day}
                </span>
                {orixaDay && (
                  <span className="text-[8px] opacity-60">{orixaDay.symbol}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Today Events */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Eventos de Hoje</span>
          </div>
          <div className="space-y-2">
            {TODAY_EVENTS.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">{event.name}</span>
                </div>
                <span className="text-xs text-slate-500">{event.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sacred Dates This Month */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Datas Sagradas este mês
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
            {SACRED_DATES
              .filter(d => d.month === month + 1)
              .map((date, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <span className="text-sm font-medium text-amber-400 w-8">{date.day}</span>
                  <span className="text-sm text-slate-300">{date.name}</span>
                  <span className={cn(
                    'ml-auto text-[10px] px-1.5 py-0.5 rounded-full',
                    date.type === 'orixa' && 'bg-amber-500/20 text-amber-400',
                    date.type === 'religious' && 'bg-violet-500/20 text-violet-400',
                    date.type === 'cultural' && 'bg-emerald-500/20 text-emerald-400',
                    date.type === 'universal' && 'bg-slate-600/20 text-slate-400'
                  )}>
                    {date.type}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SacredCalendar;