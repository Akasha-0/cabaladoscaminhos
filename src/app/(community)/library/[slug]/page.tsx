// ============================================================================
// LIBRARY DETAIL — /library/[slug]  (Wave 29 — Knowledge Base)
// ============================================================================
// Página de detalhe do artigo. Server-side render do slug inicial para SEO,
// client-side fetch via useArticleDetail para refresh + métricas.
// ============================================================================

import { ArticleDetail } from '@/components/library/ArticleDetail';
import { ArticleDetailSkeleton, ArticleDetailError } from './states';
import { LibraryDetailClient } from './client';


export const dynamic = 'force-dynamic';

// ============================================================================
// Page (Server Component)
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryArticlePage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.trim().length === 0) {
    return <ArticleDetailError message="Slug inválido" />;
  }

  return <LibraryDetailClient slug={slug} />;
}

// Re-export para tree-shaking
export { ArticleDetail, ArticleDetailSkeleton, ArticleDetailError };