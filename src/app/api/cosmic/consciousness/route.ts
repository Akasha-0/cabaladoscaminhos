import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ConsciousnessLevelSchema = z.enum([
  'physical', 'emotional', 'mental', 'spiritual', 'cosmic', 'divine'
]);

const ConsciousnessQuerySchema = z.object({
  id: ConsciousnessLevelSchema.optional(),
  minFrequency: z.coerce.number().min(0).optional(),
  maxFrequency: z.coerce.number().max(1000).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Consciousness Levels with Spiritual Correlations ──────────────────────────────────────────
const CONSCIOUSNESS_DATA = [
  {
    id: 'physical',
    level: 'Physical',
    levelPt: 'Físico',
    frequency: 100,
    description: 'Material plane consciousness focused on physical existence',
    descriptionPt: 'Consciência do plano material focada na existência física',
    attributes: ['survival', 'stability', 'body awareness'],
    attributesPt: ['sobrevivência', 'estabilidade', 'consciência corporal'],
    element: 'Terra',
    sefirot: ['Malkuth'],
    chakra: 1,
    orixa: 'Ogum',
    affirmation: 'Sou seguro em meu corpo físico',
    practices: ['yoga', 'exercício físico', 'trabalho corporal'],
  },
  {
    id: 'emotional',
    level: 'Emotional',
    levelPt: 'Emocional',
    frequency: 200,
    description: 'Feeling consciousness connected to heart energy',
    descriptionPt: 'Consciência sentimental conectada à energia do coração',
    attributes: ['emotions', 'relationships', 'intuition'],
    attributesPt: ['emoções', 'relacionamentos', 'intuição'],
    element: 'Água',
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 4,
    orixa: 'Oxum',
    affirmation: 'O amor flui através do meu coração',
    practices: ['meditação loving-kindness', 'trabalho emocional', 'arte-terapia'],
  },
  {
    id: 'mental',
    level: 'Mental',
    levelPt: 'Mental',
    frequency: 300,
    description: 'Thinking consciousness of the mind',
    descriptionPt: 'Consciência pensante da mente',
    attributes: ['logic', 'reasoning', 'analysis'],
    attributesPt: ['lógica', 'raciocínio', 'análise'],
    element: 'Ar',
    sefirot: ['Hod', 'Chokhmah'],
    chakra: 5,
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria ilumina minha mente',
    practices: ['estudo', 'meditação zen', ' journaling'],
 },
  {
    id: 'spiritual',
    level: 'Spiritual',
    levelPt: 'Espiritual',
    frequency: 400,
    description: 'Higher consciousness connected to spirit',
    descriptionPt: 'Consciência superior conectada ao espírito',
    attributes: ['wisdom', 'compassion', 'truth'],
    attributesPt: ['sabedoria', 'compaixão', 'verdade'],
    element: 'Fogo',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 6,
    orixa: 'Oxalá',
    affirmation: 'Eu sou um canal de luz e verdade',
    practices: ['oração', 'ritual', 'serviço desinteressado'],
  },
  {
    id: 'cosmic',
    level: 'Cosmic',
    levelPt: 'Cósmico',
    frequency: 500,
    description: 'Universal consciousness beyond individual self',
    descriptionPt: 'Consciência universal além do eu individual',
    attributes: ['unity', 'interconnection', 'transcendence'],
    attributesPt: ['unidade', 'interconexão', 'transcendência'],
    element: 'Éter',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    orixa: 'Oxalá',
    affirmation: 'Sou um com o universo',
    practices: ['meditação transcendental', 'contemplação cósmica', 'pranayama'],
  },
  {
    id: 'divine',
    level: 'Divine',
    levelPt: 'Divino',
    frequency: 600,
    description: 'Divine consciousness united with source',
    descriptionPt: 'Consciência divina unida à fonte',
    attributes: ['enlightenment', 'unity', 'divinity'],
    attributesPt: ['iluminação', 'unidade', 'divindade'],
    element: 'Éter',
    sefirot: ['Kether', 'Binah'],
    chakra: 7,
    orixa: 'Oxalá',
    affirmation: 'Eu sou a luz divina em forma humana',
    practices: ['samadhi', 'união com o divino', 'serviço iluminado'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ConsciousnessQuerySchema.safeParse({
      id: searchParams.get('id'),
      minFrequency: searchParams.get('minFrequency'),
      maxFrequency: searchParams.get('maxFrequency'),
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

    const { id, minFrequency, maxFrequency, sefirot, chakra, element } = parseResult.data;

    let consciousness = [...CONSCIOUSNESS_DATA];

    // Filter by id
    if (id) {
      consciousness = consciousness.filter(c => c.id === id);
    }

    // Filter by frequency range
    if (minFrequency !== undefined) {
      consciousness = consciousness.filter(c => c.frequency >= minFrequency);
    }
    if (maxFrequency !== undefined) {
      consciousness = consciousness.filter(c => c.frequency <= maxFrequency);
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
      totalLevels: CONSCIOUSNESS_DATA.length,
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