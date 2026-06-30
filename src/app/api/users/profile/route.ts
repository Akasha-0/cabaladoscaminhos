// ============================================================================
// PUBLIC PROFILE — /api/users/profile?handle=<handle>
// ============================================================================
// GET → resolve a public profile by handle (or id) and return a lean DTO.
// Spec: docs/MOCKS-AUDIT.md (2026-06-27 — replaces hardcoded DEMO_PROFILE).
//
// `handle` semantics (resolved in order):
//   1. User.id (Prisma cuid)
//   2. User.email (exact match)
//   3. User.email local-part (substring before "@")
//
// The DTO exposes only public-safe fields. Sensitive / missing fields are
// returned as `null` so the UI can render honest empty states ("ainda não
// temos foto de perfil", etc.).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail, ErrorCode, handleError } from '@/lib/community/api';

// ─── Zod ────────────────────────────────────────────────────────────────────

const QuerySchema = z.object({
  handle: z
    .string()
    .trim()
    .min(1, 'handle obrigatório')
    .max(120, 'handle muito longo'),
});

// ─── DTO ────────────────────────────────────────────────────────────────────

export interface PublicProfileDto {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  joinedAt: string;

  // Spiritual data — pulled from MapaNatal when present
  odu: string | null;
  orixa: string | null;
  elemento: string | null;
  signoSolar: string | null;
  signoLunar: string | null;
  ascendente: string | null;
  caminhoDeVida: number | null;

  // Stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  groupsCount: number;

  // Flags
  isOwn: boolean;
  isPrivate: boolean;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const parsed = QuerySchema.safeParse({
      handle: params.get('handle') ?? '',
    });

    if (!parsed.success) {
      return fail(
        400,
        ErrorCode.VALIDATION_ERROR,
        'Parâmetro handle inválido',
        parsed.error.flatten().fieldErrors
      );
    }

    const { handle } = parsed.data;

    // 1) Lookup strategy: id → email exact → email local-part
    const user = await resolveUserByHandle(handle);

    if (!user) {
      return fail(404, ErrorCode.NOT_FOUND, `Perfil @${handle} não encontrado`);
    }

    // 2) Counters (best-effort; tables podem estar vazias)
    const [followersCount, followingCount, postsCount, groupsCount] =
      await Promise.all([
        prisma.follow.count({ where: { followedId: user.id } }),
        prisma.follow.count({ where: { followerId: user.id } }),
        prisma.post.count({
          where: { authorId: user.id, deletedAt: null },
        }),
        prisma.groupMember.count({ where: { userId: user.id } }),
      ]);

    // 3) Compose DTO
    const dto: PublicProfileDto = {
      id: user.id,
      handle: deriveHandle(user.email, user.id),
      displayName: user.nomeCompleto,
      bio: null, // User model não tem bio; SpiritualProfile tem, mas é separado
      avatarUrl: null, // User model não tem avatarUrl em v3.0
      coverUrl: null, // User model não tem coverUrl em v3.0
      joinedAt: user.createdAt.toISOString(),

      odu: user.mapaNatal?.oduPrincipal ?? null,
      orixa: user.mapaNatal?.orixaSecundario ?? null,
      elemento: null, // MapaNatal não tem elemento direto (vem de SpiritualProfile)
      signoSolar: user.mapaNatal?.signoSolar ?? null,
      signoLunar: user.mapaNatal?.signoLunar ?? null,
      ascendente: user.mapaNatal?.ascendente ?? null,
      caminhoDeVida: user.mapaNatal?.numeroPitagorico ?? null,

      followersCount,
      followingCount,
      postsCount,
      groupsCount,

      isOwn: false, // Será reavaliado no client via auth (futuro)
      isPrivate: false,
    };

    // Wave 32 perf — perfil público cacheável (dados mudam raramente).
    return ok(dto, {
      cache: { sMaxage: 300, staleWhileRevalidate: 3600 },
      meta: { handle: dto.handle },
    });
  } catch (err) {
    return handleError(err);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function resolveUserByHandle(handle: string) {
  // 1) Tenta match por id (Prisma cuid ou seed id)
  //    Skip silenciosamente se não tiver formato cuid plausível.
  if (looksLikeCuid(handle) || handle.startsWith('seed-')) {
    const byId = await prisma.user.findUnique({
      where: { id: handle },
      include: { mapaNatal: true },
    });
    if (byId) return byId;
  }

  // 2) Match exato por email
  if (handle.includes('@')) {
    const byEmail = await prisma.user.findUnique({
      where: { email: handle },
      include: { mapaNatal: true },
    });
    if (byEmail) return byEmail;
  }

  // 3) Match por email local-part (handle = "marina" → email LIKE "marina@%")
  const localPart = handle.split('@')[0]!.toLowerCase();
  const byLocal = await prisma.user.findFirst({
    where: {
      email: { startsWith: `${localPart}@` },
    },
    include: { mapaNatal: true },
    orderBy: { createdAt: 'asc' }, // deterministic pick quando há múltiplos
  });
  return byLocal;
}

function looksLikeCuid(value: string): boolean {
  // cuid padrão: 25 chars, alphanumeric, começa com 'c'
  return /^c[a-z0-9]{20,30}$/i.test(value);
}

function deriveHandle(email: string, id: string): string {
  if (email && email.includes('@')) {
    return email.split('@')[0]!;
  }
  return id.slice(0, 12);
}
