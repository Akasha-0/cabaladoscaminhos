import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ConsciousnessDimensionSchema = z.object({
  id: z.string(),
  dimension: z.string(),
  dimensionPt: z.string().optional(),
  description: z.string(),
  descriptionPt: z.string().optional(),
  attributes: z.array(z.string()),
  attributesPt: z.array(z.string()).optional(),
  level: z.number().int().min(1).max(10),
  frequency: z.number().int().min(1),
  sefirot: z.array(SefirotSchema),
  chakra: ChakraSchema,
  element: ElementSchema,
  orixa: z.string(),
  affirmation: z.string(),
});

const ConsciousnessQuerySchema = z.object({
  id: z.string().optional(),
  level: z.coerce.number().int().min(1).max(10).optional(),
  minFrequency: z.coerce.number().int().positive().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Consciousness Dimensions with Spiritual Correlations ──────────────────────────────────────────
const CONSCIOUSNESS_DATA: z.infer<typeof ConsciousnessDimensionSchema>[] = [
  {
    id: 'finite',
    dimension: 'Finite',
    dimensionPt: 'Finito',
    level: 1,
    frequency: 100,
    description: 'Individual consciousness bound by physical perception',
    descriptionPt: 'Consciência individual limitada pela percepção física',
    attributes: ['separation', 'duality', 'time-bound'],
    attributesPt: ['separação', 'dualidade', 'limitado pelo tempo'],
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Estou enraizado na matéria sagrada',
  },
  {
    id: 'aware',
    dimension: 'Aware',
    dimensionPt: 'Consciente',
    level: 2,
    frequency: 200,
    description: 'Consciousness expanding through emotional awareness',
    descriptionPt: 'Consciência expandindo através da consciência emocional',
    attributes: ['feeling', 'connection', 'emotional intelligence'],
    attributesPt: ['sentimento', 'conexão', 'inteligência emocional'],
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 4,
    element: 'Água',
    orixa: 'Oxum',
    affirmation: 'O amor flui através da minha consciência expandida',
  },
  {
    id: 'expanding',
    dimension: 'Expanding',
    dimensionPt: 'Expandindo',
    level: 3,
    frequency: 300,
    description: 'Mental consciousness expanding beyond boundaries',
    descriptionPt: 'Consciência mental expandindo além das fronteiras',
    attributes: ['thought', 'imagination', 'creativity'],
    attributesPt: ['pensamento', 'imaginação', 'criatividade'],
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Minha mente expande-se para a sabedoria',
 },
  {
    id: 'transcendent',
    dimension: 'Transcendent',
    dimensionPt: 'Transcendente',
    level: 4,
    frequency: 400,
    description: 'Spiritual consciousness transcending individual self',
    descriptionPt: 'Consciência espiritual transcendendo o eu individual',
    attributes: ['wisdom', 'compassion', 'inner peace'],
    attributesPt: ['sabedoria', 'compaixão', 'paz interior'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Transcendo o ego e abraço minha essência espiritual',
  },
  {
    id: 'infinite',
    dimension: 'Infinite',
    dimensionPt: 'Infinito',
    level: 5,
    frequency: 500,
    description: 'Infinite consciousness united with universal mind',
    descriptionPt: 'Consciência infinita unida à mente universal',
    attributes: ['unity', 'interconnectedness', 'oneness'],
    attributesPt: ['unidade', 'interconexão', 'união'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou um com a consciência infinita do universo',
  },
  {
    id: 'eternal',
    dimension: 'Eternal',
    dimensionPt: 'Eterno',
    level: 6,
    frequency: 600,
    description: 'Eternal consciousness beyond time and space',
    descriptionPt: 'Consciência eterna além do tempo e espaço',
    attributes: ['timelessness', 'infinity', 'source'],
    attributesPt: ['atemporalidade', 'infinito', 'fonte'],
    sefirot: ['Kether', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou eterno, além do tempo e do espaço',
  },
  {
    id: 'source',
    dimension: 'Source',
    dimensionPt: 'Fonte',
    level: 7,
    frequency: 700,
    description: 'Consciousness merged with the Source of all existence',
    descriptionPt: 'Consciência fundida com a Fonte de toda existência',
    attributes: ['creation', 'omnipotence', 'omnipresence'],
    attributesPt: ['criação', 'onipresença', 'onisciência'],
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Eu sou a Fonte, a origem de toda consciência',
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = ConsciousnessQuerySchema.safeParse({
      id: searchParams.get('id'),
      level: searchParams.get('level'),
      minFrequency: searchParams.get('minFrequency'),
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

    const { id, level, minFrequency, sefirot, chakra, element } = parseResult.data;

    let consciousness = [...CONSCIOUSNESS_DATA];

    // Filter by id
    if (id) {
      const item = consciousness.find(c => c.id === id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Consciousness dimension not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, consciousness: item });
    }

    // Filter by level
    if (level !== undefined) {
      consciousness = consciousness.filter(c => c.level === level);
    }

    // Filter by min frequency
    if (minFrequency !== undefined) {
      consciousness = consciousness.filter(c => c.frequency >= minFrequency);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      consciousness = consciousness.filter(c => c.sefirot.includes(sefirot));
    }
    if (chakra) {
      consciousness = consciousness.filter(c => c.chakra === chakra);
    }
    if (element) {
      consciousness = consciousness.filter(c => c.element === element);
    }

    // Statistics
    const stats = {
      byElement: CONSCIOUSNESS_DATA.reduce((acc, c) => {
        acc[c.element] = (acc[c.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: CONSCIOUSNESS_DATA.reduce((acc, c) => {
        acc[c.chakra] = (acc[c.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: CONSCIOUSNESS_DATA.reduce((acc, c) => {
        c.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      frequencyRange: {
        min: Math.min(...CONSCIOUSNESS_DATA.map(c => c.frequency)),
        max: Math.max(...CONSCIOUSNESS_DATA.map(c => c.frequency)),
      },
      totalDimensions: CONSCIOUSNESS_DATA.length,
    };

    return NextResponse.json({
      success: true,
      consciousness,
      total: consciousness.length,
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