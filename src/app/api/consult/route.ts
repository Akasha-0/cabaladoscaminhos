// ============================================================
// API ROUTE — Consulta Interativa (Q&A) sobre uma leitura (Fase 7)
// ============================================================
// Doc 12 §7. Recebe { readingId, consultationId?, question }, carrega
// o contexto do banco (Reading + Client + Report + matrixData), roteia
// a pergunta determinísticamente, responde ancorado em RAG fechado, e
// PERSISTE a conversa (Consultation + ChatMessage).
//
// Fase 7: a persistência foi cabeada. O cliente NÃO envia mais
// client/matrixData/reportHouses no body — tudo vem do Prisma.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  buildConsultContext,
  buildConsultSystemPrompt,
  buildConsultUserPayload,
} from '@/lib/ai/dossier/consult-context';
import {
  createConsultation,
  addChatMessage,
  getConsultContext,
} from '@/lib/db/consultation-actions';

// ----------------------------------------------------------------------------
// Schema
// ----------------------------------------------------------------------------

const consultSchema = z.object({
  readingId: z.string().min(1, 'readingId é obrigatório'),
  consultationId: z.string().optional(),
  question: z.string().min(1, 'A pergunta não pode ser vazia').max(2000),
});

type ConsultInput = z.infer<typeof consultSchema>;

// ----------------------------------------------------------------------------
// Route
// ----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1) Auth
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // 2) Validação
  let body: ConsultInput;
  try {
    body = consultSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validação falhou', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // 3) Carrega contexto do banco
  const consultContext = await getConsultContext(body.readingId);
  if (!consultContext) {
    return NextResponse.json(
      { error: `Reading ${body.readingId} não encontrada` },
      { status: 404 }
    );
  }

  // 4) Resolve/finds a Consultation (cria se não foi passada)
  let consultationId = body.consultationId;
  if (!consultationId) {
    const newConsultation = await createConsultation({
      readingId: body.readingId,
      operatorId: operator.id,
      title: undefined,
    });
    consultationId = newConsultation.id;
  } else {
    // Garante que a consultation passada existe e pertence à leitura
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { id: true, readingId: true },
    });
    if (!existing || existing.readingId !== body.readingId) {
      return NextResponse.json(
        { error: 'consultationId inválido para esta leitura' },
        { status: 400 }
      );
    }
  }

  // 5) Persiste a pergunta do usuário
  await addChatMessage({
    consultationId,
    role: 'USER',
    content: body.question,
  });

  // 6) Monta contexto RAG-fechado a partir do banco
  // buildConsultContext espera MatrixData = Record<houseNumber:string, MatrixEntry>.
  // O que vem do banco é Record<number, {carta, odu}> — convertemos e
  // fazemos cast (MatrixEntry tem cartaName/oduName opcionais no uso real,
  // ver oracle-prompt-builder.ts).
  const matrixAsString: Record<string, { carta: number; odu: number; cartaName?: string; oduName?: string }> = {};
  for (const [k, v] of Object.entries(consultContext.matrixData)) {
    matrixAsString[k] = v;
  }
  const reportHouses =
    (consultContext.report?.content as { houses?: Record<string, { interpretation?: string; houseName?: string }> } | undefined)
      ?.houses ?? undefined;

  const ragContext = buildConsultContext(
    body.question,
    {
      fullName: consultContext.client.fullName,
      birthDate: consultContext.client.birthDate,
      astrologyMap: consultContext.client.maps.astrology,
      kabalisticMap: consultContext.client.maps.kabalistic,
      tantricMap: consultContext.client.maps.tantric,
      oduBirth: consultContext.client.maps.oduBirth,
    },
    matrixAsString as Parameters<typeof buildConsultContext>[2],
    reportHouses
  );

  const systemPrompt = buildConsultSystemPrompt();
  const userPayload = buildConsultUserPayload(body.question, ragContext);

  // 7) Chama o LLM (ou devolve só o roteamento se não houver chave)
  const apiKey = process.env.OPENAI_API_KEY;
  const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

  if (!apiKey) {
    // Modo dev: sem LLM, devolve só o roteamento determinístico.
    // (Não persistimos uma mensagem ORACLE vazia — violaria o min(1)
    // do addChatMessageSchema; rastreabilidade fica na própria response.)
    return NextResponse.json({
      consultationId,
      routedThemes: ragContext.routing.themes,
      routedHouses: ragContext.routing.houses,
      answer: null,
      note: 'OPENAI_API_KEY não configurada — retornando apenas o roteamento.',
    });
  }

  const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: llmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    }),
  });

  if (!llmResponse.ok) {
    const detail = await llmResponse.text();
    return NextResponse.json(
      { error: 'Erro ao chamar o LLM', details: detail },
      { status: 502 }
    );
  }

  const llmData = await llmResponse.json();
  const answer = llmData.choices?.[0]?.message?.content ?? null;
  const tokensUsed = llmData.usage?.total_tokens;

  // 8) Persiste a resposta do ORACLE com o roteamento
  await addChatMessage({
    consultationId,
    role: 'ORACLE',
    content: answer ?? '',
    routedThemes: ragContext.routing.themes,
    routedHouses: ragContext.routing.houses,
  });

  return NextResponse.json({
    consultationId,
    routedThemes: ragContext.routing.themes,
    routedHouses: ragContext.routing.houses,
    answer,
    tokensUsed,
  });
}
