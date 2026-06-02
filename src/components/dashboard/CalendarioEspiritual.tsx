'use client';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Moon,
  Sun,
  Sparkles,
  Heart,
  Flame,
  Droplets,
  Wind,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import SacredCornerSVG from '@/components/ui/SacredCornerSVG';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarioEspiritualProps {
  className?: string;
  loading?: boolean;
}

type SpiritualEventType = 'ritual' | 'meditacao' | 'oracao' | 'limpeza' | 'celebracao';

interface SpiritualDate {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: SpiritualEventType;
  significance?: string;
}

const EVENT_ICONS: Record<SpiritualEventType, React.ReactNode> = {
  ritual: <Sparkles className="w-4 h-4" />,
  meditacao: <Moon className="w-4 h-4" />,
  oracao: <Heart className="w-4 h-4" />,
  limpeza: <Wind className="w-4 h-4" />,
  celebracao: <Sun className="w-4 h-4" />,
};

const EVENT_COLORS: Record<SpiritualEventType, string> = {
  ritual: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  meditacao: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  oracao: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  limpeza: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  celebracao: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const EVENT_LABELS: Record<SpiritualEventType, string> = {
  ritual: 'Ritual',
  meditacao: 'Meditação',
  oracao: 'Oração',
  limpeza: 'Limpeza',
  celebracao: 'Celebração',
};

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SPIRITUAL_DATES: SpiritualDate[] = [
  {
    id: '1',
    date: new Date(new Date().getFullYear(), 0, 1),
    title: 'Ano Novo Espiritual',
    description: 'Início de um novo ciclo de crescimento espiritual',
    type: 'celebracao',
    significance: 'Novos começos e intenções',
  },
  {
    id: '2',
    date: new Date(new Date().getFullYear(), 0, 6),
    title: 'Dia dos Reis Magos',
    description: 'Celebração da sabedoria divina',
    type: 'celebracao',
    significance: 'Busca por conhecimento',
  },
  {
    id: '3',
    date: new Date(new Date().getFullYear(), 1, 2),
    title: 'Dia de Iemanjá',
    description: 'Homenagem à Rainha do Mar',
    type: 'ritual',
    significance: 'Proteção e maternidade',
  },
  {
    id: '4',
    date: new Date(new Date().getFullYear(), 3, 22),
    title: 'Páscoa',
    description: 'Ressurreição e renovação',
    type: 'celebracao',
    significance: 'Renascimento espiritual',
  },
  {
    id: '5',
    date: new Date(new Date().getFullYear(), 4, 13),
    title: 'Dia de Oxum',
    description: 'Celebração da energia do ouro',
    type: 'ritual',
    significance: 'Prosperidade e amor',
  },
  {
    id: '6',
    date: new Date(new Date().getFullYear(), 5, 24),
    title: 'São João',
    description: 'Festa junina com tradições espirituais',
    type: 'celebracao',
    significance: 'Comunidade e alegria',
  },
  {
    id: '7',
    date: new Date(new Date().getFullYear(), 6, 15),
    title: 'Festa do Divino',
    description: 'Celebração do Espírito Santo',
    type: 'ritual',
    significance: 'Espiritualidade e tradição',
  },
  {
    id: '8',
    date: new Date(new Date().getFullYear(), 7, 27),
    title: 'Dia de Ogum',
    description: 'Homenagem ao Deus da Guerra',
    type: 'ritual',
    significance: 'Força e determinação',
  },
  {
    id: '9',
    date: new Date(new Date().getFullYear(), 8, 8),
    title: 'Dia de Oxalá',
    description: 'Celebração da paz e criação',
    type: 'ritual',
    significance: 'Pureza e novos começos',
  },
  {
    id: '10',
    date: new Date(new Date().getFullYear(), 9, 15),
    title: 'Dia de Xango',
    description: 'Homenagem ao Deus da Justiça',
    type: 'ritual',
    significance: 'Justiça e equilíbrio',
  },
  {
    id: '11',
    date: new Date(new Date().getFullYear(), 10, 8),
    title: 'Dia de Obaluaê',
    description: 'Celebração da cura',
    type: 'ritual',
    significance: 'Saudação e cura',
  },
  {
    id: '12',
    date: new Date(new Date().getFullYear(), 11, 25),
    title: 'Natal Espiritual',
    description: 'Celebração do amor e luz',
    type: 'celebracao',
    significance: 'Luz e amor',
  },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getSpiritualEventForDate(
  year: number,
  month: number,
  day: number,
  events: SpiritualDate[]
): SpiritualDate | undefined {
  return events.find((event) => isSameDay(event.date, new Date(year, month, day)));
}

function getEventsInMonth(year: number, month: number, events: SpiritualDate[]): SpiritualDate[] {
  return events.filter(
    (event) => event.date.getFullYear() === year && event.date.getMonth() === month
  );
}

// Loading skeleton
function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="h-8 rounded skeleton-spiritual" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg skeleton-spiritual" />
        ))}
      </div>
    </div>
  );
}

export function CalendarioEspiritual({ className = '' }: CalendarioEspiritualProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SpiritualDate | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const monthEvents = useMemo(
    () => getEventsInMonth(currentYear, currentMonth, SPIRITUAL_DATES),
    [currentYear, currentMonth]
  );

  const calendarDays = useMemo(() => {
    const days: { day: number | null; event: SpiritualDate | undefined }[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, event: undefined });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const event = getSpiritualEventForDate(currentYear, currentMonth, day, SPIRITUAL_DATES);
      days.push({ day, event });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setCurrentDate(new Date());
  const handleEventClick = (event: SpiritualDate) => setSelectedEvent(event);
  const closeEventDetail = () => setSelectedEvent(null);

  return (
    <Card className={cn('card-spiritual relative overflow-hidden', className)}>
      {/* Sacred corner decorations */}
      <SacredCornerSVG className="sacred-corner sacred-corner-tl text-purple-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-tr text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-bl text-purple-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-br text-amber-500 hidden md:block" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-100">
              Calendário Espiritual
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-slate-400 hover:text-slate-100"
          >
            Hoje
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8 text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-base font-medium text-slate-100">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8 text-slate-400 hover:text-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => {
            if (item.day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isToday = isSameDay(new Date(currentYear, currentMonth, item.day), new Date());
            const hasEvent = !!item.event;

            return (
              <div
                key={`day-${item.day}`}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center rounded-lg',
                  'text-sm font-medium transition-all cursor-pointer',
                  'hover:bg-slate-800/80',
                  isToday
                    ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500/50'
                    : 'text-slate-300',
                  hasEvent && 'font-semibold'
                )}
                onClick={() => item.event && handleEventClick(item.event)}
              >
                <span>{item.day}</span>
                {hasEvent && <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-purple-500/70" />}
              </div>
            );
          })}
        </div>

        {/* Month events */}
        {monthEvents.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">
              Eventos de {MONTH_NAMES[currentMonth]}
            </h4>
            <div className="space-y-2">
              {monthEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border',
                    'transition-all text-left',
                    EVENT_COLORS[event.type]
                  )}
                >
                  {EVENT_ICONS[event.type]}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 truncate">{event.title}</p>
                    <p className="text-xs text-slate-400 truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-slate-400">{event.date.getDate()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {monthEvents.length === 0 && (
          <div className="mt-6 text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum evento espiritual neste mês</p>
          </div>
        )}
      </CardContent>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeEventDetail}
        >
          <div
            className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg border',
                    EVENT_COLORS[selectedEvent.type].split(' ').slice(0, 2).join(' ')
                  )}
                >
                  {EVENT_ICONS[selectedEvent.type]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selectedEvent.title}</h3>
                  <p className="text-sm text-slate-400">
                    {selectedEvent.date.getDate()} de {MONTH_NAMES[selectedEvent.date.getMonth()]}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeEventDetail}
                className="text-slate-400 hover:text-slate-100"
              >
                ×
              </Button>
            </div>

            <p className="text-slate-300 mb-4">{selectedEvent.description}</p>

            {selectedEvent.significance && (
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Significado</p>
                <p className="text-sm text-purple-300">{selectedEvent.significance}</p>
              </div>
            )}

            <Badge variant="outline" className={cn('mt-4', EVENT_COLORS[selectedEvent.type])}>
              {EVENT_LABELS[selectedEvent.type]}
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}

export default CalendarioEspiritual;
