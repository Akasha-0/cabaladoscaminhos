// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================================
// COMMUNITY FOLLOW — Followers / Following lists (Wave 21, 2026-06-28)
// ============================================================================
// Helpers para listar followers/following com:
//   - Cursor pagination (base64 de {followedAt, userId})
//   - Privacy check via SpiritualProfile.visibility
//   - Deduplicação de dados públicos (apenas o que pode ser exposto)
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// Tipos públicos
// ============================================================================

export interface FollowUserDto {
  // Identificador
  userId: string;

  // Dados públicos (via SpiritualProfile quando existir)
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;

  // Tradição dominante (de SpiritualProfile)
  tradition: string | null;

  // Quando começou a seguir / ser seguido
  followedAt: string;
}

export interface FollowListResult {
  users: FollowUserDto[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Privacy
// ============================================================================

/**
 * Verifica se o viewer pode ver a lista de followers/following do target.
 * Regras:
 *   - PUBLIC       → qualquer um vê (mesmo sem login)
 *   - COMMUNITY    → só logados
 *   - PRIVATE      → só o próprio dono
 *   - Sem profile   → conservador: só o próprio dono pode ver
 */
export async function canViewFollowList(
  targetUserId: string,
  viewerId: string | null
): Promise<{ allowed: boolean; reason: 'public' | 'community' | 'self' | 'private' | 'no-profile' }> {
  // Self sempre pode ver
  if (viewerId === targetUserId) {
    return { allowed: true, reason: 'self' };
  }

  const profile = await prisma.spiritualProfile.findUnique({
    where: { userId: targetUserId },
    select: { visibility: true },
  });

  if (!profile) {
    return { allowed: false, reason: 'no-profile' };
  }

  switch (profile.visibility) {
    case 'PUBLIC':
      return { allowed: true, reason: 'public' };
    case 'COMMUNITY':
      return viewerId
        ? { allowed: true, reason: 'community' }
        : { allowed: false, reason: 'private' };
    case 'PRIVATE':
      return { allowed: false, reason: 'private' };
    default:
      return { allowed: false, reason: 'private' };
  }
}

// ============================================================================
// Cursor encoding
// ============================================================================

interface FollowCursor {
  followedAt: number; // epoch ms
  userId: string;
}

function encodeCursor(payload: FollowCursor): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

function decodeCursor(cursor: string): FollowCursor | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as FollowCursor;
    if (typeof parsed.userId !== 'string' || typeof parsed.followedAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ============================================================================
// listFollowers
// ============================================================================

/**
 * Lista os seguidores do targetUserId. Ordenado por followedAt desc.
 *
 * Implementação: como não temos relation Follow→User (modelo usa string id),
 * fazemos duas queries:
 *   1) followers do target (Follow.followedId = targetUserId)
 *   2) join com SpiritualProfile (campos públicos)
 *
 * Para usuários sem SpiritualProfile, retornamos displayName=null.
 */
export async function listFollowers(input: {
  targetUserId: string;
  cursor?: string | null;
  limit?: number;
}): Promise<FollowListResult> {
  const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);

  // Decodifica cursor (se houver)
  let cursorFilter: Prisma.Sql = Prisma.empty;
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (decoded) {
      // (followedAt, followerId) < (cursor.followedAt, cursor.userId)
      cursorFilter = Prisma.sql`AND (
        f."createdAt" < ${new Date(decoded.followedAt)}
        OR (f."createdAt" = ${new Date(decoded.followedAt)} AND f."followerId" < ${decoded.userId})
      )`;
    }
  }

  // Query raw: traz joins com SpiritualProfile (LEFT JOIN — pode ser null)
  const rows = await prisma.$queryRaw<Array<{
    followerId: string;
    createdAt: Date;
    displayName: string | null;
    birthName: string | null;
    bio: string | null;
    tradition: string | null;
  }>>(Prisma.sql`
    SELECT
      f."followerId",
      f."createdAt",
      sp."birthName" AS "displayName",
      sp."birthName" AS "birthName",
      sp.bio AS bio,
      sp."elementoDominante" AS tradition
    FROM follows f
    LEFT JOIN spiritual_profiles sp ON sp."userId" = f."followerId"
    WHERE f."followedId" = ${input.targetUserId}
      ${cursorFilter}
    ORDER BY f."createdAt" DESC, f."followerId" ASC
    LIMIT ${limit + 1}
  `);

  // Total
  const totalRows = await prisma.follow.count({
    where: { followedId: input.targetUserId },
  });

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const users: FollowUserDto[] = sliced.map((r) => ({
    userId: r.followerId,
    displayName: r.displayName ?? null,
    bio: r.bio ?? null,
    avatarUrl: null,
    tradition: r.tradition ?? null,
    followedAt: r.createdAt.toISOString(),
  }));

  let nextCursor: string | null = null;
  if (hasMore && sliced.length > 0) {
    const last = sliced[sliced.length - 1];
    nextCursor = encodeCursor({
      followedAt: last.createdAt.getTime(),
      userId: last.followerId,
    });
  }

  return { users, nextCursor, total: totalRows };
}

// ============================================================================
// listFollowing
// ============================================================================

/**
 * Lista quem o targetUserId segue. Ordenado por followedAt desc.
 */
export async function listFollowing(input: {
  targetUserId: string;
  cursor?: string | null;
  limit?: number;
}): Promise<FollowListResult> {
  const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);

  let cursorFilter: Prisma.Sql = Prisma.empty;
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (decoded) {
      cursorFilter = Prisma.sql`AND (
        f."createdAt" < ${new Date(decoded.followedAt)}
        OR (f."createdAt" = ${new Date(decoded.followedAt)} AND f."followedId" < ${decoded.userId})
      )`;
    }
  }

  const rows = await prisma.$queryRaw<Array<{
    followedId: string;
    createdAt: Date;
    displayName: string | null;
    bio: string | null;
    tradition: string | null;
  }>>(Prisma.sql`
    SELECT
      f."followedId",
      f."createdAt",
      sp."birthName" AS "displayName",
      sp.bio AS bio,
      sp."elementoDominante" AS tradition
    FROM follows f
    LEFT JOIN spiritual_profiles sp ON sp."userId" = f."followedId"
    WHERE f."followerId" = ${input.targetUserId}
      ${cursorFilter}
    ORDER BY f."createdAt" DESC, f."followedId" ASC
    LIMIT ${limit + 1}
  `);

  const totalRows = await prisma.follow.count({
    where: { followerId: input.targetUserId },
  });

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const users: FollowUserDto[] = sliced.map((r) => ({
    userId: r.followedId,
    displayName: r.displayName ?? null,
    bio: r.bio ?? null,
    avatarUrl: null,
    tradition: r.tradition ?? null,
    followedAt: r.createdAt.toISOString(),
  }));

  let nextCursor: string | null = null;
  if (hasMore && sliced.length > 0) {
    const last = sliced[sliced.length - 1];
    nextCursor = encodeCursor({
      followedAt: last.createdAt.getTime(),
      userId: last.followedId,
    });
  }

  return { users, nextCursor, total: totalRows };
}

// ============================================================================
// unfollow — DELETE idempotente
// ============================================================================

/**
 * Remove o follow (followerId, followedId). Idempotente — se não existir,
 * retorna { removed: false } sem erro.
 */
export async function unfollowUser(input: {
  followerId: string;
  followedId: string;
}): Promise<{ removed: boolean; followersCount: number }> {
  if (input.followerId === input.followedId) {
    const err = new Error('Você não pode deixar de seguir a si mesmo');
    (err as Error & { name: string; statusCode: number }).name = 'ValidationError';
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: input.followerId,
        followedId: input.followedId,
      },
    },
  });

  let removed = false;
  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId: input.followerId,
          followedId: input.followedId,
        },
      },
    });
    removed = true;
  }

  const followersCount = await prisma.follow.count({
    where: { followedId: input.followedId },
  });

  return { removed, followersCount };
}