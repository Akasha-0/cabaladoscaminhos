// ============================================================================
// POST /api/akashic/chat/stream — Akasha IA MVP streaming (Wave 10)
// ============================================================================
// Mesma lógica do /api/akashic/chat, mas com SSE (text/event-stream) para
// respostas em tempo real. Envia eventos:
//
//   event: sources   data: { sources: RagSource[] }   // uma vez, antes de começar
//   event: meta      data: { model, rag_degraded }    // uma vez, antes do stream
//   event: token     data: { content: "..." }          // chunks de texto
//   event: done      data: { tokens: {...} }           // uma vez, no fim
//   event: error     data: { code, message }           // se algo falhar
//
// Front-end usa EventSource() ou fetch() + ReadableStream para consumir.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/ai/sanitize';
import {
  buildAkashaPrompt,
  AKASHA_TRADITIONS,
} from '@/lib/ai/prompts/akasha';
import { runRagSearch } from '@/lib/ai/rag';
import {
  createChatCompletionStream,
  CircuitBreakerOpenError,
} from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ChatMessage } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const StreamRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  tradition: z.enum(AKASHA_TRADITIONS).optional().nullable(),
  /** Wave 18 — efetivo: 10 (não 20). Schema ainda permite 20 para compat. */
  history: z.array(HistoryMessageSchema).max(20).optional().default([]),
  /** Wave 18 — modo estudo profundo */
  deepMode: z.boolean().optional().default(false),
  topK: z.number().int().min(1).max(10).optional(),
  threshold: z.number().min(0).max(1).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sseError(code: string, message: string, status?: number): string {
  // Para erros antes do stream iniciar, devolvemos JSON normal
  return JSON.stringify({ error: { code, message, status } });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  // 1. Rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`akashic-stream:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  });
  if (!rl.allowed) {
    return new Response(
      sseError('RATE_LIMIT_EXCEEDED', 'Muitas requisições', 429),
      { status: 429, headers: { 'content-type': 'application/json' } },
    );
  }

  // 2. Validação
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(sseError('BAD_JSON', 'JSON inválido', 400), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const parsed = StreamRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      sseError('VALIDATION_ERROR', 'Dados inválidos', 400),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const { message, tradition, history, deepMode, topK, threshold } = parsed.data;
  const cleanMessage = sanitizeInput(message);

  // 3. RAG (bloqueante — vem antes do stream)
  const rag = await runRagSearch({
    query: cleanMessage,
    tradition: tradition ?? null,
    topK: topK ?? 5,
    threshold: threshold ?? 0.65,
  });

  // 4. Wave 18: histórico limitado a 10 (token economy)
  const trimmedHistory = (history ?? []).slice(-10);

  // 5. System prompt (identidade + tradição efetiva + RAG + deepMode + recap)
  const systemPrompt = buildAkashaPrompt({
    tradition: rag.effectiveTradition ?? tradition ?? null,
    sources: rag.sources,
    deepMode,
    historyRecap: trimmedHistory.map((h) => ({
      role: h.role,
      content: h.content,
    })),
  });

  // 6. Mensagens
  const messages: ChatMessage[] = [
    ...trimmedHistory.map((h) => ({
      role: h.role,
      content: sanitizeInput(h.content),
    })),
    { role: 'user' as const, content: cleanMessage },
  ];

  // 6. SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Evento sources (uma vez, antes de começar a gerar)
      controller.enqueue(
        encoder.encode(sseEvent('sources', { sources: rag.sources })),
      );
      // Evento meta
      controller.enqueue(
        encoder.encode(
          sseEvent('meta', {
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            rag_degraded: rag.degraded,
            rag_took_ms: rag.took_ms,
            tradition: tradition ?? null,
            effective_tradition: rag.effectiveTradition ?? null,
            tradition_auto_detected: rag.traditionWasAutoDetected,
            deep_mode: deepMode,
          }),
        ),
      );

      // 7. Stream do OpenAI
      try {
        const iterator = await createChatCompletionStream({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        });

        for await (const chunk of iterator) {
          if (chunk.content) {
            controller.enqueue(
              encoder.encode(sseEvent('token', { content: chunk.content })),
            );
          }
          if (chunk.done) break;
        }

        controller.enqueue(encoder.encode(sseEvent('done', { ok: true })));
        controller.close();
      } catch (err) {
        const code =
          err instanceof CircuitBreakerOpenError ? 'CIRCUIT_OPEN' : 'STREAM_ERROR';
        const message =
          err instanceof Error ? err.message : 'Erro desconhecido no stream';
        controller.enqueue(
          encoder.encode(sseEvent('error', { code, message })),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no', // Nginx-friendly
    },
  });
}