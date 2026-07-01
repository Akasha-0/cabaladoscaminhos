// ============================================================================
// API: GET /api/wiki/articles — Lista artigos da wiki (Wave 36)
// API: POST /api/wiki/articles — Cria novo artigo (autenticado)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { ok, fail, ErrorCode, fromZodError } from '@/lib/community/api';
import {
  WIKI_ARTICLES,
  WIKI_CATEGORIES,
  getWikiByCategory,
  getFeaturedWiki,
  getRecentWiki,
  getPopularWiki,
  totalWikiCount,
} from '@/lib/help/wiki-data';
import { auditFeedback } from '@/lib/feedback';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateSchema = z.object({
  title: z.string().trim().min(10).max(200),
  excerpt: z.string().trim().min(20).max(500),
  category: z.enum(['praticas', 'tradições', 'livros', 'pessoas', 'recursos', 'experiencias']),
  contentMarkdown: z.string().min(100).max(50_000),
  tags: z.array(z.string()).max(10).optional(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category');
  const featured = sp.get('featured') === 'true';
  const limit = Math.min(50, parseInt(sp.get('limit') ?? '30', 10));

  let data = WIKI_ARTICLES.filter((a) => a.status === 'published');
  if (category) data = getWikiByCategory(category as any);
  else if (featured) data = getFeaturedWiki();

  return ok(
    {
      total: totalWikiCount(),
      categories: WIKI_CATEGORIES,
      articles: data.slice(0, limit).map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        authorName: a.authorName,
        authorTradition: a.authorTradition,
        featured: a.featured,
        views: a.views,
        upvotes: a.upvotes,
        publishedAt: a.publishedAt,
        lastUpdated: a.lastUpdated,
        version: a.version,
        tags: a.tags,
      })),
    },
    {
      cache: {
        sMaxage: 120,
        staleWhileRevalidate: 300,
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'Faça login para criar um artigo na wiki.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido');
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  const data = parsed.data;

  // Cria registro (em produção: persistência em Postgres + enfileirar curadoria)
  const slug = data.title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);

  await auditFeedback(userId, 'wiki_article_create', {
    title: data.title,
    category: data.category,
    slug,
    contentLength: data.contentMarkdown.length,
  });

  return ok(
    {
      slug,
      status: 'in_review',
      message: 'Artigo criado. Curadoria editorial Iyá revisa em 3-7 dias úteis.',
    },
    { status: 201 },
  );
}
