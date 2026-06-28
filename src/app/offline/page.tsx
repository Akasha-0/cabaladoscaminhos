import type { Metadata } from 'next';
import { OfflinePageClient } from './OfflinePageClient';

// ============================================================================
// /offline — Next.js page para fallback do SW (Wave 20)
// ============================================================================
// Quando o SW não consegue buscar a página (offline + sem cache), serve esta
// rota. Já está em PRECACHE_URLS do sw.js (sempre disponível).
//
// IMPORTANTE: Esta página é renderizada server-side na primeira vez, depois
// cacheada. O client component lida com o retry + lista de items cached.
// ============================================================================

export const metadata: Metadata = {
  title: 'Offline — Akasha Portal',
  description: 'Você está sem conexão. Suas práticas continuam acessíveis.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';

export default function OfflinePage() {
  return <OfflinePageClient />;
}
