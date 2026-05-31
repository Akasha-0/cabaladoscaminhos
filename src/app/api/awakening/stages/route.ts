// ============================================================
// AWAKENING STAGES API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStages } from '@/lib/journey/journey-stages';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const StageQuerySchema = z.object({
  id: z.string().optional(),
  sephirah: z.string().optional(),
  includeSymbolism: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includePractices: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
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
}

// ─── Spiritual Correlations ────────────────────────────────────────────────
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
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { id, sephirah, includeSymbolism, includePractices } = parseResult.data;
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

      return {
        ...stage,
        ...(includeSymbolism ? { element: correlation.element, planet: correlation.planet } : {}),
        ...(includePractices ? { chakra: correlation.chakra, tarot: correlation.tarot } : {}),
        odu: correlation.odu,
        orixa: correlation.orixa,
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

    // Filter by sephirah
    if (sephirah) {
      const filtered = baseStages.filter(s =>
        s.sephiroth.some(sh => sh.toLowerCase() === sephirah.toLowerCase())
      );
      return NextResponse.json({
        success: true,
        stages: filtered.map(enhanceStage),
        count: filtered.length,
      });
    }

    // Return all stages with correlations
    return NextResponse.json({
      success: true,
      stages: baseStages.map(enhanceStage),
      count: baseStages.length,
      meta: {
        totalSephiroth: baseStages.length,
        element: 'Terra',
        journeyType: 'Kabbalistic Tree of Life',
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve stages',
    }, { status: 500 });
  }
}