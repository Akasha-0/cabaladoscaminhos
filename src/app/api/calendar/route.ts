// ============================================================
// CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CalendarQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  orixa: z.string().optional(),
  type: z.enum(['orixa', 'ritual', 'lunar', 'sacred', 'celestial']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
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
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface LunarPhase {
  date: string;
  phase: 'new-moon' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full-moon' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number;
  isEclipse: boolean;
  ritualSuggestion?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
  };
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
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    affirmation: string;
  };
}

// ─── Orixá Event Correlations ──────────────────────────────────────────────────────────
const ORIXA_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  affirmation: string;
}> = {
  'Yemanjá': { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', affirmation: 'Iemanjá protege e abençoa minha jornada' },
  'Oxumaru': { sefirot: ['Netzach', 'Hod'], chakra: 4, element: 'Fogo', affirmation: 'Oxumaru conecta mundos e traz abundância' },
  'Ogum': { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', affirmation: 'Ogum abre caminhos e protege' },
  'Xangô': { sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', affirmation: 'Xangô traz justiça e transformação' },
  'Oxum': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', affirmation: 'Oxum adorna minha vida com prosperidade' },
  'Iansã': { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', affirmation: 'Iansã me dá coragem para vencer' },
  'Oxalá': { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', affirmation: 'Oxalá ilumina minha paz eterna' },
  'Oxóssi': { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Ar', affirmation: 'Oxóssi me guia na trilha da sabedoria' },
  'Nanã': { sefirot: ['Yesod', 'Binah'], chakra: 2, element: 'Água', affirmation: 'Nanã revela sabedoria ancestral' },
  'Eshu': { sefirot: ['Hod', 'Gevurah'], chakra: 1, element: 'Terra', affirmation: 'Eshu abre portais e protege o caminho' },
};

// ─── Lunar Phase Correlations ──────────────────────────────────────────────────────────
const LUNAR_PHASE_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  affirmation: string;
}> = {
  'new-moon': { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', affirmation: 'Na lua nova, planto intenções de luz' },
  'waxing-crescent': { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', affirmation: 'A lua crescente fortalece minha intenção' },
  'first-quarter': { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', affirmation: 'Na primeira quartera, tomo ação decisiva' },
  'waxing-gibbous': { sefirot: ['Tipheret'], chakra: 5, element: 'Ar', affirmation: 'A lua gibosa refina minha energia' },
  'full-moon': { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', affirmation: 'Na lua cheia, celebro minha transformação' },
  'waning-gibbous': { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', affirmation: 'A lua gibosa minguante distribui gratidão' },
  'last-quarter': { sefirot: ['Hod'], chakra: 5, element: 'Ar', affirmation: 'Na última quartera, perdoo e libero' },
  'waning-crescent': { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', affirmation: 'Na lua minguante, descanso e reflito' },
};

// ─── CONSTANTS ──────────────────────────────────────────────────────────
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
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Yemanjá'],
  },
  {
    title: 'Oxumaru - Senhor do Arco-Íris',
    description: 'Ritual de abundância e conexão entre os mundos espiritual e material.',
    date: '12-31',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Oxumaru',
    associatedElement: 'ether',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Oxumaru'],
  },
  {
    title: 'Ogum - Dia do Ferro',
    description: 'Celebração ao patrono do trabalho e das batalhas, senhor das ferramentas.',
    date: '04-21',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Ogum',
    associatedElement: 'earth',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Ogum'],
  },
  {
    title: 'Xangô - Fogo de Justiça',
    description: 'Celebração ao deus do trovão, senhor da justiça e da transformação.',
    date: '12-04',
    type: 'celebration',
    importance: 'high',
    associatedOrixa: 'Xangô',
    associatedElement: 'fire',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Xangô'],
  },
  {
    title: 'Oxum - Rainha das Águas Doces',
    description: 'Celebração à deusa do amor, da beleza e das águas doces.',
    date: '12-08',
    type: 'celebration',
    importance: 'sacred',
    associatedOrixa: 'Oxum',
    associatedElement: 'water',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Oxum'],
  },
  {
    title: 'Iansã - Senhora das Tempestades',
    description: 'Celebração à guerreira, senhora dos raios e da transformação.',
    date: '12-15',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Iansã',
    associatedElement: 'fire',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Iansã'],
  },
  {
    title: 'Oxalá - Paz Eterna',
    description: 'Celebração ao criador supremo, senhor da paz e da luz branca.',
    date: '12-18',
    type: 'celebration',
    importance: 'sacred',
    associatedOrixa: 'Oxalá',
    associatedElement: 'ether',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Oxalá'],
  },
  {
    title: 'Oxóssi - Caçador Divino',
    description: 'Celebração ao deus das matas, senhor da caça e da sabedoria.',
    date: '12-20',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Oxóssi',
    associatedElement: 'air',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Oxóssi'],
  },
  {
    title: 'Nanã - Mãe das Sombras',
    description: 'Celebração à anciã, senhora das águas paradas e da sabedoria oculta.',
    date: '12-25',
    type: 'ritual',
    importance: 'medium',
    associatedOrixa: 'Nanã',
    associatedElement: 'water',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Nanã'],
  },
  {
    title: 'Eshu - Senhor das Encruzilhadas',
    description: 'Celebração ao mensageiro, senhor das encruzilhadas e do destino.',
    date: '12-13',
    type: 'ritual',
    importance: 'high',
    associatedOrixa: 'Eshu',
    associatedElement: 'earth',
    spiritualCorrelations: ORIXA_SPIRITUAL_CORRELATIONS['Eshu'],
  },
];

// ─── Lunar Phase Calculation ──────────────────────────────────────────────────────────
function getLunarPhase(date: Date): { phase: LunarPhase['phase']; illumination: number } {
  const referenceNewMoon = new Date('2024-01-11').getTime();
  const daysSinceNewMoon = (date.getTime() - referenceNewMoon) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_CYCLE_DAYS;
  
  const phases: Array<{ name: LunarPhase['phase']; start: number }> = [
    { name: 'new-moon', start: 0 },
    { name: 'waxing-crescent', start: 1.5 },
    { name: 'first-quarter', start: 7.3 },
    { name: 'waxing-gibbous', start: 9.8 },
    { name: 'full-moon', start: 14.7 },
    { name: 'waning-gibbous', start: 16.2 },
    { name: 'last-quarter', start: 22.1 },
    { name: 'waning-crescent', start: 23.5 },
  ];

  let currentPhase = phases[0].name;
  for (const p of phases) {
    if (lunarAge >= p.start) currentPhase = p.name;
  }

  const illumination = Math.round(50 * (1 - Math.cos((2 * Math.PI * lunarAge) / LUNAR_CYCLE_DAYS)));

  return { phase: currentPhase, illumination };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = CalendarQuerySchema.safeParse({
      month: searchParams.get('month'),
      year: searchParams.get('year'),
      orixa: searchParams.get('orixa'),
      type: searchParams.get('type'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { month, year, orixa, type, sefirot, chakra, element } = parseResult.data;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Build events with spiritual correlations
    let events = ORIFA_DATES.map((event, index) => ({
      ...event,
      id: `orixa-${index + 1}`,
    }));

    // Filter by orixa
    if (orixa) {
      events = events.filter(e => e.associatedOrixa?.toLowerCase().includes(orixa.toLowerCase()));
    }

    // Filter by type
    if (type && type !== 'orixa') {
      events = events.filter(e => e.type === type);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      events = events.filter(e => e.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      events = events.filter(e => e.spiritualCorrelations?.chakra === chakra);
    }
    if (element) {
      events = events.filter(e => {
        const el = e.spiritualCorrelations?.element?.toLowerCase() || '';
        return el === element.toLowerCase();
      });
    }

    // Generate lunar phases for the month
    const lunarPhases: LunarPhase[] = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const { phase, illumination } = getLunarPhase(date);
      
      lunarPhases.push({
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        phase,
        illumination,
        isEclipse: phase === 'full-moon' || phase === 'new-moon',
        ritualSuggestion: phase === 'full-moon' ? 'Ritual de liberação e gratidão' : 
                         phase === 'new-moon' ? 'Ritual de intenções e pedidos' : 'Prática de contemplação',
        spiritualCorrelations: LUNAR_PHASE_CORRELATIONS[phase],
      });
    }

    const currentPhaseData = lunarPhases.find(p => p.date === new Date().toISOString().split('T')[0]) || lunarPhases[0];
    const nextFullMoonPhase = lunarPhases.find(p => p.phase === 'full-moon');
    const nextNewMoonPhase = lunarPhases.find(p => p.phase === 'new-moon');

    const moonData: MoonData = {
      lunarPhases,
      currentPhase: currentPhaseData.phase,
      nextFullMoon: nextFullMoonPhase?.date || 'N/A',
      nextNewMoon: nextNewMoonPhase?.date || 'N/A',
    };

    // Statistics
    const stats = {
      byImportance: events.reduce((acc, e) => {
        acc[e.importance] = (acc[e.importance] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: events.reduce((acc, e) => {
        const el = e.spiritualCorrelations?.element || 'Unknown';
        acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: events.reduce((acc, e) => {
        const ch = e.spiritualCorrelations?.chakra || 0;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: events.reduce((acc, e) => {
        e.spiritualCorrelations?.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      events,
      moonData,
      meta: {
        currentMonth,
        currentYear,
        totalEvents: events.length,
        filters: { orixa, type, sefirot, chakra, element },
      },
      stats,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}