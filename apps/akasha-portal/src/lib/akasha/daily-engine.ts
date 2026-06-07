import type { BirthChart } from '@akasha/core-astrology';
import { buildDailyEnergy } from '@/lib/agents/transit-engine';
import { crossAnalyze } from './cross-engine';
import { buildOduGlossary, formatGlossarySection } from './glossary';

export interface DailyContent {
  date: string;
  climate: string;
  ritual: {
    titulo: string;
    instrucao: string;
    cor: string;
    elemento: string;
    herbs?: string[];
  };
  alert: string;
  tensionPoint: {
    pillar: string;
    theme: string;
    intensity: number;
    affectedBody?: number;
    affectedElement?: string;
  };
  moonPhase: string;
  overallTheme: string;
  /** AD-T5-F (AD-20.2): bloco de glossário injetado para downstream IA. */
  glossarySection?: string;
}

export function buildDailyContent(
  astrologyMap: unknown,
  kabalisticMap: unknown,
  tantricMap: unknown,
  oduBirth: unknown,
  date: Date = new Date()
): DailyContent {
  const birthChart = astrologyMap as BirthChart;
  const dateStr = date.toISOString().split('T')[0];

  let energy: ReturnType<typeof buildDailyEnergy>;
  try {
    energy = buildDailyEnergy(birthChart, date);
  } catch {
    energy = buildFallbackEnergy(date);
  }

  // Enriquecer o mapa astrológico com dados calculados do trânsito
  const enrichedAstroMap = {
    ...(astrologyMap as Record<string, unknown>),
    majorAspects: energy.majorAspects ?? [],
    overallEnergy: energy.overallEnergy ?? 60,
    moonPhase: energy.moonPhase,
    luckyColor: energy.luckyColor,
    overallTheme: energy.overallTheme,
  };

  const cross = crossAnalyze(enrichedAstroMap, kabalisticMap, tantricMap, oduBirth, date);

  return {
    date: dateStr,
    climate: cross.climate,
    ritual: cross.dailyRitual,
    alert: cross.dailyAlert,
    tensionPoint: cross.tensionPoint,
    moonPhase: energy.moonPhase?.name ?? 'Lua',
    overallTheme: energy.overallTheme ?? 'Equilíbrio',
    // AD-T5-F (AD-20.2): glossário mínimo do Odu injetado no payload
    glossarySection: formatGlossarySection(buildOduGlossary(oduBirth)),
  };
}

function buildFallbackEnergy(date: Date): ReturnType<typeof buildDailyEnergy> {
  const day = date.getDate();
  const phases = ['nova', 'crescente', 'cheia', 'minguante'] as const;
  const phase = phases[Math.floor((day / 30) * 4) % 4];
  return {
    date: date.toISOString().split('T')[0],
    moonPhase: {
      phase,
      name: `Lua ${phase}`,
      illumination: 50,
      energy: 'energia em transição',
      action: 'Conecte-se com seu centro interior.',
      avoid: 'Dispersão',
      rituals: ['banho de ervas', 'meditação'],
      favorableFor: ['reflexão', 'planejamento'],
    },
    majorAspects: [],
    overallTheme: 'Renovação',
    keyAdvice: 'Conecte-se com seu centro interior.',
    luckyColor: 'branco',
    luckyNumber: (day % 9) + 1,
    overallEnergy: 60,
    retrogradePlanets: [],
    powerHour: '06-08h',
  };
}
