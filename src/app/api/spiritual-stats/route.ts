// ============================================================
// SPIRITUAL STATS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  calculateGematria,
  calculateNumerology,
  calculateTreePath,
  calculateElement,
  calculateSefirot,
  reduceDigits,
} from '@/lib/spiritual/calculations';
import { getMeanings, searchMeanings } from '@/lib/spiritual/meanings';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SpiritualEndpointSchema = z.enum([
  'overview',
  'sefirot',
  'elements',
  'gematria',
  'tree-path',
  'numerology',
]);
const SpiritualStatsQuerySchema = z.object({
  endpoint: SpiritualEndpointSchema.optional(),
  name: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
const GematriaQuerySchema = z.object({
  text: z.string().min(1, 'Texto é obrigatório'),
  method: z.enum(['standard', 'ordinal', 'reduced', 'full']).optional().default('standard'),
});
// Type aliases
type OverviewStats = {
  totalPaths: number;
  totalSefirot: number;
  elementBalance: Record<string, number>;
  date: string;
};
interface SefirotStats {
  sephirot: Array<{ name: string; value: number; path: number }>;
  total: number;
}
  labels: string[];
  distribution: Record<number, number>;
}

interface ElementStats {
  distribution: Record<string, number>;
  percentages: Record<string, number>;
}

interface GematriaStats {
  averageValue: number;
  range: { min: number; max: number };
  commonValues: Array<{ value: number; count: number }>;
}

interface SpiritualStats {
  overview: OverviewStats;
  sefirot: SefirotStats;
  elements: ElementStats;
  gematria: GematriaStats;
}

function getOverviewStats(): OverviewStats {
  const meanings = getMeanings();
  const categories = [...new Set(meanings.map((m) => m.category))];
  const categoryDistribution: Record<string, number> = {};
  const allThemes = meanings.flatMap((m) => m.themes);
  const uniqueThemes = [...new Set(allThemes)];

  for (const cat of categories) {
    categoryDistribution[cat] = meanings.filter((m) => m.category === cat).length;
  }

  return {
    totalMeanings: meanings.length,
    categories,
    categoryDistribution,
    themesCount: uniqueThemes.length,
  };
}

function getSefirotStats(): SefirotStats {
  const labels = [
    'Keter (Coroa)',
    'Chokhmah (Sabedoria)',
    'Binah (Compreensão)',
    'Chesed (Misericórdia)',
    'Gevurah (Força)',
    'Tiferet (Beleza)',
    'Netzach (Vitória)',
    'Hod (Glória)',
    'Yesod (Fundação)',
    'Malkuth (Reino)',
  ];

  const sefirot = calculateSefirot();
  const distribution: Record<number, number> = {};

  for (const value of sefirot) {
    distribution[value] = (distribution[value] || 0) + 1;
  }

  return {
    values: sefirot,
    labels,
    distribution,
  };
}

function getElementStats(names: string[]): ElementStats {
  const elementCounts: Record<string, number> = {
    FIRE: 0,
    WATER: 0,
    EARTH: 0,
    AIR: 0,
  };

  for (const name of names) {
    const element = calculateElement(name);
    elementCounts[element]++;
  }

  const total = names.length || 1;
  const percentages: Record<string, number> = {};

  for (const [element, count] of Object.entries(elementCounts)) {
    percentages[element] = Math.round((count / total) * 100);
  }

  return {
    distribution: elementCounts,
    percentages,
  };
}

function getGematriaStats(names: string[]): GematriaStats {
  const values = names.map((name) => calculateGematria(name));
  const sum = values.reduce((a, b) => a + b, 0);
  const averageValue = values.length > 0 ? Math.round(sum / values.length) : 0;

  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  const valueCounts: Record<number, number> = {};
  for (const v of values) {
    valueCounts[v] = (valueCounts[v] || 0) + 1;
  }

  const commonValues = Object.entries(valueCounts)
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    averageValue,
    range: { min, max },
    commonValues,
  };
}

function getSpiritualStats(): SpiritualStats {
  const overview = getOverviewStats();
  const sefirot = getSefirotStats();

  const names = getMeanings()
    .slice(0, 50)
    .map((m) => m.name);

  const elements = getElementStats(names);
  const gematria = getGematriaStats(names);

  return {
    overview,
    sefirot,
    elements,
    gematria,
  };
}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = SpiritualStatsQuerySchema.safeParse({
      endpoint: searchParams.get('endpoint'),
      name: searchParams.get('name'),
      date: searchParams.get('date'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { endpoint, name, date } = parseResult.data;
    const stats = getSpiritualStats();
    switch (endpoint) {
      case 'overview':
        return NextResponse.json({ data: stats.overview });
      case 'sefirot':
        return NextResponse.json({ data: stats.sefirot });
      case 'elements':
        return NextResponse.json({ data: stats.elements });
      case 'gematria':
        return NextResponse.json({ data: stats.gematria });
      case 'tree-path':
        const treeName = name ?? 'Caminho Espiritual';
        const treePath = calculateTreePath(treeName);
        return NextResponse.json({ data: { treePath, name: treeName } });
      case 'numerology':
        const birthDate = date ?? '1990-01-01';
        const numerology = calculateNumerology(birthDate);
        return NextResponse.json({
          data: {
            numerology,
            reduced: reduceDigits([numerology]),
            date: birthDate,
          },
        });
      case undefined:
        return NextResponse.json({
          data: stats,
          endpoints: ['overview', 'sefirot', 'elements', 'gematria', 'tree-path', 'numerology'],
        });
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao processar stats' }, { status: 500 });
  }
}
