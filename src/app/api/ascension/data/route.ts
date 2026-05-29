// ============================================================
// ASCENSION DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for ascension data
// - List all ascension data
// - Get specific ascension path by ID
// - Get ascension by number
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
    planet?: string;
    sefirah?: string;
    tarot?: string;
  };
}

// Sample ascension data
const ascensionPaths: AscensionPath[] = [
  {
    id: 'asc-1',
    number: 1,
    name: 'The Path of Divine Light',
    name_pt: 'O Caminho da Luz Divina',
    name_he: 'Or ChOR',
    description: 'The first steps on the ascension journey, marked by initial spiritual awakening and the first rays of divine illumination.',
    description_pt: 'Os primeiros passos na jornada de ascensão, marcados pelo despertar espiritual inicial e as primeiras rajadas de iluminação divina.',
    energy: 'light',
    attributes: ['awakening', 'illumination', 'clarity'],
    practices: ['meditation', 'prayer', 'light visualization'],
    correspondences: {
      element: 'fire',
      sefirah: 'Keter',
    },
  },
  {
    id: 'asc-2',
    number: 2,
    name: 'The Path of Wisdom',
    name_pt: 'O Caminho da Sabedoria',
    name_he: 'Chochmah',
    description: 'Developing inner wisdom and understanding through contemplation and study of sacred teachings.',
    description_pt: 'Desenvolvendo sabedoria interior e compreensão através da contemplação e estudo dos ensinamentos sagrados.',
    energy: 'wisdom',
    attributes: ['knowledge', 'insight', 'discernment'],
    practices: ['study', 'contemplation', 'teaching'],
    correspondences: {
      planet: 'Mercury',
      sefirah: 'Chochmah',
    },
  },
  {
    id: 'asc-3',
    number: 3,
    name: 'The Path of Transformation',
    name_pt: 'O Caminho da Transformação',
    name_he: 'Tikkun',
    description: 'The process of spiritual refinement and transformation of lower nature into higher consciousness.',
    description_pt: 'O processo de refinamento espiritual e transformação da natureza inferior em consciência superior.',
    energy: 'transformation',
    attributes: ['transmutation', 'growth', 'evolution'],
    practices: ['shadow work', 'inner work', 'ritual'],
    correspondences: {
      element: 'water',
      sefirah: 'Tiferet',
    },
  },
  {
    id: 'asc-4',
    number: 4,
    name: 'The Path of Balance',
    name_pt: 'O Caminho do Equilíbrio',
    name_he: 'Tiferet',
    description: 'Finding harmony between opposing forces and integrating all aspects of being.',
    description_pt: 'Encontrando harmonia entre forças opostas e integrando todos os aspectos do ser.',
    energy: 'harmony',
    attributes: ['balance', 'integration', 'wholeness'],
    practices: ['breathwork', 'centering', 'integration work'],
    correspondences: {
      element: 'air',
      sefirah: 'Tiferet',
    },
  },
  {
    id: 'asc-5',
    number: 5,
    name: 'The Path of Power',
    name_pt: 'O Caminho do Poder',
    name_he: 'Gevurah',
    description: 'Cultivating spiritual strength, discipline, and the power to overcome obstacles.',
    description_pt: 'Cultivando força espiritual, disciplina e poder para superar obstáculos.',
    energy: 'power',
    attributes: ['strength', 'discipline', 'courage'],
    practices: ['austerity', 'martial practice', 'energy work'],
    correspondences: {
      planet: 'Mars',
      sefirah: 'Gevurah',
    },
  },
  {
    id: 'asc-6',
    number: 6,
    name: 'The Path of Love',
    name_pt: 'O Caminho do Amor',
    name_he: 'Chesed',
    description: 'Opening the heart to unconditional love and compassionate service to all beings.',
    description_pt: 'Abrindo o coração ao amor incondicional e serviço compassivo a todos os seres.',
    energy: 'love',
    attributes: ['compassion', 'devotion', 'service'],
    practices: ['loving-kindness', 'service', 'heart meditation'],
    correspondences: {
      planet: 'Jupiter',
      sefirah: 'Chesed',
    },
  },
  {
    id: 'asc-7',
    number: 7,
    name: 'The Path of Victory',
    name_pt: 'O Caminho da Vitória',
    name_he: 'Netzach',
    description: 'Overcoming obstacles and achieving spiritual victory through perseverance and divine assistance.',
    description_pt: 'Superando obstáculos e alcançando vitória espiritual através da perseverança e assistência divina.',
    energy: 'victory',
    attributes: ['perseverance', 'endurance', 'triumph'],
    practices: ['affirmation', 'visualization', 'ritual'],
    correspondences: {
      planet: 'Venus',
      sefirah: 'Netzach',
    },
  },
  {
    id: 'asc-8',
    number: 8,
    name: 'The Path of Foundation',
    name_pt: 'O Caminho da Fundação',
    name_he: 'Yesod',
    description: 'Building a stable foundation for spiritual practice through grounding and practical application.',
    description_pt: 'Construindo uma base estável para a prática espiritual através do enraizamento e aplicação prática.',
    energy: 'foundation',
    attributes: ['stability', 'grounding', 'structure'],
    practices: ['grounding', 'ritual work', 'manifestation'],
    correspondences: {
      planet: 'Moon',
      sefirah: 'Yesod',
    },
  },
  {
    id: 'asc-9',
    number: 9,
    name: 'The Path of Sovereignty',
    name_pt: 'O Caminho da Soberania',
    name_he: 'Malkuth',
    description: 'Integrating spiritual wisdom into daily life and becoming a conscious co-creator of reality.',
    description_pt: 'Integrando sabedoria espiritual na vida diária e tornando-se um co-criador consciente da realidade.',
    energy: 'sovereignty',
    attributes: ['manifestation', 'abundance', 'embodiment'],
    practices: ['grounding', 'ritual', 'practical magic'],
    correspondences: {
      element: 'earth',
      sefirah: 'Malkuth',
    },
  },
  {
    id: 'asc-10',
    number: 10,
    name: 'The Path of Crown',
    name_pt: 'O Caminho da Coroa',
    name_he: 'Keter',
    description: 'Union with the divine crown and realization of the highest states of consciousness.',
    description_pt: 'União com a coroa divina e realização dos mais altos estados de consciência.',
    energy: 'crown',
    attributes: ['unity', 'transcendence', 'enlightenment'],
    practices: ['deep meditation', 'prayer', 'contemplation'],
    correspondences: {
      planet: 'Sun',
      sefirah: 'Keter',
    },
  },
];

// GET /api/ascension/data - Get ascension data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const number = searchParams.get('number');

    // Return path by specific ID
    if (id) {
      const path = ascensionPaths.find((p) => p.id === id);
      if (!path) {
        return NextResponse.json(
          { success: false, error: 'Ascension path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: path });
    }

    // Return path by number
    if (number) {
      const num = parseInt(number, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid path number' },
          { status: 400 }
        );
      }
      const path = ascensionPaths.find((p) => p.number === num);
      if (!path) {
        return NextResponse.json(
          { success: false, error: 'Ascension path not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: path });
    }

    // Default — return all paths
    return NextResponse.json({ success: true, data: ascensionPaths });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ascension data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}