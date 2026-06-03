// ============================================================
// OFFERINGS API - CABALA DOS CAMINHOS
// Enhanced with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────
const OfferingTypeSchema = z.enum(['ebo', 'oferenda', 'libacao', 'defumacao', 'vela']);
const ElementTypeSchema = z.enum(['agua', 'terra', 'fogo', 'ar', 'orixa']);
const IntensityLevelSchema = z.enum(['suave', 'medio', 'forte']);

const OfferingQuerySchema = z.object({
  type: OfferingTypeSchema.optional(),
  orixa: z.string().optional(),
  element: ElementTypeSchema.optional(),
  dia: z.enum(['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']).optional(),
  id: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
  frequency: z.string().optional(),
});

const CreateOfferingSchema = z.object({
  type: OfferingTypeSchema,
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  orixa: z.string().optional(),
  element: ElementTypeSchema.optional(),
  ingredients: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  bestDays: z.array(z.enum(['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'])).optional(),
  moonPhase: z.enum(['nova', 'crescente', 'cheia', 'minguante']).optional(),
  intensity: IntensityLevelSchema.optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
type OfferingType = z.infer<typeof OfferingTypeSchema>;
type ElementType = z.infer<typeof ElementTypeSchema>;
type IntensityLevel = z.infer<typeof IntensityLevelSchema>;

interface OfferingItem {
  name: string;
  quantity: string;
}

interface Offering {
  id: string;
  name: string;
  type: OfferingType;
  description: string;
  element: ElementType;
  orixa?: string;
  items: OfferingItem[];
  instructions: string[];
  duration?: string;
  intensity: IntensityLevel;
  bestDays?: string[];
  moonPhase?: string;
  chakra?: number;
  sefirot?: string;
  sefirotCorrespondencia?: string[];
  beneficios?: string[];
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}
// fallow-ignore-next-line unused-type
export type { Offering, OfferingItem, OfferingType, ElementType, IntensityLevel };
export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Each Offering ──────────────────────────────────────────
const OFFERING_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'ebo-ogum': { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Ogum abre meus caminhos com vitória', frequency: '396 Hz' },
  'ebo-oxossi': { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Oxóssi', affirmation: 'Oxóssi me guia na busca pelo conhecimento', frequency: '741 Hz' },
  'ebo-oxum': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'Oxum adorna minha vida com amor e prosperidade', frequency: '528 Hz' },
  'ebo-iemanja': { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'Iemanjá protege e abençoa minha jornada', frequency: '639 Hz' },
  'ebo-xango': { sefirot: ['Hod', 'Chesed'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Xangô traz justiça e equilíbrio ao meu caminho', frequency: '528 Hz' },
  'ebo-obaluaie': { sefirot: ['Malkuth', 'Binah'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'Omolu cura e purifica meu ser', frequency: '174 Hz' },
  'ebo-exu': { sefirot: ['Hod', 'Gevurah'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'Exu abre os caminhos para minhas mensagens', frequency: '417 Hz' },
  'oferenda-oxala': { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Oxalá ilumina minha paz e proteção', frequency: '963 Hz' },
  'oferenda-nana': { sefirot: ['Binah', 'Kether'], chakra: 7, element: 'Terra', orixa: 'Iemanjá', affirmation: 'Nanã ensina-me a sabedoria ancestral', frequency: '963 Hz' },
  'libacao-iansa': { sefirot: ['Gevurah', 'Netzach'], chakra: 3, element: 'Fogo', orixa: 'Iansã', affirmation: 'Iansã incendia minha coragem e transformação', frequency: '417 Hz' },
};

// ─── Offering Data ──────────────────────────────────────────────────────────
const offeringsBase: Offering[] = [
  {
    id: 'ebo-ogum',
    name: 'Ebó de Ogum',
    type: 'ebo',
    description: 'Oferta para abrir caminhos e conquistar vitória.',
    element: 'fogo',
    orixa: 'Ogum',
    items: [
      { name: 'Vela vermelha', quantity: '1' },
      { name: 'Azeite de dendê', quantity: 'pouco' },
      { name: 'Alho', quantity: '7 dentes' },
      { name: 'Pimenta dedo-de-moça', quantity: '3' },
    ],
    instructions: [
      'Acenda a vela vermelha em local seguro',
      'Unte a vela com azeite de dendê',
      'Coloque o alho e a pimenta ao redor',
      'Pede a Ogum que abra os caminhos',
      'Deixe queimar até o fim',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['terca', 'sexta'],
    moonPhase: 'crescente',
    chakra: 3,
    sefirot: 'Gevurah',
    beneficios: ['Coragem', 'Vitória', 'Proteção'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-ogum'],
  },
  {
    id: 'ebo-oxossi',
    name: 'Ebó de Oxóssi',
    type: 'ebo',
    description: 'Oferta para buscar conhecimento e proteção na caça espiritual.',
    element: 'ar',
    orixa: 'Oxóssi',
    items: [
      { name: 'Vela verde', quantity: '1' },
      { name: 'Fumo de paú', quantity: 'pouco' },
      { name: 'Canjica', quantity: '1 prato' },
      { name: 'Mel', quantity: 'a gosto' },
    ],
    instructions: [
      'Em local limpo e arejado',
      'Acenda a vela verde',
      'Queime o fumo de paú',
      'Ofereça a canjica com mel',
      'Peça a Oxóssi sabedoria e proteção',
    ],
    duration: '25 minutos',
    intensity: 'suave',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'cheia',
    chakra: 6,
    sefirot: 'Chokhmah',
    beneficios: ['Sabedoria', 'Conhecimento', 'Proteção na mata'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-oxossi'],
  },
  {
    id: 'ebo-oxum',
    name: 'Ebó de Oxum',
    type: 'ebo',
    description: 'Oferta para amor, prosperidade e doçura na vida.',
    element: 'agua',
    orixa: 'Oxum',
    items: [
      { name: 'Vela rosa', quantity: '1' },
      { name: 'Mel', quantity: '1 colher' },
      { name: 'Canela', quantity: '1 pau' },
      { name: 'Flores rosas', quantity: '7' },
    ],
    instructions: [
      'Em recipiente com água',
      'Acenda a vela rosa',
      'Adicione o mel e a canela',
      'Coloque as flores',
      'Peça a Oxum amor e abundância',
    ],
    duration: '20 minutos',
    intensity: 'suave',
    bestDays: ['quinta', 'sexta'],
    moonPhase: 'crescente',
    chakra: 4,
    sefirot: 'Netzach',
    beneficios: ['Amor', 'Prosperidade', 'Doçura'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-oxum'],
  },
  {
    id: 'ebo-iemanja',
    name: 'Ebó de Iemanjá',
    type: 'ebo',
    description: 'Oferta para proteção das águas e bênçãos maternas.',
    element: 'agua',
    orixa: 'Iemanjá',
    items: [
      { name: 'Vela branca', quantity: '1' },
      { name: 'Alecrim', quantity: '1 maço' },
      { name: 'Canjica branca', quantity: '1 prato' },
      { name: 'Flores brancas', quantity: '9' },
    ],
    instructions: [
      'Na beira do mar ou em casa',
      'Acenda a vela branca',
      'Prepare o alecrim para defumação',
      'Ofereça a canjica',
      'Peça a Iemanjá proteção e bênçãos',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['segunda', 'sabado'],
    moonPhase: 'cheia',
    chakra: 2,
    sefirot: 'Yesod',
    beneficios: ['Proteção', 'Maternidade', 'Harmonia'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-iemanja'],
  },
  {
    id: 'ebo-xango',
    name: 'Ebó de Xangô',
    type: 'ebo',
    description: 'Oferta para justiça, poder e equilíbrio.',
    element: 'fogo',
    orixa: 'Xangô',
    items: [
      { name: 'Vela laranja', quantity: '1' },
      { name: 'Amalá', quantity: '1 prato' },
      { name: 'Pimenta calabresa', quantity: 'a gosto' },
      { name: 'Fumo de Carijó', quantity: 'pouco' },
    ],
    instructions: [
      'Acenda a vela laranja',
      'Sirva o amalá com pimenta',
      'Queime o fumo de Carijó',
      'Peça a Xangô justiça e equilíbrio',
      'Deixe a oferenda por 24 horas',
    ],
    duration: '35 minutos',
    intensity: 'forte',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'cheia',
    chakra: 3,
    sefirot: 'Hod',
    beneficios: ['Justiça', 'Equilíbrio', 'Poder'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-xango'],
  },
  {
    id: 'ebo-obaluaie',
    name: 'Ebó de Obaluaiê',
    type: 'ebo',
    description: 'Oferta para cura de doenças e purificação.',
    element: 'terra',
    orixa: 'Omolu',
    items: [
      { name: 'Vela preta', quantity: '1' },
      { name: 'Pipoca', quantity: '1 pacote' },
      { name: 'Banha de coco', quantity: 'pouco' },
      { name: 'Alfavaca', quantity: '1 maço' },
    ],
    instructions: [
      'Em local limpo',
      'Acenda a vela preta',
      'Prepare a pipoca com banha',
      'Defume com alfavaca',
      'Peça a Obaluaiê cura e purificação',
    ],
    duration: '40 minutos',
    intensity: 'forte',
    bestDays: ['terca', 'sexta'],
    moonPhase: 'nova',
    chakra: 1,
    sefirot: 'Malkuth',
    beneficios: ['Cura', 'Purificação', 'Proteção contra doenças'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-obaluaie'],
  },
  {
    id: 'ebo-exu',
    name: 'Ebó de Exu',
    type: 'ebo',
    description: 'Oferta para abrir caminhos e eliminar bloqueios.',
    element: 'fogo',
    orixa: 'Exu',
    items: [
      { name: 'Vela preta', quantity: '1' },
      { name: 'Pinga', quantity: '1 dose' },
      { name: 'Fumo de charuto', quantity: '1 charuto' },
      { name: 'Pão preto', quantity: '1 pedaço' },
    ],
    instructions: [
      'Na encruzilhada ou em casa',
      'Acenda a vela preta',
      'Coloque a pinga e o pão',
      'Queime o charuto',
      'Peça a Exu que abra os caminhos',
    ],
    duration: '20 minutos',
    intensity: 'forte',
    bestDays: ['segunda', 'quinta'],
    moonPhase: 'nova',
    chakra: 1,
    sefirot: 'Malkuth',
    beneficios: ['Abertura de caminhos', 'Comunicação', 'Movimentação'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['ebo-exu'],
  },
  {
    id: 'oferenda-oxala',
    name: 'Oferenda de Oxalá',
    type: 'oferenda',
    description: 'Oferta para paz, luz e proteção espiritual.',
    element: 'ar',
    orixa: 'Oxalá',
    items: [
      { name: 'Vela branca', quantity: '2' },
      { name: 'Inhame', quantity: '1 prato' },
      { name: 'Farinha de rosca', quantity: 'pouco' },
      { name: 'Água de cheiro', quantity: '1 copo' },
    ],
    instructions: [
      'Vista branco',
      'Acenda as velas brancas',
      'Sirva o inhame com farinha',
      'Ofereça a água de cheiro',
      'Peça a Oxalá paz e proteção',
    ],
    duration: '25 minutos',
    intensity: 'suave',
    bestDays: ['domingo'],
    moonPhase: 'crescente',
    chakra: 7,
    sefirot: 'Kether',
    beneficios: ['Paz', 'Luz', 'Proteção espiritual'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['oferenda-oxala'],
  },
  {
    id: 'oferenda-nana',
    name: 'Oferenda de Nanã',
    type: 'oferenda',
    description: 'Oferta para sabedoria ancestral e morte/renascimento.',
    element: 'terra',
    orixa: 'Nanã',
    items: [
      { name: 'Vela roxa', quantity: '1' },
      { name: 'Quiabo', quantity: '7 unidades' },
      { name: 'Algodão', quantity: 'pouco' },
      { name: 'Folhas secas', quantity: '1 maço' },
    ],
    instructions: [
      'Em reverência a Nanã',
      'Acenda a vela roxa',
      'Ofereça o quiabo',
      'Coloque o algodão e as folhas',
      'Peça sabedoria e renovação',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['sabado'],
    moonPhase: 'minguante',
    chakra: 7,
    sefirot: 'Binah',
    beneficios: ['Sabedoria ancestral', 'Renovação', 'Transformação'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['oferenda-nana'],
  },
  {
    id: 'libacao-iansa',
    name: 'Libação de Iansã',
    type: 'libacao',
    description: 'Libação para coragem, fogo e transformação.',
    element: 'fogo',
    orixa: 'Iansã',
    items: [
      { name: 'Vela laranja', quantity: '1' },
      { name: 'Azeite', quantity: 'pouco' },
      { name: 'Pimenta', quantity: 'a gosto' },
      { name: 'Água', quantity: '1 copo' },
    ],
    instructions: [
      'Acenda a vela laranja',
      'Misture azeite e pimenta na água',
      'Beba a libação com intenção',
      'Peça a Iansã coragem e fogo',
    ],
    duration: '15 minutos',
    intensity: 'medio',
    bestDays: ['quarta', 'sexta'],
    moonPhase: 'crescente',
    chakra: 3,
    sefirot: 'Gevurah',
    beneficios: ['Coragem', 'Fogo interior', 'Transformação'],
    spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS['libacao-iansa'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = OfferingQuerySchema.safeParse({
      type: searchParams.get('type'),
      orixa: searchParams.get('orixa'),
      element: searchParams.get('element'),
      dia: searchParams.get('dia'),
      id: searchParams.get('id'),
      limit: searchParams.get('limit'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      frequency: searchParams.get('frequency'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, orixa, element, dia, id, limit, chakra, sefirot, frequency } = parseResult.data;
    let offerings = [...offeringsBase];

    if (id) {
      const offering = offerings.find(o => o.id === id);
      if (!offering) {
        return NextResponse.json({
          success: false,
          error: 'Oferta não encontrada',
          availableIds: offerings.map(o => o.id),
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        offering,
        spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS,
      });
    }

    if (type) {
      offerings = offerings.filter(o => o.type === type);
    }

    if (orixa) {
      offerings = offerings.filter(o =>
        o.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (element) {
      offerings = offerings.filter(o => o.element === element);
    }

    if (dia) {
      offerings = offerings.filter(o => o.bestDays?.includes(dia));
    }

    if (chakra) {
      offerings = offerings.filter(o => o.chakra === chakra);
    }

    if (sefirot) {
      offerings = offerings.filter(o => o.sefirot === sefirot);
    }

    if (frequency) {
      offerings = offerings.filter(o =>
        o.spiritualCorrelations?.frequency?.includes(frequency)
      );
    }

    if (limit) {
      offerings = offerings.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: offerings.reduce((acc, o) => {
        const sc = o.spiritualCorrelations;
        if (sc) {
          sc.sefirot.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: offerings.reduce((acc, o) => {
        const ch = o.spiritualCorrelations?.chakra || o.chakra;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: offerings.reduce((acc, o) => {
        const el = o.spiritualCorrelations?.element || o.element;
        if (el) acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: offerings.reduce((acc, o) => {
        const or = o.spiritualCorrelations?.orixa || o.orixa;
        if (or) acc[or] = (acc[or] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const stats = {
      byType: offeringsBase.reduce((acc, o) => {
        acc[o.type] = (acc[o.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: offeringsBase.reduce((acc, o) => {
        if (o.orixa) acc[o.orixa] = (acc[o.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: offeringsBase.reduce((acc, o) => {
        acc[o.element] = (acc[o.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: offeringsBase.reduce((acc, o) => {
        if (o.chakra) acc[o.chakra] = (acc[o.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };

    return NextResponse.json({
      success: true,
      offerings,
      total: offerings.length,
      filters: { type, orixa, element, dia, chakra, sefirot, frequency },
      spiritualCorrelations: OFFERING_SPIRITUAL_CORRELATIONS,
      spiritualStats,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = CreateOfferingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, name, description, orixa, element, ingredients, instructions, bestDays, moonPhase, intensity, chakra, sefirot } = parseResult.data;

    const offering: Offering = {
      id: crypto.randomUUID(),
      name,
      type,
      description: description || '',
      element: element || 'orixa',
      orixa,
      items: ingredients?.map(i => ({ name: i, quantity: '' })) || [],
      instructions: instructions?.split('\n').filter(Boolean) || [],
      intensity: intensity || 'medio',
      bestDays,
      moonPhase,
      chakra,
      sefirot,
    };

    return NextResponse.json({
      success: true,
      offering,
      message: 'Oferta criada com sucesso',
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}