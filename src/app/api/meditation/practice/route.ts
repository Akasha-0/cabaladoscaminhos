import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const MeditationTypeSchema = z.enum(['breath', 'visualization', 'mantra', 'body-scan', 'loving-kindness', 'transcendental', 'dynamic', 'osho']);
const TraditionSchema = z.enum(['yoga', 'vipassana', 'zen', 'kundalini', 'taoist', 'mystic']);
const MeditationQuerySchema = z.object({
  type: MeditationTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
  includeMantras: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = 'force-dynamic';

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
    chakra: 'Vishuddha (5º)',
    solfeggio: '417Hz (Facilitação de mudança)',
  },
  {
    id: 'loving-kindness',
    type: 'loving-kindness',
    name: 'Metta Bhavana — Cultivo do Amor Bondoso',
    nameEn: 'Loving Kindness Meditation',
    description: 'Desenvolvimento de compaixão e amor incondicional por todos os seres.',
    tradition: 'vipassana',
    duration: 25,
    difficulty: 'intermediate',
    steps: [
      'Sente-se em meditação',
      'Cultive amor por si mesmo: "Que eu seja feliz"',
      'Expanda para um benefactor: "Que [nome] seja feliz"',
      'Inclua um amigo próximo',
      'Adicione alguém neutro',
      'Estenda para alguém difícil ou inimigo',
      'Abra para todos os seres: "Que todos os seres sejam felizes"',
      'Permaneça no amor infinito por alguns minutos',
    ],
    mantras: ['Metta', 'Loka Samasta Sukhino Bhavantu'],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 'Anahata (4º)',
    solfeggio: '528Hz (Amor e harmonics)',
  },
  {
    id: 'body-scan-vipassana',
    type: 'body-scan',
    name: 'Scanning Corpóreo — Body Scan',
    nameEn: 'Body Scan Meditation',
    description: 'Varredura sistemática do corpo para desenvolver consciência e soltar tensões.',
    tradition: 'vipassana',
    duration: 30,
    difficulty: 'beginner',
    steps: [
      'Deite-se ou sente-se confortavelmente',
      'Feche os olhos e respire profundamente',
      'Comece pelos pés, perceba sensações',
      'Mova gradualmente para as pernas',
      'Continue pelo abdômen e peito',
      'Suba pelos braços até as mãos',
      'Vá para ombros, pescoço e rosto',
      'Explore o topo da cabeça',
      'Permaneça consciente de todo o corpo',
      'Retorne ao corpo como um todo',
    ],
    mantras: ['Anicca', 'Sabbasan passati'],
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 'Muladhara (1º)',
    solfeggio: '174Hz (Alívio de dor)',
  },
  {
    id: 'zen-zazen',
    type: 'transcendental',
    name: 'Zazen — Meditação Zen',
    nameEn: 'Zen Sitting Meditation',
    description: 'Prática de sentar em silêncio do Zen Budismo, focar na postura e respiração.',
    tradition: 'zen',
    duration: 40,
    difficulty: 'intermediate',
    steps: [
      'Escolha um tempo e lugar tranquilo',
      'Sente-se no chão ou em uma almofada (zafu)',
      'Adote a postura "pose do diamante"',
      'Cruze as mãos no colo, polegares tocando',
      'Mantenha as costas retas',
      'Relaxe os ombros e queda o queixo',
      'Feche os olhos 70%',
      'Breathe naturalmente, counting breaths 1-10',
      'When thoughts arise, acknowledge and return to counting',
      'Continue por todo o período',
    ],
    mantras: ['Mumonkan', 'Mu'],
    breathPattern: 'Contagem 1-10',
    sefirot: ['Kether', 'Binah'],
    chakra: 'Sahasrara (7º)',
    solfeggio: '432Hz (Harmonização universal)',
  },
  {
    id: 'kundalini-breath',
    type: 'dynamic',
    name: 'Kundalini Breath — Energia Serpentina',
    nameEn: 'Kundalini Breathwork',
    description: 'Respirações vigorosas para despertar a energia Kundalini na base da coluna.',
    tradition: 'kundalini',
    duration: 20,
    difficulty: 'advanced',
    steps: [
      'Sente-se em postura de meditação',
      'Coloque as mãos emmudra de energia (cotovelos para fora)',
      'Inicie Kapalabhati: respirações curtas e vigorosas pelo nariz',
      'Continue por 30-50 vezes',
      'Faça uma pausa, inspire profundamente',
      'Segure (bandha) por 10-15 segundos',
      'Expire completamente',
      'Repita 3 rodadas',
      'Permaneça em silêncio, observando sensações',
    ],
    mantras: ['Sat Nam', 'Wahe Guru'],
    breathPattern: 'Kapalabhati 30-50 + Kumbhaka 15s',
    sefirot: ['Kether', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    solfeggio: '639Hz (Harmonização de relacionamentos)',
  },
  {
    id: 'osho-active',
    type: 'osho',
    name: 'Meditação Osho — Ativa',
    nameEn: 'Osho Active Meditation',
    description: 'Combinação de movimento, som e silêncio para romper padrões mentais.',
    tradition: 'mystic',
    duration: 60,
    difficulty: 'advanced',
    steps: [
      'Primeira fase (15 min): Pulo livre com olhos fechados',
      'Segunda fase (15 min): Observação sem julgamento',
      'Terceira fase (15 min): Congele completamente',
      'Quarta fase (15 min): Dança ou movimento livre',
      'Sente em silêncio, deixe a energia assentar',
      'Abracinho a si mesmo pelo trabalho',
    ],
    mantras: ['Osho', 'Witness'],
    breathPattern: 'Irregular, intuitivo',
    sefirot: ['Chokhmah', 'Tipheret'],
    chakra: 'Ajna (6º)',
    solfeggio: '741Hz (Despertar da intuição)',
  },
  {
    id: 'taoist-breath',
    type: 'breath',
    name: 'Respiração Taoísta —Microcosmic Orbit',
    nameEn: 'Taoist Breathwork',
    description: 'Circulação de energia pelo corpo seguindo o fluxo doChi através dos meridianos.',
    tradition: 'taoist',
    duration: 25,
    difficulty: 'intermediate',
    steps: [
      'Sente-se ou deite-se relaxadamente',
      'Visualize energia reunida no dantian (abaixo do umbigo)',
      'Inspire, levando energia para o cóccix',
      'Expire, subindo pela coluna até o topo da cabeça',
      'Inhale, descendo pela frente do corpo',
      'Expire, retornando ao dantian',
      'Continue em orbita suave por 15-20 minutos',
      'Conclua recolhendo energia no dantian',
    ],
    mantras: ['Tao', 'Chi'],
    breathPattern: '4-4-4-4 (Lento e profundo)',
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 'Svadhisthana (2º)',
    solfeggio: '963Hz (Conexão com o divino)',
  },
  {
    id: 'visualization-light',
    type: 'visualization',
    name: 'Visualização da Luz — Trataka Interior',
    nameEn: 'Light Visualization',
    description: 'Conexão com a luz divina através de visualização criativa e focus interno.',
    tradition: 'mystic',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Feche os olhos e relaxe',
      'Visualize uma esfera de luz dourada acima da cabeça',
      'Permita que a luz desça suavemente',
      'Observe a luz preenchendo sua aura',
      'Sinta a luz atravessando cada célula',
      'Visualize-a se expandindo em todas as direções',
      'Imagine-se envolvido em uma esfera de luz protetora',
      'Permaneça nesse estado luminoso',
      'Agradeça pela energia recebida',
    ],
    mantras: ['Om', 'Light'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 'Manipura (3º)',
    solfeggio: '528Hz (Milagre)',
  },
  {
    id: 'vipassana-insight',
    type: 'transcendental',
    name: 'Vipassana — Insight Meditation',
    nameEn: 'Vipassana Insight',
    description: 'Desenvolvimento de visão clara da natureza da realidade através da observação sistemática.',
    tradition: 'vipassana',
    duration: 45,
    difficulty: 'advanced',
    steps: [
      'Sente-se com postura firme',
      'Observe sensações no corpo',
      'Note impermanência de todas as sensações',
      'Permaneça como testemunha',
      'Observe pensamentos sem se identificar',
      'Explore a natureza da mente',
      'Reconheça a ilusão do ego',
      'Retorne ao corpo e sensações',
      'Integre a visão alcançada',
    ],
    mantras: ['Vipassana', 'Santippekkha'],
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    solfeggio: '417Hz (Mudança facilitadora)',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MeditationQuerySchema.safeParse({
    type: searchParams.get('type'),
    tradition: searchParams.get('tradition'),
    duration: searchParams.get('duration'),
    includeMantras: searchParams.get('includeMantras'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, tradition, duration, includeMantras, limit } = parseResult.data;
  let practices = [...MEDITATION_PRACTICES];

  if (type) {
    practices = practices.filter(p => p.type === type);
  }

  if (tradition) {
    practices = practices.filter(p => p.tradition === tradition);
  }

  if (duration) {
    practices = practices.filter(p => p.duration <= duration);
  }

  if (limit) {
    practices = practices.slice(0, limit);
  }

  // Filter out mantras if not requested
  const response = practices.map(p => {
    if (!includeMantras) {
      const { mantras, ...rest } = p;
      return rest;
    }
    return p;
  });

  return NextResponse.json({
    success: true,
    practices: response,
    count: response.length,
    total: MEDITATION_PRACTICES.length,
    traditions: {
      vipassana: MEDITATION_PRACTICES.filter(p => p.tradition === 'vipassana').length,
      yoga: MEDITATION_PRACTICES.filter(p => p.tradition === 'yoga').length,
      zen: MEDITATION_PRACTICES.filter(p => p.tradition === 'zen').length,
      kundalini: MEDITATION_PRACTICES.filter(p => p.tradition === 'kundalini').length,
      taoist: MEDITATION_PRACTICES.filter(p => p.tradition === 'taoist').length,
      mystic: MEDITATION_PRACTICES.filter(p => p.tradition === 'mystic').length,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const bodySchema = z.object({
      practiceId: z.string().optional(),
      type: MeditationTypeSchema.optional(),
      notes: z.string().optional(),
      duration: z.number().int().positive().optional(),
    });

    const parseResult = bodySchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Log practice (in real implementation would save to database)
    const practice = parseResult.data;
    
    return NextResponse.json({
      success: true,
      practice: {
        id: crypto.randomUUID(),
        ...practice,
        timestamp: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar prática de meditação',
    }, { status: 500 });
  }
}