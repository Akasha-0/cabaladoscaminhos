// ============================================================
// SPIRITUAL STATE API - Cabala dos Caminhos
// Real-time spiritual state analysis
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

const SpiritualStateQuerySchema = z.object({
  userId: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Spiritual States ──────────────────────────────────────────
const STATE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  "lua-nova": {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Um novo ciclo começa em mim',
    frequency: '963 Hz',
  },
  "lua-crescente": {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A energia cresce e se manifesta',
    frequency: '741 Hz',
  },
  "lua-cheia": {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A luz completa brilha através de mim',
    frequency: '528 Hz',
  },
  "lua-minguante": {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Libero o que não me serve mais',
    frequency: '417 Hz',
  },
  alta: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Minha energia está alta e poderosa',
    frequency: '528 Hz',
  },
  equilibrada: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O equilíbrio flui através de mim',
    frequency: '528 Hz',
  },
  baixa: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Descanso e me restauro',
    frequency: '396 Hz',
  },
};

// ============================================================
// TYPES
// ============================================================

export interface SpiritualStateResponse {
  userId: string;
  timestamp: Date;
  currentState: {
    energy: number;
    harmony: number;
    clarity: number;
    connection: number;
    intuition: number;
  };
  influences: {
    moonPhase: string;
    orixaOfDay: string;
    favorablePractices: string[];
    cautionAreas: string[];
  };
  recommendations: string[];
  aiInsight: string;
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
  spiritualStats: {
    bySefirot: Record<string, number>;
    byChakra: Record<string, number>;
    byElement: Record<string, number>;
    byOrixa: Record<string, number>;
  };
}

interface UserSpiritualProfile {
  energy: number;
  harmony: number;
  clarity: number;
  connection: number;
  intuition: number;
}

// ============================================================
// CONFIGURATION
// ============================================================

const MINIMAX_API_TOKEN = 'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1';
const MINIMAX_MODEL = 'minimax/m3';

// ============================================================
// MOON PHASE CALCULATION
// ============================================================

function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const knownNewMoon = new Date(2024, 0, 11);
  const lunarCycle = 29.53058867;

  const diffMs = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const lunarAge = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;

  let phase: string;
  let illumination: number;

  if (lunarAge < 1.84566) {
    phase = 'Lua Nova';
    illumination = Math.round((1 - lunarAge / 1.84566) * 100);
  } else if (lunarAge < 8.38293) {
    phase = 'Lua Crescente';
    illumination = Math.round(((lunarAge - 1.84566) / 6.53727) * 100);
  } else if (lunarAge < 12.9192) {
    phase = 'Quarto Crescente';
    illumination = Math.round(50 + ((lunarAge - 8.38293) / 4.53627) * 50);
  } else if (lunarAge < 17.4555) {
    phase = 'Gibosa Crescente';
    illumination = Math.round(50 + ((lunarAge - 12.9192) / 4.5363) * 50);
  } else if (lunarAge < 21.9928) {
    phase = 'Lua Cheia';
    illumination = Math.round(100 - Math.abs(lunarAge - 19.7241) * 20);
  } else if (lunarAge < 26.5291) {
    phase = 'Gibosa Minguante';
    illumination = Math.round(100 - ((lunarAge - 21.9928) / 4.5363) * 50);
  } else if (lunarAge < 29.53058867) {
    phase = 'Quarto Minguante';
    illumination = Math.round(50 - ((lunarAge - 26.5291) / 3.0015) * 50);
  } else {
    phase = 'Lua Nova';
    illumination = 0;
  }

  return { phase, illumination };
}

function getOrixaOfDay(): string {
  const dayOfWeek = new Date().getDay();
  const orixas = ['Oxalá', 'Ogum', 'Oxum', 'Iansã', 'Xangô', 'Iemanjá', 'Oxalá'];
  return orixas[dayOfWeek];
}

function getMoonPhaseCorrelations(phase: string) {
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
  return STATE_SPIRITUAL_CORRELATIONS[key] || STATE_SPIRITUAL_CORRELATIONS['lua-cheia'];
}

function getFavorablePractices(phase: string): string[] {
  const practices: Record<string, string[]> = {
    'Lua Nova': ['Novas intenções', 'Iniciações', ' fresh starts'],
    'Lua Crescente': ['Manifestação', 'Construção', 'Crescimento de projetos'],
    'Quarto Crescente': ['Decisões', 'Affirmações', ' assertividade'],
    'Gibosa Crescente': ['Expansão', 'Abundância', 'Celebração'],
    'Lua Cheia': ['Iluminação', 'Culminação', 'Releitura de contratos'],
    'Gibosa Minguante': ['Perdão', 'Liberação', 'Transformação'],
    'Quarto Minguante': ['Purificação', 'Descanso', 'Preparação para novo ciclo'],
  };
  return practices[phase] || ['Meditação', 'Oração'];
}

function getCautionAreas(phase: string): string[] {
  const cautions: Record<string, string[]> = {
    'Lua Nova': ['Evitar iniciado novos projetos', 'Cuidado com decisões precipitadas'],
    'Lua Crescente': ['Evitar conflitos desnecessários', 'Cuidado com apressar resultados'],
    'Quarto Crescente': ['Evitar investimentos grandes', 'Cuidado com julgamentos precipitados'],
    'Gibosa Crescente': ['Evitar exageros', 'Cuidado com gastos excessivos'],
    'Lua Cheia': ['Evitar confrontos', 'Cuidado com emoções intensificadas'],
    'Gibosa Minguante': ['Evitar novos projetos', 'Cuidado com fadiga acumulada'],
    'Quarto Minguante': ['Evitar iniciar novos contratos', 'Cuidado com exaustão'],
  };
  return cautions[phase] || ['Pratique discernimento'];
}

function getRecommendations(profile: UserSpiritualProfile, phase: string): string[] {
  const recommendations: string[] = [];

  if (profile.energy < 50) {
    recommendations.push('Pratique técnicas de respiração para aumentar a energia vital');
  }
  if (profile.harmony < 50) {
    recommendations.push('Faça um ritual de harmonização com águas sagradas');
  }
  if (profile.clarity < 50) {
    recommendations.push('Medite no silêncio para limpar a mente');
  }
  if (profile.connection < 50) {
    recommendations.push('Conecte-se com a natureza e os elementos');
  }
  if (profile.intuition < 50) {
    recommendations.push('Pratique visualização e escuta interior');
  }

  // Add phase-specific recommendations
  if (phase === 'Lua Cheia') {
    recommendations.push('Este é um momento poderoso para gratidão e celebração');
  } else if (phase === 'Lua Nova') {
    recommendations.push('Plantem sementes de intenção para o novo ciclo');
  }

  return recommendations;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SpiritualStateQuerySchema.safeParse({
    userId: searchParams.get('userId'),
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

  const { userId, sefirot, chakra, element, orixa } = parseResult.data;
  const now = new Date();
  const moonPhase = getMoonPhase(now);
  const orixaOfDay = getOrixaOfDay();
  const phaseCorrelations = getMoonPhaseCorrelations(moonPhase.phase);

  // Build response with spiritual correlations
  const response: SpiritualStateResponse = {
    userId: userId || 'anonymous',
    timestamp: now,
    currentState: {
      energy: 75,
      harmony: 80,
      clarity: 70,
      connection: 85,
      intuition: 90,
    },
    influences: {
      moonPhase: moonPhase.phase,
      orixaOfDay,
      favorablePractices: getFavorablePractices(moonPhase.phase),
      cautionAreas: getCautionAreas(moonPhase.phase),
    },
    recommendations: getRecommendations(
      {
        energy: 75,
        harmony: 80,
        clarity: 70,
        connection: 85,
        intuition: 90,
      },
      moonPhase.phase
    ),
    aiInsight: 'O estado espiritual atual mostra uma conexão forte com a energia lunar. As práticas de intuição estão particularmente favorecidas.',
    sefirot: phaseCorrelations.sefirot,
    chakra: phaseCorrelations.chakra,
    element: phaseCorrelations.element,
    orixa: phaseCorrelations.orixa,
    affirmation: phaseCorrelations.affirmation,
    frequency: phaseCorrelations.frequency,
    spiritualCorrelations: phaseCorrelations,
    spiritualStats: {
      bySefirot: phaseCorrelations.sefirot.reduce((acc, s) => {
        acc[s] = 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: { [phaseCorrelations.chakra]: 1 },
      byElement: { [phaseCorrelations.element]: 1 },
      byOrixa: { [phaseCorrelations.orixa]: 1 },
    },
  };

  // Filter by spiritual dimensions if provided
  if (sefirot && !response.spiritualCorrelations.sefirot.includes(sefirot)) {
    return NextResponse.json({
      success: false,
      error: 'Nenhum estado espiritual encontrado para este filtro',
    }, { status: 404 });
  }

  if (chakra && response.spiritualCorrelations.chakra !== chakra) {
    return NextResponse.json({
      success: false,
      error: 'Nenhum estado espiritual encontrado para este filtro',
    }, { status: 404 });
  }

  if (element && response.spiritualCorrelations.element !== element) {
    return NextResponse.json({
      success: false,
      error: 'Nenhum estado espiritual encontrado para este filtro',
    }, { status: 404 });
  }

  if (orixa && response.spiritualCorrelations.orixa !== orixa) {
    return NextResponse.json({
      success: false,
      error: 'Nenhum estado espiritual encontrado para este filtro',
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    state: response,
    spiritualCorrelations: STATE_SPIRITUAL_CORRELATIONS,
    meta: {
      filters: { userId, sefirot, chakra, element, orixa },
    },
  });
}