// ============================================================================
// Living Consciousness — Event Tracker (Wave 29, 2026-06-28)
// ============================================================================
// Registra eventos de interação da comunidade que alimentam o ciclo de
// "consciência viva" do Akasha Portal. Cada evento é leve (não bloqueia
// a request) e respeita LGPD: opt-in obrigatório, sem PII no metadata.
//
// Eventos suportados:
//   POST_CREATED         → user criou um post
//   REACTION_ADDED       → user reagiu (com emoji) a um post/comment
//   COMMENT_CREATED      → user comentou
//   BOOKMARK_CREATED     → user salvou artigo ou post
//   READING_PROGRESS     → user atingiu 100% de leitura
//   AKASHIC_CONVERSATION → user conversou com a Akasha IA
//   AKASHIC_FEEDBACK     → user deu 👍/👎 em uma resposta
//   USER_ONBOARDED       → novo usuário completou onboarding
//   GROUP_JOINED         → user entrou em um grupo
//
// Filosofia: o tracker é best-effort — se o DB estiver fora, a interação
// do usuário NÃO pode falhar. Por isso usa queue assíncrona + try/catch.
// ============================================================================

import { prisma } from '@/lib/prisma';
import type {
  ConsciousnessEvent,
  ConsciousnessEventType,
} from '@prisma/client';

/**
 * Mapping canônico de tipos de evento.
 * Mantém o contrato entre callers (UI/API) e o schema.
 */
export const EVENT_TYPES = {
  POST_CREATED: 'POST_CREATED',
  REACTION_ADDED: 'REACTION_ADDED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  BOOKMARK_CREATED: 'BOOKMARK_CREATED',
  READING_PROGRESS: 'READING_PROGRESS',
  AKASHIC_CONVERSATION: 'AKASHIC_CONVERSATION',
  AKASHIC_FEEDBACK: 'AKASHIC_FEEDBACK',
  USER_ONBOARDED: 'USER_ONBOARDED',
  GROUP_JOINED: 'GROUP_JOINED',
} as const;

export type EventTypeValue = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Metadata sanitizada — NUNCA incluir PII.
 * Campos permitidos: ids opacos, contadores, slugs, enums.
 */
export interface ConsciousnessEventMetadata {
  postId?: string;
  commentId?: string;
  articleId?: string;
  groupId?: string;
  conversationId?: string;
  messageId?: string;
  emoji?: string;
  wordCount?: number;
  vote?: 'UP' | 'DOWN';
  deepMode?: boolean;
  percentRead?: number;
}

export interface TrackEventInput {
  userId?: string | null;
  type: EventTypeValue;
  tradition?: string | null;
  topic?: string | null;
  sentiment?: number | null;
  metadata?: ConsciousnessEventMetadata;
  /** Quando false (default), o evento é gravado sem userId (anônimo). */
  optedIn?: boolean;
}

/**
 * Mapeia um emoji de Reaction para um sentiment -1..1.
 * Heurística simples — não é análise de texto profunda (Wave 30+).
 */
export function emojiToSentiment(emoji: string | null | undefined): number | null {
  if (!emoji) return null;
  const POSITIVE = new Set(['❤️', '🔥', '✨', '🌱', '🙏', '💜', '🌟', '☀️']);
  const NEGATIVE = new Set(['😢', '💔', '😞', '🌧️', '😩', '😭']);
  if (POSITIVE.has(emoji)) return 0.7;
  if (NEGATIVE.has(emoji)) return -0.7;
  // Neutros (👍, 👀, 🤍) = 0
  return 0;
}

/**
 * Sanitiza metadata removendo qualquer campo que pareça PII.
 * Lista restritiva: só ids opacos, contadores e enums passam.
 */
function sanitizeMetadata(meta: ConsciousnessEventMetadata | undefined): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const ALLOWED = new Set([
    'postId',
    'commentId',
    'articleId',
    'groupId',
    'conversationId',
    'messageId',
    'emoji',
    'wordCount',
    'vote',
    'deepMode',
    'percentRead',
  ]);
  const safe: Record<string, unknown> = {};
  for (const k of Object.keys(meta)) {
    if (!ALLOWED.has(k)) continue;
    const v = (meta as Record<string, unknown>)[k];
    if (v === null || v === undefined) continue;
    // Limita tamanho de strings para evitar injeção de texto longo
    if (typeof v === 'string') {
      if (v.length > 200) continue;
      safe[k] = v.slice(0, 200);
    } else if (typeof v === 'number') {
      // Clamp sentiment-like fields
      if (k === 'percentRead') safe[k] = Math.max(0, Math.min(100, v));
      else safe[k] = v;
    } else if (typeof v === 'boolean') {
      safe[k] = v;
    }
  }
  return Object.keys(safe).length > 0 ? safe : undefined;
}

/**
 * Registra um evento de consciência. Fire-and-forget — NÃO bloqueia
 * a request principal e NÃO lança erros para o caller.
 *
 * Design choice: usamos Promise sem await no caller para garantir que
 * o tracker nunca impacte a latência da UI. Erros são logados mas
 * silenciados — fallback é "perdemos um evento", nunca "quebramos a UX".
 */
export function trackEvent(input: TrackEventInput): void {
  // Não usamos await — fire-and-forget
  void doTrack(input).catch((err) => {
    console.warn('[consciousness] trackEvent failed:', err instanceof Error ? err.message : String(err));
  });
}

async function doTrack(input: TrackEventInput): Promise<ConsciousnessEvent | null> {
  const sanitized = sanitizeMetadata(input.metadata);
  const sentiment =
    input.sentiment !== null && input.sentiment !== undefined
      ? Math.max(-1, Math.min(1, input.sentiment))
      : null;

  // LGPD: se não há opt-in, gravamos como anônimo (sem userId)
  const userId = input.optedIn ? input.userId ?? null : null;

  return await prisma.consciousnessEvent.create({
    data: {
      userId,
      type: input.type as ConsciousnessEventType,
      tradition: input.tradition ?? null,
      topic: input.topic ?? null,
      sentiment,
      metadata: sanitized ?? undefined,
      optedIn: !!input.optedIn,
    },
  });
}

/**
 * Variante await-able para casos onde o caller QUER garantia
 * (ex: ao final de uma request que já está sendo processada).
 */
export async function trackEventAsync(input: TrackEventInput): Promise<ConsciousnessEvent | null> {
  try {
    return await doTrack(input);
  } catch (err) {
    console.warn('[consciousness] trackEventAsync failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/**
 * Helper para casos comuns de UI — tracker de bookmark.
 * Ex: await trackBookmark({ userId, articleId, tradition: 'cabala' });
 */
export function trackBookmark(opts: {
  userId?: string | null;
  articleId: string;
  tradition?: string | null;
  topic?: string | null;
  optedIn?: boolean;
}): void {
  trackEvent({
    userId: opts.userId,
    type: EVENT_TYPES.BOOKMARK_CREATED,
    tradition: opts.tradition,
    topic: opts.topic,
    metadata: { articleId: opts.articleId },
    optedIn: opts.optedIn,
  });
}

/**
 * Helper para Reaction — inclui mapeamento emoji→sentiment.
 */
export function trackReaction(opts: {
  userId?: string | null;
  postId?: string;
  commentId?: string;
  emoji: string;
  tradition?: string | null;
  topic?: string | null;
  optedIn?: boolean;
}): void {
  const sentiment = emojiToSentiment(opts.emoji);
  const meta: ConsciousnessEventMetadata = { emoji: opts.emoji };
  if (opts.postId) meta.postId = opts.postId;
  if (opts.commentId) meta.commentId = opts.commentId;
  trackEvent({
    userId: opts.userId,
    type: EVENT_TYPES.REACTION_ADDED,
    tradition: opts.tradition,
    topic: opts.topic,
    sentiment,
    metadata: meta,
    optedIn: opts.optedIn,
  });
}

/**
 * Helper para conversas Akasha — registra cada turno de diálogo.
 */
export function trackAkashicConversation(opts: {
  userId?: string | null;
  conversationId: string;
  messageId: string;
  tradition?: string | null;
  deepMode?: boolean;
  optedIn?: boolean;
}): void {
  trackEvent({
    userId: opts.userId,
    type: EVENT_TYPES.AKASHIC_CONVERSATION,
    tradition: opts.tradition,
    metadata: {
      conversationId: opts.conversationId,
      messageId: opts.messageId,
      deepMode: opts.deepMode ?? false,
    },
    optedIn: opts.optedIn,
  });
}

/**
 * Helper para feedback 👍/👎 na Akasha — alimenta loop de evolução.
 */
export function trackAkashicFeedback(opts: {
  userId?: string | null;
  messageId: string;
  vote: 'UP' | 'DOWN';
  tradition?: string | null;
  deepMode?: boolean;
  optedIn?: boolean;
}): void {
  const sentiment = opts.vote === 'UP' ? 0.8 : -0.8;
  trackEvent({
    userId: opts.userId,
    type: EVENT_TYPES.AKASHIC_FEEDBACK,
    tradition: opts.tradition,
    sentiment,
    metadata: {
      messageId: opts.messageId,
      vote: opts.vote,
      deepMode: opts.deepMode ?? false,
    },
    optedIn: opts.optedIn,
  });
}