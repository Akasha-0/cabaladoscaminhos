// ============================================================================
// REACTIONS — /api/reactions
// ============================================================================
// POST → toggle reaction (autenticado). Body: { targetType, targetId, emoji }
// GET  → lista reactions agregadas por emoji para um alvo
//        Query: ?targetType=POST|COMMENT&targetId=...
//
// Polimórfico: cobre POST e COMMENT. Set curado de 8 emojis
// espiritualizados (whitelist no helper).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import {
  toggleReaction,
  getReactions,
  isAllowedEmoji,
  isAllowedTargetType,
  ReactionValidationError,
  ReactionTargetNotFoundError,
  ALLOWED_EMOJIS,
} from '@/lib/community/reactions';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

// ============================================================================
// Validators
// ============================================================================

const TargetTypeSchema = z.enum(['POST', 'COMMENT']);

const ToggleReactionSchema = z.object({
  targetType: TargetTypeSchema,
  targetId: z.string().min(1).max(64),
  emoji: z.string().min(1).max(8),
});

const GetReactionsSchema = z.object({
  targetType: TargetTypeSchema,
  targetId: z.string().min(1).max(64),
});

// ============================================================================
// POST — toggle
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado para reagir'
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido no body');
    }

    const parsed = ToggleReactionSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (!isAllowedEmoji(parsed.data.emoji)) {
      return fail(
        400,
        ErrorCode.VALIDATION_ERROR,
        `Emoji não permitido. Use um dos: ${ALLOWED_EMOJIS.join(' ')}`
      );
    }

    if (!isAllowedTargetType(parsed.data.targetType)) {
      return fail(400, ErrorCode.VALIDATION_ERROR, 'targetType inválido');
    }

    try {
      const result = await toggleReaction({
        userId: viewer.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        emoji: parsed.data.emoji,
      });
      return ok(result);
    } catch (err) {
      if (err instanceof ReactionTargetNotFoundError) {
        return fail(404, ErrorCode.NOT_FOUND, err.message);
      }
      if (err instanceof ReactionValidationError) {
        return fail(400, ErrorCode.VALIDATION_ERROR, err.message);
      }
      throw err;
    }
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// GET — aggregate por emoji
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const parsed = GetReactionsSchema.safeParse({
      targetType: sp.get('targetType') ?? undefined,
      targetId: sp.get('targetId') ?? undefined,
    });

    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (!isAllowedTargetType(parsed.data.targetType)) {
      return fail(400, ErrorCode.VALIDATION_ERROR, 'targetType inválido');
    }

    // Viewer é opcional no GET — se autenticado, populamos userHasReacted.
    let viewerId: string | null = null;
    try {
      const v = await getViewer();
      viewerId = v?.id ?? null;
    } catch {
      viewerId = null;
    }

    const reactions = await getReactions({
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      viewerId,
    });

    return ok(reactions, { cache: { noStore: true } });
  } catch (err) {
    return handleError(err);
  }
}