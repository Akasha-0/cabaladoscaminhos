import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SacredWaterSourceSchema = z.enum(['spring', 'rain', 'sea', 'river', 'lake', 'wellspring']);
const SacredWaterTypeSchema = z.enum(['charging', 'blessing', 'purification', 'healing']);

const SacredWaterSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  source: SacredWaterSourceSchema,
  element: z.string(),
  chakra: z.string(),
  vibration: z.number().int().min(1).max(10),
  properties: z.array(z.string()),
  uses: z.array(z.string()),
  spiritualSignificance: z.string(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const SacredWaterQuerySchema = z.object({
  type: SacredWaterTypeSchema.optional(),
  chakra: ChakraSchema.optional(),
  source: SacredWaterSourceSchema.optional(),
  sefirot: SefirotSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Sacred Waters ──────────────────────────────────────────
const SACRED_WATER_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'agua-de-chuva': {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Oxalá',
    affirmation: 'As bênçãos celestiais fluem através de mim',
    frequency: '963 Hz',
  },
  'agua-de-fonte': {
    sefirot: ['Chesed', 'Yesod'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A fonte da vida renova meu ser',
    frequency: '528 Hz',
  },
  'agua-do-mar': {
    sefirot: ['Binah', 'Malkuth'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A memória do mar purifica minha alma',
    frequency: '285 Hz',
  },
  'agua-de-rio': {
    sefirot: ['Netzach', 'Hod'],
    chakra: 1,
    element: 'Água',
    orixa: 'Oxum',
    affirmation: 'O fluxo da vida liberta meus padrões',
    frequency: '396 Hz',
  },
  'agua-sagrada-igreja': {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A luz divina purifica meu ser',
    frequency: '963 Hz',
  },
  'agua-de-lago': {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 5,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A paz do lago espelha minha alma',
    frequency: '639 Hz',
  },
  'agua-de-poço': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Das profundezas, a sabedoria emerge',
    frequency: '174 Hz',
  },
};

const SACRED_WATERS: z.infer<typeof SacredWaterSchema>[] = [
  {
    id: 'agua-de-chuva',
    name: 'Água de Chuva',
    nameEn: 'Rain Water',
    source: 'rain',
    element: 'Água',
    chakra: '6º (Ajna)',
    vibration: 9,
    properties: ['purifying', 'receptive', 'transformative', 'celestial'],
    uses: ['bênçãos celestiais', 'abertura espiritual', 'rituais de renovação', 'comunhão com o céu'],
    spiritualSignificance: 'Conecta com as bênçãos dos céus, carregada com energia lunar e cósmica.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-de-chuva'],
  },
  {
    id: 'agua-de-fonte',
    name: 'Água de Fonte',
    nameEn: 'Spring Water',
    source: 'spring',
    element: 'Água',
    chakra: '2º (Svadhisthana)',
    vibration: 8,
    properties: ['living', 'flowing', 'nourishing', 'youthful'],
    uses: ['hidratação espiritual', 'limpeza emocional', 'renovação interior', 'rituais de fertilidade'],
    spiritualSignificance: 'A água que brota da terra representa a fonte da vida e sabedoria interior.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-de-fonte'],
  },
  {
    id: 'agua-do-mar',
    name: 'Água do Mar',
    nameEn: 'Sea Water',
    source: 'sea',
    element: 'Água',
    chakra: '4º (Anahata)',
    vibration: 7,
    properties: ['salt', 'purifying', 'grounding', 'mysterious'],
    uses: ['banhos de sal grosso', 'limpeza de ambientes', 'ancoramento', 'proteção'],
    spiritualSignificance: 'Contém a memória do planeta, usada para limpeza profunda e proteção.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-do-mar'],
  },
  {
    id: 'agua-de-rio',
    name: 'Água de Rio',
    nameEn: 'River Water',
    source: 'river',
    element: 'Água',
    chakra: '1º (Muladhara)',
    vibration: 7,
    properties: ['flowing', 'cleansing', 'liberating', 'transitional'],
    uses: ['libertação de padrões', 'banhos de transformação', 'purificação em movimento', 'fluidez'],
    spiritualSignificance: 'Simboliza o fluxo da vida e a remoção contínua de energias densas.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-de-rio'],
  },
  {
    id: 'agua-sagrada-igreja',
    name: 'Água Benta',
    nameEn: 'Holy Water',
    source: 'spring',
    element: 'Água',
    chakra: '7º (Sahasrara)',
    vibration: 10,
    properties: ['blessed', 'purifying', 'protective', 'sacred'],
    uses: ['abençoar espaços', 'proteção espiritual', 'batismos', 'rituais de purificação'],
    spiritualSignificance: 'Abençoada por uma autoridade espiritual, carrega intenção sagrada de proteção.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-sagrada-igreja'],
  },
  {
    id: 'agua-de-lago',
    name: 'Água de Lago',
    nameEn: 'Lake Water',
    source: 'lake',
    element: 'Água',
    chakra: '5º (Vishuddha)',
    vibration: 7,
    properties: ['still', 'reflective', 'peaceful', 'meditative'],
    uses: ['meditação', 'reflexão interior', 'banhos calmantes', 'paz interior'],
    spiritualSignificance: 'A quietude do lago espelha a superfície da mente quando em paz.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-de-lago'],
  },
  {
    id: 'agua-de-poço',
    name: 'Água de Poço',
    nameEn: 'Wellspring Water',
    source: 'wellspring',
    element: 'Terra',
    chakra: '1º (Muladhara)',
    vibration: 6,
    properties: ['grounded', 'ancient', 'purifying', 'rooted'],
    uses: ['ancoramento', 'limpeza de entidades', 'proteção da casa', 'rituais ancestrais'],
    spiritualSignificance: 'Extraída das profundezas da terra, conecta com a sabedoria ancestral.',
    spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS['agua-de-poço'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = SacredWaterQuerySchema.safeParse({
      type: searchParams.get('type'),
      chakra: searchParams.get('chakra'),
      source: searchParams.get('source'),
      sefirot: searchParams.get('sefirot'),
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

    const { type, chakra, source, sefirot, element, orixa } = parseResult.data;

    let waters = [...SACRED_WATERS];

    if (source) {
      waters = waters.filter(w => w.source === source);
    }

    if (chakra) {
      waters = waters.filter(w => w.spiritualCorrelations?.chakra === chakra);
    }

    if (sefirot) {
      waters = waters.filter(w => w.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (element) {
      waters = waters.filter(w => w.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      waters = waters.filter(w => w.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySource: waters.reduce((acc, w) => {
        acc[w.source] = (acc[w.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: waters.reduce((acc, w) => {
        w.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: waters.reduce((acc, w) => {
        const c = w.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: waters.reduce((acc, w) => {
        const e = w.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: waters.reduce((acc, w) => {
        const o = w.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      waters,
      count: waters.length,
      spiritualCorrelations: SACRED_WATER_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, chakra, source, sefirot, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}