'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Droplets, 
  Wind, 
  Heart, 
  Shield,
  Loader2
} from 'lucide-react';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent } from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Types matching /api/rituais
type RitualType = 'ebó' | 'banho' | 'defumacao' | 'oracao' | 'firmeza';

interface Ritual {
  id: string;
  tipo: RitualType;
  nome: string;
  nomeOrisha?: string;
  diaSemana?: string;
  energia: 'limpadora' | 'protetora' | 'abundancia' | 'paz' | 'coragem' | 'amor' | 'saude' | 'sabedoria';
  cor?: string[];
  instrucoes: { etapa: number; titulo: string; descricao: string; duracao?: string }[];
}

interface RitualResponse {
  ritual: Ritual;
  disponivel: boolean;
  motivacao?: string;
}

interface RitualListResponse {
  rituais: RitualResponse[];
  diaInfo: {
    dia: string;
    orixas: string[];
    faseLua: string;
    misterio: string;
  };
  stats?: {
    total: number;
    completados: number;
  };
}

interface CompletedRitual {
  ritualId: string;
  completedAt: string;
}

// Streak storage
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

const RITUAL_ICONS: Record<RitualType, typeof Flame> = {
  'ebó': Flame,
  'banho': Droplets,
  'defumacao': Wind,
  'oracao': Heart,
  'firmeza': Shield,
};

const ENERGIA_COLORS: Record<string, string> = {
  'limpadora': 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  'protetora': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  'abundancia': 'bg-green-500/20 text-green-600 border-green-500/30',
  'paz': 'bg-violet-500/20 text-violet-600 border-violet-500/30',
  'coragem': 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  'amor': 'bg-pink-500/20 text-pink-600 border-pink-500/30',
  'saude': 'bg-teal-500/20 text-teal-600 border-teal-500/30',
  'sabedoria': 'bg-amber-500/20 text-amber-600 border-amber-500/30',
};

function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }
  const stored = localStorage.getItem('ritual-streak');
  if (!stored) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }
  return JSON.parse(stored);
}

function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ritual-streak', JSON.stringify(data));
}

function updateStreak(): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const streakData = getStreakData();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = streakData.currentStreak;
  let longestStreak = streakData.longestStreak;
  const lastCompletedDate = streakData.lastCompletedDate;

  if (lastCompletedDate === yesterdayStr) {
    currentStreak += 1;
  } else if (lastCompletedDate !== today) {
    currentStreak = 1;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const result: StreakData = {
    currentStreak,
    longestStreak,
    lastCompletedDate: today,
  };
  saveStreakData(result);
  return result;
}

export function RitualTracker() {
  const [data, setData] = useState<RitualListResponse | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastCompletedDate: null });
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchRituais = useCallback(async () => {
    try {
      const res = await fetch('/api/rituais');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: RitualListResponse = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching rituais:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRituais();
    setStreak(getStreakData());
    
    const completedStored = localStorage.getItem('ritual-completed-today');
    if (completedStored) {
      const today = new Date().toISOString().split('T')[0];
      const stored = JSON.parse(completedStored) as { date: string; ids: string[] };
      if (stored.date === today) {
        setCompleted(new Set(stored.ids));
      }
    }
  }, [fetchRituais]);

  const handleComplete = async (ritualId: string) => {
    setCompletingId(ritualId);
    
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = new Set(completed);
    newCompleted.add(ritualId);
    setCompleted(newCompleted);
    
    localStorage.setItem('ritual-completed-today', JSON.stringify({ date: today, ids: Array.from(newCompleted) }));
    
    const newStreak = updateStreak();
    setStreak(newStreak);
    
    try {
      await fetch('/api/rituais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ritualId }),
      });
    } catch (error) {
      console.error('Error completing ritual:', error);
    }
    
    setCompletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-spiritual-gold" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Não foi possível carregar os rituais.
      </div>
    );
  }

  const { rituais, diaInfo, stats } = data;
  const disponiveis = rituais.filter(r => r.disponivel);
  const completedCount = completed.size;
  const totalDisponiveis = disponiveis.length;

  return (
    <div className="space-y-6">
      {/* Header with Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rituais do Dia</h2>
          <p className="text-sm text-muted-foreground">{diaInfo.dia} • {diaInfo.misterio}</p>
        </div>
        
        {/* Streak Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-amber-500">{streak.currentStreak}</span>
              <span className="text-xs text-muted-foreground">dias</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-sm text-muted-foreground">Recorde:</span>
            <span className="font-semibold">{streak.longestStreak}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso do dia</span>
          <span className="font-medium">{completedCount}/{totalDisponiveis}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-spiritual-gold to-spiritual-gold-dark transition-all duration-500 ease-out"
            style={{ width: `${totalDisponiveis > 0 ? (completedCount / totalDisponiveis) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Day Info */}
      {diaInfo.orixas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Orixás:</span>
          {diaInfo.orixas.map((orixa) => (
            <Badge key={orixa} variant="outline" className="text-xs">
              {orixa}
            </Badge>
          ))}
          {diaInfo.faseLua && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="secondary" className="text-xs">
                Lua: {diaInfo.faseLua}
              </Badge>
            </>
          )}
        </div>
      )}

      <Separator />

      {/* Ritual List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {disponiveis.map(({ ritual, motivacao }) => {
          const isCompleted = completed.has(ritual.id);
          const Icon = RITUAL_ICONS[ritual.tipo] || Flame;
          const energiaClass = ENERGIA_COLORS[ritual.energia] || ENERGIA_COLORS['limpadora'];
          
          return (
            <SpiritualCard 
              key={ritual.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                isCompleted ? 'bg-gradient-to-br from-emerald-950/30 to-card' : ''
              }`}
            >
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              )}
              
              <SpiritualCardHeader>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-500/20' : 'bg-spiritual-gold/20'}`}>
                    <Icon className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-spiritual-gold'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SpiritualCardTitle className="text-base leading-tight">
                      {ritual.nome}
                    </SpiritualCardTitle>
                    {ritual.nomeOrisha && (
                      <p className="text-sm text-muted-foreground">{ritual.nomeOrisha}</p>
                    )}
                  </div>
                </div>
              </SpiritualCardHeader>
              
              <SpiritualCardContent className="space-y-3">
                {/* Energy Badge */}
                <Badge className={energiaClass} variant="outline">
                  {ritual.energia}
                </Badge>
                
                {/* Motivation if available */}
                {motivacao && (
                  <p className="text-sm italic text-muted-foreground">&ldquo;{motivacao}&rdquo;</p>
                )}
                
                {/* Instructions preview */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {ritual.instrucoes.length} etapas • {ritual.instrucoes[ritual.instrucoes.length - 1]?.duracao || 'variável'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ritual.cor?.slice(0, 3).map((cor) => (
                      <span 
                        key={cor} 
                        className="inline-block px-2 py-0.5 text-xs rounded bg-muted"
                      >
                        {cor}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Quick Complete Button */}
                <SpiritualButton
                  onClick={() => handleComplete(ritual.id)}
                  disabled={isCompleted || completingId === ritual.id}
                  variant={isCompleted ? 'outline' : 'golden'}
                  className="w-full mt-2"
                >
                  {completingId === ritual.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completando...
                    </>
                  ) : isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Ritual Completo
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar como Completo
                    </>
                  )}
                </SpiritualButton>
              </SpiritualCardContent>
            </SpiritualCard>
          );
        })}
      </div>

      {/* Unavailable rituals notice */}
      {rituais.length > disponiveis.length && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {rituais.length - disponiveis.length} ritual(is) não disponível(is) para hoje
        </div>
      )}
    </div>
  );
}

export default RitualTracker;