import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MeditationTechniquesQuerySchema = z.object({
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Meditation Techniques ──────────────────────────────────────────
const TECHNIQUE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'breath-awareness': {
    sefirot: ['Binah', 'Kether'],
    chakra: 4,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A respiração me ancora no presente',
    frequency: '417 Hz',
  },
  'body-scan': {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aceito e honro cada parte de meu corpo',
    frequency: '396 Hz',
  },
  'loving-kindness': {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Amor e compaixão fluem através de mim',
    frequency: '528 Hz',
  },
  transcendental: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Transcendo para a consciência pura',
    frequency: '963 Hz',
  },
  vipassana: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Vejo a natureza verdadeira de todas as coisas',
    frequency: '741 Hz',
  },
  zen: {
    sefirot: ['Kether', 'Yesod'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Estou presente no momento eterno',
    frequency: '639 Hz',
  },
  samatha: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha mente está serena e focada',
    frequency: '528 Hz',
  },
  visualization: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Eu crio minha realidade com clareza',
    frequency: '741 Hz',
  },
  mantra: {
    sefirot: ['Binah', 'Tipheret'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'O som sagrado me transforma',
    frequency: '528 Hz',
  },
};

const techniques = [
  {
    id: 'breath-awareness',
    name: 'Breath Awareness',
    category: 'mindfulness',
    level: 'beginner',
    duration: { min: 5, max: 30 },
    description: 'Focus on the natural rhythm of your breath to cultivate present-moment awareness.',
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes and relax your body',
      'Notice the sensation of breathing',
      'Follow each inhale and exhale',
      'When mind wanders, gently return to breath',
    ],
    benefits: ['Reduced stress', 'Improved focus', 'Emotional regulation'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'].frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS['breath-awareness'],
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    category: 'relaxation',
    level: 'intermediate',
    duration: { min: 10, max: 45 },
    description: 'Systematically bring attention to different parts of the body, releasing tension.',
    instructions: [
      'Lie down or sit comfortably',
      'Start at the top of your head',
      'Slowly move attention down through each body part',
      'Notice sensations without judgment',
      'Spend a few breaths on each area',
    ],
    benefits: ['Deep relaxation', 'Body awareness', 'Tension release'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'].frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS['body-scan'],
  },
  {
    id: 'loving-kindness',
    name: 'Loving Kindness (Metta)',
    category: 'compassion',
    level: 'intermediate',
    duration: { min: 10, max: 30 },
    description: 'Cultivate feelings of warmth and compassion toward yourself and others.',
    instructions: [
      'Sit in a comfortable position',
      'Bring to mind someone you care about',
      'Silently repeat: "May you be happy, may you be healthy"',
      'Extend to yourself, then neutral people, then all beings',
      'Let feelings of warmth grow naturally',
    ],
    benefits: ['Self-compassion', 'Emotional openness', 'Reduced self-criticism'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'].frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS['loving-kindness'],
  },
  {
    id: 'transcendental',
    name: 'Transcendental Meditation',
    category: 'transcendental',
    level: 'advanced',
    duration: { min: 15, max: 20 },
    description: 'Use a mantra to settle the mind into deep rest while maintaining wakefulness.',
    instructions: [
      'Sit comfortably with eyes closed',
      'Repeat your mantra silently',
      'Let the mantra become effortless',
      'Allow thoughts to come and go',
      'Experience restful alertness',
    ],
    benefits: ['Deep rest', 'Creativity', 'Stress reduction'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.transcendental,
  },
  {
    id: 'vipassana',
    name: 'Vipassana',
    category: 'insight',
    level: 'advanced',
    duration: { min: 30, max: 60 },
    description: 'Develop clear insight into the true nature of reality through observation.',
    instructions: [
      'Sit with a straight spine',
      'Observe sensations arising and passing',
      'Note them with equanimity',
      'Notice impermanence in all phenomena',
      'Develop wisdom through direct experience',
    ],
    benefits: ['Insight wisdom', 'Equanimity', 'Understanding impermanence'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.vipassana,
  },
  {
    id: 'zen',
    name: 'Zen Meditation',
    category: 'zen',
    level: 'intermediate',
    duration: { min: 20, max: 45 },
    description: 'Practice of just sitting (Shikantaza) with open awareness.',
    instructions: [
      'Sit in full lotus or half lotus',
      'Keep spine straight',
      'Let go of any agenda or goal',
      'Rest in open awareness',
      'When thoughts arise, let them pass',
    ],
    benefits: ['Open awareness', 'Presence', 'Freedom from concepts'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.zen,
  },
  {
    id: 'samatha',
    name: 'Samatha (Calm Abiding)',
    category: 'concentration',
    level: 'intermediate',
    duration: { min: 15, max: 30 },
    description: 'Develop single-pointed concentration to calm the mind.',
    instructions: [
      'Choose a meditation object (breath, mantra, candle)',
      'Focus single-pointedly on the object',
      'When mind wanders, gently return',
      'Cultivate serenity and mental pliancy',
      'Progress from gross to subtle awareness',
    ],
    benefits: ['Mental calm', 'Concentration', 'Prepares mind for insight'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.samatha,
  },
  {
    id: 'visualization',
    name: 'Guided Visualization',
    category: 'visualization',
    level: 'beginner',
    duration: { min: 10, max: 30 },
    description: 'Use imaginative imagery to transform consciousness.',
    instructions: [
      'Enter a relaxed state',
      'Bring to mind a healing image or scene',
      'Engage all senses in the visualization',
      'Stay present with the imagery',
      'Allow insights to arise naturally',
    ],
    benefits: ['Imagination', 'Healing imagery', 'Creative consciousness'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.visualization,
  },
  {
    id: 'mantra',
    name: 'Mantra Meditation',
    category: 'sound',
    level: 'beginner',
    duration: { min: 10, max: 20 },
    description: 'Use sacred sounds to align consciousness with higher frequencies.',
    instructions: [
      'Choose a appropriate mantra',
      'Sit comfortably with good posture',
      'Repeat the mantra silently or aloud',
      'Let the sound vibrate through your being',
      'Experience the mantra as pure vibration',
    ],
    benefits: ['Sound healing', 'Frequency alignment', 'Mental focus'],
    sefirot: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.sefirot,
    chakra: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.chakra,
    element: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.element,
    orixa: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.orixa,
    affirmation: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.affirmation,
    frequency: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra.frequency,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.mantra,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MeditationTechniquesQuerySchema.safeParse({
    category: searchParams.get('category'),
    level: searchParams.get('level'),
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

  const { category, level, sefirot, chakra, element, orixa } = parseResult.data;
  let filteredTechniques = [...techniques];

  if (category) {
    filteredTechniques = filteredTechniques.filter(t => t.category === category);
  }

  if (level) {
    filteredTechniques = filteredTechniques.filter(t => t.level === level);
  }

  if (sefirot) {
    filteredTechniques = filteredTechniques.filter(t => t.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    filteredTechniques = filteredTechniques.filter(t => t.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    filteredTechniques = filteredTechniques.filter(t => t.spiritualCorrelations.element === element);
  }

  if (orixa) {
    filteredTechniques = filteredTechniques.filter(t => t.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byCategory: filteredTechniques.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byLevel: filteredTechniques.reduce((acc, t) => {
      acc[t.level] = (acc[t.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: filteredTechniques.reduce((acc, t) => {
      t.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: filteredTechniques.reduce((acc, t) => {
      const c = t.spiritualCorrelations.chakra;
      if (c) acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: filteredTechniques.reduce((acc, t) => {
      const e = t.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: filteredTechniques.reduce((acc, t) => {
      const o = t.spiritualCorrelations.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    techniques: filteredTechniques,
    count: filteredTechniques.length,
    spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { category, level, sefirot, chakra, element, orixa },
    },
  });
}