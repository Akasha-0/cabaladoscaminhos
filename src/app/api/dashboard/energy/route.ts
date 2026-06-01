// ============================================================
// DASHBOARD ENERGY API - CABALA DOS CAMINHOS
// Daily spiritual energy portal analysis
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

const PortalDaySchema = z.enum(['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']);
const EnergyQuerySchema = z.object({
  day: PortalDaySchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Day Portals ──────────────────────────────────────────
const DAY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  elementCor: string;
  planet: string;
  description: string;
  practices: string[];
  caution: string[];
}> = {
  domingo: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    elementCor: 'Fogo',
    orixa: 'Xangô',
    planet: 'Sol',
    affirmation: 'Minha luz interior brilha com força e clareza',
    frequency: '528 Hz',
    description: 'Dia do Sol e de Xangô - energia de liderança, vitalidade e justiça. Favorece realizações grandiosas e autoconfiança.',
    practices: ['Rituais de luz', 'Meditação solar', 'Orações de agradecimento', 'Hinos de louvor'],
    caution: ['Evitar conflitos', 'Não iniciar processos legais neste dia'],
  },
  segunda: {
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    element: 'Água',
    elementCor: 'Água',
    orixa: 'Iemanjá',
    planet: 'Lua',
    affirmation: 'Fluo como as águas e aceito minhas emoções',
    frequency: '639 Hz',
    description: 'Dia da Lua e de Iemanjá - energia de purificação,intuição e conexão emocional. Ideal para práticas de cura e autoconhecimento.',
    practices: ['Banhos ritualísticos', 'Meditação lunar', 'Rituais de limpeza', 'Conexão com o sagrado feminino'],
    caution: ['Evitar decisões importantes', 'Não fazer inimigos neste dia'],
  },
  terca: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    elementCor: 'Fogo',
    orixa: 'Iansã',
    planet: 'Marte',
    affirmation: 'Tenho coragem para enfrentar meus obstáculos',
    frequency: '528 Hz',
    description: 'Dia de Marte e de Iansã - energia de conquista, proteção e superação. Dia de guerra espiritual e abertura de caminhos.',
    practices: ['Rituais de proteção', 'Defumações', 'Pedras de raio', 'Oração de São Jorge'],
    caution: ['Evitar二重 conflitos', 'Não iniciar conflitos', 'Cuidado com acidentes'],
  },
  quarta: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    elementCor: 'Ar',
    orixa: 'Xangô',
    planet: 'Mercúrio',
    affirmation: 'A verdade e a justiça guiam minhas palavras',
    frequency: '741 Hz',
    description: 'Dia de Mercúrio e de Xangô - energia de comunicação, verdade e equilíbrio. Favorece estudos, escritura e debates.',
    practices: ['Rituais de verdade', 'Estudos sagrados', 'Orações de Xangô', 'Louvor à justiça'],
    caution: ['Evitar mentiras', 'Não fazer trapaças', 'Cuidado com falsidades'],
  },
  quinta: {
    sefirot: ['Chokhmah', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    elementCor: 'Fogo',
    orixa: 'Oxóssi',
    planet: 'Júpiter',
    affirmation: 'A abundância e prosperidade fluem em minha vida',
    frequency: '528 Hz',
    description: 'Dia de Júpiter e de Oxóssi - energia de abundância, prosperidade e proteção. Excelente para rendas, negócios e previsões.',
    practices: ['Rituais de prosperidade', 'Ofertas a Oxóssi', 'Preces por abundance', 'Trabalho com prosperidade'],
    caution: ['Evitar desperdício', 'Não recusar ofertas', 'Cuidado com dívidas'],
  },
  sexta: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    elementCor: 'Fogo',
    orixa: 'Oxum',
    planet: 'Vênus',
    affirmation: 'O amor e a harmonia florescem em meu coração',
    frequency: '528 Hz',
    description: 'Dia de Vênus e de Oxum - energia de amor, relacionamento e beleza. Ideal para casamentos, reconciliações e questões do coração.',
    practices: ['Rituais de amor', 'Banhos de Oxum', 'Ofertas de mel', 'Orações por paz'],
    caution: ['Evitar vaidade excessiva', 'Não iniciar processos de separações', 'Cuidado com ciúmes'],
  },
  sabado: {
    sefirot: ['Malkuth', 'Gevurah'],
    chakra: 1,
    element: 'Terra',
    elementCor: 'Terra',
    orixa: 'Ogum',
    planet: 'Saturno',
    affirmation: 'Construo uma base sólida para meu futuro',
    frequency: '396 Hz',
    description: 'Dia de Saturno e de Ogum - energia de trabalho, organização e proteção. Excelente para rituals deamarração e firma de documentos.',
    practices: ['Rituais deamarração', 'Trabalhos de cura', 'Ofertas a Ogum', 'Orações por proteção'],
    caution: ['Evitar preguiça', 'Não adiar obrigações', 'Cuidado com acidentes'],
  },
};

// ─── Moon Phase Spiritual Correlations ──────────────────────────────────────────
const MOON_PHASE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'lua-nova': {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Um novo ciclo começa em mim',
    frequency: '963 Hz',
  },
  'lua-crescente': {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A energia cresce e se manifesta',
    frequency: '741 Hz',
  },
  'lua-cheia': {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A luz completa brilha através de mim',
    frequency: '528 Hz',
  },
  'lua-minguante': {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Libero o que não me serve mais',
    frequency: '417 Hz',
  },
};
const PortalSchema = z.object({
  orixa: z.string(),
  planeta: z.string(),
  chakra: z.string(),
  chakraNum: z.number(),
  sefirot: z.array(z.string()),
  element: z.string(),
});

const EnergyResponseSchema = z.object({
  success: z.boolean(),
  energy: z.object({
    day: PortalDaySchema,
    orixa: z.string(),
    planeta: z.string(),
    chakra: z.string(),
    chakraNum: z.number(),
    lunarPhase: z.string(),
    lunarIllumination: z.number(),
    sefirot: z.array(z.string()),
    element: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
    description: z.string(),
    practices: z.array(z.string()),
    caution: z.array(z.string()),
  }),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }),
  spiritualStats: z.object({
    bySefirot: z.record(z.string(), z.number()),
    byChakra: z.record(z.string(), z.number()),
    byElement: z.record(z.string(), z.number()),
    byOrixa: z.record(z.string(), z.number()),
  }),
});

const PORTALS: Record<z.infer<typeof PortalDaySchema>, z.infer<typeof PortalSchema>> = {
  domingo: { orixa: 'Xangô', planeta: 'Sol', chakra: '4º Cardíaco', chakraNum: 4, sefirot: ['Kether', 'Tipheret'], element: 'Fogo' },
  segunda: { orixa: 'Iemanjá', planeta: 'Lua', chakra: '6º Frontal', chakraNum: 6, sefirot: ['Yesod', 'Binah'], element: 'Água' },
  terca: { orixa: 'Iansã', planeta: 'Marte', chakra: '3º Plexo Solar', chakraNum: 3, sefirot: ['Gevurah'], element: 'Fogo' },
  quarta: { orixa: 'Xangô', planeta: 'Mercúrio', chakra: '5º Laríngeo', chakraNum: 5, sefirot: ['Hod', 'Netzach'], element: 'Ar' },
  quinta: { orixa: 'Oxóssi', planeta: 'Júpiter', chakra: '6º Frontal', chakraNum: 6, sefirot: ['Chokhmah', 'Chesed'], element: 'Fogo' },
  sexta: { orixa: 'Oxum', planeta: 'Vênus', chakra: '4º Cardíaco', chakraNum: 4, sefirot: ['Tipheret', 'Netzach'], element: 'Fogo' },
  sabado: { orixa: 'Ogum', planeta: 'Saturno', chakra: '1º Raiz', chakraNum: 1, sefirot: ['Malkuth', 'Gevurah'], element: 'Terra' },
};

const DAYS: z.infer<typeof PortalDaySchema>[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const knownNewMoon = new Date(2024, 0, 11);
  const lunarCycle = 29.53058867;

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarAge = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;

  let phase: string;
  if (lunarAge < 1.84566) phase = 'Lua Nova';
  else if (lunarAge < 8.38293) phase = 'Lua Crescente';
  else if (lunarAge < 12.9192) phase = 'Quarto Crescente';
  else if (lunarAge < 17.4555) phase = 'Gibosa Crescente';
  else if (lunarAge < 21.9928) phase = 'Lua Cheia';
  else if (lunarAge < 26.5291) phase = 'Gibosa Minguante';
  else if (lunarAge < 29.53058867) phase = 'Quarto Minguante';
  else phase = 'Lua Nova';

  const illumination = Math.round(50 - Math.abs(lunarAge - 14.765) * 3.4);

  return { phase, illumination };
}

function getMoonPhaseCorrelation(phase: string) {
  const phaseMap: Record<string, string> = {
    'Lua Nova': 'lua-nova',
    'Lua Crescente': 'lua-crescente',
    'Quarto Crescente': 'lua-crescente',
    'Gibosa Crescente': 'lua-crescente',
    'Lua Cheia': 'lua-cheia',
    'Gibosa Minguante': 'lua-minguante',
    'Quarto Minguante': 'lua-minguante',
  };
  const key = phaseMap[phase] || 'lua-cheia';
  return MOON_PHASE_SPIRITUAL_CORRELATIONS[key] || MOON_PHASE_SPIRITUAL_CORRELATIONS['lua-cheia'];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = EnergyQuerySchema.safeParse({
      day: searchParams.get('day'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { day, sefirot, chakra, element, orixa } = parseResult.data;

    // Get current day or specified day
    const targetDay = day || DAYS[new Date().getDay()];
    const portal = PORTALS[targetDay];
    const dayCorr = DAY_SPIRITUAL_CORRELATIONS[targetDay];
    const moon = getMoonPhase(new Date());
    const moonCorr = getMoonPhaseCorrelation(moon.phase);

    // Combine day and moon correlations
    const combinedSefirot = [...new Set([...dayCorr.sefirot, ...moonCorr.sefirot])];
    const combinedChakra = Math.round((dayCorr.chakra + moonCorr.chakra) / 2);
    const combinedElement = dayCorr.element; // Day element takes precedence

    // Build response
    const response = {
      success: true as const,
      energy: {
        day: targetDay,
        orixa: dayCorr.orixa,
        planeta: dayCorr.planet,
        chakra: portal.chakra,
        chakraNum: portal.chakraNum,
        lunarPhase: moon.phase,
        lunarIllumination: moon.illumination,
        sefirot: combinedSefirot,
        element: combinedElement,
        affirmation: dayCorr.affirmation,
        frequency: dayCorr.frequency,
        description: dayCorr.description,
        practices: dayCorr.practices,
        caution: dayCorr.caution,
      },
      spiritualCorrelations: {
        sefirot: combinedSefirot,
        chakra: combinedChakra,
        element: combinedElement,
        orixa: dayCorr.orixa,
        affirmation: dayCorr.affirmation,
        frequency: dayCorr.frequency,
      },
      spiritualStats: {
        bySefirot: combinedSefirot.reduce((acc, s) => {
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byChakra: {
          [dayCorr.chakra]: 1,
          [moonCorr.chakra]: 1,
        },
        byElement: {
          [dayCorr.element]: 1,
          [moonCorr.element]: 1,
        },
        byOrixa: {
          [dayCorr.orixa]: 1,
          [moonCorr.orixa]: 1,
        },
      },
    };

    // Validate response with Zod
    const parsed = EnergyResponseSchema.safeParse(response);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Erro de validação',
        details: parsed.error.flatten().fieldErrors,
      }, { status: 500 });
    }

    // Apply spiritual filters
    if (sefirot && !combinedSefirot.includes(sefirot)) {
      return NextResponse.json({
        success: false,
        error: 'Este filtro não corresponde à energia do dia',
      }, { status: 404 });
    }

    if (chakra && portal.chakraNum !== chakra) {
      return NextResponse.json({
        success: false,
        error: 'Este filtro não corresponde à energia do dia',
      }, { status: 404 });
    }

    if (element && combinedElement !== element) {
      return NextResponse.json({
        success: false,
        error: 'Este filtro não corresponde à energia do dia',
      }, { status: 404 });
    }

    if (orixa && dayCorr.orixa !== orixa) {
      return NextResponse.json({
        success: false,
        error: 'Este filtro não corresponde à energia do dia',
      }, { status: 404 });
    }

    return NextResponse.json({
      ...parsed.data,
      spiritualCorrelations: {
        ...parsed.data.spiritualCorrelations,
        dayPortal: dayCorr,
        moonPhase: moonCorr,
      },
      meta: {
        filters: { day, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    console.error('Dashboard energy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar energia do dia',
    }, { status: 500 });
  }
}