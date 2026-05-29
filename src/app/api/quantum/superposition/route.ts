// src/app/api/quantum/superposition/route.ts
// Quantum-like spiritual analysis API

import { NextRequest, NextResponse } from 'next/server';
import { generateMinimaxResponse, MinimaxError } from '@/lib/ai/minimax';
import type { ChatMessage } from '@/lib/ai/types';

// ============================================================
// TYPES
// ============================================================

export interface SuperpositionRequest {
  userId: string;
  question?: string;
}

export interface Possibility {
  path: string;
  description: string;
  probability: number;
  guidance: string;
}

export interface QuantumGuidance {
  id: string;
  userId: string;
  question: string | null;
  timestamp: string;
  possibilities: Possibility[];
  collapsedPath: string;
  analysis: string;
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
    const body: SuperpositionRequest = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: 'Parâmetro "userId" é obrigatório' },
        { status: 400 }
      );
    }

    const { userId, question } = body;
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
      ? `Usuário: ${userId}\nQuestão espiritual: ${question}\nAnalise as possibilidades de caminho espiritual para esta questão.`
      : `Usuário: ${userId}\nAnalise as possibilidades de caminho espiritual para este usuário sem uma questão específica.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await generateMinimaxResponse(messages, {
      model: 'minimax/m2.7',
      temperature: 0.8,
      max_tokens: 1500
    });

    // Parse AI response
    let parsedData: {
      possibilities: Possibility[];
      collapsedPath: string;
      analysis: string;
    };

    try {
      // Try to extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(response.content);
      }
    } catch {
      // Fallback if JSON parsing fails
      parsedData = {
        possibilities: [
          {
            path: 'Caminho da Harmonia',
            description: 'Aproximação gradual à plenitude espiritual',
            probability: 34,
            guidance: 'Continue sua prática atual com devotion e gratidão'
          },
          {
            path: 'Caminho da Transformação',
            description: 'Processo intenso de purificação interior',
            probability: 33,
            guidance: 'Esteja aberto à mudança e libere o que não serve mais'
          },
          {
            path: 'Caminho do Conhecimento',
            description: 'Expansão da consciência e sabedoria',
            probability: 33,
            guidance: 'Busque study and meditation para acelerar sua evolução'
          }
        ],
        collapsedPath: 'Caminho da Harmonia',
        analysis: response.content
      };
    }

    const result: QuantumGuidance = {
      id,
      userId,
      question: question || null,
      timestamp: new Date().toISOString(),
      ...parsedData
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na análise de superposição quântica:', error);

    if (error instanceof MinimaxError) {
      return NextResponse.json(
        { error: `Erro do serviço de IA: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar análise de superposição quântica' },
      { status: 500 }
    );
  }
}
