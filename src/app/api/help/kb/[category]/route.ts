// ============================================================================
// API: GET /api/help/kb/[category] — Lista de artigos KB por categoria (Wave 36)
// ============================================================================
// Retorna lista de artigos (sem corpo — só metadados).

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import {
  KB_CATEGORIES,
  KB_ARTICLES,
  getKbByCategory,
  totalKbCount,
} from '@/lib/help/kb-data';

export const runtime = 'nodejs';
export const revalidate = 600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;

  const cat = KB_CATEGORIES.find(
    (c) => c.slug === category || c.slug.startsWith(`${category}/`),
  );
  if (!cat) {
    return fail(404, ErrorCode.NOT_FOUND, `Categoria '${category}' não encontrada`);
  }

  const articles = getKbByCategory(category);

  return ok(
    {
      category: cat,
      total: articles.length,
      totalAll: totalKbCount(),
      articles: articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        readingMinutes: a.readingMinutes,
        updatedAt: a.updatedAt,
        version: a.version,
        author: a.author,
        relatedSlugs: a.relatedSlugs,
      })),
    },
    {
      cache: {
        sMaxage: 600,
        staleWhileRevalidate: 1200,
      },
    },
  );
}
