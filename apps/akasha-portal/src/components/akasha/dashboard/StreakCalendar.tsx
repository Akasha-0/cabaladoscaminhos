'use client';

import { FadeInUp, pulse } from '../animations';
import { CalendarDay } from './CalendarDay';
import type { StreakDay } from './index';
import { motion } from 'framer-motion';

interface StreakCalendarProps {
  streak: StreakDay[];
  loading?: boolean;
}

function getWeekDays(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function SkeletonCalendar() {
  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-6 h-3 bg-[#0B0E1C]/60 rounded animate-pulse" />
          <motion.div
            animate={pulse}
            className="w-10 h-10 bg-[#0B0E1C]/60 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

export function StreakCalendar({ streak, loading }: StreakCalendarProps) {
  const weekDays = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayIndex = weekDays.findIndex(
    (d) => d.getTime() === today.getTime()
  );

  const streakMap = new Map(streak.map((s) => [s.date, s]));

  return (
    <FadeInUp className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">Esta Semana</h3>
        {todayIndex !== -1 && (
          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
            Hoje
          </span>
        )}
      </div>

      {loading ? (
        <SkeletonCalendar />
      ) : (
        <div className="flex justify-between gap-2">
          {weekDays.map((date) => {
            const dateKey = formatDateKey(date);
            const streakDay = streakMap.get(dateKey);
            const isToday = date.getTime() === today.getTime();

            return (
              <CalendarDay
                key={dateKey}
                date={date}
                completed={streakDay?.completed ?? false}
                isToday={isToday}
                ritualType={streakDay?.ritualType}
              />
            );
          })}
        </div>
      )}
    </FadeInUp>
  );
}
