// fallow-ignore-file unused-file
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Moon,
  Sparkles,
  Sun,
  Star,
} from 'lucide-react';
import { useSpiritualHistory } from '@/hooks/useSpiritualHistory';

// ============================================================
// TYPES
// ============================================================

interface RitualItem {
  id: string;
  name: string;
  time: string;
  type: 'prayer' | 'meditation' | 'offering' | 'gratitude';
  description: string;
  duration: string;
}

interface RitualReminderWidgetProps {
  className?: string;
  userId?: string;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// ============================================================
// CONSTANTS
// ============================================================

const RITUALS_BY_DAY: Record<number, RitualItem[]> = {
  0: [
    { id: 'dom-1', name: 'Oração a Iemanjá', time: '06:00', type: 'prayer', description: ' Reza especial para a Rainha do Mar, pedindo paz e proteção', duration: '15 min' },
    { id: 'dom-2', name: 'Meditação das Águas', time: '08:00', type: 'meditation', description: 'Meditação fluindo como as águas do mar, purificando a alma', duration: '20 min' },
    { id: 'dom-3', name: 'Agradecimento Semanal', time: '20:00', type: 'gratitude', description: 'Registro das bênçãos recebidas durante a semana', duration: '10 min' },
  ],
  1: [
    { id: 'seg-1', name: 'Purificação Ancestral', time: '06:30', type: 'offering', description: 'Oferecimento de flores brancas e água para os ancestrais', duration: '25 min' },
    { id: 'seg-2', name: 'Oração da Segunda', time: '18:00', type: 'prayer', description: 'Saudação à Iemanjá Rainha, protetora dos filhos', duration: '15 min' },
  ],
  2: [
    { id: 'ter-1', name: 'Ogum Fe', time: '05:30', type: 'prayer', description: 'Prece de proteção para abrir caminhos e quebrar obstáculos', duration: '20 min' },
    { id: 'ter-2', name: 'Xangô Justiceiro', time: '19:00', type: 'prayer', description: 'Oração ao deus do trovão pedindo justiça e equilíbrio', duration: '15 min' },
  ],
  3: [
    { id: 'qua-1', name: 'Oração da Sabedoria', time: '07:00', type: 'prayer', description: 'Prece para iluminação mental e clareza de pensamento', duration: '15 min' },
    { id: 'qua-2', name: 'Meditação da Caça', time: '06:00', type: 'meditation', description: 'Visualização da abundância espiritual e material', duration: '20 min' },
  ],
  4: [
    { id: 'qui-1', name: 'Oxóssi Caçador', time: '06:00', type: 'prayer', description: ' Reza para abrir os caminhos da prosperidade', duration: '15 min' },
    { id: 'qui-2', name: 'Meditação da Fartura', time: '08:00', type: 'meditation', description: 'Visualização de abundância em todas as áreas da vida', duration: '25 min' },
  ],
  5: [
    { id: 'sex-1', name: 'Oxalá Paz', time: '06:00', type: 'prayer', description: 'Oração pela paz interior e harmonia nas relações', duration: '15 min' },
    { id: 'sex-2', name: 'Ebó de Paz', time: '17:00', type: 'offering', description: 'Ritual de oferecer pão e água para Oxalá', duration: '20 min' },
  ],
  6: [
    { id: 'sab-1', name: 'Oxum Prosperidade', time: '07:00', type: 'prayer', description: 'Prece à deusa do ouro buscando abundância', duration: '15 min' },
    { id: 'sab-2', name: 'Ritual do Dourado', time: '18:00', type: 'offering', description: 'Oferecimento de mel e flores amarelas para Oxum', duration: '30 min' },
  ],
};

const RITUAL_TYPE_CONFIG: Record<RitualItem['type'], { icon: React.ReactNode; color: string; bgColor: string }> = {
  prayer: { icon: <Sun className="w-4 h-4" />, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  meditation: { icon: <Moon className="w-4 h-4" />, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10' },
  offering: { icon: <Star className="w-4 h-4" />, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  gratitude: { icon: <Sparkles className="w-4 h-4" />, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10' },
};

const RITUAL_TYPE_LABELS: Record<RitualItem['type'], string> = {
  prayer: 'Oração', meditation: 'Meditação', offering: 'Oferenda', gratitude: 'Agradecimento',
};

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira', 4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado',
};

const DAY_ORIXA: Record<number, string> = {
  0: 'Iemanjá', 1: 'Iemanjá', 2: 'Ogum/Xangô', 3: 'Xangô', 4: 'Oxóssi', 5: 'Oxalá', 6: 'Oxum',
};

// Map ritual type to spiritual history type
const RITUAL_TYPE_MAP: Record<RitualItem['type'], 'oracao' | 'meditacao' | 'oferenda' | 'agradecimento'> = {
  prayer: 'oracao',
  meditation: 'meditacao',
  offering: 'oferenda',
  gratitude: 'agradecimento',
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface RitualItemProps {
  ritual: RitualItem;
  isCompleted: boolean;
  onToggle: () => void;
}

// fallow-ignore-next-line complexity
function RitualItem({ ritual, isCompleted, onToggle }: RitualItemProps) {
  const config = RITUAL_TYPE_CONFIG[ritual.type];

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-lg border border-transparent transition-all duration-200 ease-out hover:bg-slate-800/50 hover:border-slate-700/50 ${isCompleted ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className={`flex-shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110 active:scale-95 ${isCompleted ? 'text-green-400' : 'text-slate-500 hover:text-amber-400'}`}
        aria-label={isCompleted ? 'Marcar como não feito' : 'Marcar como feito'}
      >
        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bgColor} ${config.color}`}>
            {config.icon}
            {RITUAL_TYPE_LABELS[ritual.type]}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3 h-3" />{ritual.time}</span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs text-slate-500">{ritual.duration}</span>
        </div>

        <h4 className={`font-medium text-sm mb-1 transition-all duration-200 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {ritual.name}
        </h4>

        <p className={`text-xs transition-all duration-200 ${isCompleted ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
          {ritual.description}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-slate-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-slate-700 animate-pulse" />
            <div className="h-4 w-40 rounded bg-slate-700 animate-pulse" />
            <div className="h-3 w-full rounded bg-slate-700 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function RitualReminderWidget({ className = '', userId = 'default' }: RitualReminderWidgetProps) {
  const [loading, setLoading] = React.useState<LoadingState>('loading');
  const [completedRituals, setCompletedRituals] = React.useState<Set<string>>(new Set());
  const [todayRituals, setTodayRituals] = React.useState<RitualItem[]>([]);

  // Use spiritual history hook for tracking completions
  const { addRitualCompletion, getReadingsForDate } = useSpiritualHistory();

  const today = new Date().getDay();
  const todayStr = new Date().toISOString().split('T')[0];
  const dayName = DAY_NAMES[today];
  const orixa = DAY_ORIXA[today];

// fallow-ignore-next-line complexity
  React.useEffect(() => {
    const loadRituals = async () => {
      setLoading('loading');
      await new Promise((resolve) => setTimeout(resolve, 500));
      const rituals = RITUALS_BY_DAY[today] || [];
      setTodayRituals(rituals);

      // Load from localStorage
      const storageKey = `ritual-completed-${userId}-${todayStr}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const completed = JSON.parse(saved);
          setCompletedRituals(new Set(completed));
        } catch { /* ignore */ }
      }

      // Also load from spiritual history
      const historyEntry = getReadingsForDate(todayStr);
      if (historyEntry && historyEntry.rituals.length > 0) {
        const historyCompleted = historyEntry.rituals
          .filter(r => r.completed)
          .map(r => r.ritualId);
        if (historyCompleted.length > 0) {
          setCompletedRituals(prev => {
            const merged = new Set([...prev, ...historyCompleted]);
            // Save merged to localStorage
            const storageKey = `ritual-completed-${userId}-${todayStr}`;
            localStorage.setItem(storageKey, JSON.stringify([...merged]));
            return merged;
          });
        }
      }

      setLoading('loaded');
    };
    loadRituals();
  }, [today, userId, todayStr, getReadingsForDate]);

  const toggleRitual = React.useCallback((ritual: RitualItem) => {
    const ritualId = ritual.id;
    setCompletedRituals((prev) => {
      const next = new Set(prev);
      const isCompleting = !next.has(ritualId);

      if (isCompleting) {
        next.add(ritualId);
      } else {
        next.delete(ritualId);
      }

      // Save to localStorage
      const storageKey = `ritual-completed-${userId}-${todayStr}`;
      localStorage.setItem(storageKey, JSON.stringify([...next]));

      // Also track in spiritual history
      addRitualCompletion({
        ritualId,
        ritualType: RITUAL_TYPE_MAP[ritual.type],
        completed: isCompleting,
      });

      return next;
    });
  }, [userId, todayStr, addRitualCompletion]);

  const completedCount = completedRituals.size;
  const totalCount = todayRituals.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const ORYXAS_SYMBOLS: Record<string, string> = {
    'Iemanjá': '🌊', 'Ogum/Xangô': '⚔️', 'Xangô': '🔥', 'Oxóssi': '🏹', 'Oxalá': '✧', 'Oxum': '💧',
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-purple-900/30 via-slate-900 to-indigo-900/30 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Flame className="w-5 h-5" />
            Rituales de Hoy
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{ORYXAS_SYMBOLS[orixa]}</span>
            <div className="text-right">
              <p className="text-xs text-slate-400">{dayName}</p>
              <p className="text-sm font-medium text-amber-400">{orixa}</p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">{completedCount} de {totalCount} completados</span>
            <span className="text-purple-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading === 'loading' ? (
          <LoadingSkeleton />
        ) : todayRituals.length === 0 ? (
          <div className="py-8 text-center"><p className="text-slate-500 text-sm">No hay rituales programados para hoy</p></div>
        ) : (
          <div className="space-y-1">
            {todayRituals.map((ritual) => (
              <RitualItem key={ritual.id} ritual={ritual} isCompleted={completedRituals.has(ritual.id)} onToggle={() => toggleRitual(ritual)} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RitualReminderWidget;
