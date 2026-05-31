import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const VisualizationTypeSchema = z.enum(['manifestation', 'healing', 'protection', 'ascension', 'love', 'abundance', 'clarity', 'ancestral']);
const TraditionSchema = z.enum(['cabala', 'yoga', 'shamanic', 'taoist', 'mystic']);
const VisualizationQuerySchema = z.object({
  type: VisualizationTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Visualization Types ──────────────────────────────────────────
const VISUALIZATION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  manifestation: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Visualizo e manifesto minha realidade desejada',
    frequency: '528 Hz',
  },
  healing: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A luz divina cura cada célula do meu ser',
    frequency: '528 Hz',
  },
  protection: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Uma barreira de luz divina me protege',
    frequency: '396 Hz',
  },
  ascension: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Elevo-me para atingir a luz divina',
    frequency: '963 Hz',
  },
  love: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O amor flui através de mim para todos os seres',
    frequency: '528 Hz',
  },
  abundance: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A abundância é minha natureza divina',
    frequency: '528 Hz',
  },
  clarity: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'A clareza me guia através das sombras',
    frequency: '741 Hz',
  },
  ancestral: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Os ancestrais me guiam e protegem',
    frequency: '417 Hz',
  },
};

// ─── Practice Data ─────────────────────────────────────────────────────────
interface VisualizationPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  tradition: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps?: string[];
  affirmations?: string[];
  colors: string[];
  sefirot: string[];
  chakra: string;
  orixa?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const VISUALIZATION_PRACTICES: VisualizationPractice[] = [
  {
    id: 'tree-of-life',
    type: 'ascension',
    name: 'Visualização da Árvore da Vida',
    nameEn: 'Tree of Life Visualization',
    description: 'Conexão com as Dez Sephirot através da visualização da Árvore Cabalística.',
    tradition: 'cabala',
    duration: 30,
    difficulty: 'intermediate',
    steps: [
      'Feche os olhos e respire profundamente',
      'Visualize o ponto de luz infinita (Kether) acima de você',
      'A luz desce formando três colunas: esquerda (misericórdia), centro (equilíbrio), direita (severidade)',
      'Observe as Sephirot iluminando uma a uma: Kether, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkuth',
      'Permita que a energia flua pelos caminhos entre as Sephirot',
      'Sinta-se conectado com toda a árvore',
      'Retorne gradualmente, mantendo a consciência da árvore dentro de você',
    ],
    affirmations: [
      'Eu sou parte da árvore divina',
      'A sabedoria flui através de mim',
      'Sou canal para a energia das Sephirot',
    ],
    colors: ['Branco', 'Azul', 'Vermelho', 'Amarelo', 'Verde'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['ascension'],
  },
  {
    id: 'manifestation-abundance',
    type: 'manifestation',
    name: 'Visualização da Abundância',
    nameEn: 'Abundance Manifestation',
    description: 'Técnica de visualização criativa para manifestar prosperidade e abundância.',
    tradition: 'mystic',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Sente-se relaxado com os olhos fechados',
      'Visualize uma bola de luz dourada no centro do seu peito (área do coração)',
      'A luz cresce e se expande, preenchendo todo o seu corpo',
      'Imagine-se no futuro desejado: moradia, trabalho, experiências',
      'Sinta as emoções como se já estivesse vivendo essa realidade',
      'Visualize detalhes: cores, sons, sensações táteis',
      'Permita que o sentimento de gratidão acompanhe a visualização',
      'Agradeça como se já tivesse recebido',
    ],
    affirmations: [
      'Eu mereço abundância infinita',
      'A prosperidade flui em minha vida',
      'Sou um imã para a abundância',
    ],
    colors: ['Dourado', 'Verde', 'Rosa'],
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 'Ajna (6º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['manifestation'],
  },
  {
    id: 'healing-light',
    type: 'healing',
    name: 'Visualização de Cura',
    nameEn: 'Healing Light Visualization',
    description: 'Envio de luz curativa para o corpo e para outros.',
    tradition: 'yoga',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      'Sente-se ou deite-se confortavelmente',
      'Feche os olhos e respire profundamente',
      'Visualize uma luz verde esmeralda envolvendo seu corpo',
      'A luz penetra cada célula, tecido e órgão',
      'Sinta a luz curando qualquer desconforto',
      'Se estiver curando outro, visualize a luz indo até essa pessoa',
      'Permaneça na luz por alguns minutos',
      'Agradeça pelo poder de cura',
    ],
    affirmations: [
      'Meu corpo é sagrado e saudável',
      'A luz divina me cura completamente',
      'Cada célula irradia saúde',
    ],
    colors: ['Verde esmeralda', 'Branco', 'Rosa'],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 'Anahata (4º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['healing'],
  },
  {
    id: 'protection-shield',
    type: 'protection',
    name: 'Visualização do Escudo de Proteção',
    nameEn: 'Protection Shield Visualization',
    description: 'Criação de uma barreira protetora de luz ao redor do corpo.',
    tradition: 'shamanic',
    duration: 10,
    difficulty: 'beginner',
    steps: [
      'Feche os olhos e tome3 respirações profundas',
      'Visualize uma luz dourada acima da sua cabeça',
      'A luz desce e envolve todo o seu corpo',
      'Forma um escudo de luz ao seu redor',
      'Sinta a proteção e a segurança',
      'Permaneça dentro do escudo por alguns minutos',
      'Agradeça pela proteção divina',
 ],
    affirmations: [
      'Sou protegido pela luz divina',
      'Nenhuma energia negativa pode me atingir',
      'A proteção dos guias me acompanha',
    ],
    colors: ['Dourado', 'Azul', 'Branco'],
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['protection'],
  },
  {
    id: 'love-compassion',
    type: 'love',
    name: 'Visualização do Amor Incondicional',
    nameEn: 'Unconditional Love Visualization',
    description: 'Cultivo do amor incondicional por si mesmo e pelos outros.',
    tradition: 'yoga',
    duration: 20,
    difficulty: 'intermediate',
    steps: [
      'Sente-se em meditação tranquila',
      'Visualize uma luz rosa no centro do coração',
      'O amor expande-se do coração para todo o corpo',
      'Amor por você mesmo: "Eu me amo e me aceito"',
      'Amor por pessoas queridas',
      'Amor por conhecidos e estranhos',
      'Amor por aqueles que lhe machucaram',
      'Permaneça em um estado de amor universal',
    ],
    affirmations: [
      'Eu sou amor',
      'O amor é minha natureza verdadeira',
      'O amor flui através de mim sem limites',
    ],
    colors: ['Rosa', 'Vermelho', 'Branco'],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['love'],
  },
  {
    id: 'clarity-mind',
    type: 'clarity',
    name: 'Visualização da Clareza Mental',
    nameEn: 'Mental Clarity Visualization',
    description: 'Limpeza da mente para obter clareza e foco.',
    tradition: 'taoist',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      'Sente-se em silêncio com os olhos fechados',
      'Visualize sua mente como um lago cristalino',
      'A água está parada, refletindo claramente',
      'Observe seus pensamentos como nuvens passando',
      'Permita que as nuvens se dissolvam',
      'Sinta a clareza e a paz da mente quieta',
      'Mantenha essa clareza por alguns minutos',
    ],
    affirmations: [
      'Minha mente é clara e focada',
      'A sabedoria flui através de mim',
      'Tenho clareza sobre meu caminho',
    ],
    colors: ['Azul', 'Branco', 'Cristal'],
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 'Ajna (6º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['clarity'],
  },
  {
    id: 'ancestral-connection',
    type: 'ancestral',
    name: 'Conexão com os Ancestrais',
    nameEn: 'Ancestral Connection',
    description: 'Visualização para conectar com a linhagem ancestral.',
    tradition: 'shamanic',
    duration: 25,
    difficulty: 'advanced',
    steps: [
      'Sente-se em um lugar tranquilo',
      'Feche os olhos e respire profundamente',
      'Visualize uma raiz saindo da base da coluna',
      'A raiz desce até o chão e se conecta com a terra',
      'Sinta a conexão com seus ancestrais',
      'Observe sua linhagem: avós, bisavós, gerações anteriores',
      'Receba suas bênçãos e sabedoria',
      'Agradeça e lentamente retorne',
    ],
    affirmations: [
      'Sou parte de uma linhagem sagrada',
      'Os ancestrais me guiam e protegem',
      'Recebo a sabedoria das gerações',
    ],
    colors: ['Marrom', 'Dourado', 'Verde'],
    sefirot: ['Yesod', 'Binah'],
    chakra: 'Svadhisthana (2º)',
    spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS['ancestral'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = VisualizationQuerySchema.safeParse({
      type: searchParams.get('type'),
      tradition: searchParams.get('tradition'),
      duration: searchParams.get('duration'),
      includeSteps: searchParams.get('includeSteps'),
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

    const { type, tradition, duration, includeSteps, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...VISUALIZATION_PRACTICES];

    if (type) {
      practices = practices.filter(p => p.type === type);
    }

    if (tradition) {
      practices = practices.filter(p => p.tradition === tradition);
    }

    if (duration) {
      practices = practices.filter(p => p.duration >= duration);
    }

    if (limit) {
      practices = practices.slice(0, limit);
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

    // Calculate spiritual stats
    const spiritualStats = {
      byType: practices.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTradition: practices.reduce((acc, p) => {
        acc[p.tradition] = (acc[p.tradition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: practices.reduce((acc, p) => {
        acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
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
      spiritualCorrelations: VISUALIZATION_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, tradition, duration, includeSteps, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}