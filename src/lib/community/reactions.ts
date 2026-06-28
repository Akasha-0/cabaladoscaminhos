// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// COMMUNITY REACTIONS — Backend helpers (toggle + aggregate)
// ============================================================================
// Reactions são feedback positivo via emoji. Diferente do Like binário, a
// Reaction carrega emoção (gratidão, paz, compaixão, etc). Set curado de 8
// emojis espiritualizados (whitelist enforçada via ALLOWED_EMOJIS).
//
// Polimorfismo: mesma tabela cobre POST e COMMENT via (targetType, targetId).
// Sem FK relacional — o app checa existência do alvo antes do toggle.
//
// Toggle: se (userId, targetType, targetId, emoji) já existe → remove.
//         senão → cria.
// ============================================================================

import { ReactionTargetType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// SET CURADO — 8 emojis espiritualizados
// ============================================================================
// Whitelist aplicada no app (não no DB) para permitir evolução do set sem
// migration. Cada emoji tem um significado espiritual:
//   🙏 — Gratidão
//   💚 — Compaixão / Cura
//   🔥 — Transformação
//   ✨ — Insight / Revelação
//   🌱 — Crescimento
//   ☮️ — Paz
//   🕉️ — Unidade (tradições convergentes)
//   🌟 — Inspiração
// ============================================================================

export const ALLOWED_EMOJIS = [
  '🙏', // gratidão
  '💚', // compaixão
  '🔥', // transformação
  '✨', // insight
  '🌱', // crescimento
  '☮️', // paz
  '🕉️', // unidade
  '🌟', // inspiração
] as const;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

export const EMOJI_MEANINGS: Record<AllowedEmoji, string> = {
  '🙏': 'Gratidão',
  '💚': 'Compaixão',
  '🔥': 'Transformação',
  '✨': 'Insight',
  '🌱': 'Crescimento',
  '☮️': 'Paz',
  '🕉️': 'Unidade',
  '🌟': 'Inspiração',
};

export function isAllowedEmoji(value: unknown): value is AllowedEmoji {
  return typeof value === 'string' && (ALLOWED_EMOJIS as readonly string[]).includes(value);
}

export function isAllowedTargetType(value: unknown): value is ReactionTargetType {
  return value === 'POST' || value === 'COMMENT';
}

// ============================================================================
// Errors
// ============================================================================

export class ReactionValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ReactionValidationError';
  }
}

export class ReactionTargetNotFoundError extends Error {
  statusCode = 404;
  constructor(targetType: string, targetId: string) {
    super(`Reaction target not found: ${targetType}#${targetId}`);
    this.name = 'ReactionTargetNotFoundError';
  }
}

// ============================================================================
// Target existence check — garante integridade referencial via app
// ============================================================================

async function assertTargetExists(
  targetType: ReactionTargetType,
  targetId: string
): Promise<void> {
  if (targetType === 'POST') {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { id: true, deletedAt: true },
    });
    if (!post || post.deletedAt) {
      throw new ReactionTargetNotFoundError(targetType, targetId);
    }
  } else if (targetType === 'COMMENT') {
    const comment = await prisma.comment.findUnique({
      where: { id: targetId },
      select: { id: true, deletedAt: true },
    });
    if (!comment || comment.deletedAt) {
      throw new ReactionTargetNotFoundError(targetType, targetId);
    }
  }
}

// ============================================================================
// Toggle
// ============================================================================

export interface ToggleReactionInput {
  userId: string;
  targetType: ReactionTargetType;
  targetId: string;
  emoji: AllowedEmoji;
}

export interface ToggleReactionResult {
  /** `true` se a reaction foi adicionada, `false` se removida */
  reacted: boolean;
  /** Emoji afetado (echo para o cliente atualizar UI) */
  emoji: AllowedEmoji;
  /** Total de reactions com este emoji no alvo após o toggle */
  count: number;
  /** Conveniência: o viewer reagiu com este emoji agora? */
  userHasReacted: boolean;
}

export async function toggleReaction(
  input: ToggleReactionInput
): Promise<ToggleReactionResult> {
  const { userId, targetType, targetId, emoji } = input;

  await assertTargetExists(targetType, targetId);

  const existing = await prisma.reaction.findUnique({
    where: {
      userId_targetType_targetId_emoji: {
        userId,
        targetType,
        targetId,
        emoji,
      },
    },
    select: { id: true },
  });

  let reacted: boolean;

  if (existing) {
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
    reacted = false;
  } else {
    await prisma.reaction.create({
      data: { userId, targetType, targetId, emoji },
    });
    reacted = true;
  }

  const count = await prisma.reaction.count({
    where: { targetType, targetId, emoji },
  });

  return {
    reacted,
    emoji,
    count,
    userHasReacted: reacted,
  };
}

// ============================================================================
// Aggregate (GET)
// ============================================================================

export interface ReactionAggregate {
  emoji: AllowedEmoji;
  count: number;
  /** Se o viewer já reagiu com este emoji no alvo */
  userHasReacted: boolean;
}

export async function getReactions(input: {
  targetType: ReactionTargetType;
  targetId: string;
  viewerId?: string | null;
}): Promise<ReactionAggregate[]> {
  const { targetType, targetId, viewerId } = input;

  // 1 query: agrupa por emoji e conta. Ordenado por count desc para a UI.
  const grouped = await prisma.reaction.groupBy({
    by: ['emoji'],
    where: { targetType, targetId },
    _count: { _all: true },
    orderBy: { _count: { emoji: 'desc' } },
  });

  // 2 query: quais emojis o viewer já usou neste alvo (apenas se autenticado)
  let viewerEmojis = new Set<string>();
  if (viewerId) {
    const viewerRows = await prisma.reaction.findMany({
      where: { userId: viewerId, targetType, targetId },
      select: { emoji: true },
    });
    viewerEmojis = new Set(viewerRows.map((r) => r.emoji));
  }

  return grouped
    .filter((g): g is typeof g & { emoji: AllowedEmoji } => isAllowedEmoji(g.emoji))
    .map((g) => ({
      emoji: g.emoji,
      count: g._count._all,
      userHasReacted: viewerEmojis.has(g.emoji),
    }));
}

// ============================================================================
// Type exports for type-safe consumers
// ============================================================================

export type ReactionTargetTypeValue = ReactionTargetType;