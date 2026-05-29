// ============================================================
// CHART GENERATE API - CABALA DOS CAMINHOS
// ============================================================
// POST endpoint for generating astrological charts
// Supports natal, transit, progression, synastry, composite, andhora-igual charts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getChartById, type ChartType, type ChartStyle } from '@/lib/charts/library';

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const chartGenerateSchema = z.object({
  type: z.enum(['natal', 'transito', 'progressao', 'sinostry', 'composito', 'hora-igual']),
  date: z.string().optional(),
  time: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  style: z.enum(['radix', 'quadrate', 'equal', 'whole-sign']).optional(),
  houseSystem: z.enum(['placidus', 'koch', 'regiomontanus', 'campanus', 'whole-sign']).optional(),
});

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface ChartData {
  id: string;
  type: ChartType;
  planets: Record<string, unknown>;
  houses: Record<string, unknown>;
  aspects: Record<string, unknown>;
  style: ChartStyle;
  houseSystem: string;
  createdAt: string;
}

interface ChartGenerateResponse {
  success: boolean;
  chart: ChartData;
  metadata: {
    calculationTime: string;
    accuracy: string;
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateChartId(): string {
  return `chart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculatePlanets(date: string, _time?: string): Record<string, unknown> {
  // Placeholder for planet position calculation
  return {
    sun: { sign: 'aries', degree: 15 },
    moon: { sign: 'cancer', degree: 22 },
    mercury: { sign: 'pisces', degree: 8 },
    venus: { sign: 'aquarius', degree: 3 },
    mars: { sign: 'capricorn', degree: 27 },
    jupiter: { sign: 'sagittarius', degree: 12 },
    saturn: { sign: 'capricorn', degree: 5 },
    uranus: { sign: 'aries', degree: 18 },
    neptune: { sign: 'pisces', degree: 23 },
    pluto: { sign: 'sagittarius', degree: 27 },
  };
}

function calculateHouses(
  _date: string,
  _lat: number,
  _lng: number,
  _houseSystem: string
): Record<string, unknown> {
  // Placeholder for house calculation
  return {
    1: { sign: 'aries', degree: 10 },
    2: { sign: 'taurus', degree: 22 },
    3: { sign: 'gemini', degree: 5 },
    4: { sign: 'cancer', degree: 18 },
    5: { sign: 'leo', degree: 2 },
    6: { sign: 'virgo', degree: 15 },
    7: { sign: 'libra', degree: 10 },
    8: { sign: 'scorpio', degree: 22 },
    9: { sign: 'sagittarius', degree: 5 },
    10: { sign: 'capricorn', degree: 18 },
    11: { sign: 'aquarius', degree: 2 },
    12: { sign: 'pisces', degree: 15 },
  };
}

function calculateAspects(_planets: Record<string, unknown>): Record<string, unknown> {
  // Placeholder for aspect calculation
  return {
    sunMoon: { type: 'trine', orb: 3.5 },
    sunMercury: { type: 'conjunction', orb: 7.2 },
    venusMars: { type: 'square', orb: 1.8 },
  };
}

function getDefaultChartStyle(type: ChartType): ChartStyle {
  switch (type) {
    case 'natal':
      return 'radix';
    case 'transito':
      return 'quadrate';
    case 'progressao':
      return 'equal';
    case 'sinostry':
      return 'whole-sign';
    case 'composito':
      return 'radix';
    case 'hora-igual':
      return 'equal';
    default:
      return 'radix';
  }
}

function getAccuracy(type: ChartType): string {
  switch (type) {
    case 'natal':
      return 'high';
    case 'transito':
      return 'medium';
    case 'progressao':
      return 'medium';
    case 'sinostry':
      return 'high';
    case 'composito':
      return 'medium';
    case 'hora-igual':
      return 'low';
    default:
      return 'medium';
  }
}

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = chartGenerateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const dateStr = data.date || new Date().toISOString();
    
    const planets = calculatePlanets(dateStr, data.time);
    const houseSystem = data.houseSystem || 'placidus';
    const houses = calculateHouses(
      dateStr,
      data.latitude || 0,
      data.longitude || 0,
      houseSystem
    );
    const aspects = calculateAspects(planets);
    const style = data.style || getDefaultChartStyle(data.type);

    const chart: ChartData = {
      id: generateChartId(),
      type: data.type,
      planets,
      houses,
      aspects,
      style,
      houseSystem,
      createdAt: new Date().toISOString(),
    };

    const response: ChartGenerateResponse = {
      success: true,
      chart,
      metadata: {
        calculationTime: new Date().toISOString(),
        accuracy: getAccuracy(data.type),
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}

// GET endpoint to get available chart types
export async function GET() {
  return NextResponse.json({
    types: [
      { id: 'natal', name: 'Mapa Natal', description: 'Birth chart calculation' },
      { id: 'transito', name: 'Trânsito', description: 'Current planetary transits' },
      { id: 'progressao', name: 'Progressão', description: 'Secondary progression' },
      { id: 'sinostry', name: 'Sinastria', description: 'Relationship compatibility' },
      { id: 'composito', name: 'Comósito', description: 'Composite chart' },
      { id: 'hora-igual', name: 'Hora Igual', description: 'Equal house system' },
    ],
    styles: [
      { id: 'radix', name: 'Radix', description: 'Traditional whole sign' },
      { id: 'quadrate', name: 'Quadrifáero', description: 'Four quadrants' },
      { id: 'equal', name: 'Equal', description: 'Equal houses' },
      { id: 'whole-sign', name: 'Whole Sign', description: 'Whole sign houses' },
    ],
    houseSystems: [
      { id: 'placidus', name: 'Placidus' },
      { id: 'koch', name: 'Koch' },
      { id: 'regiomontanus', name: 'Regiomontanus' },
      { id: 'campanus', name: 'Campanus' },
      { id: 'whole-sign', name: 'Whole Sign' },
    ],
  });
}
