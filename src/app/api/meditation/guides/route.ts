import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const MeditationCategorySchema = z.enum([
  'mindfulness', 'breathing', 'visualization', 'manifestation', 'ancestral',
  'kundalini', 'zen', 'loving-kindness', 'body-scan', 'transcendental'
]);

const GuideStepSchema = z.object({
  order: z.number().int().positive(),
  title: z.string(),
  duration: z.number().int().positive(),
  instructions: z.array(z.string()),
  breathCount: z.number().int().optional(),
  affirmation: z.string().optional(),
});

const MeditationGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number().int().positive(),
  difficulty: DifficultySchema,
  category: MeditationCategorySchema,
  steps: z.array(GuideStepSchema),
  benefits: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  numeroSagrado: z.number().optional(),
});

const MeditationGuidesQuerySchema = z.object({
  id: z.string().optional(),
  category: MeditationCategorySchema.optional(),
  difficulty: DifficultySchema.optional(),
  maxDuration: z.coerce.number().int().positive().optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

export type MeditationGuide = z.infer<typeof MeditationGuideSchema>;
export type GuideStep = z.infer<typeof GuideStepSchema>;

export const dynamic = 'force-dynamic';

// ─── Meditation Guides Data ──────────────────────────────────────────────────────
const guides: MeditationGuide[] = [
  {
    id: 'morning-awareness',
    title: 'Morning Awareness Practice',
    description: 'Begin your day with intentional presence and grounding',
    duration: 10,
    difficulty: 'beginner',
    category: 'mindfulness',
    steps: [
      {
        order: 1,
        title: 'Breath Awakening',
        duration: 2,
        instructions: [
          'Find a comfortable seated position',
          'Close your eyes gently',
          'Take three deep breaths, inhaling through the nose and exhaling through the mouth',
        ],
        breathCount: 3,
      },
      {
        order: 2,
        title: 'Body Scan',
        duration: 3,
        instructions: [
          'Bring awareness to the crown of your head',
          'Slowly scan down through your body',
          'Notice any tension without judgment',
          'Allow each part to relax as you pass through it',
        ],
      },
      {
        order: 3,
        title: 'Intention Setting',
        duration: 3,
        instructions: [
          'Bring to mind one intention for your day',
          'Hold this intention like a seed in your heart',
          'Visualize it growing and manifesting',
        ],
        affirmation: 'I welcome this day with consciousness and purpose',
      },
      {
        order: 4,
        title: 'Gentle Return',
        duration: 2,
        instructions: [
          'Take three conscious breaths',
          'Slowly wiggle your fingers and toes',
          'Open your eyes when ready',
          'Carry your intention into the day',
        ],
      },
    ],
    benefits: [
      'Enhanced mental clarity',
      'Reduced morning anxiety',
      'Better focus throughout the day',
      'Emotional grounding',
    ],
    sefirot: ['Kether', 'Tipheret'],
    chakra: [6, 7],
    tradicao: 'Mindfulness',
    numeroSagrado: 1,
  },
  {
    id: 'breathing-relaxation',
    title: 'Breath-Based Relaxation',
    description: 'Use the power of breath to release tension and calm the nervous system',
    duration: 15,
    difficulty: 'beginner',
    category: 'breathing',
    steps: [
      {
        order: 1,
        title: 'Preparation',
        duration: 2,
        instructions: [
          'Lie down or sit comfortably',
          'Loosen any tight clothing',
          'Allow your body to feel supported',
        ],
      },
      {
        order: 2,
        title: 'Box Breathing',
        duration: 6,
        instructions: [
          'Inhale for 4 counts',
          'Hold for 4 counts',
          'Exhale for 4 counts',
          'Hold for 4 counts',
          'Repeat 4 times',
        ],
        breathCount: 16,
        affirmation: 'I breathe in peace and exhale tension',
      },
      {
        order: 3,
        title: 'Deep Release',
        duration: 5,
        instructions: [
          'Take a deep breath in',
          'As you exhale, release all tension',
          'Imagine stress leaving your body',
          'With each exhale, feel lighter',
        ],
      },
      {
        order: 4,
        title: 'Rest',
        duration: 2,
        instructions: [
          'Lie still',
          'Notice the calm in your body',
          'Carry this peace with you',
        ],
      },
    ],
    benefits: [
      'Activates parasympathetic nervous system',
      'Reduces cortisol levels',
      'Improves heart rate variability',
      'Deep physical relaxation',
    ],
    sefirot: ['Netzach', 'Hod'],
    chakra: [4, 5],
    tradicao: 'Pranayama/Yoga',
    numeroSagrado: 4,
  },
  {
    id: 'kundalini-awakening',
    title: 'Kundalini Rising',
    description: 'Awaken the dormant spiritual energy at the base of the spine',
    duration: 20,
    difficulty: 'advanced',
    category: 'kundalini',
    steps: [
      {
        order: 1,
        title: 'Grounding',
        duration: 3,
        instructions: [
          'Sit in easy pose with spine straight',
          'Root down through your sitting bones',
          'Draw energy up from Earth',
        ],
      },
      {
        order: 2,
        title: 'Breath of Fire',
        duration: 5,
        instructions: [
          'Begin rhythmic breath of fire',
          'Navel point pumping',
          'Eyes are 1/10 open, focusing on the third eye',
          'Chant SAT NAM silently',
        ],
        breathCount: 120,
        affirmation: 'My kundalini energy rises through all my chakras',
      },
      {
        order: 3,
        title: 'Spinal Flex',
        duration: 3,
        instructions: [
          'Rock gently forward and back',
          'Keep breath of fire going',
          'Energy travels up and down the spine',
        ],
      },
      {
        order: 4,
        title: 'Stillness',
        duration: 5,
        instructions: [
          'Stop all movement',
          'Keep breath of fire going',
          'Feel energy traveling up the central channel',
          'Experience the pure being',
        ],
      },
      {
        order: 5,
        title: 'Rest',
        duration: 4,
        instructions: [
          'Lie down',
          'Let energy integrate',
          'Notice sensations in the body',
        ],
      },
    ],
    benefits: [
      'Spinal elasticity',
      'Nervous system stimulation',
      'Emotional release',
      'Spiritual awakening',
    ],
    warnings: ['This practice may intensify emotions; proceed with guidance if new to kundalini'],
    sefirot: ['Malkuth', 'Yesod', 'Gevurah', 'Chesed', 'Tipheret', 'Netzach', 'Hod'],
    chakra: [1, 2, 3, 4, 5, 6, 7],
    tradicao: 'Kundalini Yoga',
    numeroSagrado: 7,
  },
  {
    id: 'zen-presence',
    title: 'Zen Presence',
    description: 'Sit in stillness and observe the nature of mind',
    duration: 25,
    difficulty: 'intermediate',
    category: 'zen',
    steps: [
      {
        order: 1,
        title: 'Posture',
        duration: 2,
        instructions: [
          'Sit in stable position (seiza or half lotus)',
          'Hands in cosmic mudra',
          'Eyes open, soft gaze downward',
          'Lengthen spine like a stack of coins',
        ],
      },
      {
        order: 2,
        title: 'Settling',
        duration: 3,
        instructions: [
          'Take 3 deep breaths',
          'Exhale completely',
          'Let the breath find its natural rhythm',
          'Release any effort in the breath',
        ],
      },
      {
        order: 3,
        title: 'Silent Illumination',
        duration: 15,
        instructions: [
          'Rest in bare awareness',
          'Notice thoughts as they arise',
          'Do not follow or reject them',
          'Return again and again to the present moment',
          'Like a mirror, let everything appear as it is',
        ],
        affirmation: 'Just this - nothing more, nothing less',
      },
      {
        order: 4,
        title: 'Closing',
        duration: 5,
        instructions: [
          'Slowly open eyes',
          'Bow three times',
          'Dedicate merit to all beings',
          'Carry this presence into your day',
        ],
      },
    ],
    benefits: [
      'Non-conceptual awareness',
      'Equanimity in all conditions',
      'Direct insight into emptiness',
      'Psychological freedom',
    ],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: [6, 7],
    tradicao: 'Zen Buddhism',
    numeroSagrado: 5,
  },
  {
    id: 'manifestation',
    title: 'Manifestation Practice',
    description: 'Align your energy with your desires through focused intention',
    duration: 15,
    difficulty: 'intermediate',
    category: 'manifestation',
    steps: [
      {
        order: 1,
        title: 'Clarity',
        duration: 3,
        instructions: [
          'Sit quietly with your desire clearly in mind',
          'Write it down if possible',
          'Make the desire as specific as possible',
          'Feel as if it is already manifesting',
        ],
      },
      {
        order: 2,
        title: 'Gratitude',
        duration: 3,
        instructions: [
          'Feel gratitude as if your desire has already come true',
          'Experience the emotions now',
          'Thank the universe for this gift',
          'Stay in that feeling state',
        ],
        affirmation: 'I am grateful for all that is flowing to me now',
      },
      {
        order: 3,
        title: 'Visualization',
        duration: 5,
        instructions: [
          'Close your eyes and enter a meditative state',
          'Create a detailed movie of your desired reality',
          'Engage all senses in this visualization',
          'See it, hear it, feel it fully',
        ],
      },
      {
        order: 4,
        title: 'Release',
        duration: 4,
        instructions: [
          'Release attachment to the outcome',
          'Trust that it will manifest or something better',
          'Let go of any pictures of how it must appear',
          'Return to daily life with faith',
        ],
        affirmation: 'I release my desire to the universe, knowing it will manifest in perfect time',
      },
    ],
    benefits: [
      'Law of Attraction alignment',
      'Clarity of intention',
      'Reduced attachment anxiety',
      'Active manifestation practice',
    ],
    sefirot: ['Chesed', 'Netzach'],
    chakra: [4, 6],
    tradicao: 'Neo-Spirituality',
    numeroSagrado: 11,
  },
  {
    id: 'ancestral-healing',
    title: 'Ancestral Connection',
    description: 'Honor and heal lineage patterns through sacred ancestral work',
    duration: 30,
    difficulty: 'advanced',
    category: 'ancestral',
    steps: [
      {
        order: 1,
        title: 'Calling Ancestors',
        duration: 5,
        instructions: [
          'Light a candle for your ancestors',
          'Speak their names aloud if known',
          'Open your heart to their presence',
          'Invite them to be with you in love',
        ],
        affirmation: 'I honor my ancestors, and I call them now in love',
      },
      {
        order: 2,
        title: 'Gratitude Offering',
        duration: 5,
        instructions: [
          'Thank your ancestors for their gifts',
          'These may be gifts of survival, love, wisdom',
          'Acknowledge the sacrifices they made',
          'Feel their love flowing to you',
        ],
      },
      {
        order: 3,
        title: 'Pattern Awareness',
        duration: 10,
        instructions: [
          'Ask to see any patterns inherited from your lineage',
          'These may be patterns of fear, addiction, love, strength',
          'Observe without judgment',
          'Acknowledge what no longer serves you',
        ],
      },
      {
        order: 4,
        title: 'Blessing and Release',
        duration: 10,
        instructions: [
          'Thank ancestors for good gifts and ask release from harmful patterns',
          'Place your hands over your heart',
          'Give yourself their love and break their patterns',
          'Forgive them for their wounds',
          'Release them with love',
        ],
        affirmation: 'I honor my blood, but I choose my own path',
      },
    ],
    benefits: [
      'Healing inherited trauma',
      'Ancestral blessing',
      'Pattern recognition',
      'Generational healing',
    ],
    warnings: ['This practice may surface deep emotions; consider professional support if needed'],
    sefirot: ['Binah', 'Malkuth', 'Yesod'],
    orixa: 'Oxalá',
    chakra: [1, 6, 7],
    tradicao: 'Ancestral Work',
    numeroSagrado: 3,
  },
  {
    id: 'loving-kindness',
    title: 'Loving Kindness (Metta)',
    description: 'Cultivate boundless compassion for self and all beings',
    duration: 20,
    difficulty: 'beginner',
    category: 'loving-kindness',
    steps: [
      {
        order: 1,
        title: 'Opening the Heart',
        duration: 3,
        instructions: [
          'Sit comfortably',
          'Place hand on heart',
          'Feel the warmth of your own heart',
          'Breathe deeply into this space',
        ],
      },
      {
        order: 2,
        title: 'Self-Love',
        duration: 5,
        instructions: [
          'Begin offering phrases to yourself:',
          'May I be happy',
          'May I be healthy',
          'May I be safe',
          'May I live with ease',
          'Feel warmth spreading through your body',
        ],
        affirmation: 'May I be happy, may I be healthy, may I be at peace',
      },
      {
        order: 3,
        title: 'Loved One',
        duration: 4,
        instructions: [
          'Bring to mind someone you love deeply',
          'Offer them the same phrases:',
          'May you be happy',
          'May you be healthy',
          'May you be safe',
          'Feel love expanding beyond yourself',
        ],
      },
      {
        order: 4,
        title: 'All Beings',
        duration: 6,
        instructions: [
          'Expand your circle of love',
          'Include friends, acquaintances, strangers',
          'Include difficult people',
          'Finally, all beings everywhere',
          'May all beings be happy',
        ],
        affirmation: 'May all beings everywhere be happy, may all beings be free',
      },
      {
        order: 5,
        title: 'Integration',
        duration: 2,
        instructions: [
          'Rest in the feeling of boundless love',
          'Know this love is your true nature',
          'Carry it with you into the world',
        ],
      },
    ],
    benefits: [
      'Increased compassion and empathy',
      'Reduced anxiety and self-criticism',
      'Improved relationships',
      'Greater sense of well-being',
    ],
    sefirot: ['Tipheret', 'Chesed', 'Netzach'],
    chakra: [4],
    tradicao: 'Vipassana/Buddhism',
    numeroSagrado: 6,
  },
];

// ─── API Route ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = MeditationGuidesQuerySchema.safeParse({
      id: searchParams.get('id'),
      category: searchParams.get('category'),
      difficulty: searchParams.get('difficulty'),
      maxDuration: searchParams.get('maxDuration'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { id, category, difficulty, maxDuration, orixa, sefirot, chakra } = parseResult.data;

    // Get single guide
    if (id) {
      const guide = guides.find((g) => g.id === id);
      if (!guide) {
        return NextResponse.json({
          success: false,
          error: 'Guide not found',
          availableIds: guides.map(g => g.id),
        }, { status: 404 });
      }
      return NextResponse.json({ success: true, guide });
    }

    let filteredGuides = [...guides];

    // Apply filters
    if (category) {
      filteredGuides = filteredGuides.filter((g) => g.category === category);
    }

    if (difficulty) {
      filteredGuides = filteredGuides.filter((g) => g.difficulty === difficulty);
    }

    if (maxDuration) {
      filteredGuides = filteredGuides.filter((g) => g.duration <= maxDuration);
    }

    // Spiritual filters
    if (orixa) {
      filteredGuides = filteredGuides.filter((g) =>
        g.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filteredGuides = filteredGuides.filter((g) =>
        g.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
    }

    if (chakra) {
      filteredGuides = filteredGuides.filter((g) =>
        g.chakra?.includes(chakra)
      );
    }

    // Statistics
    const categories = Array.from(new Set(guides.map((g) => g.category)));
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    const stats = {
      byCategory: guides.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: guides.reduce((acc, g) => {
        acc[g.difficulty] = (acc[g.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTradicao: guides.reduce((acc, g) => {
        if (g.tradicao) acc[g.tradicao] = (acc[g.tradicao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: guides.reduce((acc, g) => {
        if (g.orixa) acc[g.orixa] = (acc[g.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageDuration: Math.round(guides.reduce((sum, g) => sum + g.duration, 0) / guides.length),
    };

    return NextResponse.json({
      success: true,
      guides: filteredGuides,
      total: guides.length,
      count: filteredGuides.length,
      categories,
      difficulties,
      filters: { category, difficulty, maxDuration, orixa, sefirot, chakra },
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}