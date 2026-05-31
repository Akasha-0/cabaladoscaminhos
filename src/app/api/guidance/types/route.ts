import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const GuidanceTypeSchema = z.enum([
  'tarot', 'numerology', 'astrology', 'cabala',
  'ifa', 'orixa', 'chakras', 'meditation', 'ritual',
]);

const GuidanceQuerySchema = z.object({
  type: GuidanceTypeSchema.optional(),
  includeDetails: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
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
}

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
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    orixa: ['Oxalá'],
    affirmation: 'A sabedoria divina me guia através dos símbolos',
    frequency: '528 Hz',
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
  },
  {
    id: 'cabala',
    name: 'Kabbalah',
    namePt: 'Cabala',
    description: 'Guidance through kabbalistic wisdom of the Tree of Life',
    icon: 'tree',
    traditions: ['Judaica', 'Hermética', 'Cristã'],
    elements: ['Éter'],
    chakras: [6, 7],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    orixa: ['Oxalá'],
    affirmation: 'Caminho pela Árvore da Vida com clareza e propósito',
    frequency: '963 Hz',
  },
  {
    id: 'ifa',
    name: 'Ifá',
    namePt: 'Ifá',
    description: 'Guidance through Ifa divination with16 Odús',
    icon: 'oracle',
    traditions: ['Yorubá', 'Candomblé', 'Umbanda'],
    elements: ['Água', 'Fogo'],
    chakras: [5, 6],
    sefirot: ['Binah', 'Yesod'],
    orixa: ['Orunmilá', 'Obatalá'],
    affirmation: 'A sabedoria dos Odús guia meus passos',
    frequency: '741 Hz',
  },
  {
    id: 'orixa',
    name: 'Orixás',
    namePt: 'Orixás',
    description: 'Guidance through Orixá energy and ancestral wisdom',
    icon: 'orixa',
    traditions: ['Candomblé', 'Umbanda', 'Yorubá'],
    elements: ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    sefirot: ['Tipheret', 'Chesed', 'Gevurah', 'Netzach'],
    orixa: ['Oxum', 'Ogum', 'Iemanjá', 'Xangô', 'Iansã', 'Oxóssi', 'Nanã', 'Omolu', 'Obá', 'Logunede', 'Oxalá'],
    affirmation: 'A energia dos Orixás me sustenta e protege',
    frequency: '528 Hz',
  },
  {
    id: 'chakras',
    name: 'Chakras',
    namePt: 'Chakras',
    description: 'Guidance through chakra healing and energy balancing',
    icon: 'chakra',
    traditions: ['Yoga', 'Tantra', 'Tântrica'],
    elements: ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'],
    chakras: [1, 2, 3, 4, 5, 6, 7],
    sefirot: ['Kether', 'Tipheret', 'Malkuth'],
    orixa: ['Oxalá', 'Oxum', 'Iemanjá'],
    affirmation: 'Meus chakras irradiam luz harmoniosa e equilibrada',
    frequency: '639 Hz',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    namePt: 'Meditação',
    description: 'Guidance through sacred meditation practices',
    icon: 'lotus',
    traditions: ['Budista', 'Hindu', 'Sufi'],
    elements: ['Éter'],
    chakras: [6, 7],
    sefirot: ['Kether', 'Chokhmah'],
    orixa: ['Oxalá'],
    affirmation: 'Na quietude, encontro minha verdade interior',
    frequency: '432 Hz',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    namePt: 'Ritual',
    description: 'Guidance through spiritual rituals and ceremonies',
    icon: 'ritual',
    traditions: ['Mágica', 'Religiosa', 'Espiritual'],
    elements: ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'],
    chakras: [1, 3, 4, 7],
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    orixa: ['Oxalá', 'Ogum', 'Xangô'],
    affirmation: 'O ritual sagrado transforma e purifica minha energia',
    frequency: '528 Hz',
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = GuidanceQuerySchema.safeParse({
      type: searchParams.get('type'),
      includeDetails: searchParams.get('includeDetails'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, includeDetails, sefirot, chakra, element } = parseResult.data;

    let guidanceTypes = [...GUIDANCE_TYPES];

    // Filter by type
    if (type) {
      guidanceTypes = guidanceTypes.filter(g => g.id === type);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      guidanceTypes = guidanceTypes.filter(g => g.sefirot.includes(sefirot));
    }
    if (chakra) {
      guidanceTypes = guidanceTypes.filter(g => g.chakras.includes(chakra));
    }
    if (element) {
      guidanceTypes = guidanceTypes.filter(g => g.elements.includes(element));
    }

    // Statistics
    const stats = {
      byElement: GUIDANCE_TYPES.reduce((acc, g) => {
        g.elements.forEach(el => {
          acc[el] = (acc[el] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: GUIDANCE_TYPES.reduce((acc, g) => {
        g.chakras.forEach(ch => {
          acc[ch] = (acc[ch] || 0) + 1;
        });
        return acc;
      }, {} as Record<number, number>),
      bySefirot: GUIDANCE_TYPES.reduce((acc, g) => {
        g.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byOrixa: GUIDANCE_TYPES.reduce((acc, g) => {
        g.orixa.forEach(o => {
          acc[o] = (acc[o] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalTypes: GUIDANCE_TYPES.length,
    };

    return NextResponse.json({
      success: true,
      guidanceTypes: includeDetails ? guidanceTypes : guidanceTypes.map(g => ({
        id: g.id,
        name: g.name,
        namePt: g.namePt,
        description: g.description,
        icon: g.icon,
      })),
      total: guidanceTypes.length,
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}