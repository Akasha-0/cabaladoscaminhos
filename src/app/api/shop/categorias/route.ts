import { NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CategoryTypeSchema = z.enum(['products', 'courses', 'consultations', 'rituals', 'spiritual']);
const CategoriesQuerySchema = z.object({
  type: CategoryTypeSchema.optional(),
  includeItems: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Categories ──────────────────────────────────────────
const CATEGORY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'cursos-cabala': {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria da Cabala ilumina meu caminho',
    frequency: '963 Hz',
  },
  'cursos-tarot': {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'O Tarot revela verdades ocultas',
    frequency: '639 Hz',
  },
  'cursos-orixas': {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Honro a sabedoria dos Orixás',
    frequency: '528 Hz',
  },
  'consultacoes': {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A orientação espiritual guia minhas escolhas',
    frequency: '741 Hz',
  },
  'produtos-sagrados': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Os instrumentos sagrados ampliam minha prática',
    frequency: '174 Hz',
  },
  'rituais': {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual transforma e purifica',
    frequency: '528 Hz',
  },
  'numerologia': {
    sefirot: ['Hod', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Os números revelam minha verdade',
    frequency: '741 Hz',
  },
  'astrologia': {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Os astros guiam minha jornada',
    frequency: '639 Hz',
  },
};

// ─── Category Data ──────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  type: string;
  items?: CategoryItem[];
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  orixa?: string;
  sefirot?: string[];
  chakra?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const CATEGORIES: Category[] = [
  {
    id: 'cursos-cabala',
    name: 'Cursos de Cabala',
    nameEn: 'Kabbalah Courses',
    description: 'Formação completa nos estudos cabalísticos',
    icon: '🌳',
    type: 'courses',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['cursos-cabala'],
    items: [
      { id: 'cabala-101', name: 'Fundamentos da Cabala', price: 297, currency: 'BRL', sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 'Sahasrara (7º)', spiritualCorrelations: { sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A sabedoria da Cabala me ilumina', frequency: '963 Hz' } },
      { id: 'arvore-vida', name: 'Árvore da Vida Completa', price: 597, currency: 'BRL', sefirot: ['Todas'], chakra: 'Sete chakras', spiritualCorrelations: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A Árvore da Vida sustenta meu ser', frequency: '963 Hz' } },
      { id: '32-caminhos', name: 'Os 32 Caminhos', price: 497, currency: 'BRL', sefirot: ['Kether'], chakra: 'Ajna (6º)', spiritualCorrelations: { sefirot: ['Kether'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Os 32 caminhos me levam à iluminação', frequency: '963 Hz' } },
      { id: 'sephirot-misticos', name: 'Mistérios dos Sefirot', price: 697, currency: 'BRL', sefirot: ['Todas'], chakra: 'Anahata (4º)', spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Os Sefirot revelam a beleza divina', frequency: '528 Hz' } },
    ],
  },
  {
    id: 'cursos-tarot',
    name: 'Cursos de Tarot',
    nameEn: 'Tarot Courses',
    description: 'Domine a arte milenar da divincação',
    icon: '🃏',
    type: 'courses',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['cursos-tarot'],
    items: [
      { id: 'tarot-basico', name: 'Tarot para Iniciantes', price: 247, currency: 'BRL', chakra: 'Ajna (6º)', spiritualCorrelations: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'O Tarot abre portas de sabedoria', frequency: '639 Hz' } },
      { id: 'tarot-avancado', name: 'Leituras Avançadas', price: 447, currency: 'BRL', chakra: 'Ajna (6º)', spiritualCorrelations: { sefirot: ['Chokhmah'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'A sabedoria do Tarot flui através de mim', frequency: '639 Hz' } },
      { id: 'celtic-cross', name: 'Celtic Cross Completo', price: 397, currency: 'BRL', chakra: 'Anahata (4º)', spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O Celtic Cross revela meu destino', frequency: '528 Hz' } },
    ],
  },
  {
    id: 'cursos-orixas',
    name: 'Cursos de Orixás',
    nameEn: 'Orixá Courses',
    description: 'Estudos sobre as divindades afro-brasileiras',
    icon: '🙏',
    type: 'courses',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['cursos-orixas'],
    items: [
      { id: 'orixas-intro', name: 'Introdução aos Orixás', price: 297, currency: 'BRL', orixa: 'Oxalá', spiritualCorrelations: { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Honro Oxalá, fonte de toda luz', frequency: '963 Hz' } },
      { id: 'oxum-prosperidade', name: 'Oxum e a Prosperidade', price: 347, currency: 'BRL', orixa: 'Oxum', spiritualCorrelations: { sefirot: ['Chesed', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Oxum abençoa minha prosperidade', frequency: '528 Hz' } },
      { id: 'ogum-protecao', name: 'Ogum: Senhor das Guerras', price: 297, currency: 'BRL', orixa: 'Ogum', spiritualCorrelations: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Ogum protege meu caminho', frequency: '396 Hz' } },
      { id: 'xango-justica', name: 'Xangô: Deus da Justiça', price: 297, currency: 'BRL', orixa: 'Xangô', spiritualCorrelations: { sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Xangô traz justiça e equilíbrio', frequency: '396 Hz' } },
      { id: 'iemanja-protecao', name: 'Iemanjá: Mãe do Mar', price: 347, currency: 'BRL', orixa: 'Iemanjá', spiritualCorrelations: { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Iemanjá cura e protege', frequency: '639 Hz' } },
    ],
  },
  {
    id: 'consultacoes',
    name: 'Consultas Espirituais',
    nameEn: 'Spiritual Consultations',
    description: 'Atendimento personalizado com guias espirituais',
    icon: '🔮',
    type: 'consultations',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['consultacoes'],
    items: [
      { id: 'consulta-tarot', name: 'Leitura de Tarot', price: 197, currency: 'BRL', spiritualCorrelations: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'O Tarot ilumina meu caminho', frequency: '639 Hz' } },
      { id: 'consulta-numerologia', name: 'Numerologia Completa', price: 247, currency: 'BRL', spiritualCorrelations: { sefirot: ['Hod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os números revelam minha verdade', frequency: '741 Hz' } },
      { id: 'consulta-orixa', name: 'Mapa do Orixá', price: 347, currency: 'BRL', spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Meu Orixá me guia', frequency: '528 Hz' } },
    ],
  },
  {
    id: 'produtos-sagrados',
    name: 'Produtos Sagrados',
    nameEn: 'Sacred Products',
    description: 'Instrumentos e materiais para sua prática espiritual',
    icon: '🕯️',
    type: 'products',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['produtos-sagrados'],
    items: [
      { id: 'velas-sagradas', name: 'Velas Abençoadas', price: 47, currency: 'BRL', spiritualCorrelations: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A chama sagrada ilumina', frequency: '396 Hz' } },
      { id: 'incenso-purificacao', name: 'Incenso de Purificação', price: 67, currency: 'BRL', spiritualCorrelations: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A fumaça purifica', frequency: '396 Hz' } },
      { id: 'agua-sagrada', name: 'Água Benta', price: 37, currency: 'BRL', spiritualCorrelations: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A água sagrada purifica', frequency: '639 Hz' } },
    ],
  },
  {
    id: 'rituais',
    name: 'Rituais Guiados',
    nameEn: 'Guided Rituals',
    description: 'Experiências ritualísticas transformadoras',
    icon: '✨',
    type: 'rituals',
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS['rituais'],
    items: [
      { id: 'ritual-prosperidade', name: 'Ritual de Prosperidade', price: 197, currency: 'BRL', spiritualCorrelations: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A abundância flui em mim', frequency: '528 Hz' } },
      { id: 'ritual-protecao', name: 'Ritual de Proteção', price: 197, currency: 'BRL', spiritualCorrelations: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Sou protegido pela luz', frequency: '396 Hz' } },
      { id: 'ritual-cura', name: 'Ritual de Cura', price: 247, currency: 'BRL', spiritualCorrelations: { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A cura flui através de mim', frequency: '528 Hz' } },
    ],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = CategoriesQuerySchema.safeParse({
      type: searchParams.get('type'),
      includeItems: searchParams.get('includeItems'),
      limit: searchParams.get('limit'),
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

    const { type, includeItems, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let categories = [...CATEGORIES];

    if (type) {
      categories = categories.filter(c => c.type === type);
    }

    if (sefirot) {
      categories = categories.filter(c => c.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      categories = categories.filter(c => c.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      categories = categories.filter(c => c.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      categories = categories.filter(c => c.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && categories.length > limit) {
      categories = categories.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: categories.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: categories.reduce((acc, c) => {
        c.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: categories.reduce((acc, c) => {
        const ch = c.spiritualCorrelations?.chakra;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: categories.reduce((acc, c) => {
        const e = c.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: categories.reduce((acc, c) => {
        const o = c.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      categories: includeItems ? categories : categories.map(c => ({ ...c, items: undefined })),
      count: categories.length,
      spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, includeItems, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}