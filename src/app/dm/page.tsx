// ============================================================================
// /dm — Index page (Server Component) — W90s-B
//
// Lista todas as threads do current user (carregadas de cookies/seed).
// Faz hydrate do DMThreadList com dados do engine.
//
// Decisões:
//   - Server Component (não há 'use client').
//   - Lê `userId` do cookie via `next/headers`.
//   - Renderiza 'use client' `<DMThreadsClient>` (que consume o engine + storage).
// ============================================================================

import { cookies } from 'next/headers';
import { DMThreadsClient } from './DMThreadsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Mensagens diretas · Akasha',
  description:
    'Suas conversas 1-on-1 na Akasha. Threads privadas entre exatamente 2 pessoas.',
  robots: { index: false, follow: false },
};

export default async function DMIndexPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('dm.userId')?.value ?? 'me';

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-4 md:py-6" data-testid="dm-index-page">
      <header className="mb-4">
        <h1 className="text-lg font-semibold sm:text-xl">Mensagens diretas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversas privadas — sempre entre 2 pessoas. Nada de grupos ou broadcast.
        </p>
      </header>
      <DMThreadsClient currentUserId={userId} />
    </main>
  );
}
