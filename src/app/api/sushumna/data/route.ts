// ============================================================
// SUSHUMNA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sushumna energy channel data
// - List all sushumna information
// - Get specific sushumna state by ID
// - Get sushumna pathways and attributes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface SushumnaAttribute {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  location: string;
  function: string;
  qualities: string[];
}

interface SushumnaChakra {
  id: string;
  name: string;
  namePt: string;
  sanskrit: string;
  position: number;
  element: string;
  seed: string;
  color: string;
  petals: number;
  mantra: string;
}

interface SushumnaPractice {
  id: string;
  name: string;
  namePt: string;
  type: string;
  description: string;
  descriptionPt: string;
  duration: number;
  difficulty: string;
  benefits: string[];
  contraindications: string[];
}

interface SushumnaData {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  sanskrit: string;
  meaning: string;
  element: string;
  color: string;
  frequency: string;
  location: string;
  path: string;
  qualities: string[];
  associatedNadis: string[];
  associatedChakras: string[];
  awakeningSigns: string[];
  blocks: string[];
  activationMethods: string[];
}

const sushumnaChakras: SushumnaChakra[] = [
  {
    id: 'muladhara',
    name: 'Root Chakra',
    namePt: 'Chakra Raiz',
    sanskrit: 'Mūlādhāra',
    position: 1,
    element: 'Earth',
    seed: 'Lam',
    color: 'Red',
    petals: 4,
    mantra: 'Lam Lam Lam Lam',
  },
  {
    id: 'svadhisthana',
    name: 'Sacral Chakra',
    namePt: 'Chakra Sacral',
    sanskrit: 'Svādhiṣṭhāna',
    position: 2,
    element: 'Water',
    seed: 'Vam',
    color: 'Orange',
    petals: 6,
    mantra: 'Vam Vam Vam Vam Vam Vam',
  },
  {
    id: 'manipura',
    name: 'Solar Plexus Chakra',
    namePt: 'Chakra do Plexo Solar',
    sanskrit: 'Maṇipūra',
    position: 3,
    element: 'Fire',
    seed: 'Ram',
    color: 'Yellow',
    petals: 10,
    mantra: 'Ram Ram Ram Ram Ram Ram Ram Ram Ram Ram',
  },
  {
    id: 'anahata',
    name: 'Heart Chakra',
    namePt: 'Chakra do Coração',
    sanskrit: 'Anāhata',
    position: 4,
    element: 'Air',
    seed: 'Yam',
    color: 'Green',
    petals: 12,
    mantra: 'Yam Yam Yam Yam Yam Yam Yam Yam Yam Yam Yam Yam',
  },
  {
    id: 'vishuddha',
    name: 'Throat Chakra',
    namePt: 'Chakra da Garganta',
    sanskrit: 'Viśuddha',
    position: 5,
    element: 'Ether',
    seed: 'Ham',
    color: 'Blue',
    petals: 16,
    mantra: 'Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham Ham',
  },
  {
    id: 'ajna',
    name: 'Third Eye Chakra',
    namePt: 'Chakra do Terceiro Olho',
    sanskrit: 'Ājñā',
    position: 6,
    element: 'Light',
    seed: 'Ksham',
    color: 'Indigo',
    petals: 2,
    mantra: 'Ksham Ksham',
  },
  {
    id: 'sahasrara',
    name: 'Crown Chakra',
    namePt: 'Chakra da Coroa',
    sanskrit: 'Sahasrāra',
    position: 7,
    element: 'Cosmic',
    seed: 'Om',
    color: 'Violet',
    petals: 1000,
    mantra: 'Om Om Om Om Om',
  },
];

const sushumnaAttributes: SushumnaAttribute[] = [
  {
    id: 'central-channel',
    name: 'Central Channel',
    namePt: 'Canal Central',
    description: 'The main energy channel running from the base of the spine to the crown of the head.',
    descriptionPt: 'O principal canal de energia que percorre desde a base da coluna até o topo da cabeça.',
    location: 'Sushumna nadi runs through the center of the spinal column.',
    function: 'Primary pathway for kundalini energy ascent.',
    qualities: ['Neutral', 'Balanced', 'Expansive', 'Transcendent'],
  },
  {
    id: ' ida',
    name: 'Left Channel',
    namePt: 'Canal Esquerdo',
    description: 'The lunar channel running to the left of sushumna, associated with feminine energy.',
    descriptionPt: 'O canal lunar que corre à esquerda do sushumna, associado à energia feminina.',
    location: 'Left side of the spinal column.',
    function: 'Cooling, receptive, introspective energy flow.',
    qualities: ['Cool', 'Receptive', 'Intuitive', 'Feminine'],
  },
  {
    id: 'pingala',
    name: 'Right Channel',
    namePt: 'Canal Direito',
    description: 'The solar channel running to the right of sushumna, associated with masculine energy.',
    descriptionPt: 'O canal solar que corre à direita do sushumna, associado à energia masculina.',
    location: 'Right side of the spinal column.',
    function: 'Heating, active, extroverted energy flow.',
    qualities: ['Warm', 'Active', 'Logical', 'Masculine'],
  },
  {
    id: 'brahmadvara',
    name: 'Door of Brahma',
    namePt: 'Porta de Brahma',
    description: 'The gateway at the base of the skull where kundalini passes to enter the cranial space.',
    descriptionPt: 'O portal na base do crânio por onde a kundalini passa para entrar no espaço cranial.',
    location: 'Base of the skull, at the junction of the spine and cranium.',
    function: 'Portal for spiritual transcendence.',
    qualities: ['Sacred', 'Transformative', 'Threshold'],
  },
  {
    id: 'meru',
    name: 'Meru Danda',
    namePt: 'Coluna de Meru',
    description: 'The vertebral column as the physical manifestation of the sushumna channel.',
    descriptionPt: 'A coluna vertebral como manifestação física do canal sushumna.',
    location: 'The entire spinal column.',
    function: 'Physical support for spiritual energy.',
    qualities: ['Stable', 'Upright', 'Aligned'],
  },
];

const sushumnaPractices: SushumnaPractice[] = [
  {
    id: 'spinal-breathing',
    name: 'Spinal Breathing',
    namePt: 'Respiração Espinhal',
    type: 'pranayama',
    description: 'Deep conscious breathing that draws energy up the spine through the central channel.',
    descriptionPt: 'Respiração consciente profunda que atrai energia pela coluna através do canal central.',
    duration: 11,
    difficulty: 'beginner',
    benefits: ['Opens sushumna nadi', 'Activates kundalini', 'Balances ida and pingala'],
    contraindications: ['Practice with caution if pregnant', 'Stop if experiencing vertigo'],
  },
  {
    id: 'sushumna-pranayama',
    name: 'Sushumna Pranayama',
    namePt: 'Pranayama Sushumna',
    type: 'pranayama',
    description: 'Breathing technique specifically designed to activate and purify the central channel.',
    descriptionPt: 'Técnica de respiração especificamente projetada para ativar e purificar o canal central.',
    duration: 15,
    difficulty: 'intermediate',
    benefits: ['Purifies nadi system', 'Balances three gunas', 'Prepares for kundalini rise'],
    contraindications: ['Requires prior preparation', 'Seek guidance from experienced teacher'],
  },
  {
    id: 'nadi-shodhana',
    name: 'Nadi Shodhana',
    namePt: 'Purificação dos Nadis',
    type: 'pranayama',
    description: 'Alternate nostril breathing that purifies the energy channels including sushumna.',
    descriptionPt: 'Respiração alternada que purifica os canais de energia incluindo o sushumna.',
    duration: 12,
    difficulty: 'beginner',
    benefits: ['Balances ida and pingala', 'Purifies nadis', 'Calms the mind'],
    contraindications: ['Avoid if experiencing anxiety', 'Practice in calm environment'],
  },
  {
    id: 'brahmari',
    name: 'Brahmari Breathing',
    namePt: 'Respiração de Abelha',
    type: 'pranayama',
    description: 'Humming bee breath that vibrates the sushumna channel and awakens spiritual centers.',
    descriptionPt: 'Respiração de abelha que vibra o canal sushumna e desperta centros espirituais.',
    duration: 8,
    difficulty: 'beginner',
    benefits: ['Activates crown chakra', 'Opens sushumna', 'Creates inner vibration'],
    contraindications: ['Avoid if you have ear infections', 'Keep humming comfortable'],
  },
  {
    id: 'sushumna-meditation',
    name: 'Sushumna Meditation',
    namePt: 'Meditação do Sushumna',
    type: 'meditation',
    description: 'Guided visualization along the central channel from muladhara to sahasrara.',
    descriptionPt: 'Visualização guiada ao longo do canal central do muladhara ao sahasrara.',
    duration: 31,
    difficulty: 'intermediate',
    benefits: ['Aligns energy centers', 'Opens central channel', 'Prepares for kundalini'],
    contraindications: ['May trigger energy movements', 'Practice with proper grounding'],
  },
  {
    id: 'kundalini-chakra-visualization',
    name: 'Kundalini Chakra Visualization',
    namePt: 'Visualização da Kundalini nos Chakras',
    type: 'meditation',
    description: 'Visualization practice moving kundalini energy through each chakra of the sushumna.',
    descriptionPt: 'Prática de visualização movendo energia kundalini através de cada chakra do sushumna.',
    duration: 45,
    difficulty: 'advanced',
    benefits: ['Activates all chakras', 'Strengthens sushumna', 'Advances spiritual evolution'],
    contraindications: ['Requires experienced guidance', 'Not for beginners'],
  },
];

const sushumnaData: SushumnaData = {
  id: 'sushumna',
  name: 'Sushumna',
  namePt: 'Sushumna',
  description: 'The central nadi (energy channel) of the subtle body, running from the base of the spine to the crown of the head. It is the primary pathway for kundalini energy and spiritual awakening.',
  descriptionPt: 'O principal nadi (canal de energia) do corpo sutil, percorrendo da base da coluna até o topo da cabeça. É o principal caminho para a energia kundalini e o despertar espiritual.',
  sanskrit: 'सुषुम्ना',
  meaning: 'The most gracious, the joyful, the blissful',
  element: 'All elements unified',
  color: 'Golden white',
  frequency: 'Supreme spiritual frequency',
  location: 'Center of the spinal column',
  path: 'From Muladhara (base) through all seven chakras to Sahasrara (crown)',
  qualities: ['Balanced', 'Neutral', 'Transcendent', 'Expansive', 'Pure'],
  associatedNadis: ['Ida', 'Pingala', 'Gandhari', 'Hastijihva', 'Pusha', 'Yashasvini'],
  associatedChakras: ['Muladhara', 'Svadhisthana', 'Manipura', 'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara'],
  awakeningSigns: [
    'Energy rising through the spine',
    'Spontaneous stillness and peace',
    'Expanded consciousness',
    'Blissful states',
    'Clear perception of energy movement',
  ],
  blocks: [
    'Emotional trauma stored in the spine',
    'Physical misalignments',
    'Dense energetic patterns',
    'Unprocessed karma',
    'Belief limitations',
  ],
  activationMethods: [
    'Pranayama practices',
    'Chakra meditation',
    'Kundalini yoga',
    'Spinal alignment exercises',
    'Devotional practices',
    'Service without expectation',
  ],
};

// GET /api/sushumna/data - Get sushumna data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const position = searchParams.get('position');

    // Return specific chakra by position
    if (position) {
      const num = parseInt(position, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid position number' },
          { status: 400 }
        );
      }
      const chakra = sushumnaChakras.find((c) => c.position === num);
      if (!chakra) {
        return NextResponse.json(
          { success: false, error: 'Chakra not found at this position' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: chakra });
    }

    // Return specific data by ID
    if (id) {
      if (id === 'chakras') {
        return NextResponse.json({ success: true, data: sushumnaChakras });
      }
      if (id === 'attributes') {
        return NextResponse.json({ success: true, data: sushumnaAttributes });
      }
      if (id === 'practices') {
        return NextResponse.json({ success: true, data: sushumnaPractices });
      }

      // Check chakras
      const chakraData = sushumnaChakras.find((c) => c.id === id);
      if (chakraData) {
        return NextResponse.json({ success: true, data: chakraData });
      }

      // Check attributes
      const attributeData = sushumnaAttributes.find((a) => a.id === id);
      if (attributeData) {
        return NextResponse.json({ success: true, data: attributeData });
      }

      // Check practices
      const practiceData = sushumnaPractices.find((p) => p.id === id);
      if (practiceData) {
        return NextResponse.json({ success: true, data: practiceData });
      }

      return NextResponse.json(
        { success: false, error: 'Sushumna element not found' },
        { status: 404 }
      );
    }

    // Return type-filtered data
    if (type) {
      switch (type) {
        case 'chakras':
          return NextResponse.json({ success: true, data: sushumnaChakras });
        case 'attributes':
          return NextResponse.json({ success: true, data: sushumnaAttributes });
        case 'practices':
          return NextResponse.json({ success: true, data: sushumnaPractices });
        case 'overview':
          return NextResponse.json({
            success: true,
            data: {
              main: sushumnaData,
              chakrasCount: sushumnaChakras.length,
              practicesCount: sushumnaPractices.length,
            },
          });
        default:
          return NextResponse.json(
            { success: false, error: 'Unknown type parameter' },
            { status: 400 }
          );
      }
    }

    // Return full sushumna data
    return NextResponse.json({
      success: true,
      data: {
        overview: sushumnaData,
        chakras: sushumnaChakras,
        attributes: sushumnaAttributes,
        practices: sushumnaPractices,
      },
    });
  } catch (error) {
    console.error('Sushumna API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}