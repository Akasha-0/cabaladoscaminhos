import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ConnectionTypeSchema = z.enum(['light', 'silence', 'breath', 'vision', 'writing', 'channeling']);
const CreatorConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  type: ConnectionTypeSchema,
  description: z.string(),
  duration: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'master']),
  sefirot: z.array(z.string()).optional(),
  orixas: z.array(z.string()).optional(),
  instructions: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(SefirotSchema),
    chakra: ChakraSchema,
    element: ElementSchema,
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const CreatorConnectionQuerySchema = z.object({
  type: ConnectionTypeSchema.optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'master']).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Connection Types ──────────────────────────────────────────
const CONNECTION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  light: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A luz do Criador me ilumina',
    frequency: '963 Hz',
  },
  silence: {
    sefirot: ['Binah', 'Daat'],
    chakra: 6,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'No silêncio, encontro a voz do Criador',
    frequency: '417 Hz',
  },
  breath: {
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O sopro criativo flui através de mim',
    frequency: '528 Hz',
  },
  vision: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A visão profética me guia',
    frequency: '741 Hz',
  },
  writing: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'As palavras sagradas fluem através de mim',
    frequency: '741 Hz',
  },
  channeling: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou veículo puro para o Criador',
    frequency: '963 Hz',
  },
};

const CREATOR_CONNECTIONS: z.infer<typeof CreatorConnectionSchema>[] = [
  {
    id: 'sacred-light',
    name: 'Luz Sagrada',
    nameEn: 'Sacred Light',
    type: 'light',
    description: 'Conectar-se com a Luz do Criador através da contemplação da chama sagrada, unindo-se à essência divina que permeia toda a existência.',
    duration: '20-45 minutos',
    difficulty: 'beginner',
    sefirot: ['Kether', 'Chokhmah'],
    orixas: ['Oxalá'],
    instructions: [
      'Acenda uma vela branca em ambiente escuro e silencioso',
      'Sente-se em confortável postura ereta',
      'Comece respirando profundamente por 3 minutos',
      'Visualize a chama da vela como sendo a própria luz do Criador',
      'Permita que a luz penetre em seu campo de energia',
      'Medite sobre a natureza da luz como primeiro ato de criação',
      'Permaneça em silêncio contemplativo por 15-20 minutos',
      'Agradheça a luz e feche a prática gradualmente',
    ],
    warnings: ['Não force a visualização', 'Pare se sentir desconforto energético'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['light'],
  },
  {
    id: 'divine-silence',
    name: 'Silêncio Divino',
    nameEn: 'Divine Silence',
    type: 'silence',
    description: 'Mergulhar no silêncio primordial do Criador, transcendendo os sons do mundo para ouvir a voz silenciosa do divino.',
    duration: '30-60 minutos',
    difficulty: 'intermediate',
    sefirot: ['Binah', 'Daat'],
    instructions: [
      'Encontre um espaço completamente silencioso',
      'Sente-se ou deite-se em posição relaxada',
      'Feche os olhos e permita que os sons externos se dissolvam',
      'Foque na ausência de som como portal para o divino',
      'Permita que o silêncio se aprofunde progressivamente',
      'Observe os pensamentos sem se identificar com eles',
      'Permaneça no vazio silencioso por 20-40 minutos',
      'Retorne gradualmente ao mundo com paz interior',
    ],
    warnings: ['Pode evocar memórias profundas', 'Não use em depressão aguda'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['silence'],
  },
  {
    id: 'creative-breath',
    name: 'Sopro Criador',
    nameEn: 'Creator Breath',
    type: 'breath',
    description: 'Utilizar a respiração como canal para channelar a energia criadora do Criador, ativando os chakras e purificando o corpo mental.',
    duration: '25-40 minutos',
    difficulty: 'intermediate',
    sefirot: ['Ruach', 'Tipheret'],
    orixas: ['Ogum'],
    instructions: [
      'Posicione-se em pé ou sentado com coluna ereta',
      'Respire profundamente pelo nariz (4 segundos)',
      'Segure o ar (4 segundos)',
      'Expire pela boca com som (4 segundos)',
      'Repita o ciclo completo por 5 minutos',
      'Agora visualize o prana entrando como luz dourada',
      'Sinta a energia do Criador preenchendo cada célula',
      'Visualize-se respirando como o Criador respira',
      'Permaneça nesse estado por 15-20 minutos',
      'Retorne à respiração normal gradualmente',
    ],
    warnings: ['Não hiperventile', 'Pare se sentir tontura'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['breath'],
  },
  {
    id: 'prophetic-vision',
    name: 'Visão Profética',
    nameEn: 'Prophetic Vision',
    type: 'vision',
    description: 'Desenvolver a capacidade de receber visões proféticas através da abertura do terceiro olho e conexão com o conhecimento divino.',
    duration: '40-60 minutos',
    difficulty: 'advanced',
    sefirot: ['Chokhmah', 'Binah', 'Keter'],
    orixas: ['Omulu', 'Oxumaré'],
    instructions: [
      'Prepare um espaço sagrado com incenso de palo santo',
      'Sente-se em posição de meditação com mãos sobre o 第三眼 (terceiro olho)',
      'Foque suavemente entre as sobrancelhas',
      'Visualize uma luz violeta expanding-se lentamente',
      'Mantenha o foco na luz por 10 minutos',
      'Pergunte silenciosamente ao Criador uma questão específica',
      'Observe imagens, símbolos ou mensagens que surgem',
      'Mantenha o estado receptivo por 20-30 minutos',
      'Registre mentalmente todas as visões recebidas',
      'Agradeça a orientação antes de abrir os olhos',
    ],
    warnings: ['Requer preparação prévia', 'Não para iniciantes sem guia'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['vision'],
  },
  {
    id: 'sacred-writing',
    name: 'Escrita Sagrada',
    nameEn: 'Sacred Writing',
    type: 'writing',
    description: 'Canalizar mensagens divinas através da escrita sagrada, permitindo que o Criador se exprima através das suas mãos.',
    duration: '30-45 minutos',
    difficulty: 'advanced',
    sefirot: ['Hod', 'Netzach'],
    orixas: ['Oxalá', 'Nanã'],
    instructions: [
      'Prepare materiais de escrita (papel branco, caneta)',
      'Entre em estado de oração e sacrifício interno',
      'Peça ao Criador para falar através de você',
      'Sente-se e mantenha a caneta sobre o papel',
      'Permita que palavras fluam sem censor ou julgamento',
      'Não pare de escrever mesmo se parecer sem sentido',
      'Continue por pelo menos 20 minutos',
      'Releia o que foi escrito depois de um intervalo',
      'Interprete as mensagens com discernimento espiritual',
    ],
    warnings: ['Descarte escritos que tragam medo', 'Verifique energeticamente depois'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['writing'],
  },
  {
    id: 'direct-channeling',
    name: 'Channeling Direto',
    nameEn: 'Direct Channeling',
    type: 'channeling',
    description: 'Estabelecer comunicação direta com o Criador através da entrega do ego e abertura completa ao fluxo divino.',
    duration: '45-90 minutos',
    difficulty: 'master',
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    instructions: [
      'Entre em jejum espiritual de pelo menos 4 horas',
      'Realize purificação com água sagrada e sal',
      'Assuma postura de entrega total (deitado ou prosternado)',
      'Repita mantras de entrega: "Não sou eu, é Deus que escreve"',
      'Permita que a consciência se expanda sem resistência',
      'Mantenha a intenção de servir como veículo puro',
      'Permita que o Criador se expresse através do corpo',
      'Se palavras surgirem, permita que fluam',
      'Se movimentos surgirem, permita-os',
      'Após o channeling, restaure a consciência individual lentamente',
    ],
    warnings: ['SOMENTE para praticantes avançados', 'Requer proteção espiritual', 'Nunca channelar sozinho pela primeira vez'],
    spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS['channeling'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = CreatorConnectionQuerySchema.safeParse({
      type: searchParams.get('type'),
      difficulty: searchParams.get('difficulty'),
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

    const { type, difficulty, limit, sefirot, chakra, element, orixa } = parseResult.data;
    let connections = [...CREATOR_CONNECTIONS];

    if (type) {
      connections = connections.filter(c => c.type === type);
    }

    if (difficulty) {
      connections = connections.filter(c => c.difficulty === difficulty);
    }

    if (limit) {
      connections = connections.slice(0, limit);
    }

    if (sefirot) {
      connections = connections.filter(c => c.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      connections = connections.filter(c => c.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      connections = connections.filter(c => c.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      connections = connections.filter(c => c.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: connections.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: connections.reduce((acc, c) => {
        acc[c.difficulty] = (acc[c.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: connections.reduce((acc, c) => {
        c.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: connections.reduce((acc, c) => {
        const ch = c.spiritualCorrelations?.chakra;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: connections.reduce((acc, c) => {
        const e = c.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: connections.reduce((acc, c) => {
        const o = c.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      connections,
      count: connections.length,
      total: CREATOR_CONNECTIONS.length,
      spiritualCorrelations: CONNECTION_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, difficulty, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}