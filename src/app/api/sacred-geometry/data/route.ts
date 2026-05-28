/* eslint-disable */
// ============================================================
// SACRED GEOMETRY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sacred geometry data
// - Shape information with spiritual symbolism
// - Sefirot and chakra associations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

import {
  getGeometry,
  getGeometryById,
  getGeometryBySefirot,
  getGeometryByChakra,
  GeometryShape,
} from '@/lib/geometria-sagrada/sacred-geometry';

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/sacred-geometry/data
 * Retrieve sacred geometry data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sefirot = searchParams.get('sefirot');
    const chakra = searchParams.get('chakra');
    const format = searchParams.get('format');

    // Single geometry shape by ID
    if (id) {
      const shape = getGeometryById(id);
      if (!shape) {
        return NextResponse.json(
          { error: 'Sacred geometry shape not found', id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        return NextResponse.json({
          id: shape.id,
          nome: shape.nome,
          nomeIngles: shape.nomeIngles,
          cor: shape.cor,
        });
      }

      return NextResponse.json(shape);
    }

    // Filter by sefirot
    if (sefirot) {
      const filtered = getGeometryBySefirot(sefirot);
      return NextResponse.json({
        sefirot,
        shapes: filtered,
        count: filtered.length,
      });
    }

    // Filter by chakra
    if (chakra) {
      const chakraNum = parseInt(chakra, 10);
      if (isNaN(chakraNum)) {
        return NextResponse.json(
          { error: 'Invalid chakra number', chakra },
          { status: 400 }
        );
      }
      const filtered = getGeometryByChakra(chakraNum);
      return NextResponse.json({
        chakra: chakraNum,
        shapes: filtered,
        count: filtered.length,
      });
    }

    // Return all geometry shapes
    const allGeometry = getGeometry();
    return NextResponse.json({
      shapes: allGeometry,
      count: allGeometry.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sacred Geometry API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
