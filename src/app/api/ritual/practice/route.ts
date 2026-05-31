import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const RitualTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'seasonal', 'crisis', 'celebration']);
const TraditionSchema = z.enum(['candomble', 'umbanda', 'cabala', 'yoruba', 'taoist', 'sufi', 'shamanic']);
const RitualQuerySchema = z.object({
  type: RitualTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  day: z.string().optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Ritual Types ──────────────────────────────────────────
const RITUAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  daily: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O ritual diário fortalece minha conexão divina',
    frequency: '963 Hz',
  },
  weekly: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O ritmo semanal me alinha com a energia do universo',
    frequency: '528 Hz',
  },
  monthly: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O ciclo mensal purifica minha essência',
    frequency: '417 Hz',
  },
  seasonal: {
    sefirot: ['Chokhmah', 'Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'As estações do ano refletem minha transformação',
    frequency: '528 Hz',
  },
  crisis: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Na crise, encontro força e proteção',
    frequency: '396 Hz',
  },
  celebration: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A celebração honra a vida e o divino',
    frequency: '528 Hz',
  },
};

// ─── Practice Data ─────────────────────────────────────────────────────────
interface RitualPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  tradition: string;
  duration: string;
  frequency: string;
  steps?: string[];
  materials?: string[];
  sefirot: string[];
  orixa?: string;
  chakra: string;
  time: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const RITUAL_PRACTICES: RitualPractice[] = [
  {
    id: 'dawn-light',
    type: 'daily',
    name: 'Ritual do Amanhecer — Saudar o Sol',
    nameEn: 'Dawn Ritual',
    description: 'Prática matinal para saudar a luz do dia e estabelecer intenções sagradas.',
    tradition: 'cabala',
    duration: '20-30 minutos',
    frequency: 'Diário ao amanhecer',
    steps: [
      'Acorde e vá para local com luz natural',
      'Face o leste (direção do sol nascente)',
      'Feche os olhos e tome 3 respirações profundas',
      'Visualize o sol nascendo em seu coração',
      'Recite: "A luz de Kether ilumina meu caminho"',
      'Agradeça por mais um dia de vida',
      'Defina uma intenção para o dia',
      'Abracinho de Oxalá (3 minutos)',
    ],
    materials: ['Vela branca', 'Água', 'Incienso opcional'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    time: 'Amanhecer',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['daily'],
  },
  {
    id: 'oxum-daily',
    type: 'daily',
    name: 'Ritual Diário de Oxum',
    nameEn: 'Daily Oxum Ritual',
    description: 'Oração matinal à Oxum para prosperidade e amor.',
    tradition: 'candomble',
    duration: '15 minutos',
    frequency: 'Diário',
    steps: [
      'Acenda vela dourada ou rosa',
      'Coloque água doce em copo transparente',
      'Adicione flores amarelas ou rosas',
      'Pingue mel na água',
      'Recite: "Oxum, mãe das águas, abençoe meu dia"',
      'Agradeça pela proteção e amor',
      'Pida prosperidade e saúde',
      'Beba a água abençoada (opcional)',
    ],
    materials: ['Vela dourada/rosa', 'Água doce', 'Flores amarelas', 'Mel'],
    sefirot: ['Chesed', 'Hod'],
    orixa: 'Oxum',
    chakra: 'Svadhisthana (2º)',
    time: 'Manhã',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['daily'],
  },
  {
    id: 'weekly-oxala',
    type: 'weekly',
    name: 'Ritual Semanal de Oxalá',
    nameEn: 'Weekly Oxalá Ritual',
    description: 'Prática semanal para honrar Oxalá e renovar a fé.',
    tradition: 'candomble',
    duration: '30 minutos',
    frequency: 'Domingo',
    steps: [
      'Acenda7 velas brancas em círculo',
      'Coloque água no centro',
      'Recite a oração de Oxalá',
      'Agradeça pelas bênçãos da semana',
      'Pida proteção e sabedoria',
      'Medite em silêncio por 10 minutos',
      'Agradeça e apague as velas uma a uma',
    ],
    materials: ['7 velas brancas', 'Água', 'Alguidar branco'],
    sefirot: ['Kether', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: 'Sahasrara (7º)',
    time: 'Domingo',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['weekly'],
  },
  {
    id: 'iemanja-fullmoon',
    type: 'monthly',
    name: 'Ritual de Iemanjá na Lua Cheia',
    nameEn: 'Iemanjá Full Moon Ritual',
    description: 'Ritual mensal na lua cheia para honr Iemanjá.',
    tradition: 'umbanda',
    duration: '1-2 horas',
    frequency: 'Lua Cheia',
    steps: [
      'Vá a uma praia ou local com água',
      'Monte seu altar na areia',
      'Acenda velas azuis e brancas',
      'Ofrenda: flores, moedas, espelho',
      'Recite oração a Iemanjá',
      'Lave as mãos na água do mar',
      'Faça oferenda à água',
      'Agradeça e libere a oferenda ao mar',
    ],
    materials: ['Velas azuis e brancas', 'Flores', 'Moedas', 'Espelho', 'Água do mar'],
    sefirot: ['Yesod', 'Binah'],
    orixa: 'Iemanjá',
    chakra: 'Svadhisthana (2º)',
    time: 'Lua Cheia',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['monthly'],
  },
  {
    id: 'ogum-protection',
    type: 'crisis',
    name: 'Ritual de Proteção de Ogum',
    nameEn: 'Ogum Protection Ritual',
    description: 'Ritual para proteção em momentos de crise.',
    tradition: 'candomble',
    duration: '45 minutos',
    frequency: 'Quando necessário',
    steps: [
      'Acenda vela vermelha',
      'Cruze os braços sobre o peito',
      'Recite: "Ogum, senhor das batalhas"',
      'Visualize uma barreira de luz',
      'Pida proteção contra inimigos',
      'Carregue uma钥匙 de ferro (opcional)',
      'Agradeça a Ogum pela proteção',
    ],
    materials: ['Vela vermelha', 'Espada de ferro', 'Água', 'Alho'],
    sefirot: ['Gevurah', 'Malkuth'],
    orixa: 'Ogum',
    chakra: 'Muladhara (1º)',
    time: 'Qualquer hora',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['crisis'],
  },
  {
    id: 'xango-equinox',
    type: 'seasonal',
    name: 'Ritual de Xangô no Equinócio',
    nameEn: 'Xangô Equinox Ritual',
    description: 'Ritual sazonal no equinócio para Xangô.',
    tradition: 'candomble',
    duration: '1 hora',
    frequency: 'Equinócio (Março/Setembro)',
    steps: [
      'Acenda velas vermelhas e pretas',
      'Coloque 2 pedras uma sobre a outra',
      'Recite oração a Xangô',
      'Pida justiça e equilíbrio',
      'Ofereça dendê e mel',
      'Queime incenso de patchouli',
      'Agradeça pelo poder do fogo',
    ],
    materials: ['Velas vermelha e preta', 'Pedras', 'Dendê', 'Mel', 'Incenso de patchouli'],
    sefirot: ['Gevurah', 'Tipheret'],
    orixa: 'Xangô',
    chakra: 'Manipura (3º)',
    time: 'Equinócio',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['seasonal'],
  },
  {
    id: 'oxum-anniversary',
    type: 'celebration',
    name: 'Celebração de Oxum',
    nameEn: 'Oxum Celebration',
    description: 'Celebração para honrar Oxum em seu dia.',
    tradition: 'candomble',
    duration: '2 horas',
    frequency: '8 de Dezembro',
    steps: [
      'Prepare o altar com água doce',
      'Acenda velas douradas e rosas',
      'Decore com flores amarelas',
      'Ofrenda de mel e arroz doce',
      'Recite oração a Oxum',
      'Cante músicas de Oxum',
      'Dance em honra a Oxum',
      'Agradeça pelas bênçãos',
    ],
    materials: ['Velas dourada e rosa', 'Água doce', 'Flores amarelas', 'Mel', 'Arroz doce'],
    sefirot: ['Tipheret', 'Netzach'],
    orixa: 'Oxum',
    chakra: 'Anahata (4º)',
    time: '8 de Dezembro',
    spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS['celebration'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = RitualQuerySchema.safeParse({
      type: searchParams.get('type'),
      tradition: searchParams.get('tradition'),
      day: searchParams.get('day'),
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

    const { type, tradition, day, includeSteps, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let practices = [...RITUAL_PRACTICES];

    if (type) {
      practices = practices.filter(p => p.type === type);
    }

    if (tradition) {
      practices = practices.filter(p => p.tradition === tradition);
    }

    if (day) {
      practices = practices.filter(p => p.time.toLowerCase().includes(day.toLowerCase()));
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
      byTime: practices.reduce((acc, p) => {
        acc[p.time] = (acc[p.time] || 0) + 1;
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
      spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, tradition, day, includeSteps, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}