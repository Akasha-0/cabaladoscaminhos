// ============================================================================
// GET /api/tags/[tag] — Conteúdo por tag (Onda 12, 2026-06-27)
// ============================================================================
// Retorna posts, artigos e pessoas que usam a tag.
// ============================================================================

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_PER_KIND = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  try {
    const { tag: rawTag } = await params;
    const tag = decodeURIComponent(rawTag ?? '').trim();

    if (!tag) {
      return fail(400, ErrorCode.BAD_REQUEST, 'tag obrigatória');
    }

    const start = Date.now();

    // Parallel: posts (by topic or tradition), articles (by tags[]), profiles (by signoSolar/odu/orixa matching)
    const [postsRaw, articlesRaw, profilesRaw] = await Promise.all([
      prisma.$queryRaw<Array<{
        id: string;
        content: string;
        authorId: string;
        tradition: string | null;
        topic: string | null;
        groupSlug: string | null;
        groupName: string | null;
        likesCount: number;
        commentsCount: number;
        createdAt: Date;
        preview: string;
      }>>(Prisma.sql`
        SELECT
          p.id, p.content, p."authorId", p.tradition, p.topic,
          p."likesCount", p."commentsCount", p."createdAt",
          g.slug AS "groupSlug", g.name AS "groupName",
          ts_headline(
            'portuguese',
            p.content,
            plainto_tsquery('portuguese', ${tag}),
            'MaxWords=35, MinWords=15, StartSel=<mark>, StopSel=</mark>'
          ) AS preview
        FROM posts p
        LEFT JOIN groups g ON g.id = p."groupId"
        WHERE p."deletedAt" IS NULL
          AND (p.topic = ${tag} OR p.tradition = ${tag})
        ORDER BY p."createdAt" DESC
        LIMIT ${MAX_PER_KIND}
      `).catch((e) => {
        console.warn('[tags] posts query failed:', e);
        return [];
      }),
      prisma.$queryRaw<Array<{
        id: string;
        slug: string;
        title: string;
        authors: string[];
        year: number;
        evidenceLevel: string;
        viewCount: number;
        createdAt: Date;
        preview: string;
      }>>(Prisma.sql`
        SELECT
          a.id, a.slug, a.title, a.authors, a.year, a."evidenceLevel",
          a."viewCount", a."createdAt",
          ts_headline(
            'portuguese',
            a.title || ' — ' || coalesce(a.summary, ''),
            plainto_tsquery('portuguese', ${tag}),
            'MaxWords=35, MinWords=15, StartSel=<mark>, StopSel=</mark>'
          ) AS preview
        FROM articles a
        WHERE ${tag} = ANY(a.tags)
        ORDER BY a."viewCount" DESC, a."createdAt" DESC
        LIMIT ${MAX_PER_KIND}
      `).catch((e) => {
        console.warn('[tags] articles query failed:', e);
        return [];
      }),
      prisma.$queryRaw<Array<{
        id: string;
        userId: string;
        birthName: string;
        bio: string | null;
        signoSolar: string | null;
        oduNascimento: string | null;
        orixaRegente: string | null;
        createdAt: Date;
      }>>(Prisma.sql`
        SELECT id, "userId", "birthName", bio, "signoSolar", "oduNascimento", "orixaRegente", "createdAt"
        FROM spiritual_profiles
        WHERE visibility IN ('PUBLIC', 'COMMUNITY')
          AND (
            LOWER("signoSolar") = LOWER(${tag})
            OR LOWER("oduNascimento") = LOWER(${tag})
            OR LOWER("orixaRegente") = LOWER(${tag})
          )
        ORDER BY "createdAt" DESC
        LIMIT ${MAX_PER_KIND}
      `).catch((e) => {
        console.warn('[tags] profiles query failed:', e);
        return [];
      }),
    ]);

    const data = {
      tag,
      posts: postsRaw.map((r) => ({
        id: r.id,
        preview: r.preview,
        content: r.content,
        authorName: `Membro ${r.authorId.slice(-4)}`,
        tradition: r.tradition,
        topic: r.topic,
        groupSlug: r.groupSlug,
        groupName: r.groupName,
        likesCount: r.likesCount,
        commentsCount: r.commentsCount,
        createdAt: r.createdAt.toISOString(),
        url: `/post/${r.id}`,
      })),
      articles: articlesRaw.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        preview: r.preview,
        authors: r.authors,
        year: r.year,
        evidenceLevel: r.evidenceLevel,
        viewCount: r.viewCount,
        createdAt: r.createdAt.toISOString(),
        url: `/library/${r.slug}`,
      })),
      people: profilesRaw.map((r) => ({
        id: r.id,
        userId: r.userId,
        displayName: r.birthName,
        bio: r.bio,
        signoSolar: r.signoSolar,
        oduNascimento: r.oduNascimento,
        orixaRegente: r.orixaRegente,
        createdAt: r.createdAt.toISOString(),
        url: `/u/${r.userId}`,
      })),
      counts: {
        posts: postsRaw.length,
        articles: articlesRaw.length,
        people: profilesRaw.length,
        total: postsRaw.length + articlesRaw.length + profilesRaw.length,
      },
      took_ms: Date.now() - start,
    };

    return ok(data, {
      meta: {
        tag,
        total: data.counts.total,
        took_ms: data.took_ms,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
