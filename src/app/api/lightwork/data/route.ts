// ============================================================
// LIGHTWORK DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for lightwork data
// - Retrieve all lightwork practices
// - Retrieve single lightwork practice by ID
// - Retrieve lightwork categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface LightworkPractice {
  id: string;
  name: string;
  description: string;
  category: string;
  intensity: number;
  duration: string;
}

interface LightworkCategory {
  name: string;
  description: string;
  weight: number;
}

const CATEGORIES: LightworkCategory[] = [
  { name: 'shadow', description: 'Shadow work, integrating hidden aspects', weight: 3 },
  { name: 'love', description: 'Unconditional love, compassion practices', weight: 3 },
  { name: 'truth', description: 'Truth-telling, authenticity work', weight: 2 },
  { name: 'forgiveness', description: 'Releasing grudges, healing wounds', weight: 2 },
  { name: 'gratitude', description: 'Appreciation practices, abundance mindset', weight: 2 },
  { name: 'boundaries', description: 'Self-respect, healthy limits', weight: 1 },
];

const PRACTICES: LightworkPractice[] = [
  { id: 'shadow-embrace', name: 'Shadow Embrace', description: 'Honor your shadow self', category: 'shadow', intensity: 5, duration: '30-60 min' },
  { id: 'inner-child-healing', name: 'Inner Child Healing', description: 'Reparent and nurture wounded child', category: 'shadow', intensity: 4, duration: '45-90 min' },
  { id: 'compassion-meditation', name: 'Compassion Meditation', description: 'Loving-kindness for self and others', category: 'love', intensity: 2, duration: '20-40 min' },
  { id: 'heart-opening', name: 'Heart Opening', description: 'Open the heart chakra fully', category: 'love', intensity: 3, duration: '30-60 min' },
  { id: 'truth-speaking', name: 'Truth Speaking', description: 'Speak your authentic truth', category: 'truth', intensity: 4, duration: '15-30 min' },
  { id: 'ho-oponopono', name: 'Ho oponopono', description: 'Ancient Hawaiian forgiveness ritual', category: 'forgiveness', intensity: 3, duration: '20-45 min' },
  { id: 'gratitude-journaling', name: 'Gratitude Journaling', description: 'Daily appreciation practice', category: 'gratitude', intensity: 1, duration: '10-15 min' },
  { id: 'boundary-setting', name: 'Boundary Setting', description: 'Define and honor personal limits', category: 'boundaries', intensity: 3, duration: '20-40 min' },
];

// GET /api/lightwork/data - Get lightwork data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single practice record by ID
    if (id) {
      const record = PRACTICES.find((p) => p.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Lightwork practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return lightwork categories with weights
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: CATEGORIES });
    }

    // Return practice records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: PRACTICES });
    }

    // Default — return all lightwork data
    return NextResponse.json({
      success: true,
      data: {
        records: PRACTICES,
        categories: CATEGORIES,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lightwork data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
