import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const PracticeTypeSchema = z.enum(['mantra', 'breathwork', 'visualization', 'gratitude', 'forgiveness', 'loving-kindness']);
const PracticeQuerySchema = z.object({
  type: PracticeTypeSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Practice Types ──────────────────────────────────────────
const PRACTICE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  mantra: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O mantra purifica minha mente e eleva minha consciência',
    frequency: '963 Hz',
  },
  breathwork: {
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'A respiração é a ponte entre corpo e espírito',
    frequency: '528 Hz',
  },
  visualization: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Visualizo minha realidade com clareza e propósito',
    frequency: '528 Hz',
  },
  gratitude: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Gratidão abre as portas da abundância',
    frequency: '528 Hz',
  },
  forgiveness: {
    sefirot: ['Tipheret', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Perdoo para ser livre',
    frequency: '639 Hz',
  },
  'loving-kindness': {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão emanam de mim',
    frequency: '528 Hz',
  },
};

// ─── Practice Data ─────────────────────────────────────────────────────────
interface AffirmationPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  duration: number;
  steps: string[];
  affirmations: string[];
  sefirot: string[];
  chakra: string;
  tradition: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const PRACTICES: AffirmationPractice[] = [
  {
    id: 'mantra-sacred',
    type: 'mantra',
    name: 'Mantra Sagrado',
    nameEn: 'Sacred Mantra',
    description: 'Repetição de mantras sagrados para purificar a mente e elevar a consciência.',
    duration: 15,
    steps: [
      'Escolha um mantra sagrado (Om, So Hum, Ram, etc.)',
      'Sente-se em posição de meditação confortável',
      'Feche os olhos e respire profundamente',
      'Repita o mantra silenciosamente, acompanhando a respiração',
      'Permita que o som do mantra ressoa internamente',
      'Mantenha o foco no som e na sensação de paz',
      'Gradualmente reduza a intensidade e permaneça em silêncio',
    ],
    affirmations: [
      'Eu sou parte da energia universal',
      'O som do mantra purifica minha mente',
      'Minha consciência se expande a cada respiração',
    ],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    tradition: 'Hindu/Yoga',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['mantra'],
  },
  {
    id: 'breathwork-purification',
    type: 'breathwork',
    name: 'Respirações Purificadoras',
    nameEn: 'Purifying Breathwork',
    description: 'Técnicas de respiração consciente para limpar canais energéticos e aumentar prana.',
    duration: 10,
    steps: [
      'Posicione-se sentado ou em pé com coluna ereta',
      'Inspire profundamente pelo nariz (4 segundos)',
      'Segure o ar (4 segundos)',
      'Expire completamente pela boca com som (6 segundos)',
      'Repita por 5-10 ciclos',
      'Observe as sensações no corpo',
      'Permaneça em respiração natural por alguns minutos',
    ],
    affirmations: [
      'Eu respiro a energia da vida',
      'Cada respiração traz renovação',
      'Meu corpo está cheio de prana vital',
    ],
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 'Anahata (4º)',
    tradition: 'Tântrico',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['breathwork'],
  },
  {
    id: 'visualization-light',
    type: 'visualization',
    name: 'Visualização da Luz',
    nameEn: 'Light Visualization',
    description: 'Visualização guiada para inundar o corpo com luz espiritual.',
    duration: 15,
    steps: [
      'Sente-se ou deite-se em posição confortável',
      'Feche os olhos e relaxe todo o corpo',
      'Visualize uma luz dourada acima da cabeça',
      'Permita que a luz entre pelo topo da cabeça',
      'Sinta a luz preenchendo cada célula do corpo',
      'Visualize a luz purificando e curando',
      'Permaneça na luz por alguns minutos',
    ],
    affirmations: [
      'Eu sou luz',
      'A luz me preenche e me cura',
      'Sou um ser de luz radiante',
    ],
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 'Ajna (6º)',
    tradition: 'Sufi/Cristã',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['visualization'],
  },
  {
    id: 'gratitude-heart',
    type: 'gratitude',
    name: 'Gratidão do Coração',
    nameEn: 'Heart Gratitude',
    description: 'Prática de gratidão para cultivar abundância e bem-estar.',
    duration: 5,
    steps: [
      'Coloque a mão sobre o coração',
      'Respire profundamente 3 vezes',
      'Pense em 3 coisas pelas quais é grato',
      'Sinta a gratidão emanar do coração',
      'Agradeça pela vida e pelas lições',
      'Permaneça nesse estado de gratidão',
    ],
    affirmations: [
      'Sou grato por tudo em minha vida',
      'A gratidão atrai mais abundância',
      'Cada dia é uma bênção',
    ],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    tradition: 'Universal',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['gratitude'],
  },
  {
    id: 'forgiveness-release',
    type: 'forgiveness',
    name: 'Perdão e Libertação',
    nameEn: 'Forgiveness Release',
    description: 'Prática de perdão para libertar ressentimentos e mágoas.',
    duration: 20,
    steps: [
      'Identifique uma pessoa ou situação que guarda mágoa',
      'Reconeça o impacto que isso tem em você',
      'Visualize a pessoa ou situação em paz',
      'Diga mentalmente: "Eu perdoo você (e a mim mesmo)"',
      'Sinta o peso sendo libertado',
      'Permaneça no espaço de liberdade',
    ],
    affirmations: [
      'Eu perdoo para ser livre',
      'Libertar é um ato de amor próprio',
      'O perdão traz paz',
    ],
    sefirot: ['Tipheret', 'Binah'],
    chakra: 'Anahata (4º)',
    tradition: 'Cristã/TER',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['forgiveness'],
  },
  {
    id: 'loving-kindness-all',
    type: 'loving-kindness',
    name: 'Amor Incondicional',
    nameEn: 'Loving Kindness (Metta)',
    description: 'Cultivo de amor bondoso para todos os seres.',
    duration: 20,
    steps: [
      'Sente-se em meditação tranquila',
      'Cultive amor por você mesmo: "Que eu seja feliz"',
      'Amplie para uma pessoa amada: "Que [nome] seja feliz"',
      'Estenda para um conhecido neutro',
      'Inclua alguém difícil ou desafiador',
      'Abra para todos os seres: "Que todos os seres sejam felizes"',
    ],
    affirmations: [
      'Que eu seja feliz e em paz',
      'Que todos os seres sejam felizes',
      'O amor incondicional é minha natureza',
    ],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    tradition: 'Budista (Metta)',
    spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS['loving-kindness'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = PracticeQuerySchema.safeParse({
      type: searchParams.get('type'),
      duration: searchParams.get('duration'),
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

    const { type, duration, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...PRACTICES];

    if (type) {
      practices = practices.filter(p => p.type === type);
    }

    if (duration) {
      practices = practices.filter(p => p.duration >= duration);
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
      spiritualCorrelations: PRACTICE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, duration, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}