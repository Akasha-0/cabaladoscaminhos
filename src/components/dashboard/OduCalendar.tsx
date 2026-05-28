'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Heart,
  Star,
  Moon,
  Sun,
  Flame,
  Shield,
  Crown,
} from 'lucide-react';
import { OduInfo } from '@/lib/odus/calculos';

export interface OduCalendarEntry {
  date: string;
  odu: OduInfo;
  pergunta?: string;
}

interface OduCalendarProps {
  entries?: OduCalendarEntry[];
  onDateClick?: (entry: OduCalendarEntry) => void;
  className?: string;
}

const orixaIcons: Record<string, React.ReactNode> = {
  'Oxum': <Sun className="w-3 h-3" />,
  'Oxossi': <Eye className="w-3 h-3" />,
  'Xango': <Flame className="w-3 h-3" />,
  'Iemanjá': <Moon className="w-3 h-3" />,
  'Ogum': <Shield className="w-3 h-3" />,
  'Obatala': <Star className="w-3 h-3" />,
  'Oxalá': <Crown className="w-3 h-3" />,
  'Exu': <Sparkles className="w-3 h-3" />,
  'Ibeji': <Heart className="w-3 h-3" />,
  'Iansã': <Flame className="w-3 h-3" />,
  'Omolu': <Star className="w-3 h-3" />,
  'Nanã': <Moon className="w-3 h-3" />,
  'Oxumaré': <Star className="w-3 h-3" />,
  'Obá': <Heart className="w-3 h-3" />,
  'Orunmilá': <Sparkles className="w-3 h-3" />,
};

const orixaColors: Record<string, string> = {
  'Oxum': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  'Oxossi': 'bg-green-500/20 text-green-600 border-green-500/30',
  'Xango': 'bg-red-500/20 text-red-600 border-red-500/30',
  'Iemanjá': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  'Ogum': 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  'Obatala': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  'Oxalá': 'bg-gray-100/20 text-gray-200 border-gray-300/30',
  'Exu': 'bg-black/20 text-gray-900 border-black/30',
  'Ibeji': 'bg-pink-500/20 text-pink-600 border-pink-500/30',
  'Iansã': 'bg-orange-600/20 text-orange-700 border-orange-600/30',
  'Omolu': 'bg-amber-600/20 text-amber-700 border-amber-600/30',
  'Nanã': 'bg-violet-500/20 text-violet-600 border-violet-500/30',
  'Oxumaré': 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  'Obá': 'bg-rose-500/20 text-rose-600 border-rose-500/30',
  'Orunmilá': 'bg-amber-400/20 text-amber-500 border-amber-400/30',
};

const oduColors: Record<number, string> = {
  1: 'from-orange-500/10 to-red-600/10 border-orange-500/30',
  2: 'from-blue-500/10 to-cyan-600/10 border-blue-500/30',
  3: 'from-red-500/10 to-orange-600/10 border-red-500/30',
  4: 'from-purple-500/10 to-pink-600/10 border-purple-500/30',
  5: 'from-yellow-500/10 to-amber-600/10 border-yellow-500/30',
  6: 'from-red-600/10 to-orange-700/10 border-red-600/30',
  7: 'from-amber-600/10 to-yellow-700/10 border-amber-600/30',
  8: 'from-gray-200/10 to-gray-400/10 border-gray-300/30',
  9: 'from-orange-600/10 to-red-700/10 border-orange-600/30',
  10: 'from-gray-100/10 to-gray-300/10 border-gray-200/30',
  11: 'from-red-400/10 to-orange-500/10 border-red-400/30',
  12: 'from-red-600/10 to-yellow-600/10 border-red-600/30',
  13: 'from-violet-500/10 to-purple-600/10 border-violet-500/30',
  14: 'from-cyan-500/10 to-teal-600/10 border-cyan-500/30',
  15: 'from-orange-700/10 to-red-800/10 border-orange-700/30',
  16: 'from-amber-300/10 to-yellow-400/10 border-amber-300/30',
};

const MOCK_ENTRIES: OduCalendarEntry[] = [
  {
    date: '2024-05-01',
    odu: { numero: 8, nome: 'EjiOníle', significado: 'A cabeça (Ori), a liderança.', elementos: 'Ar/Água', orixaRegente: 'Oxalá', quizilas: [], preceitos: [], ebos: [] },
    pergunta: 'Qual caminho seguir no trabalho?',
  },
  {
    date: '2024-05-05',
    odu: { numero: 3, nome: 'Etaogundá', significado: 'A revolta, a força.', elementos: 'Fogo/Terra', orixaRegente: 'Ogum', quizilas: [], preceitos: [], ebos: [] },
    pergunta: 'Devo aceitar a proposta?',
  },
  {
    date: '2024-05-12',
    odu: { numero: 15, nome: 'Ogbogbé', significado: 'A feitiçaria.', elementos: 'Fogo/Terra', orixaRegente: 'Obá', quizilas: [], preceitos: [], ebos: [] },
  },
  {
    date: '2024-05-18',
    odu: { numero: 11, nome: 'Owarin', significado: 'A pressa.', elementos: 'Fogo/Ar', orixaRegente: 'Iansã', quizilas: [], preceitos: [], ebos: [] },
    pergunta: 'Como melhorar meus relacionamentos?',
  },
  {
    date: '2024-05-25',
    odu: { numero: 16, nome: 'Alafia', significado: 'A paz absoluta.', elementos: 'Ar/Luz', orixaRegente: 'Orunmilá', quizilas: [], preceitos: [], ebos: [] },
  },
];

function getOrixaColor(orixa: string): string {
  return orixaColors[orixa] || orixaColors['Oxalá'];
}

function getOduColor(numero: number): string {
  return oduColors[numero] || oduColors[1];
}

function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function OduCalendar({ entries = MOCK_ENTRIES, onDateClick, className }: OduCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1));
  const [selectedEntry, setSelectedEntry] = useState<OduCalendarEntry | null>(null);

  const entriesMap = useMemo(() => {
    const map = new Map<string, OduCalendarEntry>();
    entries.forEach(entry => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<{ date: Date; isCurrentMonth: boolean; entry: OduCalendarEntry | null }> = [];

    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, entry: entriesMap.get(formatDateKey(date)) || null });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true, entry: entriesMap.get(formatDateKey(date)) || null });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, entry: entriesMap.get(formatDateKey(date)) || null });
    }

    return days;
  }, [currentDate, entriesMap]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(2024, 4, 1));
  }, []);

  function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleDayClick = (entry: OduCalendarEntry | null, date: Date) => {
    if (entry) {
      setSelectedEntry(entry);
      onDateClick?.(entry);
    }
  };

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Calendário de Odús</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Hoje
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-lg">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const hasEntry = day.entry !== null;
              const isToday = day.date.getDate() === 15 && day.date.getMonth() === 4;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day.entry, day.date)}
                  disabled={!hasEntry}
                  className={`
                    relative aspect-square p-1 rounded-lg text-xs
                    transition-all duration-200
                    ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}
                    ${hasEntry ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer border border-primary/30' : 'hover:bg-muted/50'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <span className="block font-medium">{day.date.getDate()}</span>
                  {hasEntry && (
                    <div className="absolute bottom-0.5 left-0 right-0 flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[8px] px-1 py-0 h-4 ${getOrixaColor(day.entry!.odu.orixaRegente)}`}
                      >
                        <span className="mr-0.5">{orixaIcons[day.entry!.odu.orixaRegente]}</span>
                        {day.entry!.odu.numero}
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedEntry && (
            <div className={`mt-4 p-4 rounded-lg border bg-gradient-to-br ${getOduColor(selectedEntry.odu.numero)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getOrixaColor(selectedEntry.odu.orixaRegente)}`}>
                  <span className="mr-1">{orixaIcons[selectedEntry.odu.orixaRegente]}</span>
                  {selectedEntry.odu.orixaRegente}
                </Badge>
                <Badge variant="outline" className="bg-background/50">
                  Odú {selectedEntry.odu.numero}: {selectedEntry.odu.nome}
                </Badge>
              </div>
              <p className="text-sm text-foreground/90">{selectedEntry.odu.significado}</p>
              {selectedEntry.pergunta && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  &ldquo;{selectedEntry.pergunta}&rdquo;
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {formatarData(selectedEntry.date)}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {entries.length} consulta{entries.length !== 1 ? 's' : ''} registrada{entries.length !== 1 ? 's' : ''} este mês
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}