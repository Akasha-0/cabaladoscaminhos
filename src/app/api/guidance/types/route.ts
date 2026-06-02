import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { parseSpiritualFilters } from '@/lib/api/parse-spiritual-filters';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const GuidanceTypeSchema = z.enum([
  'tarot',
  'numerology',
  'astrology',
  'cabala',
  'ifa',
  'orixa',
  'chakras',
  'meditation',
  'ritual',
]);

const GuidanceQuerySchema = z.object({
  type: GuidanceTypeSchema.optional(),
  includeDetails: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

// ─── Type Definitions ────────────────────────────────────────────────────────
interface GuidanceType {
  id: string;
  name: string;
  namePt: string;
  description: string;
  icon: string;
  traditions: string[];
  elements: string[];
  chakras: number[];
  sefirot: string[];
  orixa: string[];
  affirmation: string;
  frequency: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

// ─── Spiritual Correlations for Guidance Types ──────────────────────────────────────────
const GUIDANCE_SPIRITUAL_CORRELATIONS: Record<
  string,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  tarot: {
    sefirot: [
      'Kether',
      'Chokhmah',
      'Binah',
      'Chesed',
      'Gevurah',
      'Tipheret',
      'Netzach',
      'Hod',
      'Yesod',
      'Malkuth',
    ],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria divina me guia através dos símbolos',
    frequency: '528 Hz',
  },
  numerology: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Os números revelam minha verdade interior',
    frequency: '432 Hz',
  },
  astrology: {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tipheret'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Iemanjá',
    affirmation: 'Os astros revelam meu caminho cósmico',
    frequency: '639 Hz',
  },
  cabala: {
    sefirot: [
      'Kether',
      'Chokhmah',
      'Binah',
      'Chesed',
      'Gevurah',
      'Tipheret',
      'Netzach',
      'Hod',
      'Yesod',
      'Malkuth',
    ],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A Árvore da Vida me conecta à fonte',
    frequency: '963 Hz',
  },
  ifa: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Os Odús revelam meu destino sagrado',
    frequency: '417 Hz',
  },
  orixa: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Orixás me guiam e protegem',
    frequency: '417 Hz',
  },
  chakras: {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Os chakras fluem em harmonia perfeita',
    frequency: '528 Hz',
  },
  meditation: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'No silêncio, encontro minha essência',
    frequency: '963 Hz',
  },
  ritual: {
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual sagrado transforma minha realidade',
    frequency: '528 Hz',
  },
};

// ─── Guidance Types with Full Spiritual Correlations ──────────────────────────────────────────
const GUIDANCE_TYPES: GuidanceType[] = [
  {
    id: 'tarot',
    name: 'Tarot',
    namePt: 'Tarô',
    description: 'Guidance through tarot card readings with symbolic wisdom',
    icon: 'cards',
    traditions: ['Egípcia', 'Cabalística', 'Hermética'],
    elements: ['Ar'],
    chakras: [6, 7],
    sefirot: [
      'Kether',
      'Chokhmah',
      'Binah',
      'Chesed',
      'Gevurah',
      'Tipheret',
      'Netzach',
      'Hod',
      'Yesod',
      'Malkuth',
    ],
    orixa: ['Oxalá'],
    affirmation: 'A sabedoria divina me guia através dos símbolos',
    frequency: '528 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['tarot'],
  },
  {
    id: 'numerology',
    name: 'Numerology',
    namePt: 'Numerologia',
    description: 'Guidance through numerological analysis of names and dates',
    icon: 'numbers',
    traditions: ['Pitagórica', 'Cabala', 'Tântrica'],
    elements: ['Fogo', 'Terra'],
    chakras: [1, 3, 6],
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    orixa: ['Orunmilá'],
    affirmation: 'Os números revelam minha verdade interior',
    frequency: '432 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['numerology'],
  },
  {
    id: 'astrology',
    name: 'Astrology',
    namePt: 'Astrologia',
    description: 'Guidance through astrological insights of planetary positions',
    icon: 'stars',
    traditions: ['Ocidental', 'Védica', 'Chinesa'],
    elements: ['Fogo', 'Terra', 'Ar', 'Água'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tipheret'],
    orixa: ['Oxalá', 'Iemanjá'],
    affirmation: 'Os astros revelam meu caminho cósmico',
    frequency: '639 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['astrology'],
  },
  {
    id: 'cabala',
    name: 'Kabbalah',
    namePt: 'Cabala',
    description: 'Guidance through Kabbalistic wisdom of the Tree of Life',
    icon: 'tree',
    traditions: ['Judaica', 'Hermética', 'Cabalística'],
    elements: ['Éter'],
    chakras: [6, 7],
    sefirot: [
      'Kether',
      'Chokhmah',
      'Binah',
      'Chesed',
      'Gevurah',
      'Tipheret',
      'Netzach',
      'Hod',
      'Yesod',
      'Malkuth',
    ],
    orixa: ['Oxalá'],
    affirmation: 'A Árvore da Vida me conecta à fonte',
    frequency: '963 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['cabala'],
  },
  {
    id: 'ifa',
    name: 'Ifá',
    namePt: 'Ifá',
    description: 'Guidance through the sacred wisdom of Ifá oracle',
    icon: 'opalele',
    traditions: ['Yorubá', 'Afro-Brasileira'],
    elements: ['Água'],
    chakras: [6],
    sefirot: ['Binah', 'Yesod'],
    orixa: ['Orunmilá'],
    affirmation: 'Os Odús revelam meu destino sagrado',
    frequency: '417 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['ifa'],
  },
  {
    id: 'orixa',
    name: 'Orixá Guidance',
    namePt: 'Orientação por Orixá',
    description: 'Guidance through the energy of your head Orixá',
    icon: 'orixa',
    traditions: ['Candomblé', 'Umbanda', 'Yorubá'],
    elements: ['Água', 'Fogo'],
    chakras: [2, 4],
    sefirot: ['Binah', 'Chokhmah'],
    orixa: ['Iemanjá', 'Oxum', 'Ogum', 'Xangô'],
    affirmation: 'Orixás me guiam e protegem',
    frequency: '417 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'chakras',
    name: 'Chakra Healing',
    namePt: 'Cura de Chakras',
    description: 'Guidance through chakra balancing and energy healing',
    icon: 'chakra',
    traditions: ['Tântrica', 'Indiana', 'Yoga'],
    elements: ['Fogo', 'Água'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach'],
    orixa: ['Oxum'],
    affirmation: 'Os chakras fluem em harmonia perfeita',
    frequency: '528 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['chakras'],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Guidance through meditation practices for spiritual growth',
    icon: 'lotus',
    traditions: ['Budista', 'Hindu', 'Sufi'],
    elements: ['Éter'],
    chakras: [6, 7],
    sefirot: ['Kether', 'Chokhmah'],
    orixa: ['Oxalá'],
    affirmation: 'No silêncio, encontro minha essência',
    frequency: '963 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['meditation'],
  },
  {
    id: 'ritual',
    name: 'Ritual Practice',
    namePt: 'Prática Ritual',
    description: 'Guidance through sacred rituals for transformation',
    icon: 'ritual',
    traditions: ['Candomblé', 'Cabala', 'Wicca'],
    elements: ['Fogo', 'Terra'],
    chakras: [3, 4],
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    orixa: ['Ogum', 'Xangô'],
    affirmation: 'O ritual sagrado transforma minha realidade',
    frequency: '528 Hz',
    spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS['ritual'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = parseSpiritualFilters(searchParams, 'type');
    if (!parsed.ok) return parsed.response;
    const { sefirot, chakra, element, orixa } = parsed.data;

    const parseResult = GuidanceQuerySchema.safeParse({
      type: searchParams.get('type'),
      includeDetails: searchParams.get('includeDetails'),
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { type, includeDetails } = parseResult.data;
    let guidanceTypes = [...GUIDANCE_TYPES];

    if (type) {
      guidanceTypes = guidanceTypes.filter((g) => g.id === type);
    }

    if (sefirot) {
      guidanceTypes = guidanceTypes.filter((g) =>
        g.spiritualCorrelations?.sefirot.includes(sefirot)
      );
    }

    if (chakra) {
      guidanceTypes = guidanceTypes.filter((g) => g.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      guidanceTypes = guidanceTypes.filter((g) => g.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      guidanceTypes = guidanceTypes.filter((g) => g.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: guidanceTypes.reduce(
        (acc, g) => {
          acc[g.id] = (acc[g.id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySefirot: guidanceTypes.reduce(
        (acc, g) => {
          g.spiritualCorrelations?.sefirot.forEach((s) => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
      byChakra: guidanceTypes.reduce(
        (acc, g) => {
          const c = g.spiritualCorrelations?.chakra;
          if (c) acc[c] = (acc[c] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byElement: guidanceTypes.reduce(
        (acc, g) => {
          const e = g.spiritualCorrelations?.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byOrixa: guidanceTypes.reduce(
        (acc, g) => {
          const o = g.spiritualCorrelations?.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      success: true,
      guidanceTypes: includeDetails
        ? guidanceTypes
        : guidanceTypes.map((g) => ({
            id: g.id,
            name: g.name,
            namePt: g.namePt,
            description: g.description,
            icon: g.icon,
          })),
      count: guidanceTypes.length,
      spiritualCorrelations: GUIDANCE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, includeDetails, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}
