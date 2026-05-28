'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Flame,
  Droplets,
  Wind,
  Heart,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

type RitualType = 'ebó' | 'banho' | 'defumacao' | 'oracao' | 'firmeza';

export interface RitualCalendarEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  type: RitualType;
  orixa?: string;
  completed?: boolean;
}

interface RitualCalendarProps {
  entries?: RitualCalendarEntry[];
  onEntryClick?: (entry: RitualCalendarEntry) => void;
  onEntrySave?: (entry: RitualCalendarEntry) => void;
  onEntryDelete?: (id: string) => void;
  className?: string;
}

const RITUAL_ICONS: Record<RitualType, typeof Flame> = {
  ebó: Flame,
  banho: Droplets,
  defumacao: Wind,
  oracao: Heart,
  firmeza: Sparkles,
};

const RITUAL_COLORS: Record<RitualType, string> = {
  ebó: 'bg-amber-500/20 border-amber-500 text-amber-400',
  banho: 'bg-blue-500/20 border-blue-500 text-blue-400',
  defumacao: 'bg-purple-500/20 border-purple-500 text-purple-400',
  oracao: 'bg-rose-500/20 border-rose-500 text-rose-400',
  firmeza: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
};

const RITUAL_LABELS: Record<RitualType, string> = {
  ebó: 'Ebó',
  banho: 'Banho',
  defumacao: 'Defumação',
  oracao: 'Oração',
  firmeza: 'Firmeza',
};

const DEFAULT_ENTRIES: RitualCalendarEntry[] = [
  {
    id: '1',
    title: 'Ebó de Limpeza',
    description: 'Ritual de proteção e limpeza energética',
    date: '2026-05-28',
    type: 'ebó',
    orixa: 'Ogum',
    completed: false,
  },
  {
    id: '2',
    title: 'Banho de Ervas',
    description: 'Banho de abertura espiritual',
    date: '2026-05-30',
    type: 'banho',
    orixa: 'Oxum',
    completed: false,
  },
  {
    id: '3',
    title: 'Defumação com Alecrim',
    description: 'Purificação do ambiente',
    date: '2026-06-02',
    type: 'defumacao',
    completed: true,
  },
  {
    id: '4',
    title: 'Oração de Iansã',
    description: 'Oração especial para o dia de Iansã',
    date: '2026-06-08',
    type: 'oracao',
    orixa: 'Iansã',
    completed: false,
  },
  {
    id: '5',
    title: 'Firmeza de Oxossi',
    description: 'Ritual de firmeza e prosperidade',
    date: '2026-06-15',
    type: 'firmeza',
    orixa: 'Oxossi',
    completed: false,
  },
];

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(dateString: string): string {
  const date = parseDate(dateString);
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${day} de ${month}`;
}

function getRitualColor(type: RitualType): string {
  return RITUAL_COLORS[type] || RITUAL_COLORS['ebó'];
}

function getRitualLabel(type: RitualType): string {
  return RITUAL_LABELS[type] || type;
}

function getRitualIcon(type: RitualType) {
  return RITUAL_ICONS[type] || Flame;
}

export function RitualCalendar({
  entries = DEFAULT_ENTRIES,
  onEntryClick,
  onEntrySave,
  onEntryDelete,
  className = '',
}: RitualCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localEntries, setLocalEntries] = useState<RitualCalendarEntry[]>(entries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RitualCalendarEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, RitualCalendarEntry[]> = {};
    localEntries.forEach((entry) => {
      if (!map[entry.date]) {
        map[entry.date] = [];
      }
      map[entry.date].push(entry);
    });
    return map;
  }, [localEntries]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDateClick = useCallback((day: number | null) => {
    if (day === null) return;
    const date = new Date(year, month, day);
    const dateString = formatDate(date);
    setSelectedDate(dateString);
    setEditingEntry(null);
    setIsModalOpen(true);
  }, [year, month]);

  const handleEntryClick = useCallback((entry: RitualCalendarEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry);
    setSelectedDate(entry.date);
    setIsModalOpen(true);
    onEntryClick?.(entry);
  }, [onEntryClick]);

  const handleSaveEntry = useCallback((entry: RitualCalendarEntry) => {
    setLocalEntries((prev) => {
      const existingIndex = prev.findIndex((e) => e.id === entry.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = entry;
        return updated;
      }
      return [...prev, entry];
    });
    setIsModalOpen(false);
    setEditingEntry(null);
    onEntrySave?.(entry);
  }, [onEntrySave]);

  const handleDeleteEntry = useCallback((id: string) => {
    setLocalEntries((prev) => prev.filter((e) => e.id !== id));
    setIsModalOpen(false);
    setEditingEntry(null);
    onEntryDelete?.(id);
  }, [onEntryDelete]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setSelectedDate(null);
  }, []);

  const isToday = (day: number | null): boolean => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const todayEntries = useMemo(() => {
    const todayStr = formatDate(new Date());
    return localEntries.filter((e) => e.date === todayStr);
  }, [localEntries]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-100">
              <Calendar className="h-5 w-5" />
              Calendário de Rituais
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/10"
              >
                Hoje
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[140px] text-center text-sm font-medium text-amber-100">
                  {MONTHS[month]} {year}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-8 w-8 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {todayEntries.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300 mb-2 font-medium">Rituais de hoje</p>
              <div className="flex flex-wrap gap-2">
                {todayEntries.map((entry) => {
                  const Icon = getRitualIcon(entry.type);
                  return (
                    <Badge
                      key={entry.id}
                      className={`${getRitualColor(entry.type)} flex items-center gap-1`}
                    >
                      <Icon className="h-3 w-3" />
                      {entry.title}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-amber-300/60 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateStr = day !== null ? formatDate(new Date(year, month, day)) : null;
              const dayEntries = dateStr ? entriesByDate[dateStr] || [] : [];
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={day === null}
                  className={`
                    relative min-h-[60px] p-1 rounded-lg border transition-all
                    ${day === null ? 'border-transparent bg-transparent' : 'border-amber-500/20 bg-amber-950/20 hover:bg-amber-500/10 hover:border-amber-500/40'}
                    ${isCurrentDay ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400/50' : ''}
                  `}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`
                          block text-xs font-medium mb-1
                          ${isCurrentDay ? 'text-amber-100' : 'text-amber-300/70'}
                        `}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {dayEntries.slice(0, 2).map((entry) => {
                          const Icon = getRitualIcon(entry.type);
                          return (
                            <div
                              key={entry.id}
                              onClick={(e) => handleEntryClick(entry, e)}
                              className={`
                                flex items-center gap-1 px-1 py-0.5 rounded text-xs cursor-pointer
                                ${getRitualColor(entry.type)}
                                hover:opacity-80 transition-opacity
                              `}
                            >
                              <Icon className="h-2.5 w-2.5" />
                              <span className="truncate">{entry.title}</span>
                            </div>
                          );
                        })}
                        {dayEntries.length > 2 && (
                          <span className="text-[10px] text-amber-300/60 pl-1">
                            +{dayEntries.length - 2}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(RITUAL_COLORS) as RitualType[]).map((type) => {
              const Icon = getRitualIcon(type);
              return (
                <div
                  key={type}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${getRitualColor(type)}`}
                >
                  <Icon className="h-3 w-3" />
                  {getRitualLabel(type)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <RitualEntryModal
        isOpen={isModalOpen}
        entry={editingEntry}
        selectedDate={selectedDate}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}

interface RitualEntryModalProps {
  isOpen: boolean;
  entry: RitualCalendarEntry | null;
  selectedDate: string | null;
  onClose: () => void;
  onSave: (entry: RitualCalendarEntry) => void;
  onDelete: (id: string) => void;
}

function RitualEntryModal({
  isOpen,
  entry,
  selectedDate,
  onClose,
  onSave,
  onDelete,
}: RitualEntryModalProps) {
  const [formData, setFormData] = useState<Partial<RitualCalendarEntry>>({
    title: '',
    description: '',
    type: 'ebó',
    orixa: '',
  });
  const [dateStr, setDateStr] = useState(selectedDate || formatDate(new Date()));

  useState(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        description: entry.description,
        type: entry.type,
        orixa: entry.orixa || '',
      });
      setDateStr(entry.date);
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'ebó',
        orixa: '',
      });
      setDateStr(selectedDate || formatDate(new Date()));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const savedEntry: RitualCalendarEntry = {
      id: entry?.id || `ritual-${Date.now()}`,
      title: formData.title || '',
      description: formData.description || '',
      date: dateStr,
      type: formData.type || 'ebó',
      orixa: formData.orixa || undefined,
      completed: entry?.completed || false,
    };

    onSave(savedEntry);
  };

  const handleDelete = () => {
    if (entry?.id) {
      onDelete(entry.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-amber-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-100">
            {entry ? (
              <>
                <Edit className="h-4 w-4" />
                Editar Ritual
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Novo Ritual
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-amber-300/70 mb-1 block">Data</label>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-zinc-800 border-amber-500/30 text-amber-100"
            />
          </div>

          <div>
            <label className="text-xs text-amber-300/70 mb-1 block">Título</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nome do ritual"
              className="bg-zinc-800 border-amber-500/30 text-amber-100 placeholder:text-zinc-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-amber-300/70 mb-1 block">Tipo</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(RITUAL_COLORS) as RitualType[]).map((type) => {
                const Icon = getRitualIcon(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
                      ${formData.type === type ? getRitualColor(type) + ' ring-1 ring-current' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-amber-500/30'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px]">{getRitualLabel(type)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-amber-300/70 mb-1 block">Orixá (opcional)</label>
            <Input
              value={formData.orixa || ''}
              onChange={(e) => setFormData({ ...formData, orixa: e.target.value })}
              placeholder="Ex: Ogum, Oxum, Iansã..."
              className="bg-zinc-800 border-amber-500/30 text-amber-100 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="text-xs text-amber-300/70 mb-1 block">Descrição</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do ritual..."
              rows={3}
              className="bg-zinc-800 border-amber-500/30 text-amber-100 placeholder:text-zinc-500 resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            {entry && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-medium"
            >
              {entry ? 'Salvar' : 'Criar Ritual'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RitualCalendar;