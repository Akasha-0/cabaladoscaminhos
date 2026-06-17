import { buildDailyEnergy } from '@/lib/agents/transit-engine';
import { crossAnalyze } from '@/lib/akasha/cross-engine';
import { buildOduGlossary, formatGlossarySection } from '@/lib/akasha/glossary';

export interface AstroMap {
  sun?: string;
  moon?: string;
  elementalChart?: Record<string, number>;
  [key: string]: unknown;
}

export interface LifePathMap {
  lifePath?: number;
  [key: string]: unknown;
}

export interface BodyMap {
  activeBodies?: number[];
  [key: string]: unknown;
}

export interface OduMap {
  oduName?: string;
  orixaRegency?: string[];
  preceitos?: string[];
  [key: string]: unknown;
}

export interface RitualContent {
  titulo: string;
  instrucao: string;
  cor: string;
  elemento: string;
}

export interface TensionPoint {
  pillar: string;
  theme: string;
  intensity: number;
}

export interface DailyContent {
  date: string;
  climate: string;
  ritual: RitualContent;
  alert: string;
  tensionPoint: TensionPoint;
  moonPhase: string;
  overallTheme: string;
  glossarySection?: string;
  [key: string]: unknown;
}

export function buildDailyContent(
  astroMap: AstroMap,
  lifePathMap: LifePathMap,
  bodyMap: BodyMap,
  oduMap: OduMap,
  date: Date
): DailyContent {
  let transitData: ReturnType<typeof buildDailyEnergy>;
  try {
    transitData = buildDailyEnergy(astroMap, lifePathMap, date);
  } catch {
    transitData = {
      date: date.toISOString().split('T')[0],
      moonPhase: { name: 'Lua em Transição', phase: 'waning' },
      majorAspects: [],
      overallTheme: 'Energia neutra',
      luckyColor: 'cinza',
      overallEnergy: 50,
    };
  }

  const enrichedAstro = {
    ...astroMap,
    ...transitData,
  };

  const crossResult = crossAnalyze(enrichedAstro, bodyMap, oduMap);

  const glossary = oduMap.oduName
    ? formatGlossarySection(buildOduGlossary(oduMap))
    : undefined;

  const dateStr = date.toISOString().split('T')[0];

  return {
    date: dateStr,
    climate: crossResult?.climate ?? 'Clima equilibrado',
    ritual: crossResult?.ritual ?? { titulo: 'Ritual Padrão', instrucao: 'Pratique com atenção', cor: 'azul', elemento: 'água' },
    alert: crossResult?.alert ?? 'Mantenha-se centrado',
    tensionPoint: crossResult?.tensionPoint ?? { pillar: 'corpo-aurico', theme: 'Tensão leve', intensity: 3 },
    moonPhase: transitData.moonPhase?.name ?? 'Lua',
    overallTheme: transitData.overallTheme ?? 'Dia neutro',
    glossarySection: glossary,
  };
}
