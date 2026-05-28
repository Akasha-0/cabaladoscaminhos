// ============================================================
// KUNDALINI DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for kundalini energy data
// - List all kundalini stages, practices, and information
// - Get specific kundalini stage by ID or number
// - Kundalini awakening and spiritual transformation data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed kundalini stages data
const KUNDALINI_STAGES = [
  {
    id: 'dormant',
    number: 0,
    name: 'Dormant',
    namePt: 'Adormecida',
    description: 'Kundalini energy lies coiled at the base of the spine in Muladhara chakra, waiting to be awakened.',
    descriptionPt: 'A energia kundalini permanece enrolada na base da coluna no chakra Muladhara, aguardando o despertar.',
    chakra: 'Muladhara',
    element: 'Earth',
    color: 'Red',
    energy: 'Potential',
    symptoms: ['Dormancy', 'Blocked energy', 'Instinctive responses'],
    practices: ['Breath work', 'Grounding', 'Foundation yoga'],
    sefirot: ['Malkuth'],
    qualities: ['Stability', 'Survival instinct', 'Grounding'],
    score: 1,
  },
  {
    id: 'awakening',
    number: 1,
    name: 'Awakening',
    namePt: 'Despertar',
    description: 'Initial activation of kundalini energy, beginning its journey upward through the sushumna nadi.',
    descriptionPt: 'Ativação inicial da energia kundalini, iniciando sua jornada ascendente pelo nadi sushumna.',
    chakra: 'Muladhara-Svadhisthana',
    element: 'Water',
    color: 'Orange',
    energy: 'Rising',
    symptoms: ['Tingling', 'Heat at base of spine', 'Dreams of serpents', 'Increased vitality'],
    practices: ['Kapalabhati', 'Bandhas', 'Chakra meditation'],
    sefirot: ['Malkuth', 'Yesod'],
    qualities: ['Vitality', 'Creative energy', 'Purification'],
    score: 3,
  },
  {
    id: 'purification',
    number: 2,
    name: 'Purification',
    namePt: 'Purificação',
    description: 'Kundalini purifies each chakra as it rises, burning through energetic blockages and past traumas.',
    descriptionPt: 'Kundalini purifica cada chakra enquanto sobe, queimando bloqueios energéticos e traumas passados.',
    chakra: 'Manipura',
    element: 'Fire',
    color: 'Yellow',
    energy: 'Transforming',
    symptoms: ['Emotional release', 'Physical heat', 'Past memories surfacing', 'Inner fire'],
    practices: ['Pranayama', 'Meditation', 'Emotional processing'],
    sefirot: ['Malkuth', 'Yesod', 'Hod'],
    qualities: ['Transformation', 'Personal power', 'Will'],
    score: 4,
  },
  {
    id: 'expansion',
    number: 3,
    name: 'Expansion',
    namePt: 'Expansão',
    description: 'Energy reaches the heart center, opening pathways to compassion, love, and spiritual connection.',
    descriptionPt: 'Energia alcança o centro do coração, abrindo caminhos para compaixão, amor e conexão espiritual.',
    chakra: 'Anahata',
    element: 'Air',
    color: 'Green',
    energy: 'Expanding',
    symptoms: ['Heart opening', 'Unconditional love', 'Deep empathy', 'Synchronicities'],
    practices: ['Heart-centered meditation', 'Loving-kindness', 'Service'],
    sefirot: ['Tiferet', 'Gevurah', 'Chesed'],
    qualities: ['Compassion', 'Love', 'Balance'],
    score: 5,
  },
  {
    id: 'illumination',
    number: 4,
    name: 'Illumination',
    namePt: 'Iluminação',
    description: 'Energy reaches the third eye, awakening inner vision, intuition, and higher perception.',
    descriptionPt: 'Energia alcança o terceiro olho, despertando visão interior, intuição e percepção superior.',
    chakra: 'Ajna',
    element: 'Light',
    color: 'Indigo',
    energy: 'Enlightening',
    symptoms: ['Inner light', 'Clairvoyance', 'Intuitive insights', 'Inner sounds'],
    practices: ['Ajna meditation', 'Trataka', 'Mantra recitation'],
    sefirot: ['Chokhmah', 'Binah', 'Daat'],
    qualities: ['Intuition', 'Insight', 'Discernment'],
    score: 7,
  },
  {
    id: 'union',
    number: 5,
    name: 'Union',
    namePt: 'União',
    description: 'Kundalini reaches the crown, merging with divine consciousness. Individual self dissolves into universal awareness.',
    descriptionPt: 'Kundalini alcança a coroa, fundindo-se com a consciência divina. O eu individual se dissolve na consciência universal.',
    chakra: 'Sahasrara',
    element: 'Ether',
    color: 'Violet / White',
    energy: 'Transcendent',
    symptoms: ['Enlightenment', 'Pure awareness', 'Bliss states', 'Non-dual consciousness'],
    practices: ['Sahaja meditation', 'Silence', 'Surrender'],
    sefirot: ['Kether'],
    qualities: ['Unity', 'Transcendence', 'Pure consciousness'],
    score: 9,
  },
  {
    id: 'integration',
    number: 6,
    name: 'Integration',
    namePt: 'Integração',
    description: 'After the peak experience, kundalini energy settles, integrating divine awareness into daily life and embodiment.',
    descriptionPt: 'Após a experiência máxima, a energia kundalini se acalma, integrando a consciência divina na vida cotidiana e na corpificação.',
    chakra: 'All chakras',
    element: 'All elements',
    color: 'Gold / White',
    energy: 'Integrating',
    symptoms: ['Grounded wisdom', 'Effortless presence', 'Embodied spirituality', 'Spontaneous right action'],
    practices: ['Grounding practices', 'Embodiment work', 'Daily spiritual practice'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tiferet', 'Malkuth'],
    qualities: ['Wisdom', 'Presence', 'Embodiment'],
    score: 8,
  },
];

// Pre-computed kundalini practices data
const KUNDALINI_PRACTICES = [
  {
    id: 'breath-of-fire',
    name: 'Breath of Fire',
    namePt: 'Respiração de Fogo',
    type: 'pranayama',
    description: 'Rhythmic breathing technique that generates heat and activates kundalini energy.',
    descriptionPt: 'Técnica de respiração rítmica que gera calor e ativa a energia kundalini.',
    duration: 3,
    durationUnit: 'minutes',
    difficulty: 'intermediate',
    benefits: ['Energizes the nervous system', 'Purifies blood', 'Activates kundalini'],
    precautions: ['Avoid during pregnancy', 'Practice on empty stomach', 'Start slowly'],
    relatedStage: 'awakening',
    score: 5,
  },
  {
    id: 'mulabandha',
    name: 'Mulabandha',
    namePt: 'Mulabandha',
    type: 'bandha',
    description: 'Root lock that seals and directs pranic energy upward through the central channel.',
    descriptionPt: 'Bloqueio raiz que sella e direciona a energia prânica para cima através do canal central.',
    duration: 5,
    durationUnit: 'minutes',
    difficulty: 'advanced',
    benefits: ['Grounds energy', 'Activates kundalini', 'Strengthens pelvic floor'],
    precautions: ['Build gradually', 'Avoid during menstruation', 'Practice with guidance'],
    relatedStage: 'awakening',
    score: 6,
  },
  {
    id: 'sat-kriya',
    name: 'Sat Kriya',
    namePt: 'Sat Kriya',
    type: 'kriya',
    description: 'Powerful kundalini yoga kriya that works on all energy centers simultaneously.',
    descriptionPt: 'Kriya poderoso do yoga kundalini que trabalha em todos os centros energéticos simultaneamente.',
    duration: 3,
    durationUnit: 'minutes',
    difficulty: 'intermediate',
    benefits: ['Strengthens navel center', 'Activates all chakras', 'Calms the mind'],
    precautions: ['Pregnant women should practice gently', 'May be intense for beginners'],
    relatedStage: 'purification',
    score: 7,
  },
  {
    id: 'chakra-meditation',
    name: 'Chakra Meditation',
    namePt: 'Meditação dos Chakras',
    type: 'meditation',
    description: 'Guided meditation through the seven main chakras for kundalini awakening.',
    descriptionPt: 'Meditação guiada através dos sete principais chakras para o despertar kundalini.',
    duration: 31,
    durationUnit: 'minutes',
    difficulty: 'beginner',
    benefits: ['Opens energy channels', 'Balances chakras', 'Prepares path for kundalini'],
    precautions: ['Proceed slowly', 'Stop if overwhelming', 'Ground afterwards'],
    relatedStage: 'dormant',
    score: 4,
  },
  {
    id: 'spinal-breath',
    name: 'Spinal Breath',
    namePt: 'Respiração Espinhal',
    type: 'pranayama',
    description: 'Deep breathing that draws energy up the spine to awaken kundalini.',
    descriptionPt: 'Respiração profunda que atrai energia pela coluna para despertar a kundalini.',
    duration: 11,
    durationUnit: 'minutes',
    difficulty: 'beginner',
    benefits: ['Opens sushumna nadi', 'Builds pranic energy', 'Calms nervous system'],
    precautions: ['Practice in comfortable position', 'Keep spine straight', 'Breathe naturally'],
    relatedStage: 'dormant',
    score: 5,
  },
  {
    id: 'napiers-bones',
    name: "Napier's Bones",
    namePt: 'Ossos de Napier',
    type: 'yoga',
    description: 'Kundalini yoga technique that awakens dormant energy through specific body movements.',
    descriptionPt: 'Técnica de yoga kundalini que desperta energia adormecida através de movimentos corporais específicos.',
    duration: 11,
    durationUnit: 'minutes',
    difficulty: 'intermediate',
    benefits: ['Activates kundalini', 'Strengthens body', 'Opens energy channels'],
    precautions: ['Warm up first', 'Practice on empty stomach', 'Stop if dizzy'],
    relatedStage: 'awakening',
    score: 6,
  },
  {
    id: 'ego-eradicator',
    name: 'Ego Eradicator',
    namePt: 'Eradicador do Ego',
    type: 'meditation',
    description: 'Powerful meditation to dissolve ego boundaries and expand consciousness.',
    descriptionPt: 'Meditação poderosa para dissolver fronteiras do ego e expandir a consciência.',
    duration: 5,
    durationUnit: 'minutes',
    difficulty: 'intermediate',
    benefits: ['Dissolves ego', 'Expands consciousness', 'Clears mental blocks'],
    precautions: ['May intensify emotions', 'Practice in private', 'Ground afterwards'],
    relatedStage: 'expansion',
    score: 6,
  },
];

// Pre-computed kundalini primary data
const KUNDALINI_DATA = {
  id: 'kundalini-primary',
  name: 'Kundalini Energy',
  namePt: 'Energia Kundalini',
  description: 'The dormant spiritual energy coiled at the base of the spine, often depicted as a serpent. When awakened, it rises through the central channel (sushumna), activating each chakra and leading to spiritual enlightenment.',
  descriptionPt: 'A energia espiritual adormecida enrolada na base da coluna, frequentemente descrita como uma serpente. Quando despertada, sobe pelo canal central (sushumna), ativando cada chakra e levando à iluminação espiritual.',
  element: 'Fire / Prana',
  color: 'Gold / White',
  frequency: '432 Hz',
  location: 'Base of the spine (Muladhara chakra)',
  qualities: ['Transformative', 'Ascending', 'Purifying', 'Liberating', 'Divine'],
  associatedSefirot: ['Malkuth', 'Yesod', 'Chokhmah'],
  associatedChakras: ['Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Ajna', 'Sahasrara'],
  awakeningSigns: [
    'Spontaneous tremors or vibrations',
    'Kundalini Rising sensation',
    'Increased sensitivity to energy',
    'Spontaneous breathing patterns',
    'Emotional releases',
    'Past life memories surfacing',
    'Synchronicities increase',
    'Inner light or sound experiences',
    'Spontaneous yogic postures',
    'Deep meditation states',
  ],
  stages: KUNDALINI_STAGES.length,
  practices: KUNDALINI_PRACTICES.length,
  score: 8,
};

// GET /api/kundalini/v2/data - Get kundalini data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stage = searchParams.get('stage');
    const practice = searchParams.get('practice');
    const type = searchParams.get('type');

    // Return specific kundalini stage by number
    if (stage) {
      const num = parseInt(stage, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid stage number' },
          { status: 400 }
        );
      }
      const stageData = KUNDALINI_STAGES.find((s) => s.number === num);
      if (!stageData) {
        return NextResponse.json(
          { success: false, error: 'Kundalini stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stageData });
    }

    // Return kundalini stage by ID
    if (id) {
      if (id === 'stages') {
        return NextResponse.json({ success: true, data: KUNDALINI_STAGES });
      }
      const stageData = KUNDALINI_STAGES.find((s) => s.id === id);
      if (stageData) {
        return NextResponse.json({ success: true, data: stageData });
      }
      // Check practices
      const practiceData = KUNDALINI_PRACTICES.find((p) => p.id === id);
      if (practiceData) {
        return NextResponse.json({ success: true, data: practiceData });
      }
      // Check if primary data
      if (id === 'kundalini-primary' || id === 'primary') {
        return NextResponse.json({ success: true, data: KUNDALINI_DATA });
      }
      return NextResponse.json(
        { success: false, error: 'Kundalini data not found' },
        { status: 404 }
      );
    }

    // Return specific practice by ID
    if (practice) {
      const practiceData = KUNDALINI_PRACTICES.find((p) => p.id === practice);
      if (!practiceData) {
        return NextResponse.json(
          { success: false, error: 'Practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practiceData });
    }

    // Return all kundalini practices
    if (type === 'practices') {
      return NextResponse.json({ success: true, data: KUNDALINI_PRACTICES });
    }

    // Return all kundalini stages
    if (type === 'stages') {
      return NextResponse.json({ success: true, data: KUNDALINI_STAGES });
    }

    // Default: return all kundalini data with stages and practices
    return NextResponse.json({
      success: true,
      data: {
        kundalini: KUNDALINI_DATA,
        stages: KUNDALINI_STAGES,
        practices: KUNDALINI_PRACTICES,
      },
    });
  } catch (error) {
    console.error('Kundalini v2 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}