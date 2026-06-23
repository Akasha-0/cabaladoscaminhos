'use client';

import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
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

const FREQ_COLOR: Record<FrequencyLevel, string> = {
  shadow: '#FB5781',
  gift: '#2DD4BF',
  siddhi: '#9D86FF',
};

export interface DetectedPattern {
  icon: React.ReactNode;
  text: string;
  color: string;
}

export function detectPatterns(
  history: CycleHistoryData,
  areaLabels: Record<string, string>,
  freqLabels: Record<string, string>
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const areaHistory = history.areaHistory;

  for (const area of AREA_KEYS) {
    const areaEntries = areaHistory
      .filter((e) => e.area === area)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (areaEntries.length < 2) continue;

    const freqCounts: Record<string, number> = {};
    for (const e of areaEntries) {
      const f = e.dominantFrequency ?? 'shadow';
      freqCounts[f] = (freqCounts[f] ?? 0) + 1;
    }
    const dominantFreq = Object.entries(freqCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantFreq && dominantFreq[1] >= 3) {
      const label = freqLabels[dominantFreq[0]] ?? dominantFreq[0];
      patterns.push({
        icon: <Sparkles size={12} />,
        text: `${areaLabels[area] ?? area}: ${dominantFreq[1]}${' dias em '}${label}`,
        color: FREQ_COLOR[dominantFreq[0] as FrequencyLevel] ?? '#9D86FF',
      });
    }

    const last5 = areaEntries.slice(0, 5);
    if (last5.length >= 3) {
      const scores = last5.map((e) => e.alignmentScore ?? 50);
      const first = scores[scores.length - 1];
      const last = scores[0];
      const delta = last - first;
      if (delta >= 15) {
        patterns.push({
          icon: <TrendingUp size={12} />,
          text: `${areaLabels[area] ?? area}: ${'alinhamento subindo'} (+${delta})`,
          color: '#2DD4BF',
        });
      } else if (delta <= -15) {
        patterns.push({
          icon: <TrendingDown size={12} />,
          text: `${areaLabels[area] ?? area}: ${'alinhamento baixando'} (${delta})`,
          color: '#FB5781',
        });
      }
    }
  }

  const total = history.exercises.length;
  const completed = history.exercises.filter((e) => e.completed).length;
  if (total > 0) {
    const rate = Math.round((completed / total) * 100);
    if (rate >= 70) {
      patterns.push({
        icon: <Target size={12} />,
        text: `${rate}% ${'mantenha a prática'}`,
        color: '#2DD4BF',
      });
    } else if (rate <= 30 && total >= 5) {
      patterns.push({
        icon: <Calendar size={12} />,
        text: `${rate}% ${'mantenha a prática'}`,
        color: '#F0B429',
      });
    }
  }

  return patterns.slice(0, 6);
}
