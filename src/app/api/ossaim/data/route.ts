// ============================================================
// OSSAIM DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ossaim orixá data
// - Orossi Ossaim spiritual practices
// - Herb-related spiritual rituals
// - Nature healing traditions
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface OssaimPractice {
  id: string;
  name: string;
  namePortuguese: string;
  description: string;
  purpose: string;
  method: string[];
  elements: string[];
  correspondences: {
    plants: string[];
    healing: string[];
    nature: string[];
  };
  ritual: {
    preparation: string[];
    mainPractice: string[];
    completion: string[];
  };
  offerings?: string[];
  contraindications?: string[];
}

export interface OssaimCategory {
  id: string;
  name: string;
  description: string;
  practices: string[];
}

// ============================================================
// OSSAIM DATA
// ============================================================

const OSSAIM_CATEGORIES: OssaimCategory[] = [
  {
    id: 'herb-healing',
    name: 'Herb Healing',
    namePortuguese: 'Cura com Ervas',
    description: 'Traditional healing practices using medicinal plants',
    practices: ['leaf-infusion', 'root-decoction', 'bark-preparation'],
  },
  {
    id: 'nature-ritual',
    name: 'Nature Ritual',
    namePortuguese: 'Ritual da Natureza',
    description: 'Spiritual ceremonies connecting with natural elements',
    practices: ['tree-ceremony', 'water-ritual', 'earth-connection'],
  },
  {
    id: 'spiritual-blessing',
    name: 'Spiritual Blessing',
    namePortuguese: 'Abençoamento Espiritual',
    description: 'Blessings for health, protection, and abundance',
    practices: ['leaf-blessing', 'branch-sweeping', 'nature-invocation'],
  },
  {
    id: 'plant-communion',
    name: 'Plant Communion',
    namePortuguese: 'Comunhão com Plantas',
    description: 'Deep connection with plant spirits and their wisdom',
    practices: ['meditation', 'offering', 'reciprocity'],
  },
];

const OSSAIM_PRACTICES: OssaimPractice[] = [
  {
    id: 'leaf-infusion',
    name: 'Leaf Infusion',
    namePortuguese: 'Infusão de Folhas',
    description: 'Preparing spiritual infusions with sacred leaves for healing',
    purpose: 'Physical and spiritual cleansing, health restoration',
    method: [
      'Select fresh leaves during dawn',
      'Purify water with prayers',
      'Infuse leaves while chanting',
      'Offer to Ossaim before drinking',
    ],
    elements: ['water', 'leaves', 'fire', 'air'],
    correspondences: {
      plants: ['eucalyptus', 'guinea-hen', 'santo-andre'],
      healing: ['respiratory', 'spiritual-cleanse', 'protection'],
      nature: ['forest', 'garden', 'wild'],
    },
    ritual: {
      preparation: ['Gather leaves with gratitude', 'Cleanse the space', 'Light a candle'],
      mainPractice: ['Brew with focused intention', 'Recite Ossaim prayers', 'Visualize healing energy'],
      completion: ['Drink slowly with gratitude', 'Give thanks to the plants', 'Dispose of leaves respectfully'],
    },
    offerings: ['white cloth', 'candle', 'herbs'],
  },
  {
    id: 'root-decoction',
    name: 'Root Decoction',
    namePortuguese: 'Decocção de Raízes',
    description: 'Creating powerful decoctions from sacred roots',
    purpose: 'Deep healing, grounding, ancestral connection',
    method: [
      'Harvest roots with permission',
      'Cleanse with saltwater',
      'Simmer with prayers',
      'Strain and bless the liquid',
    ],
    elements: ['earth', 'water', 'fire'],
    correspondences: {
      plants: ['imu', 'pau-brasil', 'cabbage'],
      healing: ['grounding', 'strength', 'ancestral-link'],
      nature: ['earth', 'soil', 'roots'],
    },
    ritual: {
      preparation: ['Ask permission from the earth', 'Clean tools thoroughly', 'Set sacred intention'],
      mainPractice: ['Boil roots with visualization', 'Chant ancestral prayers', 'Feel the connection'],
      completion: ['Offer to ancestors first', 'Drink with reverence', 'Bury the roots with gratitude'],
    },
    offerings: ['coconut', 'tobacco', 'white flowers'],
    contraindications: ['not for pregnant women', 'not during menstruation without guidance'],
  },
  {
    id: 'tree-ceremony',
    name: 'Tree Ceremony',
    namePortuguese: 'Cerimônia da Árvore',
    description: 'Honoring sacred trees and receiving their blessings',
    purpose: 'Nature connection, spiritual growth, environmental harmony',
    method: [
      'Choose a sacred tree',
      'Approach with respect',
      'Make offerings at the base',
      'Meditate while touching the bark',
    ],
    elements: ['earth', 'air', 'fire', 'water', 'wood'],
    correspondences: {
      plants: ['imbauba', 'gameleira', 'ipê'],
      healing: ['vitality', 'wisdom', 'persistence'],
      nature: ['forest', 'ancient-ones', 'sacred-groves'],
    },
    ritual: {
      preparation: ['Fast or eat lightly', 'Wear natural clothing', 'Carry only essential items'],
      mainPractice: ['Circle the tree sunwise', 'Make offerings', 'Sit in meditation', 'Listen to the wind'],
      completion: ['Thank the tree deeply', 'Never take without giving', 'Carry a small offering home'],
    },
    offerings: ['honey', 'rum', 'candle', 'white cloth'],
  },
  {
    id: 'water-ritual',
    name: 'Water Ritual',
    namePortuguese: 'Ritual de Água',
    description: 'Cleansing and blessing with sacred waters',
    purpose: 'Purification, spiritual refreshment, blessing',
    method: [
      'Gather blessed water',
      'Add sacred herbs',
      'Infuse with prayers',
      'Use for spiritual cleansing',
    ],
    elements: ['water', 'herbs', 'air', 'intention'],
    correspondences: {
      plants: ['arruda', 'guiné', 'alecrim'],
      healing: ['cleansing', 'refreshment', 'blessing'],
      nature: ['rivers', 'springs', 'rain'],
    },
    ritual: {
      preparation: ['Collect water from natural source', 'Add protective herbs', 'Set clear intention'],
      mainPractice: ['Bathe with visualization', 'Sprinkle in each direction', 'Feel the purification'],
      completion: ['Pour remaining water on plants', 'Thank the water spirits', 'Rest in peace'],
    },
    offerings: ['flowers', 'white candle', 'clean cloth'],
  },
  {
    id: 'earth-connection',
    name: 'Earth Connection',
    namePortuguese: 'Conexão com a Terra',
    description: 'Grounding through direct earth contact',
    purpose: 'Grounding, stability, ancestral connection',
    method: [
      'Find a quiet natural spot',
      'Remove shoes if appropriate',
      'Stand or sit on bare earth',
      'Visualize roots connecting',
    ],
    elements: ['earth', 'water', 'fire'],
    correspondences: {
      plants: ['all-plants', 'grass', 'soil'],
      healing: ['grounding', 'stability', 'strength'],
      nature: ['soil', 'earth', 'foundations'],
    },
    ritual: {
      preparation: ['Choose a safe natural place', 'Ground yourself first', 'Set intention for grounding'],
      mainPractice: ['Touch earth directly', 'Breathe deeply', 'Visualize energy flowing down', 'Feel the earths embrace'],
      completion: ['Give thanks to earth mother', 'Never take earth without permission', 'Walk barefoot to ground'],
    },
    offerings: ['food offerings', 'water', 'gratitude'],
  },
  {
    id: 'leaf-blessing',
    name: 'Leaf Blessing',
    namePortuguese: 'Abençoamento de Folhas',
    description: 'Using leaves for blessing and protection',
    purpose: 'Protection, blessing, spiritual cleansing',
    method: [
      'Select fresh leaves',
      'Infuse with prayers',
      'Touch person or object',
      'Dispose with gratitude',
    ],
    elements: ['air', 'water', 'green'],
    correspondences: {
      plants: ['guinea-hen', 'santo-andre', 'eucalyptus'],
      healing: ['protection', 'cleansing', 'blessing'],
      nature: ['garden', 'forest-floor'],
    },
    ritual: {
      preparation: ['Gather leaves at dawn', 'Cleanse with water', 'Set blessing intention'],
      mainPractice: ['Hold leaves with prayer', 'Fan person/object', 'Recite blessing words'],
      completion: ['Thank the leaves', 'Bury or burn with respect', 'Wash hands'],
    },
    offerings: ['white candle', 'water'],
  },
  {
    id: 'branch-sweeping',
    name: 'Branch Sweeping',
    namePortuguese: 'Varrimento com Galhos',
    description: 'Cleansing space with sacred branches',
    purpose: 'Space purification, protection, energy clearing',
    method: [
      'Select appropriate branch',
      'Consecrate with prayers',
      'Sweep space methodically',
      'Burn or bury sweepings',
    ],
    elements: ['air', 'wood', 'fire'],
    correspondences: {
      plants: ['arruda', 'rosemary', 'lavender'],
      healing: ['cleansing', 'protection', 'refreshment'],
      nature: ['garden', 'hedge', 'wild'],
    },
    ritual: {
      preparation: ['Cut branch with permission', 'Strip leaves for sweeping', 'Consecrate with prayers'],
      mainPractice: ['Start at altar/entry', 'Sweep toward exit', 'Visualize带走 negative energy', 'Cover all corners'],
      completion: ['Burn or bury sweepings', 'Open windows', 'Light protective candle', 'Thank Ossaim'],
    },
    offerings: ['tobacco', 'rum', 'white cloth'],
  },
  {
    id: 'nature-invocation',
    name: 'Nature Invocation',
    namePortuguese: 'Invocação da Natureza',
    description: 'Calling upon nature spirits for blessing',
    purpose: 'Spiritual assistance, nature communion, blessing',
    method: [
      'Find natural gathering place',
      'Light candles in four directions',
      'Call the nature spirits',
      'Offer and request',
    ],
    elements: ['air', 'fire', 'water', 'earth'],
    correspondences: {
      plants: ['all-sacred-plants'],
      healing: ['communion', 'blessing', 'assistance'],
      nature: ['grove', 'river', 'mountain', 'field'],
    },
    ritual: {
      preparation: ['Choose sacred site', 'Prepare offerings', 'Cleanse yourself'],
      mainPractice: ['Light candles facing East', 'Call to Ossaim', 'Present offerings', 'Make your request', 'Listen quietly'],
      completion: ['Thank all spirits', 'Close the circle', 'Leave offerings', 'Walk away without looking back'],
    },
    offerings: ['honey', 'fruits', 'flowers', 'candle', 'tobacco'],
  },
  {
    id: 'meditation',
    name: 'Plant Meditation',
    namePortuguese: 'Meditação com Plantas',
    description: 'Deep meditation with plant spirit energies',
    purpose: 'Wisdom acquisition, plant communion, spiritual growth',
    method: [
      'Sit near a significant plant',
      'Breathe deeply',
      'Open heart to plant energy',
      'Receive insights',
    ],
    elements: ['earth', 'air', 'water'],
    correspondences: {
      plants: ['all-medicinal', 'all-sacred'],
      healing: ['wisdom', 'understanding', 'connection'],
      nature: ['garden', 'forest', 'any-plant'],
    },
    ritual: {
      preparation: ['Choose your plant', 'Sit comfortably near it', 'Close eyes', 'Breathe'],
      mainPractice: ['Feel the plants presence', 'Open to its wisdom', 'Receive whatever comes', 'Be grateful'],
      completion: ['Slowly open eyes', 'Thank the plant', 'Maybe take a leaf as remembrance', 'Carry the wisdom'],
    },
  },
  {
    id: 'offering',
    name: 'Plant Offering',
    namePortuguese: 'Oferta de Plantas',
    description: 'Presenting offerings to nature spirits',
    purpose: 'Reciprocity, building relationship, seeking favor',
    method: [
      'Prepare offerings',
      'Set in sacred space',
      'Recite prayers',
      'Leave for spirits',
    ],
    elements: ['earth', 'fire', 'water', 'air'],
    correspondences: {
      plants: ['fruit-bearing', 'flowering'],
      healing: ['relationship', 'reciprocity', 'connection'],
      nature: ['altar', 'nature-altar', 'crossroads'],
    },
    ritual: {
      preparation: ['Prepare appropriate offerings', 'Cleanse space', 'Set intention'],
      mainPractice: ['Place offerings with prayer', 'Light candle', 'Recite offering prayer', 'Ask for blessing'],
      completion: ['Leave offerings overnight', 'Thank spirits', 'Dispose of offerings properly', 'Receive any signs'],
    },
    offerings: ['fruits', 'honey', 'rum', 'tobacco', 'flowers'],
  },
  {
    id: 'reciprocity',
    name: 'Nature Reciprocity',
    namePortuguese: 'Reciprocidade com a Natureza',
    description: 'Giving back to nature for what we receive',
    purpose: 'Balance, sustainability, spiritual responsibility',
    method: [
      'Recognize what nature gives',
      'Give proportionally',
      'Plant trees or herbs',
      'Protect natural spaces',
    ],
    elements: ['earth', 'water', 'air', 'fire'],
    correspondences: {
      plants: ['all-giving-plants', 'natives'],
      healing: ['balance', 'sustainability', 'responsibility'],
      nature: ['forest', 'garden', 'all-natural'],
    },
    ritual: {
      preparation: ['Acknowledge what you receive', 'Plan your giving', 'Gather supplies'],
      mainPractice: ['Plant with gratitude', 'Water with prayers', 'Care consistently', 'Teach others'],
      completion: ['Thank the earth', 'Document your giving', 'Make it regular practice'],
    },
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPracticeById(id: string): OssaimPractice | undefined {
  return OSSAIM_PRACTICES.find((p) => p.id === id);
}

function getPracticesByElement(element: string): OssaimPractice[] {
  return OSSAIM_PRACTICES.filter((p) => p.elements.includes(element.toLowerCase()));
}

function getPracticesByCategory(categoryId: string): OssaimPractice[] {
  const category = OSSAIM_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return [];
  return OSSAIM_PRACTICES.filter((p) => category.practices.includes(p.id));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ossaim/data
 * Retrieve Ossaim data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const element = searchParams.get('element');

    // Return single practice by ID
    if (id) {
      const record = getPracticeById(id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Ossaim practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return practices by category
    if (category) {
      const records = getPracticesByCategory(category.toLowerCase());
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for category' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return practices by element
    if (element) {
      const records = getPracticesByElement(element.toLowerCase());
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No practices found for element' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: records });
    }

    // Return categories only
    if (searchParams.get('type') === 'categories') {
      return NextResponse.json({ success: true, data: OSSAIM_CATEGORIES });
    }

    // Return practices only
    if (searchParams.get('type') === 'practices') {
      return NextResponse.json({ success: true, data: OSSAIM_PRACTICES });
    }

    // Default — return all ossaim data
    return NextResponse.json({
      success: true,
      data: {
        practices: OSSAIM_PRACTICES,
        categories: OSSAIM_CATEGORIES,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Ossaim data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}