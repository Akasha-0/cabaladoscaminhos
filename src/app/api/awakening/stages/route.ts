// ============================================================
// AWAKENING STAGES API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStages } from '@/lib/journey/journey-stages';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const StageQuerySchema = z.object({
  id: z.string().optional(),
  sephirah: z.string().optional(),
  includeSymbolism: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includePractices: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Enhanced Stage Type ───────────────────────────────────────────────────
interface EnhancedStage {
  id: string;
  name: string;
  description: string;
  sephiroth: string[];
  symbols: string[];
  practices: string[];
  completionWeight: number;
  // Spiritual Correlations
  element?: string;
  planet?: string;
  chakra?: string;
  tarot?: string;
  odu?: string;
  orixa?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

// ─── Spiritual Correlations ────────────────────────────────────────────────
const STAGE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  birth: {
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Omolu',
    affirmation: 'O nascimento é o início da jornada sagrada',
    frequency: '396 Hz',
  },
  foundation: {
    sefirot: ['Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A fundação da alma se ancora nas águas',
    frequency: '417 Hz',
  },
  mercy: {
    sefirot: ['Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A misericórdia divina flui através de mim',
    frequency: '528 Hz',
  },
  beauty: {
    sefirot: ['Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Oxóssi',
    affirmation: 'A beleza do mundo reflete minha essência',
    frequency: '528 Hz',
  },
  severity: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'A força justa habita em meu coração',
    frequency: '528 Hz',
  },
  wisdom: {
    sefirot: ['Hod'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'A sabedoria ilumina meu caminho',
    frequency: '741 Hz',
  },
  understanding: {
    sefirot: ['Netzach'],
    chakra: 5,
    element: 'Éter',
    orixa: 'Nanã',
    affirmation: 'O entendimento profundo me guia',
    frequency: '741 Hz',
  },
  crown: {
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A coroa conecta-me à fonte divina',
    frequency: '963 Hz',
  },
};

const STAGE_CORRELATIONS: Record<string, { element: string; planet: string; chakra: string; tarot: string; odu: string; orixa: string }> = {
  birth: {
    element: 'Terra',
    planet: 'Saturno',
    chakra: 'Muladhara (1º)',
    tarot: 'O Mundo (XXI)',
    odu: 'Ogbe',
    orixa: 'Omolu',
  },
  foundation: {
    element: 'Água',
    planet: 'Lua',
    chakra: 'Svadhisthana (2º)',
    tarot: 'A Lua (XVIII)',
    odu: 'Oyeku',
    orixa: 'Iemanjá',
  },
  mercy: {
    element: 'Água',
    planet: 'Júpiter',
    chakra: 'Anahata (4º)',
    tarot: 'A Temperança (XIV)',
    odu: 'Iwori',
    orixa: 'Oxum',
  },
  beauty: {
    element: 'Fogo',
    planet: 'Sol',
    chakra: 'Manipura (3º)',
    tarot: 'O Sol (XIX)',
    odu: 'Odi',
    orixa: 'Oxóssi',
  },
  severity: {
    element: 'Fogo',
    planet: 'Marte',
    chakra: 'Manipura (3º)',
    tarot: 'A Justiça (XI)',
    odu: 'Ogunda',
    orixa: 'Xangô',
  },
  wisdom: {
    element: 'Ar',
    planet: 'Mercúrio',
    chakra: 'Ajna (6º)',
    tarot: 'O Mago (I)',
    odu: 'Ose',
    orixa: 'Iansã',
  },
  understanding: {
    element: 'Éter',
    planet: 'Saturno',
    chakra: 'Vishuddha (5º)',
    tarot: 'A Imperadora (III)',
    odu: 'Obara',
    orixa: 'Nanã',
  },
  crown: {
    element: 'Éter',
    planet: 'Sem planeta (Keter)',
    chakra: 'Sahasrara (7º)',
    tarot: 'O Louco (0)',
    odu: 'Ejifá',
    orixa: 'Oxalá',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = StageQuerySchema.safeParse({
      id: searchParams.get('id'),
      sephirah: searchParams.get('sephirah'),
      includeSymbolism: searchParams.get('includeSymbolism'),
      includePractices: searchParams.get('includePractices'),
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

    const { id, sephirah, includeSymbolism, includePractices, sefirot, chakra, element, orixa } = parseResult.data;
    const baseStages = getStages();

    // Helper function to enhance a stage
    const enhanceStage = (stage: typeof baseStages[0]): EnhancedStage => {
      const correlation = STAGE_CORRELATIONS[stage.id] || {
        element: 'Terra',
        planet: 'Saturno',
        chakra: 'Muladhara (1º)',
        tarot: 'O Mundo (XXI)',
        odu: 'Ogbe',
        orixa: 'Omolu',
      };
      const spiritualCorrelation = STAGE_SPIRITUAL_CORRELATIONS[stage.id] || STAGE_SPIRITUAL_CORRELATIONS['birth'];

      return {
        ...stage,
        ...(includeSymbolism ? { element: correlation.element, planet: correlation.planet } : {}),
        ...(includePractices ? { chakra: correlation.chakra, tarot: correlation.tarot } : {}),
        odu: correlation.odu,
        orixa: correlation.orixa,
        spiritualCorrelations: spiritualCorrelation,
      } as EnhancedStage;
    };

    // Get single stage by ID
    if (id) {
      const stage = baseStages.find((s) => s.id === id);
      if (!stage) {
        return NextResponse.json({
          success: false,
          error: 'Stage not found',
          validIds: baseStages.map(s => s.id),
        }, { status: 404 });
      }
 return NextResponse.json({
        success: true,
        stage: enhanceStage(stage),
      });
    }

    let stages = [...baseStages];

    // Filter by sephirah
    if (sephirah) {
      stages = stages.filter(s =>
        s.sephiroth.some(sh => sh.toLowerCase() === sephirah.toLowerCase())
      );
    }

    // Filter by spiritual dimensions
    if (sefirot) {
      stages = stages.filter(s => STAGE_SPIRITUAL_CORRELATIONS[s.id]?.sefirot.includes(sefirot));
    }

    if (chakra) {
      stages = stages.filter(s => STAGE_SPIRITUAL_CORRELATIONS[s.id]?.chakra === chakra);
    }

    if (element) {
      stages = stages.filter(s => STAGE_SPIRITUAL_CORRELATIONS[s.id]?.element === element);
    }

    if (orixa) {
      stages = stages.filter(s => STAGE_SPIRITUAL_CORRELATIONS[s.id]?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: stages.reduce((acc, s) => {
        STAGE_SPIRITUAL_CORRELATIONS[s.id]?.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: stages.reduce((acc, s) => {
        const c = STAGE_SPIRITUAL_CORRELATIONS[s.id]?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: stages.reduce((acc, s) => {
        const e = STAGE_SPIRITUAL_CORRELATIONS[s.id]?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: stages.reduce((acc, s) => {
        const o = STAGE_SPIRITUAL_CORRELATIONS[s.id]?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      stages: stages.map(enhanceStage),
      count: stages.length,
      spiritualCorrelations: STAGE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        totalSephiroth: stages.length,
        element: 'Terra',
        journeyType: 'Kabbalistic Tree of Life',
        filters: { id, sephirah, includeSymbolism, includePractices, sefirot, chakra, element, orixa },
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve stages',
    }, { status: 500 });
  }
}