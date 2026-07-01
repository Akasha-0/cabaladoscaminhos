// ============================================================================
// POST /api/articles/admin — Create article (Wave 29, admin only)
// ============================================================================
// Cria um novo artigo na Biblioteca Akasha. Apenas curadores/admin.
//
// Auth: requireAdmin (header x-admin-allow=1 + x-dev-user-id em dev).
// Body: ArticleCreateSchema.
// ============================================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  ok,
  fail,
  handleError,
  ErrorCode,
  fromZodError,
} from '@/lib/community/api';
import { requireAdmin } from '@/lib/community/admin';
import { ArticleCreateSchema } from '@/lib/validators/articles-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth admin
    await requireAdmin();

    // 2. Parse + valida
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido');
    }

    const parsed = ArticleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const input = parsed.data;

    // 3. Uniqueness: slug já existe?
    const existing = await prisma.article.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (existing) {
      return fail(409, ErrorCode.CONFLICT, `slug "${input.slug}" já existe`, {
        existingId: existing.id,
      });
    }

    // 4. Cria (publishedAt default = now se não fornecido)
    const article = await prisma.article.create({
      data: {
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        content: input.content,
        type: input.type,
        evidenceLevel: input.evidenceLevel,
        tradition: input.tradition ?? null,
        tags: input.tags,
        // mantém compat com campo legado `topics` = mesmo que tags
        topics: input.tags,
        authors: input.authors,
        journal: input.journal ?? null,
        year: input.year,
        doi: input.doi ?? null,
        url: input.url ?? null,
        language: input.language,
        curatedBy: input.curatedBy ?? null,
        source: input.source ?? null,
        contributor: input.contributor ?? null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return ok(article, {
      status: 201,
      meta: { action: 'create', slug: article.slug },
      cache: { noStore: true },
    });
  } catch (err) {
    return handleError(err);
  }
}

// 405 para outros métodos
export async function GET() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}
export async function DELETE() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use POST');
}