// ============================================================
// KUNDALINI API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for kundalini energy data
// - List all kundalini information
// - Get specific kundalini state by ID
// - Get kundalini stages
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface KundaliniStage {
  id: string;
  number: number;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  chakra: string;
  energy: string;
  symptoms: string[];
  practices: string[];
}

interface KundaliniPractice {
  id: string;
  name: string;
  namePt: string;
  type: string;
  description: string;
  descriptionPt: string;
  duration: number;
  difficulty: string;
  benefits: string[];
  precautions: string[];
}

interface KundaliniData {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  element: string;
  color: string;
  frequency: string;
  location: string;
  qualities: string[];
  associatedSefirot: string[];
  associatedChakras: string[];
  awakeningSigns: string[];
  practices: KundaliniPractice[];
}

const kundaliniStages: KundaliniStage[] = [
  {
    id: 'dormant',
    number: 0,
    name: 'Dormant',
    namePt: 'Adormecida',
    description: 'Kundalini energy lies coiled at the base of the spine in Muladhara chakra, waiting to be awakened.',
    descriptionPt: 'A energia kundalini permanece enrolada na base da coluna no chakra Muladhara, aguardando o despertar.',
    chakra: 'Muladhara',
    energy: 'Potential',
    symptoms: ['Dormancy', 'Blocked energy', 'Instinctive responses'],
    practices: ['Breath work', 'Grounding', 'Foundation yoga'],
  },
  {
    id: 'awakening',
    number: 1,
    name: 'Awakening',
    namePt: 'Despertar',
    description: 'Initial activation of kundalini energy, beginning its journey upward through the sushumna nadi.',
    descriptionPt: 'Ativação inicial da energia kundalini, iniciando sua jornada ascendente pelo nadi sushumna.',
    chakra: 'Muladhara-Svadhisthana',
    energy: 'Rising',
    symptoms: ['Tingling', 'Heat at base of spine', 'Dreams of serpents', 'Increased vitality'],
    practices: ['Kapalabhati', 'Bandhas', 'Chakra meditation'],
  },
  {
    id: 'purification',
    number: 2,
    name: 'Purification',
    namePt: 'Purificação',
    description: 'Kundalini purifies each chakra as it rises, burning through energetic blockages and past traumas.',
    descriptionPt: 'Kundalini purifica cada chakra enquanto sobe, queimando bloqueios energéticos e traumas passados.',
    chakra: 'Manipura',
    energy: 'Transforming',
    symptoms: ['Emotional release', 'Physical heat', 'Past memories surfacing', 'Inner fire'],
    practices: ['Pranayama', 'Meditation', 'Emotional processing'],
  },
  {
    id: 'expansion',
    number: 3,
    name: 'Expansion',
    namePt: 'Expansão',
    description: 'Energy reaches the heart center, opening pathways to compassion, love, and spiritual connection.',
    descriptionPt: 'Energia alcança o centro do coração, abrindo caminhos para compaixão, amor e conexão espiritual.',
    chakra: 'Anahata',
    energy: 'Expanding',
    symptoms: ['Heart opening', 'Unconditional love', 'Deep empathy', 'Synchronicities'],
    practices: ['Heart-centered meditation', 'Loving-kindness', 'Service'],
  },
  {
    id: 'illumination',
    number: 4,
    name: 'Illumination',
    namePt: 'Iluminação',
    description: 'Energy reaches the third eye, awakening inner vision, intuition, and higher perception.',
    descriptionPt: 'Energia alcança o terceiro olho, despertando visão interior, intuição e percepção superior.',
    chakra: 'Ajna',
    energy: 'Enlightening',
    symptoms: ['Inner light', 'Clairvoyance', 'Intuitive insights', 'Inner sounds'],
    practices: ['Ajna meditation', ' Trataka', 'Mantra recitation'],
  },
  {
    id: 'union',
    number: 5,
    name: 'Union',
    namePt: 'União',
    description: 'Kundalini reaches the crown, merging with divine consciousness. Individual self dissolves into universal awareness.',
    descriptionPt: 'Kundalini alcança a coroa, fundindo-se com a consciência divina. O eu individual se dissolve na consciência universal.',
    chakra: 'Sahasrara',
    energy: 'Transcendent',
    symptoms: ['Enlightenment', 'Pure awareness', 'Bliss states', 'Non-dual consciousness'],
    practices: ['Sahaja meditation', 'Silence', 'Surrender'],
  },
  {
    id: 'integration',
    number: 6,
    name: 'Integration',
    namePt: 'Integração',
    description: 'After the peak experience, kundalini energy settles, integrating divine awareness into daily life and embodiment.',
    descriptionPt: 'Após a experiência máxima, a energia kundalini se acalma, integrando a consciência divina na vida cotidiana e na corpificação.',
    chakra: 'All chakras',
    energy: 'Integrating',
    symptoms: ['Grounded wisdom', 'Effortless presence', 'Embodied spirituality', 'Spontaneous right action'],
    practices: ['Grounding practices', 'Embodiment work', 'Daily spiritual practice'],
  },
];

const kundaliniPractices: KundaliniPractice[] = [
  {
    id: 'breath-of-fire',
    name: 'Breath of Fire',
    namePt: 'Respiração de Fogo',
    type: 'pranayama',
    description: 'Rhythmic breathing technique that generates heat and activates kundalini energy.',
    descriptionPt: 'Técnica de respiração rítmica que gera calor e ativa a energia kundalini.',
    duration: 3,
    difficulty: 'intermediate',
    benefits: ['Energizes the nervous system', 'Purifies blood', 'Activates kundalini'],
    precautions: ['Avoid during pregnancy', 'Practice on empty stomach', 'Start slowly'],
  },
  {
    id: 'mulabandha',
    name: 'Mulabandha',
    namePt: 'Mulabandha',
    type: 'bandha',
    description: 'Root lock that seals and directs pranic energy upward through the central channel.',
    descriptionPt: 'Bloqueio raiz que sella e direciona a energia prânica para cima através do canal central.',
    duration: 5,
    difficulty: 'advanced',
    benefits: ['Grounds energy', 'Activates kundalini', 'Strengthens pelvic floor'],
    precautions: ['Build gradually', 'Avoid during menstruation', 'Practice with guidance'],
  },
  {
    id: 'sat-kriya',
    name: 'Sat Kriya',
    namePt: 'Sat Kriya',
    type: 'kriya',
    description: 'Powerful kundalini yoga kriya that works on all energy centers simultaneously.',
    descriptionPt: 'Kriya poderoso do yoga kundalini que trabalha em todos os centros energéticos simultaneamente.',
    duration: 3,
    difficulty: 'intermediate',
    benefits: ['Strengthens navel center', 'Activates all chakras', 'Calms the mind'],
    precautions: ['Pregnant women should practice gently', 'May be intense for beginners'],
  },
  {
    id: 'chakra-meditation',
    name: 'Chakra Meditation',
    namePt: 'Meditação dos Chakras',
    type: 'meditation',
    description: 'Guided meditation through the seven main chakras for kundalini awakening.',
    descriptionPt: 'Meditação guiada através dos sete principais chakras para o despertar kundalini.',
    duration: 31,
    difficulty: 'beginner',
    benefits: ['Opens energy channels', 'Balances chakras', 'Prepares path for kundalini'],
    precautions: ['Proceed slowly', 'Stop if overwhelming', 'Ground afterwards'],
  },
  {
    id: 'spinal-breath',
    name: 'Spinal Breath',
    namePt: 'Respiração Espinhal',
    type: 'pranayama',
    description: 'Deep breathing that draws energy up the spine to awaken kundalini.',
    descriptionPt: 'Respiração profunda que atrai energia pela coluna para despertar a kundalini.',
    duration: 11,
    difficulty: 'beginner',
    benefits: ['Opens sushumna nadi', 'Builds pranic energy', 'Calms nervous system'],
    precautions: ['Practice in comfortable position', 'Keep spine straight', 'Breathe naturally'],
  },
];

const kundaliniData: KundaliniData = {
  id: 'kundalini-primary',
  name: 'Kundalini Energy',
  namePt: 'Energia Kundalini',
  description: 'The dormant spiritual energy coiled at the base of the spine, often depicted as a serpent. When awakened, it rises through the central channel (sushumna), activating each chakra and leading to spiritual enlightenment.',
  descriptionPt: 'A energia espiritual adormecida enrolada na base da coluna, frequentemente depicted como uma serpente. Quando despertada, sobe pelo canal central (sushumna), ativando cada chakra e levando à iluminação espiritual.',
  element: 'Fire / Prana',
  color: 'Gold / White',
  frequency: '432 Hz (associated)',
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
  practices: kundaliniPractices,
};

// GET /api/kundalini/data - Get kundalini data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stage = searchParams.get('stage');
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
      const stageData = kundaliniStages.find((s) => s.number === num);
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
        return NextResponse.json({ success: true, data: kundaliniStages });
      }
      const stageData = kundaliniStages.find((s) => s.id === id);
      if (stageData) {
        return NextResponse.json({ success: true, data: stageData });
      }
      // Check practices
      const practiceData = kundaliniPractices.find((p) => p.id === id);
      if (practiceData) {
        return NextResponse.json({ success: true, data: practiceData });
      }
      return NextResponse.json(
        { success: false, error: 'Kundalini data not found' },
        { status: 404 }
      );
    }

    // Return by type
    if (type) {
      switch (type) {
        case 'stages':
          return NextResponse.json({ success: true, data: kundaliniStages });
        case 'practices':
          return NextResponse.json({ success: true, data: kundaliniPractices });
        case 'overview':
          return NextResponse.json({
            success: true,
            data: {
              overview: kundaliniData,
              stages: kundaliniStages,
              practices: kundaliniPractices,
            },
          });
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type parameter' },
            { status: 400 }
          );
      }
    }

    // Default — return all kundalini data
    return NextResponse.json({
      success: true,
      data: {
        overview: kundaliniData,
        stages: kundaliniStages,
        practices: kundaliniPractices,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch kundalini data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
