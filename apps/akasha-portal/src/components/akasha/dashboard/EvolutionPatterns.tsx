'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, Target, Calendar } from 'lucide-react';
import type { CycleHistoryData } from './hooks/useCyclePersistence';

interface EvolutionPatternsProps {
  history: CycleHistoryData | null;
  loading?: boolean;
}

type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';
type AreaKey = 'vitalidadeEnergia' | 'conexoesAmor' | 'carreiraProsperidade' | 'oriCabecaQuizilas' | 'missaoDestino' | 'desafiosSombras';

const AREA_KEYS: AreaKey[] = [
  'vitalidadeEnergia',
  'conexoesAmor',
  'carreiraProsperidade',
  'oriCabecaQuizilas',
  'missaoDestino',
  'desafiosSombras',
];

const AREA_LABEL: Record<string, string> = {
  vitalidadeEnergia: 'Vitalidade',
  conexoesAmor: 'Conexões',
  carreiraProsperidade: 'Carreira',
  oriCabecaQuizilas: 'Mente/Orixá',
  missaoDestino: 'Missão',
  desafiosSombras: 'Sombras',
};

const FREQ_COLOR: Record<FrequencyLevel, string> = {
  shadow: '#FB5781',
  gift: '#2DD4BF',
  siddhi: '#9D86FF',
};

const FREQ_LABEL: Record<FrequencyLevel, string> = {
  shadow: 'Sombra',
  gift: 'Dom',
  siddhi: 'Siddhi',
};

const FREQ_BG: Record<FrequencyLevel, string> = {
  shadow: 'bg-[#FB5781]/15 text-[#FB5781] border border-[#FB5781]/30',
  gift: 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30',
  siddhi: 'bg-[#9D86FF]/15 text-[#9D86FF] border border-[#9D86FF]/30',
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ scores, color }: { scores: number[]; color: string }) {
  if (scores.length < 2) return <span className="text-[10px] text-white/30">Sem dados</span>;
  const w = 80;
  const h = 28;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const pts = scores.map((v, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

// ── Pattern detection ──────────────────────────────────────────────────────────

interface DetectedPattern {
  icon: React.ReactNode;
  text: string;
  color: string;
}

function detectPatterns(history: CycleHistoryData): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const areaHistory = history.areaHistory;

  // Per-area streaks
  for (const area of AREA_KEYS) {
    const areaEntries = areaHistory
      .filter((e) => e.area === area)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (areaEntries.length < 2) continue;

    // Frequency streak
    const freqCounts: Record<string, number> = {};
    for (const e of areaEntries) {
      const f = (e.dominantFrequency ?? 'shadow') as FrequencyLevel;
      freqCounts[f] = (freqCounts[f] ?? 0) + 1;
    }
    const dominantFreq = Object.entries(freqCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantFreq && dominantFreq[1] >= 3) {
      const label = FREQ_LABEL[dominantFreq[0] as FrequencyLevel] ?? dominantFreq[0];
      patterns.push({
        icon: <Sparkles size={12} />,
        text: `${AREA_LABEL[area] ?? area}: ${dominantFreq[1]} dias em ${label}`,
        color: FREQ_COLOR[dominantFreq[0] as FrequencyLevel] ?? '#9D86FF',
      });
    }

    // Alignment trend (last 5 entries)
    const last5 = areaEntries.slice(0, 5);
    if (last5.length >= 3) {
      const scores = last5.map((e) => e.alignmentScore ?? 50);
      const first = scores[scores.length - 1];
      const last = scores[0];
      const delta = last - first;
      if (delta >= 15) {
        patterns.push({
          icon: <TrendingUp size={12} />,
          text: `${AREA_LABEL[area] ?? area}: alinhamento subindo (+${delta})`,
          color: '#2DD4BF',
        });
      } else if (delta <= -15) {
        patterns.push({
          icon: <TrendingDown size={12} />,
          text: `${AREA_LABEL[area] ?? area}: alinhamento baixando (${delta})`,
          color: '#FB5781',
        });
      }
    }
  }

  // Exercise completion rate
  const total = history.exercises.length;
  const completed = history.exercises.filter((e) => e.completed).length;
  if (total > 0) {
    const rate = Math.round((completed / total) * 100);
    if (rate >= 70) {
      patterns.push({
        icon: <Target size={12} />,
        text: `${rate}% de exercícios completados (${completed}/${total})`,
        color: '#2DD4BF',
      });
    } else if (rate <= 30 && total >= 5) {
      patterns.push({
        icon: <Calendar size={12} />,
        text: `${rate}% de exercícios completados — mantenha a prática`,
        color: '#F0B429',
      });
    }
  }

  return patterns.slice(0, 6);
}

// ── Frequency distribution ─────────────────────────────────────────────────────

function FrequencyBar({ history }: { history: CycleHistoryData }) {
  const counts = history.areaHistory.reduce<Record<FrequencyLevel, number>>(
    (acc, e) => {
      const f = (e.dominantFrequency ?? 'shadow') as FrequencyLevel;
      if (f in acc) acc[f]++;
      return acc;
    },
    { shadow: 0, gift: 0, siddhi: 0 }
  );

  const total = Math.max(Object.values(counts).reduce((a, b) => a + b, 0), 1);
  return (
    <div className="flex gap-2 items-center">
      {(Object.keys(FREQ_COLOR) as FrequencyLevel[]).map((freq) => {
        const pct = Math.round((counts[freq] / total) * 100);
        return (
          <div key={freq} className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${FREQ_BG[freq]}`}>
                {FREQ_LABEL[freq]}
              </span>
              <span className="text-[10px] text-white/50">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: FREQ_COLOR[freq] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Alignment sparklines ───────────────────────────────────────────────────────

function AlignmentTrends({ history }: { history: CycleHistoryData }) {
  const trends = AREA_KEYS.map((area) => {
    const entries = history.areaHistory
      .filter((e) => e.area === area)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // last 7 entries
    const scores = entries.map((e) => e.alignmentScore ?? 50);
    const latest = scores[scores.length - 1] ?? 50;
    const color = latest >= 70 ? '#2DD4BF' : latest >= 50 ? '#F0B429' : '#FB5781';
    return { area, scores, latest, color };
  }).filter((t) => t.scores.length > 0);

  if (trends.length === 0) {
    return <p className="text-[11px] text-white/40">Sem dados de alinhamento ainda</p>;
  }

  return (
    <div className="space-y-2">
      {trends.map(({ area, scores, latest, color }) => (
        <div key={area} className="flex items-center gap-3">
          <span className="text-[10px] text-white/60 w-24 shrink-0 truncate">
            {AREA_LABEL[area] ?? area}
          </span>
          <Sparkline scores={scores} color={color} />
          <span
            className="text-[10px] font-mono w-8 text-right shrink-0"
            style={{ color }}
          >
            {latest}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function EvolutionPatterns({ history, loading }: EvolutionPatternsProps) {
  const patterns = useMemo(() => (history ? detectPatterns(history) : []), [history]);

  if (loading) {
    return (
      <div className="bg-[#0B0E1C]/40 rounded-2xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-40 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-white/10 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.areaHistory.length === 0) {
    return (
      <div className="bg-[#0B0E1C]/40 rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-[#9D86FF]" />
          <h3 className="text-sm font-semibold font-cinzel text-[#A7AECF]">Padrões Evolutivos</h3>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed">
          Continue praticando para que o Agente Evolutivo detecte seus padrões ao longo do tempo.
          Cada dia de prática enriquece seu histórico.
        </p>
      </div>
    );
  }

  const totalDays = new Set(history.areaHistory.map((e) => e.date)).size;
  const exerciseCompleted = history.exercises.filter((e) => e.completed).length;
  const exerciseTotal = history.exercises.length;

  return (
    <div className="bg-[#0B0E1C]/40 rounded-2xl p-5 border border-white/5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#9D86FF]" />
          <h3 className="text-sm font-semibold font-cinzel text-[#A7AECF]">Padrões Evolutivos</h3>
        </div>
        <span className="text-[10px] text-white/40 font-mono">
          {totalDays} dia{totalDays !== 1 ? 's' : ''} · {history.meta.days} dias
        </span>
      </div>

      {/* Frequency Distribution */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Frequência por Área</p>
        <FrequencyBar history={history} />
      </div>

      {/* Alignment Trends */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Tendência de Alinhamento</p>
        <AlignmentTrends history={history} />
      </div>

      {/* Exercise Completion */}
      {exerciseTotal > 0 && (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'rgba(45,212,191,0.1)',
              borderColor: 'rgba(45,212,191,0.3)',
            }}
          >
            <Target size={16} className="text-[#2DD4BF]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-white/70">Exercícios completados</span>
              <span className="text-[11px] font-mono text-[#2DD4BF]">
                {exerciseCompleted}/{exerciseTotal}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2DD4BF] transition-all"
                style={{ width: `${Math.round((exerciseCompleted / exerciseTotal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Padrões Detectados</p>
          <div className="space-y-1.5">
            {patterns.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <span className="shrink-0 mt-0.5" style={{ color: p.color }}>
                  {p.icon}
                </span>
                <span className="text-white/70" style={{ color: p.color + 'CC' }}>
                  {p.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
