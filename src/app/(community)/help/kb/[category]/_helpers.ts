// ============================================================================
// Shared helpers para KB routes — Wave 36
// ============================================================================

import type { KbArticleFull } from '@/lib/help/kb-data';

export function articleSlugForArticle(a: KbArticleFull): string {
  return a.slug.split('/').pop() ?? a.slug;
}

export function categorySlugForArticle(a: KbArticleFull): string {
  return a.category.includes('/') ? a.category.split('/')[0] : a.category;
}
