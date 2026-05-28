'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getCorrespondenciasDia,
  diasSemana,
  type DiaSemanaData,
} from '@/lib/data/spiritual-data';
import {
  Calendar,
  Moon,
  Sun,
  Star,
  Zap,
  Heart,
  Crown,
  Eye,
  Droplets,
  Flame,
  Mountain,
  Wind,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CalendarioEspiritualProps {
  className?: string;
  loading?: boolean;
}

const CHAKRA_ICONS: Record<string, React.ReactNode> = {
  '1º Básico': <Mountain className="w-4 h-4 text-red-500" />,
  '2º Sacro': <Droplets className="w-4 h-4 text-orange-500" />,
  '3º Plexo Solar': <Flame className="w-4 h-4 text-yellow-500" />,
  '4º Cardíaco': <Heart className="w-4 h-4 text-green-500" />,
  '5º Laríngeo': <Wind className="w-4 h-4 text-blue-500" />,
  '6º Frontal': <Eye className="w-4 h-4 text-indigo-500" />,
  '7º Coronário': <Crown className="w-4 h-4 text-violet-500" />,
};

export function CalendarioEspiritual({ className, loading = false }: CalendarioEspiritualProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const hoje = useMemo(() => new Date(), []);
  const correspondencias = useMemo(() => getCorrespondenciasDia(), []);

  const faseAtual = useMemo(() => {
    const faseIndex = Math.floor((hoje.getDate() % 30) / 7.5);
    return ['Lua Nova', 'Lua Crescente', 'Lua Cheia', 'Lua Minguante'][faseIndex];
  }, [hoje]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month, -startPadding + i + 1);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === hoje.toDateString();
      days.push({ date, isCurrentMonth: true, isToday });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [currentDate, hoje]);

  const getSpiritualDataForDate = (date: Date): DiaSemanaData | null => {
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayKey = dayNames[date.getDay()];
    return diasSemana[dayKey] || null;
  };

  const selectedData = selectedDate ? getSpiritualDataForDate(selectedDate) : null;
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const hojeSpiritual = correspondencias.dia;

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleCalendarKeyDown = useCallback((e: React.KeyboardEvent, day: { date: Date; isCurrentMonth: boolean }, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index - 1;
        break;
      case 'ArrowRight':
        newIndex = index + 1;
        break;
      case 'ArrowUp':
        newIndex = index - 7;
        break;
      case 'ArrowDown':
        newIndex = index + 7;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = 41;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedDate(day.date);
        return;
      default:
        return;
    }

    e.preventDefault();
    newIndex = Math.max(0, Math.min(41, newIndex));
    setFocusedIndex(newIndex);

    // Focus the new button after state update
    setTimeout(() => {
      const buttons = gridRef.current?.querySelectorAll('button[role="gridcell"]');
      if (buttons && buttons[newIndex]) {
        (buttons[newIndex] as HTMLButtonElement).focus();
      }
    }, 0);
  }, []);

  const getDateAriaLabel = (date: Date, spiritualData: DiaSemanaData | null) => {
    const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const parts = [dateStr];
    
    if (date.toDateString() === new Date().toDateString()) {
      parts.push('Hoje');
    }
    if (spiritualData?.orixas.length) {
      parts.push(`Orixás: ${spiritualData.orixas.join(', ')}`);
    }
    if (spiritualData?.planetas.length) {
      parts.push(`Planetas: ${spiritualData.planetas.join(', ')}`);
    }
    if (spiritualData?.chakras.length) {
      parts.push(`Chakras: ${spiritualData.chakras.join(', ')}`);
    }
    
    return parts.join('. ');
  };

  return (
    <div className={className}>
      <Tabs defaultValue="day" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList aria-label="Visualização do calendário">
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="day">Dia</TabsTrigger>
          </TabsList>

          {selectedData && (
            <Badge variant="outline" className="text-sm" aria-live="polite">
              {selectedData.dia}
            </Badge>
          )}
        </div>

        <TabsContent value="month" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousMonth}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-4">
              <h3 
                className="font-medium"
                aria-live="polite"
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToToday}
                aria-label="Ir para hoje"
              >
                Hoje
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          <div
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label={`Calendário espiritual de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            ref={gridRef}
          >
            <div role="row" className="contents">
              {weekDays.map((day) => (
                <div 
                  key={day} 
                  className="text-center text-xs text-muted-foreground font-medium py-2"
                  role="columnheader"
                  aria-label={day}
                >
                  {day}
                </div>
              ))}
            </div>
            {loading ? (
              <>
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" aria-hidden="true" />
                ))}
              </>
            ) : (
              <div role="row" className="contents">
                {calendarDays.map((day, index) => {
                  const spiritualData = getSpiritualDataForDate(day.date);
                  const hasOrixas = spiritualData && spiritualData.orixas.length > 0;
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      onKeyDown={(e) => handleCalendarKeyDown(e, day, index)}
                      className={`
                        aspect-square p-1 text-sm rounded-md transition-colors
                        ${day.isCurrentMonth ? '' : 'text-muted-foreground'}
                        ${day.isToday ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                      `}
                      aria-label={getDateAriaLabel(day.date, spiritualData)}
                      aria-selected={isSelected}
                      aria-current={day.isToday ? 'date' : undefined}
                      role="gridcell"
                      tabIndex={focusedIndex === index || (focusedIndex === null && index === 0) ? 0 : -1}
                    >
                      <div className="flex flex-col items-center">
                        <span>{day.date.getDate()}</span>
                        {hasOrixas && spiritualData && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="week">
          {loading ? (
            <div className="grid grid-cols-7 gap-2" role="list" aria-label="Carregando dias da semana">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="p-2 rounded-lg border bg-card" role="listitem">
                  <Skeleton className="h-4 w-8 mx-auto mb-2" />
                  <Skeleton className="h-3 w-10 mx-auto mb-2" />
                  <Skeleton className="h-4 w-4 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2" role="list" aria-label="Dias da semana">
              {weekDays.map((day, index) => {
                const fullDayName = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][index];
                const data = diasSemana[fullDayName];
                const isToday = hoje.getDay() === index;

                return (
                  <Card 
                    key={day} 
                    className={isToday ? 'border-primary' : ''}
                    role="listitem"
                    aria-label={`${day}${isToday ? ', hoje' : ''}`}
                  >
                    <CardHeader className="p-2 text-center">
                      <CardTitle className="text-xs">{day}</CardTitle>
                      {data && data.planetas.length > 0 && (
                        <Badge variant="outline" className="text-xs mx-auto" aria-label={`Planeta: ${data.planetas[0]}`}>
                          {data.planetas[0]}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-2 text-center">
                      {data && data.chakras.length > 0 && (
                        <div className="flex justify-center mb-1" aria-label={`Chakra: ${data.chakras[0]}`}>
                          {CHAKRA_ICONS[data.chakras[0]]}
                        </div>
                      )}
                      {data && data.cores.length > 0 && (
                        <p className="text-xs text-muted-foreground" aria-label={`Cor: ${data.cores[0]}`}>{data.cores[0]}</p>
                      )}
                      {data && data.orixas.length > 0 && (
                        <p className="text-xs font-medium mt-1 truncate" aria-label={`Orixá: ${data.orixas[0]}`}>
                          {data.orixas[0]}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="day">
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-3 bg-card rounded-lg border">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-6 w-20" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card aria-label={`Informações espirituais do dia: ${hojeSpiritual.dia}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  <span>{hojeSpiritual.dia}</span>
                  <Badge variant="outline" className="ml-auto" aria-label={`Fase lunar: ${faseAtual}`}>
                    {faseAtual}
                  </Badge>
                </CardTitle>
                <CardDescription aria-live="polite">
                  {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-card rounded-lg border" aria-label="Planetas do dia">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-primary" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Planetas</span>
                    </div>
                    <div className="flex gap-1 flex-wrap" role="list">
                      {hojeSpiritual.planetas.map((p) => (
                        <span key={p} className="font-medium text-sm" role="listitem">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-card rounded-lg border" aria-label="Cores do dia">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Cores</span>
                    </div>
                    <div className="flex gap-1 flex-wrap" role="list">
                      {hojeSpiritual.cores.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs" role="listitem">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-card rounded-lg border" aria-label="Chakras do dia">
                    <div className="flex items-center gap-2 mb-2">
                      {CHAKRA_ICONS[hojeSpiritual.chakras[0]] || <Crown className="w-4 h-4" aria-hidden="true" />}
                      <span className="text-xs text-muted-foreground">Chakras</span>
                    </div>
                    <div className="flex gap-1 flex-wrap" role="list">
                      {hojeSpiritual.chakras.map((c) => (
                        <span key={c} className="font-medium text-xs" role="listitem">{c}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-card rounded-lg border" aria-label="Sephirot do dia">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-violet-500" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Sephirot</span>
                    </div>
                    <div className="flex gap-1 flex-wrap" role="list">
                      {hojeSpiritual.sephirot.map((s) => (
                        <span key={s} className="font-medium text-xs" role="listitem">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div aria-label="Orixás do dia">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                    Orixás do Dia
                  </h4>
                  <div className="flex flex-wrap gap-2" role="list">
                    {hojeSpiritual.orixas.map((orixa) => (
                      <Badge key={orixa} variant="secondary" role="listitem">
                        {orixa}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20" aria-label="Arcano do dia">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-medium mb-1">Arcano do Dia</h4>
                      <p className="text-sm text-muted-foreground">{hojeSpiritual.arcano}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/50 rounded-lg" aria-label={`Mistério: ${hojeSpiritual.misterio}`}>
                    <h5 className="text-sm font-medium mb-1">Mistério</h5>
                    <p className="text-xs text-muted-foreground">{hojeSpiritual.misterio}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg" aria-label={`Número Tântrico: ${hojeSpiritual.numTantrico}`}>
                    <h5 className="text-sm font-medium mb-1">Número Tântrico</h5>
                    <p className="text-sm font-bold">{hojeSpiritual.numTantrico}</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg" aria-label={`Número Cabalístico: ${hojeSpiritual.numCabalistico}`}>
                  <h5 className="text-sm font-medium mb-1">Número Cabalístico</h5>
                  <p className="text-sm font-bold">{hojeSpiritual.numCabalistico}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}