import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const JourneyStageSchema = z.enum(['awakening', 'purification', 'illumination', 'integration', 'transcendence']);
const SoulQuerySchema = z.object({
  stage: JourneyStageSchema.optional(),
  includeLessons: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Journey Stages ──────────────────────────────────────────
const JOURNEY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  awakening: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Desperto para minha verdadeira natureza divina',
    frequency: '963 Hz',
  },
  purification: {
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A purificação lava minha alma',
    frequency: '417 Hz',
  },
  illumination: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A iluminação revela minha verdade',
    frequency: '528 Hz',
  },
  integration: {
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Integro todas as partes de meu ser',
    frequency: '528 Hz',
  },
  transcendence: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Transcendo os limites e toco o infinito',
    frequency: '963 Hz',
  },
};

// ─── Soul Journey Data ───────────────────────────────────────────────────────
interface SoulStage {
  id: string;
  stage: string;
  name: string;
  nameEn: string;
  description: string;
  duration: string;
  lessons?: string[];
  symbols: string[];
  orixas: string[];
  sefirot: string[];
  chakra: string;
  signs: string[];
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const SOUL_JOURNEY_STAGES: SoulStage[] = [
  {
    id: 'birth-awareness',
    stage: 'awakening',
    name: 'Despertar da Alma',
    nameEn: 'Soul Awakening',
    description: 'O momento em que a alma reconhece sua verdadeira natureza e busca conexão espiritual.',
    duration: '7 anos',
    lessons: [
      'Reconhecer a existência de algo maior',
      'Despertar para questões espirituais',
      'Primeira intuição do propósito de vida',
    ],
    symbols: ['Aurora', 'Ovo cósmico', 'Semente'],
    orixas: ['Oxalá', 'Iemanjá'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    signs: ['LuaNova', 'Eclipse'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['awakening'],
  },
  {
    id: 'first-tests',
    stage: 'awakening',
    name: 'Primeiros Testes',
    nameEn: 'First Tests',
    description: 'A alma enfrenta seus primeiros desafios para testar sua determinação no caminho.',
    duration: '5 anos',
    lessons: [
      'Fortalecer a fé',
      'Desenvolver resiliência',
      'Aprender a confiar no divino',
    ],
    symbols: ['Espada', 'Fogo', 'Tempestade'],
    orixas: ['Ogum', 'Xangô'],
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 'Manipura (3º)',
    signs: ['Marte', 'Conjuntções tensas'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['awakening'],
  },
  {
    id: 'shadow-work',
    stage: 'purification',
    name: 'Trabalho com a Sombra',
    nameEn: 'Shadow Work',
    description: 'Enfrentar e integrar os aspectos ocultos da psyche para purificação interior.',
    duration: '10 anos',
    lessons: [
      'Confrontar medos e traumas',
      'Integrar aspectos negados do self',
      'Desenvolver auto-compassão',
    ],
    symbols: ['Espelho', 'Noite', 'Caverna'],
    orixas: ['Omolu', 'Nanã'],
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 'Svadhisthana (2º)',
    signs: ['Saturno transito', 'Plutão aspecto'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['purification'],
  },
  {
    id: 'waters-passage',
    stage: 'purification',
    name: 'Passagem pelas Águas',
    nameEn: 'Waters Passage',
    description: 'Travessia das águas da purificação para limpar karma e memórias.',
    duration: '7 anos',
    lessons: [
      'Dissolver attached.',
      'Purificar memórias dolorosas',
      'Fluir com os ciclos da vida',
    ],
    symbols: ['Rio', 'Mar', 'Chuva'],
    orixas: ['Iemanjá', 'Oxum'],
    sefirot: ['Yesod', 'Binah'],
    chakra: 'Svadhisthana (2º)',
    signs: ['Lua Cheia', 'Netuno aspecto'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['purification'],
  },
  {
    id: 'third-eye',
    stage: 'illumination',
    name: 'Abertura do Terceiro Olho',
    nameEn: 'Third Eye Opening',
    description: 'Desenvolvimento da visão interior e intuição.',
    duration: '5 anos',
    lessons: [
      'Desenvolver percepção extrasensorial',
      'Ver além das ilusões',
      'Conectar-se com a sabedoria interior',
    ],
    symbols: ['Olho', 'Luz', 'Pérola'],
    orixas: ['Orunmilá', 'Iansã'],
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 'Ajna (6º)',
    signs: ['Netuno aspecto', 'Lua em Áries'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['illumination'],
  },
  {
    id: 'wisdom-fire',
    stage: 'illumination',
    name: 'Fogo da Sabedoria',
    nameEn: 'Wisdom Fire',
    description: 'Queima das ignorâncias pelo fogo da sabedoria divina.',
    duration: '7 anos',
    lessons: [
      'Queimar a ignorância',
      'Iluminar a mente',
      'Integrar conhecimento e experiência',
    ],
    symbols: ['Fogo', 'Sol', 'Fornalha'],
    orixas: ['Xangô', 'Oxalá'],
    sefirot: ['Chokhmah', 'Gevurah'],
    chakra: 'Manipura (3º)',
    signs: ['Sol aspecto', 'Fogo lunar'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['illumination'],
  },
  {
    id: 'heart-integration',
    stage: 'integration',
    name: 'Integração do Coração',
    nameEn: 'Heart Integration',
    description: 'Unificação do coração com a mente para harmonização interior.',
    duration: '5 anos',
    lessons: [
      'Unificar coração e mente',
      'Desenvolver compaixão universal',
      'Integrar masculino e feminino interior',
    ],
    symbols: ['Coração', 'Rosa', 'Cálice'],
    orixas: ['Oxum', 'Iemanjá'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 'Anahata (4º)',
    signs: ['Vênus aspecto', 'Lua em Touro'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['integration'],
  },
  {
    id: 'will-mastery',
    stage: 'integration',
    name: 'Domínio da Vontade',
    nameEn: 'Will Mastery',
    description: 'Desenvolvimento da vontade divina em harmonia com o propósito.',
    duration: '7 anos',
    lessons: [
      'Alinhar vontade pessoal com divina',
      'Desenvolver disciplina espiritual',
      'Manifestar com intenção pura',
    ],
    symbols: ['Cetro', 'Vontade', 'Fogo solar'],
    orixas: ['Ogum', 'Xangô'],
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 'Manipura (3º)',
    signs: ['Marte harmonioso', 'Sol em Aries'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['integration'],
  },
  {
    id: 'crown-union',
    stage: 'transcendence',
    name: 'União com a Coroa',
    nameEn: 'Union with the Crown',
    description: 'Conexão final com a fonte divina e dissolução dos limites do ego.',
    duration: 'Ciclo completo',
    lessons: [
      'Unir-se à fonte',
      'Dissolver o ego limitado',
      'Tornar-se canal do divino',
    ],
    symbols: ['Coroa', 'Luz infinita', 'Infinito'],
    orixas: ['Oxalá', 'Orunmilá'],
    sefirot: ['Kether', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
    signs: ['Ketheriano', 'Estrela de David'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['transcendence'],
  },
  {
    id: 'service-mastery',
    stage: 'transcendence',
    name: 'Mestria no Serviço',
    nameEn: 'Service Mastery',
    description: 'Uso dos dons espirituais para servir a humanidade.',
    duration: 'Ciclo completo',
    lessons: [
      'Compartilhar dons com o mundo',
      'Servir com humildade',
      'Ser instrumento da luz',
    ],
    symbols: ['Mão', 'Luz irradiante', 'Serviço'],
    orixas: ['Oxalá', 'Iemanjá'],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    signs: ['Júpiter aspecto', 'Lua em Sagitário'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['transcendence'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = SoulQuerySchema.safeParse({
      stage: searchParams.get('stage'),
      includeLessons: searchParams.get('includeLessons'),
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

    const { stage, includeLessons, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let stages = [...SOUL_JOURNEY_STAGES];

    if (stage) {
      stages = stages.filter(s => s.stage === stage);
    }

    if (limit) {
      stages = stages.slice(0, limit);
    }

    if (sefirot) {
      stages = stages.filter(s => s.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      stages = stages.filter(s => s.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      stages = stages.filter(s => s.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      stages = stages.filter(s => s.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byStage: stages.reduce((acc, s) => {
        acc[s.stage] = (acc[s.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: stages.reduce((acc, s) => {
        s.spiritualCorrelations?.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: stages.reduce((acc, s) => {
        const c = s.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: stages.reduce((acc, s) => {
        const e = s.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: stages.reduce((acc, s) => {
        const o = s.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      stages,
      count: stages.length,
      spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { stage, includeLessons, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}