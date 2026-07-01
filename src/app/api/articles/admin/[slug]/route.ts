// ============================================================================
// PATCH /api/articles/admin/[slug] — Update article (Wave 29, admin only)
// DELETE /api/articles/admin/[slug] — Soft delete (Wave 29, admin only)
// ============================================================================
// Curadores podem editar campos bibliográficos + conteúdo.
// Soft delete: seta deletedAt (campo futuro) ou marca publishedAt=null
// para esconder do feed público. Para Wave 29 marcamos publishedAt=null
// e adicionamos source prefixo 'deleted:' para auditoria.
//
// Auth: requireAdmin (header x-admin-allow=1 + x-dev-user-id em dev).
// ============================================================================

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  ok,
  fail,
  handleError,
  ErrorCode,
  fromZodError,
} from '@/lib/community/api';
import { requireAdmin } from '@/lib/community/admin';
import {
  ArticleUpdateSchema,
  ArticleDeleteSchema,
} from '@/lib/validators/articles-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// ============================================================================
// PATCH — update
// ============================================================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { slug } = await context.params;
    if (!slug || slug.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'slug obrigatório');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido');
    }

    const parsed = ArticleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const input = parsed.data;

    // Existe?
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }

    // Monta patch. Campos opcionais → só atualiza se vierem no body.
    const data: Prisma.ArticleUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.summary !== undefined) data.summary = input.summary;
    if (input.content !== undefined) data.content = input.content;
    if (input.type !== undefined) data.type = input.type;
    if (input.evidenceLevel !== undefined) data.evidenceLevel = input.evidenceLevel;
    if (input.tradition !== undefined) data.tradition = input.tradition;
    if (input.tags !== undefined) {
      data.tags = input.tags;
      data.topics = input.tags; // mantém alias sincronizado
    }
    if (input.authors !== undefined) data.authors = input.authors;
    if (input.journal !== undefined) data.journal = input.journal;
    if (input.year !== undefined) data.year = input.year;
    if (input.doi !== undefined) data.doi = input.doi;
    if (input.url !== undefined) data.url = input.url;
    if (input.language !== undefined) data.language = input.language;
    if (input.curatedBy !== undefined) data.curatedBy = input.curatedBy;
    if (input.source !== undefined) data.source = input.source;
    if (input.publishedAt !== undefined) {
      data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
    }

    const updated = await prisma.article.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        slug: true,
        title: true,
        evidenceLevel: true,
        updatedAt: true,
      },
    });

    return ok(updated, {
      meta: { action: 'update', slug: updated.slug },
      cache: { noStore: true },
    });
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// DELETE — soft delete (publica=null + source prefixo "deleted:")
// ============================================================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { slug } = await context.params;
    if (!slug || slug.trim().length === 0) {
      return fail(400, ErrorCode.BAD_REQUEST, 'slug obrigatório');
    }

    // Body opcional com motivo (auditoria)
    let reason: string | undefined;
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        const parsed = ArticleDeleteSchema.safeParse(JSON.parse(text));
        if (!parsed.success) {
          return fromZodError(parsed.error);
        }
        reason = parsed.data.reason;
      }
    } catch {
      // body vazio é OK
    }

    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, source: true },
    });
    if (!existing) {
      return fail(404, ErrorCode.NOT_FOUND, 'Artigo não encontrado');
    }

    const deletedMarker = `deleted:${new Date().toISOString().slice(0, 10)}`;
    const newSource = reason
      ? `${existing.source ?? ''} | ${deletedMarker} | ${reason.slice(0, 200)}`.slice(0, 500)
      : `${existing.source ?? ''} | ${deletedMarker}`.slice(0, 500);

    await prisma.article.update({
      where: { id: existing.id },
      data: {
        publishedAt: null, // esconde do feed público
        source: newSource,
      },
    });

    return ok(
      { id: existing.id, slug, deleted: true, reason: reason ?? null },
      {
        meta: { action: 'delete', slug },
        cache: { noStore: true },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}

// 405 para outros métodos
export async function GET() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use PATCH ou DELETE');
}
export async function POST() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use PATCH ou DELETE');
}
export async function PUT() {
  return fail(405, ErrorCode.BAD_REQUEST, 'Use PATCH ou DELETE');
}