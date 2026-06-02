// ============================================================
// CABALA SEFIROT API - CABALA DOS CAMINHOS
// Enhanced with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMeanings, SefiraMeaning } from '@/lib/cabala/sefirot-meanings';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const SefirotQuerySchema = z.object({
  sefira: z.string().optional(),
  language: z.enum(['pt', 'en', 'he']).optional().default('pt'),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Each Sephirah ──────────────────────────────────────────
const SEPHIRAH_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  planet: string;
  archetype: string;
  color: string;
  bodyPart: string;
}> = {
  'Kether': { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Eu sou a coroa divina que une tudo', frequency: '963 Hz', planet: 'Sol', archetype: 'A Coroa', color: 'Branco/Dourado', bodyPart: 'Coroa' },
  'Chokhmah': { sefirot: ['Chokhmah'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A sabedoria infinita flui através de mim', frequency: '741 Hz', planet: 'Marte', archetype: 'A Sabedoria', color: 'Cinza/Cinzento', bodyPart: 'Cérebro' },
  'Binah': { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A compreensão profunda me transforma', frequency: '639 Hz', planet: 'Saturno', archetype: 'A Compreensão', color: 'Preto', bodyPart: 'Cervbro' },
  'Daat': { sefirot: ['Daat'], chakra: 6, element: 'Éter', orixa: 'Oxalá', affirmation: 'O conhecimento secreto se revela', frequency: '741 Hz', planet: 'Terra', archetype: 'O Conhecimento', color: 'Violeta', bodyPart: 'Terceiro olho' },
  'Chesed': { sefirot: ['Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'A misericórdia divina me guia', frequency: '528 Hz', planet: 'Júpiter', archetype: 'A Misericórdia', color: 'Azul-violeta', bodyPart: 'Mão direita' },
  'Gevurah': { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A força divina me protege', frequency: '396 Hz', planet: 'Marte', archetype: 'A Severidade', color: 'Vermelho', bodyPart: 'Mão esquerda' },
  'Tipheret': { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A beleza e harmonia me equilibram', frequency: '528 Hz', planet: 'Sol', archetype: 'A Beleza', color: 'Amarelo/Dourado', bodyPart: 'Coração' },
  'Netzach': { sefirot: ['Netzach'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'A vitória flui através da natureza', frequency: '528 Hz', planet: 'Vênus', archetype: 'A Vitória', color: 'Verde', bodyPart: 'Quadril direito' },
  'Hod': { sefirot: ['Hod'], chakra: 5, element: 'Ar', orixa: 'Xangô', affirmation: 'A glória e humildade me equilibram', frequency: '741 Hz', planet: 'Mercúrio', archetype: 'A Glória', color: 'Laranja', bodyPart: 'Quadril esquerdo' },
  'Yesod': { sefirot: ['Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A fundação divina sustenta minha alma', frequency: '639 Hz', planet: 'Lua', archetype: 'A Fundação', color: 'Prata/Lilás', bodyPart: 'Órgãos sexuais' },
  'Malkuth': { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Aterra sagrada me ancora', frequency: '396 Hz', planet: 'Saturno', archetype: 'O Reino', color: 'Marrom/Amarelo', bodyPart: 'Pés' },
};

const VALID_SEFIRA_NAMES = ['Keter', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkut'];
// fallow-ignore-next-line unused-type
export type { SefiraMeaning };

function normalizeSefiraName(name: string): string {
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  // Handle alternate spellings
  const mapping: Record<string, string> = {
    'Keter': 'Kether',
    'Kether': 'Kether',
    'Tiferet': 'Tipheret',
    'Tipheret': 'Tipheret',
    'Malkut': 'Malkuth',
    'Malkuth': 'Malkuth',
  };
  return mapping[normalized] || normalized;
}

function enrichSefira(sefira: SefiraMeaning, name: string) {
  const normalizedName = normalizeSefiraName(name);
  const corr = SEPHIRAH_SPIRITUAL_CORRELATIONS[normalizedName] || SEPHIRAH_SPIRITUAL_CORRELATIONS['Kether'];
  return {
    ...sefira,
    name: normalizedName,
    spiritualCorrelations: {
      sefirot: corr.sefirot,
      chakra: corr.chakra,
      element: corr.element,
      orixa: corr.orixa,
      affirmation: corr.affirmation,
      frequency: corr.frequency,
      planet: corr.planet,
      archetype: corr.archetype,
      color: corr.color,
      bodyPart: corr.bodyPart,
    },
  };
}

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = SefirotQuerySchema.safeParse({
      sefira: searchParams.get('sefira'),
      language: searchParams.get('language'),
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

    const { sefira, language, sefirot, chakra, element, orixa } = parseResult.data;
    const rawSefirot = getMeanings();

    // Filter by spiritual correlations
    if (sefirot || chakra || element || orixa) {
      const filtered = VALID_SEFIRA_NAMES
// fallow-ignore-next-line complexity
        .filter(name => {
          const corr = SEPHIRAH_SPIRITUAL_CORRELATIONS[name];
          if (!corr) return false;
          if (sefirot && !corr.sefirot.includes(sefirot)) return false;
          if (chakra && corr.chakra !== chakra) return false;
          if (element && corr.element !== element) return false;
          if (orixa && corr.orixa !== orixa) return false;
          return true;
        })
        .map(name => enrichSefira(rawSefirot[name as keyof typeof rawSefirot], name));

      if (filtered.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Nenhuma sefira encontrada para os filtros especificados',
          filters: { sefirot, chakra, element, orixa },
        }, { status: 404 });
      }

      const spiritualStats = {
        bySefirot: filtered.reduce((acc, s) => {
          const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
          if (sc?.sefirot) {
            sc.sefirot.forEach(sf => { acc[sf] = (acc[sf] || 0) + 1; });
          }
          return acc;
        }, {} as Record<string, number>),
        byChakra: filtered.reduce((acc, s) => {
          const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
          if (sc?.chakra) {
            acc[sc.chakra] = (acc[sc.chakra] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        byElement: filtered.reduce((acc, s) => {
          const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
          if (sc?.element) {
            acc[sc.element] = (acc[sc.element] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        byOrixa: filtered.reduce((acc, s) => {
          const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
          if (sc?.orixa) {
            acc[sc.orixa] = (acc[sc.orixa] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        success: true,
        sefirot: filtered,
        meta: {
          total: filtered.length,
          language,
          filters: { sefirot, chakra, element, orixa },
        },
        spiritualCorrelations: SEPHIRAH_SPIRITUAL_CORRELATIONS,
        spiritualStats,
      });
    }

    if (sefira) {
      const normalizedSefira = normalizeSefiraName(sefira);
      const sefirotData = rawSefirot[normalizedSefira as keyof typeof rawSefirot];

      if (sefirotData) {
        return NextResponse.json({
          success: true,
          sefira: enrichSefira(sefirotData, normalizedSefira),
          spiritualCorrelations: SEPHIRAH_SPIRITUAL_CORRELATIONS,
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Sefira not found',
        validSefirot: VALID_SEFIRA_NAMES,
      }, { status: 404 });
    }

    // Return all sefirot with spiritual correlations
    const enrichedSefirot = VALID_SEFIRA_NAMES.map(name => {
      const sefiraData = rawSefirot[name as keyof typeof rawSefirot];
      return enrichSefira(sefiraData, name);
    });

    const spiritualStats = {
      bySefirot: enrichedSefirot.reduce((acc, s) => {
        const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
        if (sc?.sefirot) {
          sc.sefirot.forEach(sf => { acc[sf] = (acc[sf] || 0) + 1; });
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: enrichedSefirot.reduce((acc, s) => {
        const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
        if (sc?.chakra) {
          acc[sc.chakra] = (acc[sc.chakra] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byElement: enrichedSefirot.reduce((acc, s) => {
        const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
        if (sc?.element) {
          acc[sc.element] = (acc[sc.element] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byOrixa: enrichedSefirot.reduce((acc, s) => {
        const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
        if (sc?.orixa) {
          acc[sc.orixa] = (acc[sc.orixa] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byPlanet: enrichedSefirot.reduce((acc, s) => {
        const sc = (s as Record<string, unknown>).spiritualCorrelations as typeof SEPHIRAH_SPIRITUAL_CORRELATIONS[string];
        if (sc?.planet) {
          acc[sc.planet] = (acc[sc.planet] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      sefirot: enrichedSefirot,
      meta: {
        total: enrichedSefirot.length,
        language,
      },
      spiritualCorrelations: SEPHIRAH_SPIRITUAL_CORRELATIONS,
      spiritualStats,
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar sefirot',
    }, { status: 500 });
  }
}