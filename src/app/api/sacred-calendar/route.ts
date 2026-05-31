// ============================================================
// SACRED CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sacred calendar data
// - Sacred dates and mystical celebrations
// - Spiritual cycles and numerological periods
// - Cabalistic and mystical calendar events
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SacredDateTypeSchema = z.enum(['cabalistic', 'mystical', 'spiritual', 'lunar', 'planetary']);
const SignificanceSchema = z.enum(['high', 'very-high', 'supreme']);
const SpiritualEnergySchema = z.enum(['low', 'moderate', 'high', 'very-high', 'supreme']);
const MoonPhaseSchema = z.enum([
  'lua-nova', 'lua-crescente', 'quarto-crescente', 'crescente-gibosa',
  'lua-cheia', 'minguante-gibosa', 'quarto-minguante', 'lua-minguante'
]);

const SacredCalendarQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  type: SacredDateTypeSchema.optional(),
  significance: SignificanceSchema.optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
});

const SacredDateSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameIngles: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: SacredDateTypeSchema,
  description: z.string(),
  descriptionIngles: z.string(),
  significance: SignificanceSchema,
  practices: z.array(z.string()).optional(),
  color: z.string().optional(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  numeroSagrado: z.number().optional(),
});

const SacredCycleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  length: z.number().int().positive(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.array(z.string()).optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface SacredDate {
  id: string;
  name: string;
  nameIngles: string;
  date: string;
  type: string;
  description: string;
  descriptionIngles: string;
  significance: string;
  practices?: string[];
  color?: string;
  sefirot?: string[];
  orixa?: string;
  chakra?: number[];
  numeroSagrado?: number;
}

interface SacredCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  length: number;
  sefirot?: string[];
  orixa?: string[];
}

export const dynamic = 'force-dynamic';

// ─── Constants ───────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

// Sacred dates with spiritual correlations
const SACRED_DATES: Omit<SacredDate, 'id'>[] = [
  {
    name: 'Ano Novo Judaico (Rosh Hashaná)',
    nameIngles: 'Jewish New Year',
    date: `${CURRENT_YEAR}-10-03`,
    type: 'cabalistic',
    description: 'O som do shofar desperta a consciência espiritual. Tempo de avaliação e renovação da alma.',
    descriptionIngles: 'The shofar sound awakens spiritual consciousness. Time for soul evaluation and renewal.',
    significance: 'supreme',
    practices: ['Ouvir o shofar', 'Tashlich - lançar pecados à água', 'Reflexão sobre a alma', 'Boas intenções'],
    color: '#FFD700',
    sefirot: ['Tipheret', 'Malkuth'],
    orixa: 'Oxalá',
    chakra: [6, 7],
    numeroSagrado: 1,
  },
  {
    name: 'Iom Kipur',
    nameIngles: 'Day of Atonement',
    date: `${CURRENT_YEAR}-10-12`,
    type: 'cabalistic',
    description: 'O dia mais sagrado do calendário judaico. Ayuno, oração e expiação de pecados.',
    descriptionIngles: 'The most sacred day of the Jewish calendar. Fasting, prayer, and atonement for sins.',
    significance: 'supreme',
    practices: ['Ayuno de 25 horas', 'Oração intensa', 'Confissão de pecados', 'Vida contemplativa'],
    color: '#FFFFFF',
    sefirot: ['Binah', 'Gevurah'],
    orixa: 'Omolu',
    chakra: [1, 3, 7],
    numeroSagrado: 10,
  },
  {
    name: 'Sukot',
    nameIngles: 'Feast of Tabernacles',
    date: `${CURRENT_YEAR}-10-18`,
    type: 'cabalistic',
    description: 'Comemora a proteção divina durante o êxodo do Egito. Alegria e morada temporária.',
    descriptionIngles: 'Commemorates divine protection during Egypt exile. Joy and temporary dwelling.',
    significance: 'high',
    practices: ['Construir suká', 'As quatro espécies', 'Celebração com felicidade', 'Gratidão'],
    color: '#FF9800',
    sefirot: ['Netzach', 'Hod'],
    orixa: 'Oxum',
    chakra: [4],
    numeroSagrado: 7,
  },
  {
    name: 'Shavuot',
    nameIngles: 'Feast of Weeks',
    date: `${CURRENT_YEAR}-06-12`,
    type: 'cabalistic',
    description: 'Recebimento da Torá no Monte Sinai. Tempo de estudo intensivo e iluminação.',
    descriptionIngles: 'Receiving the Torah at Mount Sinai. Time for intensive study and illumination.',
    significance: 'very-high',
    practices: ['Estudo da Torá', 'Noite de estudo', 'Decaração com flores', 'Consciência da luz'],
    color: '#9C27B0',
    sefirot: ['Chokhmah', 'Kether'],
    orixa: 'Oxalá',
    chakra: [6, 7],
    numeroSagrado: 50,
  },
  {
    name: 'Tu BiShvat',
    nameIngles: 'New Year of the Trees',
    date: `${CURRENT_YEAR}-01-22`,
    type: 'mystical',
    description: 'Ano novo das árvores. Celebração da natureza e consciência ambiental.',
    descriptionIngles: 'New year of the trees. Celebration of nature and environmental consciousness.',
    significance: 'high',
    practices: ['Comer frutas', 'Plantar árvores', 'Avaliação de progresso', 'Gratidão natural'],
    color: '#8BC34A',
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Iemanjá',
    chakra: [1, 2],
    numeroSagrado: 15,
  },
  {
    name: 'Dia da Criação',
    nameIngles: 'Day of Creation',
    date: `${CURRENT_YEAR}-09-01`,
    type: 'spiritual',
    description: 'Dia da semana onde começou a criação. Estudo dos seis dias da criação.',
    descriptionIngles: 'Day of the week when creation began. Study of the six days of creation.',
    significance: 'high',
    practices: ['Estudo de Bereshit', 'Meditação sobre a criação', 'Gratidão pela existência', 'Reflexão cósmica'],
    color: '#00BCD4',
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    orixa: 'Oxalá',
    chakra: [7],
    numeroSagrado: 6,
  },
  {
    name: 'Lua Cheia de Oxum',
    nameIngles: 'Oxum Full Moon',
    date: `${CURRENT_YEAR}-02-15`,
    type: 'lunar',
    description: 'Lua cheia dedicada a Oxum, orixá das águas doces e do amor.',
    descriptionIngles: 'Full moon dedicated to Oxum, goddess of fresh waters and love.',
    significance: 'very-high',
    practices: ['Oferendas a Oxum', 'Banho de ervas', 'Oração ao amor', 'Águas cristalinas'],
    color: '#FF69B4',
    sefirot: ['Netzach', 'Tipheret'],
    orixa: 'Oxum',
    chakra: [4],
    numeroSagrado: 11,
  },
  {
    name: 'Lua Nova de Ogum',
    nameIngles: 'Ogum New Moon',
    date: `${CURRENT_YEAR}-03-10`,
    type: 'lunar',
    description: 'Lua nova dedicada a Ogum, orixá do ferro e das batalhas.',
    descriptionIngles: 'New moon dedicated to Ogum, god of iron and battles.',
    significance: 'high',
    practices: ['Saudação a Ogum', 'Limpeza de ferramentas', 'Ritual de proteção', 'Aço bendito'],
    color: '#DC143C',
    sefirot: ['Gevurah'],
    orixa: 'Ogum',
    chakra: [1, 3],
    numeroSagrado: 7,
  },
  {
    name: 'Equinócio de Primavera',
    nameIngles: 'Spring Equinox',
    date: `${CURRENT_YEAR}-03-20`,
    type: 'planetary',
    description: 'Momento de equilíbrio entre luz e escuridão. Renascimento e novos começos.',
    descriptionIngles: 'Moment of balance between light and darkness. Rebirth and new beginnings.',
    significance: 'very-high',
    practices: ['Meditação de equilíbrio', 'Plantar sementes', 'Ritual de renovação', 'Gratidão'],
    color: '#32CD32',
    sefirot: ['Tipheret', 'Chesed'],
    orixa: 'Obatalá',
    chakra: [4, 7],
    numeroSagrado: 4,
  },
  {
    name: 'Solstício de Verão',
    nameIngles: 'Summer Solstice',
    date: `${CURRENT_YEAR}-06-21`,
    type: 'planetary',
    description: 'Dia mais longo do ano. Apogeu da luz solar e energia Yang.',
    descriptionIngles: 'Longest day of the year. Peak of solar energy and Yang energy.',
    significance: 'high',
    practices: ['Ritual solar', 'Banho de sol', 'Gratidão pela luz', 'Celebração'],
    color: '#FFD700',
    sefirot: ['Chokhmah', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: [3, 7],
    numeroSagrado: 21,
  },
  {
    name: 'Festa de Iemanjá',
    nameIngles: 'Yemanjá Festival',
    date: `${CURRENT_YEAR}-12-08`,
    type: 'lunar',
    description: 'Celebração da rainha do mar, mãe de todos os orixás.',
    descriptionIngles: 'Celebration of the queen of the sea, mother of all orixás.',
    significance: 'supreme',
    practices: ['Oferendas ao mar', 'Flores brancas', 'Preces a Iemanjá', 'Águas do mar'],
    color: '#0000CD',
    sefirot: ['Yesod', 'Binah'],
    orixa: 'Iemanjá',
    chakra: [2, 6],
    numeroSagrado: 8,
  },
  {
    name: 'Festa de Xangô',
    nameIngles: 'Shango Festival',
    date: `${CURRENT_YEAR}-12-04`,
    type: 'lunar',
    description: 'Celebração do orixá do trovão, justiça e dança.',
    descriptionIngles: 'Celebration of the god of thunder, justice and dance.',
    significance: 'very-high',
    practices: ['Ritual de Xangô', 'Dança sagrada', 'Sinos e tambores', 'Justiça'],
    color: '#FF4500',
    sefirot: ['Gevurah', 'Chesed'],
    orixa: 'Xangô',
    chakra: [3, 4],
    numeroSagrado: 6,
  },
];

// Sacred cycles with spiritual correlations
const SACRED_CYCLES: Omit<SacredCycle, 'id'>[] = [
  {
    name: 'Ciclo de Teshuvá',
    description: 'Período de retorno e avaliação espiritual que começa em Elul e culmina em Iom Kipur.',
    startDate: `${CURRENT_YEAR}-09-03`,
    endDate: `${CURRENT_YEAR}-10-12`,
    length: 40,
    sefirot: ['Gevurah', 'Binah', 'Tipheret'],
    orixa: ['Omolu', 'Oxalá'],
  },
  {
    name: 'Ciclo da Luz',
    description: 'Ciclo de iluminação que começa no equinócio de primavera e atinge seu ápice no solstício de verão.',
    startDate: `${CURRENT_YEAR}-03-20`,
    endDate: `${CURRENT_YEAR}-06-21`,
    length: 93,
    sefirot: ['Kether', 'Chokhmah', 'Tipheret'],
    orixa: ['Oxalá', 'Oxum'],
  },
  {
    name: 'Ciclo de Oxum',
    description: 'Período favorável para rituais de amor, prosperidade e harmonização emocional.',
    startDate: `${CURRENT_YEAR}-02-01`,
    endDate: `${CURRENT_YEAR}-02-28`,
    length: 28,
    sefirot: ['Netzach', 'Tipheret', 'Hod'],
    orixa: ['Oxum'],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isDateInRange(date: Date, start: string, end: string): boolean {
  const d = date.getTime();
  return d >= parseDateString(start).getTime() && d <= parseDateString(end).getTime();
}

function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date(2024, 0, 11);
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  
  let phase: string;
  if (lunarAge < 1.85) phase = 'lua-nova';
  else if (lunarAge < 7.38) phase = 'lua-crescente';
  else if (lunarAge < 9.23) phase = 'quarto-crescente';
  else if (lunarAge < 14.77) phase = 'crescente-gibosa';
  else if (lunarAge < 16.61) phase = 'lua-cheia';
  else if (lunarAge < 22.15) phase = 'minguante-gibosa';
  else if (lunarAge < 23.99) phase = 'quarto-minguante';
  else if (lunarAge < 29.53) phase = 'lua-minguante';
  else phase = 'lua-nova';

  const illumination = (1 - Math.cos(2 * Math.PI * lunarAge / lunarCycle)) / 2;
  
  return { phase, illumination: Math.round(illumination * 100) };
}

function getSpiritualEnergy(date: Date, moonPhase: string): string {
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'high';
  if (moonPhase === 'lua-cheia') return 'very-high';
  if (moonPhase === 'lua-nova') return 'high';
  if (dayOfWeek === 5) return 'moderate';
  
  return 'moderate';
}

function getRecommendedPractices(sacredDates: SacredDate[], currentEnergy: string): string[] {
  const practices: string[] = [];
  
  sacredDates.forEach(date => {
    if (date.practices) {
      practices.push(...date.practices.slice(0, 2));
    }
  });
  
  if (currentEnergy === 'supreme' || currentEnergy === 'very-high') {
    practices.push('Meditação profunda');
    practices.push('Oração intensa');
    practices.push('Estudo espiritual');
  } else if (currentEnergy === 'high') {
    practices.push('Ritual de conexão');
    practices.push('Gratidão diária');
    practices.push('Reflexão espiritual');
  } else {
    practices.push('Práticas suaves de presença');
    practices.push('Gratidão simples');
  }
  
  return [...new Set(practices)].slice(0, 6);
}

function getSacredDatesForMonth(month: number, year: number, filters?: { type?: string; significance?: string; orixa?: string }): SacredDate[] {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  return SACRED_DATES
    .map((date, index) => ({
      ...date,
      id: `sacred-${index + 1}`,
    }))
    .filter(date => {
      const dateObj = parseDateString(date.date);
      if (dateObj < startOfMonth || dateObj > endOfMonth) return false;
      if (filters?.type && date.type !== filters.type) return false;
      if (filters?.significance && date.significance !== filters.significance) return false;
      if (filters?.orixa && !date.orixa?.toLowerCase().includes(filters.orixa.toLowerCase())) return false;
      return true;
    });
}

function getUpcomingSacredDates(fromDate: Date, limit: number = 5): SacredDate[] {
  const today = formatDate(fromDate);
  
  return SACRED_DATES
    .map((date, index) => ({
      ...date,
      id: `sacred-${index + 1}`,
    }))
    .filter(date => date.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

function getCurrentSacredCycle(date: Date): SacredCycle | null {
  for (let i = 0; i < SACRED_CYCLES.length; i++) {
    const cycle = SACRED_CYCLES[i];
    if (isDateInRange(date, cycle.startDate, cycle.endDate)) {
      return { ...cycle, id: `cycle-${i + 1}` };
    }
  }
  return null;
}

// ─── API Route Handlers ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = SacredCalendarQuerySchema.safeParse({
      month: searchParams.get('month'),
      year: searchParams.get('year'),
      date: searchParams.get('date'),
      type: searchParams.get('type'),
      significance: searchParams.get('significance'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { month, year, date, type, significance, orixa } = parseResult.data;
    const today = new Date();
    const targetMonth = month ?? today.getMonth() + 1;
    const targetYear = year ?? today.getFullYear();
    
    // Handle specific date query
    if (date) {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({
          success: false,
          error: 'Data inválida. Use o formato YYYY-MM-DD.',
        }, { status: 400 });
      }
      
      const targetDateStr = formatDate(targetDate);
      const moonPhase = getMoonPhase(targetDate);
      const spiritualEnergy = getSpiritualEnergy(targetDate, moonPhase.phase);
      
      const sacredOnDate = SACRED_DATES
        .map((d, index) => ({ ...d, id: `sacred-${index + 1}` }))
        .filter(d => d.date === targetDateStr);
      
      const currentCycle = getCurrentSacredCycle(targetDate);
      
      return NextResponse.json({
        success: true,
        date: targetDateStr,
        sacredDates: sacredOnDate,
        moonPhase: moonPhase.phase,
        moonIllumination: moonPhase.illumination,
        spiritualEnergy,
        currentCycle,
        recommendedPractices: getRecommendedPractices(sacredOnDate, spiritualEnergy),
        meta: {
          totalDates: sacredOnDate.length,
          isSacredDay: sacredOnDate.length > 0,
        },
      });
    }
    
    // Handle month query
    const moonPhase = getMoonPhase(today);
    const spiritualEnergy = getSpiritualEnergy(today, moonPhase.phase);
    const currentCycle = getCurrentSacredCycle(today);
    const upcomingSacredDates = getUpcomingSacredDates(today);
    
    const sacredDates = getSacredDatesForMonth(targetMonth, targetYear, { type, significance, orixa });
    
    // Statistics
    const stats = {
      byType: SACRED_DATES.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySignificance: SACRED_DATES.reduce((acc, d) => {
        acc[d.significance] = (acc[d.significance] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: SACRED_DATES.reduce((acc, d) => {
        if (d.orixa) acc[d.orixa] = (acc[d.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      sacredDates,
      currentCycle,
      upcomingSacredDates,
      moonPhase: moonPhase.phase,
      moonIllumination: moonPhase.illumination,
      spiritualEnergy,
      recommendedPractices: getRecommendedPractices(sacredDates, spiritualEnergy),
      meta: {
        month: targetMonth,
        year: targetYear,
        total: sacredDates.length,
        filters: { type, significance, orixa },
        availableCycles: SACRED_CYCLES.map(c => ({ id: c.name, length: c.length })),
      },
      stats,
    });
    
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}