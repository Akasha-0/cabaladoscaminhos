// ============================================================================
// POST /api/akashic/chat — Akasha IA MVP (Wave 10 — 2026-06-27)
// ============================================================================
// Chat endpoint principal. Recebe { message, tradition?, history? }, faz
// busca semântica (RAG) na biblioteca via pgvector, monta o system prompt
// com as 8 regras éticas + contexto RAG, e devolve { reply, sources }.
//
// Erros tratados:
//   - 400: payload inválido (zod)
//   - 429: rate limit excedido
//   - 502: OpenAI falhou depois de retries
//   - 503: circuit breaker aberto
//   - 504: timeout
//
// Streaming opcional em /api/akashic/chat/stream (SSE).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/ai/sanitize';
import { buildAkashaPrompt, AKASHA_TRADITIONS, type RagSource } from '@/lib/ai/prompts/akasha';
import { runRagSearch } from '@/lib/ai/rag';
import { sendMessage, AIError, CircuitBreakerOpenError } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ChatMessage } from '@/lib/ai/types';
import { trackAkashicMessageSent } from '@/lib/analytics/events-catalog';
import { augmentAkashaWithW32, measureW32Response } from '@/lib/ai/w32-integration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Mensagem vazia').max(2000, 'Mensagem muito longa'),
  tradition: z.enum(AKASHA_TRADITIONS).optional().nullable(),
  /** Wave 18 — capped em 10 no handler (não 20) para economia de tokens */
  history: z.array(HistoryMessageSchema).max(20).optional().default([]),
  /** Wave 18 — modo "estudo profundo": papers + cross-refs + contraindicações */
  deepMode: z.boolean().optional().default(false),
  /** Override do topK do RAG (1..10, default 5) */
  topK: z.number().int().min(1).max(10).optional(),
  /** Override do threshold de similaridade (0..1, default 0.65) */
  threshold: z.number().min(0).max(1).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

interface ChatResponse {
  reply: string;
  sources: RagSource[];
  meta: {
    took_ms: number;
    rag_took_ms: number;
    model: string;
    /** Tradição solicitada pelo usuário (pode ser null) */
    tradition: string | null;
    /** Tradição efetivamente usada (explícita OU auto-detectada) */
    effective_tradition: string | null;
    /** Se a tradição efetiva foi auto-detectada */
    tradition_auto_detected: boolean;
    deep_mode: boolean;
    rag_degraded: boolean;
    rag_reason?: string;
    tokens?: {
      prompt: number;
      completion: number;
      total: number;
    };
    /** Wave 32 — augmentos aplicados (safety, context, multi-tradition, memory) */
    w32_augmentations?: string[];
    /** Wave 32 — métricas de qualidade (citation rate, cultural sensitivity) */
    w32_quality?: {
      overall: string;
      seal: 'GREEN' | 'YELLOW' | 'RED';
      citation_rate: string;
      cultural_sensitivity: string;
    };
    /** Wave 32 — contexto detectado do user */
    w32_context?: {
      sentiment: string;
      knowledge: string;
      intent: string;
    } | null;
  };
}

// ─── Rate limit ──────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 20;           // 20 req/min por IP

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  // 1. Rate limit por IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`akashic-chat:${ip}`, {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas requisições. Tente novamente em alguns segundos.',
          details: { resetIn: rl.resetIn },
        },
      },
      { status: 429 },
    );
  }

  // 2. Parse + validação
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_JSON', message: 'JSON inválido' } },
      { status: 400 },
    );
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const { message, tradition, history, deepMode, topK, threshold } = parsed.data;

  // 3. Sanitização do input (anti-injection básico + limites)
  const cleanMessage = sanitizeInput(message);

  // 4. RAG (busca semântica na biblioteca) — rag.ts pode auto-detectar tradição
  const rag = await runRagSearch({
    query: cleanMessage,
    tradition: tradition ?? null,
    topK: topK ?? 5,
    threshold: threshold ?? 0.65,
  });

  // 5. Wave 18: histórico limitado a 10 mensagens (token economy)
  const trimmedHistory = (history ?? []).slice(-10);

  // 6. Monta system prompt (identidade + tradição + RAG + deepMode + recap)
  const basePrompt = buildAkashaPrompt({
    tradition: rag.effectiveTradition ?? tradition ?? null,
    sources: rag.sources,
    deepMode,
    historyRecap: trimmedHistory.map((h) => ({
      role: h.role,
      content: h.content,
    })),
  });

  // 6b. Wave 32 — augmenta com safety + context + multi-tradição + memory
  const w32 = augmentAkashaWithW32({
    basePrompt,
    userMessage: cleanMessage,
    tradition: rag.effectiveTradition ?? tradition ?? null,
    shortTerm: {
      messages: trimmedHistory.map((h) => ({ role: h.role, content: h.content, timestamp: Date.now() })),
      tradition: rag.effectiveTradition ?? null,
    },
  });
  const systemPrompt = w32.systemPrompt;

  // 7. Monta histórico (apenas user/assistant; limit a 10 — Wave 18)
  const historyMessages: ChatMessage[] = trimmedHistory.map((h) => ({
    role: h.role,
    content: sanitizeInput(h.content),
  }));

  const messages: ChatMessage[] = [
    ...historyMessages,
    { role: 'user', content: cleanMessage },
  ];

  // 7. Chama OpenAI com system prompt
  let aiResponse;
  try {
    aiResponse = await sendMessage(messages, systemPrompt);
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      return NextResponse.json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message:
              'Akasha está temporariamente sobrecarregada (circuit breaker aberto). Tente em ~1 min.',
          },
        },
        { status: 503 },
      );
    }
    if (err instanceof AIError) {
      const status = err.statusCode ?? 502;
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
          },
        },
        { status: status === 401 ? 401 : status === 429 ? 429 : 502 },
      );
    }
    console.error('[akashic/chat] erro inesperado:', err);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro inesperado ao processar a pergunta',
        },
      },
      { status: 500 },
    );
  }

  // 8. Resposta final
  const response: ChatResponse = {
    reply: aiResponse.content,
    sources: rag.sources,
    meta: {
      took_ms: Date.now() - start,
      rag_took_ms: rag.took_ms,
      model: aiResponse.model,
      tradition: tradition ?? null,
      effective_tradition: rag.effectiveTradition ?? null,
      tradition_auto_detected: rag.traditionWasAutoDetected,
      deep_mode: deepMode,
      rag_degraded: rag.degraded,
      ...(rag.reason ? { rag_reason: rag.reason } : {}),
      ...(aiResponse.usage
        ? {
            tokens: {
              prompt: aiResponse.usage.prompt_tokens,
              completion: aiResponse.usage.completion_tokens,
              total: aiResponse.usage.total_tokens,
            },
          }
        : {}),
    },
  };

  // 8b. Wave 32 — mede qualidade (citation rate, cultural sensitivity)
  const quality = measureW32Response({
    response: aiResponse.content,
    userMessage: cleanMessage,
    tradition: rag.effectiveTradition ?? null,
  });

  // 8c. Wave 32 — augmentation aplicado (para debug/analytics)
  response.meta.w32_augmentations = w32.appliedAugmentations;
  response.meta.w32_quality = {
    overall: `${(quality.overallScore * 100).toFixed(0)}%`,
    seal: quality.seal,
    citation_rate: `${(quality.citationRate * 100).toFixed(0)}%`,
    cultural_sensitivity: `${(quality.culturalSensitivity * 100).toFixed(0)}%`,
  };
  response.meta.w32_context = w32.context
    ? {
        sentiment: w32.context.sentiment,
        knowledge: w32.context.knowledge,
        intent: w32.context.intent,
      }
    : null;

  // Wave 18 — analytics: akashic_message_sent (fire-and-forget)
  trackAkashicMessageSent({
    messageLength: cleanMessage.length,
    tradition: tradition ?? undefined,
    ragUsed: rag.sources.length > 0,
    tookMs: Date.now() - start,
  });

  return NextResponse.json(response, { status: 200 });
}

// ─── GET — health check leve ────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/akashic/chat',
    method: 'POST',
    schema: {
      message: 'string (1-2000)',
      tradition: `enum(${AKASHA_TRADITIONS.join('|')}) optional`,
      history: 'array<{role, content}> optional, max 20 (effective: 10)',
      deepMode: 'boolean optional, default false (Wave 18)',
    },
  });
}