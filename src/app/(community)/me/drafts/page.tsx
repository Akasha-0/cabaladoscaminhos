// ============================================================================
// /me/drafts — Lista de rascunhos + posts agendados (2026-06-27, Onda 14b)
// ============================================================================
// Server Component (default Next.js App Router).
// - Carrega drafts do viewer via Prisma
// - Carrega posts SCHEDULED do viewer (próximas publicações)
// - Renderiza <DraftEditor> (client) com o draft selecionado
//
// Fluxo:
//   1) Usuário clica em um draft na lista lateral → ativa o editor
//   2) Auto-save roda a cada 5s enquanto digita
//   3) "Publicar" → POST /api/posts com o conteúdo
//   4) "Agendar" (em posts já publicados) → ScheduleDialog
// ============================================================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import { DraftEditorClient } from './DraftEditorClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meus rascunhos — Akasha',
  description: 'Rascunhos e posts agendados',
};

function formatDate(d: Date): string {
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function MeDraftsPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect('/login?next=/me/drafts');
  }

  // Drafts (mais recentes primeiro)
  const drafts = await prisma.draft.findMany({
    where: { authorId: viewer.id },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  // Posts agendados (scheduledFor no futuro)
  const scheduled = await prisma.post.findMany({
    where: {
      authorId: viewer.id,
      status: 'SCHEDULED',
      scheduledFor: { gt: new Date() },
    },
    orderBy: { scheduledFor: 'asc' },
    take: 25,
    select: {
      id: true,
      title: true,
      content: true,
      scheduledFor: true,
      tradition: true,
      topic: true,
    },
  });

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 focus:outline-none">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl dark:text-zinc-100">
            Meus rascunhos
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            {drafts.length} {drafts.length === 1 ? 'rascunho' : 'rascunhos'}
            {scheduled.length > 0 && (
              <>
                {' · '}
                {scheduled.length} agendado
                {scheduled.length === 1 ? '' : 's'}
              </>
            )}
          </p>
        </div>
        <Link
          href="/me/drafts/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + Novo
        </Link>
      </header>

      {scheduled.length > 0 && (
        <section
          aria-labelledby="scheduled-heading"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30"
        >
          <h2
            id="scheduled-heading"
            className="text-sm font-semibold text-amber-900 dark:text-amber-200"
          >
            Publicações agendadas
          </h2>
          <ul className="mt-2 space-y-2">
            {scheduled.map((p) => (
              <li
                key={p.id}
                className="rounded-md border border-amber-200 bg-white p-2 text-sm dark:border-amber-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {p.content.slice(0, 80)}
                    {p.content.length > 80 ? '…' : ''}
                  </span>
                  <span className="shrink-0 text-xs text-amber-700 dark:text-amber-300">
                    {p.scheduledFor ? formatDate(p.scheduledFor) : '—'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="drafts-heading" className="flex flex-col gap-2">
        <h2
          id="drafts-heading"
          className="sr-only"
        >
          Lista de rascunhos
        </h2>
        {drafts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhum rascunho ainda. Toque em <strong>+ Novo</strong> para começar.
          </div>
        ) : (
          drafts.map((d) => (
            <details
              key={d.id}
              className="group rounded-lg border border-zinc-200 bg-white open:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {d.title || d.content.slice(0, 60) || '(sem conteúdo)'}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {formatDate(d.updatedAt)}
                </span>
              </summary>
              <div className="border-t border-zinc-200 dark:border-zinc-800">
                <DraftEditorClient
                  draftId={d.id}
                  initialTitle={d.title}
                  initialContent={d.content}
                  initialTradition={d.tradition}
                  initialTopic={d.topic}
                  initialTags={d.tags ?? []}
                />
              </div>
            </details>
          ))
        )}
      </section>
    </main>
  );
}
