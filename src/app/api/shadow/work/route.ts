// ============================================================
// SHADOW WORK API - CABALA DOS CAMINHOS
// Shadow work practices and integration
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ShadowWorkQuerySchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['integration', 'exploration', 'acceptance', 'healing', 'all']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Shadow Work ──────────────────────────────────────────
const SHADOW_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  integration: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Integro todas as partes de mim com compaixão',
    frequency: '528 Hz',
  },
  exploration: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Exploro as profundezas da minha psyche com coragem',
    frequency: '741 Hz',
  },
  acceptance: {
    sefirot: [' Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aceito todas as partes de mim sem julgamento',
    frequency: '528 Hz',
  },
  healing: {
    sefirot: ['Netzach', 'Hod'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'As feridas da sombra se transformam em sabedoria',
    frequency: '417 Hz',
  },
  projection: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Reclamo minha projeção de volta',
    frequency: '396 Hz',
  },
  denial: {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Iansã',
    affirmation: 'Soltar a negação e abraçar a verdade',
    frequency: '528 Hz',
  },
};

interface ShadowWork {
  id: string;
  name: string;
  description: string;
  type: string;
  prompts: string[];
  duration: string;
  sefirot: string[];
  chakra: number;
  element: string;
  elementPt: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const SHADOW_WORK_PRACTICES: ShadowWork[] = [
  {
    id: 'inner-child-healing',
    name: 'Inner Child Healing',
    description: 'Work with wounded inner child aspects to heal past traumas and reclaim lost vitality.',
    type: 'healing',
    prompts: [
      'What childhood wounds still affect my adult behavior?',
      'What does my inner child need from me today?',
      'Where did I learn to hide parts of myself?'
    ],
    duration: '30-45 minutes',
    sefirot: ['Netzach', 'Hod', 'Yesod'],
    chakra: 3,
    element: 'Water',
    elementPt: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Reclamo minha criança interior com amor',
    frequency: '417 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.healing,
  },
  {
    id: 'shadow-acknowledgment',
    name: 'Shadow Acknowledgment',
    description: 'Direct encounter with shadow aspects through honest self-inquiry and writing exercises.',
    type: 'exploration',
    prompts: [
      'What qualities do I criticize most in others?',
      'What would I do if no one was watching?',
      'Which of my desires feel shameful or embarrassing?'
    ],
    duration: '20-30 minutes',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fire',
    elementPt: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Encontro luz nas minhas sombras',
    frequency: '741 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.exploration,
  },
  {
    id: 'projection-reclamation',
    name: 'Projection Reclamation',
    description: 'Identify and reclaim aspects of self projected onto others.',
    type: 'integration',
    prompts: [
      'Who triggers strong emotional reactions in me?',
      'What do I see in them that I deny in myself?',
      'How can I own this quality constructively?'
    ],
    duration: '25-35 minutes',
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    element: 'Fire',
    elementPt: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Reclamo todas as minhas projeções',
    frequency: '528 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.integration,
  },
  {
    id: 'persona-shadow-dialogue',
    name: 'Persona-Shadow Dialogue',
    description: 'Structured dialogue between conscious persona and unconscious shadow.',
    type: 'acceptance',
    prompts: [
      'Who do I pretend to be in different situations?',
      'What am I hiding behind my public persona?',
      'What would happen if I revealed my true self?'
    ],
    duration: '30-40 minutes',
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Water',
    elementPt: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aceito todas as minhas personas com graça',
    frequency: '528 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.acceptance,
  },
  {
    id: 'dark-night-integration',
    name: 'Dark Night of the Soul Integration',
    description: 'Navigate and integrate periods of existential crisis and spiritual depression.',
    type: 'healing',
    prompts: [
      'What belief or attachment is dissolving?',
      'What am I being asked to surrender?',
      'What new understanding is being born?'
    ],
    duration: '45-60 minutes',
    sefirot: ['Netzach', 'Hod'],
    chakra: 3,
    element: 'Water',
    elementPt: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A noite escura me transforma em luz',
    frequency: '417 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.healing,
  },
  {
    id: 'denial-facing',
    name: 'Facing Denial',
    description: 'Confront aspects of self that have been denied, suppressed, or repressed.',
    type: 'denial',
    prompts: [
      'What parts of myself have I pushed into the shadows?',
      'What would I never admit to others or myself?',
      'What am I most afraid to discover about myself?'
    ],
    duration: '25-35 minutes',
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Air',
    elementPt: 'Ar',
    orixa: 'Iansã',
    affirmation: 'Soltar a negação e abraçar a verdade',
    frequency: '528 Hz',
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS.denial,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = ShadowWorkQuerySchema.safeParse({
    userId: searchParams.get('userId'),
    type: searchParams.get('type'),
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

  const { type, sefirot, chakra, element, orixa } = parseResult.data;
  let practices = [...SHADOW_WORK_PRACTICES];

  if (type && type !== 'all') {
    practices = practices.filter(p => p.type === type);
  }

  if (sefirot) {
    practices = practices.filter(p => p.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    practices = practices.filter(p => p.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    practices = practices.filter(p => p.spiritualCorrelations.element === element);
  }

  if (orixa) {
    practices = practices.filter(p => p.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byType: practices.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: practices.reduce((acc, p) => {
      p.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: practices.reduce((acc, p) => {
      const c = p.spiritualCorrelations.chakra;
      if (c) acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: practices.reduce((acc, p) => {
      const e = p.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: practices.reduce((acc, p) => {
      const o = p.spiritualCorrelations.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    practices,
    count: practices.length,
    spiritualCorrelations: SHADOW_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { type, sefirot, chakra, element, orixa },
    },
  });
}