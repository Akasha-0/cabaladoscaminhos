'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OduResults } from '@/lib/engines/types/mapa-alma';

interface CalendarioEnergeticoProps {
  odu?: OduResults;
  className?: string;
}

// Configuration
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DAY_ORIXÁ_MAP = [
  { orixá: 'Oxum', planeta: 'Sol', cor: '#D4A843' },
  { orixá: 'Iemanjá', planeta: 'Lua', cor: '#1E3A5F' },
  { orixá: 'Iansã', planeta: 'Marte', cor: '#C45C26' },
  { orixá: 'Xangô', planeta: 'Mercúrio', cor: '#F0B429' },
  { orixá: 'Oxóssi', planeta: 'Júpiter', cor: '#2D6A4F' },
  { orixá: 'Oxalá', planeta: 'Vênus', cor: '#7C6EB3' },
  { orixá: 'Oxum', planeta: 'Saturno', cor: '#D4728C' },
];

const PLANET_EMOJI: Record<string, string> = {
  'Sol': '☀️',
  'Lua': '☽',
  'Marte': '♂',
  'Mercúrio': '☿',
  'Júpiter': '♃',
  'Vênus': '♀',
  'Saturno': '♄',
};

const LUNAR_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗'];

function getDayStatus(dayIndex: number): 'favoravel' | 'precaucao' | 'neutro' {
  if (dayIndex === 0 || dayIndex === 4) return 'favoravel';
  if (dayIndex === 2 || dayIndex === 6) return 'precaucao';
  return 'neutro';
}

function getStatusText(status: 'favoravel' | 'precaucao' | 'neutro'): string {
  switch (status) {
    case 'favoravel': return '⭐ Favorável';
    case 'precaucao': return '⚠️ Precaução';
    case 'neutro': return '○ Neutro';
  }
}

function getStatusColor(status: 'favoravel' | 'precaucao' | 'neutro'): string {
  switch (status) {
    case 'favoravel': return 'border-amber-400/60 bg-amber-400/5';
    case 'precaucao': return 'border-amber-600/60 bg-amber-600/5';
    case 'neutro': return 'border-slate-600/60 bg-slate-800/30';
  }
}

function getStatusTextColor(status: 'favoravel' | 'precaucao' | 'neutro'): string {
  switch (status) {
    case 'favoravel': return 'text-amber-400';
    case 'precaucao': return 'text-amber-500';
    case 'neutro': return 'text-slate-500';
  }
}

function getTopBorderColor(status: 'favoravel' | 'precaucao' | 'neutro'): string {
  switch (status) {
    case 'favoravel': return 'border-t-2 border-t-amber-400';
    case 'precaucao': return 'border-t-2 border-t-amber-600';
    case 'neutro': return 'border-t border-t-slate-600';
  }
}

function getRecommendation(day: number, userOdu?: string): string {
  if (userOdu?.toLowerCase().includes('oxé')) {
    return day === 4 ? '⭐ FAVORÁVEL - Ritual de Xangô' : '○ NEUTRO';
  }
  return day === 0 || day === 4 ? '⭐ FAVORÁVEL' : '○ NEUTRO';
}

interface DayCellProps {
  date: Date;
  dayIndex: number;
  dayName: string;
  isToday: boolean;
  orixáData: typeof DAY_ORIXÁ_MAP[0];
  lunarPhase: string;
  status: 'favoravel' | 'precaucao' | 'neutro';
  userOdu?: string;
}

function DayCell({ date, dayIndex, dayName, isToday, orixáData, lunarPhase, status, userOdu }: DayCellProps) {
  const dayNumber = date.getDate();
  const statusColor = getStatusColor(status);
  const statusTextColor = getStatusTextColor(status);
  const topBorder = getTopBorderColor(status);

  return (
    <div
      className={cn(
        'flex-shrink-0 w-[100px] sm:w-[110px] md:w-[120px]',
        'rounded-lg border border-slate-700/50',
        'bg-slate-900/50 backdrop-blur-sm',
        'flex flex-col items-center p-3',
        'transition-all duration-200',
        topBorder,
        statusColor,
        isToday && 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-400/20 -translate-y-0.5'
      )}
    >
      {/* Day name */}
      <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1">
        {DAYS_SHORT[dayIndex]}
      </span>

      {/* Day number */}
      <span
        className={cn(
          'text-2xl sm:text-3xl font-bold mb-2',
          isToday ? 'text-amber-400' : 'text-slate-200'
        )}
      >
        {dayNumber}
      </span>
      {/* Planet emoji */}
      <span className="text-2xl sm:text-3xl mb-1" role="img" aria-label={`Planeta regente: ${orixáData.planeta}`}>
        {PLANET_EMOJI[orixáData.planeta] || '✨'}
      </span>
      {/* Orixá name */}
      <span
        className="text-xs sm:text-sm font-medium mb-2 text-center"
        style={{ color: orixáData.cor }}
      >
        {orixáData.orixá}
      </span>

      {/* Lunar phase */}
      <span className="text-lg sm:text-xl mb-3">{lunarPhase}</span>

      {/* Status indicator */}
      <span className={cn('text-[10px] sm:text-xs font-medium', statusTextColor)}>
        {userOdu ? getRecommendation(dayIndex, userOdu) : getStatusText(status)}
      </span>
    </div>
  );
}

export function CalendarioEnergetico({ odu, className = '' }: CalendarioEnergeticoProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  const weekRange = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} — ${endStr}`;
  }, [weekDays]);

  const userOduName = odu?.regente?.nome || odu?.orixas?.[0];
  return (
    <div className={cn('card-spiritual', className)} role="region" aria-label="Calendário Energético Semanal">
      {/* Screen reader status */}
      <div role="status" aria-live="polite" className="sr-only">
        Calendário energético da semana de {weekRange}. {userOduName ? `Seu Odu é ${userOduName}.` : ''}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" aria-hidden="true" />
            <span>✦ CALENDÁRIO ENERGÉTICO</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Semana de {weekRange}
          </p>
        </div>
        {/* Navigation arrows - visual only */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Próxima semana"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* Day names header - desktop only */}
      <div className="hidden md:grid grid-cols-7 gap-2 mb-2 px-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs text-slate-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="flex gap-2 md:grid md:grid-cols-7 md:gap-2 min-w-max md:min-w-0">
          {weekDays.map((date, index) => {
            const isToday = date.getTime() === today.getTime();
            const dayOfWeek = date.getDay();
            const orixáData = DAY_ORIXÁ_MAP[dayOfWeek];
            const lunarPhase = LUNAR_PHASES[(dayOfWeek + index) % 7];
            const status = getDayStatus(dayOfWeek);

            return (
              <DayCell
                key={date.toISOString()}
                date={date}
                dayIndex={dayOfWeek}
                dayName={DAYS[dayOfWeek]}
                isToday={isToday}
                orixáData={orixáData}
                lunarPhase={lunarPhase}
                status={status}
                userOdu={userOduName}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-700/30">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
          <span className="text-[10px] text-slate-400">Favorável</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-600"></span>
          <span className="text-[10px] text-slate-400">Precaução</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-600"></span>
          <span className="text-[10px] text-slate-400">Neutro</span>
        </div>
      </div>
    </div>
  );
}