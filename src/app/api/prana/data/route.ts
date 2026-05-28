// ============================================================
// PRANA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for prana (vital life force)
// - List all prana types
// - Get specific prana by ID
// - Get prana by element or chakra
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { pranaData, type PranaData } from '@/lib/prana/prana-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Return single prana by ID
    if (id) {
      const prana = pranaData.find((p) => p.id === id);
      if (!prana) {
        return NextResponse.json(
          { success: false, error: 'Prana type not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: prana });
    }

    // Return prana by element
    if (type === 'element') {
      const element = searchParams.get('element');
      if (!element) {
        return NextResponse.json(
          { success: false, error: 'Element parameter required' },
          { status: 400 }
        );
      }
      const filtered = pranaData.filter(
        (p) => p.attributes.element.toLowerCase().includes(element.toLowerCase())
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return prana by chakra
    if (type === 'chakra') {
      const chakra = searchParams.get('chakra');
      if (!chakra) {
        return NextResponse.json(
          { success: false, error: 'Chakra parameter required' },
          { status: 400 }
        );
      }
      const filtered = pranaData.filter(
        (p) => p.attributes.chakra.toLowerCase().includes(chakra.toLowerCase())
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return prana by direction
    if (type === 'direction') {
      const direction = searchParams.get('direction');
      if (!direction) {
        return NextResponse.json(
          { success: false, error: 'Direction parameter required' },
          { status: 400 }
        );
      }
      const filtered = pranaData.filter(
        (p) => p.attributes.direction.toLowerCase().includes(direction.toLowerCase())
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return all prana data
    return NextResponse.json({
      success: true,
      data: pranaData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prana data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}