import type { BirthChart } from '@akasha/core-astrology';
import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import { buildDailyEnergy } from '@/lib/application/agents/transit-engine';
import { aggregateHologram } from '@/lib/domain/mapa/hologram-aggregator';
import { crossAnalyze } from './cross-engine';
import { buildOduGlossary, formatGlossarySection } from './glossary';
import type { AkashaSynthesis } from './synthesis-engine';
import { buildAkashaSynthesis } from './synthesis-engine';

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
  /** §SYNTHESIS-F1: síntese narrativa completa — 6 áreas de vida + decisão diária. */
  synthesis?: AkashaSynthesis;
}
export function buildDailyContent(
  astrologyMap: unknown,
  kabalisticMap: unknown,
  tantricMap: unknown,
  oduBirth: unknown,
  date: Date = new Date(),
  ichingHex?: number | null
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

  // crossAnalyze legado — mantém interface Prisma inalterada
  const cross = crossAnalyze(enrichedAstroMap, kabalisticMap, tantricMap, oduBirth, date);

  // §SYNTHESIS-F1: motor de síntese narrativa — 6 áreas de vida unificadas
  let synthesis: AkashaSynthesis | undefined;
  try {
    const astro = astrologyMap as AstrologyMap | null;
    const kab = kabalisticMap as KabalisticMap | null;
    const tantra = tantricMap as TantricMap | null;
    const odu = oduBirth as OduBirth | null;
    const hologram = aggregateHologram({
      astrologyMap: astro ?? null,
      kabalisticMap: kab ?? null,
      tantricMap: tantra ?? null,
      oduBirth: odu ?? null,
      ichingHex: ichingHex ?? null,
    });

    synthesis = buildAkashaSynthesis(astro, kab, tantra, odu, hologram, date);
  } catch (err) {
    // Não quebra a API — síntese é enhancement, não bloco
    // AkashaSynthesis unavailable — non-fatal enhancement
  }

  return {
    date: dateStr,
    climate: cross.climate,
    ritual: cross.dailyRitual,
    alert: cross.dailyAlert,
    tensionPoint: cross.tensionPoint,
    moonPhase: energy.moonPhase?.name ?? 'Lua',
    overallTheme: energy.overallTheme ?? 'Equilíbrio',
    glossarySection: formatGlossarySection(buildOduGlossary(oduBirth)),
    synthesis,
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
