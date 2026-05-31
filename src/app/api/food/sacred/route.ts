// ============================================================
// FOOD SACRED API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sacred food data
// - Retrieve all sacred foods
// - Retrieve single food by ID
// - Retrieve food categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const FoodSacredQuerySchema = z.object({
  type: z.enum(['records', 'categories', 'all']).optional(),
  id: z.string().optional(),
  element: ElementSchema.optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
  orixa: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const SacredFoodSchema = z.object({
  id: z.string(),
  name: z.string(),
  namePt: z.string(),
  element: ElementSchema,
  chakra: z.number().int().min(1).max(7),
  vibration: z.number().int().min(1).max(10),
  properties: z.array(z.string()),
  uses: z.array(z.string()),
  spiritualSignificance: z.string(),
  sefirot: z.array(SefirotSchema).optional(),
  orixa: z.array(z.string()).optional(),
  frequency: z.string().optional(),
  affirmations: z.array(z.string()).optional(),
});

const FoodCategorySchema = z.object({
  name: z.string(),
  namePt: z.string(),
  description: z.string(),
  weight: z.number(),
  element: ElementSchema,
  sefirot: z.array(SefirotSchema),
  orixa: z.array(z.string()),
});

export type SacredFood = z.infer<typeof SacredFoodSchema>;
export type FoodCategory = z.infer<typeof FoodCategorySchema>;
export const dynamic = 'force-dynamic';

// ─── Sacred Foods with Spiritual Correlations ──────────────────────────────────────────
const sacredFoods: SacredFood[] = [
  {
    id: 'mel',
    name: 'Honey',
    namePt: 'Mel',
    element: 'Fogo',
    chakra: 4,
    vibration: 9,
    properties: ['doce', 'curativo', 'preservante', 'oferta sagrada'],
    uses: ['oferta ritual', 'preparação de medicamento', 'feitura de velas', 'cerimônias de bênção'],
    spiritualSignificance: 'Símbolo de doçura divina e o néctar da vida. Abelhas antigas eram acreditadas como mensageiras entre mundos.',
    sefirot: ['Netzach', 'Tipheret'],
    orixa: ['Oxum', 'Iemanjá'],
    frequency: '528 Hz',
    affirmations: ['Eu me nutro com a doçura da vida', 'Sou merecedor de todas as bênçãos'],
  },
  {
    id: 'azeite',
    name: 'Olive Oil',
    namePt: 'Azeite',
    element: 'Terra',
    chakra: 4,
    vibration: 8,
    properties: ['purificador', 'nutritivo', 'sagrado', 'iluminador'],
    uses: ['unção', 'rituais de lamparina', 'unguentos de cura', 'cerimônias de comunhão'],
    spiritualSignificance: 'Óleo de unção sagrado usado em iniciações e rituais de bênção em todas as tradições. Representa sabedoria e paz.',
    sefirot: ['Chesed', 'Tipheret'],
    orixa: ['Oxalá', 'Iemanjá'],
    frequency: '639 Hz',
    affirmations: ['Sou ungido com a luz divina', 'A paz flui através de mim'],
  },
  {
    id: 'pao',
    name: 'Unleavened Bread',
    namePt: 'Pão Sem Levedura',
    element: 'Terra',
    chakra: 1,
    vibration: 6,
    properties: ['sustentador', 'inteiro', 'cerimonial', 'ancorador'],
    uses: ['comunhão', 'rituais de Pessach', 'refeições sacramentais', 'ofertas no altar'],
    spiritualSignificance: 'Símbolo de humildade, simplicidade e o pão da vida. Sem levedura representa verdade sem fingimento.',
    sefirot: ['Malkuth', 'Yesod'],
    orixa: ['Oxalá', 'Ogum'],
    frequency: '396 Hz',
    affirmations: ['Sou alimentado pela luz divina', 'Minha essência é pura e simples'],
  },
  {
    id: 'agua',
    name: 'Sacred Water',
    namePt: 'Água Sagrada',
    element: 'Água',
    chakra: 6,
    vibration: 9,
    properties: ['purificador', 'limpador', 'dador de vida', 'conduto espiritual'],
    uses: ['batismo', 'aspersão ritual', 'limpeza do altar', 'banhos de purificação'],
    spiritualSignificance: 'O elemento primordial de purificação. Carrega bênçãos e é usado para limpar espaços, objetos e almas.',
    sefirot: ['Yesod', 'Malkuth'],
    orixa: ['Iemanjá', 'Oxum'],
    frequency: '417 Hz',
    affirmations: ['Sou purificado em todas as dimensões', 'A água sagrada lava minhas preocupações'],
  },
  {
    id: 'vinho',
    name: 'Wine',
    namePt: 'Vinho',
    element: 'Fogo',
    chakra: 4,
    vibration: 8,
    properties: ['transformação', 'alegria', 'comunhão', 'celebração'],
    uses: ['rituais de comunhão', 'cerimônias de bênção', 'ofertas à divindade', 'brinde ritual'],
    spiritualSignificance: 'Símbolo de transformação e o sangue da videira. Representa alegria, comunhão e presença divina.',
    sefirot: ['Gevurah', 'Tipheret'],
    orixa: ['Oxum', 'Xangô'],
    frequency: '528 Hz',
    affirmations: ['Transformo-me em cada momento', 'Alegria e celebração são meu direito'],
  },
  {
    id: 'sal',
    name: 'Salt',
    namePt: 'Sal',
    element: 'Terra',
    chakra: 1,
    vibration: 7,
    properties: ['preservante', 'purificador', 'protetor', 'ancorador'],
    uses: ['limpeza de espaços', 'proteção do altar', 'círculos rituais', 'cerimônias de oferta'],
    spiritualSignificance: 'O grande purificador e protetor. Usado para criar barreiras sagradas e preservar a santidade espiritual.',
    sefirot: ['Malkuth'],
    orixa: ['Omolu', 'Iemanjá'],
    frequency: '396 Hz',
    affirmations: ['Sou protegido por forças sagradas', 'Nenhuma energia densa pode me tocar'],
  },
  {
    id: 'erva-sagrada',
    name: 'Sacred Herbs',
    namePt: 'Ervas Sagradas',
    element: 'Ar',
    chakra: 5,
    vibration: 8,
    properties: ['aromático', 'curativo', 'purificador', 'conector'],
    uses: ['defumação', 'banhos', 'chás rituais', 'medicina herbal'],
    spiritualSignificance: 'Plantas sagradas que carregam a essência da terra e o prana do universo. Cadaerva tem propriedades espirituais específicas.',
    sefirot: ['Chokhmah', 'Netzach'],
    orixa: ['Ogum', 'Oxum', 'Iansã'],
    frequency: '741 Hz',
    affirmations: ['Conecto-me com a sabedoria das plantas', 'A natureza me sustenta e cura'],
  },
  {
    id: 'milho',
    name: 'Corn',
    namePt: 'Milho',
    element: 'Terra',
    chakra: 2,
    vibration: 7,
    properties: ['nutritivo', 'sustentador', ' ancestral', 'oferecimento'],
    uses: ['fubá para ebós', 'canjica', 'mingau ritual', 'ofertas aos Orixás'],
    spiritualSignificance: 'Alimento ancestral na tradição afro-brasileira. Representa a fertilidade da terra e a generosidade dos Orixás.',
    sefirot: ['Netzach', 'Malkuth'],
    orixa: ['Oxóssi', 'Iemanjá', 'Oxum'],
    frequency: '432 Hz',
    affirmations: ['Sou nutrido pela terra sagrada', 'A abundância flui em minha vida'],
  },
  {
    id: 'dende',
    name: 'Dende Oil',
    namePt: 'Azeite de Dendê',
    element: 'Fogo',
    chakra: 3,
    vibration: 8,
    properties: ['energizante', 'sagrado', 'lubrificante', 'comunicativo'],
    uses: ['unguentos ritualísticos', 'lubrificação de ferramentas', 'ofertas a Ogum', 'rituais de proteção'],
    spiritualSignificance: 'Óleo sagrado usado para ungir ferramentas rituais e pedir força e proteção. Carrega a energia de Ogum.',
    sefirot: ['Gevurah', 'Hod'],
    orixa: ['Ogum', 'Xangô'],
    frequency: '417 Hz',
    affirmations: ['Tenho força e poder para realizar meus propósitos', 'Sou protegido em todas as jornadas'],
  },
  {
    id: 'canjica',
    name: 'Canjica',
    namePt: 'Canjica',
    element: 'Terra',
    chakra: 2,
    vibration: 7,
    properties: ['dulce', 'ancestral', 'oferta sagrada', 'compartilhamento'],
    uses: ['ofertas a Oxum', 'rituais de prosperidade', 'compartilhamento em festas', 'ebós de abertura'],
    spiritualSignificance: 'Prato sagrado feito com milho branco, tradicional em Offerings a Oxum e outras divindades. Representa doçura e compartilhamento.',
    sefirot: ['Netzach', 'Tipheret'],
    orixa: ['Oxum', 'Oxóssi', 'Iemanjá'],
    frequency: '528 Hz',
    affirmations: ['A doçura da vida me alimenta', 'Compartilho minhas bênçãos com alegria'],
  },
  {
    id: 'inhame',
    name: 'Yam',
    namePt: 'Inhame',
    element: 'Terra',
    chakra: 1,
    vibration: 6,
    properties: ['nutritivo', 'ancorador', 'força física', 'sustento'],
    uses: ['ofertas a Oxalá', 'alimento de iniciação', 'refeições ritualísticas', 'força para o corpo'],
    spiritualSignificance: 'Alimento de iniciação no candomblé. Fornece força física e espiritual para o iaô e iniciantes.',
    sefirot: ['Malkuth', 'Yesod'],
    orixa: ['Oxalá', 'Omolu'],
    frequency: '396 Hz',
    affirmations: ['Estou forte e enraizado', 'O sustento sagrado me alimenta'],
  },
  {
    id: 'alecrim',
    name: 'Rosemary',
    namePt: 'Alecrim',
    element: 'Fogo',
    chakra: 6,
    vibration: 8,
    properties: ['purificador', 'memória', 'proteção', 'clareza'],
    uses: ['defumação', 'banhos de limpeza', 'chás medicinais', 'unguentos de proteção'],
    spiritualSignificance: 'Erva de proteção e purificação. Usada para limpar energias densas e fortalecer a memória espiritual.',
    sefirot: ['Gevurah', 'Hod'],
    orixa: ['Ogum', 'Oxalá'],
    frequency: '741 Hz',
    affirmations: ['Minha mente é clara e focada', 'Sou protegido por forças luminosas'],
  },
];

// ─── Food Categories with Spiritual Correlations ──────────────────────────────────────────
const foodCategories: FoodCategory[] = [
  {
    name: 'Sweeteners',
    namePt: 'Adoçantes',
    description: 'Substâncias doces usadas em ofertas e rituais de prosperidade',
    weight: 9,
    element: 'Fogo',
    sefirot: ['Netzach', 'Tipheret'],
    orixa: ['Oxum', 'Iemanjá'],
  },
  {
    name: 'Oils',
    namePt: 'Óleos',
    description: 'Óleos sagrados para unção, iluminação e proteção',
    weight: 8,
    element: 'Terra',
    sefirot: ['Chesed', 'Gevurah'],
    orixa: ['Oxalá', 'Ogum'],
  },
  {
    name: 'Grains',
    namePt: 'Grãos',
    description: 'Grãos e cereais sagrados para sustento e oferendas',
    weight: 7,
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod'],
    orixa: ['Oxóssi', 'Iemanjá'],
  },
  {
    name: 'Water',
    namePt: 'Água',
    description: 'Águas sagradas para purificação e rituais',
    weight: 9,
    element: 'Água',
    sefirot: ['Yesod', 'Malkuth'],
    orixa: ['Iemanjá', 'Oxum'],
  },
  {
    name: 'Herbs',
    namePt: 'Ervas',
    description: 'Plantas sagradas para defumação, banhos e medicina',
    weight: 8,
    element: 'Ar',
    sefirot: ['Chokhmah', 'Netzach'],
    orixa: ['Ogum', 'Iansã'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();

    const parseResult = FoodSacredQuerySchema.safeParse({
      type: searchParams.get('type'),
      id: searchParams.get('id'),
      element: searchParams.get('element'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      orixa: searchParams.get('orixa'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, id, element, chakra, sefirot, orixa, limit } = parseResult.data;

    // Return categories
    if (type === 'categories') {
      return NextResponse.json({
        success: true,
        categories: foodCategories,
        total: foodCategories.length,
      });
    }

    // Return single food by ID
    if (id) {
      const food = sacredFoods.find(f => f.id === id);
      if (!food) {
        return NextResponse.json({
          success: false,
          error: 'Alimento sagrado não encontrado',
          availableIds: sacredFoods.map(f => f.id),
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        food,
      });
    }

    let foods = [...sacredFoods];

    // Filter by element
    if (element) {
      foods = foods.filter(f => f.element === element);
    }

    // Filter by chakra
    if (chakra) {
      foods = foods.filter(f => f.chakra === chakra);
    }

    // Filter by sefirot
    if (sefirot) {
      foods = foods.filter(f => f.sefirot?.includes(sefirot));
    }

    // Filter by orixa
    if (orixa) {
      foods = foods.filter(f => f.orixa?.some(o => o.toLowerCase().includes(orixa.toLowerCase())));
    }

    // Apply limit
    if (limit) {
      foods = foods.slice(0, limit);
    }

    // Statistics
    const stats = {
      byElement: sacredFoods.reduce((acc, f) => {
        acc[f.element] = (acc[f.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: sacredFoods.reduce((acc, f) => {
        acc[f.chakra] = (acc[f.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: sacredFoods.reduce((acc, f) => {
        f.sefirot?.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byOrixa: sacredFoods.reduce((acc, f) => {
        f.orixa?.forEach(o => {
          acc[o] = (acc[o] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalFoods: sacredFoods.length,
    };

    return NextResponse.json({
      success: true,
      foods,
      total: foods.length,
      categories: foodCategories,
      filters: { element, chakra, sefirot, orixa },
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