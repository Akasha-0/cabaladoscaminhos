import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

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
});

const SacredWaterQuerySchema = z.object({
  type: SacredWaterTypeSchema.optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
  source: SacredWaterSourceSchema.optional(),
});

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
  },
  {
    id: 'agua-sagrada-igreja',
    name: 'Água Benta',
    nameEn: 'Holy Water',
    source: 'spring',
    element: 'Água',
    chakra: '7º (Sahasrara)',
    vibration: 9,
    properties: ['blessed', 'protective', 'purifying', 'consecrated'],
    uses: ['batismo', 'proteção de ambientes', 'bênçãos', 'iniciações'],
    spiritualSignificance: 'Consagrada por rituals religiosos, carrega proteção e bênçãos divinas.',
  },
  {
    id: 'agua-de-lago',
    name: 'Água de Lago',
    nameEn: 'Lake Water',
    source: 'lake',
    element: 'Água',
    chakra: '5º (Vishuddha)',
    vibration: 6,
    properties: ['reflective', 'peaceful', 'mysterious', 'intuitive'],
    uses: ['meditação', 'reflexão interior', 'comunhão com águas paradas', 'insights'],
    spiritualSignificance: 'Águas paradas refletem a mente. Usada para introspecção profunda.',
  },
  {
    id: 'agua-de-poço',
    name: 'Água de Poço',
    nameEn: 'Wellspring Water',
    source: 'wellspring',
    element: 'Água',
    chakra: '1º (Muladhara)',
    vibration: 8,
    properties: ['grounded', 'ancient', 'stabilizing', 'rooting'],
    uses: ['ancoramento', 'estabilização emocional', 'rituais de fundação', 'proteção terrestre'],
    spiritualSignificance: 'Vinda das profundezas da terra, representa as raízes ancestrais.',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SacredWaterQuerySchema.safeParse({
    type: searchParams.get('type'),
    chakra: searchParams.get('chakra'),
    source: searchParams.get('source'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, chakra, source } = parseResult.data;
  let waters = [...SACRED_WATERS];

  if (source) {
    waters = waters.filter(w => w.source === source);
  }

  if (chakra) {
    waters = waters.filter(w => w.chakra.includes(`${chakra}º`));
  }

  return NextResponse.json({
    success: true,
    waters,
    count: waters.length,
    total: SACRED_WATERS.length,
  });
}