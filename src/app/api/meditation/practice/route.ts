import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MeditationTypeSchema = z.enum(['breath', 'visualization', 'mantra', 'body-scan', 'loving-kindness', 'transcendental', 'dynamic', 'osho']);
const TraditionSchema = z.enum(['yoga', 'vipassana', 'zen', 'kundalini', 'taoist', 'mystic']);
const MeditationQuerySchema = z.object({
  type: MeditationTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
  includeMantras: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Meditation Types ──────────────────────────────────────────
const MEDITATION_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  breath: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A respiração conecta-me à fonte da vida',
    frequency: '396 Hz',
  },
  visualization: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Visualizo minha verdade com clareza',
    frequency: '528 Hz',
  },
  mantra: {
    sefirot: ['Kether', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O mantra purifica minha mente e eleva minha consciência',
    frequency: '963 Hz',
  },
  'body-scan': {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Cada célula do meu corpo é sagrada',
    frequency: '396 Hz',
  },
  'loving-kindness': {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão emanam de mim para todos os seres',
    frequency: '528 Hz',
  },
  transcendental: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Transcendo os limites do ego e toco o infinito',
    frequency: '963 Hz',
  },
  dynamic: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O movimento sagrado flui através de mim',
    frequency: '528 Hz',
  },
  osho: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'Na dança eu encontro minha essência livre',
    frequency: '741 Hz',
  },
};

// ─── Practice Data ─────────────────────────────────────────────────────────
interface MeditationPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  tradition: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  mantras?: string[];
  breathPattern?: string;
  sefirot: string[];
  chakra: string;
  solfeggio?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const MEDITATION_PRACTICES: MeditationPractice[] = [
  {
    id: 'breath-awareness',
    type: 'breath',
    name: 'Sati — Consciência da Respiração',
    nameEn: 'Breath Awareness',
    description: 'Prática fundamental de atenção plena na respiração, base do洞察.',
    tradition: 'vipassana',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Sente-se em posição confortável com coluna ereta',
      'Feche os olhos e relaxe o corpo',
      'Observe a respiração natural sem controlar',
      'Perceba a sensação do ar entrando e saindo',
      'Quando a mente divagar, gentilmente retorne ao foco',
      'Continue observando por todo o período',
      'Termine gradualmente, abrindo os olhos lentamente',
    ],
    mantras: ['So Hum', 'Sati'],
    breathPattern: 'Natural观察',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Ajna (6º)',
    solfeggio: '396Hz (Libertação do medo)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['breath'],
  },
  {
    id: 'nadi-shodhana',
    type: 'breath',
    name: 'Nadi Shodhana — Respiração Alternada',
    nameEn: 'Alternate Nostril Breathing',
    description: 'Harmonização dos canais energéticos (nadis) através da respiração alternada.',
    tradition: 'yoga',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      'Sente-se confortavelmente',
      'Faça Namaste com as mãos',
      'Feche a narina direita com o polegar',
      'Inspire pela narina esquerda',
      'Feche a narina esquerda com o anelar',
      'Expire pela narina direita',
      'Inspire pela narina direita',
      'Feche a narina direita',
      'Expire pela narina esquerda',
      'Repita por 5-10 ciclos',
    ],
    mantras: ['Om', 'So Hum'],
    breathPattern: '4-4-4-0',
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 'Anahata (4º)',
    solfeggio: '528Hz (Harmonização)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['breath'],
  },
  {
    id: 'kundalini-awakening',
    type: 'mantra',
    name: 'Kundalini — Despertar da Serpente',
    nameEn: 'Kundalini Awakening',
    description: 'Despertar da energia kundalini através de mantras e respiração.',
    tradition: 'kundalini',
    duration: 30,
    difficulty: 'advanced',
    steps: [
      'Sente-se em posição de fácil respiração',
      'Faça o pump (bombeamento do umbigo) por 1 minuto',
      'Pratique kapalabhati (respiração de fogo) por 2 minutos',
      'Recite o mantra "Sat Nam" repetidamente',
      'Visualize a energia subindo pela coluna',
      'Permaneça em silêncio observando',
      'Gradualmente retorne à consciência normal',
    ],
    mantras: ['Sat Nam', 'Wahe Guru', 'Om'],
    breathPattern: 'Fogo (Kapalabhati)',
    sefirot: ['Kether', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    solfeggio: '396Hz (Libertação)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['mantra'],
  },
  {
    id: 'loving-kindness',
    type: 'loving-kindness',
    name: 'Metta Bhavana — Cultivo do Amor',
    nameEn: 'Loving Kindness',
    description: 'Meditação budista para desenvolver amor bondoso (metta).',
    tradition: 'vipassana',
    duration: 25,
    difficulty: 'intermediate',
    steps: [
      'Sente-se em meditação tranquila',
      'Cultive amor por você mesmo: "Que eu seja feliz"',
      'Amplie para uma pessoa amada',
      'Estenda para um conhecido neutro',
      'Inclua alguém difícil ou desafiador',
      'Abra para todos os seres',
      'Permaneça no sentimento de amor universal',
    ],
    mantras: ['Metta', 'Sabbe satta'],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    solfeggio: '528Hz (Amor)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['loving-kindness'],
  },
  {
    id: 'zen-zazen',
    type: 'transcendental',
    name: 'Zazen — Meditação Zen',
    nameEn: 'Zen Zazen',
    description: 'Prática de meditação silenciosa da tradição Zen.',
    tradition: 'zen',
    duration: 30,
    difficulty: 'intermediate',
    steps: [
      'Sente-se em posição de lótus ou meio-lótus',
      'Mantenha a coluna ereta',
      'Cruze as mãos no colo (cosmicamente: mão direita sobre esquerda)',
      'Feche os olhos e olhe para baixo em ângulo de 45 graus',
      'Respire pelo nariz naturalmente',
      'Conte as respirações de 1 a 10, reiniciando',
      'Quando perder a contagem, retorne a 1',
 ],
    mantras: ['Mu'],
    breathPattern: 'Natural',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 'Sahasrara (7º)',
    solfeggio: '963Hz (Iluminação)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['transcendental'],
  },
  {
    id: 'osho-active',
    type: 'osho',
    name: 'Meditação Osho Ativa',
    nameEn: 'Osho Active Meditation',
    description: 'Combinação de movimento e silêncio da tradição Osho.',
    tradition: 'mystic',
    duration: 60,
    difficulty: 'intermediate',
    steps: [
      'Fase 1: Solte o corpo com música alta (15 minutos)',
      'Fase 2: Pule com braços levantados (15 minutos)',
      'Fase 3: Permaneça em silêncio absoluto (15 minutos)',
      'Fase 4: Dança livre e gratitude (15 minutos)',
      'Observe as sensações após a prática',
    ],
    mantras: ['Osho'],
    breathPattern: 'Variado',
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 'Ajna (6º)',
    solfeggio: '741Hz (Comunicação)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['osho'],
  },
  {
    id: 'body-scan-grounding',
    type: 'body-scan',
    name: 'Escaneamento Corporal',
    nameEn: 'Body Scan',
    description: 'Meditação de atenção plena às sensações do corpo.',
    tradition: 'vipassana',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Deite-se confortavelmente',
      'Feche os olhos e respire profundamente',
      'Observe a sensação nos pés',
      'Mova a atenção lentamente para cima',
      'Pare em cada área do corpo',
      'Observe sensações sem julgamento',
      'Termine com gratidão pelo corpo',
    ],
    mantras: ['So Hum'],
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    solfeggio: '396Hz (Aterramento)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['body-scan'],
  },
 {
    id: 'visualization-tree',
    type: 'visualization',
    name: 'Visualização da Árvore da Vida',
    nameEn: 'Tree of Life Visualization',
    description: 'Visualização da Árvore Cabalística para conexão espiritual.',
    tradition: 'mystic',
    duration: 30,
    difficulty: 'advanced',
    steps: [
      'Feche os olhos e respire profundamente',
      'Visualize o ponto de luz infinita (Kether)',
      'A luz desce formando as Sephirot',
      'Observe as10 Sephirot iluminando',
      'Sinta a energia fluindo entre elas',
      'Permaneça conectado com a árvore',
      'Retorne gradualmente mantendo a consciência',
    ],
    mantras: ['Ein Sof'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
    solfeggio: '963Hz (Conexão divina)',
    spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS['visualization'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = MeditationQuerySchema.safeParse({
      type: searchParams.get('type'),
      tradition: searchParams.get('tradition'),
      duration: searchParams.get('duration'),
      includeMantras: searchParams.get('includeMantras'),
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

    const { type, tradition, duration, includeMantras, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...MEDITATION_PRACTICES];

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
      spiritualCorrelations: MEDITATION_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, tradition, duration, includeMantras, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}