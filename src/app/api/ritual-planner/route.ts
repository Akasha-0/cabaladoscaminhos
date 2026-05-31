// ============================================================
// RITUAL PLANNER API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const RitualPlannerQuerySchema = z.object({
  orixa: z.string().optional(),
  tipo: z.enum(['harmonizacao', 'invocacao', 'oferenda', 'limpeza', 'all']).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

const RitualPlannerBodySchema = z.object({
  nome: z.string().min(2, 'Nome do ritual é obrigatório'),
  orixa: z.string().min(1, 'Orixá é obrigatório'),
  tipo: z.enum(['harmonizacao', 'invocacao', 'oferenda', 'limpeza']),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional(),
  descricao: z.string().optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Ritual Type Spiritual Correlations ──────────────────────────────────────────
const RITUAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  description: string;
}> = {
  harmonizacao: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A harmonia divina flui através de mim',
    frequency: '528 Hz',
    description: 'Rituais para harmonizar energias, equilibrar chakras e trazer paz interior',
  },
  invocacao: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Invoco a luz divina para guiar meus passos',
    frequency: '963 Hz',
    description: 'Rituais para invocar energias divinas, Orixás e guias espirituais',
  },
  oferenda: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Ofereço com gratidão e amor sincero',
    frequency: '528 Hz',
    description: 'Rituais de oferenda para agradecer e presentear os Orixás',
  },
  limpeza: {
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A purificação me libera de energias densas',
    frequency: '417 Hz',
    description: 'Rituais de limpeza energética, defumação e banhos ritualísticos',
  },
};

// ─── Ritual Definitions with Spiritual Correlations ──────────────────────────────────────────
interface Ritual {
  id: string;
  nome: string;
  tipo: string;
  orixa: string;
  description: string;
  materiais: string[];
  passos: string[];
  duracao: string;
  faseLua: string[];
  diaSemana: string[];
  sefirot: string[];
  chakra: number;
  element: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const RITUALS: Ritual[] = [
  // Harmonização
  {
    id: 'harm-oxum-1',
    nome: 'Ritual de Harmonização com Oxum',
    tipo: 'harmonizacao',
    orixa: 'Oxum',
    description: 'Ritual para harmonizar o chakra do coração e atrair amor e prosperidade.',
    materiais: ['Vela dourada', 'Mel', 'Flores amarelas', 'Perfume de flores', 'Água de flor'],
    passos: [
      'Acenda a vela dourada',
      'Coloque o mel em um prato',
      'Ofereça as flores amarillas a Oxum',
      'Recite a oração a Oxum',
      'Agradeça pelas bênçãos'
    ],
    duracao: '30 minutos',
    faseLua: ['Lua Cheia', 'Lua Crescente'],
    diaSemana: ['Sábado'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    affirmation: 'Oxum abençoa meu lar com amor e abundância',
    frequency: '528 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.harmonizacao,
  },
  {
    id: 'harm-oxum-2',
    nome: 'Banho de Oxum',
    tipo: 'harmonizacao',
    orixa: 'Oxum',
    description: 'Banho ritual para limpar energias negativas e trazer harmonização emocional.',
    materiais: ['Pétalas de rosa', 'Mel', 'Camomila', 'Água morna', 'Vela dourada'],
    passos: [
      'Ferva a água com camomila',
      'Adicione o mel e as pétalas',
      'Deixe esfriar até temperatura agradavel',
      'Despeje sobre o corpo enquanto recita a oração',
      'Enxague com água limpa'
    ],
    duracao: '45 minutos',
    faseLua: ['Lua Nova', 'Lua Crescente'],
    diaSemana: ['Segunda-feira', 'Sábado'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Água',
    affirmation: 'As águas de Oxum me purificam e harmonizam',
    frequency: '528 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.harmonizacao,
  },
  // Invocação
  {
    id: 'inv-oxala-1',
    nome: 'Invocação a Oxalá',
    tipo: 'invocacao',
    orixa: 'Oxalá',
    description: 'Ritual de invocação para pedir orientação e proteção divina.',
    materiais: ['Vela branca', 'Alguidar branco', 'Coco', 'Água de cheiro', 'Flores brancas'],
    passos: [
      'Organize o altar com a vela branca no centro',
      'Coloque o alguidar com água e coco',
      'Acenda a vela com intenção pura',
      'Recite a ladainha a Oxalá',
      'Peça proteção e orientação'
    ],
    duracao: '20 minutos',
    faseLua: ['Lua Nova'],
    diaSemana: ['Domingo'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    affirmation: 'Oxalá, Pai de toda a criação, guia meus passos',
    frequency: '963 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.invocacao,
  },
  {
    id: 'inv-ogum-1',
    nome: 'Invocação a Ogum',
    tipo: 'invocacao',
    orixa: 'Ogum',
    description: 'Ritual para invocar coragem, força e superação de obstáculos.',
    materiais: ['Vela vermelha', 'Espada de Ogum', 'Azeite', 'Fumo de pao', 'Pimenta'],
    passos: [
      'Acenda a vela vermelha',
      'Coloque a espada de Ogum no altar',
      'Unte a espada com azeite',
      'Queime fumo de pao para abrir caminhos',
      'Recite a oração de Ogum'
    ],
    duracao: '25 minutos',
    faseLua: ['Lua Cheia'],
    diaSemana: ['Terça-feira'],
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    affirmation: 'Ogum, guerreiro divino, me dá força para vencer',
    frequency: '528 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.invocacao,
  },
  // Oferenda
  {
    id: 'of-oxum-1',
    nome: 'Oferenda a Oxum',
    tipo: 'oferenda',
    orixa: 'Oxum',
    description: 'Oferenda para agradecér a Oxum por suas bênçãos.',
    materiais: ['Mel', 'Pétalas de flores', 'Vela dourada', 'Espelho', 'Perfume'],
    passos: [
      'Prepare o mel em um prato bonito',
      'Decore com pétalas de flores',
      'Coloque o espelho para Oxum se olhar',
      'Acenda a vela dourada',
      'Recite palavras de gratidão'
    ],
    duracao: '15 minutos',
    faseLua: ['Lua Cheia'],
    diaSemana: ['Sábado'],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    affirmation: 'Gratidão a Oxum, mãe amorosa e abençoada',
    frequency: '528 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.oferenda,
  },
  {
    id: 'of-iemanja-1',
    nome: 'Oferenda a Iemanjá',
    tipo: 'oferenda',
    orixa: 'Iemanjá',
    description: 'Oferenda para a rainha do mar e protetora das águas.',
    materiais: ['Flor branca', 'Azeite', 'Barra de sabão', 'Champagne', 'Lenços brancos'],
    passos: [
      'Prepare o presente com flores brancas',
      'Adicione o azeite e champagne',
      'Coloque na beira do mar ao anoitecer',
      'Recite a oração a Iemanjá',
      'Entregue com amor e gratidão'
    ],
    duracao: '30 minutos',
    faseLua: ['Lua Cheia'],
    diaSemana: ['Segunda-feira'],
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    element: 'Água',
    affirmation: 'Iemanjá, mãe das águas, obrigada por sua proteção',
    frequency: '639 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.oferenda,
  },
  // Limpeza
  {
    id: 'lim-ogum-1',
    nome: 'Defumação de Ogum',
    tipo: 'limpeza',
    orixa: 'Ogum',
    description: 'Ritual de limpeza energética com defumação para remover energias negativas.',
    materiais: ['Charuto de fumo de pao', 'Vela vermelha', 'Azeite', 'Pimenta calabresa'],
    passos: [
      'Acenda o charuto de fumo de pao',
      'Passe o azeite nos marcos da porta',
      'Defume todos os cômodos no sentido horário',
      'Recite a oração de Ogum',
      'Agradeça a proteção recebida'
    ],
    duracao: '40 minutos',
    faseLua: ['Lua Minguante'],
    diaSemana: ['Terça-feira'],
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    element: 'Fogo',
    affirmation: 'Ogum, guardião, protege meu lar de todo mal',
    frequency: '417 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.limpeza,
  },
  {
    id: 'lim-petra-1',
    nome: 'Ritual de Pedra de Xangô',
    tipo: 'limpeza',
    orixa: 'Xangô',
    description: 'Ritual para limpar karmas e dissolver blocages com a energia de Xangô.',
    materiais: ['Pedra de raio (quartzo)',
'Vela laranja', 'Azeite', 'Fumo branco', 'Água de chuva'],
    passos: [
      'Segure a pedra enquanto acende a vela',
      'Passe azeite na pedra',
      'Defume com fumo branco',
      'Recite a oração a Xangô',
      'Coloque a pedra em local de honra'
    ],
    duracao: '35 minutos',
    faseLua: ['Lua Cheia', 'Lua Minguante'],
    diaSemana: ['Quarta-feira'],
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    element: 'Fogo',
    affirmation: 'Xangô, senhor da justiça, traz equilíbrio a minha vida',
    frequency: '528 Hz',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.limpeza,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = RitualPlannerQuerySchema.safeParse({
    orixa: searchParams.get('orixa'),
    tipo: searchParams.get('tipo'),
    data: searchParams.get('data'),
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

  const { orixa, tipo, sefirot, chakra, element } = parseResult.data;
  let rituals = [...RITUALS];

  if (tipo && tipo !== 'all') {
    rituals = rituals.filter(r => r.tipo === tipo);
  }

  if (orixa) {
    rituals = rituals.filter(r => r.orixa.toLowerCase() === orixa.toLowerCase());
  }

  if (sefirot) {
    rituals = rituals.filter(r => r.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    rituals = rituals.filter(r => r.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    rituals = rituals.filter(r => r.spiritualCorrelations.element === element);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byTipo: rituals.reduce((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: rituals.reduce((acc, r) => {
      acc[r.orixa] = (acc[r.orixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: rituals.reduce((acc, r) => {
      r.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: rituals.reduce((acc, r) => {
      const c = r.spiritualCorrelations.chakra;
      if (c) acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: rituals.reduce((acc, r) => {
      const e = r.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    rituals,
    count: rituals.length,
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { orixa, tipo, sefirot, chakra, element },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = RitualPlannerBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const ritualCorr = RITUAL_SPIRITUAL_CORRELATIONS[parseResult.data.tipo] || RITUAL_SPIRITUAL_CORRELATIONS.harmonizacao;

    const ritual = {
      id: crypto.randomUUID(),
      ...parseResult.data,
      status: 'pendente',
      sefirot: parseResult.data.sefirot || ritualCorr.sefirot,
      chakra: parseResult.data.chakra || ritualCorr.chakra,
      element: parseResult.data.element || ritualCorr.element,
      affirmation: ritualCorr.affirmation,
      frequency: ritualCorr.frequency,
      spiritualCorrelations: ritualCorr,
    };

    return NextResponse.json({
      success: true,
      message: 'Ritual criado com sucesso',
      ritual,
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar ritual',
    }, { status: 500 });
  }
}