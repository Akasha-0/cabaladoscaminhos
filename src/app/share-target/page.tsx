import type { Metadata } from 'next';
import { ShareTargetClient } from './ShareTargetClient';

// ============================================================================
// /share-target — Página que renderiza dados compartilhados (Wave 20)
// ============================================================================
// Recebe query params: ?title=...&text=...&url=...
// Renderiza um card com preview + form pra criar post.
//
// Se o usuário não tem auth ou desiste, pode voltar ao feed.
// ============================================================================

export const metadata: Metadata = {
  title: 'Compartilhar para Akasha',
  description: 'Crie um post a partir de conteúdo compartilhado',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}

export default async function ShareTargetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ShareTargetClient
      title={params.title ?? ''}
      text={params.text ?? ''}
      url={params.url ?? ''}
    />
  );
}
