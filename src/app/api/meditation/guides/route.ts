/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

export interface MeditationGuide {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  steps: GuideStep[];
  benefits: string[];
  warnings?: string[];
}

export interface GuideStep {
  order: number;
  title: string;
  duration: number;
  instructions: string[];
  breathCount?: number;
  affirmation?: string;
}

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
  },
  {
    id: '，呼吸放松',
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
        title: '4-7-8 Breathing',
        duration: 5,
        instructions: [
          'Inhale quietly through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through your mouth for 8 counts',
          'Repeat this cycle',
        ],
        breathCount: 8,
      },
      {
        order: 3,
        title: 'Box Breathing',
        duration: 4,
        instructions: [
          'Inhale for 4 counts',
          'Hold for 4 counts',
          'Exhale for 4 counts',
          'Hold empty for 4 counts',
          'This is one box breath cycle',
        ],
        breathCount: 4,
      },
      {
        order: 4,
        title: 'Integration',
        duration: 4,
        instructions: [
          'Allow your breath to return to natural rhythm',
          'Notice the state of your body',
          'Rest here for a moment',
          'When ready, slowly return to activity',
        ],
      },
    ],
    benefits: [
      'Activates parasympathetic nervous system',
      'Reduces cortisol levels',
      'Lowers blood pressure',
      'Improves sleep quality',
    ],
    warnings: ['If you feel dizzy, return to normal breathing immediately'],
  },
  {
    id: 'deep-sleep',
    title: 'Deep Sleep Preparation',
    description: 'A calming practice to prepare body and mind for restorative sleep',
    duration: 20,
    difficulty: 'beginner',
    category: 'sleep',
    steps: [
      {
        order: 1,
        title: 'Physical Release',
        duration: 5,
        instructions: [
          'Lie down in your bed',
          'Starting at your feet, tense each muscle group for 5 seconds',
          'Release and move to the next body part',
          'Work your way up through your entire body',
        ],
      },
      {
        order: 2,
        title: 'Breath Descent',
        duration: 5,
        instructions: [
          'Take slow, deep breaths',
          'With each exhale, imagine yourself sinking deeper into the bed',
          'Let go of any thoughts about tomorrow',
          'Focus only on the present moment',
        ],
        affirmation: 'I release this day and allow myself to rest',
      },
      {
        order: 3,
        title: 'Gratitude Scan',
        duration: 5,
        instructions: [
          'Bring to mind three things you are grateful for',
          'Hold each one gently in your awareness',
          'Let the feeling of gratitude wash over you',
          'Allow a smile to form naturally',
        ],
      },
      {
        order: 4,
        title: 'Drift Away',
        duration: 5,
        instructions: [
          'Continue breathing slowly and deeply',
          'Let your thoughts fade like clouds',
          'If a thought arises, acknowledge it and return to your breath',
          'Allow yourself to drift into sleep naturally',
        ],
      },
    ],
    benefits: [
      'Faster sleep onset',
      'Improved sleep quality',
      'Reduced rumination at bedtime',
      'Enhanced sleep architecture',
    ],
    warnings: ['Do not practice if you need to stay alert; this practice induces sleepiness'],
  },
  {
    id: 'sacred-space',
    title: 'Creating Sacred Space',
    description: 'Build a ritual of sacred intention for spiritual connection',
    duration: 25,
    difficulty: 'intermediate',
    category: 'spiritual',
    steps: [
      {
        order: 1,
        title: 'Cleansing',
        duration: 5,
        instructions: [
          'Light a candle or incense if desired',
          'Walk clockwise around your space three times',
          'Visualize white light clearing any stagnant energy',
          'Set an intention for your sacred practice',
        ],
        affirmation: 'I cleanse this space of all that does not serve my highest good',
      },
      {
        order: 2,
        title: 'Elemental Connection',
        duration: 8,
        instructions: [
          'Call upon the elements: Earth, Air, Fire, Water',
          'For each element, visualize its presence and color',
          'Ask for its blessing in your practice',
          'Create a circle of elemental protection',
        ],
      },
      {
        order: 3,
        title: 'Core Meditation',
        duration: 10,
        instructions: [
          'Sit in the center of your sacred space',
          'Close your eyes and turn inward',
          'Focus on your heart center or third eye',
          'Allow spiritual wisdom to flow to you',
          'Receive any insights without attachment',
        ],
      },
      {
        order: 4,
        title: 'Closing Ritual',
        duration: 2,
        instructions: [
          'Thank the elements for their presence',
          'Extinguish candles safely if used',
          'Express gratitude for the experience',
          'Return to ordinary consciousness slowly',
        ],
        affirmation: 'I carry this sacred energy with me as I return',
      },
    ],
    benefits: [
      'Heightened spiritual awareness',
      'Energy cleansing',
      'Deeper contemplative practice',
      'Ritual grounding',
    ],
  },
  {
    id: 'loving-kindness',
    title: 'Loving-Kindness Meditation',
    description: 'Cultivate compassion for self and all beings through traditional Metta practice',
    duration: 20,
    difficulty: 'intermediate',
    category: 'compassion',
    steps: [
      {
        order: 1,
        title: 'Settling',
        duration: 3,
        instructions: [
          'Sit comfortably with a straight spine',
          'Place one hand over your heart',
          'Take several deep breaths',
          'Feel the warmth of your hand',
        ],
      },
      {
        order: 2,
        title: 'Self-Compassion',
        duration: 5,
        instructions: [
          'Bring to mind yourself as you are now',
          'Silently repeat: "May I be happy, May I be healthy"',
          '"May I be safe, May I live with ease"',
          'Feel the warmth spreading through your chest',
        ],
        affirmation: 'May I be happy. May I be healthy. May I be safe. May I live with ease.',
      },
      {
        order: 3,
        title: 'Loved One',
        duration: 4,
        instructions: [
          'Bring to mind someone you love deeply',
          'See them clearly in your mind',
          'Offer them the same phrases',
          'Let feelings of love naturally arise',
        ],
      },
      {
        order: 4,
        title: 'Neutral Person',
        duration: 3,
        instructions: [
          'Bring to mind someone neutral',
          'Perhaps a shopkeeper or neighbor',
          'Offer them loving-kindness',
          'Remain open to whatever arises',
        ],
      },
      {
        order: 5,
        title: 'All Beings',
        duration: 5,
        instructions: [
          'Expand your circle of compassion',
          'Include all beings you know',
          'Then all beings everywhere',
          'Rest in the feeling of universal love',
        ],
        affirmation: 'May all beings be happy. May all beings be healthy. May all beings live with ease.',
      },
    ],
    benefits: [
      'Increased empathy',
      'Reduced anxiety',
      'Enhanced social connection',
      'Self-compassion development',
    ],
  },
  {
    id: 'third-eye',
    title: 'Third Eye Activation',
    description: 'Open and activate the ajna chakra for enhanced intuition and perception',
    duration: 30,
    difficulty: 'advanced',
    category: 'chakra',
    steps: [
      {
        order: 1,
        title: 'Root Activation',
        duration: 5,
        instructions: [
          'Sit in a comfortable position, ideally lotus or half-lotus',
          'Ground yourself by visualizing roots extending from your root chakra',
          'Breathe deeply into your lower abdomen',
          'Feel stable and rooted like a mountain',
        ],
        affirmation: 'I am grounded and open to divine wisdom',
      },
      {
        order: 2,
        title: 'Throat Clearing',
        duration: 5,
        instructions: [
          'Chant the seed syllable HAM three times',
          'Feel the vibration in your throat',
          'Visualize blue light clearing your throat chakra',
          'Affirm your ability to speak and hear truth',
        ],
        breathCount: 3,
      },
      {
        order: 3,
        title: 'Third Eye Focus',
        duration: 10,
        instructions: [
          'Bring your attention to the point between your eyebrows',
          'Visualize a deep indigo light growing there',
          'Imagine an eye slowly opening at this point',
          'Allow your gaze to turn inward',
          'Remain in this stillness',
        ],
        affirmation: 'I open my inner eye to perceive truth',
      },
    ],
    benefits: [
      'Enhanced intuition',
      'Clearer perception',
      'Deeper spiritual insight',
      'Improved focus',
    ],
    warnings: ['If you experience discomfort, stop and ground yourself; proceed gently'],
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
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const maxDuration = searchParams.get('maxDuration');

  if (id) {
    const guide = guides.find((g) => g.id === id);
    if (!guide) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(guide);
  }

  let filteredGuides = [...guides];

  if (category) {
    filteredGuides = filteredGuides.filter((g) => g.category === category);
  }

  if (difficulty) {
    filteredGuides = filteredGuides.filter((g) => g.difficulty === difficulty);
  }

  if (maxDuration) {
    const max = parseInt(maxDuration, 10);
    if (!isNaN(max)) {
      filteredGuides = filteredGuides.filter((g) => g.duration <= max);
    }
  }

  const total = guides.length;
  const categories = Array.from(new Set(guides.map((g) => g.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  return NextResponse.json({
    guides: filteredGuides,
    total,
    categories,
    difficulties,
    count: filteredGuides.length,
  });
}
