'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Droplets, 
  Wind, 
  Moon, 
  Star, 
  Sun,
  Sparkles,
  Clock,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { diasSemana, type DiaSemanaData } from '@/lib/data/spiritual-data';

interface RitualSuggestion {
  id: string;
  title: string;
  description: string;
  icon: 'flame' | 'droplets' | 'wind' | 'moon' | 'star';
  orixa: string;
  duration: string;
}

interface DayPlan {
  dayKey: string;
  dayName: string;
  dayData: DiaSemanaData;
  rituals: RitualSuggestion[];
  completed: boolean[];
}

const RITUAL_ICONS = {
  flame: Flame,
  droplets: Droplets,
  wind: Wind,
  moon: Moon,
  star: Star
};

const COLORS_MAP: Record<string, string> = {
  amber: 'text-amber-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  green: 'text-green-400',
  white: 'text-gray-100',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
  cyan: 'text-cyan-400'
};

function getStreakData(): { [key: string]: boolean[] } {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('weekly-ritual-plan');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveStreakData(data: { [key: string]: boolean[] }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('weekly-ritual-plan', JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function generateWeeklyRituals(): DayPlan[] {
  const diasKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dayNames: Record<string, string> = {
    domingo: 'Domingo',
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado'
  };

  return diasKeys.map((key) => {
    const dayData = diasSemana[key];
    const rituals: RitualSuggestion[] = [];

    // Core ritual based on the day
    if (dayData.rituais?.length) {
      dayData.rituais.forEach((ritual, idx) => {
        rituals.push({
          id: `${key}-core-${idx}`,
          title: ritual,
          description: getRitualDescription(key, ritual),
          icon: getRitualIcon(key),
          orixa: dayData.orixa || 'Geral',
          duration: getRitualDuration(ritual)
        });
      });
    }

    // Add spiritual practice
    if (dayData.praticas) {
      rituals.push({
        id: `${key}-practice`,
        title: dayData.praticas,
        description: `Prática espiritual recomendada para ${dayNames[key]}`,
        icon: 'star',
        orixa: dayData.orixa || 'Geral',
        duration: '15-30 min'
      });
    }

    // Add a suggestion based on the day's energy
    const suggestion = getSuggestionForDay(key, dayData);
    if (suggestion) {
      rituals.push(suggestion);
    }

    return {
      dayKey: key,
      dayName: dayNames[key],
      dayData,
      rituals,
      completed: rituals.map(() => false)
    };
  });
}

function getRitualDescription(day: string, ritual: string): string {
  const descriptions: Record<string, string> = {
    'ebó': 'Ritual de limpeza energética para remover bloqueios',
    'defumação': 'Purificação do ambiente com ervas sagradas',
    'oração': 'Conexão espiritual para fortalecer a fé',
    'banho': 'Ritual de banho espiritual para renovação',
    'meditação': 'Prática de silêncio interior para alinhamento',
    'gratidão': 'Expressão de agradecimento pelas bênçãos'
  };

  const key = ritual.toLowerCase().split(' ')[0];
  return descriptions[key] || 'Ritual espiritual de conexão';
}

function getRitualIcon(day: string): 'flame' | 'droplets' | 'wind' | 'moon' | 'star' {
  const icons: Record<string, 'flame' | 'droplets' | 'wind' | 'moon' | 'star'> = {
    domingo: 'sun',
    segunda: 'moon',
    terca: 'flame',
    quarta: 'star',
    quinta: 'droplets',
    sexta: 'wind',
    sabado: 'moon'
  };
  return icons[day] || 'star';
}

function getRitualDuration(ritual: string): string {
  const durations: Record<string, string> = {
    'ebó': '30-60 min',
    'defumação': '15-20 min',
    'oração': '10-15 min',
    'banho': '20-30 min',
    'meditação': '15-30 min',
    'ritual': '45-60 min'
  };

  const key = ritual.toLowerCase().split(' ')[0];
  return durations[key] || '20-30 min';
}

function getSuggestionForDay(day: string, dayData: DiaSemanaData): RitualSuggestion | null {
  const suggestions: Record<string, RitualSuggestion> = {
    domingo: {
      id: 'sug-domingo',
      title: 'Energia Solar',
      description: 'Hora de energização sob o sol, visualize luz dourada preenchendo seu ser',
      icon: 'sun',
      orixa: 'Oxum',
      duration: '10-20 min'
    },
    segunda: {
      id: 'sug-segunda',
      title: 'Purificação Lunar',
      description: 'Ritual de limpeza sob a lua, carregue água com intenção de pureza',
      icon: 'moon',
      orixa: 'Iansã',
      duration: '15-25 min'
    },
    terca: {
      id: 'sug-terca',
      title: 'Ação e Coragem',
      description: 'Ative sua força interior, pratique afirmações de poder pessoal',
      icon: 'flame',
      orixa: 'Ogum',
      duration: '10-15 min'
    },
    quarta: {
      id: 'sug-quarta',
      title: 'Comunicação Sagrada',
      description: 'Escreva em seu diário espiritual, expresse seus pensamentos mais profundos',
      icon: 'star',
      orixa: 'Oxalá',
      duration: '20-30 min'
    },
    quinta: {
      id: 'sug-quinta',
      title: 'Abundância e Fertilidade',
      description: 'Visualize prosperidade fluindo, realize ritual de gratitude',
      icon: 'droplets',
      orixa: 'Oxum',
      duration: '15-20 min'
    },
    sexta: {
      id: 'sug-sexta',
      title: 'Amor e Conexão',
      description: 'Pratique autoamor, envie energia de amor aos que ama',
      icon: 'wind',
      orixa: 'Iemanjá',
      duration: '15-25 min'
    },
    sabado: {
      id: 'sug-sabado',
      title: 'Descanso e Reflexão',
      description: 'Dia de quietude, reserve tempo para contemplação e paz interior',
      icon: 'moon',
      orixa: 'Nanã',
      duration: '30-45 min'
    }
  };

  return suggestions[day] || null;
}

export function WeeklyRitualPlan() {
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const plan = generateWeeklyRituals();
    const saved = getStreakData();

    // Apply saved completion states
    const planWithSaved = plan.map((day) => {
      const savedDay = saved[day.dayKey];
      if (savedDay) {
        return {
          ...day,
          completed: day.rituals.map((_, idx) => savedDay[idx] || false)
        };
      }
      return day;
    });

    setWeeklyPlan(planWithSaved);
  }, []);

  const toggleCompletion = (dayKey: string, ritualIndex: number) => {
    setWeeklyPlan((prev) => {
      const updated = prev.map((day) => {
        if (day.dayKey === dayKey) {
          const newCompleted = [...day.completed];
          newCompleted[ritualIndex] = !newCompleted[ritualIndex];

          // Save to localStorage
          const current = getStreakData();
          saveStreakData({
            ...current,
            [dayKey]: newCompleted
          });

          return { ...day, completed: newCompleted };
        }
        return day;
      });
      return updated;
    });
  };

  const toggleDay = (dayKey: string) => {
    setExpandedDay((prev) => (prev === dayKey ? null : dayKey));
  };

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    weeklyPlan.forEach((day) => {
      total += day.rituals.length;
      completed += day.completed.filter(Boolean).length;
    });
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [weeklyPlan]);

  const currentDayKey = useMemo(() => {
    const dayIndex = new Date().getDay();
    const diasKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return diasKeys[dayIndex] || 'domingo';
  }, []);

  if (!mounted) {
    return (
      <SpiritualCard>
        <SpiritualCardHeader>
          <SpiritualCardTitle>Plano Semanal de Rituais</SpiritualCardTitle>
        </SpiritualCardHeader>
        <SpiritualCardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted" />
            ))}
          </div>
        </SpiritualCardContent>
      </SpiritualCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold">Plano Semanal de Rituais</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {stats.completed}/{stats.total}
            </div>
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium">{stats.percentage}%</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Days list */}
      <div className="space-y-3">
        {weeklyPlan.map((day) => {
          const isExpanded = expandedDay === day.dayKey;
          const isToday = day.dayKey === currentDayKey;
          const dayCompleted = day.completed.filter(Boolean).length;
          const dayTotal = day.rituals.length;
          const IconComponent = getIconForDay(day.dayKey);

          return (
            <div
              key={day.dayKey}
              className={`rounded-lg border transition-all duration-200 ${
                isToday
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-border hover:border-amber-500/30'
              }`}
            >
              {/* Day header */}
              <button
                onClick={() => toggleDay(day.dayKey)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {day.dayName}
                      </span>
                      {isToday && (
                        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                          Hoje
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{day.dayData.orixa}</span>
                      <span>•</span>
                      <span>{dayCompleted}/{dayTotal} rituais</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {dayCompleted > 0 && dayCompleted === dayTotal && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t p-4 space-y-3">
                  {/* Day info */}
                  {day.dayData.energia && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-muted-foreground">Energia do dia:</span>
                      <span className="font-medium">{day.dayData.energia}</span>
                    </div>
                  )}

                  {/* Rituals */}
                  <div className="space-y-2">
                    {day.rituals.map((ritual, idx) => {
                      const isCompleted = day.completed[idx];
                      const RitualIcon = RITUAL_ICONS[ritual.icon];
                      const colorClass = COLORS_MAP[getColorForIcon(ritual.icon)];

                      return (
                        <div
                          key={ritual.id}
                          className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                            isCompleted
                              ? 'bg-green-500/10 border border-green-500/20'
                              : 'bg-muted/50'
                          }`}
                        >
                          <button
                            onClick={() => toggleCompletion(day.dayKey, idx)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-amber-400 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <RitualIcon className={`h-4 w-4 ${colorClass}`} />
                              <span className={`font-medium ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                {ritual.title}
                              </span>
                            </div>
                            <p className={`mt-1 text-sm text-muted-foreground ${isCompleted ? 'line-through opacity-50' : ''}`}>
                              {ritual.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{ritual.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {ritual.orixa}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Completion message */}
                  {dayCompleted === dayTotal && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-400">
                        Parabéns! Você completou todos os rituais de {day.dayName}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week completion banner */}
      {stats.completed === stats.total && stats.total > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border border-amber-500/30">
          <Sparkles className="h-6 w-6 text-amber-400" />
          <div>
            <div className="font-medium text-amber-400">Semana Espiritual Completa!</div>
            <div className="text-sm text-muted-foreground">
              Você completou todos os {stats.total} rituais da semana
            </div>
          </div>
        </div>
      )}

      {/* Tips section */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">Dicas para sua prática</span>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Realize os rituais no início do dia para maior eficácia</li>
          <li>• Conecte-se com a energia do orixá do dia</li>
          <li>• Mantenha Consistency mais importante que perfeição</li>
          <li>•personalize os rituais conforme sua intuição</li>
        </ul>
      </div>
    </div>
  );
}

function getIconForDay(day: string): typeof Sun {
  const icons: Record<string, typeof Sun> = {
    domingo: Sun,
    segunda: Moon,
    terca: Flame,
    quarta: Star,
    quinta: Droplets,
    sexta: Wind,
    sabado: Moon
  };
  return icons[day] || Sun;
}

function getColorForIcon(icon: 'flame' | 'droplets' | 'wind' | 'moon' | 'star'): string {
  const colors: Record<string, string> = {
    flame: 'orange',
    droplets: 'blue',
    wind: 'cyan',
    moon: 'purple',
    star: 'yellow'
  };
  return colors[icon] || 'yellow';
}

export default WeeklyRitualPlan;