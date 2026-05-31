import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const AncestralQuerySchema = z.object({
  userId: z.string().optional(),
  linhagem: z.string().optional(),
  geracao: z.coerce.number().int().positive().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const AncestralBodySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  linhagem: z.string().min(1, 'Linhagem é obrigatória'),
  geracao: z.number().int().positive().optional(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  dataFalecimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  orixa: z.string().optional(),
  qualities: z.array(z.string()).optional(),
  historia: z.string().optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Ancestral Traditions with Spiritual Correlations ──────────────────────────────────────────
const ANCESTRAL_TRADITIONS = [
  {
    id: 'candomble',
    name: 'Candomblé',
    origin: 'África Ocidental / Brasil',
    element: 'Fogo',
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: 4,
    orixas: ['Oxum', 'Ogum', 'Xangô', 'Iemanjá', 'Oxalá', 'Nanã', 'Iansã', 'Omolu', 'Oxóssi'],
    description: 'Tradição religiosa afro-brasileira que venera os Orixás e ancestrais. Cada Orixá representa uma força da natureza e um princípio espiritual.',
    rituals: ['Batuko', 'Xirê', 'Ekissi'],
    symbols: ['pá', 'espada', 'maracá', 'alguidar'],
  },
  {
    id: 'umbanda',
    name: 'Umbanda',
    origin: 'Brasil (Século XX)',
    element: 'Água',
    sefirot: ['Yesod', 'Netzach', 'Chesed'],
    chakra: 6,
    orixas: ['Oxum', 'Iemanjá', 'Ogum', 'Xangô', 'Oxalá', 'Iansã'],
    description: 'Tradição espírita afro-brasileira que integra elementos do Candomblé com doutrinas espíritas. Trabalha com Pretos Velhos, Caboclos e Ervas.',
    rituals: ['Gira', 'Passes', 'Descartes'],
    symbols: ['vela', 'defumação', 'água', 'flor'],
  },
  {
    id: 'jurema',
    name: 'Jurema Sagrada',
    origin: 'Nordeste Brasileiro / México',
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod', 'Chokhmah'],
    chakra: 1,
    orixas: ['Oxum', 'Oxóssi', 'Iemanjá'],
    description: 'Tradição sagrada que utiliza a Jurema como planta sagrada para ritual. Vincula-se às culturas indígena e afro-brasileira.',
    rituals: ['Jurema', 'Tambor', 'Café'],
    symbols: ['jurema', 'cabaça', 'peneira', 'café'],
  },
  {
    id: 'tupi',
    name: 'Tradição Tupi',
    origin: 'Brasil Pré-Colombiano',
    element: 'Ar',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 5,
    orixas: ['Iemanjá', 'Tupã', 'Amanajá'],
    description: 'Tradição ancestral dos povos Tupi que venera a natureza e os espíritos da mata. Ancestralidade indígena brasileira.',
    rituals: ['Toré', 'Cauim', 'Nhengatu'],
    symbols: ['cauim', 'pena', 'maraca', 'cesto'],
  },
  {
    id: 'espirita',
    name: 'Espiritismo',
    origin: 'França / Brasil',
    element: 'Éter',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    orixas: ['Oxalá'],
    description: 'Doutrina codificada por Allan Kardec que estuda a comunicação com Espíritos. Foco na evolução espiritual e caridade.',
    rituals: ['Passes', 'Materializações', 'Mesas'],
    symbols: ['bíblia', 'quadro negro', 'flor', 'água'],
  },
];

// ─── Orixá Ancestral Correlations ──────────────────────────────────────────
const ORIXAS_ANCESTRAIS = [
  {
    id: 'oxum',
    name: 'Oxum',
    element: 'Água',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    qualities: ['doçura', 'prosperidade', 'amor', 'sabedoria'],
    offerings: ['canjica', 'mel', 'flores amarelas', 'vinagre'],
    affirmations: ['A doçura divina flui em mim', 'Sou merecedor de amor e prosperidade'],
  },
  {
    id: 'oxumar',
    name: 'Oxumar',
    element: 'Água',
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    qualities: ['arco-íris', 'comércio', 'riqueza', 'movimento'],
    offerings: ['dendê', 'farinha', 'balaios'],
    affirmations: ['A abundância flui em minha vida', 'Sou abençoado com prosperidade'],
  },
  {
    id: 'iansa',
    name: 'Iansã',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    qualities: ['tempestade', 'vitória', 'coragem', 'energia'],
    offerings: ['pinha', 'milho torrado', 'balões'],
    affirmations: ['Tenho força para superar todos os obstáculos', 'A vitória é minha natureza'],
  },
  {
    id: 'ogum',
    name: 'Ogum',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    qualities: ['guerreiro', 'ferreiro', 'estrada', 'proteção'],
    offerings: ['ferro', 'faca', 'epó', 'cachaça'],
    affirmations: ['Tenho coragem e força para abrir meus caminhos', 'Sou protegido em todas as jornadas'],
  },
  {
    id: 'xango',
    name: 'Xangô',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 4,
    qualities: ['justiça', 'raio', 'pedra', 'fogo'],
    offerings: ['pão', 'acará', 'cachaça', 'fogo'],
    affirmations: ['A justiça divina guia minhas ações', 'Sou equilibrado na força e na sabedoria'],
  },
  {
    id: 'iemaja',
    name: 'Iemanjá',
    element: 'Água',
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    qualities: ['mãe', 'mar', 'lua', 'pureza'],
    offerings: ['água', 'flores brancas', 'sal', 'colares'],
    affirmations: ['A mãe divina me sustenta e protege', 'Sou purificado pelas águas sagradas'],
  },
  {
    id: 'oxala',
    name: 'Oxalá',
    element: 'Éter',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    qualities: ['pai', 'criador', 'paz', 'luz'],
    offerings: ['milho', 'pão', 'flores brancas', 'água'],
    affirmations: ['A luz divina me conduz', 'Sou um filho da luz sagrada'],
  },
  {
    id: 'nana',
    name: 'Nanã',
    element: 'Água',
    sefirot: ['Binah', 'Malkuth'],
    chakra: 1,
    qualities: ['anciã', 'lama', 'sabedoria', 'morte e renascimento'],
    offerings: ['caruru', 'quiabo', 'folhas secas'],
    affirmations: ['Aceito o ciclo da vida e da morte', 'A sabedoria dos antigos me guia'],
  },
  {
    id: 'omolu',
    name: 'Omolu',
    element: 'Terra',
    sefirot: ['Malkuth', 'Gevurah'],
    chakra: 1,
    qualities: ['saúde', 'cura', 'terra', 'peste e proteção'],
    offerings: ['caruru', 'pipoca', 'cachaça', 'charuto'],
    affirmations: ['Sou curado em todas as dimensões', 'A terra me sustenta e renova'],
  },
  {
    id: 'oxossi',
    name: 'Oxóssi',
    element: 'Terra',
    sefirot: ['Netzach', 'Malkuth'],
    chakra: 2,
    qualities: ['caçador', 'floresta', 'abundância', 'caça'],
    offerings: ['milho', ' fumo', 'cachaça', 'lenha'],
    affirmations: ['A abundância da floresta me sustenta', 'Caço meus objetivos com sabedoria'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AncestralQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      linhagem: searchParams.get('linhagem'),
      geracao: searchParams.get('geracao'),
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

    const { userId, linhagem, geracao, sefirot, chakra, element, orixa } = parseResult.data;

    let traditions = [...ANCESTRAL_TRADITIONS];
    let orixas = [...ORIXAS_ANCESTRAIS];

    // Filter by lineage
    if (linhagem) {
      traditions = traditions.filter(t =>
        t.id === linhagem.toLowerCase() ||
        t.name.toLowerCase().includes(linhagem.toLowerCase())
      );
    }

    // Filter by spiritual correlations
    if (sefirot) {
      traditions = traditions.filter(t => t.sefirot.includes(sefirot));
      orixas = orixas.filter(o => o.sefirot.includes(sefirot));
    }
    if (chakra) {
      traditions = traditions.filter(t => t.chakra === chakra);
      orixas = orixas.filter(o => o.chakra === chakra);
    }
    if (element) {
      traditions = traditions.filter(t => t.element === element);
      orixas = orixas.filter(o => o.element === element);
    }
    if (orixa) {
      traditions = traditions.filter(t => t.orixas.some(o => o.toLowerCase().includes(orixa.toLowerCase())));
      orixas = orixas.filter(o => o.id === orixa.toLowerCase());
    }

    // Statistics
    const stats = {
      byElement: ANCESTRAL_TRADITIONS.reduce((acc, t) => {
        acc[t.element] = (acc[t.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: ANCESTRAL_TRADITIONS.reduce((acc, t) => {
        acc[t.chakra] = (acc[t.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: ANCESTRAL_TRADITIONS.reduce((acc, t) => {
        t.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalTraditions: ANCESTRAL_TRADITIONS.length,
      totalOrixas: ORIXAS_ANCESTRAIS.length,
    };

    return NextResponse.json({
      success: true,
      userId,
      linhagem,
      geracao,
      traditions,
      orixas,
      total: traditions.length,
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro ao processar ancestral: ${err.message}`,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = AncestralBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { nome, linhagem, geracao, dataNascimento, dataFalecimento, orixa, qualities, historia, sefirot, chakra, element } = parseResult.data;

    // Find orixa correlations if specified
    const orixaCorr = orixa ? ORIXAS_ANCESTRAIS.find(o => o.id === orixa.toLowerCase()) : undefined;

    const ancestral = {
      id: crypto.randomUUID(),
      nome,
      linhagem,
      geracao,
      dataNascimento,
      dataFalecimento,
      orixa,
      qualities,
      historia,
      createdAt: new Date().toISOString(),
      sefirot: sefirot || orixaCorr?.sefirot || [],
      chakra: chakra || orixaCorr?.chakra,
      element: element || orixaCorr?.element,
    };

    return NextResponse.json({
      success: true,
      message: 'Ancestral registrado',
      ancestral,
      spiritualCorrelations: {
        sefirot: ancestral.sefirot,
        chakra: ancestral.chakra,
        element: ancestral.element,
        orixaCorrelations: orixaCorr,
      },
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro ao processar ancestral: ${err.message}`,
    }, { status: 500 });
  }
}