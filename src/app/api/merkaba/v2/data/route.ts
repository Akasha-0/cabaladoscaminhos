// ============================================================
// MERKABA DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Merkaba data access
// - Retrieve all Merkaba information
// - Merkaba activation techniques and meditation practices
// - Sacred geometry and lightbody activation data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface MerkabaAspect {
  id: string;
  name: string;
  namePt: string;
  description: string;
  geometry: string;
  chakra: string;
  element: string;
  properties: string[];
}

interface MerkabaPractice {
  id: string;
  name: string;
  namePt: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  duration: string;
  steps: string[];
  benefits: string[];
  contraindications: string[];
}

interface MerkabaMeditation {
  id: string;
  name: string;
  namePt: string;
  phase: number;
  breathingPattern: string;
  visualization: string;
  affirmation: string;
  sacredGeometry: string[];
}

interface LightbodyActivation {
  id: string;
  stage: number;
  name: string;
  namePt: string;
  description: string;
  color: string;
  frequency: string;
  activationMethod: string;
}

// Pre-computed Merkaba aspects
const MERKABA_ASPECTS: MerkabaAspect[] = [
  {
    id: 'star-tetrahedron',
    name: 'Star Tetrahedron',
    namePt: 'Estrela Tetraédrica',
    description: 'Two interpenetrating tetrahedrons forming a perfect star shape, the geometric foundation of the Merkaba',
    geometry: 'Star Tetrahedron (Merkaba)',
    chakra: 'All Primary Chakras',
    element: 'Light / Akasha',
    properties: ['Interdimensional travel', 'Light body activation', 'Spiritual ascension', 'Higher consciousness connection'],
  },
  {
    id: 'merkaba-field',
    name: 'Merkaba Field',
    namePt: 'Campo Merkaba',
    description: 'The rotating field of light that surrounds the body when the Merkaba is activated',
    geometry: 'Counter-rotating fields',
    chakra: 'Crown and Soul Star',
    element: 'Prana / Life Force',
    properties: ['Protection', 'Ascension vehicle', 'Dimensional shift', 'Healing amplification'],
  },
  {
    id: 'celestial-body',
    name: 'Celestial Body',
    namePt: 'Corpo Celestial',
    description: 'The light body that emerges from sustained Merkaba meditation practice',
    geometry: 'Spiral energy matrix',
    chakra: 'Soul Star and beyond',
    element: 'Celestial Light',
    properties: ['Immortality', 'Omnipresence', 'Transcendence', 'Unity consciousness'],
  },
  {
    id: 'sophia',
    name: 'Sophia',
    namePt: 'Sofia',
    description: 'The feminine aspect of Merkaba, representing wisdom and the Divine Mother energy',
    geometry: 'Descending tetrahedron',
    chakra: 'Heart and Sacred Heart',
    element: 'Water / Wisdom',
    properties: ['Divine wisdom', 'Compassion', 'Nurturing', 'Intuition'],
  },
  {
    id: 'melchizedek',
    name: 'Melchizedek',
    namePt: 'Melquisedeque',
    description: 'The masculine aspect of Merkaba, representing power and the Divine Father energy',
    geometry: 'Ascending tetrahedron',
    chakra: 'Will and Crown',
    element: 'Fire / Power',
    properties: ['Divine authority', 'Strength', 'Service', 'Discernment'],
  },
];

// Pre-computed Merkaba practices
const MERKABA_PRACTICES: MerkabaPractice[] = [
  {
    id: 'breath-of-fire',
    name: 'Breath of Fire Activation',
    namePt: 'Ativação da Respiração de Fogo',
    level: 'beginner',
    duration: '15-30 minutes',
    steps: [
      'Sit in a comfortable cross-legged position',
      'Close your eyes and breathe deeply through the nose',
      'Begin rhythmic Breath of Fire breathing (rapid, equal inhale/exhale through nose)',
      'Visualize energy rising from the base of the spine',
      'Continue for 5-15 minutes',
      'Gradually slow down and return to normal breathing',
    ],
    benefits: ['Purifies nadis (energy channels)', 'Activates kundalini energy', 'Prepares the body for Merkaba activation', 'Increases pranic energy'],
    contraindications: ['Pregnancy', 'High blood pressure', 'Heart conditions', 'Epilepsy'],
  },
  {
    id: 'tetrahedron-visualization',
    name: 'Tetrahedron Visualization',
    namePt: 'Visualização do Tetraedro',
    level: 'beginner',
    duration: '20-30 minutes',
    steps: [
      'Enter a meditative state',
      'Visualize a large red tetrahedron around your body, points up and down',
      'See the male tetrahedron (points up) emanating golden light',
      'See the female tetrahedron (points down) emanating silver-blue light',
      'Hold this visualization for 10-15 minutes',
      'Feel the two tetrahedrons interpenetrating your body',
    ],
    benefits: ['Forms the geometric foundation', 'Balances masculine and feminine energies', 'Centers awareness', 'Prepares for rotation'],
    contraindications: ['Dissociation tendencies', 'Severe anxiety'],
  },
  {
    id: 'counter-rotation',
    name: 'Counter-Rotation Practice',
    namePt: 'Prática de Contrarrotação',
    level: 'intermediate',
    duration: '30-45 minutes',
    steps: [
      'Complete the tetrahedron visualization',
      'Begin rotating the upward-pointing tetrahedron clockwise',
      'Begin rotating the downward-pointing tetrahedron counter-clockwise',
      'Start slowly and gradually increase speed',
      'Imagine the two rotations creating a field of light around you',
      'Allow the field to expand to your maximum auric field',
      'Hold for as long as comfortable, then slowly diminish',
    ],
    benefits: ['Activates Merkaba field', 'Increases spiritual vibration', 'Opens dimensional doorways', 'Strengthens light body'],
    contraindications: ['Unstable mental state', 'Recent trauma', 'Drug or alcohol use'],
  },
  {
    id: 'star-breathing',
    name: 'Star Breath Meditation',
    namePt: 'Meditação da Respiração Estelar',
    level: 'intermediate',
    duration: '30-45 minutes',
    steps: [
      'Sit in a comfortable position with spine straight',
      'Visualize the Star Tetrahedron around your body',
      'Inhale: Rotate both tetrahedrons outward while expanding your breath',
      'Exhale: Rotate both tetrahedrons inward while contracting',
      'Repeat for 20-30 breath cycles',
      'With each breath, feel the Merkaba field intensifying',
      'End with gratitude and setting of intentions',
    ],
    benefits: ['Deepens Merkaba activation', 'Synchronizes breath with energy', 'Clears energy blockages', 'Opens heart center'],
    contraindications: ['Respiratory conditions', 'Asthma'],
  },
  {
    id: '13-breath-cycle',
    name: 'Thirteen Breath Activation',
    namePt: 'Ativação dos Treze Sopros',
    level: 'advanced',
    duration: '45-60 minutes',
    steps: [
      'Find a quiet, sacred space',
      'Enter deep meditation',
      'Perform 13 breaths with the following visualization:',
      'Breath 1-3: Build the red tetrahedron',
      'Breath 4-6: Build the blue tetrahedron',
      'Breath 7-9: Interpenetrate them into the Star',
      'Breath 10-12: Activate rotation at maximum speed',
      'Breath 13: Reach critical mass and release into the Merkaba state',
    ],
    benefits: ['Complete Merkaba activation', 'Dimensional shifting', 'Past life recall', 'Profound spiritual experiences'],
    contraindications: ['Must have foundation practice', 'Should be supervised initially', 'Mental health conditions'],
  },
];

// Pre-computed Merkaba meditations
const MERKABA_MEDITATIONS: MerkabaMeditation[] = [
  {
    id: 'awakening-meditation',
    name: 'Merkaba Awakening',
    namePt: 'Despertar do Merkaba',
    phase: 1,
    breathingPattern: 'Deep diaphragmatic breathing (4-7-8)',
    visualization: 'Red and blue tetrahedrons forming around the body',
    affirmation: 'I activate my Merkaba field of light and love',
    sacredGeometry: ['Tetrahedron', 'Star Tetrahedron', 'Cube'],
  },
  {
    id: 'spiral-meditation',
    name: 'Sacred Spiral',
    namePt: 'Espiral Sagrada',
    phase: 2,
    breathingPattern: 'Rhythmic equal breathing (4-4)',
    visualization: 'Counter-rotating spirals emanating from the heart center',
    affirmation: 'My light spirals outward, touching all of creation',
    sacredGeometry: ['Spiral', 'Golden Ratio', 'Fibonacci'],
  },
  {
    id: 'chakra-merging',
    name: 'Chakra Merkaba Merge',
    namePt: 'Fusão dos Chakras com Merkaba',
    phase: 3,
    breathingPattern: 'Segmented breathing (inhale into each chakra)',
    visualization: 'Each chakra activating and connecting to the Merkaba geometry',
    affirmation: 'Every cell of my being radiates divine light',
    sacredGeometry: ['Flower of Life', 'Merkaba', 'Sri Yantra'],
  },
  {
    id: 'stellar-activation',
    name: 'Stellar Activation',
    namePt: 'Ativação Estelar',
    phase: 4,
    breathingPattern: 'Pranayama with retention (4-4-4-4)',
    visualization: 'Connecting to stellar energies and distant stars',
    affirmation: 'I am one with the stars and the infinite cosmos',
    sacredGeometry: ['Star', 'Octahedron', 'Icosahedron'],
  },
  {
    id: 'ascension-meditation',
    name: 'Ascension Pathway',
    namePt: 'Caminho da Ascension',
    phase: 5,
    breathingPattern: 'Expanding breath (building to 16 counts)',
    visualization: 'Rising through dimensions, the Merkaba carrying consciousness upward',
    affirmation: 'I ascend in light, I transcend in love, I am free',
    sacredGeometry: ['Merkaba', 'Torus', 'Sri Yantra'],
  },
];

// Pre-computed lightbody activation stages
const LIGHTBODY_ACTIVATIONS: LightbodyActivation[] = [
  {
    id: 'physical-body',
    stage: 1,
    name: 'Physical Body Activation',
    namePt: 'Ativação do Corpo Físico',
    description: 'Awareness and activation of the physical body as a vessel of light',
    color: 'White with rainbow flecks',
    frequency: '528 Hz - DNA repair',
    activationMethod: 'Grounding practices, body awareness, breath work',
  },
  {
    id: 'etheric-body',
    stage: 2,
    name: 'Etheric Body Activation',
    namePt: 'Ativação do Corpo Etérico',
    description: 'Activating the pranic energy body and nadis system',
    color: 'Silver-white',
    frequency: '639 Hz - Heart coherence',
    activationMethod: 'Prana cultivation, breath of fire, energy sensing',
  },
  {
    id: 'emotional-body',
    stage: 3,
    name: 'Emotional Body Activation',
    namePt: 'Ativação do Corpo Emocional',
    description: 'Transmuting emotional body to pure light frequency',
    color: 'Rose gold',
    frequency: '528 Hz + 741 Hz - Transmutation',
    activationMethod: 'Emotional clearing, heart coherence, compassion practices',
  },
  {
    id: 'mental-body',
    stage: 4,
    name: 'Mental Body Activation',
    namePt: 'Ativação do Corpo Mental',
    description: 'Expanding mental body to accommodate higher frequencies',
    color: 'Clear with gold',
    frequency: '768 Hz - Christ consciousness',
    activationMethod: 'Meditation, visualization, higher thought forms',
  },
  {
    id: 'etheric-template',
    stage: 5,
    name: 'Etheric Template Activation',
    namePt: 'Ativação do Template Etérico',
    description: 'Activating the perfect divine blueprint within',
    color: 'Pure white light',
    frequency: '888 Hz - Abundance consciousness',
    activationMethod: 'Sacred geometry work, Merkaba meditation, divine connection',
  },
  {
    id: 'celestial-body',
    stage: 6,
    name: 'Celestial Body Activation',
    namePt: 'Ativação do Corpo Celestial',
    description: 'The body of light that exists in higher dimensions',
    color: 'Translucent gold',
    frequency: '963 Hz - Unity consciousness',
    activationMethod: 'Advanced Merkaba practices, light immersion, cosmic meditation',
  },
  {
    id: 'ketheric-body',
    stage: 7,
    name: 'Ketheric Body Activation',
    namePt: 'Ativação do Corpo Ketherico',
    description: 'The divine crown body connecting to Source',
    color: 'Pure rainbow spectrum',
    frequency: '999 Hz - Divine union',
    activationMethod: 'Surrender, devotion, service, Oneness practices',
  },
];

// Pre-computed sacred geometry data
const SACRED_GEOMETRY = [
  {
    id: 'tetrahedron',
    name: 'Tetrahedron',
    namePt: 'Tetraedro',
    description: 'Four-faced polyhedron, the simplest of the platonic solids',
    vertices: 4,
    faces: 4,
    edges: 6,
    element: 'Fire',
    symbolism: 'Will, power, masculine energy, ascending consciousness',
  },
  {
    id: 'star-tetrahedron',
    name: 'Star Tetrahedron (Merkaba)',
    namePt: 'Estrela Tetraédrica (Merkaba)',
    description: 'Two interpenetrating tetrahedrons creating a 8-pointed star',
    vertices: 8,
    faces: 8,
    edges: 12,
    element: 'Light / Akasha',
    symbolism: 'Balance of masculine and feminine, ascension vehicle, divine union',
  },
  {
    id: 'octahedron',
    name: 'Octahedron',
    namePt: 'Octaedro',
    description: 'Eight-faced polyhedron, the shape of the heart chakra',
    vertices: 6,
    faces: 8,
    edges: 12,
    element: 'Air',
    symbolism: 'Balance, beauty, discrimination, the balanced heart',
  },
];

// GET /api/merkaba/v2/data - Get Merkaba data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const stage = searchParams.get('stage');
    const level = searchParams.get('level');

    // Return single Merkaba aspect by ID
    if (id && type === 'aspect') {
      const aspect = MERKABA_ASPECTS.find((a) => a.id === id);
      if (!aspect) {
        return NextResponse.json(
          { success: false, error: 'Merkaba aspect not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: aspect });
    }

    // Return single practice by ID
    if (id && type === 'practice') {
      const practice = MERKABA_PRACTICES.find((p) => p.id === id);
      if (!practice) {
        return NextResponse.json(
          { success: false, error: 'Practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: practice });
    }

    // Return single meditation by ID
    if (id && type === 'meditation') {
      const meditation = MERKABA_MEDITATIONS.find((m) => m.id === id);
      if (!meditation) {
        return NextResponse.json(
          { success: false, error: 'Meditation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: meditation });
    }

    // Return single lightbody activation by ID
    if (id && type === 'lightbody') {
      const activation = LIGHTBODY_ACTIVATIONS.find((a) => a.id === id);
      if (!activation) {
        return NextResponse.json(
          { success: false, error: 'Lightbody activation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: activation });
    }

    // Return lightbody activation by stage number
    if (stage && type === 'lightbody') {
      const stageNum = parseInt(stage, 10);
      const activation = LIGHTBODY_ACTIVATIONS.find((a) => a.stage === stageNum);
      if (!activation) {
        return NextResponse.json(
          { success: false, error: 'Lightbody stage not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: activation });
    }

    // Return practices filtered by level
    if (level && type === 'practices') {
      const filtered = MERKABA_PRACTICES.filter((p) => p.level === level);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return Merkaba aspects only
    if (type === 'aspects') {
      return NextResponse.json({ success: true, data: MERKABA_ASPECTS });
    }

    // Return practices only
    if (type === 'practices') {
      return NextResponse.json({ success: true, data: MERKABA_PRACTICES });
    }

    // Return meditations only
    if (type === 'meditations') {
      return NextResponse.json({ success: true, data: MERKABA_MEDITATIONS });
    }

    // Return lightbody activations only
    if (type === 'lightbody') {
      return NextResponse.json({ success: true, data: LIGHTBODY_ACTIVATIONS });
    }

    // Return sacred geometry data
    if (type === 'geometry') {
      return NextResponse.json({ success: true, data: SACRED_GEOMETRY });
    }

    // Return meditation phases
    if (type === 'phases') {
      const phases = MERKABA_MEDITATIONS.reduce((acc, m) => {
        if (!acc.find((p) => p.phase === m.phase)) {
          acc.push({ phase: m.phase, name: `Phase ${m.phase}`, meditationCount: MERKABA_MEDITATIONS.filter((mm) => mm.phase === m.phase).length });
        }
        return acc;
      }, [] as { phase: number; name: string; meditationCount: number }[]);
      return NextResponse.json({ success: true, data: phases });
    }

    // Return practice levels with counts
    if (type === 'levels') {
      const levels = ['beginner', 'intermediate', 'advanced', 'master'].map((l) => ({
        level: l,
        name: l.charAt(0).toUpperCase() + l.slice(1),
        practiceCount: MERKABA_PRACTICES.filter((p) => p.level === l).length,
      }));
      return NextResponse.json({ success: true, data: levels });
    }

    // Default — return all Merkaba data
    return NextResponse.json({
      success: true,
      data: {
        aspects: MERKABA_ASPECTS,
        practices: MERKABA_PRACTICES,
        meditations: MERKABA_MEDITATIONS,
        lightbody: LIGHTBODY_ACTIVATIONS,
        sacredGeometry: SACRED_GEOMETRY,
      },
      meta: {
        totalAspects: MERKABA_ASPECTS.length,
        totalPractices: MERKABA_PRACTICES.length,
        totalMeditations: MERKABA_MEDITATIONS.length,
        totalLightbodyStages: LIGHTBODY_ACTIVATIONS.length,
        totalGeometry: SACRED_GEOMETRY.length,
      },
    });
} catch (error) {
    console.error('Merkaba v2 API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}