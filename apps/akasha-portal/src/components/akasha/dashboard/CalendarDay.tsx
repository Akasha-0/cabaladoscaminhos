'use client';

import { PulseDiv } from '../animations';

interface CalendarDayProps {
  date: Date;
  completed: boolean;
  isToday: boolean;
  ritualType?: string;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarDay({ date, completed, isToday, ritualType }: CalendarDayProps) {
  const dayNumber = date.getDate();
  const weekday = WEEKDAY_LABELS[date.getDay()];

  const formatDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  const dayContent = (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-white/40">{weekday}</span>
      <div
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-full
          font-medium text-sm transition-all duration-200
          ${completed
            ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
            : 'bg-[#0B0E1C]/60 text-white/50 border-2 border-white/10'
          }
          ${isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#06070F]' : ''}
        `}
        title={ritualType ? `${formatDate(date)} - ${ritualType}` : formatDate(date)}
      >
        {dayNumber}
      </div>
    </div>
  );

  if (isToday) {
    return (
      <PulseDiv className="relative group cursor-default">
        {dayContent}
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2 py-1 bg-[#0B0E1C] text-xs text-white/70 rounded
          opacity-0 group-hover:opacity-100 transition-opacity
          pointer-events-none whitespace-nowrap z-10
          border border-white/10
        ">
          {formatDate(date)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B0E1C]" />
        </div>
      </PulseDiv>
    );
  }

  return (
    <div className="relative group cursor-default">
      {dayContent}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 bg-[#0B0E1C] text-xs text-white/70 rounded
        opacity-0 group-hover:opacity-100 transition-opacity
        pointer-events-none whitespace-nowrap z-10
        border border-white/10
      ">
        {formatDate(date)}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0B0E1C]" />
      </div>
    </div>
  );
}
