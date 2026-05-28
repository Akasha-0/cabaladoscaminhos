// ============================================================
// UNITY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for unity data
// - Retrieve all unity practices
// - Retrieve single unity practice by ID
// - Retrieve unity categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface UnityPractice {
  id: string;
  name: string;
  description: string;
  category: string;
  intensity: number;
  duration: string;
}

interface UnityCategory {
  name: string;
  description: string;
  weight: number;
}

const CATEGORIES: UnityCategory[] = [
  { name: 'connection', description: 'Deep connection with source and self', weight: 3 },
  { name: 'interdependence', description: 'Recognizing all beings as one', weight: 3 },
  { name: 'compassion', description: 'Compassion for all expressions of life', weight: 3 },
  { name: 'forgiveness', description: 'Releasing separation and judgment', weight: 2 },
  { name: 'harmony', description: 'Living in harmony with all things', weight: 2 },
  { name: 'oneness', description: 'Awareness of universal unity', weight: 2 },
];

const PRACTICES: UnityPractice[] = [
  { id: 'source-meditation', name: 'Source Meditation', description: 'Connect with the unified field of consciousness', category: 'connection', intensity: 4, duration: '30-60 min' },
  { id: 'loving-kindness', name: 'Loving Kindness', description: 'Extend love to all beings without exception', category: 'compassion', intensity: 3, duration: '20-45 min' },
  { id: 'interbeing-practice', name: 'Interbeing Practice', description: 'Contemplate the interconnection of all things', category: 'interdependence', intensity: 3, duration: '15-30 min' },
  { id: 'ho-oponopono', name: 'Ho Oponopono', description: 'Ancient Hawaiian forgiveness for unity', category: 'forgiveness', intensity: 4, duration: '20-45 min' },
  { id: 'unity-breath', name: 'Unity Breath', description: 'Breath as one with the universe', category: 'connection', intensity: 2, duration: '10-20 min' },
  { id: 'oneness-activation', name: 'Oneness Activation', description: 'Activate awareness of universal unity', category: 'oneness', intensity: 5, duration: '45-90 min' },
  { id: 'harmonic-resonance', name: 'Harmonic Resonance', description: 'Align with universal frequencies of harmony', category: 'harmony', intensity: 3, duration: '25-50 min' },
  { id: 'compassion-flow', name: 'Compassion Flow', description: 'Open heart to all living beings', category: 'compassion', intensity: 3, duration: '30-60 min' },
];

// GET /api/unity/data - Get unity data
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
          { success: false, error: 'Unity practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return unity categories with weights
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: CATEGORIES });
    }

    // Return practice records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: PRACTICES });
    }

    // Default — return all unity data
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
        error: 'Failed to fetch unity data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}