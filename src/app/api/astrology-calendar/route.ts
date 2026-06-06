// ============================================================
// ASTROLOGY CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { searchParamsToObject } from '@/lib/api/query-params';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const CalendarQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
  aspects: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Planet Spiritual Correlations ──────────────────────────────────────────
const PLANET_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  sol: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Eu sou a luz que ilumina meu caminho', frequency: '528 Hz' },
  lua: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A lua reflete minha verdade interior', frequency: '639 Hz' },
  mercurio: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A comunicação flui claramente através de mim', frequency: '741 Hz' },
  venus: { sefirot: ['Chesed', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a beleza fluem em minha vida', frequency: '528 Hz' },
  marte: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Tenho força e coragem para agir', frequency: '528 Hz' },
  jupiter: { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A abundância e sabedoria expandem minha jornada', frequency: '528 Hz' },
  saturno: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A disciplina me leva à mastersia espiritual', frequency: '396 Hz' },
  urano: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Sou um canal de luz para a inovação', frequency: '741 Hz' },
  netuno: { sefirot: ['Yesod', 'Netzach'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Dissolvo-me na luz divina com paz', frequency: '639 Hz' },
  plutão: { sefirot: ['Gevurah', 'Hod'], chakra: 5, element: 'Fogo', orixa: 'Ogum', affirmation: 'A transformação me traz renovação e poder', frequency: '417 Hz' },
};

// ─── Sign Spiritual Correlations ──────────────────────────────────────────
const SIGN_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  aries: { sefirot: ['Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio com coragem e determinação', frequency: '528 Hz' },
  touro: { sefirot: ['Venus', 'Chesed'], chakra: 2, element: 'Terra', orixa: 'Oxum', affirmation: 'A abundância flui através de mim', frequency: '396 Hz' },
  gemeos: { sefirot: ['Mercury', 'Hod'], chakra: 5, element: 'Ar', orixa: 'Iansã', affirmation: 'A comunicação é minha força', frequency: '741 Hz' },
  cancer: { sefirot: ['Moon', 'Yesod'], chakra: 4, element: 'Água', orixa: 'Iemanjá', affirmation: 'A intuição guia meu coração', frequency: '639 Hz' },
  leao: { sefirot: ['Sun', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Minha luz brilha com autenticidade', frequency: '528 Hz' },
  virgem: { sefirot: ['Mercury', 'Hod'], chakra: 3, element: 'Terra', orixa: 'Nanã', affirmation: 'O serviço com perfeição me fulfilled', frequency: '528 Hz' },
  libra: { sefirot: ['Venus', 'Netzach'], chakra: 4, element: 'Ar', orixa: 'Oxum', affirmation: 'O equilíbrio e harmonia guiam minhas escolhas', frequency: '528 Hz' },
  escorpiao: { sefirot: ['Pluto', 'Mars'], chakra: 1, element: 'Água', orixa: 'Ogum', affirmation: 'A transformação me traz poder e renovação', frequency: '417 Hz' },
  sagitario: { sefirot: ['Jupiter', 'Chokhmah'], chakra: 6, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A sabedoria expande minha visão', frequency: '741 Hz' },
  capricornio: { sefirot: ['Saturn', 'Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A disciplina me leva ao topo', frequency: '396 Hz' },
  aquario: { sefirot: ['Uranus', 'Saturn'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Sou um visionário do novo tempo', frequency: '741 Hz' },
  peixes: { sefirot: ['Neptune', 'Jupiter'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Minha espiritualidade dissolve limites', frequency: '639 Hz' },
};

// ─── Aspect Spiritual Correlations ──────────────────────────────────────────
const ASPECT_SPIRITUAL_CORRELATIONS: Record<string, {
  meaning: string;
  sefirot: string[];
  recommendation: string;
}> = {
  conjunction: { meaning: 'União de forças', sefirot: ['Kether'], recommendation: 'Integre as energias com consciência' },
  opposition: { meaning: 'Tensão criativa', sefirot: ['Gevurah', 'Chesed'], recommendation: 'Busque equilíbrio entre os opostos' },
  trine: { meaning: 'Harmonia natural', sefirot: ['Tipheret'], recommendation: 'Aproveite o fluxo harmonioso' },
  square: { meaning: 'Desafio construtivo', sefirot: ['Gevurah'], recommendation: 'Supere os obstáculos com perseverança' },
  sextile: { meaning: 'Oportunidade', sefirot: ['Netzach'], recommendation: 'Agradeça e aproveite as oportunidades' },
};

const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
] as const;
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;
type Planet = typeof PLANETS[number];
type Sign = typeof SIGNS[number];

interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  spiritualCorrelations: typeof ASPECT_SPIRITUAL_CORRELATIONS[string];
}

interface LunarPhase {
  phase: 'new' | 'waxing' | 'full' | 'waning';
  illumination: number;
  sign: Sign;
  spiritualCorrelations: {
    sefirot: string[];
    element: string;
    orixa: string;
    affirmation: string;
  };
}

interface TransitDay {
  date: string;
  moon_sign: Sign;
  aspects: Aspect[];
  retrograde_planets: Planet[];
  lunar_phase: LunarPhase;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

function getMoonSign(dayOfYear: number): Sign {
  const index = dayOfYear % 12;
  return SIGNS[index];
}

function getSpiritualCorrelationsForSign(sign: Sign) {
  return SIGN_SPIRITUAL_CORRELATIONS[sign.toLowerCase()] || SIGN_SPIRITUAL_CORRELATIONS.libra;
}

function generateAspects(dayOfYear: number): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectTypes: Aspect['type'][] = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

  for (let i = 0; i < 3; i++) {
    const planet1 = PLANETS[(dayOfYear + i) % 10];
    const planet2 = PLANETS[(dayOfYear * 2 + i) % 10];
    if (planet1 !== planet2) {
      const aspectType = aspectTypes[(dayOfYear + i) % 5];
      aspects.push({
        planet1,
        planet2,
        type: aspectType,
        orb: Math.round((Math.sin(dayOfYear * 0.5 + i) + 1) * 5),
        spiritualCorrelations: ASPECT_SPIRITUAL_CORRELATIONS[aspectType],
      });
    }
  }
  return aspects;
}

function getRetrogradePlanets(dayOfYear: number): Planet[] {
  const retrogrades: Planet[] = [];
  const checkPlanets: Planet[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

  checkPlanets.forEach((planet, i) => {
    const cycleLength = (i + 2) * 60;
    const position = dayOfYear % cycleLength;
    if (position > cycleLength * 0.4 && position < cycleLength * 0.55) {
      retrogrades.push(planet);
    }
  });
  return retrogrades;
}

function getLunarPhase(dayOfYear: number): LunarPhase {
  const phases: LunarPhase['phase'][] = ['new', 'waxing', 'full', 'waning'];
  const phaseIndex = Math.floor((dayOfYear % 28) / 7);
  const illumination = Math.abs(50 - ((dayOfYear % 28) / 28) * 100);
  const sign = SIGNS[(dayOfYear * 3) % 12];
  const signCorr = getSpiritualCorrelationsForSign(sign);

  return {
    phase: phases[phaseIndex],
    sign,
    illumination,
    spiritualCorrelations: {
      sefirot: signCorr.sefirot,
      element: signCorr.element,
      orixa: signCorr.orixa,
      affirmation: signCorr.affirmation,
    },
  };
}

function getSpiritualCorrelations(dayOfYear: number) {
  const sign = getMoonSign(dayOfYear);
  const signCorr = getSpiritualCorrelationsForSign(sign);
  return {
    sefirot: signCorr.sefirot,
    chakra: signCorr.chakra,
    element: signCorr.element,
    orixa: signCorr.orixa,
    affirmation: signCorr.affirmation,
    frequency: signCorr.frequency,
  };
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const parseResult = CalendarQuerySchema.safeParse(
      searchParamsToObject(searchParams, [
        'start', 'days', 'aspects', 'sefirot', 'chakra', 'element', 'orixa',
      ])
    );

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { start = new Date().toISOString().split('T')[0], days = 30, aspects = true } = parseResult.data;
    const startDate = new Date(start);
    const calendar: TransitDay[] = [];

    for (let i = 0; i < Math.min(days, 365); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      const spiritualCorr = getSpiritualCorrelations(dayOfYear);

      const day: TransitDay = {
        date: date.toISOString().split('T')[0],
        moon_sign: getMoonSign(dayOfYear),
        aspects: aspects ? generateAspects(dayOfYear) : [],
        retrograde_planets: getRetrogradePlanets(dayOfYear),
        lunar_phase: getLunarPhase(dayOfYear),
        spiritualCorrelations: spiritualCorr,
      };

      calendar.push(day);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byPlanet: PLANETS.reduce((acc, p) => {
        acc[p] = calendar.filter(d => 
          d.aspects.some(a => a.planet1 === p || a.planet2 === p)
        ).length;
        return acc;
      }, {} as Record<string, number>),
      byAspect: aspects ? ['conjunction', 'opposition', 'trine', 'square', 'sextile'].reduce((acc, a) => {
        acc[a] = calendar.reduce((sum, d) => sum + d.aspects.filter(aspect => aspect.type === a).length, 0);
        return acc;
      }, {} as Record<string, number>) : {},
      bySign: SIGNS.reduce((acc, s) => {
        acc[s] = calendar.filter(d => d.moon_sign === s).length;
        return acc;
      }, {} as Record<string, number>),
      byRetrograde: PLANETS.reduce((acc, p) => {
        acc[p] = calendar.filter(d => d.retrograde_planets.includes(p)).length;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      start_date: start,
      days: calendar.length,
      calendar,
      spiritualCorrelations: {
        planets: PLANET_SPIRITUAL_CORRELATIONS,
        signs: SIGN_SPIRITUAL_CORRELATIONS,
        aspects: ASPECT_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
    });
  } catch {
    return NextResponse.json({ 
      success: false,
      error: 'Erro ao processar calendário astrológico' 
    }, { status: 500 });
  }
}