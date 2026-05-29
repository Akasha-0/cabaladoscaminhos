// src/app/api/divination/cross-system/route.ts
// Cross-System Divination API - Combines Tarot, Ifá/Odu, Numerology, Astrology

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TarotCard, MAJOR_ARCANA, MINOR_ARCANA } from '@/lib/tarot/cards';
import { odusData } from '@/lib/odus/calculos';
import { calcularPitagorica, calcularPitagoricaData } from '@/lib/numerologia/calculos';
import type { MapaNatal, Aspecto, Planeta } from '@/lib/astrologia/tipos';
import { generateMinimaxResponse } from '@/lib/ai/minimax';
import { NUMEROLOGY_ODU_CORRELATIONS } from '@/lib/numerologia/odu-correlations';

// ============================================================
// TYPES
// ============================================================

export interface CrossSystemDivinationResponse {
  id: string;
  question: string;
  spread: string;
  tarotReading: TarotCard[];
  oduReading: {
    numero: number;
    nome: string;
    significado: string;
    orixaRegente: string;
    elementos: string;
  };
  numerologyReading: {
    numeroReduzido: number;
    nomeNumerologico: string;
    significado: string;
    sefirotRelacionado: string;
  };
  astrologyReading: {
    currentAspect: string;
    dominantPlanet: string;
    elementalBalance: string;
  };
  combinedInterpretation: string;
  aiGuidance: string;
  timestamp: string;
}

interface RequestBody {
  userId: string;
  question: string;
  spread?: string;
  birthDate?: string;
  userName?: string;
}

// ============================================================
// VALIDATION
// ============================================================

const requestSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  question: z.string().min(3, 'A pergunta deve ter pelo menos 3 caracteres').max(500, 'Pergunta muito longa'),
  spread: z.enum(['celtic-cross', 'three-cards', 'five-cards', 'single-card']).optional().default('celtic-cross'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  userName: z.string().optional(),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `csd-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function getCardsForSpread(spread: string, count: number): TarotCard[] {
  const allCards = [...MAJOR_ARCANA, ...MINOR_ARCANA];
  const deck = [...allCards];
  
  // Shuffle effect via pseudo-random selection
  const selected: TarotCard[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count && deck.length > 0; i++) {
    const index = (now + i * 7) % deck.length;
    selected.push(deck.splice(index, 1)[0]);
  }
  
  return selected;
}

function getRandomOdu(): { numero: number; nome: string; significado: string; orixaRegente: string; elementos: string } {
  const numero = Math.floor(Math.random() * 16) + 1;
  const odu = odusData[numero];
  return {
    numero,
    nome: odu.nome,
    significado: odu.significado,
    orixaRegente: odu.orixaRegente,
    elementos: odu.elementos,
  };
}

function getNumerologyReading(userName?: string, birthDate?: string): { numeroReduzido: number; nomeNumerologico: string; significado: string; sefirotRelacionado: string } {
  let numeroReduzido: number;
  let nomeNumerologico: string;
  
  if (birthDate) {
    numeroReduzido = calcularPitagoricaData(birthDate);
    nomeNumerologico = 'Número de Vida';
  } else if (userName) {
    numeroReduzido = calcularPitagorica(userName);
    nomeNumerologico = 'Número de Destino';
  } else {
    // Use current date for universal number
    const today = new Date().toISOString().split('T')[0];
    numeroReduzido = calcularPitagoricaData(today);
    nomeNumerologico = 'Número Universal';
  }
  
  const correlation = NUMEROLOGY_ODU_CORRELATIONS.find(c => c.numeroReduzido === numeroReduzido);
  
  return {
    numeroReduzido,
    nomeNumerologico,
    significado: correlation?.equivalenteCabalistica || `Número ${numeroReduzido}`,
    sefirotRelacionado: correlation ? `${correlation.sephirahFrom} → ${correlation.sephirahTo}` : '',
  };
}

function getAstrologyReading(): { currentAspect: string; dominantPlanet: string; elementalBalance: string } {
  const planets: Planeta[] = ['sol', 'lua', 'mercurio', 'venus', 'marte'];
  const signs = ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem'];
  
  const now = Date.now();
  const dominantPlanet = planets[now % planets.length];
  const currentSign = signs[Math.floor(now / 1000000) % signs.length];
  
  return {
    currentAspect: `Lua em ${currentSign.replace(/^\w/, c => c.toUpperCase())}`,
    dominantPlanet: dominantPlanet.charAt(0).toUpperCase() + dominantPlanet.slice(1),
    elementalBalance: 'Fogo: 2, Água: 2, Ar: 3, Terra: 3',
  };
}

async function generateCombinedInterpretation(
  tarot: TarotCard[],
  odu: { nome: string; significado: string },
  numerology: { numeroReduzido: number; significado: string },
  astrology: { currentAspect: string; dominantPlanet: string },
  question: string
): Promise<string> {
  const tarotNames = tarot.map(c => c.name).join(', ');
  const oduInfo = `${odu.nome}: ${odu.significado}`;
  
  const messages = [
    {
      role: 'system' as const,
      content: `Você é um guia espiritual que integra múltiplos sistemas de adivinhação: Tarot, Ifá/Odú, Numerologia e Astrologia.
Sua tarefa é criar uma interpretação unificada que mostre como esses sistemas se complementam.
Seja poético, profundo e conecte os símbolos de forma coerente.
Responda em português brasileiro.`
    },
    {
      role: 'user' as const,
      content: `Com base nesta pergunta: "${question}"
      
Tarot: ${tarotNames}
Ifá/Odú: ${oduInfo}
Numerologia: ${numerology.numeroReduzido} - ${numerology.significado}
Astrologia: ${astrology.currentAspect}, planeta dominante: ${astrology.dominantPlanet}

Crie uma interpretação unificada que mostre como todos esses sistemas se alinham para responder à pergunta.`
    }
  ];
  
  try {
    const response = await generateMinimaxResponse(messages, {
      temperature: 0.7,
      max_tokens: 800,
    });
    return response.content;
  } catch (error) {
    console.error('AI interpretation error:', error);
    return `A convergência dos símbolos sugere que a resposta está em movimento. O ${tarot[0]?.name || 'Tarot'} e ${odu.nome} apontam para um caminho de transformação interior. A Numerologia ${numerology.numeroReduzido} indica um ciclo de conclusão, enquanto ${astrology.currentAspect} traz influências de clareza e introspecção.`;
  }
}

async function generateAIGuidance(
  question: string,
  tarot: TarotCard[],
  odu: { nome: string }
): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content: `Você é um sábio guia espiritual que oferece orientação prática baseada em múltiplos sistemas esotéricos.
Forneça conselhos claros, práticos e compassivos.
Responda em português brasileiro, de forma concisa mas profunda.`
    },
    {
      role: 'user' as const,
      content: `Pergunta: "${question}"
      
Cartas principais: ${tarot.slice(0, 3).map(c => c.name).join(', ')}
Odú: ${odu.nome}

Forneça uma orientação prática e espiritual para esta pessoa.`
    }
  ];
  
  try {
    const response = await generateMinimaxResponse(messages, {
      temperature: 0.8,
      max_tokens: 500,
    });
    return response.content;
  } catch (error) {
    console.error('AI guidance error:', error);
    return `Permaneça no caminho da luz. Os símbolos indicam uma jornada de autoconhecimento. Confie na sabedoria que habita em você.`;
  }
}

// ============================================================
// SPREAD CONFIGURATIONS
// ============================================================

const SPREAD_CARDS: Record<string, { count: number; labels: string[] }> = {
  'celtic-cross': {
    count: 10,
    labels: ['Presente', 'Desafio', 'Base', 'Passado', 'Coroa', 'Futuro', 'Você', 'Ambiente', 'Esperanças/Medos', 'Resultado Final'],
  },
  'three-cards': {
    count: 3,
    labels: ['Passado', 'Presente', 'Futuro'],
  },
  'five-cards': {
    count: 5,
    labels: ['Situação', 'Obstáculo', 'Ação', 'Influência Externa', 'Resultado'],
  },
  'single-card': {
    count: 1,
    labels: ['Resposta'],
  },
};

// ============================================================
// API ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    // Validate request
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    
    const { userId, question, spread = 'celtic-cross', birthDate, userName } = validation.data;
    
    // Generate spread configuration
    const spreadConfig = SPREAD_CARDS[spread];
    
    // Get readings from all systems
    const tarotReading = getCardsForSpread(spread, spreadConfig.count);
    const oduReading = getRandomOdu();
    const numerologyReading = getNumerologyReading(userName, birthDate);
    const astrologyReading = getAstrologyReading();
    
    // Generate interpretations
    const [combinedInterpretation, aiGuidance] = await Promise.all([
      generateCombinedInterpretation(tarotReading, oduReading, numerologyReading, astrologyReading, question),
      generateAIGuidance(question, tarotReading, oduReading),
    ]);
    
    // Build response
    const response: CrossSystemDivinationResponse = {
      id: generateId(),
      question,
      spread,
      tarotReading,
      oduReading,
      numerologyReading,
      astrologyReading,
      combinedInterpretation,
      aiGuidance,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Cross-system divination error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Erro ao processar divinização',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for metadata
export async function GET() {
  return NextResponse.json({
    name: 'Cross-System Divination',
    version: '1.0.0',
    description: 'API que combina Tarot, Ifá/Odú, Numerologia e Astrologia para adivinhação integrada',
    spreads: Object.keys(SPREAD_CARDS),
    supportedSystems: ['tarot', 'numerology', 'astrology', 'ifa/odu'],
  });
}