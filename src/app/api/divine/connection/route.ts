import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const DivineTypeSchema = z.enum(['orixa', 'santo', 'ancestral', 'archangel', 'ascended_master', 'deity']);
const ConnectionDepthSchema = z.enum(['surface', 'working', 'deep', 'master']);

const DivineConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  type: DivineTypeSchema,
  description: z.string(),
  orixa: z.string().optional(),
  archangel: z.string().optional(),
  sefirot: z.array(z.string()),
  chakra: z.string().optional(),
  day: z.string(),
  colors: z.array(z.string()),
  offerings: z.array(z.string()),
  invocation: z.string(),
  blessing: z.string(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: ChakraSchema,
    element: ElementSchema,
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const DivineConnectionQuerySchema = z.object({
  type: DivineTypeSchema.optional(),
  orixa: z.string().optional(),
  depth: ConnectionDepthSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Spiritual Correlations for Divine Types ──────────────────────────────────────────
const DIVINE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: Array<'Kether' | 'Chokhmah' | 'Binah' | 'Chesed' | 'Gevurah' | 'Tipheret' | 'Netzach' | 'Hod' | 'Yesod' | 'Malkuth'>;
  chakra: number;
  element: 'Fogo' | 'Água' | 'Terra' | 'Ar' | 'Éter';
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  orixa: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Orixás me guiam e protegem',
    frequency: '417 Hz',
  },
  santo: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Santos intercedem por mim',
    frequency: '528 Hz',
  },
  ancestral: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Terra',
    orixa: 'Iemanjá',
    affirmation: 'Ancestrais me abençoam',
    frequency: '396 Hz',
  },
  archangel: {
    sefirot: ['Kether', 'Gevurah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Arcanjos me protegem',
    frequency: '963 Hz',
  },
  ascended_master: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Mestres ascendidos me iluminam',
    frequency: '741 Hz',
  },
  deity: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A divindade me conecta à fonte',
    frequency: '963 Hz',
  },
};

// ─── Divine Connections Data ────────────────────────────────────────────────

const DIVINE_CONNECTIONS: z.infer<typeof DivineConnectionSchema>[] = [
  {
    id: 'oxala-creator',
    name: 'Oxalá',
    nameEn: 'God the Father / Creator',
    type: 'deity',
    description: 'O Criador supremo na cosmologia Yorubá. Pai de todos os Orixás, reprezentando a luz, a paz e a criação.',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    day: 'sexta-feira',
    colors: ['branco', 'amarelo'],
    offerings: ['mão de Oxalá (15g de akuara)', 'akará (bolinho de feijão)', 'efun (giz branco)', ' Água de obi'],
    invocation: 'Epa! Olorun Oxalá! creator-of-all-light',
    blessing: 'Que a luz de Oxalá illumine seu caminho e traga paz eterna à sua alma.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['deity'],
  },
  {
    id: 'iemanja-ocean',
    name: 'Iemanjá',
    nameEn: 'Our Lady of the Sea / Divine Mother',
    type: 'orixa',
    description: 'A Mãe Divina das águas, do mar e da fertilidade. Protetora das mulheres e dos pescadores.',
    orixa: 'Iemanjá',
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 'Anahata (4º)',
    day: 'sábado',
    colors: ['azul', 'branco'],
    offerings: ['flor de balanco branco', 'colares de contas azuis', 'espelho', 'água do mar', 'perfume de ALFABETO (alecrim)'],
    invocation: 'Salve Iemanjá! Rainha das águas! Mãe dos Aires!',
    blessing: 'Que as águas de Iemanjá lavem suas preocupações e tragam prosperidade ao seu lar.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'ogum-warrior',
    name: 'Ogum',
    nameEn: 'Saint George / Warrior God',
    type: 'orixa',
    description: 'Orixá da guerra, do ferro, do trabalho e da tecnologia. Protetor contra perigos e inimigo.',
    orixa: 'Ogum',
    sefirot: ['Gevurah'],
    chakra: 'Manipura (3º)',
    day: 'terça-feira',
    colors: ['verde', 'amarelo'],
    offerings: ['espada', 'ferradura', 'alecrim', 'fio de contas verdes e amarelas', 'mel'],
    invocation: 'Ogum! Patrón of iron and fire! open my path!',
    blessing: 'Que a espada de Ogum abra seus caminhos e vença todos os obstáculos.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'xango-thunder',
    name: 'Xangô',
    nameEn: 'Saint Jerome / Thunder God',
    type: 'orixa',
    description: 'Orixá do trovão, da justiça e do fogo. Rei de Oyó, governando raios e tempestades.',
    orixa: 'Xangô',
    sefirot: ['Gevurah', 'Hod'],
    chakra: 'Manipura (3º)',
    day: 'quarta-feira',
    colors: ['vermelho', 'marrom'],
    offerings: ['pão', ' fumo', 'gengibre', 'akará', 'pãozinho de manhã cedo'],
    invocation: 'Xangô! Lord of thunder! God of justice!',
    blessing: 'Que o trovão de Xangô traga justiça e dissipe toda escuridão em sua vida.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'oxum-gold',
    name: 'Oxum',
    nameEn: 'Our Lady of the Rivers / Love Goddess',
    type: 'orixa',
    description: 'Orixá das águas doces, do ouro, do amor e da fertilidade. Esposa de Xangô, amante de Oxumaré.',
    orixa: 'Oxum',
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 'Svadhisthana (2º)',
    day: 'sábado',
    colors: ['amarelo', 'dourado'],
    offerings: ['ouro', 'fio de contas amarelas', 'colher de mel', 'perfume de ALFABETO (lavanda)', 'flores amarelas'],
    invocation: 'Oxum! Rainha das águas doces! Love incarnate!',
    blessing: 'Que as águas de Oxum tragam amor, prosperidade eharmonia ao seu coração.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'nanã-ancient',
    name: 'Nanã Burucema',
    nameEn: 'Ancient Mother / Grandmother',
    type: 'orixa',
    description: 'A mais antiga das Iabás, senhora dos pântanos, do sapientíssimo e da velhice sagrada.',
    orixa: 'Nanã',
    sefirot: ['Binah'],
    chakra: 'Muladhara (1º)',
    day: 'quarta-feira',
    colors: ['roxo', 'branco', 'azul'],
    offerings: ['obí (noz de cola)', 'pipoca', 'água de obi', 'flor de mão de Nanã'],
    invocation: 'Nanã Burucema! Mãe antiga! Ancient wisdom!',
    blessing: 'Que a sabedoria de Nanã abra sua mente e traga enlightenment espiritual.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'omulu-disciple',
    name: 'Omulu/Obaluaiê',
    nameEn: 'Saint Lazarus / Earth God',
    type: 'orixa',
    description: 'Orixá das doenças, da terra e da cura. tambén conhecido como São Lázaro, senhor das pragas e da recuperação.',
    orixa: 'Omulu',
    sefirot: ['Malkuth'],
    chakra: 'Muladhara (1º)',
    day: 'segunda-feira',
    colors: ['amarelo', 'roxo', 'branco'],
    offerings: ['pipoca', 'caruru', 'amendoim torrado', 'farinha de mandioca'],
    invocation: 'Omulu! God of earth and healing! save your people!',
    blessing: 'Que Omulu proteja sua saúde e traga cura para todo sofrimento.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'oxumare-rainbow',
    name: 'Oxumaré',
    nameEn: 'Rainbow Serpent / Cosmic Serpent',
    type: 'orixa',
    description: 'Orixá do arco-íris, da chuva e da continuidade dos ciclos. A serpente cósmica que conecta cielo e terra.',
    orixa: 'Oxumaré',
    sefirot: ['Kether', 'Malkuth'],
    chakra: 'todos',
    day: 'terça-feira',
    colors: ['verde', 'amarelo', 'todas as cores'],
    offerings: ['dendê', 'farinha de mandioca', 'flores de todas as cores', 'espelho'],
    invocation: 'Oxumaré! Serpent of the rainbow! cosmic continuity!',
    blessing: 'Que o arco-íris de Oxumaré traga esperança e a promessa de renovação.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'archangel-michael',
    name: 'Arcanjo Miguel',
    nameEn: 'Archangel Michael',
    type: 'archangel',
    description: 'Arcanjo protetor, líder das forças celestiais. Governa proteção, coragem e vitórias sobre o mal.',
    archangel: 'Miguel',
    sefirot: ['Kether', 'Gevurah'],
    chakra: 'Sahasrara (7º)',
    day: 'terça-feira',
    colors: ['azul', 'roxo', 'branco'],
    offerings: ['incenso de sálvia', 'vela azul', ' água de rosas brancas'],
    invocation: 'Miguel! Archangel of protection! surround me with your light!',
    blessing: 'Que Miguel escudo your aurora field and bring victory in all battles.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['archangel'],
  },
  {
    id: 'archangel-gabriel',
    name: 'Arcanjo Gabriel',
    nameEn: 'Archangel Gabriel',
    type: 'archangel',
    description: 'Arcanjo mensageiro, announciador divino. Governa comunicação, sonhos e revelações.',
    archangel: 'Gabriel',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 'Ajna (6º)',
    day: 'segunda-feira',
    colors: ['branco', 'lilás'],
    offerings: ['incenso de lavanda', 'vela branca', 'flor de jasmin'],
    invocation: 'Gabriel! Messenger of God! open my channel to the divine!',
    blessing: 'Que Gabriel abra seus canais de comunicação celestial e traga wisdom.',
    spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS['archangel'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = DivineConnectionQuerySchema.safeParse({
      type: searchParams.get('type'),
      orixa: searchParams.get('orixa'),
      depth: searchParams.get('depth'),
      limit: searchParams.get('limit'),
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

    const { type, orixa, depth, limit, sefirot, chakra, element } = parseResult.data;
    let connections = [...DIVINE_CONNECTIONS];

    if (type) {
      connections = connections.filter(c => c.type === type);
    }

    if (orixa) {
      connections = connections.filter(c => c.orixa === orixa);
    }

    if (limit) {
      connections = connections.slice(0, limit);
    }

    if (sefirot) {
      connections = connections.filter(c => c.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      connections = connections.filter(c => {
        const cNum = c.spiritualCorrelations?.chakra;
        return cNum === chakra || c.chakra === 'todos';
      });
    }

    if (element) {
      connections = connections.filter(c => c.spiritualCorrelations?.element === element);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: connections.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
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
      total: DIVINE_CONNECTIONS.length,
      spiritualCorrelations: DIVINE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, orixa, depth, limit, sefirot, chakra, element },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}