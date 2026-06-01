import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const HealingTypeSchema = z.enum(['reiki', 'pranic', 'sound', 'crystal', 'aromatherapy', 'meditation', 'breathwork', 'energy-clearing']);
const ChakraSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]);

const SpiritualHealingRequestSchema = z.object({
  healingType: HealingTypeSchema.optional(),
  chakra: ChakraSchema.optional(),
  intensity: z.number().int().min(1).max(100).optional(),
  duration: z.number().int().min(1).max(120).optional(),
});

const SpiritualHealingSessionSchema = z.object({
  id: z.string(),
  healingType: HealingTypeSchema,
  targetChakra: ChakraSchema,
  intensity: z.number().int(),
  duration: z.number().int(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  recommendations: z.array(z.string()),
  affirmations: z.array(z.string()),
  warnings: z.array(z.string()),
});

const ChakraDataSchema = z.object({
  number: z.number().int().min(1).max(7),
  name: z.string(),
  sanskrit: z.string(),
  color: z.string(),
  element: z.string(),
  location: z.string(),
  sefirot: z.array(z.string()),
  orixa: z.string().optional(),
});

const HealingTypeInfoSchema = z.object({
  id: HealingTypeSchema,
  description: z.string(),
  methods: z.array(z.string()),
  benefits: z.array(z.string()),
  sefirot: z.array(z.string()),
  frequency: z.string().optional(),
});

const SpiritualHealingQuerySchema = z.object({
  type: HealingTypeSchema.optional(),
  chakra: ChakraSchema.optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
});

// ─── Chakra Data with Sefirot Correlation ─────────────────────────────────

const CHAKRA_DATA: z.infer<typeof ChakraDataSchema>[] = [
  { number: 1, name: 'Root', sanskrit: 'Muladhara', color: 'red', element: 'earth', location: 'base of spine', sefirot: ['Malkuth', 'Yesod'], orixa: 'Omulu' },
  { number: 2, name: 'Sacral', sanskrit: 'Svadhisthana', color: 'orange', element: 'water', location: 'below navel', sefirot: ['Yesod', 'Hod'], orixa: 'Oxum' },
  { number: 3, name: 'Solar Plexus', sanskrit: 'Manipura', color: 'yellow', element: 'fire', location: 'upper abdomen', sefirot: ['Gevurah', 'Hod'], orixa: 'Xangô' },
  { number: 4, name: 'Heart', sanskrit: 'Anahata', color: 'green', element: 'air', location: 'center of chest', sefirot: ['Tipheret', 'Netzach'], orixa: 'Iemanjá' },
  { number: 5, name: 'Throat', sanskrit: 'Vishuddha', color: 'blue', element: 'ether', location: 'throat', sefirot: ['Chesed', 'Gevurah'], orixa: 'Ogum' },
  { number: 6, name: 'Third Eye', sanskrit: 'Ajna', color: 'indigo', element: 'light', location: 'between eyebrows', sefirot: ['Chokhmah', 'Binah'], orixa: 'Oxumaré' },
  { number: 7, name: 'Crown', sanskrit: 'Sahasrara', color: 'violet', element: 'divine', location: 'top of head', sefirot: ['Kether', 'Daat'], orixa: 'Oxalá' },
];

// ─── Healing Types with Spiritual Correlations ─────────────────────────────

const HEALING_TYPES: z.infer<typeof HealingTypeInfoSchema>[] = [
  {
    id: 'reiki',
    description: 'Universal life force energy healing through channeling positive energy',
    methods: ['hands-on healing', 'distant healing', 'chakra balancing', 'Reiki symbols'],
    benefits: ['stress reduction', 'relaxation', 'pain relief', 'emotional balance'],
    sefirot: ['Tipheret', 'Netzach'],
    frequency: '528 Hz',
  },
  {
    id: 'pranic',
    description: 'Ancient healing system using prana/life energy to balance energy fields',
    methods: ['pranic breathing', 'energy cleansing', 'energizing techniques', 'pranic psychotherapy'],
    benefits: ['energy purification', 'vitality increase', 'mental clarity', 'spiritual growth'],
    sefirot: ['Chesed', 'Gevurah'],
    frequency: '396 Hz',
  },
  {
    id: 'sound',
    description: 'Healing through vibrations of sound bowls, tuning forks, and chanting',
    methods: ['tibetan bowls', 'tuning forks', 'sacred mantras', 'binaural beats', 'drum healing'],
    benefits: ['brainwave entrainment', 'chakra activation', 'tension release', 'deep meditation'],
    sefirot: ['Chokhmah', 'Binah'],
    frequency: '417 Hz',
  },
  {
    id: 'crystal',
    description: 'Healing using crystals and gemstones to balance energy centers',
    methods: ['crystal layouts', 'gridding', 'elixir preparation', 'wearing', 'placement'],
    benefits: ['energy amplification', 'protection', 'manifestation', 'grounding'],
    sefirot: ['Malkuth', 'Yesod'],
    frequency: '639 Hz',
  },
  {
    id: 'aromatherapy',
    description: 'Healing with essential oils for physical and emotional wellness',
    methods: ['diffusion', 'topical application', 'bath', 'inhalation', 'massage'],
    benefits: ['mood enhancement', 'stress relief', 'energy cleansing', 'chakra alignment'],
    sefirot: ['Netzach', 'Hod'],
    frequency: '741 Hz',
  },
  {
    id: 'meditation',
    description: 'Focused awareness practice for spiritual healing and inner peace',
    methods: ['guided visualization', 'breath focus', 'body scan', 'loving-kindness', 'transcendental'],
    benefits: ['inner peace', 'self-awareness', 'emotional healing', 'spiritual connection'],
    sefirot: ['Kether', 'Chokhmah'],
    frequency: '432 Hz',
  },
  {
    id: 'breathwork',
    description: 'Conscious breathing techniques for energy clearing and transformation',
    methods: ['pranayama', 'holotropic', 'clarity breath', 'box breathing', 'alternate nostril'],
    benefits: ['energy release', 'toxins elimination', 'emotional processing', 'pranic boost'],
    sefirot: ['Ruach', 'Tipheret'],
    frequency: '285 Hz',
  },
  {
    id: 'energy-clearing',
    description: 'Removing negative energies and attachments from personal space',
    methods: ['smudging', 'salt baths', 'visualization', 'affirmations', 'space clearing'],
    benefits: ['space purification', 'negative energy removal', 'fresh start', 'protection'],
    sefirot: ['Gevurah', 'Malkuth'],
    frequency: '963 Hz',
  },
];

function generateSessionId(): string {
  return `heal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function getRecommendations(type: string, chakra: number): string[] {
  const healingInfo = HEALING_TYPES.find(h => h.id === type);
  const chakraInfo = CHAKRA_DATA.find(c => c.number === chakra);
  if (!healingInfo || !chakraInfo) return [];

  return [
    `Focus on ${chakraInfo.name.toLowerCase()} chakra during ${type} practice`,
    `Visualize ${chakraInfo.color} energy flowing through your ${chakraInfo.name.toLowerCase()} center`,
    `Practice for at least ${15 + chakra * 5} minutes for optimal results`,
    `Incorporate ${chakraInfo.element} element in your healing session`,
    `Journal your experiences after each ${type} session`,
    `Use ${healingInfo.frequency} frequency for enhanced healing`,
  ];
}

function getAffirmations(chakra: number): string[] {
  const affirmations: Record<number, string[]> = {
    1: ['I am safe and secure', 'I ground myself in the present moment', 'I trust the universe provides'],
    2: ['I honor my emotions', 'I embrace my creativity', 'I deserve pleasure and joy'],
    3: ['I trust my inner wisdom', 'I am confident in my power', 'I take action with purpose'],
    4: ['I give and receive love freely', 'I forgive myself and others', 'My heart is open to giving'],
    5: ['I speak my truth clearly', 'I communicate with integrity', 'I express myself authentically'],
    6: ['I trust my intuition', 'I see clearly with wisdom', 'I open to divine guidance'],
    7: ['I am connected to divine source', 'I receive spiritual wisdom', 'I align with my highest purpose'],
  };
  return affirmations[chakra] || affirmations[1];
}

function getWarnings(): string[] {
  return [
    'Consult a healthcare provider if you have serious medical conditions',
    'This is a complementary practice, not a replacement for medical treatment',
    'Stop if you experience discomfort during healing sessions',
  ];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SpiritualHealingQuerySchema.safeParse({
    type: searchParams.get('type'),
    chakra: searchParams.get('chakra'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, chakra, limit } = parseResult.data;

  let healingTypes = [...HEALING_TYPES];
  let chakras = [...CHAKRA_DATA];

  if (type) {
    healingTypes = healingTypes.filter(h => h.id === type);
  }
  if (chakra) {
    chakras = chakras.filter(c => c.number === chakra);
  }
  if (limit) {
    healingTypes = healingTypes.slice(0, limit);
  }

  return NextResponse.json({
    success: true,
    healingTypes,
    chakras,
    totalHealingTypes: HEALING_TYPES.length,
    totalChakras: CHAKRA_DATA.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = SpiritualHealingRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválida',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { healingType, chakra, intensity, duration } = parseResult.data;
    const selectedType = healingType || 'reiki';
    const randomChakra = Math.floor(Math.random() * 7) + 1;
    const selectedChakra = chakra || (randomChakra as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    const selectedIntensity = intensity || Math.floor(Math.random() * 50) + 50;
    const selectedDuration = duration || Math.floor(Math.random() * 20) + 10;

    const session: z.infer<typeof SpiritualHealingSessionSchema> = {
      id: generateSessionId(),
      healingType: selectedType,
      targetChakra: selectedChakra,
      intensity: selectedIntensity,
      duration: selectedDuration,
      startedAt: new Date().toISOString(),
      recommendations: getRecommendations(selectedType, selectedChakra),
      affirmations: getAffirmations(selectedChakra),
      warnings: getWarnings(),
    };

    const healingInfo = HEALING_TYPES.find(h => h.id === selectedType);
    const chakraInfo = CHAKRA_DATA.find(c => c.number === selectedChakra);

    return NextResponse.json({
      success: true,
      session,
      healingInfo,
      chakra: chakraInfo,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}