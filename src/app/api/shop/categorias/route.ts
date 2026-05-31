import { NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CategoryTypeSchema = z.enum(['products', 'courses', 'consultations', 'rituals', 'spiritual']);
const CategoriesQuerySchema = z.object({
  type: CategoryTypeSchema.optional(),
  includeItems: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = 'force-dynamic';

// ─── Category Data ──────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  type: string;
  items?: CategoryItem[];
}

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  orixa?: string;
  sefirot?: string[];
  chakra?: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'cursos-cabala',
    name: 'Cursos de Cabala',
    nameEn: 'Kabbalah Courses',
    description: 'Formação completa nos estudos cabalísticos',
    icon: '🌳',
    type: 'courses',
    items: [
      { id: 'cabala-101', name: 'Fundamentos da Cabala', price: 297, currency: 'BRL', sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 'Sahasrara (7º)' },
      { id: 'arvore-vida', name: 'Árvore da Vida Completa', price: 597, currency: 'BRL', sefirot: ['Todas'], chakra: 'Sete chakras' },
      { id: '32-caminhos', name: 'Os 32 Caminhos', price: 497, currency: 'BRL', sefirot: ['Kether'], chakra: 'Ajna (6º)' },
      { id: 'sephirot-misticos', name: 'Mistérios dos Sefirot', price: 697, currency: 'BRL', sefirot: ['Todas'], chakra: 'Anahata (4º)' },
    ],
  },
  {
    id: 'cursos-tarot',
    name: 'Cursos de Tarot',
    nameEn: 'Tarot Courses',
    description: 'Domine a arte milenar da divincação',
    icon: '🃏',
    type: 'courses',
    items: [
      { id: 'tarot-basico', name: 'Tarot para Iniciantes', price: 247, currency: 'BRL', chakra: 'Ajna (6º)' },
      { id: 'tarot-avancado', name: 'Leituras Avançadas', price: 447, currency: 'BRL', chakra: 'Ajna (6º)' },
      { id: 'celtic-cross', name: 'Celtic Cross Completo', price: 397, currency: 'BRL', chakra: 'Anahata (4º)' },
    ],
  },
  {
    id: 'cursos-orixas',
    name: 'Cursos de Orixás',
    nameEn: 'Orixá Courses',
    description: 'Estudos sobre as divindades afro-brasileiras',
    icon: '🙏',
    type: 'courses',
    items: [
      { id: 'orixas-intro', name: 'Introdução aos Orixás', price: 297, currency: 'BRL', orixa: 'Oxalá' },
      { id: 'oxum-prosperidade', name: 'Oxum e a Prosperidade', price: 347, currency: 'BRL', orixa: 'Oxum' },
      { id: 'ogum-protecao', name: 'Ogum: Senhor das Guerras', price: 297, currency: 'BRL', orixa: 'Ogum' },
      { id: 'xango-justica', name: 'Xangô: Deus da Justiça', price: 297, currency: 'BRL', orixa: 'Xangô' },
      { id: 'iemanja-protecao', name: 'Iemanjá: Mãe do Mar', price: 347, currency: 'BRL', orixa: 'Iemanjá' },
    ],
  },
  {
    id: 'consultacoes',
    name: 'Consultas Espirituais',
    nameEn: 'Spiritual Consultations',
    description: 'Atendimento personalizado com guias espirituais',
    icon: '🔮',
    type: 'consultations',
    items: [
      { id: 'mapa-natal', name: 'Mapa Natal Espiritual', price: 197, currency: 'BRL', chakra: 'Sete chakras' },
      { id: 'odu-ifa', name: 'Leitura de Odu Ifá', price: 247, currency: 'BRL', orixa: 'Oxum' },
      { id: 'caminho-vida', name: 'Caminho de Vida Cabalístico', price: 147, currency: 'BRL', sefirot: ['Malkuth'] },
      { id: 'sinastria', name: 'Sinastria Espiritual', price: 347, currency: 'BRL', chakra: 'Anahata (4º)' },
    ],
  },
  {
    id: 'rituais',
    name: 'Kits de Rituals',
    nameEn: 'Ritual Kits',
    description: 'Tudo que você precisa para práticas espirituais',
    icon: '✨',
    type: 'rituals',
    items: [
      { id: 'kit-oxum', name: 'Kit Oxum (Amor e Prosperidade)', price: 127, currency: 'BRL', orixa: 'Oxum' },
      { id: 'kit-ogum', name: 'Kit Ogum (Proteção)', price: 117, currency: 'BRL', orixa: 'Ogum' },
      { id: 'kit-xango', name: 'Kit Xangô (Justiça)', price: 137, currency: 'BRL', orixa: 'Xangô' },
      { id: 'kit-omolu', name: 'Kit Omolu (Curação)', price: 117, currency: 'BRL', orixa: 'Omolu' },
    ],
  },
  {
    id: 'produtos-sagrados',
    name: 'Produtos Sagrados',
    nameEn: 'Sacred Products',
    description: 'Itens ritualísticos e ferramentas espirituais',
    icon: '📿',
    type: 'products',
    items: [
      { id: 'velas-orixas', name: 'Velas Coloridas por Orixá (Kit 7)', price: 89, currency: 'BRL' },
      { id: 'defumadores', name: 'Defumadores Sagrados (Kit 5)', price: 79, currency: 'BRL' },
      { id: 'incenso-cabala', name: 'Incenso Cabalístico (Kit 4)', price: 69, currency: 'BRL', sefirot: ['Malkuth'] },
      { id: 'quartzo-protecao', name: 'Cristais de Proteção (Kit 6)', price: 149, currency: 'BRL', chakra: 'Anahata (4º)' },
    ],
  },
  {
    id: 'meditacoes',
    name: 'Meditações Guiadas',
    nameEn: 'Guided Meditations',
    description: 'Áudio meditations para diferentes propósitos',
    icon: '🧘',
    type: 'spiritual',
    items: [
      { id: 'med-kether', name: 'Meditação de Kether', price: 37, currency: 'BRL', sefirot: ['Kether'], chakra: 'Sahasrara (7º)' },
      { id: 'med-chakra', name: 'Meditação dos 7 Chakras', price: 47, currency: 'BRL', chakra: 'Sete chakras' },
      { id: 'med-oxum', name: 'Meditação de Oxum', price: 37, currency: 'BRL', orixa: 'Oxum', chakra: 'Svadhisthana (2º)' },
      { id: 'med-ancestrais', name: 'Conexão com Ancestrais', price: 47, currency: 'BRL', sefirot: ['Yesod', 'Malkuth'] },
    ],
  },
  {
    id: 'numerologia',
    name: 'Análises Numerológicas',
    nameEn: 'Numerological Analysis',
    description: 'Cálculos e interpretações numerológicas precisas',
    icon: '🔢',
    type: 'spiritual',
    items: [
      { id: 'num-caminho-vida', name: 'Caminho de Vida Completo', price: 97, currency: 'BRL', sefirot: ['Malkuth'], chakra: 'Sahasrara (7º)' },
      { id: 'num-expressao', name: 'Número de Expressão', price: 77, currency: 'BRL', sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'num-mestre', name: 'Número Mestre (11, 22, 33)', price: 127, currency: 'BRL', sefirot: ['Kether', 'Tipheret', 'Malkuth'] },
      { id: 'num-ano-pessoal', name: 'Ano Pessoal', price: 47, currency: 'BRL' },
    ],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parseResult = CategoriesQuerySchema.safeParse({
    type: searchParams.get('type'),
    includeItems: searchParams.get('includeItems'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, includeItems, limit } = parseResult.data;
  let categories = [...CATEGORIES];

  if (type) {
    categories = categories.filter(c => c.type === type);
  }

  if (limit) {
    categories = categories.slice(0, limit);
  }

  // Filter out items if not requested
  const response = categories.map(c => {
    if (!includeItems) {
      const { items, ...rest } = c;
      return rest;
    }
    return c;
  });

  return NextResponse.json({
    success: true,
    categories: response,
    count: response.length,
    total: CATEGORIES.length,
    types: {
      courses: CATEGORIES.filter(c => c.type === 'courses').length,
      consultations: CATEGORIES.filter(c => c.type === 'consultations').length,
      rituals: CATEGORIES.filter(c => c.type === 'rituals').length,
      products: CATEGORIES.filter(c => c.type === 'products').length,
      spiritual: CATEGORIES.filter(c => c.type === 'spiritual').length,
    },
  });
}