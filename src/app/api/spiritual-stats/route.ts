// ============================================================
// SPIRITUAL STATS API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual statistics
// - Overview metrics
// - Sefirot distribution
// - Element balance
// - Gematria statistics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateGematria,
  calculateNumerology,
  calculateTreePath,
  calculateElement,
  calculateSefirot,
  reduceDigits,
} from '@/lib/spiritual/calculations';
import { getMeanings, searchMeanings } from '@/lib/spiritual/meanings';

interface OverviewStats {
  totalMeanings: number;
  categories: string[];
  categoryDistribution: Record<string, number>;
  themesCount: number;
}

interface SefirotStats {
  values: number[];
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
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint');

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
      const treePath = calculateTreePath('Caminho Espiritual');
      return NextResponse.json({ data: { treePath } });
    case 'numerology':
      const numerology = calculateNumerology('1990-01-01');
      return NextResponse.json({ data: { numerology, reduced: reduceDigits([numerology]) } });
    case null:
      return NextResponse.json({
        data: stats,
        endpoints: {
          overview: '/api/spiritual-stats?endpoint=overview',
          sefirot: '/api/spiritual-stats?endpoint=sefirot',
          elements: '/api/spiritual-stats?endpoint=elements',
          gematria: '/api/spiritual-stats?endpoint=gematria',
          'tree-path': '/api/spiritual-stats?endpoint=tree-path',
          numerology: '/api/spiritual-stats?endpoint=numerology',
        },
      });
    default:
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }
}
