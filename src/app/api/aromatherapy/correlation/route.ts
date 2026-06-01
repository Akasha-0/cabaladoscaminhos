import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  RITUAL_FRAGRANCES,
  DAY_DEFUMATIONS,
  DEFUMATION_BLENDS,
  getFragranceForDay,
  getDefumationForDay,
  getDefumationBlend,
} from '@/lib/aromatherapy/ritual-fragrances';
import { analyzeDay, getDayName } from '@/lib/correlation/day-portal-analyzer';
import { getLunarPhase } from '@/lib/correlation/lunar-phase-analyzer';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const AromatherapyQuerySchema = z.object({
  type: z.enum(['today', 'week', 'blend', 'all']).optional(),
  blendId: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Aromatherapy ──────────────────────────────────────────
const FRAGRANCE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  segunda: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Inicio minha semana com propósito sagrado',
    frequency: '963 Hz',
  },
  terca: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A força e a coragem me guiam',
    frequency: '528 Hz',
  },
  quarta: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria flui através de mim',
    frequency: '741 Hz',
  },
  quinta: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O amor e a harmonia me sustentam',
    frequency: '528 Hz',
  },
  sexta: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A paz e a purificação me envolvem',
    frequency: '417 Hz',
  },
  sabado: {
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A sabedoria ancestral me guia',
    frequency: '396 Hz',
  },
  domingo: {
    sefirot: ['Tipheret', 'Kether'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A luz divina me ilumina',
    frequency: '528 Hz',
  },
};

const DEFUMATION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  segunda: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Purifico meu espaço com luz branca',
    frequency: '963 Hz',
  },
  terca: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Queimo as barreiras com força',
    frequency: '528 Hz',
  },
  quarta: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A fumação traz clareza mental',
    frequency: '741 Hz',
  },
  quinta: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O amor flui em meu ambiente',
    frequency: '528 Hz',
  },
  sexta: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As águas purificam meu lar',
    frequency: '417 Hz',
  },
  sabado: {
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A sabedoria antiga me protege',
    frequency: '396 Hz',
  },
  domingo: {
    sefirot: ['Tipheret', 'Kether'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A luz sagrada banha meu espaço',
    frequency: '528 Hz',
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = AromatherapyQuerySchema.safeParse({
    type: searchParams.get('type'),
    blendId: searchParams.get('blendId'),
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

  const { type, blendId, sefirot, chakra, element, orixa } = parseResult.data;
  const today = new Date();

  try {
    if (type === 'today') {
      const dayName = getDayName(today);
      const fragrance = getFragranceForDay(dayName);
      const defumation = getDefumationForDay(dayName);
      const dayAnalysis = analyzeDay(dayName);
      const lunarPhase = getLunarPhase(today);

      // Get spiritual correlations for today
      const fragranceCorrelations = FRAGRANCE_SPIRITUAL_CORRELATIONS[dayName] || FRAGRANCE_SPIRITUAL_CORRELATIONS.domingo;
      const defumationCorrelations = DEFUMATION_SPIRITUAL_CORRELATIONS[dayName] || DEFUMATION_SPIRITUAL_CORRELATIONS.domingo;

      return NextResponse.json({
        success: true,
        data: {
          day: dayName,
          lunarPhase: lunarPhase.name,
          ritualFragrance: {
            ...fragrance,
            spiritualCorrelations: fragranceCorrelations,
          },
          defumation: {
            ...defumation,
            spiritualCorrelations: defumationCorrelations,
          },
          dayPortal: dayAnalysis,
          recommendation: `Para hoje (${dayName}), use ${fragrance?.essencia.join(' e ')} com ${fragrance?.resina.join(' e ')} para ${fragrance?.proposito}`,
 },
        spiritualCorrelations: {
          fragrance: fragranceCorrelations,
          defumation: defumationCorrelations,
        },
      });
    }

    if (type === 'week') {
      // Enhance week data with spiritual correlations
      const enhancedFragrances = RITUAL_FRAGRANCES.map(f => ({
        ...f,
        spiritualCorrelations: FRAGRANCE_SPIRITUAL_CORRELATIONS[f.diaSemana] || FRAGRANCE_SPIRITUAL_CORRELATIONS.domingo,
      }));

      const enhancedDefumations = DAY_DEFUMATIONS.map(d => ({
        ...d,
        spiritualCorrelations: DEFUMATION_SPIRITUAL_CORRELATIONS[d.dia] || DEFUMATION_SPIRITUAL_CORRELATIONS.domingo,
      }));

      return NextResponse.json({
        success: true,
        data: {
          fragrances: enhancedFragrances,
          defumations: enhancedDefumations,
        },
        spiritualCorrelations: {
          fragrances: FRAGRANCE_SPIRITUAL_CORRELATIONS,
          defumations: DEFUMATION_SPIRITUAL_CORRELATIONS,
        },
      });
    }

    if (type === 'blend') {
      if (blendId) {
        const blend = getDefumationBlend(blendId);
        if (!blend) {
          return NextResponse.json({ success: false, error: 'Blend não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: blend });
      }
      return NextResponse.json({ success: true, data: DEFUMATION_BLENDS });
    }

    // Default: all fragrances with spiritual correlations
    const enhancedFragrances = RITUAL_FRAGRANCES.map(f => ({
      ...f,
      spiritualCorrelations: FRAGRANCE_SPIRITUAL_CORRELATIONS[f.diaSemana] || FRAGRANCE_SPIRITUAL_CORRELATIONS.domingo,
    }));

    const enhancedDefumations = DAY_DEFUMATIONS.map(d => ({
      ...d,
      spiritualCorrelations: DEFUMATION_SPIRITUAL_CORRELATIONS[d.dia] || DEFUMATION_SPIRITUAL_CORRELATIONS.domingo,
    }));

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: Object.values(FRAGRANCE_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        c.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: Object.values(FRAGRANCE_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        acc[c.chakra] = (acc[c.chakra] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: Object.values(FRAGRANCE_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        acc[c.element] = (acc[c.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: Object.values(FRAGRANCE_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        acc[c.orixa] = (acc[c.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: {
        fragrances: enhancedFragrances,
        defumations: enhancedDefumations,
        blends: DEFUMATION_BLENDS,
      },
      spiritualCorrelations: {
        fragrances: FRAGRANCE_SPIRITUAL_CORRELATIONS,
        defumations: DEFUMATION_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
      meta: {
        filters: { sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}