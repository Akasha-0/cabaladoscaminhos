import { NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CalendarQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
  aspects: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
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
}

interface LunarPhase {
  phase: 'new' | 'waxing' | 'full' | 'waning';
  illumination: number;
  sign: Sign;
}

interface TransitDay {
  date: string;
  moon_sign: Sign;
  aspects: Aspect[];
  retrograde_planets: Planet[];
  lunar_phase: LunarPhase;
}

function getMoonSign(dayOfYear: number): Sign {
  const index = dayOfYear % 12;
  return SIGNS[index];
}

function generateAspects(dayOfYear: number): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectTypes: Aspect['type'][] = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

  for (let i = 0; i < 3; i++) {
    const planet1 = PLANETS[(dayOfYear + i) % 10];
    const planet2 = PLANETS[(dayOfYear * 2 + i) % 10];
    if (planet1 !== planet2) {
      aspects.push({
        planet1,
        planet2,
        type: aspectTypes[(dayOfYear + i) % 5],
        orb: Math.round((Math.sin(dayOfYear * 0.5 + i) + 1) * 5)
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

  return {
    phase: phases[phaseIndex],
    sign: SIGNS[(dayOfYear * 3) % 12]
  };
};
export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const parseResult = CalendarQuerySchema.safeParse({
      start: searchParams.get('start'),
      days: searchParams.get('days'),
      aspects: searchParams.get('aspects'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
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
      const day: TransitDay = {
        date: date.toISOString().split('T')[0],
        moon_sign: getMoonSign(dayOfYear),
        aspects: aspects ? generateAspects(dayOfYear) : [],
        retrograde_planets: getRetrogradePlanets(dayOfYear),
        lunar_phase: getLunarPhase(dayOfYear)
      };
      calendar.push(day);
    }
    return NextResponse.json({
      start_date: start.toISOString().split('T')[0],
      days: calendar.length,
      calendar
  } catch {
    return NextResponse.json({ error: 'Erro ao processar calendário astrológico' }, { status: 500 });
  }
}
}