// ============================================================
// CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual calendar data
// - Events, rituals, and celebrations
// - Lunar phases and astrological periods
// - Sacred dates and numerological cycles
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: 'ritual' | 'celebration' | 'meditation' | 'cleansing' | 'new-moon' | 'full-moon' | 'solstice' | 'equinox';
  importance: 'low' | 'medium' | 'high' | 'sacred';
  associatedOrixa?: string;
  associatedElement?: 'fire' | 'water' | 'earth' | 'air' | 'ether';
}

interface LunarPhase {
  date: string;
  phase: 'new-moon' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full-moon' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number;
  isEclipse: boolean;
  ritualSuggestion?: string;
}

interface MoonData {
  lunarPhases: LunarPhase[];
  currentPhase: string;
  nextFullMoon: string;
  nextNewMoon: string;
}

interface SpiritualDate {
  date: string;
  name: string;
  description: string;
  significance: 'historical' | 'spiritual' | 'mythological';
  associatedOrixas: string[];
}

interface CalendarResponse {
  events: CalendarEvent[];
  moonData: MoonData;
  spiritualDates: SpiritualDate[];
  currentMonth: number;
  currentYear: number;
}

interface MonthParams {
  month?: number;
  year?: number;
  orixa?: string;
  type?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const LUNAR_CYCLE_DAYS = 29.53059;

const ORIFA_DATES: Omit<CalendarEvent, 'id'>[] = [
  {
    title: 'Yemanjá - Festa das Marés',
    description: 'Celebração à Rainha do Mar, orixá das águas profundas e da maternidade.',
    date: '12-15',
    type: 'celebration',
    importance: 'sacred',
    associatedOrixa: 'Yemanjá',
    associatedElement: 'water',
  },
  {
    title: 'Oxumaru - Senhor do Arco-Íris',
    description: 'Ritual de abundância e conexão entre os mundos espiritual e material.',
    date: '12-31',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Oxumaru',
    associatedElement: 'ether',
  },
  {
    title: 'Iemanjá - Dia da Mãe d\'Água',
    description: 'Oferecer flores, velas e presentes às águas em reverência à Iemanjá.',
    date: '01-01',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Yemanjá',
    associatedElement: 'water',
  },
  {
    title: 'Ogum - Dia do Ferreiro',
    description: 'Celebração do orixá do ferro, das guerras e do trabalho.',
    date: '04-23',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Ogum',
    associatedElement: 'fire',
  },
  {
    title: 'Xangô - Justiceiro',
    description: 'Ritual de justiça e equilíbrio, senhor das tempestades.',
    date: '06-30',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Xangô',
    associatedElement: 'fire',
  },
  {
    title: 'Iansã - Tempestade',
    description: 'Celebração da guerreira, dona dos raios e ventanias.',
    date: '12-08',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Iansã',
    associatedElement: 'air',
  },
  {
    title: 'Oxalufan - Oxalá do Pai',
    description: 'Dia mais sagrado para Oxalá, momento de purificação total.',
    date: '12-19',
    type: 'ritual',
    importance: 'sacred',
    associatedOrixa: 'Oxalá',
    associatedElement: 'ether',
  },
  {
    title: 'Nanã - Lamaçal',
    description: 'Celebração da anciã, orixá do lameiro e da morte física.',
    date: '10-12',
    type: 'ritual',
    importance: 'medium',
    associatedOrixa: 'Nanã',
    associatedElement: 'water',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateString(dateStr: string): { month: number; day: number } {
  const [month, day] = dateStr.split('-').map(Number);
  return { month: month - 1, day };
}

function calculateLunarPhase(date: Date): { phase: LunarPhase['phase']; illumination: number } {
  const knownNewMoon = new Date('2024-01-11');
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = ((daysSinceNewMoon % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;

  let phase: LunarPhase['phase'];
  if (lunarAge < 1.85) phase = 'new-moon';
  else if (lunarAge < 5.53) phase = 'waxing-crescent';
  else if (lunarAge < 9.22) phase = 'first-quarter';
  else if (lunarAge < 12.91) phase = 'waxing-gibbous';
  else if (lunarAge < 16.61) phase = 'full-moon';
  else if (lunarAge < 20.30) phase = 'waning-gibbous';
  else if (lunarAge < 23.99) phase = 'last-quarter';
  else if (lunarAge < 27.69) phase = 'waning-crescent';
  else phase = 'new-moon';

  const illumination = Math.round(50 * (1 - Math.cos((2 * Math.PI * lunarAge) / LUNAR_CYCLE_DAYS)));

  return { phase, illumination };
}

function generateLunarPhasesForMonth(month: number, year: number): LunarPhase[] {
  const phases: LunarPhase[] = [];
  const daysInMonth = getDaysInMonth(month, year);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const { phase, illumination } = calculateLunarPhase(date);

    if (phase === 'full-moon' || phase === 'new-moon') {
      phases.push({
        date: formatDate(year, month, day),
        phase,
        illumination,
        isEclipse: false,
        ritualSuggestion: phase === 'full-moon'
          ? 'Realize rituais de iluminação e releases. É momento de clareza emocional.'
          : 'Inicie novos projetos espirituais. Ideal para intenções e pactos.',
      });
    }
  }

  return phases;
}

function getEventsForDate(date: Date, year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const datePattern = `${monthStr}-${dayStr}`;

  for (const orixaDate of ORIFA_DATES) {
    if (orixaDate.date === datePattern) {
      events.push({
        id: `orixa-${orixaDate.title.toLowerCase().replace(/\s+/g, '-')}`,
        ...orixaDate,
        date: formatDate(year, date.getMonth(), date.getDate()),
      });
    }
  }

  return events;
}

function getNextFullMoon(date: Date): Date {
  const { phase } = calculateLunarPhase(date);
  let daysUntil = 0;

  if (phase !== 'full-moon') {
    const knownFullMoon = new Date('2024-01-25');
    const daysSinceKnown = (date.getTime() - knownFullMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePosition = ((daysSinceKnown % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
    daysUntil = cyclePosition < 14.77 ? 14.77 - cyclePosition : LUNAR_CYCLE_DAYS - cyclePosition + 14.77;
  }

  const nextFull = new Date(date);
  nextFull.setDate(nextFull.getDate() + Math.ceil(daysUntil));
  return nextFull;
}

function getNextNewMoon(date: Date): Date {
  const { phase } = calculateLunarPhase(date);
  let daysUntil = 0;

  if (phase !== 'new-moon') {
    const knownNewMoon = new Date('2024-01-11');
    const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePosition = ((daysSinceKnown % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
    daysUntil = cyclePosition < 14.77 ? 14.77 - cyclePosition : LUNAR_CYCLE_DAYS - cyclePosition + 14.77;
  }

  const nextNew = new Date(date);
  nextNew.setDate(nextNew.getDate() + Math.ceil(daysUntil));
  return nextNew;
}

function getAllEventsForMonth(month: number, year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = getDaysInMonth(month, year);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayEvents = getEventsForDate(date, year);
    events.push(...dayEvents);
  }

  return events;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = searchParams.has('month')
      ? parseInt(searchParams.get('month')!, 10) - 1
      : now.getMonth();
    const year = searchParams.has('year')
      ? parseInt(searchParams.get('year')!, 10)
      : now.getFullYear();
    const orixa = searchParams.get('orixa') || undefined;
    const type = searchParams.get('type') || undefined;

    if (month < 0 || month > 11) {
      return NextResponse.json(
        { error: 'Invalid month. Use 1-12.' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year. Use 1900-2100.' },
        { status: 400 }
      );
    }

    const date = new Date(year, month, 1);
    const { phase: currentPhase } = calculateLunarPhase(date);
    const nextFullMoonDate = getNextFullMoon(date);
    const nextNewMoonDate = getNextNewMoon(date);

    let events = getAllEventsForMonth(month, year);

    if (orixa) {
      events = events.filter(
        (e) => e.associatedOrixa?.toLowerCase() === orixa.toLowerCase()
      );
    }

    if (type) {
      events = events.filter((e) => e.type === type);
    }

    const lunarPhases = generateLunarPhasesForMonth(month, year);

    const spiritualDates: SpiritualDate[] = [
      {
        date: `${year}-01-01`,
        name: 'Ano Novo Spiritual',
        description: 'Momento de novas resoluções e intenção para o ano que se inicia.',
        significance: 'spiritual',
        associatedOrixas: ['Oxalá', 'Iemanjá'],
      },
      {
        date: `${year}-06-21`,
        name: 'Solstício de Inverno',
        description: 'Dia mais curto do ano, momento de reflexão e purificação.',
        significance: 'historical',
        associatedOrixas: ['Oxalá'],
      },
      {
        date: `${year}-12-21`,
        name: 'Solstício de Verão',
        description: 'Dia mais longo do ano, momento de alegria e celebração.',
        significance: 'historical',
        associatedOrixas: ['Ogum', 'Xangô'],
      },
    ];

    const response: CalendarResponse = {
      events,
      moonData: {
        lunarPhases,
        currentPhase,
        nextFullMoon: formatDate(
          nextFullMoonDate.getFullYear(),
          nextFullMoonDate.getMonth(),
          nextFullMoonDate.getDate()
        ),
        nextNewMoon: formatDate(
          nextNewMoonDate.getFullYear(),
          nextNewMoonDate.getMonth(),
          nextNewMoonDate.getDate()
        ),
      },
      spiritualDates: spiritualDates.filter(
        (sd) => new Date(sd.date).getMonth() === month
      ),
      currentMonth: month + 1,
      currentYear: year,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}