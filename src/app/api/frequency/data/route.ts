// ============================================================
// FREQUENCY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Solfeggio and extended frequency data
// - Retrieve all frequencies
// - Filter by chakra
// - Filter by sefirot
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  FREQUENCIAS_SOLFEGGIO,
  FREQUENCIAS_EXTENDIDAS,
  getFrequenciaPorChakra,
  getFrequenciaPorSefirot,
} from '@/lib/frequencias/dados';

// GET /api/frequency/data - Get all frequency data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chakra = searchParams.get('chakra');
    const sefirot = searchParams.get('sefirot');
    const type = searchParams.get('type');

    // Extended frequencies only
    if (type === 'extended') {
      return NextResponse.json({ success: true, data: FREQUENCIAS_EXTENDIDAS });
    }

    // Solfeggio frequencies only
    if (type === 'solfeggio') {
      return NextResponse.json({ success: true, data: FREQUENCIAS_SOLFEGGIO });
    }

    // Filter by chakra
    if (chakra) {
      const chakraNum = parseInt(chakra, 10);
      if (isNaN(chakraNum) || chakraNum < 1 || chakraNum > 7) {
        return NextResponse.json(
          { success: false, error: 'Invalid chakra value (must be 1-7)' },
          { status: 400 }
        );
      }
      const result = getFrequenciaPorChakra(chakraNum);
      return NextResponse.json({ success: true, data: result });
    }

    // Filter by sefirot
    if (sefirot) {
      const result = getFrequenciaPorSefirot(sefirot);
      return NextResponse.json({ success: true, data: result });
    }

    // Default — return all frequencies (both Solfeggio and Extended)
    return NextResponse.json({
      success: true,
      data: {
        solfeggio: FREQUENCIAS_SOLFEGGIO,
        extended: FREQUENCIAS_EXTENDIDAS,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch frequency data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}