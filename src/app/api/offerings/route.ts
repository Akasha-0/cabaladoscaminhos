// ============================================================
// OFFERINGS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
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
});
// Type aliases
type OfferingType = z.infer<typeof OfferingTypeSchema>;
type ElementType = z.infer<typeof ElementTypeSchema>;
type IntensityLevel = z.infer<typeof IntensityLevelSchema>;
export interface OfferingItem {
  id: string;
  name: string;
  description: string;
  type: OfferingType;
  notes?: string;
}
export interface Offering {
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
}

export interface OfferingResponse {
  offering: Offering | null;
  error?: string;
  availableTypes: OfferingType[];
}

export interface OfferingListResponse {
  offerings: Offering[];
  total: number;
}

// ============================================================
// OFFERING DATA
// ============================================================

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
      'Deixe Queimar até o fim',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['terca', 'sexta'],
    moonPhase: 'crescente',
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
      { name: 'Fio de seda verde', quantity: '1 pedaço' },
      { name: 'Pão', quantity: '1 pedaço' },
      { name: 'Mel', quantity: 'pouco' },
    ],
    instructions: [
      'Acenda a vela verde',
      'Amarre o fio de seda na vela',
      'Coloque o pão com mel ao lado',
      'Invocar Oxóssi para proteção',
      'Agradeça pelas bênçãos',
    ],
    duration: '20 minutos',
    intensity: 'suave',
    bestDays: ['quinta'],
    moonPhase: 'qualquer',
  },
  {
    id: 'oferenda-iemanja',
    name: 'Oferenda a Iemanjá',
    type: 'oferenda',
    description: 'Sagrada oferenda à Rainha do Mar por proteção e fluidez.',
    element: 'agua',
    orixa: 'Iemanjá',
    items: [
      { name: 'Vela branca ou azul', quantity: '1' },
      { name: 'Água do mar ou sal grosso', quantity: '1 porção' },
      { name: 'Flores brancas', quantity: '7' },
      { name: 'Perfume', quantity: 'pouco' },
      { name: 'Espelho pequeno', quantity: '1' },
    ],
    instructions: [
      'Prepare local limpo com toalha branca',
      'Coloque a água em recipiente branco',
      'Acenda a vela azul ou branca',
      'Disponha as flores ao redor',
      'Respire e conecte-se com Iemanjá',
      'Faça sua prece com fé',
      'Ao terminar, leve a oferenda ao mar',
    ],
    duration: '45 minutos',
    intensity: 'forte',
    bestDays: ['sabado', 'segunda'],
    moonPhase: 'cheia',
  },
  {
    id: 'oferenda-oxum',
    name: 'Oferenda a Oxum',
    type: 'oferenda',
    description: 'Doce oferenda para atrair amor, prosperidade e alegria.',
    element: 'agua',
    orixa: 'Oxum',
    items: [
      { name: 'Vela dourada', quantity: '1' },
      { name: 'Mel', quantity: '1 colher' },
      { name: 'Canela', quantity: 'pau' },
      { name: 'Água doce', quantity: '1 copo' },
      { name: 'Flores amarelas', quantity: '5' },
    ],
    instructions: [
      'Em recipiente dourado, coloque água doce',
      'Adicione mel e canela',
      'Acenda a vela dourada',
      'Disponha flores amarelas',
      'Pede a Oxum com coração limpo',
      'Agradeça sempre',
    ],
    duration: '30 minutos',
    intensity: 'medio',
    bestDays: ['sabado'],
    moonPhase: 'crescente',
  },
  {
    id: 'oferenda-xango',
    name: 'Oferenda a Xangô',
    type: 'oferenda',
    description: 'Potente oferenda para conquistar justiça e prosperidade.',
    element: 'fogo',
    orixa: 'Xangô',
    items: [
      { name: 'Vela vermelha e preta', quantity: '1 de cada' },
      { name: 'Azeite de dendê', quantity: 'pouco' },
      { name: 'Fumo', quantity: 'pouco' },
      { name: 'Pão', quantity: '2 pedaços' },
      { name: 'Akара', quantity: '1' },
    ],
    instructions: [
      'Acenda velas vermelha e preta lado a lado',
      'Unte as velas com azeite de dendê',
      'Coloque fumo entre as velas',
      'Disponha o pão e o acaraje',
      'Pede a Xangô justiça e prosperidade',
      'Deixe até queime por completo',
    ],
    duration: '1 hora',
    intensity: 'forte',
    bestDays: ['quarta', 'sabado'],
    moonPhase: 'cheia',
  },
  {
    id: 'libacao-祖先',
    name: 'Libação aos Ancestrais',
    type: 'libacao',
    description: 'Água oferecida aos ancestrais para honrar a linha de sangue.',
    element: 'agua',
    items: [
      { name: 'Água fresca', quantity: '1 copo' },
      { name: 'Flores brancas', quantity: '3' },
      { name: 'Vela branca', quantity: '1' },
    ],
    instructions: [
      'Coloque água fresca em copo branco',
      'Disponha flores ao redor',
      'Acenda a vela branca',
      'Fale em voz baixa chamando os ancestrais',
      'Peça bênção e proteção',
      'Deixe água durante a noite',
      'Descarte ao amanhecer',
    ],
    duration: '15 minutos',
    intensity: 'suave',
    bestDays: ['domingo', 'quinta'],
    moonPhase: 'qualquer',
  },
  {
    id: 'defumacao-protecao',
    name: 'Defumação de Proteção',
    type: 'defumacao',
    description: 'Queima de ervas para criar barreira protetora.',
    element: 'ar',
    items: [
      { name: 'Pau-brasil', quantity: '1 pedaço' },
      { name: 'Albafor', quantity: 'pouco' },
      { name: 'Arruda', quantity: 'ramos' },
      { name: 'Manjericão', quantity: 'ramos' },
    ],
    instructions: [
      'Acenda o pau-brasil até pegar brasa',
      'Coloque albafor sobre a brasa',
      'Passe a fumaça pela casa',
      'Queime arruda e manjericão em sequência',
      'Peça proteção a todos os orixás',
      'Abra todas janelas ao terminar',
    ],
    duration: '20 minutos',
    intensity: 'medio',
    bestDays: ['segunda', 'quarta', 'sexta'],
    moonPhase: 'nova',
  },
  {
    id: 'vela-oxala',
    name: 'Vela de Oxalá',
    type: 'vela',
    description: 'Acendimento simples para purificação e paz interior.',
    element: 'fogo',
    orixa: 'Oxalá',
    items: [
      { name: 'Vela branca', quantity: '1' },
      { name: 'Água', quantity: '1 copo' },
      { name: 'Flor branca', quantity: '1' },
    ],
    instructions: [
      'Coloque água em copo branco',
      'Acenda vela branca',
      'Coloque flor branca na água',
      'Silencie a mente',
      'Pede paz, saúde e长寿',
      'Deixe queimar alguns minutos',
    ],
    duration: '15 minutos',
    intensity: 'suave',
    bestDays: ['sexta', 'domingo'],
    moonPhase: 'qualquer',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getOrixaByDay(dia: string): string | null {
  const orixaMap: Record<string, string> = {
    segunda: 'Iemanjá',
    terca: 'Ogum',
    quarta: 'Xangô',
    quinta: 'Oxóssi',
    sexta: 'Oxalá',
    sabado: 'Oxum',
    domingo: 'Nanã',
  };
  return orixaMap[dia] || null;
}

function getMoonPhase(): string {
  // Simplified moon phase calculation
  const now = new Date();
  const newMoon = new Date(2024, 0, 11); // Known new moon date
  const daysSinceNewMoon = Math.floor((now.getTime() - newMoon.getTime()) / 86400000);
  const lunarCycle = daysSinceNewMoon % 29.5;
  
  if (lunarCycle < 7) return 'nova';
  if (lunarCycle < 14) return 'crescente';
  if (lunarCycle < 22) return 'cheia';
  return 'minguante';
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = OfferingQuerySchema.safeParse({
    type: searchParams.get('type'),
    orixa: searchParams.get('orixa'),
    element: searchParams.get('element'),
    dia: searchParams.get('dia'),
    id: searchParams.get('id'),
    limit: searchParams.get('limit'),
  });
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { type, orixa, element, dia, id, limit } = parseResult.data;
  // Get day of week for recommendations
  const agora = new Date();
  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const diaAtual = dia ?? diasSemana[agora.getDay()];
  const faseLua = getMoonPhase();
  // Single offering by ID
  if (id) {
    const offering = offeringsBase.find(o => o.id === id);
    if (!offering) {
      return NextResponse.json(
        { error: 'Oferta não encontrada', offering: null },
        { status: 404 }
      );
    }
    return NextResponse.json({
      offering,
      meta: { phase: faseLua, day: diaAtual },
    });
  }
  // Filter offerings by criteria
  let filteredOfferings = [...offeringsBase];
  if (type) {
    filteredOfferings = filteredOfferings.filter(o => o.type === type);
  }
  if (orixa) {
    filteredOfferings = filteredOfferings.filter(o => o.orixa?.toLowerCase() === orixa.toLowerCase());
  }
  if (element) {
    filteredOfferings = filteredOfferings.filter(o => o.element === element);
  }
  // Return offerings for today by default if no filters
  const todayOrixa = getOrixaByDay(diaAtual);
  const todayOfferings = filteredOfferings.filter(o => {
    if (!o.bestDays) return true;
    return o.bestDays.includes(diaAtual);
  });
  // Apply limit if specified
  const offerings = (limit ? filteredOfferings.slice(0, limit) : filteredOfferings.length > 0 ? filteredOfferings : todayOfferings);
  return NextResponse.json({
    offerings,
    total: offerings.length,
    meta: {
      phase: faseLua,
      day: diaAtual,
      recommendedOrixa: todayOrixa,
    },
  });
}
