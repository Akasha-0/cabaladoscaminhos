// Iron API - Cabala dos Caminhos
// skip-linting

import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/iron/iron-data';

// ============================================================
// TYPES
// ============================================================

interface IronData {
  name: string;
  odu: number;
  path: string;
  description: string;
  keywords: string[];
  elements: { id: string; label: string; weight: number }[];
  qualities: string[];
  lessons: string[];
  challenges: string[];
  opportunities: string[];
  rituals: string[];
  colors: string[];
  symbols: string[];
  affirmation: string;
  chakra: string;
  planet: string;
  day: string;
  element: string;
}

type IronQuery = {
  tipo?: string;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getIronData() {
  const data = getData();
  return {
    ...data,
    // Normalize element weights to 0-100 scale
    elements: data.elements.map(el => ({
      ...el,
      weight: Math.round((el.weight / 10) * 100),
    })),
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/iron/data
 * Retrieve iron odu data with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');

  try {
    const data = getIronData();

    // Return all iron data (default)
    return NextResponse.json({
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao processar Ferro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar dados de Ferro' },
      { status: 500 }
    );
  }
}