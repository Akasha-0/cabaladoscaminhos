// ============================================================
// ASCENSION DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for ascension v2 data access
// - Retrieve all ascension paths and stages
// - Retrieve ascension practices and techniques
// - Get specific ascension path by ID or number
// - Ascension evolution stages and states
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface AscensionPath {
  id: string;
  number: number;
  name: string;
  name_pt: string;
  name_he: string;
  description: string;
  description_pt: string;
  energy: string;
  attributes: string[];
  practices: string[];
  correspondences: {
    element?: string;
    sefirah?: string;
    planet?: string;
  };
  chakra?: string;
  frequency?: string | number;
}

interface AscensionStage {
  id: string;
  number: number;
  name: string;
  name_pt: string;
  description: string;
  description_pt: string;
  characteristics: string[];
  symptoms: string[];
  practices: string[];
  duration: string;
  warnings: string[];
}

interface AscensionPractice {
  id: string;
  name: string;
  name_pt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  description: string;
  description_pt: string;
  steps: string[];
  duration: string;
  prerequisites: string[];
  benefits: string[];
}

interface AscensionState {
  id: string;
  name: string;
  name_pt: string;
  description: string;
  description_pt: string;
  frequency: number;
  attributes: string[];
  signs: string[];
}

interface AscensionConfiguration {
  key: string;
  value: string;
  updatedAt: string;
}

// Pre-computed ascension paths data
const ASCENSION_PATHS: AscensionPath[] = [
  {
    id: 'asc-v2-1',
    number: 1,
    name: 'The Path of Divine Light',
    name_pt: 'O Caminho da Luz Divina',
    name_he: 'Or ChOR',
    description: 'The first steps on the ascension journey, marked by initial spiritual awakening and the first rays of divine illumination.',
    description_pt: 'Os primeiros passos na jornada de ascensão, marcados pelo despertar espiritual inicial e as primeiras rajadas de iluminação divina.',
    energy: 'light',
    attributes: ['awakening', 'illumination', 'clarity'],
    practices: ['meditation', 'prayer', 'light visualization'],
    correspondences: { element: 'fire', sefirah: 'Keter' },
    chakra: 'crown',
    frequency: '963',
  },
  {
    id: 'asc-v2-2',
    number: 2,
    name: 'The Path of Wisdom',
    name_pt: 'O Caminho da Sabedoria',
    name_he: 'Chochmah',
    description: 'Developing inner wisdom and understanding through contemplation and study of sacred teachings.',
    description_pt: 'Desenvolvendo sabedoria interior e compreensão através da contemplação e estudo dos ensinamentos sagrados.',
    energy: 'wisdom',
    attributes: ['knowledge', 'insight', 'discernment'],
    practices: ['study', 'contemplation', 'teaching'],
    correspondences: { planet: 'Mercury', sefirah: 'Chochmah' },
    chakra: 'thirdEye',
    frequency: '528',
  },
  {
    id: 'asc-v2-3',
    number: 3,
    name: 'The Path of Transformation',
    name_pt: 'O Caminho da Transformação',
    name_he: 'Tikkun',
    description: 'The process of spiritual refinement and transformation of lower nature into higher consciousness.',
    description_pt: 'O processo de refinamento espiritual e transformação da natureza inferior em consciência superior.',
    energy: 'transformation',
    attributes: ['transmutation', 'growth', 'evolution'],
    practices: ['shadow work', 'inner work', 'ritual'],
    correspondences: { element: 'water', sefirah: 'Tiferet' },
    chakra: 'heart',
    frequency: '639',
  },
  {
    id: 'asc-v2-4',
    number: 4,
    name: 'The Path of Balance',
    name_pt: 'O Caminho do Equilíbrio',
    name_he: 'Tiferet',
    description: 'Finding harmony between opposing forces and integrating all aspects of being.',
    description_pt: 'Encontrando harmonia entre forças opostas e integrando todos os aspectos do ser.',
    energy: 'harmony',
    attributes: ['balance', 'integration', 'wholeness'],
    practices: ['breathwork', 'centering', 'integration work'],
    correspondences: { element: 'air', sefirah: 'Tiferet' },
    chakra: 'heart',
    frequency: '432',
  },
  {
    id: 'asc-v2-5',
    number: 5,
    name: 'The Path of Power',
    name_pt: 'O Caminho do Poder',
    name_he: 'Gevurah',
    description: 'Cultivating spiritual strength, discipline, and the power to overcome obstacles.',
    description_pt: 'Cultivando força espiritual, disciplina e poder para superar obstáculos.',
    energy: 'power',
    attributes: ['strength', 'discipline', 'courage'],
    practices: ['austerity', 'martial practice', 'energy work'],
    correspondences: { planet: 'Mars', sefirah: 'Gevurah' },
    chakra: 'solarPlexus',
    frequency: '396',
  },
  {
    id: 'asc-v2-6',
    number: 6,
    name: 'The Path of Love',
    name_pt: 'O Caminho do Amor',
    name_he: 'Chesed',
    description: 'Opening the heart to unconditional love and compassionate service to all beings.',
    description_pt: 'Abrindo o coração ao amor incondicional e serviço compassivo a todos os seres.',
    energy: 'love',
    attributes: ['compassion', 'devotion', 'service'],
    practices: ['loving-kindness', 'service', 'heart meditation'],
    correspondences: { planet: 'Jupiter', sefirah: 'Chesed' },
    chakra: 'heart',
    frequency: '528',
  },
  {
    id: 'asc-v2-7',
    number: 7,
    name: 'The Path of Victory',
    name_pt: 'O Caminho da Vitória',
    name_he: 'Netzach',
    description: 'Overcoming obstacles and achieving spiritual victory through perseverance and divine assistance.',
    description_pt: 'Superando obstáculos e alcançando vitória espiritual através da perseverança e assistência divina.',
    energy: 'victory',
    attributes: ['perseverance', 'endurance', 'triumph'],
    practices: ['affirmation', 'visualization', 'ritual'],
    correspondences: { planet: 'Venus', sefirah: 'Netzach' },
    chakra: 'throat',
    frequency: '741',
  },
  {
    id: 'asc-v2-8',
    number: 8,
    name: 'The Path of Foundation',
    name_pt: 'O Caminho da Fundação',
    name_he: 'Yesod',
    description: 'Building a stable foundation for spiritual practice through grounding and practical application.',
    description_pt: 'Construindo uma base estável para a prática espiritual através do enraizamento e aplicação prática.',
    energy: 'foundation',
    attributes: ['stability', 'grounding', 'structure'],
    practices: ['grounding', 'ritual work', 'manifestation'],
    correspondences: { planet: 'Moon', sefirah: 'Yesod' },
    chakra: 'sacral',
    frequency: '417',
  },
  {
    id: 'asc-v2-9',
    number: 9,
    name: 'The Path of Sovereignty',
    name_pt: 'O Caminho da Soberania',
    name_he: 'Malkuth',
    description: 'Integrating spiritual wisdom into daily life and becoming a conscious co-creator of reality.',
    description_pt: 'Integrando sabedoria espiritual na vida diária e tornando-se um co-criador consciente da realidade.',
    energy: 'sovereignty',
    attributes: ['manifestation', 'abundance', 'embodiment'],
    practices: ['grounding', 'ritual', 'practical magic'],
    correspondences: { element: 'earth', sefirah: 'Malkuth' },
    chakra: 'root',
    frequency: '174',
  },
  {
    id: 'asc-v2-10',
    number: 10,
    name: 'The Path of Crown',
    name_pt: 'O Caminho da Coroa',
    name_he: 'Keter',
    description: 'Union with the divine crown and realization of the highest states of consciousness.',
    description_pt: 'União com a coroa divina e realização dos mais altos estados de consciência.',
    energy: 'crown',
    attributes: ['unity', 'transcendence', 'enlightenment'],
    practices: ['deep meditation', 'prayer', 'contemplation'],
    correspondences: { planet: 'Sun', sefirah: 'Keter' },
    chakra: 'crown',
    frequency: '963',
  },
];

// Pre-computed ascension stages data
const ASCENSION_STAGES: AscensionStage[] = [
  {
    id: 'stage-1',
    number: 1,
    name: 'Awakening',
    name_pt: 'Despertar',
    description: 'Initial awakening to spiritual reality and the first conscious contact with higher consciousness.',
    description_pt: 'Despertar inicial para a realidade espiritual e o primeiro contato consciente com a consciência superior.',
    characteristics: ['increased intuition', 'spiritual curiosity', 'questioning beliefs'],
    symptoms: ['sleep disturbances', 'energetic sensations', 'emotional volatility'],
    practices: ['meditation', 'journaling', 'nature walks'],
    duration: '3-12 months',
    warnings: ['avoid spiritual bypass', 'ground regularly'],
  },
  {
    id: 'stage-2',
    number: 2,
    name: 'Purification',
    name_pt: 'Purificação',
    description: 'Active purification of physical, emotional, and mental bodies to prepare for higher frequencies.',
    description_pt: 'Purificação ativa dos corpos físico, emocional e mental para preparar para frequências mais elevadas.',
    characteristics: ['clearing dense energies', 'releasing old patterns', 'healing traumas'],
    symptoms: ['intense emotions', 'physical detox', 'life changes'],
    practices: ['breathwork', 'shadow work', 'energy clearing'],
    duration: '6-24 months',
    warnings: ['seek support', 'avoid numbing behaviors'],
  },
  {
    id: 'stage-3',
    number: 3,
    name: 'Integration',
    name_pt: 'Integração',
    description: 'Integrating spiritual experiences and wisdom into daily life and identity.',
    description_pt: 'Integrando experiências espirituais e sabedoria na vida diária e identidade.',
    characteristics: ['embodying truths', 'living authentically', 'aligned action'],
    symptoms: ['identity shifts', 'relationship changes', 'new purpose'],
    practices: ['embodiment practices', 'service', 'conscious living'],
    duration: '12-36 months',
    warnings: ['patience with integration', 'allow identity fluidness'],
  },
  {
    id: 'stage-4',
    number: 4,
    name: 'Transcendence',
    name_pt: 'Transcendência',
    description: 'Expansion beyond ego identification into higher states of being and consciousness.',
    description_pt: 'Expansão além da identificação do ego em estados mais elevados de ser e consciência.',
    characteristics: ['ego dissolution', 'unity awareness', 'non-local perception'],
    symptoms: ['time-space shifts', 'expanded states', 'diminished fear'],
    practices: ['non-dual meditation', 'surrender practices', 'presence'],
    duration: 'ongoing',
    warnings: ['integration is key', 'avoid spiritual ambition'],
  },
  {
    id: 'stage-5',
    number: 5,
    name: 'Embodiment',
    name_pt: 'Encarnação',
    description: 'Fully embodying divine consciousness in physical form while maintaining world engagement.',
    description_pt: 'Encarnando plenamente a consciência divina em forma física enquanto mantém engajamento com o mundo.',
    characteristics: ['divinehuman integration', 'conscious creation', 'serve from wholeness'],
    symptoms: ['spontaneous healing', 'manifestation ease', 'universal sync'],
    practices: ['conscious creation', 'teaching', 'sacred service'],
    duration: 'lifelong journey',
    warnings: ['humility essential', 'avoid guru complex'],
  },
];

// Pre-computed ascension practices data
const ASCENSION_PRACTICES: AscensionPractice[] = [
  {
    id: 'practice-light-meditation',
    name: 'Light Meditation',
    name_pt: 'Meditação de Luz',
    category: 'meditation',
    difficulty: 'beginner',
    description: 'A foundational meditation practice for working with divine light energy and spiritual illumination.',
    description_pt: 'Uma prática meditativa fundamental para trabalhar com energia de luz divina e iluminação espiritual.',
    steps: ['Find quiet space', 'Close eyes, breathe deeply', 'Visualize golden light at crown', 'Allow light to fill body', 'Rest in light presence'],
    duration: '15-30 minutes',
    prerequisites: [],
    benefits: ['spiritual awakening', 'energy alignment', 'clarity'],
  },
  {
    id: 'practice-shadow-work',
    name: 'Shadow Work',
    name_pt: 'Trabalho com a Sombra',
    category: 'inner-work',
    difficulty: 'intermediate',
    description: 'Deep inner work practice for integrating shadow aspects and transforming unconscious patterns.',
    description_pt: 'Prática profunda de trabalho interior para integrar aspectos sombrios e transformar padrões inconscientes.',
    steps: ['Create safe space', 'Identify trigger situations', 'Observe without judgment', 'Feel the shadow emotion fully', 'Integrate with self-compassion'],
    duration: '30-60 minutes',
    prerequisites: ['basic meditation practice', 'emotional stability'],
    benefits: ['shadow integration', 'personal freedom', 'wholeness'],
  },
  {
    id: 'practice-energy-clearing',
    name: 'Energy Clearing',
    name_pt: 'Limpeza Energética',
    category: 'energy-work',
    difficulty: 'intermediate',
    description: 'Practice for clearing dense energies and maintaining energetic hygiene on all bodies.',
    description_pt: 'Prática para limpar energias densas e manter higiene energética em todos os corpos.',
    steps: ['Set intention for clearing', 'Call on divine light', 'Scan energy field', 'Direct light to dense areas', 'Seal field with protection'],
    duration: '15-20 minutes',
    prerequisites: ['light meditation foundation'],
    benefits: ['energetic hygiene', 'frequency elevation', 'protection'],
  },
  {
    id: 'practice-breathwork',
    name: 'Ascension Breathwork',
    name_pt: 'Respiração para Ascensão',
    category: 'breathwork',
    difficulty: 'advanced',
    description: 'Advanced breathing technique for accelerating ascension and clearing energetic blocks.',
    description_pt: 'Técnica avançada de respiração para acelerar ascensão e limpar bloqueios energéticos.',
    steps: ['Sit comfortably', 'Deep belly breathing', 'Hold at top', 'Release fully', 'Add visualization'],
    duration: '20-45 minutes',
    prerequisites: ['energy clearing practice', 'grounding practice'],
    benefits: ['kundalini activation', 'cellular transformation', 'deep clearing'],
  },
  {
    id: 'practice-connection',
    name: 'Divine Connection',
    name_pt: 'Conexão Divina',
    category: 'devotion',
    difficulty: 'beginner',
    description: 'Practice for establishing and deepening connection with divine source and higher guidance.',
    description_pt: 'Prática para estabelecer e aprofundar conexão com fonte divina e orientação superior.',
    steps: ['Center in silence', 'Call divine presence', 'Open heart', 'Receive guidance', 'Integrate message'],
    duration: '20-30 minutes',
    prerequisites: [],
    benefits: ['divine connection', 'guidance access', 'love expansion'],
  },
];

// Pre-computed ascension states data
const ASCENSION_STATES: AscensionState[] = [
  {
    id: 'state-initiate',
    name: 'Initiate State',
    name_pt: 'Estado de Iniciante',
    description: 'The initial state of spiritual awakening and first steps on the ascension path.',
    description_pt: 'O estado inicial de despertar espiritual e primeiros passos no caminho de ascensão.',
    frequency: 528,
    attributes: ['curiosity', 'receptivity', 'seeking'],
    signs: ['spiritual interest', 'life dissatisfaction', 'search for meaning'],
  },
  {
    id: 'state-practitioner',
    name: 'Practitioner State',
    name_pt: 'Estado de Praticante',
    description: 'Active spiritual practice with regular discipline and deepening understanding.',
    description_pt: 'Prática espiritual ativa com disciplina regular e compreensão aprofundada.',
    frequency: 639,
    attributes: ['dedication', 'discernment', 'inner work'],
    signs: ['regular practice', 'transformed perspectives', 'life changes'],
  },
  {
    id: 'state-devotee',
    name: 'Devotee State',
    name_pt: 'Estado de Devoto',
    description: 'Deep devotion to spiritual path with consistent practice and surrender.',
    description_pt: 'Devoção profunda ao caminho espiritual com prática consistente e entrega.',
    frequency: 741,
    attributes: ['devotion', 'surrender', 'service'],
    signs: ['ego softening', 'increased love', 'service orientation'],
  },
  {
    id: 'state-master',
    name: 'Master State',
    name_pt: 'Estado de Mestre',
    description: 'Mastery of ascension principles with ability to guide others and create freely.',
    description_pt: 'Domínio dos princípios de ascensão com capacidade de guiar outros e criar livremente.',
    frequency: 852,
    attributes: ['wisdom', 'embodiment', 'creation'],
    signs: ['spontaneous manifestation', 'teaching ability', 'unity consciousness'],
  },
];

// Pre-computed configuration data
const ASCENSION_CONFIG: AscensionConfiguration[] = [
  { key: 'current-era', value: 'Age of Aquarius', updatedAt: '2024-01-01' },
  { key: 'ascension-rate', value: 'accelerating', updatedAt: '2024-01-01' },
  { key: 'grid-activation', value: '85%', updatedAt: '2024-01-01' },
];

// Primary ascension data structure
const ASCENSION_DATA = {
  version: '2.0',
  name: 'Ascension V2 API',
  description: 'Comprehensive ascension data for spiritual evolution and awakening',
  totalPaths: ASCENSION_PATHS.length,
  totalStages: ASCENSION_STAGES.length,
  totalPractices: ASCENSION_PRACTICES.length,
  totalStates: ASCENSION_STATES.length,
};

// GET /api/ascension/v2/data - Get ascension v2 data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const path = searchParams.get('path');
    const stage = searchParams.get('stage');
    const practice = searchParams.get('practice');
    const state = searchParams.get('state');

    // Return specific ascension path by number
    if (path) {
      const num = parseInt(path, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid path number' },
          { status: 400 }
        );
      }
      const pathData = ASCENSION_PATHS.find((p) => p.number === num);
      if (!pathData) {
        return NextResponse.json(
          { success: false, error: 'Ascension path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: pathData });
    }

    // Return ascension stage by number
    if (stage) {
      const num = parseInt(stage, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid stage number' },
          { status: 400 }
        );
      }
      const stageData = ASCENSION_STAGES.find((s) => s.number === num);
      if (!stageData) {
        return NextResponse.json(
          { success: false, error: 'Ascension stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stageData });
    }

    // Return ascension state by ID
    if (state) {
      const stateData = ASCENSION_STATES.find((s) => s.id === state);
      if (!stateData) {
        return NextResponse.json(
          { success: false, error: 'Ascension state not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: stateData });
    }

    // Return specific ascension data by ID
    if (id) {
      // Check paths
      const pathData = ASCENSION_PATHS.find((p) => p.id === id);
      if (pathData) {
        return NextResponse.json({ success: true, data: pathData });
      }
      // Check stages
      const stageData = ASCENSION_STAGES.find((s) => s.id === id);
      if (stageData) {
        return NextResponse.json({ success: true, data: stageData });
      }
      // Check practices
      const practiceData = ASCENSION_PRACTICES.find((p) => p.id === id);
      if (practiceData) {
        return NextResponse.json({ success: true, data: practiceData });
      }
      // Check states
      const stateData = ASCENSION_STATES.find((s) => s.id === state);
      if (stateData) {
        return NextResponse.json({ success: true, data: stateData });
      }
      // Check if primary data
      if (id === 'ascension-primary' || id === 'primary') {
        return NextResponse.json({ success: true, data: ASCENSION_DATA });
      }
      // Check special IDs
      if (id === 'paths') {
        return NextResponse.json({ success: true, data: ASCENSION_PATHS });
      }
      if (id === 'stages') {
        return NextResponse.json({ success: true, data: ASCENSION_STAGES });
      }
      if (id === 'practices') {
        return NextResponse.json({ success: true, data: ASCENSION_PRACTICES });
      }
      if (id === 'states') {
        return NextResponse.json({ success: true, data: ASCENSION_STATES });
      }
      return NextResponse.json(
        { success: false, error: 'Ascension data not found' },
        { status: 404 }
      );
    }

    // Return specific practice by ID
    if (practice) {
      const practiceData = ASCENSION_PRACTICES.find((p) => p.id === practice);
      if (!practiceData) {
        return NextResponse.json(
          { success: false, error: 'Practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practiceData });
    }

    // Return all ascension paths
    if (type === 'paths') {
      return NextResponse.json({ success: true, data: ASCENSION_PATHS });
    }

    // Return all ascension stages
    if (type === 'stages') {
      return NextResponse.json({ success: true, data: ASCENSION_STAGES });
    }

    // Return all ascension practices
    if (type === 'practices') {
      return NextResponse.json({ success: true, data: ASCENSION_PRACTICES });
    }

    // Return all ascension states
    if (type === 'states') {
      return NextResponse.json({ success: true, data: ASCENSION_STATES });
    }

    // Return configurations
    if (type === 'config') {
      return NextResponse.json({ success: true, data: ASCENSION_CONFIG });
    }

    // Return categories with counts
    if (type === 'categories') {
      return NextResponse.json({
        success: true,
        data: {
          paths: ASCENSION_PATHS.length,
          stages: ASCENSION_STAGES.length,
          practices: ASCENSION_PRACTICES.length,
          states: ASCENSION_STATES.length,
        },
      });
    }

    // Default: return all ascension v2 data
    return NextResponse.json({
      success: true,
      data: {
        ascension: ASCENSION_DATA,
        paths: ASCENSION_PATHS,
        stages: ASCENSION_STAGES,
        practices: ASCENSION_PRACTICES,
        states: ASCENSION_STATES,
        config: ASCENSION_CONFIG,
      },
    });
  } catch (_error) {
    console.error('Ascension v2 API error:', _error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}