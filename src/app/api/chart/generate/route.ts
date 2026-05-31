// ============================================================
// CHART GENERATE API - CABALA DOS CAMINHOS
// ============================================================
// POST endpoint for generating astrological charts
// Supports natal, transit, progression, synastry, composite, hora-igual charts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getChartById, type ChartType, type ChartStyle } from '@/lib/charts/library';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const chartGenerateSchema = z.object({
  type: z.enum(['natal', 'transito', 'progressao', 'sinostry', 'composito', 'hora-igual']),
  date: z.string().optional(),
  time: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  style: z.enum(['radix', 'quadrate', 'equal', 'whole-sign']).optional(),
  houseSystem: z.enum(['placidus', 'koch', 'regiomontanus', 'campanus', 'whole-sign']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Chart Types ──────────────────────────────────────────
const CHART_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  natal: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O mapa natal revela minha essência divina',
    frequency: '963 Hz',
  },
  transito: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Os trânsitos celestiais me guiam',
    frequency: '741 Hz',
  },
  progressao: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A progressão revela minha evolução',
    frequency: '639 Hz',
  },
  sinostry: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A sinastria revela conexões cósmicas',
    frequency: '528 Hz',
  },
  composito: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O gráfico composto une duas almas',
    frequency: '528 Hz',
  },
  'hora-igual': {
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A hora igual revela o momento presente',
    frequency: '963 Hz',
  },
};

// ─── Spiritual Correlations for Zodiac Signs ──────────────────────────────────────────
const SIGN_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  aries: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 1,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A coragem de Áries me impulsiona',
    frequency: '528 Hz',
  },
  touro: {
    sefirot: ['Venus', 'Malkuth'],
    chakra: 2,
    element: 'Terra',
    orixa: 'Oxum',
    affirmation: 'A força de Touro me ancora',
    frequency: '396 Hz',
  },
  gemeos: {
    sefirot: ['Mercury', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A mente de Gêmeos me conecta',
    frequency: '639 Hz',
  },
  cancer: {
    sefirot: ['Moon', 'Yesod'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A sensibilidade de Câncer me nutre',
    frequency: '417 Hz',
  },
  leao: {
    sefirot: ['Sun', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O brilho de Leão me ilumina',
    frequency: '528 Hz',
  },
  virgem: {
    sefirot: ['Mercury', 'Hod'],
    chakra: 5,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'A precisão de Virgem me orienta',
    frequency: '528 Hz',
  },
  libra: {
    sefirot: ['Venus', 'Hod'],
    chakra: 4,
    element: 'Ar',
    orixa: 'Oxum',
    affirmation: 'A harmonia de Libra me equilibra',
    frequency: '528 Hz',
  },
  escorpiao: {
    sefirot: ['Pluto', 'Gevurah'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A profundidade de Escorpião me transforma',
    frequency: '417 Hz',
  },
  sagitario: {
    sefirot: ['Jupiter', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A expansão de Sagitário me liberta',
    frequency: '741 Hz',
  },
  capricornio: {
    sefirot: ['Saturn', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'A disciplina de Capricórnio me fortalece',
    frequency: '396 Hz',
  },
  aquario: {
    sefirot: ['Uranus', 'Aquarius'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A inovação de Aquário me liberta',
    frequency: '639 Hz',
  },
  peixes: {
    sefirot: ['Neptune', 'Yesod'],
    chakra: 7,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A intuição de Peixes me conecta ao divino',
    frequency: '417 Hz',
  },
};

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
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface ChartGenerateResponse {
  success: boolean;
  chart: ChartData;
  metadata: {
    calculationTime: string;
    accuracy: string;
  };
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
  spiritualStats: {
    byPlanet: Record<string, number>;
    bySign: Record<string, number>;
    bySefirot: Record<string, number>;
    byChakra: Record<string, number>;
    byElement: Record<string, number>;
    byOrixa: Record<string, number>;
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
    3: { sign: 'gemini', degree: 15 },
    4: { sign: 'cancer', degree: 8 },
    5: { sign: 'leo', degree: 20 },
    6: { sign: 'virgo', degree: 12 },
    7: { sign: 'libra', degree: 10 },
    8: { sign: 'scorpio', degree: 22 },
9: { sign: 'sagittarius', degree: 15 },
    10: { sign: 'capricorn', degree: 8 },
    11: { sign: 'aquarius', degree: 20 },
    12: { sign: 'pisces', degree: 12 },
  };
}

function calculateAspects(planets: Record<string, unknown>): Record<string, unknown> {
  // Placeholder for aspect calculation
  return {
    sun_moon: { aspect: 'trine', orb: 2 },
    sun_venus: { aspect: 'conjunct', orb: 0 },
    mars_saturn: { aspect: 'square', orb: 1 },
  };
}

function getPlanetElement(sign: string): string {
  const fireSigns = ['aries', 'leo', 'sagittarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];

  if (fireSigns.includes(sign)) return 'Fogo';
  if (waterSigns.includes(sign)) return 'Água';
  if (airSigns.includes(sign)) return 'Ar';
  if (earthSigns.includes(sign)) return 'Terra';
  return 'Éter';
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = chartGenerateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, date, time, latitude, longitude, timezone, style, houseSystem } = parseResult.data;
    const chartId = generateChartId();
    const startTime = Date.now();

    const planets = calculatePlanets(date || new Date().toISOString(), time);
    const houses = calculateHouses(
      date || new Date().toISOString(),
      latitude || 0,
      longitude || 0,
      houseSystem || 'placidus'
    );
    const aspects = calculateAspects(planets);

    const chart: ChartData = {
      id: chartId,
      type,
      planets,
      houses,
      aspects,
      style: style || 'radix',
      houseSystem: houseSystem || 'placidus',
      createdAt: new Date().toISOString(),
      sefirot: CHART_SPIRITUAL_CORRELATIONS[type].sefirot,
      chakra: CHART_SPIRITUAL_CORRELATIONS[type].chakra,
      element: CHART_SPIRITUAL_CORRELATIONS[type].element,
      orixa: CHART_SPIRITUAL_CORRELATIONS[type].orixa,
      affirmation: CHART_SPIRITUAL_CORRELATIONS[type].affirmation,
      frequency: CHART_SPIRITUAL_CORRELATIONS[type].frequency,
      spiritualCorrelations: CHART_SPIRITUAL_CORRELATIONS[type],
    };

    // Calculate spiritual stats
    const planetSigns = Object.entries(planets).reduce((acc, [planet, data]) => {
      const planetData = data as { sign: string };
      acc[planet] = planetData.sign;
      return acc;
    }, {} as Record<string, string>);

    const spiritualStats = {
      byPlanet: Object.keys(planets).reduce((acc, planet) => {
        acc[planet] = 1;
        return acc;
      }, {} as Record<string, number>),
      bySign: Object.values(planetSigns).reduce((acc, sign) => {
        acc[sign] = (acc[sign] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: CHART_SPIRITUAL_CORRELATIONS[type].sefirot.reduce((acc, s) => {
        acc[s] = 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: { [CHART_SPIRITUAL_CORRELATIONS[type].chakra]: 1 },
      byElement: { [CHART_SPIRITUAL_CORRELATIONS[type].element]: 1 },
      byOrixa: { [CHART_SPIRITUAL_CORRELATIONS[type].orixa]: 1 },
    };

    const response: ChartGenerateResponse = {
      success: true,
      chart,
      metadata: {
        calculationTime: `${Date.now() - startTime}ms`,
        accuracy: 'approximate',
      },
      spiritualCorrelations: CHART_SPIRITUAL_CORRELATIONS[type],
      spiritualStats,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Chart generation failed',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chartId = searchParams.get('id');

  if (!chartId) {
    return NextResponse.json({
      success: false,
      error: 'Chart ID is required',
    }, { status: 400 });
  }

  const chart = getChartById(chartId);

  if (!chart) {
    return NextResponse.json({
      success: false,
      error: 'Chart not found',
    }, { status: 404 });
  }

  // Add spiritual correlations based on chart type
  const correlations = CHART_SPIRITUAL_CORRELATIONS[chart.type] || CHART_SPIRITUAL_CORRELATIONS.natal;

  return NextResponse.json({
    success: true,
    chart: {
      ...chart,
      sefirot: correlations.sefirot,
      chakra: correlations.chakra,
      element: correlations.element,
      orixa: correlations.orixa,
      affirmation: correlations.affirmation,
      frequency: correlations.frequency,
      spiritualCorrelations: correlations,
    },
    spiritualCorrelations: correlations,
  });
}