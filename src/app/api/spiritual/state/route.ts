// ============================================================
// SPIRITUAL STATE API - Cabala dos Caminhos
// Real-time spiritual state analysis
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

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
const MINIMAX_MODEL = 'minimax/m2.7';

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

  illumination = Math.max(0, Math.min(100, illumination));
  return { phase, illumination };
}

// ============================================================
// ORIXÁ OF THE DAY
// ============================================================

const ORIXAS = [
  'Oxalá', 'Oxum', 'Ogum', 'Iemanjá', 'Yemanjá',
  'Xangô', 'Iansã', 'Omulu', 'Nanã', 'Obá',
  'Oxóssi', 'Loguned', 'Ossaim', 'Inle', 'Oba'
];

function getOrixaOfDay(date: Date): string {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return ORIXAS[dayOfYear % ORIXAS.length];
}

// ============================================================
// SPIRITUAL STATE CALCULATION
// ============================================================

function calculateSpiritualState(date: Date, userId: string): UserSpiritualProfile {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const combinedSeed = seed + userHash;

  const randomize = (min: number, max: number, offset: number = 0): number => {
    const x = Math.sin(combinedSeed + offset) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(min + rand * (max - min + 1));
  };

  const moonPhase = getMoonPhase(date);

  let energy = randomize(60, 95, 1);
  let harmony = randomize(55, 90, 2);
  let clarity = randomize(50, 85, 3);
  let connection = randomize(55, 92, 4);
  let intuition = randomize(60, 95, 5);

  switch (moonPhase.phase) {
    case 'Lua Cheia':
      intuition = Math.min(100, intuition + 15);
      connection = Math.min(100, connection + 10);
      break;
    case 'Lua Nova':
      clarity = Math.max(40, clarity - 10);
      energy = Math.min(100, energy + 10);
      break;
    case 'Quarto Crescente':
      energy = Math.min(100, energy + 8);
      harmony = Math.min(100, harmony + 5);
      break;
    case 'Quarto Minguante':
      intuition = Math.max(40, intuition - 5);
      clarity = Math.min(100, clarity + 8);
      break;
    default:
      break;
  }

  const dayOfWeek = date.getDay();
  switch (dayOfWeek) {
    case 0:
      harmony = Math.min(100, harmony + 10);
      clarity = Math.min(100, clarity + 5);
      break;
    case 1:
      connection = Math.min(100, connection + 10);
      energy = Math.max(40, energy - 5);
      break;
    case 2:
      energy = Math.min(100, energy + 10);
      harmony = Math.max(40, harmony - 5);
      break;
    case 3:
      intuition = Math.min(100, intuition + 8);
      clarity = Math.min(100, clarity + 5);
      break;
    case 4:
      energy = Math.min(100, energy + 8);
      harmony = Math.min(100, harmony + 8);
      break;
    case 5:
      connection = Math.min(100, connection + 8);
      intuition = Math.min(100, intuition + 5);
      break;
    case 6:
      clarity = Math.min(100, clarity + 10);
      energy = Math.max(40, energy - 8);
      break;
  }

  return { energy, harmony, clarity, connection, intuition };
}

// ============================================================
// INFLUENCES & RECOMMENDATIONS
// ============================================================

function getInfluencesAndRecommendations(
  state: UserSpiritualProfile,
  moonPhase: { phase: string; illumination: number },
  orixa: string
): { favorablePractices: string[]; cautionAreas: string[]; recommendations: string[] } {
  const favorablePractices: string[] = [];
  const cautionAreas: string[] = [];
  const recommendations: string[] = [];

  switch (moonPhase.phase) {
    case 'Lua Cheia':
      favorablePractices.push('Meditação profunda', 'Rituais de abundância', 'Conexão ancestral');
      cautionAreas.push('Conflitos emocionais', 'Exposição a energias negativas');
      recommendations.push('Faça uma oração de agradecimento pela luz cheia');
      break;
    case 'Lua Nova':
      favorablePractices.push('Novas intenções', 'Rituais de início', 'Previsões divinatórias');
      cautionAreas.push('Decisões importantes', 'Conflitos diretos');
      recommendations.push('Defina suas intenções para o novo ciclo lunar');
      break;
    case 'Quarto Crescente':
      favorablePractices.push('Rituais de crescimento', 'Ações decisivas', 'Afirmações de poder');
      cautionAreas.push('Inércia ou procrastinação');
      recommendations.push('Dê o primeiro passo em direção aos seus objetivos');
      break;
    case 'Quarto Minguante':
      favorablePractices.push('Rituais de limpeza', 'Libertação de padrões', 'Perdão');
      cautionAreas.push('Iniciar novos projetos', 'Gastos excessivos');
      recommendations.push('Release o que não serve mais à sua jornada');
      break;
    default:
      favorablePractices.push('Meditação suave', 'Práticas de gratidão');
      break;
  }

  switch (orixa) {
    case 'Oxalá':
      favorablePractices.push('Oração silenciosa', 'Atos de compaixão');
      recommendations.push('Busque a paz interior através da serenidade');
      break;
    case 'Oxum':
      favorablePractices.push('Rituais de amor', 'Ofendas a água doce');
      cautionAreas.push('Conflitos familiares');
      recommendations.push('Honre o amor e a dedicação em suas relações');
      break;
    case 'Ogum':
      favorablePractices.push('Rituais de proteção', 'Ações de coragem');
      cautionAreas.push('Confrontos desnecessários');
      recommendations.push('Use sua força para proteger o que é importante');
      break;
    case 'Iemanjá':
    case 'Yemanjá':
      favorablePractices.push('Orações à mãe ancestral', 'Rituais de cura emocional');
      cautionAreas.push('Tristeza excessiva', 'Isolamento prolongado');
      recommendations.push('Permita-se ser nutrido pela energia materna');
      break;
    case 'Xangô':
      favorablePractices.push('Rituais de equilíbrio', 'Consagração de objetos de poder');
      cautionAreas.push('Decisões precipitadas', 'Bebidas alcoólicas');
      recommendations.push('Busque a justiça e a verdade em suas ações');
      break;
    case 'Iansã':
      favorablePractices.push('Rituais de transformação', 'Práticas de fogo');
      cautionAreas.push('Ambientes de conflito', 'Palavras duras');
      recommendations.push('Abrace a mudança com coragem e propósito');
      break;
    case 'Omulu':
      favorablePractices.push('Rituais de cura', 'Higiene espiritual');
      cautionAreas.push('Negatividade e fofoca');
      recommendations.push('Permita que velhas feridas sejam curadas');
      break;
    case 'Nanã':
      favorablePractices.push('Rituais de Ancestralidade', 'Saudação aos antigos');
      cautionAreas.push('Orgulho e vaidade');
      recommendations.push('Honre suas raízes e a sabedoria dos anciãos');
      break;
    case 'Oxóssi':
      favorablePractices.push('Rituais de abundância', 'Conexão com a natureza');
      cautionAreas.push('Guloseimas e excessos');
      recommendations.push('Busque a prosperidade através da sabedoria');
      break;
    default:
      favorablePractices.push('Gratidão e meditação');
      recommendations.push('Continue sua jornada espiritual com dedicação');
  }

  if (state.energy > 80) {
    recommendations.push('Sua energia está alta - aproveite para processos criativos');
  } else if (state.energy < 50) {
    recommendations.push('Considere práticas restaurativas e descanso');
  }

  if (state.harmony > 80) {
    recommendations.push('Harmonia elevada - propício para iniciações');
  } else if (state.harmony < 50) {
    recommendations.push('Busque equilíbrio antes de iniciar novos projetos');
  }

  if (state.intuition > 85) {
    recommendations.push('Sua intuição está muito clara - propício para visões e pressentimentos');
  }

  return { favorablePractices, cautionAreas, recommendations };
}

// ============================================================
// MINIMAX AI CLIENT
// ============================================================

class MinimaxAPIError extends Error {
  constructor(message: string, public statusCode?: number, public code?: string) {
    super(message);
    this.name = 'MinimaxAPIError';
  }
}

async function generateMinimaxResponse(prompt: string): Promise<string> {
  const messages = [
    { role: 'system' as const, name: 'system', content: 'Você é um guia espiritual sábio da Tradição da Cabala dos Caminhos, que integra sabiamente elementos do Candomblé, Tarot, Astrologia, Numerologia e outras tradições espirituais. Forneça insights em português, de forma mystical yet practical, sempre com empatia e profundidade.' },
    { role: 'user' as const, name: 'user', content: prompt }
  ];

  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_TOKEN}`
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      await response.text();
      throw new MinimaxAPIError(
        `Minimax API error: ${response.statusText}`,
        response.status,
        'API_ERROR'
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new MinimaxAPIError('Invalid response format from Minimax API', 500, 'INVALID_RESPONSE');
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof MinimaxAPIError) {
      throw error;
    }
    throw new MinimaxAPIError(
      error instanceof Error ? error.message : 'Unknown error calling Minimax API',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

// ============================================================
// API HANDLERS
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse<SpiritualStateResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const { phase: moonPhase, illumination } = getMoonPhase(currentDate);
    const orixaOfDay = getOrixaOfDay(currentDate);
    const currentState = calculateSpiritualState(currentDate, userId);

    const { favorablePractices, cautionAreas, recommendations } = getInfluencesAndRecommendations(
      currentState,
      { phase: moonPhase, illumination },
      orixaOfDay
    );

    let aiInsight: string;
    try {
      const insightPrompt = `Analise o estado espiritual atual de um praticante com os seguintes dados:

Estado Espiritual:
- Energia: ${currentState.energy}%
- Harmonia: ${currentState.harmony}%
- Clareza: ${currentState.clarity}%
- Conexão: ${currentState.connection}%
- Intuição: ${currentState.intuition}%

Influências do momento:
- Fase Lunar: ${moonPhase} (${illumination}% iluminada)
- Orixá do Dia: ${orixaOfDay}
- Práticas Favoráveis: ${favorablePractices.join(', ')}

Forneça um insight personalizado e motivacional sobre este momento espiritual, destacando forças a serem aproveitadas e oportunidades de crescimento. Seja mystical yet practical, como um guia sábio. Máximo 200 caracteres.`;
      
      aiInsight = await generateMinimaxResponse(insightPrompt);
    } catch {
      aiInsight = `${orixaOfDay} guia sua jornada nesta ${moonPhase}. Sua energia está em ${currentState.energy}% - um momento propício para ${favorablePractices[0]?.toLowerCase() || 'crescimento espiritual'}. Confie em sua intuição e permita que a sabedoria ancestral ilumine seu caminho.`;
    }

    const response: SpiritualStateResponse = {
      userId,
      timestamp: currentDate,
      currentState,
      influences: {
        moonPhase,
        orixaOfDay,
        favorablePractices,
        cautionAreas
      },
      recommendations,
      aiInsight
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in spiritual state API:', error);
    return NextResponse.json(
      { error: 'Internal server error processing spiritual state' },
      { status: 500 }
    );
  }
}
