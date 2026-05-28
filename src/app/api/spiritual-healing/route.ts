import { NextRequest, NextResponse } from 'next/server';

export type HealingType = 'reiki' | 'pranic' | 'sound' | 'crystal' | 'aromatherapy' | 'meditation' | 'breathwork' | 'energy-clearing';
export type Chakra = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SpiritualHealingRequest {
  healingType?: HealingType;
  chakra?: Chakra;
  intensity?: number;
  duration?: number;
}

export interface SpiritualHealingSession {
  id: string;
  healingType: HealingType;
  targetChakra: Chakra;
  intensity: number;
  duration: number;
  startedAt: string;
  completedAt?: string;
  recommendations: string[];
  affirmations: string[];
  warnings: string[];
}

const CHAKRA_DATA: Record<Chakra, { name: string; sanskrit: string; color: string; element: string; location: string }> = {
  1: { name: 'Root', sanskrit: 'Muladhara', color: 'red', element: 'earth', location: 'base of spine' },
  2: { name: 'Sacral', sanskrit: 'Svadhisthana', color: 'orange', element: 'water', location: 'below navel' },
  3: { name: 'Solar Plexus', sanskrit: 'Manipura', color: 'yellow', element: 'fire', location: 'upper abdomen' },
  4: { name: 'Heart', sanskrit: 'Anahata', color: 'green', element: 'air', location: 'center of chest' },
  5: { name: 'Throat', sanskrit: 'Vishuddha', color: 'blue', element: 'ether', location: 'throat' },
  6: { name: 'Third Eye', sanskrit: 'Ajna', color: 'indigo', element: 'light', location: 'between eyebrows' },
  7: { name: 'Crown', sanskrit: 'Sahasrara', color: 'violet', element: 'divine', location: 'top of head' },
};

const HEALING_TYPES: Record<HealingType, { description: string; methods: string[]; benefits: string[] }> = {
  reiki: {
    description: 'Universal life force energy healing through channeling positive energy',
    methods: ['hands-on healing', 'distant healing', 'chakra balancing'],
    benefits: ['stress reduction', 'relaxation', 'pain relief', 'emotional balance'],
  },
  pranic: {
    description: 'Ancient healing system using prana/life energy to balance energy fields',
    methods: ['pranic breathing', 'energy cleansing', 'energizing techniques'],
    benefits: ['energy purification', 'vitality increase', 'mental clarity', 'spiritual growth'],
  },
  sound: {
    description: 'Healing through vibrations of sound bowls, tuning forks, and chanting',
    methods: ['tibetan bowls', 'tuning forks', 'sacred mantras', 'binaural beats'],
    benefits: ['brainwave entrainment', 'chakra activation', 'tension release', 'deep meditation'],
  },
  crystal: {
    description: 'Healing using crystals and gemstones to balance energy centers',
    methods: ['crystal layouts', 'gridding', 'elixir preparation', 'wearing'],
    benefits: ['energy amplification', 'protection', 'manifestation', 'grounding'],
  },
  aromatherapy: {
    description: 'Healing with essential oils for physical and emotional wellness',
    methods: ['diffusion', 'topical application', 'bath', 'inhalation'],
    benefits: ['mood enhancement', 'stress relief', 'energy cleansing', 'chakra alignment'],
  },
  meditation: {
    description: 'Focused awareness practice for spiritual healing and inner peace',
    methods: ['guided visualization', 'breath focus', 'body scan', 'loving-kindness'],
    benefits: ['inner peace', 'self-awareness', 'emotional healing', 'spiritual connection'],
  },
  breathwork: {
    description: 'Conscious breathing techniques for energy clearing and transformation',
    methods: ['pranayama', 'holotropic', 'clarity breath', 'box breathing'],
    benefits: ['energy release', 'toxins elimination', 'emotional processing', 'pranic boost'],
  },
  'energy-clearing': {
    description: 'Removing negative energies and attachments from personal space',
    methods: ['smudging', 'salt baths', 'visualization', 'affirmations'],
    benefits: ['space purification', 'negative energy removal', 'fresh start', 'protection'],
  },
};

function generateSessionId(): string {
  return `heal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function getRandomRecommendations(type: HealingType, chakra: Chakra): string[] {
  const baseRecs = HEALING_TYPES[type].benefits;
  const chakraName = CHAKRA_DATA[chakra].name;
  
  const chakraRecs = [
    `Focus on ${chakraName.toLowerCase()} chakra during ${type} practice`,
    `Visualize ${CHAKRA_DATA[chakra].color} energy flowing through your ${chakraName.toLowerCase()} center`,
    `Practice for at least ${15 + chakra * 5} minutes for optimal results`,
    `Incorporate ${CHAKRA_DATA[chakra].element} element in your healing session`,
    `Journal your experiences after each ${type} session`,
  ];

  return [...baseRecs.map(b => `Incorporate ${b} into your daily practice`), ...chakraRecs.slice(0, 3)];
}

function getAffirmations(chakra: Chakra): string[] {
  const affirmations: Record<Chakra, string[]> = {
    1: ['I am safe and secure', 'I ground myself in the present moment', 'I trust the universe provides'],
    2: ['I honor my emotions', 'I embrace my creativity', 'I deserve pleasure and joy'],
    3: ['I trust my inner wisdom', 'I am confident in my power', 'I take action with purpose'],
    4: ['I give and receive love freely', 'I forgive myself and others', 'My heart is open to giving'],
    5: ['I speak my truth clearly', 'I communicate with integrity', 'I express myself authentically'],
    6: ['I trust my intuition', 'I see clearly with wisdom', 'I open to divine guidance'],
    7: ['I am connected to divine source', 'I receive spiritual wisdom', 'I align with my highest purpose'],
  };
  return affirmations[chakra];
}

function getWarnings(): string[] {
  return [
    'Consult a healthcare provider if you have serious medical conditions',
    'This is a complementary practice, not a replacement for medical treatment',
    'Stop if you experience discomfort during healing sessions',
  ];
}

export async function GET() {
  return NextResponse.json({
    endpoints: ['GET /api/spiritual-healing', 'POST /api/spiritual-healing'],
    methods: {
      GET: 'Returns API information and healing options',
      POST: 'Creates a spiritual healing session',
    },
    healingTypes: Object.keys(HEALING_TYPES),
    chakras: Object.entries(CHAKRA_DATA).map(([num, data]) => ({
      number: Number(num),
      ...data,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: SpiritualHealingRequest = await request.json();

    const healingType: HealingType = body.healingType || 'reiki';
    const targetChakra: Chakra = body.chakra || Math.floor(Math.random() * 7) + 1 as Chakra;
    const intensity = body.intensity || Math.floor(Math.random() * 50) + 50;
    const duration = body.duration || Math.floor(Math.random() * 20) + 10;

    if (!HEALING_TYPES[healingType]) {
      return NextResponse.json(
        { error: `Invalid healing type. Available: ${Object.keys(HEALING_TYPES).join(', ')}` },
        { status: 400 }
      );
    }

    const session: SpiritualHealingSession = {
      id: generateSessionId(),
      healingType,
      targetChakra,
      intensity,
      duration,
      startedAt: new Date().toISOString(),
      recommendations: getRandomRecommendations(healingType, targetChakra),
      affirmations: getAffirmations(targetChakra),
      warnings: getWarnings(),
    };

    return NextResponse.json({
      session,
      healingInfo: HEALING_TYPES[healingType],
      chakra: CHAKRA_DATA[targetChakra],
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}