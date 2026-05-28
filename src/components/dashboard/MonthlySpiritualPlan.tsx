'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { 
  Calendar, 
  Moon, 
  Sun, 
  Star, 
  Flame, 
  Heart,
  Sparkles,
  Zap,
  Crown,
  Eye,
  Droplets,
  Mountain,
  Wind,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  BookOpen,
  Gem,
  SunMoon
} from 'lucide-react';

interface RitualDate {
  date: Date;
  title: string;
  description: string;
  type: 'ritual' | 'festival' | 'meditation' | 'preparation';
  orixa?: string;
  sefirah?: string;
  completed: boolean;
}

interface MonthlyProgress {
  totalRituals: number;
  completedRituals: number;
  totalDays: number;
  activeDays: number;
}

interface MonthlyTheme {
  name: string;
  focus: string;
  affirmation: string;
  color: string;
}

interface MonthlySpiritualPlanProps {
  className?: string;
  mes?: number;
  ano?: number;
  onProgressChange?: (progress: MonthlyProgress) => void;
}

const MONTHLY_THEMES: Record<number, MonthlyTheme> = {
  0: { name: 'Renovação Interior', focus: 'Novos propósitos e renovamento espiritual', affirmation: 'Eu abro espaço para nova luz em minha vida', color: 'from-violet-500 to-purple-600' },
  1: { name: 'Amor Incondicional', focus: 'Cultivar compaixão e amor por todos os seres', affirmation: 'Meu coração irradia amor infinito', color: 'from-pink-500 to-rose-600' },
  2: { name: 'Força Interior', focus: 'Despertar a coragem e determinação', affirmation: 'Sou forte, sou capaz, sou determinado', color: 'from-red-500 to-orange-600' },
  3: { name: 'Prosperidade Sagrada', focus: 'Alinhar-se com a abundância universal', affirmation: 'Sou merecedor de toda prosperidade', color: 'from-amber-500 to-yellow-600' },
  4: { name: 'Comunicação Divina', focus: 'Desenvolver intuição e escuta interior', affirmation: 'Minha voz interior é clara e verdadeira', color: 'from-blue-500 to-cyan-600' },
  5: { name: 'Harmonia Interior', focus: 'Equilibrar mente, corpo e espírito', affirmation: ' Vivo em perfeito equilíbrio e harmonia', color: 'from-green-500 to-emerald-600' },
  6: { name: 'Transformação', focus: 'Libertar velhos padrões e renascer', affirmation: 'A transformação acontece em mim agora', color: 'from-indigo-500 to-violet-600' },
  7: { name: 'Fé e Confiança', focus: 'Desenvolver confiança no caminho espiritual', affirmation: 'Confio no plano divino para minha vida', color: 'from-purple-500 to-pink-600' },
  8: { name: 'Ancestralidade', focus: 'Reconectar-se com raízes e linhagem', affirmation: 'Honro meus ancestrais e sua sabedoria', color: 'from-amber-600 to-orange-700' },
  9: { name: 'Iluminação', focus: 'Buscar conhecimento e sabedoria', affirmation: 'A luz da sabedoria ilumina meu caminho', color: 'from-yellow-400 to-amber-500' },
  10: { name: 'Gratidão', focus: 'Cultivar gratidão por tudo Received', affirmation: 'Sou grato por cada bênção em minha vida', color: 'from-orange-500 to-amber-600' },
  11: { name: 'Unidade', focus: 'Reconectar-se com o todo cósmico', affirmation: 'Sou parte do universo infinito', color: 'from-slate-500 to-zinc-600' },
};

const KEY_DATES: Record<number, Array<{ month: number; day: number; title: string; type: RitualDate['type']; description: string; orixa?: string; sefirah?: string }>> = {
  0: [
    { month: 0, day: 1, title: 'Ano Novo Espiritual', type: 'ritual', description: 'Ritual de开门 para novos propósitos', sefirah: 'Chokmah' },
    { month: 0, day: 6, title: 'Dia dos Reis Magos', type: 'festival', description: 'Celebração da luz divina e sabedoria', orixa: 'Oxum' },
    { month: 0, day: 20, title: 'Festa de Iemanjá', type: 'festival', description: 'Celebração das águas sagradas', orixa: 'Iemanjá' },
  ],
  1: [
    { month: 1, day: 2, title: 'Dia de Oxum', type: 'festival', description: 'Celebração do amor e prosperidade', orixa: 'Oxum' },
    { month: 1, day: 14, title: 'Dia dos Namorados Espiritual', type: 'ritual', description: 'Ritual de amor próprio e conexão', sefirah: 'Chesed' },
  ],
  2: [
    { month: 2, day: 8, title: 'Dia Internacional da Mulher', type: 'meditation', description: 'Meditação de força e feminilidade sagrada', orixa: 'Oxum' },
    { month: 2, day: 19, title: 'Dia de Ogum', type: 'festival', description: 'Celebração da força e conquista', orixa: 'Ogum' },
  ],
  3: [
    { month: 3, day: 21, title: 'Equinócio de Outono', type: 'ritual', description: 'Ritual de equilíbrio e renovação', sefirah: 'Tiferet' },
  ],
  4: [
    { month: 4, day: 1, title: 'Dia de Xango', type: 'festival', description: 'Celebração da justiça e trovão', orixa: 'Xangô' },
    { month: 4, day: 23, title: 'Dia de Oxóssi', type: 'festival', description: 'Celebração da caça espiritual', orixa: 'Oxóssi' },
  ],
  5: [
    { month: 5, day: 13, title: 'Dia de Oxumaré', type: 'festival', description: 'Celebração do arco-íris e renovação', orixa: 'Oxumaré' },
  ],
  6: [
    { month: 6, day: 21, title: 'Solstício de Inverno', type: 'ritual', description: 'Ritual de rebirth e transformação', sefirah: 'Yesod' },
    { month: 6, day: 13, title: 'Dia de Oxalá', type: 'festival', description: 'Celebração da paz e criação', orixa: 'Oxalá' },
  ],
  7: [
    { month: 7, day: 22, title: 'Dia de Iemanjá', type: 'festival', description: 'Celebração do mar e maternidade', orixa: 'Iemanjá' },
  ],
  8: [
    { month: 8, day: 15, title: 'Dia de Nossa Senhora', type: 'festival', description: 'Celebração da energia mariânica', orixa: 'Iemanjá' },
  ],
  9: [
    { month: 9, day: 22, title: 'Equinócio de Primavera', type: 'ritual', description: 'Ritual de despertar e renovação', sefirah: ' Netzach' },
  ],
  10: [
    { month: 10, day: 1, title: 'Dia das Crianças Espiritual', type: 'meditation', description: 'Meditação de inocência e pureza', sefirah: 'Hod' },
    { month: 10, day: 15, title: 'Dia de Oxum', type: 'festival', description: 'Celebração da sabedoria e amor', orixa: 'Oxum' },
    { month: 10, day: 31, title: 'Véspera de Todos os Santos', type: 'ritual', description: 'Ritual de conexão com ancestrais', sefirah: 'Malkuth' },
  ],
  11: [
    { month: 11, day: 8, title: 'Imaculada Conceição', type: 'festival', description: 'Celebração da concepção divina', orixa: 'Iemanjá' },
    { month: 11, day: 21, title: 'Solstício de Verão', type: 'ritual', description: 'Ritual de máxima luz', sefirah: 'Keter' },
    { month: 11, day: 25, title: 'Natal Espiritual', type: 'festival', description: 'Celebração do nascimento divino', sefirah: 'Chokmah' },
  ],
};

function getOrixaIcon(orixa: string) {
  switch (orixa?.toLowerCase()) {
    case 'oxum': return <Droplets className="w-4 h-4 text-yellow-500" />;
    case 'ogum': return <Flame className="w-4 h-4 text-red-600" />;
    case 'xangô': return <Zap className="w-4 h-4 text-orange-500" />;
    case 'oxóssi': return <Target className="w-4 h-4 text-green-600" />;
    case 'iemanjá': return <Moon className="w-4 h-4 text-blue-400" />;
    case 'oxalá': return <Sun className="w-4 h-4 text-white" />;
    case 'oxumaré': return <SunMoon className="w-4 h-4 text-rainbow" />;
    case 'logun edé': return <Star className="w-4 h-4 text-emerald-500" />;
    case 'nanã': return <Mountain className="w-4 h-4 text-purple-600" />;
    case 'obá': return <Heart className="w-4 h-4 text-rose-500" />;
    case 'ioxorrimá': return <Sparkles className="w-4 h-4 text-sky-400" />;
    default: return <Sparkles className="w-4 h-4 text-primary" />;
  }
}

function getSefirahIcon(sefirah: string) {
  const icons: Record<string, { icon: typeof Crown; color: string }> = {
    'Keter': { icon: Crown, color: 'text-violet-400' },
    'Chokmah': { icon: Moon, color: 'text-gray-300' },
    'Chesed': { icon: Heart, color: 'text-blue-400' },
    'Gevurah': { icon: Flame, color: 'text-red-500' },
    'Tiferet': { icon: Sun, color: 'text-yellow-400' },
    'Netzach': { icon: Star, color: 'text-green-400' },
    'Hod': { icon: Zap, color: 'text-orange-400' },
    'Yesod': { icon: Moon, color: 'text-purple-400' },
    'Malkuth': { icon: Mountain, color: 'text-amber-600' },
  };
  const config = icons[sefirah] || { icon: Sparkles, color: 'text-primary' };
  const Icon = config.icon;
  return <Icon className={`w-4 h-4 ${config.color}`} />;
}

function getTypeIcon(type: RitualDate['type']) {
  switch (type) {
    case 'ritual': return <Flame className="w-4 h-4" />;
    case 'festival': return <Star className="w-4 h-4" />;
    case 'meditation': return <Eye className="w-4 h-4" />;
    case 'preparation': return <Clock className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
}

function getTypeBadgeVariant(type: RitualDate['type']): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (type) {
    case 'ritual': return 'default';
    case 'festival': return 'secondary';
    case 'meditation': return 'outline';
    case 'preparation': return 'secondary';
    default: return 'outline';
  }
}

export function MonthlySpiritualPlan({ 
  className, 
  mes = new Date().getMonth(),
  ano = new Date().getFullYear(),
  onProgressChange 
}: MonthlySpiritualPlanProps) {
  const [currentMonth, setCurrentMonth] = useState(mes);
  const [currentYear, setCurrentYear] = useState(ano);
  const [completedRituals, setCompletedRituals] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const theme = useMemo(() => MONTHLY_THEMES[currentMonth], [currentMonth]);

  const keyDates = useMemo(() => {
    const dates: RitualDate[] = [];
    const monthKeyDates = KEY_DATES[currentMonth] || [];
    
    monthKeyDates.forEach((kd) => {
      if (kd.month === currentMonth) {
        dates.push({
          date: new Date(currentYear, currentMonth, kd.day),
          title: kd.title,
          description: kd.description,
          type: kd.type,
          orixa: kd.orixa,
          sefirah: kd.sefirah,
          completed: completedRituals.has(`${currentMonth}-${kd.day}`),
        });
      }
    });
    
    return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentMonth, currentYear, completedRituals]);

  const progress = useMemo((): MonthlyProgress => {
    const totalRituals = keyDates.length;
    const completedCount = keyDates.filter(kd => kd.completed).length;
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const activeDays = Math.ceil((currentMonth + 1) / 12 * totalDays);
    
    return {
      totalRituals,
      completedRituals: completedCount,
      totalDays,
      activeDays,
    };
  }, [keyDates, currentMonth, currentYear]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const days: Array<{ date: Date; isCurrentMonth: boolean; keyDate?: RitualDate }> = [];
    
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      const keyDate = keyDates.find(kd => 
        kd.date.getDate() === date.getDate()
      );
      days.push({ date, isCurrentMonth: false, keyDate });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const keyDate = keyDates.find(kd => kd.date.getDate() === day);
      days.push({ date, isCurrentMonth: true, keyDate });
    }
    
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      const keyDate = keyDates.find(kd => kd.date.getDate() === date.getDate());
      days.push({ date, isCurrentMonth: false, keyDate });
    }
    
    return days;
  }, [currentMonth, currentYear, keyDates]);

  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);

  const toggleRitualCompletion = useCallback((ritualId: string) => {
    setCompletedRituals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ritualId)) {
        newSet.delete(ritualId);
      } else {
        newSet.add(ritualId);
      }
      return newSet;
    });
  }, []);

  const getDayClasses = (day: { date: Date; isCurrentMonth: boolean; keyDate?: RitualDate }) => {
    const isToday = day.date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
    const hasKeyDate = !!day.keyDate;
    
    let classes = 'w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200';
    
    if (!day.isCurrentMonth) {
      classes += ' text-muted-foreground/40';
    } else if (hasKeyDate) {
      classes += ' bg-primary/20 font-medium text-primary hover:bg-primary/30 cursor-pointer';
    } else {
      classes += ' hover:bg-accent cursor-pointer';
    }
    
    if (isToday) {
      classes = classes.replace('text-sm', 'text-sm font-bold ring-2 ring-primary');
    }
    
    if (isSelected) {
      classes += ' bg-primary text-primary-foreground';
    }
    
    return classes;
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Card */}
        <div className="lg:col-span-1">
          <SpiritualCard variant="default" size="default" className="h-full">
            <SpiritualCardHeader className="pb-2">
              <SpiritualCardTitle className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-primary" />
                Tema do Mês
              </SpiritualCardTitle>
            </SpiritualCardHeader>
            <SpiritualCardContent className="space-y-4">
              <div className={`p-4 rounded-lg bg-gradient-to-br ${theme.color} text-white`}>
                <h3 className="text-xl font-cinzel mb-2">{theme.name}</h3>
                <p className="text-sm opacity-90">{theme.focus}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/50 border border-secondary">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm font-medium">Afirmação</span>
                </div>
                <p className="text-sm italic text-muted-foreground">"{theme.affirmation}"</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso Mensal</span>
                  <span className="font-medium">
                    {progress.completedRituals}/{progress.totalRituals} ritais
                  </span>
                </div>
                <Progress 
                  value={progress.totalRituals > 0 ? (progress.completedRituals / progress.totalRituals) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </SpiritualCardContent>
          </SpiritualCard>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-cinzel">
                    {monthNames[currentMonth]} {currentYear}
                  </CardTitle>
                  <CardDescription>
                    Planejamento Espiritual Mensal
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoje
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">Calendário</TabsTrigger>
                  <TabsTrigger value="rituals">Rituais</TabsTrigger>
                </TabsList>
                
                <TabsContent value="calendar" className="space-y-4">
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day, index) => (
                      <div 
                        key={index}
                        className={getDayClasses(day)}
                        onClick={() => setSelectedDate(day.date)}
                        role="button"
                        tabIndex={0}
                      >
                        {day.date.getDate()}
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                      </h4>
                      {(() => {
                        const selectedKeyDate = keyDates.find(kd => 
                          kd.date.getDate() === selectedDate.getDate()
                        );
                        if (selectedKeyDate) {
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(selectedKeyDate.type)}
                                <span className="font-medium">{selectedKeyDate.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{selectedKeyDate.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {selectedKeyDate.orixa && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getOrixaIcon(selectedKeyDate.orixa)}
                                    {selectedKeyDate.orixa}
                                  </Badge>
                                )}
                                {selectedKeyDate.sefirah && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    {getSefirahIcon(selectedKeyDate.sefirah)}
                                    {selectedKeyDate.sefirah}
                                  </Badge>
                                )}
                                <Badge variant={getTypeBadgeVariant(selectedKeyDate.type)}>
                                  {selectedKeyDate.type}
                                </Badge>
                              </div>
                            </div>
                          );
                        }
                        return <p className="text-sm text-muted-foreground">Nenhum evento agendado</p>;
                      })()}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rituals" className="space-y-4">
                  {keyDates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum ritual agendado para este mês</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {keyDates.map((kd, index) => {
                        const ritualId = `${currentMonth}-${kd.date.getDate()}`;
                        return (
                          <div 
                            key={index}
                            className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleRitualCompletion(ritualId)}
                                className="mt-1 flex-shrink-0"
                                aria-label={kd.completed ? 'Marcar como não completado' : 'Marcar como completado'}
                              >
                                {kd.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {kd.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                                  </span>
                                  <Badge variant={getTypeBadgeVariant(kd.type)} className="text-xs">
                                    {kd.type}
                                  </Badge>
                                </div>
                                <h4 className="font-medium mb-1">{kd.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{kd.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {kd.orixa && (
                                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                      {getOrixaIcon(kd.orixa)}
                                      {kd.orixa}
                                    </Badge>
                                  )}
                                  {kd.sefirah && (
                                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                      {getSefirahIcon(kd.sefirah)}
                                      {kd.sefirah}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{keyDates.length}</p>
                <p className="text-sm text-muted-foreground">Rituais Planejados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.completedRituals}</p>
                <p className="text-sm text-muted-foreground">Rituais Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Gem className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.totalRituals > 0 ? Math.round((progress.completedRituals / progress.totalRituals) * 100) : 0}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {keyDates.filter(kd => kd.date > new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Rituais Restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MonthlySpiritualPlan;