// src/app/api/quantum/superposition/route.ts
// Quantum-like spiritual analysis API
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateMinimaxResponse, MinimaxError } from '@/lib/ai/minimax';
import type { ChatMessage } from '@/lib/ai/types';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SuperpositionRequestSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  question: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Quantum States ──────────────────────────────────────────
const QUANTUM_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  superposition: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Todas as possibilidades coexistem na luz divina',
    frequency: '963 Hz',
  },
  collapse: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O caminho se revela nacollapse da consciência',
    frequency: '639 Hz',
  },
  entanglement: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Estamos conectados através do tempo e espaço',
    frequency: '528 Hz',
  },
  coherence: {
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A coerência quântica me conecta ao divino',
    frequency: '963 Hz',
  },
  probability: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'As probabilidades se desenham no tecido da realidade',
    frequency: '741 Hz',
  },
  observation: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A observação consciente transforma a realidade',
    frequency: '741 Hz',
  },
};

// ============================================================
// TYPES
// ============================================================

export interface Possibility {
  path: string;
  description: string;
  probability: number;
  guidance: string;
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
}

export interface QuantumGuidance {
  id: string;
  userId: string;
  question: string | null;
  timestamp: string;
  possibilities: Possibility[];
  collapsedPath: string;
  analysis: string;
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

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `qsg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * POST /api/quantum/superposition
 * Perform quantum-like spiritual superposition analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = SuperpositionRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { userId, question } = parseResult.data;
    const id = generateId();

    // Build prompt for quantum superposition analysis
    const systemPrompt = `Você é um guia espiritual que explora múltiplas possibilidades de caminho espiritual simultaneamente.
Sua análise é baseada em princípios quânticos de sobreposição - onde múltiplos estados podem coexistir até serem observados/collapse.
Analise o estado espiritual do usuário considerando todas as possibilidades de evolução e caminho.

Retorne APENAS um JSON válido com este formato exato, sem markdown ou texto adicional:
{
  "possibilities": [
    {
      "path": "nome do caminho",
      "description": "descrição breve do caminho",
      "probability": número entre 0-100,
      "guidance": "orientação espiritual para este caminho"
    }
  ],
  "collapsedPath": "caminho mais provável após análise",
  "analysis": "análise espiritual do estado atual e possibilidades"
}`;

    const userPrompt = question
      ? `Usuário pergunta: ${question}`
      : 'Analise meu estado espiritual atual e possíveis caminhos de evolução.';

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await generateMinimaxResponse(messages);
    let parsed;

    try {
      parsed = JSON.parse(response);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Falha ao processar resposta do sistema',
 }, { status: 500 });
    }

    // Enhance possibilities with spiritual correlations
    const enhancedPossibilities = (parsed.possibilities || []).map((p: Possibility, index: number) => {
      const correlationKeys = Object.keys(QUANTUM_SPIRITUAL_CORRELATIONS);
      const correlation = QUANTUM_SPIRITUAL_CORRELATIONS[correlationKeys[index % correlationKeys.length]] || QUANTUM_SPIRITUAL_CORRELATIONS.superposition;
      return {
        ...p,
        sefirot: correlation.sefirot,
        chakra: correlation.chakra,
        element: correlation.element,
        orixa: correlation.orixa,
        affirmation: correlation.affirmation,
        frequency: correlation.frequency,
        spiritualCorrelations: correlation,
      };
    });

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: enhancedPossibilities.reduce((acc: Record<string, number>, p: Possibility) => {
        p.spiritualCorrelations.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {}),
      byChakra: enhancedPossibilities.reduce((acc: Record<string, number>, p: Possibility) => {
        const c = p.spiritualCorrelations.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {}),
      byElement: enhancedPossibilities.reduce((acc: Record<string, number>, p: Possibility) => {
        const e = p.spiritualCorrelations.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {}),
      byOrixa: enhancedPossibilities.reduce((acc: Record<string, number>, p: Possibility) => {
        const o = p.spiritualCorrelations.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {}),
    };

    const guidance: QuantumGuidance = {
      id,
      userId,
      question: question || null,
      timestamp: new Date().toISOString(),
      possibilities: enhancedPossibilities,
      collapsedPath: parsed.collapsedPath || '',
      analysis: parsed.analysis || '',
      sefirot: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.sefirot,
      chakra: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.chakra,
      element: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.element,
      orixa: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.orixa,
      affirmation: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.affirmation,
      frequency: QUANTUM_SPIRITUAL_CORRELATIONS.superposition.frequency,
      spiritualCorrelations: QUANTUM_SPIRITUAL_CORRELATIONS.superposition,
      spiritualStats,
    };

    return NextResponse.json({
      success: true,
      guidance,
      spiritualCorrelations: QUANTUM_SPIRITUAL_CORRELATIONS,
    });
  } catch (error) {
    if (error instanceof MinimaxError) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum superposition analysis failed',
    }, { status: 500 });
  }
}

/**
 * GET /api/quantum/superposition
 * Get available quantum spiritual states and correlations
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');
  const orixa = searchParams.get('orixa');

  let correlations = { ...QUANTUM_SPIRITUAL_CORRELATIONS };

  if (sefirot) {
    const filtered: Record<string, typeof QUANTUM_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(QUANTUM_SPIRITUAL_CORRELATIONS).forEach(([key, corr]) => {
      if (corr.sefirot.includes(sefirot)) {
        filtered[key] = corr;
      }
    });
    correlations = filtered;
  }

  if (chakra) {
    const filtered: Record<string, typeof QUANTUM_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(QUANTUM_SPIRITUAL_CORRELATIONS).forEach(([key, corr]) => {
      if (corr.chakra === parseInt(chakra)) {
        filtered[key] = corr;
      }
    });
    correlations = filtered;
  }

  if (element) {
    const filtered: Record<string, typeof QUANTUM_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(QUANTUM_SPIRITUAL_CORRELATIONS).forEach(([key, corr]) => {
      if (corr.element === element) {
        filtered[key] = corr;
      }
    });
    correlations = filtered;
  }

  if (orixa) {
    const filtered: Record<string, typeof QUANTUM_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(QUANTUM_SPIRITUAL_CORRELATIONS).forEach(([key, corr]) => {
      if (corr.orixa === orixa) {
        filtered[key] = corr;
      }
    });
    correlations = filtered;
  }

  return NextResponse.json({
    success: true,
    correlations,
    count: Object.keys(correlations).length,
    meta: {
      filters: { sefirot, chakra, element, orixa },
    },
  });
}