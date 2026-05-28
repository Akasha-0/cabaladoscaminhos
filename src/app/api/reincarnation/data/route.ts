// ============================================================
// REINCARNATION DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for reincarnation data
// - Retrieve all reincarnation records
// - Retrieve soul cycles
// - Retrieve past life archetypes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getData, type ReincarnationRecord, type SoulCycle, type PastLifeArchetype } from '@/lib/reincarnation/reincarnation-data';

// GET /api/reincarnation/data - Get reincarnation data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const { reincarnationRecords, soulCycles, archetypes } = getData();

    // Return single reincarnation record by ID
    if (id) {
      const record = reincarnationRecords.find((r) => r.id === id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Reincarnation record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return past life archetypes
    if (type === 'archetypes') {
      return NextResponse.json({ success: true, data: archetypes });
    }

    // Return soul cycles only
    if (type === 'cycles') {
      return NextResponse.json({ success: true, data: soulCycles });
    }

    // Return reincarnation records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: reincarnationRecords });
    }

    // Default — return all reincarnation data
    return NextResponse.json({
      success: true,
      data: {
        records: reincarnationRecords,
        cycles: soulCycles,
        archetypes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reincarnation data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
