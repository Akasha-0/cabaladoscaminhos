'use client';

import type { FrequencyLevel } from '@/lib/application/akasha/synthesis-engine/synthesis-types';
import type { CycleHistoryData } from '../hooks/useCyclePersistence';

type AreaKey =
  | 'vitalidadeEnergia'
  | 'conexoesAmor'
  | 'carreiraProsperidade'
  | 'oriCabecaQuizilas'
  | 'missaoDestino'
  | 'desafiosSombras';

const AREA_KEYS: AreaKey[] = [
  'vitalidadeEnergia',
  'conexoesAmor',
  'carreiraProsperidade',
  'oriCabecaQuizilas',
  'missaoDestino',
  'desafiosSombras',
];

type Freq = 'shadow' | 'gift' | 'siddhi';

function freqToScore(f: string | null | undefined): number {
  if (f === 'siddhi') return 100;
  if (f === 'gift') return 50;
  return 0;
}

// ── Frequency Trends ───────────────────────────────────────────────────────────

export function FrequencyTrends({
  history,
  areaLabels,
  freqLabels,
  noDataLabel,
}: {
  history: CycleHistoryData;
  areaLabels: Record<string, string>;
  freqLabels: Record<string, string>;
  noDataLabel: string;
}) {
  const trends = AREA_KEYS.map((area) => {
    const entries = history.areaHistory
      .filter((e) => e.area === area)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10);
    const scores = entries.map((e) => freqToScore(e.dominantFrequency));
    const latestFreq = (entries[entries.length - 1]?.dominantFrequency as Freq) ?? 'shadow';
    const color =
      latestFreq === 'siddhi' ? '#9D86FF' : latestFreq === 'gift' ? '#2DD4BF' : '#FB5781';
    return { area, scores, latestFreq, color };
  }).filter((t) => t.scores.length > 0);

  if (trends.length === 0) {
    return <p className="text-[10px] text-white/30">{noDataLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {trends.map(({ area, scores, latestFreq, color }) => (
        <div key={area} className="flex items-center gap-3">
          <span className="text-[10px] text-white/60 w-24 shrink-0 truncate">
            {areaLabels[area] ?? area}
          </span>
          <div className="flex items-end gap-px h-6 flex-1">
            {scores.map((score, i) => {
              const freq =
                (history.areaHistory
                  .filter((e) => e.area === area)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(-10)[i]?.dominantFrequency as Freq) ?? 'shadow';
              const barColor =
                freq === 'siddhi' ? '#9D86FF' : freq === 'gift' ? '#2DD4BF' : '#FB5781';
              const heightPct = Math.max(10, score);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm shrink-0 transition-all"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                    opacity: 0.55 + score / 200,
                  }}
                  title={freq}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-mono w-14 text-right shrink-0" style={{ color }}>
            {freqLabels[latestFreq] ?? latestFreq}
          </span>
        </div>
      ))}
    </div>
  );
}
