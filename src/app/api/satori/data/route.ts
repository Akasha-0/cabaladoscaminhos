// ============================================================
// SATORI DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for satori data
// - Retrieve all satori practices
// - Retrieve single satori practice by ID
// - Retrieve satori categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface SatoriPractice {
  id: string;
  name: string;
  description: string;
  category: string;
  intensity: number;
  duration: string;
}

interface SatoriCategory {
  name: string;
  description: string;
  weight: number;
}

const CATEGORIES: SatoriCategory[] = [
  { name: 'awakening', description: 'Moments of direct perception of true nature', weight: 3 },
  { name: 'silence', description: 'Resting in open awareness beyond concepts', weight: 3 },
  { name: 'presence', description: 'Fully inhabiting the present moment', weight: 3 },
  { name: 'non-duality', description: 'Recognition of the undivided whole', weight: 2 },
  { name: 'spontaneous', description: 'Natural expression without effort', weight: 2 },
  { name: 'clarity', description: 'Clear seeing free from distortion', weight: 2 },
];

const PRACTICES: SatoriPractice[] = [
  { id: 'zazen', name: 'Zazen', description: 'Just sitting in open awareness', category: 'silence', intensity: 4, duration: '30-90 min' },
  { id: 'breath-awareness', name: 'Breath Awareness', description: 'Rest attention on the natural breath', category: 'presence', intensity: 2, duration: '15-30 min' },
  { id: 'koan-introspection', name: 'Koan Introspection', description: 'Investigate the great doubt', category: 'awakening', intensity: 5, duration: '45-120 min' },
  { id: 'self-inquiry', name: 'Self Inquiry', description: 'Who am I in this moment?', category: 'awakening', intensity: 4, duration: '30-60 min' },
  { id: 'open-awareness', name: 'Open Awareness', description: 'Rest as spacious consciousness', category: 'silence', intensity: 3, duration: '20-45 min' },
  { id: 'non-dual-reflection', name: 'Non-Dual Reflection', description: 'Recognize subject and object as one', category: 'non-duality', intensity: 4, duration: '30-60 min' },
  { id: 'spontaneous-presence', name: 'Spontaneous Presence', description: 'Allow actions to arise naturally', category: 'spontaneous', intensity: 3, duration: '25-50 min' },
  { id: 'clarity-meditation', name: 'Clarity Meditation', description: 'See phenomena as they truly are', category: 'clarity', intensity: 3, duration: '30-60 min' },
];

// GET /api/satori/data - Get satori data
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
          { success: false, error: 'Satori practice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return satori categories with weights
    if (type === 'categories') {
      return NextResponse.json({ success: true, data: CATEGORIES });
    }

    // Return practice records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: PRACTICES });
    }

    // Default — return all satori data
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
        error: 'Failed to fetch satori data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}