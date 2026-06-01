import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const OracleTypeSchema = z.enum(['tarot', 'lenormand', 'ifa', 'ogbe', 'opalino', 'kabbalah']);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);

const OracleQuerySchema = z.object({
  type: OracleTypeSchema.optional().default('tarot'),
  question: z.string().optional(),
  cards: z.coerce.number().int().positive().max(78).optional(),
  spread: z.enum(['single', 'three', 'celtic', 'horseshoe', 'grand']).optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
});

const OracleSystemSchema = z.object({
  id: OracleTypeSchema,
  name: z.string(),
  namePt: z.string(),
  cards: z.number(),
  origin: z.string(),
  tradition: z.string(),
  element: z.string(),
  sefirot: z.array(SefirotSchema),
  chakra: z.number(),
  orixa: z.string().optional(),
  description: z.string(),
  keySpread: z.string(),
});

export const dynamic = 'force-dynamic';

// ─── Oracle Systems with Spiritual Correlations ──────────────────────────────────────────
const ORACLE_SYSTEMS: z.infer<typeof OracleSystemSchema>[] = [
  {
    id: 'tarot',
    name: 'Tarot',
    namePt: 'Tarô',
    cards: 78,
    origin: 'Egito Antigo / Europa Medieval',
    tradition: 'Hermética / Cabalística',
    element: 'Ar',
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 6,
    orixa: 'Oxalá',
    description: 'Sistema de 78 cartas dividido em Arcanos Maiores (22) e Menores (56). Cada carta carrega símbolos e energias que refletem a sabedoria universal.',
    keySpread: 'Celtic Cross (10 cartas)',
  },
  {
    id: 'lenormand',
    name: 'Lenormand',
    namePt: 'Mesa Real / Cigano',
    cards: 36,
    origin: 'Alemanha / França (Século XIX)',
    tradition: 'Cartomancia Tradicional',
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 3,
    description: 'Sistema de 36 cartas com símbolos claros e diretos. Cada carta representa aspectos da vida cotidiana com interpretações precisas.',
    keySpread: 'Grande Mesa (9x4 + 4 centrais)',
  },
  {
    id: 'ifa',
    name: 'Ifá / Merindilogun',
    namePt: 'Ifá',
    cards: 16,
    origin: 'África Ocidental (Yorubá)',
    tradition: 'Tradições Afro-Brasileiras',
    element: 'Água',
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    orixa: 'Orunmilá',
    description: 'Sistema de 16 Odús (signos) que representa a sabedoria dos16 princípios fundamentais do destino. Cada Odu carrega preceitos, tabus e orientações divinas.',
    keySpread: 'Opele (8 linhas) ou Ikín (16 nozes)',
  },
  {
    id: 'ogbe',
    name: 'Ogbe',
    namePt: 'Ogbe',
    cards: 16,
    origin: 'África Ocidental (Yorubá)',
    tradition: 'Ifá',
    element: 'Fogo',
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    orixa: 'Ogum',
    description: 'Um dos 16 Odús principais de Ifá. Representa a energia da conquista, vitória e superação de obstáculos.',
    keySpread: 'Leitura de Odu (1 carta)',
  },
  {
    id: 'opalino',
    name: 'Opalino',
    namePt: 'Opalino',
    cards: 16,
    origin: 'África Ocidental (Yorubá)',
    tradition: 'Ifá',
    element: 'Água',
    sefirot: ['Netzach', 'Tipheret'],
    chakra: 4,
    orixa: 'Oxum',
    description: 'Um dos 16 Odús de Ifá. Representa a energia do amor, prosperidade e doçura na vida.',
    keySpread: 'Leitura de Odu (1 carta)',
  },
  {
    id: 'kabbalah',
    name: 'Kabbalah Oracle',
    namePt: 'Oráculo Cabalístico',
    cards: 22,
    origin: 'Tradição Judaica / Cabala',
    tradition: 'Cabala',
    element: 'Éter',
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    orixa: 'Oxalá',
    description: 'Sistema de 22 cartas correspondentes às 22 letras do alfabeto hebraico e aos 22 caminhos da Árvore da Vida. Cada carta integra as Sephiroth e os arcanos do Tarot.',
    keySpread: 'Árvore da Vida (10 cartas em Sephiroth)',
  },
];

// ─── Spread Definitions with Spiritual Correlations ──────────────────────────────────────────
const SPREADS = {
  single: {
    name: 'Carta Única',
    namePt: 'Carta Única',
    cards: 1,
    position: ['A resposta imediata'],
    sefirot: ['Tipheret'],
    chakra: 6,
    description: 'Obtenha uma resposta clara e direta para sua pergunta.',
  },
  three: {
    name: 'Trilogia',
    namePt: 'Três Cartas',
    cards: 3,
    position: ['Passado', 'Presente', 'Futuro'],
    sefirot: ['Binah', 'Tipheret', 'Chokhmah'],
    chakra: 5,
    description: 'Explore o passado, presente e futuro relacionados à sua pergunta.',
  },
  celtic: {
    name: 'Celtic Cross',
    namePt: 'Cruz Celta',
    cards: 10,
    position: [
      'Situação Atual',
      'Obstáculo',
      'Base',
      'Passado',
      'Coroa (Possível Futuro)',
      'Futuro Imediato',
      'Você',
      'Ambiente',
      'Esperanças/Medos',
      'Resultado Final',
    ],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tipheret', 'Gevurah', 'Chesed', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    description: 'Leitura clássica de 10 cartas que oferece uma visão completa da situação.',
  },
  horseshoe: {
    name: 'Ferradura',
    namePt: 'Ferradura',
    cards: 7,
    position: [
      'Passado',
      'Presente',
      'Futuro',
      'Base',
      'Coroa',
      'Ambiente',
      'Resultado',
    ],
    sefirot: ['Yesod', 'Malkuth', 'Tipheret', 'Netzach', 'Hod', 'Gevurah', 'Chesed'],
    chakra: 4,
    description: 'Leitura em forma de ferradura que revela a progressão temporal.',
  },
  grand: {
    name: 'Grande Mesa',
    namePt: 'Grande Mesa',
    cards: 36,
    position: ['Leitura completa Lenormand'],
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    description: 'Leitura completa de36 posições para análise profunda.',
  },
};

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = OracleQuerySchema.safeParse({
      type: searchParams.get('type'),
      question: searchParams.get('question'),
      cards: searchParams.get('cards'),
      spread: searchParams.get('spread'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, question, cards, spread, chakra, sefirot } = parseResult.data;

    let systems = [...ORACLE_SYSTEMS];

    // Filter by type
    if (type) {
      systems = systems.filter(s => s.id === type);
    }

    // Filter by chakra
    if (chakra) {
      systems = systems.filter(s => s.chakra === chakra);
    }

    // Filter by sefirot
    if (sefirot) {
      systems = systems.filter(s => s.sefirot.includes(sefirot));
    }

    // Get available spreads
    const availableSpreads = Object.entries(SPREADS).map(([key, value]) => ({
      id: key,
      name: value.name,
      namePt: value.namePt,
      cards: value.cards,
      position: value.position,
      sefirot: value.sefirot,
      chakra: value.chakra,
      description: value.description,
    }));

    // Statistics
    const stats = {
      byElement: ORACLE_SYSTEMS.reduce((acc, s) => {
        acc[s.element] = (acc[s.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: ORACLE_SYSTEMS.reduce((acc, s) => {
        acc[s.chakra] = (acc[s.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: ORACLE_SYSTEMS.reduce((acc, s) => {
        s.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalSystems: ORACLE_SYSTEMS.length,
      totalCards: ORACLE_SYSTEMS.reduce((sum, s) => sum + s.cards, 0),
    };

    return NextResponse.json({
      success: true,
      systems,
      spreads: availableSpreads,
      question: question || null,
      filters: { type, cards, spread, chakra, sefirot },
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

    const readingSchema = z.object({
      type: OracleTypeSchema,
      question: z.string().min(1, 'Pergunta é obrigatória'),
      spread: z.enum(['single', 'three', 'celtic', 'horseshoe', 'grand']).default('single'),
    });

    const parseResult = readingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, question, spread } = parseResult.data;
    const system = ORACLE_SYSTEMS.find(s => s.id === type);
    const spreadInfo = SPREADS[spread];

    if (!system || !spreadInfo) {
      return NextResponse.json({
        success: false,
        error: 'Sistema ou spread inválido',
      }, { status: 400 });
    }

    // Generate reading placeholder
    const reading = {
      id: `reading_${Date.now()}`,
      type,
      question,
      spread,
      system: {
        id: system.id,
        name: system.name,
        namePt: system.namePt,
      },
      spreadPositions: spreadInfo.position,
      sefirot: spreadInfo.sefirot,
      chakra: spreadInfo.chakra,
      timestamp: new Date().toISOString(),
      message: 'Esta é uma prévia da leitura. Para resultados completos, use a API de leitura específica do sistema escolhido.',
    };

    return NextResponse.json({
      success: true,
      reading,
      correlations: {
        sefirot: spreadInfo.sefirot,
        chakra: spreadInfo.chakra,
        systemElement: system.element,
        systemOrixa: system.orixa,
      },
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}