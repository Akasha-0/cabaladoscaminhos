import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const PurityPracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  tradition: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  duration: z.string(),
  contraindications: z.array(z.string()).optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const PurityPracticeQuerySchema = z.object({
  tradition: z.string().optional(),
  type: z.enum(['physical', 'energetic', 'mental', 'spiritual']).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Purity Practices ──────────────────────────────────────────
const PURITY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'gatha-practice': {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Minha mente está em paz e pura',
    frequency: '741 Hz',
  },
  'ho-oponopono': {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Perdoo e sou perdoado, estou em paz',
    frequency: '528 Hz',
  },
  'loving-kindness': {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão fluem através de mim',
    frequency: '528 Hz',
  },
  'water-purification': {
    sefirot: ['Yesod', 'Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A água sagrada purifica meu ser',
    frequency: '285 Hz',
  },
  'japa-mala': {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'O mantra ressoa em cada célula do meu ser',
    frequency: '963 Hz',
  },
  'confession-ritual': {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Confesso minhas falhas com coração aberto',
    frequency: '396 Hz',
  },
  'smudging': {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A fumaça sagrada limpa minha aura',
    frequency: '396 Hz',
  },
  'salt-bath': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'O sal purifica minha essência terrestre',
    frequency: '174 Hz',
  },
  'moonlight-bath': {
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A luz da lua purifica minha alma',
    frequency: '639 Hz',
  },
  'sacred-fire': {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'O fogo sagrado transforma e purifica',
    frequency: '396 Hz',
  },
};

const PURITY_PRACTICES: z.infer<typeof PurityPracticeSchema>[] = [
  {
    id: 'gatha-practice',
    name: 'Prática do Gatha',
    tradition: 'Zen Budismo',
    description: 'Recitação de versos sagrados para purificar a mente e alinhar a intenção.',
    steps: [
      'Sente-se em postura de meditação',
      'Recite o gatha lentamente, com atenção plena',
      'Permita que cada palavra penetre profundamente',
      'Repita até que a mente se acalme completamente',
      'Permaneça em silêncio após a recitação',
    ],
    duration: '15-30 minutos',
    contraindications: ['Não force a recitação se sentir resistência'],
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['gatha-practice'],
  },
  {
    id: 'ho-oponopono',
    name: 'Ho\'oponopono',
    tradition: 'Havaiano',
    description: 'Antiga prática havaiana de reconciliação e purificação através de quatro frases.',
    steps: [
      'Identifique a situação ou pessoa que deseja purificar',
      'Repita interiormente: "Sinto muito" (pela dor que você causou)',
      'Repita: "Perdoe-me" (por não estar em paz)',
      'Repita: "Obrigado" (pela oportunidade de purificar)',
      'Repita: "Eu te amo" (a si mesmo, à situação, ao universo)',
    ],
    duration: '10-20 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['ho-oponopono'],
  },
  {
    id: 'loving-kindness',
    name: 'Metta Bhavana (Benevolência)',
    tradition: 'Budismo Theravada',
    description: 'Cultivo systematic do amor bondoso para purificar o coração de ressentimentos.',
    steps: [
      'Comece com você mesmo: "Que eu seja feliz"',
      'Expanda para um benefactor: "Que [nome] seja feliz"',
      'Estenda a um amigo neutro: "Que [nome] seja feliz"',
      'Inclua alguém difícil: "Que [nome] seja feliz"',
      'Abra para todos os seres: "Que todos os seres sejam felizes"',
    ],
    duration: '20-45 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['loving-kindness'],
  },
  {
    id: 'water-purification',
    name: 'Purificação pela Água Sagrada',
    tradition: 'Universal',
    description: 'Uso de água purificada ritualisticamente para limpeza física e energética.',
    steps: [
      'Prepare água (de fonte, chuva ou purificada)',
      'Adicione sal marinho ou ervas purificadoras',
      'Segure a água com intenção de purificação',
      'Visualize a água absorvendo todas as impurezas',
      'Beba pequenas quantidades ou use para banhar locais',
    ],
    duration: '10-15 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['water-purification'],
  },
  {
    id: 'japa-mala',
    name: 'Japa Mala (Mantra)',
    tradition: 'Hindu/Yoga',
    description: 'Repetição de um mantra usando um mala de108 contas para purificar a mente e elevar a consciência.',
    steps: [
      'Escolha um mantra adequado à sua intenção',
      'Segure o mala com a mão direita',
      'A cada conta, repita o mantra com devoção',
      'Mantenha o foco na respiração e no som',
      'Complete108 repetições ou seu múltiplo',
    ],
    duration: '30-60 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['japa-mala'],
  },
  {
    id: 'confession-ritual',
    name: 'Ritual de Confissão',
    tradition: 'Cristão/Católico',
    description: 'Prática de confissão de pecados e pedidos de perdão para purificação da alma.',
    steps: [
      'Prepare um espaço sagrado e silencioso',
      'Faça um exame de consciência',
      'Confesse seus pecados com sinceridade',
      'Peça perdão e faça propósito de mudança',
      'Receba a absolvição ou perdoe-se',
    ],
    duration: '20-30 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['confession-ritual'],
  },
  {
    id: 'smudging',
    name: 'Defumação Sagrada',
    tradition: 'Ameríndio',
    description: 'Uso de ervas sagradas queimadas para limpar energias densas de ambientes e pessoas.',
    steps: [
      'Acenda as ervas sagradas (salvia, palo santo, incenso)',
      'Permita que a fumaça se espalhe pelo ambiente',
      'Passe a fumaça ao redor de você em espiral',
      'Visualize a fumaça carregando as impurezas',
      'Agradeça e despeça-se das energias',
    ],
    duration: '15-20 minutos',
    contraindications: ['Pessoas com problemas respiratórios devem evitar', 'Ventile bem o ambiente'],
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['smudging'],
  },
  {
    id: 'salt-bath',
    name: 'Banho de Sal',
    tradition: 'Universal',
    description: 'Banho com sal grosso para purificação física e energética do corpo.',
    steps: [
      'Dissolva 1kg de sal grosso em água morna',
      'Entre na banheira e relaxe',
      'Visualize o sal absorvendo todas as impurezas',
      'Permaneça por15-20 minutos',
      'Enxágue com água limpa ao sair',
    ],
    duration: '20-30 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['salt-bath'],
  },
  {
    id: 'moonlight-bath',
    name: 'Banho de Luz Lunar',
    tradition: 'Wicca/Neo-Pagão',
    description: 'Exposição à luz da lua cheia para purificação e carregamento energético.',
    steps: [
      'Escolha uma noite de lua cheia',
      'Exponha-se nu(a) à luz lunar',
      'Visualize a luz prateada purificando seu campo',
      'Permaneça por 15-30 minutos',
      'Agradeça à lua pela bênção',
    ],
    duration: '30-45 minutos',
    contraindications: ['Evite exposição prolongada em noites frias'],
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['moonlight-bath'],
  },
  {
    id: 'sacred-fire',
    name: 'Fogo Sagrado',
    tradition: 'Védico/Zoroastriano',
    description: 'Ritual de purificação através do fogo sagrado, usado em muitas tradições.',
    steps: [
      'Acenda um fogo sagrado (velas, lamparina, fogueira)',
      'Sente-se em frente ao fogo em reverência',
      'Ofereça intenções e orações ao fogo',
      'Visualize o fogo consumindo suas impurezas',
      'Agradeça ao fogo pela purificação',
    ],
    duration: '20-40 minutos',
    spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS['sacred-fire'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = PurityPracticeQuerySchema.safeParse({
      tradition: searchParams.get('tradition'),
      type: searchParams.get('type'),
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

    const { tradition, type, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...PURITY_PRACTICES];

    if (tradition) {
      practices = practices.filter(p => p.tradition.toLowerCase().includes(tradition.toLowerCase()));
    }

    if (sefirot) {
      practices = practices.filter(p => p.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      practices = practices.filter(p => p.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      practices = practices.filter(p => p.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      practices = practices.filter(p => p.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && practices.length > limit) {
      practices = practices.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byTradition: practices.reduce((acc, p) => {
        acc[p.tradition] = (acc[p.tradition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: practices.reduce((acc, p) => {
        p.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: practices.reduce((acc, p) => {
        const c = p.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: practices.reduce((acc, p) => {
        const e = p.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: practices.reduce((acc, p) => {
        const o = p.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      practices,
      count: practices.length,
      spiritualCorrelations: PURITY_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { tradition, type, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}