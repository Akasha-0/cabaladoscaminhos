// ============================================================
// SAMADHI DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for samadhi data
// - Retrieve all samadhi states
// - Retrieve single samadhi state by ID
// - Retrieve samadhi types and descriptions
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Samadhi states data
interface SamadhiState {
  id: string;
  name: string;
  sanskrit: string;
  description: string;
  stage: number;
  attributes: string[];
  practices: string[];
  level: 'preliminary' | 'access' | 'absorption' | 'nirodha';
}

const samadhiStates: SamadhiState[] = [
  {
    id: 'laya',
    name: 'Laya Samadhi',
    sanskrit: 'लय',
    description: 'Point of dissolution where consciousness merges with object',
    stage: 1,
    attributes: ['absorption', 'dissolution', 'merging'],
    practices: ['concentration', 'absorption'],
    level: 'preliminary',
  },
  {
    id: 'sahaja',
    name: 'Sahaja Samadhi',
    sanskrit: 'सहज',
    description: 'Natural, effortless state of cosmic consciousness',
    stage: 2,
    attributes: ['spontaneity', 'effortlessness', 'natural-state'],
    practices: ['sahaja-yoga', 'self-realization'],
    level: 'access',
  },
  {
    id: 'savikalpa',
    name: 'Savikalpa Samadhi',
    sanskrit: 'सविकल्प',
    description: 'Absorption with subtle distinction, seed of impression remains',
    stage: 3,
    attributes: ['partial-absorption', 'subtle-distinction', 'seed-impression'],
    practices: ['deep-meditation', 'samadhi-practice'],
    level: 'absorption',
  },
  {
    id: 'nirvikalpa',
    name: 'Nirvikalpa Samadhi',
    sanskrit: 'निर्विकल्प',
    description: 'Absorption without distinction, complete oneness',
    stage: 4,
    attributes: ['complete-absorption', 'no-distinction', 'oneness'],
    practices: ['complete-samadhi', 'nirvana-practice'],
    level: 'absorption',
  },
  {
    id: 'kaivalya',
    name: 'Kaivalya Samadhi',
    sanskrit: 'कैवल्य',
    description: 'Absolute isolation, liberation from all conditionings',
    stage: 5,
    attributes: ['isolation', 'liberation', 'absolute-freedom'],
    practices: ['kaivalya-marga', 'liberation-practice'],
    level: 'nirodha',
  },
  {
    id: 'dhyana',
    name: 'Dhyana Samadhi',
    sanskrit: 'ध्यान',
    description: 'Meditative absorption, deep contemplation state',
    stage: 6,
    attributes: ['contemplation', 'steady-focus', 'inner-peace'],
    practices: ['dhyana', 'contemplative-practice'],
    level: 'absorption',
  },
];

// GET /api/samadhi/data - Get samadhi data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const level = searchParams.get('level');

    // Return single samadhi state by ID
    if (id) {
      const state = samadhiStates.find((s) => s.id === id);
      if (!state) {
        return NextResponse.json(
          { success: false, error: 'Samadhi state not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: state });
    }

    // Return samadhi states filtered by level
    if (level) {
      const filtered = samadhiStates.filter((s) => s.level === level);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return all samadhi states
    return NextResponse.json({ success: true, data: samadhiStates });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch samadhi data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
