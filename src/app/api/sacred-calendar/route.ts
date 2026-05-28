// ============================================================
// SACRED CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sacred calendar data
// - Sacred dates and mystical celebrations
// - Spiritual cycles and numerological periods
// - Cabalistic and mystical calendar events
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface SacredDate {
  id: string;
  name: string;
  nameIngles: string;
  date: string; // YYYY-MM-DD format
  type: 'cabalistic' | 'mystical' | 'spiritual' | 'lunar' | 'planetary';
  description: string;
  descriptionIngles: string;
  significance: 'high' | 'very-high' | 'supreme';
  practices?: string[];
  color?: string;
}

interface SacredCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  length: number; // in days
}

interface SacredCalendarResponse {
  sacredDates: SacredDate[];
  currentCycle: SacredCycle | null;
  upcomingSacredDates: SacredDate[];
  moonPhase: string;
  spiritualEnergy: 'low' | 'moderate' | 'high' | 'very-high' | 'supreme';
  recommendedPractices: string[];
}

interface MonthParams {
  month?: string;
  year?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const CURRENT_YEAR = new Date().getFullYear();

// Sacred dates following mystical and cabalistic traditions
const SACRED_DATES: Omit<SacredDate, 'id'>[] = [
  {
    name: 'Ano Novo Judaico (Rosh Hashaná)',
    nameIngles: 'Jewish New Year',
    date: `${CURRENT_YEAR}-10-03`,
    type: 'cabalistic',
    description: 'O som do shofar despierta la conscience espiritual. Tiempo de evaluacion y renovacion del alma.',
    descriptionIngles: 'The shofar sound awakens spiritual consciousness. Time for soul evaluation and renewal.',
    significance: 'supreme',
    practices: ['Escuchar el shofar', 'Tashlich - arrojar pecados al agua', 'Reflexion sobre el alma', 'Buenas intenciones'],
    color: '#FFD700',
  },
  {
    name: 'Iom Kipur',
    nameIngles: 'Day of Atonement',
    date: `${CURRENT_YEAR}-10-12`,
    type: 'cabalistic',
    description: 'El dia mas sagrado del calendario judaico. Ayuno, oracion y pideon de pecados.',
    descriptionIngles: 'The most sacred day of the Jewish calendar. Fasting, prayer, and atonement for sins.',
    significance: 'supreme',
    practices: ['Ayuno de 25 horas', 'Oracion intensa', 'Confesion de pecados', 'Vida contemplativa'],
    color: '#FFFFFF',
  },
  {
    name: 'Sukot',
    nameIngles: 'Feast of Tabernacles',
    date: `${CURRENT_YEAR}-10-18`,
    type: 'cabalistic',
    description: 'Conmemora la proteccion divina durante el exodo de Egipto. Alegria y vivienda temporal.',
    descriptionIngles: 'Commemorates divine protection during Egypt exile. Joy and temporary dwelling.',
    significance: 'high',
    practices: ['Construir suká', 'Las cuatro especies', 'Celebracion con felicidad', 'Gratitud'],
    color: '#FF9800',
  },
  {
    name: 'Shavuot',
    nameIngles: 'Feast of Weeks',
    date: `${CURRENT_YEAR}-06-12`,
    type: 'cabalistic',
    description: 'Recebimiento de la Torá en el Monte Sinaí. Tiempo de studyo intensivo y iluminacion.',
    descriptionIngles: 'Receiving the Torah at Mount Sinai. Time for intensive study and illumination.',
    significance: 'very-high',
    practices: ['Estudio de la Torá', 'Noche de estudio', 'Decoracion con flores', 'Consciencia de la luz'],
    color: '#9C27B0',
  },
  {
    name: 'Solsticio de Invierno',
    nameIngles: 'Winter Solstice',
    date: `${CURRENT_YEAR}-12-21`,
    type: 'mystical',
    description: 'El dia mas corto del ano. Renacimiento de la luz. Meditacion profunda sobre la luz interior.',
    descriptionIngles: 'The shortest day of the year. Rebirth of light. Deep meditation on inner light.',
    significance: 'supreme',
    practices: ['Meditacion al amanecer', 'Ritual de luz', 'Gratitud por la luz', 'Renovacion interior'],
    color: '#1A237E',
  },
  {
    name: 'Solsticio de Verano',
    nameIngles: 'Summer Solstice',
    date: `${CURRENT_YEAR}-06-21`,
    type: 'mystical',
    description: 'El dia mas largo del ano. Maxima energia solar. Conexion con la luz divina.',
    descriptionIngles: 'The longest day of the year. Maximum solar energy. Connection with divine light.',
    significance: 'high',
    practices: ['Ritual solar', 'Celebracion de la luz', 'Gratitud solar', 'Banos de sol conscientes'],
    color: '#FFC107',
  },
  {
    name: 'Equinoccio de Primavera',
    nameIngles: 'Spring Equinox',
    date: `${CURRENT_YEAR}-03-20`,
    type: 'spiritual',
    description: 'Equilibrio entre luz y oscuridad. Renacimiento espiritual y nuevo comienzo.',
    descriptionIngles: 'Balance between light and darkness. Spiritual rebirth and new beginnings.',
    significance: 'high',
    practices: ['Ritual de limpieza', 'Plantacion de intenciones', 'Equilibrio interior', 'Nuevo comienzo'],
    color: '#4CAF50',
  },
  {
    name: 'Luna Nueva de Tishrei',
    nameIngles: 'New Moon of Tishrei',
    date: `${CURRENT_YEAR}-10-03`,
    type: 'lunar',
    description: 'Comienzo del mes mas sagrado. Preparacion para Rosh Hashaná.',
    descriptionIngles: 'Beginning of the most sacred month. Preparation for Rosh Hashaná.',
    significance: 'high',
    practices: ['Establecer intenciones', 'Oracion de silencio', 'Reflexion interior', 'Preparacion espiritual'],
    color: '#311B92',
  },
  {
    name: 'Mes de Elul',
    nameIngles: 'Month of Elul',
    date: `${CURRENT_YEAR}-09-03`,
    type: 'cabalistic',
    description: 'Mes de introspeccion y teshuvá (retorno). Preparacion para los dias Awesome.',
    descriptionIngles: 'Month of introspection and teshuvá (return). Preparation for Awesome Days.',
    significance: 'very-high',
    practices: ['Autoexamen diario', 'Teshuvá sincere', 'Aproximacion a D-os', 'Corazon abierto'],
    color: '#7B1FA2',
  },
  {
    name: 'Dia 18 de Elul',
    nameIngles: '18th of Elul',
    date: `${CURRENT_YEAR}-09-20`,
    type: 'cabalistic',
    description: 'Cumpleanos de Rashash. Despertar del alma. Comienzo de la transformacion spiritual.',
    descriptionIngles: 'Birthday of Rashash. Awakening of the soul. Beginning of spiritual transformation.',
    significance: 'supreme',
    practices: ['Reflexion sobre Rashash', 'Despertar spiritual', 'Studyo místico', 'Oracion por claridad'],
    color: '#4A148C',
  },
  {
    name: 'Purim',
    nameIngles: 'Purim',
    date: `${CURRENT_YEAR}-03-14`,
    type: 'cabalistic',
    description: 'Milagro de la salvacion. Alegria extrema y lectura del Meguilat Ester.',
    descriptionIngles: 'Miracle of salvation. Extreme joy and reading of the Megillah of Esther.',
    significance: 'high',
    practices: ['Lectura del Meguilá', 'Mishloaj manot', 'Matanot leevyonim', 'Celebracion alegre'],
    color: '#E91E63',
  },
  {
    name: 'Lag Baomer',
    nameIngles: 'Lag Baomer',
    date: `${CURRENT_YEAR}-05-12`,
    type: 'cabalistic',
    description: 'Ceese del plague durante Rabi Shimon bar Yojai. Celebracion de la luz cabalística.',
    descriptionIngles: 'Cessation of plague during Rabbi Shimon bar Yochai. Celebration of cabalistic light.',
    significance: 'very-high',
    practices: ['Fogueos nocturnos', 'Studyo del Zohar', 'Celebracion familiar', 'Conexion con luz'],
    color: '#FF5722',
  },
  {
    name: 'Tu Bishvat',
    nameIngles: 'New Year of Trees',
    date: `${CURRENT_YEAR}-02-13`,
    type: 'cabalistic',
    description: 'Ano Nuevo de los arboles. Conexion con la naturaleza y evaluacion del mundo natural.',
    descriptionIngles: 'New Year of Trees. Connection with nature and evaluation of the natural world.',
    significance: 'high',
    practices: ['Comer frutas', 'Plantar arboles', 'Evaluacion de progreso', 'Gratitud natural'],
    color: '#8BC34A',
  },
  {
    name: 'Dia de la Creacion',
    nameIngles: 'Day of Creation',
    date: `${CURRENT_YEAR}-09-01`,
    type: 'spiritual',
    description: 'Dia de la semaine donde开始 la creacion. Estudio de los seis dias de la creacion.',
    descriptionIngles: 'Day of the week when creation began. Study of the six days of creation.',
    significance: 'high',
    practices: ['Studyo de Bereshit', 'Meditacion sobre la creacion', 'Gratitud por la existencia', 'Reflexion cosmica'],
    color: '#00BCD4',
  },
];

// Sacred cycles for the current period
const SACRED_CYCLES: Omit<SacredCycle, 'id'>[] = [
  {
    name: 'Ciclo de Teshuvá',
    description: 'Periodo de retorno y evaluacion spiritual que comienza en Elul y culmina en Iom Kipur.',
    startDate: `${CURRENT_YEAR}-09-03`,
    endDate: `${CURRENT_YEAR}-10-12`,
    length: 40,
  },
  {
    name: 'Ciclo de la Luz',
    description: 'Ciclo de iluminacion que comienza en el equinoccio de primavera y alcanza su punto culminante en el solsticio de verano.',
    startDate: `${CURRENT_YEAR}-03-20`,
    endDate: `${CURRENT_YEAR}-06-21`,
    length: 93,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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
  const knownNewMoon = new Date(2024, 0, 11); // Known new moon date
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

function getSpiritualEnergy(date: Date, moonPhase: string): 'low' | 'moderate' | 'high' | 'very-high' | 'supreme' {
  const dayOfWeek = date.getDay();
  
  // High spiritual energy days
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'high'; // Sunday/Saturday
  if (moonPhase === 'lua-cheia') return 'very-high';
  if (moonPhase === 'lua-nova') return 'high';
  
  // Moderate spiritual energy
  if (dayOfWeek === 5) return 'moderate'; // Friday (preparing for Shabbat)
  
  return 'moderate';
}

function getRecommendedPractices(sacredDates: SacredDate[], currentEnergy: string): string[] {
  const practices: string[] = [];
  
  // Add practices from today's sacred dates
  sacredDates.forEach(date => {
    if (date.practices) {
      practices.push(...date.practices.slice(0, 2));
    }
  });
  
  // Add general practices based on energy level
  if (currentEnergy === 'supreme' || currentEnergy === 'very-high') {
    practices.push('Meditacion profunda');
    practices.push('Oracion intensa');
    practices.push('Studyo espiritual');
  } else if (currentEnergy === 'high') {
    practices.push('Ritual de conexion');
    practices.push('Gratitud diaria');
    practices.push('Reflexion spiritual');
  } else {
    practices.push('Practicas suaves de presencia');
    practices.push('Gratitud simple');
  }
  
  return [...new Set(practices)].slice(0, 6);
}

function getSacredDatesForMonth(month: number, year: number): SacredDate[] {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  return SACRED_DATES
    .map((date, index) => ({
      ...date,
      id: `sacred-${index + 1}`,
    }))
    .filter(date => {
      const dateObj = parseDateString(date.date);
      return dateObj >= startOfMonth && dateObj <= endOfMonth;
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

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const date = searchParams.get('date');
    
    const today = new Date();
    const targetMonth = month ? parseInt(month, 10) : today.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : today.getFullYear();
    
    // Handle specific date query
    if (date) {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: 'Data invalida. Use o formato YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      
      const targetDateStr = formatDate(targetDate);
      const moonPhase = getMoonPhase(targetDate);
      const spiritualEnergy = getSpiritualEnergy(targetDate, moonPhase.phase);
      
      // Find sacred dates on this date
      const sacredOnDate = SACRED_DATES
        .map((d, index) => ({ ...d, id: `sacred-${index + 1}` }))
        .filter(d => d.date === targetDateStr);
      
      const currentCycle = getCurrentSacredCycle(targetDate);
      
      return NextResponse.json({
        date: targetDateStr,
        sacredDates: sacredOnDate,
        moonPhase: moonPhase.phase,
        moonIllumination: moonPhase.illumination,
        spiritualEnergy,
        currentCycle,
        recommendedPractices: getRecommendedPractices(sacredOnDate, spiritualEnergy),
      });
    }
    
    // Handle month query
    const moonPhase = getMoonPhase(today);
    const spiritualEnergy = getSpiritualEnergy(today, moonPhase.phase);
    const currentCycle = getCurrentSacredCycle(today);
    const upcomingSacredDates = getUpcomingSacredDates(today);
    
    const response: SacredCalendarResponse = {
      sacredDates: getSacredDatesForMonth(targetMonth, targetYear),
      currentCycle,
      upcomingSacredDates,
      moonPhase: moonPhase.phase,
      spiritualEnergy,
      recommendedPractices: getRecommendedPractices([], spiritualEnergy),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Sacred Calendar API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
