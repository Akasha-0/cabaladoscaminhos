// ============================================================
// AROMATHERAPY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for aromatherapy data
// - Retrieve all essential oils
// - Retrieve single oil by ID
// - Retrieve oil categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Essential oil type
interface EssentialOil {
  id: string;
  name: string;
  latinName: string;
  category: string;
  chakras: number[];
  properties: string[];
  uses: string[];
  contraindications: string[];
}

// Oil category type
interface OilCategory {
  name: string;
  description: string;
  oils: string[];
}

// Base essential oils data
const essentialOils: EssentialOil[] = [
  {
    id: 'lavender',
    name: 'Lavender',
    latinName: 'Lavandula angustifolia',
    category: 'floral',
    chakras: [6, 7],
    properties: ['calming', 'healing', 'balancing'],
    uses: ['anxiety relief', 'sleep support', 'skin care'],
    contraindications: ['avoid during pregnancy', 'low blood pressure'],
  },
  {
    id: 'frankincense',
    name: 'Frankincense',
    latinName: 'Boswellia carterii',
    category: 'resin',
    chakras: [6, 7],
    properties: ['grounding', 'spiritual', 'anti-inflammatory'],
    uses: ['meditation', 'spiritual work', 'immune support'],
    contraindications: ['skin sensitivity', 'blood thinning medications'],
  },
  {
    id: 'rose',
    name: 'Rose',
    latinName: 'Rosa damascena',
    category: 'floral',
    chakras: [4, 7],
    properties: ['loving', 'nurturing', 'heart-opening'],
    uses: ['emotional healing', 'heart chakra', 'self-love'],
    contraindications: ['pregnancy', 'skin irritation'],
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood',
    latinName: 'Santalum album',
    category: 'wood',
    chakras: [6, 7],
    properties: ['meditative', 'peaceful', 'sacred'],
    uses: ['prayer', 'meditation', 'skin care'],
    contraindications: ['kidney issues', 'allergies'],
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    latinName: 'Mentha piperita',
    category: 'herb',
    chakras: [5, 6],
    properties: ['energizing', 'clarifying', 'cooling'],
    uses: ['mental clarity', 'headaches', 'digestion'],
    contraindications: ['infants', 'high blood pressure', 'heart conditions'],
  },
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    latinName: 'Eucalyptus globulus',
    category: 'herb',
    chakras: [5],
    properties: ['cleansing', 'purifying', 'invigorating'],
    uses: ['respiratory', 'energy clearing', 'mental focus'],
    contraindications: ['pregnancy', 'children', 'blood pressure medications'],
  },
  {
    id: 'cedarwood',
    name: 'Cedarwood',
    latinName: 'Juniperus virginiana',
    category: 'wood',
    chakras: [1, 4],
    properties: ['grounding', 'strengthening', 'protective'],
    uses: ['root chakra', 'meditation', 'male energy'],
    contraindications: ['pregnancy', 'kidney issues'],
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    latinName: 'Jasminum officinale',
    category: 'floral',
    chakras: [4, 6],
    properties: ['romantic', 'uplifting', 'confident'],
    uses: ['love magic', 'confidence', 'energizing'],
    contraindications: ['sensitive skin', 'pregnancy'],
  },
  {
    id: 'myrrh',
    name: 'Myrrh',
    latinName: 'Commiphora myrrha',
    category: 'resin',
    chakras: [5, 6],
    properties: ['protective', 'healing', 'transformative'],
    uses: ['protection rituals', 'wound healing', 'ancestral work'],
    contraindications: ['pregnancy', 'blood thinning medications'],
  },
  {
    id: 'bergamot',
    name: 'Bergamot',
    latinName: 'Citrus bergamia',
    category: 'citrus',
    chakras: [4, 5],
    properties: ['uplifting', 'balancing', 'anxiety-relieving'],
    uses: ['depression', 'stress', 'skin conditions'],
    contraindications: ['sun sensitivity', 'medication interactions'],
  },
];

// Oil categories
const oilCategories: OilCategory[] = [
  {
    name: 'floral',
    description: 'Delicate, sweet-smelling oils from flowers',
    oils: ['lavender', 'rose', 'jasmine'],
  },
  {
    name: 'resin',
    description: 'Deep, rich oils from tree resins',
    oils: ['frankincense', 'myrrh'],
  },
  {
    name: 'wood',
    description: 'Earthy, grounding oils from wood chips or bark',
    oils: ['sandalwood', 'cedarwood'],
  },
  {
    name: 'herb',
    description: 'Fresh, minty oils from herb leaves',
    oils: ['peppermint', 'eucalyptus'],
  },
  {
    name: 'citrus',
    description: 'Bright, energizing oils from fruit peels',
    oils: ['bergamot'],
  },
];

// GET /api/aromatherapy/data - Get aromatherapy data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single oil by ID
    if (id) {
      const oil = essentialOils.find(
        (o) => o.id.toLowerCase() === id.toLowerCase()
      );
      if (!oil) {
        return NextResponse.json(
          { success: false, error: 'Essential oil not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: oil });
    }

    // Return oil categories
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: oilCategories });
    }

    // Return essential oils only
    if (type === 'oils') {
      return NextResponse.json({ success: true, data: essentialOils });
    }

    // Default — return all aromatherapy data
    return NextResponse.json({
      success: true,
      data: {
        oils: essentialOils,
        categories: oilCategories,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch aromatherapy data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}