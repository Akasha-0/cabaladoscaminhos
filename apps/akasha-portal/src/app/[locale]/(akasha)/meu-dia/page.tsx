/**
 * /meu-dia — redirected to /diario (v0.85.0)
 *
 * This page was functionally identical to /diario (both hit GET /api/akasha/mandato-do-dia).
 * Unified under /diario with mobile-first layout. Kept as redirect so existing
 * bookmarks and links continue working.
 */
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MeuDiaPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/diario`);
}
