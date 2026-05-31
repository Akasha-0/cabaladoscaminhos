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
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SpiritualEndpointSchema = z.enum([
  'overview', 'sefirot', 'elements', 'gematria', 'tree-path', 'numerology'
]);
const SpiritualStatsQuerySchema = z.object({
  endpoint: SpiritualEndpointSchema.optional(),
  name: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
const GematriaQuerySchema = z.object({
  text: z.string().min(1, 'Texto é obrigatório'),
  method: z.enum(['standard', 'ordinal', 'reduced', 'full']).optional().default('standard'),
});

// ─── Spiritual Correlations Data ──────────────────────────────────────────
const SEFIROT_SPIRITUAL_CORRELATIONS: Record<string, {
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  path: number[];
}> = {
  'Kether': { chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Eu sou a coroa da vida', frequency: '963 Hz', path: [] },
  'Chokhmah': { chakra: 6, element: 'Ar', orixa: 'Oxum', affirmation: 'A sabedoria flui em mim', frequency: '741 Hz', path: [1] },
  'Binah': { chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Compreendo os mistérios', frequency: '639 Hz', path: [2] },
  'Chesed': { chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A misericórdia guia minhas ações', frequency: '528 Hz', path: [3] },
  'Gevurah': { chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A força justa habita em mim', frequency: '396 Hz', path: [4] },
  'Tipheret': { chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'A beleza e harmonia me definem', frequency: '528 Hz', path: [5, 6] },
  'Netzach': { chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A vitória é minha jornada', frequency: '639 Hz', path: [7] },
  'Hod': { chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A glória divina me sustenta', frequency: '741 Hz', path: [8] },
  'Yesod': { chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'O fundamento me ancora', frequency: '639 Hz', path: [9] },
  'Malkuth': { chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Terra e céu se encontram em mim', frequency: '174 Hz', path: [10, 11] },
};

const ELEMENT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'Fogo': { sefirot: ['Gevurah', 'Chesed', 'Tipheret'], chakra: 3, orixa: 'Xangô', affirmation: 'O fogo transforma e purifica', frequency: '396 Hz' },
  'Água': { sefirot: ['Binah', 'Yesod', 'Chokhmah'], chakra: 2, orixa: 'Iemanjá', affirmation: 'As águas carregam sabedoria', frequency: '639 Hz' },
  'Terra': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, orixa: 'Ogum', affirmation: 'A terra sustenta minha jornada', frequency: '174 Hz' },
  'Ar': { sefirot: ['Chokhmah', 'Hod', 'Tipheret'], chakra: 5, orixa: 'Oxalá', affirmation: 'O ar respira liberdade', frequency: '741 Hz' },
  'Éter': { sefirot: ['Kether', 'Binah'], chakra: 7, orixa: 'Oxalá', affirmation: 'O éter conecta todos os mundos', frequency: '963 Hz' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
interface OverviewStats {
  totalPaths: number;
  totalSefirot: number;
  elementBalance: Record<string, number>;
  date: string;
}

interface SefirotStats {
  sephirot: Array<{ 
    name: string; 
    value: number; 
    path: number;
    spiritualCorrelations?: typeof SEFIROT_SPIRITUAL_CORRELATIONS[string];
  }>;
  total: number;
  labels: string[];
  distribution: Record<number, number>;
}

interface ElementStats {
  distribution: Record<string, number>;
  percentages: Record<string, number>;
  spiritualCorrelations?: typeof ELEMENT_SPIRITUAL_CORRELATIONS;
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
  const sephirot = Object.keys(SEFIROT_SPIRITUAL_CORRELATIONS).map((name, index) => ({
    name,
    value: index + 1,
    path: index + 1,
    spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS[name],
  }));

  return {
    sephirot,
    total: sephirot.length,
    labels: sephirot.map(s => s.name),
    distribution: sephirot.reduce((acc, s) => {
      acc[s.path] = (acc[s.path] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };
}

function getElementStats(): ElementStats {
  const elements = Object.keys(ELEMENT_SPIRITUAL_CORRELATIONS);
  const distribution = elements.reduce((acc, el) => {
    acc[el] = SEFIROT_SPIRITUAL_CORRELATIONS[el]?.sefirot?.length || 0;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const percentages = Object.entries(distribution).reduce((acc, [el, count]) => {
    acc[el] = Math.round((count / total) * 100);
    return acc;
  }, {} as Record<string, number>);

  return {
    distribution,
    percentages,
    spiritualCorrelations: ELEMENT_SPIRITUAL_CORRELATIONS,
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
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { endpoint, name, date, sefirot, chakra, element, orixa } = parseResult.data;

    switch (endpoint) {
      case 'overview': {
        const overview = getOverviewStats();
        return NextResponse.json({
          success: true,
          overview,
        });
      }

      case 'sefirot': {
        let stats = getSefirotStats();
        
        // Filter by spiritual correlations
        if (sefirot && SEFIROT_SPIRITUAL_CORRELATIONS[sefirot]) {
          const corr = SEFIROT_SPIRITUAL_CORRELATIONS[sefirot];
          stats = {
            ...stats,
            sephirot: stats.sephirot.map(s => ({
              ...s,
              spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS[s.name],
            })).filter(s => s.name === sefirot),
          };
        }
        if (chakra) {
          stats = {
            ...stats,
            sephirot: stats.sephirot.map(s => ({
              ...s,
              spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS[s.name],
            })).filter(s => s.spiritualCorrelations?.chakra === chakra),
          };
        }
        if (element) {
          stats = {
            ...stats,
            sephirot: stats.sephirot.map(s => ({
              ...s,
              spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS[s.name],
            })).filter(s => s.spiritualCorrelations?.element === element),
          };
        }
        if (orixa) {
          stats = {
            ...stats,
            sephirot: stats.sephirot.map(s => ({
              ...s,
              spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS[s.name],
            })).filter(s => s.spiritualCorrelations?.orixa === orixa),
          };
        }

        return NextResponse.json({
          success: true,
          sefirot: stats,
          spiritualCorrelations: SEFIROT_SPIRITUAL_CORRELATIONS,
        });
      }

      case 'elements': {
        let stats = getElementStats();
        
        if (sefirot) {
          stats = {
            ...stats,
            distribution: Object.fromEntries(
              Object.entries(stats.distribution).filter(([el]) =>
                ELEMENT_SPIRITUAL_CORRELATIONS[el]?.sefirot.includes(sefirot)
              )
            ),
          };
        }
        if (chakra) {
          stats = {
            ...stats,
            distribution: Object.fromEntries(
              Object.entries(stats.distribution).filter(([el]) =>
                ELEMENT_SPIRITUAL_CORRELATIONS[el]?.chakra === chakra
              )
            ),
          };
        }
        if (orixa) {
          stats = {
            ...stats,
            distribution: Object.fromEntries(
              Object.entries(stats.distribution).filter(([el]) =>
                ELEMENT_SPIRITUAL_CORRELATIONS[el]?.orixa === orixa
              )
            ),
          };
        }

        return NextResponse.json({
          success: true,
          elements: stats,
          spiritualCorrelations: ELEMENT_SPIRITUAL_CORRELATIONS,
        });
      }

      case 'gematria': {
        if (!name) {
          return NextResponse.json({ success: false, error: 'Nome requerido para gematria' }, { status: 400 });
        }
        
        const gematriaValue = calculateGematria(name);
        
        return NextResponse.json({
          success: true,
          gematria: {
            name,
            value: gematriaValue,
            spiritualCorrelations: {
              sefirot: gematriaValue > 0 ? Object.keys(SEFIROT_SPIRITUAL_CORRELATIONS)[gematriaValue % 10] : 'Malkuth',
              chakra: (gematriaValue % 7) + 1,
              element: Object.keys(ELEMENT_SPIRITUAL_CORRELATIONS)[gematriaValue % 5],
              affirmation: `O valor ${gematriaValue} revela minha verdade`,
            },
          },
        });
      }

      case 'tree-path': {
        if (!name || !date) {
          return NextResponse.json({ success: false, error: 'Nome e data requeridos' }, { status: 400 });
        }
        
        const path = calculateTreePath(name, date);
        const sefirotName = Object.keys(SEFIROT_SPIRITUAL_CORRELATIONS)[path % 10] || 'Malkuth';
        const corr = SEFIROT_SPIRITUAL_CORRELATIONS[sefirotName];

        return NextResponse.json({
          success: true,
          treePath: {
            name,
            date,
            path,
            sefirot: sefirotName,
            spiritualCorrelations: {
              ...corr,
              path: [path],
            },
          },
        });
      }

      case 'numerology': {
        if (!name) {
          return NextResponse.json({ success: false, error: 'Nome requerido' }, { status: 400 });
        }
        
        const numerology = calculateNumerology(name);
        
        return NextResponse.json({
          success: true,
          numerology: {
            name,
            ...numerology,
            spiritualCorrelations: {
              sefirot: Object.keys(SEFIROT_SPIRITUAL_CORRELATIONS)[numerology.expression % 10] || 'Malkuth',
              chakra: (numerology.expression % 7) + 1,
              element: Object.keys(ELEMENT_SPIRITUAL_CORRELATIONS)[numerology.expression % 5] || 'Terra',
              orixa: Object.values(SEFIROT_SPIRITUAL_CORRELATIONS)[numerology.expression % 10]?.orixa || 'Ogum',
            },
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          spiritualStats: {
            overview: getOverviewStats(),
            sefirot: getSefirotStats(),
            elements: getElementStats(),
          },
          meta: {
            totalSefirot: 10,
            totalElements: 5,
            filters: { sefirot, chakra, element, orixa },
          },
        });
      }
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}