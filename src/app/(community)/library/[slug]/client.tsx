// ============================================================================
// LibraryDetailClient — Client component da página de detalhe (Wave 29)
// ============================================================================
// Faz fetch inicial server-side (passado via prop) + client-side revalidation.
// ============================================================================

'use client';

import React from 'react';
import { ArticleDetail } from '@/components/library/ArticleDetail';
import { useArticleDetail } from '@/hooks/use-articles';
import { ArticleDetailSkeleton, ArticleDetailError } from './states';

// ============================================================================
// Component
// ============================================================================

export interface LibraryDetailClientProps {
  slug: string;
}

export function LibraryDetailClient({ slug }: LibraryDetailClientProps) {
  const { article, loading, error } = useArticleDetail(slug);

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    return (
      <ArticleDetailError
        message={error ?? 'Artigo não encontrado'}
        slug={slug}
      />
    );
  }

  return <ArticleDetail article={article} />;
}