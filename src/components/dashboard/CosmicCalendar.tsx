'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getCosmicEvents,
  type CosmicEvent,
} from '@/lib/cosmic/calendar';
import {
  Calendar,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Sun,
  Zap,
  Circle,
  Maximize2,
} from 'lucide-react';

interface CosmicCalendarProps {
  className?: string;
}

const MOON_PHASE_ICONS: Record<string, React.ReactNode> = {
  'Nova': <Circle className="w-4 h-4" />,
  'Crescente': <Moon className="w-4 h-4 rotate-90" />,
  'Gibosa Crescente': <Moon className="w-4 h-4 rotate-180" />,
  'Cheia': <Moon className="w-4 h-4" />,
  'Gibosa Minguante': <Moon className="w-4 h-4 -rotate-180" />,
  'Minguante': <Moon className="w-4 h-4 -rotate-90" />,
  'Creciente': <Moon className="w-4 h-4 rotate-90" />,
};

const ASPECT_COLORS: Record<string, string> = {
  'Conjunção': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Sextil': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Quadratura': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Tríno': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Oposição': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CosmicCalendar({ className = '' }: CosmicCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'events'>('calendar');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const cosmicEvents = useMemo(
    () => getCosmicEvents(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CosmicEvent[]> = {};
    cosmicEvents.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [cosmicEvents]);

  const moonPhases = useMemo(() => {
    const phases = new Map<string, CosmicEvent>();
    cosmicEvents
      .filter((e) => e.type === 'moon_phase')
      .forEach((e) => phases.set(e.date, e));
    return phases;
  }, [cosmicEvents]);

  const aspects = useMemo(
    () => cosmicEvents.filter((e) => e.type === 'aspect'),
    [cosmicEvents]
  );

  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasMoon: boolean;
      hasAspects: boolean;
    }> = [];

    const today = new Date();

    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month - 1, -startPadding + i + 1);
      const dateStr = formatDateStr(date);
      days.push({
        date,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasMoon: false,
        hasAspects: false,
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month - 1, d);
      const dateStr = formatDateStr(date);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const events = eventsByDate[dateStr] || [];
      days.push({
        date,
        dateStr,
        isCurrentMonth: true,
        isToday,
        isSelected: selectedDate === dateStr,
        hasMoon: events.some((e) => e.type === 'moon_phase'),
        hasAspects: events.some((e) => e.type === 'aspect'),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDateStr(date);
      days.push({
        date,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasMoon: false,
        hasAspects: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDate, eventsByDate]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[selectedDate] || [];
  }, [selectedDate, eventsByDate]);

  function formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function navigateMonth(delta: number) {
    const newDate = new Date(currentYear, currentMonth - 1 + delta, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  }

  const aspectCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Conjunção: 0,
      Sextil: 0,
      Quadratura: 0,
      Tríno: 0,
      Oposição: 0,
    };
    aspects.forEach((a) => {
      const name = a.title;
      if (name in counts) counts[name]++;
    });
    return counts;
  }, [aspects]);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Calendário Cósmico</CardTitle>
              <p className="text-xs text-muted-foreground">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="calendar" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Eventos ({cosmicEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-muted-foreground py-1"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const events = eventsByDate[day.dateStr] || [];
                const moonPhase = events.find((e) => e.type === 'moon_phase');
                const aspectCount = events.filter((e) => e.type === 'aspect').length;

                return (
                  <button
                    key={idx}
                    onClick={() => day.isCurrentMonth && handleDayClick(day.dateStr)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      relative aspect-square rounded-lg text-xs p-1 transition-all
                      ${day.isCurrentMonth ? 'hover:bg-accent cursor-pointer' : 'text-muted-foreground/30 cursor-default'}
                      ${day.isToday ? 'bg-violet-600 text-white' : ''}
                      ${day.isSelected ? 'ring-2 ring-violet-500' : ''}
                      ${!day.isCurrentMonth ? 'opacity-30' : ''}
                    `}
                  >
                    <span className="block">{day.date.getDate()}</span>
                    {day.isCurrentMonth && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        {moonPhase && (
                          <Moon className="w-3 h-3 text-cyan-400" />
                        )}
                        {aspectCount > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-muted-foreground">Fase lunar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Aspectos</span>
              </div>
            </div>

            {selectedDate && selectedDayEvents.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-accent/50 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                {selectedDayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs"
                  >
                    {event.type === 'moon_phase' ? (
                      <Moon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-muted-foreground text-[10px]">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(aspectCounts).map(([name, count]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${ASPECT_COLORS[name]}`}
                >
                  <span>{name}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {aspects.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum aspecto planetary este mês
                </p>
              ) : (
                aspects.map((aspect, idx) => {
                  const dayEvents = eventsByDate[aspect.date] || [];
                  const moonPhase = dayEvents.find((e) => e.type === 'moon_phase');

                  return (
                    <div
                      key={idx}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg border
                        ${ASPECT_COLORS[aspect.title] || 'bg-accent/50 border-border'}
                      `}
                    >
                      <div className="shrink-0 mt-0.5">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{aspect.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(aspect.date).getDate()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {aspect.description}
                        </p>
                        {moonPhase && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Moon className="w-3 h-3 text-cyan-400" />
                            <span>{moonPhase.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-3.5 h-3.5" />
                Fases da Lua
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {moonPhases.size > 0 ? (
                  Array.from(moonPhases.entries()).map(([date, event]) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-2 rounded-lg border text-center transition-all
                        ${selectedDate === date ? 'bg-violet-600 border-violet-600' : 'hover:bg-accent border-border'}
                      `}
                    >
                      {MOON_PHASE_ICONS[event.title] || <Moon className="w-4 h-4" />}
                      <p className="text-xs mt-1 font-medium truncate">
                        {new Date(date).getDate()}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {event.title}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="col-span-4 text-xs text-muted-foreground text-center py-2">
                    Nenhuma fase lunar este mês
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}