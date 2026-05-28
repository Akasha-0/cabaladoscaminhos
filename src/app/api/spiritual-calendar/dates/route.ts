// ============================================================
// SPIRITUAL CALENDAR DATES API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual calendar dates
// - Sacred dates and celebrations
// - Orixá feast days
// - Numerological dates
// - Astrological periods
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface SacredDate {
  id: string;
  date: string;
  name: string;
  description: string;
  type: 'orixa-feast' | 'ritual' | 'cleansing' | 'meditation' | 'solstice' | 'equinox' | 'eclipse' | 'special';
  importance: 'low' | 'medium' | 'high' | 'sacred';
  associatedOrixas: string[];
  practices?: string[];
  warnings?: string[];
}

interface DateRange {
  start: string;
  end: string;
}

interface DateQueryParams {
  startDate?: string;
  endDate?: string;
  orixa?: string;
  type?: string;
  importance?: string;
}

interface SpiritualDatesResponse {
  dates: SacredDate[];
  total: number;
  query: {
    startDate?: string;
    endDate?: string;
    orixa?: string;
    type?: string;
    importance?: string;
  };
}

// ============================================================
// SACRED DATES DATA
// ============================================================

const SACRED_DATES: SacredDate[] = [
  // Orixá Feast Days
  {
    id: 'orixa-yemanja-festa',
    date: '12-15',
    name: 'Yemanjá - Festa das Marés',
    description: 'Celebração à Rainha do Mar, orixá das águas profundas e da maternidade. Momento de devoção, purificação e pedidos de proteção.',
    type: 'orixa-feast',
    importance: 'sacred',
    associatedOrixas: ['Yemanjá'],
    practices: ['Oferecer flores brancas', 'Acender velas azuis', 'Nadar ou banhar-se no mar', 'Fazer oferendas na beira da água'],
    warnings: ['Evitar alimentos de origem animal', 'Evitar discussões e conflitos'],
  },
  {
    id: 'orixa-yemanja-dia-agua',
    date: '01-01',
    name: 'Iemanjá - Dia da Mãe d\'Água',
    description: 'Oferecer flores, velas e presentes às águas em reverência à Iemanjá. традиционная celebration to welcome the year with maternal protection.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Yemanjá'],
    practices: ['Lançamento de oferendas ao mar', 'Acender velas brancas e azuis', 'Pedidos de proteção e prosperidade'],
  },
  {
    id: 'orixa-oxumalu-rainbow',
    date: '12-31',
    name: 'Oxumaru - Senhor do Arco-Íris',
    description: 'Ritual de abundância e conexão entre os mundos espiritual e material. Celebra a riqueza e fertilidade.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Oxumaru'],
    practices: ['Oferecer frutas douradas', 'Acender velas de várias cores', 'Pedidos de prosperidade'],
    warnings: ['Evitar comidas estragadas'],
  },
  {
    id: 'orixa-ogum-ferreiro',
    date: '04-23',
    name: 'Ogum - Dia do Ferreiro',
    description: 'Celebração do orixá do ferro, das guerras e do trabalho. Día de força, coragem e determinação.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Ogum'],
    practices: ['Afiar facas e ferramentas', 'Acender velas vermelhas', 'Pedidos de proteção no trabalho'],
  },
  {
    id: 'orixa-xango-justica',
    date: '06-30',
    name: 'Xangô - Justiceiro',
    description: 'Ritual de justiça e equilíbrio, senhor das tempestades. Celebra o poder da justiça e equilíbrio.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Xangô'],
    practices: ['Acender velas vermelhas e pretas', 'Pedidos de justiça', 'Rituais de equilíbrio'],
  },
  {
    id: 'orixa-iansa-tempestade',
    date: '12-08',
    name: 'Iansã - Tempestade',
    description: 'Celebração da guerreira, dona dos raios e ventanias. Día de empoderamiento y protección.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Iansã'],
    practices: ['Acender velas vermelhas e alaranjadas', 'Pedidos de proteção contra inimigos', 'Rituais de guerra espiritual'],
  },
  {
    id: 'orixa-oxalufan-pai',
    date: '12-19',
    name: 'Oxalufan - Oxalá do Pai',
    description: 'Dia mais sagrado para Oxalá, momento de purificação total. Celebra a老人家 e a sabedoria.',
    type: 'orixa-feast',
    importance: 'sacred',
    associatedOrixas: ['Oxalá'],
    practices: ['Jejum e purificação', 'Acender velas brancas', 'Preces por paz e saúde', 'Evitar alimentos de origem animal'],
    warnings: ['Jejum recomendado', 'Evitar alimentos de origem animal', 'Evitar violência em pensamentos e palavras'],
  },
  {
    id: 'orixa-oxaguiam-filho',
    date: '12-25',
    name: 'Oxaguiã - Oxalá do Filho',
    description: 'Dia de Oxalá joven, asociado con la guerra y la conquista. Celebra la energía masculina de Oxalá.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Oxalá'],
    practices: ['Acender velas brancas', 'Pedidos de salud y victoria'],
  },
  {
    id: 'orixa-nana-lamaçal',
    date: '10-12',
    name: 'Nanã - Lamaçal',
    description: 'Celebração da anciã, orixá do lameiro e da morte física. Honra a sabedoria dos ancianos.',
    type: 'orixa-feast',
    importance: 'medium',
    associatedOrixas: ['Nanã'],
    practices: ['Acender velas roxas', 'Pedidos de consagração', 'Rituais de respeito aos antepassados'],
  },
  {
    id: 'orixa-obatala-paz',
    date: '09-08',
    name: 'Obatalá - Senhor da Pureza',
    description: 'Celebração do pai dos orixás, senhor da paz e da pureza. Momento de reflexión y благочестие.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Obatalá'],
    practices: ['Acender velas brancas', 'Pedidos de paz y salud', 'Rituais de purificación'],
    warnings: ['Evitar bebidas alcohólicas', 'Evitar makanan não pura'],
  },
  {
    id: 'orixa-oxossi-caçador',
    date: '02-19',
    name: 'Oxossi - Caçador',
    description: 'Celebração do orixá da caça, da floresta y de la sabiduría. Honra al cazador sagrado.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Oxossi'],
    practices: ['Acender velas verdes', 'Pedidos de saúde', 'Rituais de prosperidade'],
  },
  {
    id: 'orixa-osei-sorte',
    date: '01-13',
    name: 'Oxê - Sorte',
    description: 'Día del orixá de la suerte y la fortuna. Celebra la energía de protección y victoria.',
    type: 'orixa-feast',
    importance: 'high',
    associatedOrixas: ['Oxum'],
    practices: ['Acender velas douradas', 'Pedidos de sorte e proteção'],
  },
  // Numerological Special Dates
  {
    id: 'numerology-master-11',
    date: '11-11',
    name: 'Dia do Mestre 11:11',
    description: 'Portal energético do mestre 11, día de ativação espiritual e manifestação. Frequência elevada.',
    type: 'special',
    importance: 'high',
    associatedOrixas: ['Oxalá'],
    practices: ['Meditação de开门', 'Afirmações de poder', 'Pedidos de clareza espiritual'],
  },
  {
    id: 'numerology-master-22',
    date: '02-22',
    name: 'Dia do Mestre 22',
    description: 'Día de manifestación master, energía de(builder). Aproveite para criar projetos duradouros.',
    type: 'special',
    importance: 'high',
    associatedOrixas: ['Ogum'],
    practices: ['Planejamento de projetos', 'Manifestação de metas', 'Construção de base sólida'],
  },
  {
    id: 'numerology-master-33',
    date: '03-03',
    name: 'Dia do Mestre 33',
    description: 'Día del maestro iluminador, energia de service espiritual. Momento de luz e cura.',
    type: 'special',
    importance: 'sacred',
    associatedOrixas: ['Iemanjá'],
    practices: ['Atos de serviço', 'Healing energy work', 'Pedidos por iluminação'],
  },
  // Cleansing Dates
  {
    id: ' cleansing-new-year',
    date: '01-01',
    name: 'Limpeza de Ano Novo',
    description: 'Día de limpeza energética, renovação de intenciones y limpia de energías negativas.',
    type: 'cleansing',
    importance: 'high',
    associatedOrixas: ['Oxalá', 'Iemanjá'],
    practices: ['Banho de ervas', 'Queima de incenso', 'Limpeza de espaço', 'Nuevas intenciones'],
  },
  {
    id: 'cleansing-carnaval',
    date: '02-01',
    name: 'Carnaval - Limpeza de Carnaval',
    description: 'Período de limpeza antes da Quaresma, energía de liberación y diversión sagrada.',
    type: 'cleansing',
    importance: 'medium',
    associatedOrixas: ['Iansã'],
    practices: ['Descarrego energético', 'Celebração', 'Liberación de padrões'],
  },
  // Eclipse Dates (examples)
  {
    id: 'eclipse-solar',
    date: '04-08',
    name: 'Eclipse Solar',
    description: 'Día de eclipse solar, momento de transformação e novos começos. Energía poderosa.',
    type: 'eclipse',
    importance: 'high',
    associatedOrixas: ['Oxalá'],
    practices: ['Proteção energética', 'Meditación', 'Evitar fazer decisões importantes'],
    warnings: ['Não fazer compras importantes', 'Evitar conflitos', 'Manter equilíbrio emocional'],
  },
  {
    id: 'eclipse-lunar',
    date: '10-25',
    name: 'Eclipse Lunar',
    description: 'Día de eclipse lunar, momento de revelação e liberación emocional. Energía de transformación.',
    type: 'eclipse',
    importance: 'high',
    associatedOrixas: ['Iemanjá'],
    practices: ['Release emocional', 'Meditación de lua', 'Soltar o que não serve'],
    warnings: ['Evitar confrontos', 'Não fazer juramentos', 'Cuidar das emoções'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function expandDateToYear(dateStr: string, year: number): string {
  const [month, day] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date | null {
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!d || !start || !end) return false;
  return d >= start && d <= end;
}

function filterDatesByOrixa(dates: SacredDate[], orixa: string): SacredDate[] {
  return dates.filter((date) =>
    date.associatedOrixas.some((o) => o.toLowerCase() === orixa.toLowerCase())
  );
}

function filterDatesByType(dates: SacredDate[], type: string): SacredDate[] {
  return dates.filter((date) => date.type === type);
}

function filterDatesByImportance(dates: SacredDate[], importance: string): SacredDate[] {
  return dates.filter((date) => date.importance === importance);
}

function sortDatesByDate(dates: SacredDate[], year: number): SacredDate[] {
  return [...dates].sort((a, b) => {
    const dateA = expandDateToYear(a.date, year);
    const dateB = expandDateToYear(b.date, year);
    return dateA.localeCompare(dateB);
  });
}

function getFullDateWithYear(dateStr: string, year: number): SacredDate {
  const date = SACRED_DATES.find((d) => d.date === dateStr);
  if (!date) {
    throw new Error(`Date not found: ${dateStr}`);
  }
  return {
    ...date,
    date: expandDateToYear(dateStr, year),
  };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const currentYear = getCurrentYear();

    // Parse query parameters
    const startDate = searchParams.get('startDate') || `${currentYear}-01-01`;
    const endDate = searchParams.get('endDate') || `${currentYear}-12-31`;
    const orixa = searchParams.get('orixa') || undefined;
    const type = searchParams.get('type') || undefined;
    const importance = searchParams.get('importance') || undefined;
    const specificDate = searchParams.get('date') || undefined;

    // Validate date parameters
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (!parsedStartDate || !parsedEndDate) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    if (parsedStartDate > parsedEndDate) {
      return NextResponse.json(
        { error: 'startDate must be before endDate.' },
        { status: 400 }
      );
    }

    // Filter dates based on query parameters
    let filteredDates = [...SACRED_DATES];

    // If specific date requested, return only that date
    if (specificDate) {
      const [year, month, day] = specificDate.split('-');
      if (year && month && day) {
        const dateStr = `${month}-${day}`;
        const foundDate = filteredDates.find((d) => d.date === dateStr);
        if (foundDate) {
          return NextResponse.json({
            dates: [{
              ...foundDate,
              date: specificDate,
            }],
            total: 1,
            query: { startDate, endDate, orixa, type, importance },
          }, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            },
          });
        } else {
          return NextResponse.json({
            dates: [],
            total: 0,
            query: { startDate, endDate, orixa, type, importance },
          }, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            },
          });
        }
      }
    }

    // Expand dates to full year and filter by range
    const year = parsedStartDate.getFullYear();
    const datesWithYear = filteredDates.map((date) => ({
      ...date,
      date: expandDateToYear(date.date, year),
    }));

    // Filter by date range
    filteredDates = datesWithYear.filter((date) =>
      isDateInRange(date.date, startDate, endDate)
    );

    // Apply additional filters
    if (orixa) {
      filteredDates = filterDatesByOrixa(filteredDates, orixa);
    }

    if (type) {
      filteredDates = filterDatesByType(filteredDates, type);
    }

    if (importance) {
      filteredDates = filterDatesByImportance(filteredDates, importance);
    }

    // Sort by date
    filteredDates = sortDatesByDate(filteredDates, year);

    // Build response
    const response: SpiritualDatesResponse = {
      dates: filteredDates,
      total: filteredDates.length,
      query: {
        startDate,
        endDate,
        orixa,
        type,
        importance,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Spiritual Calendar Dates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}