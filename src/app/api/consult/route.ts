// ============================================================
// API ROUTE — Consulta Interativa (Q&A) sobre uma leitura
// ============================================================
// Doc 12 §7. Recebe { readingId, question } (+ consultationId opcional),
// roteia a pergunta deterministicamente para as casas relevantes e
// responde ancorado em RAG fechado (dossiê + mapas + casas roteadas).

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  buildConsultContext,
  buildConsultSystemPrompt,
  buildConsultUserPayload,
} from '@/lib/ai/dossier/consult-context';
import type { ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';
import type { MatrixData } from '@/types';

const consultSchema = z.object({
  readingId: z.string().min(1, 'readingId é obrigatório'),
  consultationId: z.string().optional(),
  question: z.string().min(1, 'A pergunta não pode ser vazia').max(2000),
  // Contexto da leitura. Em produção isto é carregado do banco pelo readingId;
  // aceito no body como fallback enquanto a persistência do cockpit não está ligada.
  client: z.unknown().optional(),
  matrixData: z.unknown().optional(),
  reportHouses: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = consultSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validação falhou', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question, client, matrixData, reportHouses } = parsed.data;

    // TODO(persistência): carregar Reading + Client + Report pelo readingId
    // e a sessão do operador. Enquanto o cockpit não persiste, usamos o
    // contexto enviado no body.
    if (!client || !matrixData) {
      return NextResponse.json(
        { error: 'Contexto da leitura ausente (client + matrixData).' },
        { status: 422 }
      );
    }

    const context = buildConsultContext(
      question,
      client as ClientMaps,
      matrixData as MatrixData,
      reportHouses as Record<string, { interpretation?: string; houseName?: string }> | undefined
    );

    const systemPrompt = buildConsultSystemPrompt();
    const userPayload = buildConsultUserPayload(question, context);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Sem chave: devolve o roteamento determinístico (útil para testes/preview).
      return NextResponse.json(
        {
          routedThemes: context.routing.themes,
          routedHouses: context.routing.houses,
          answer: null,
          note: 'OPENAI_API_KEY não configurada — retornando apenas o roteamento.',
        },
        { status: 200 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: 'Erro ao chamar o LLM', details: detail }, { status: 502 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? null;

    return NextResponse.json({
      routedThemes: context.routing.themes,
      routedHouses: context.routing.houses,
      answer,
      tokensUsed: data.usage?.total_tokens,
    });
  } catch (error) {
    console.error('Error in /api/consult:', error);
    return NextResponse.json({ error: 'Erro interno', details: String(error) }, { status: 500 });
  }
}
