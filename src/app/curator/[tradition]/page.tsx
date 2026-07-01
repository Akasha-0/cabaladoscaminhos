// ============================================================================
// /curator/[tradition] — Workspace do curador (Wave 35)
// ============================================================================// Server Component — fetch inicial da fila de artigos pendentes e
// posts sinalizados da tradição foco do curador logado.
//
// Acesso:
//   - Resolve sessão via resolveCurator(tradition)
//   - Renderiza fila + filtros + ações client-side
//
// Filtros via search params:
//   status     — draft | pending | approved | rejected (artigo)
//   priority   — high | normal | low
//
// Aprova/rejeita: POST /api/curators/[tradition]/approve-article.
// ============================================================================

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { resolveCurator, traditionLabel } from '@/lib/curators/service';
import { ArticleActions } from '@/components/curator/ArticleActions';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Workspace · Curador',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ tradition: string }>;
  searchParams: Promise<{ status?: string; priority?: string }>;
}

export default async function CuratorWorkspacePage({ params, searchParams }: PageProps) {
  const { tradition } = await params;
  const sp = await sp_safe(searchParams);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold text-slate-100">Workspace do Curador</h1>
        <p className="mt-3 text-slate-400">
          Você precisa estar logado para acessar a curadoria de {traditionLabel(tradition)}.
        </p>
        <a
          href={`/login?returnUrl=/curator/${encodeURIComponent(tradition)}`}
          className="mt-6 inline-block rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Entrar
        </a>
      </main>
    );
  }

  const resolution = await resolveCurator(
    data.user.id,
    (data.user.email ?? '').toLowerCase(),
    tradition
  );

  if (!resolution.ok || !resolution.curator) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold text-slate-100">Workspace do Curador</h1>
        <p className="mt-3 text-slate-400">
          Esta página é exclusiva para curadores convidados de {traditionLabel(tradition)}.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Motivo: {resolution.reason ?? 'unknown'}. Se você acredita que deveria ter acesso,
          responda o convite original ou escreva para curadoria@cabaladoscaminhos.app.
        </p>
      </main>
    );
  }

  const curator = resolution.curator;
  const isCrossTradition = curator.tradition !== tradition;

  // Fila de artigos da tradição
  const articleStatus = sp.status === 'pending' ? null : sp.status;
  const articles = await prisma.article
    .findMany({
      where: {
        tradition,
        ...(articleStatus === 'approved' ? { publishedAt: { not: null } } : {}),
        ...(articleStatus === 'rejected' ? { curatedBy: { not: null }, publishedAt: null } : {}),
        ...(articleStatus === 'draft' ? { publishedAt: null } : {}),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        authors: true,
        year: true,
        evidenceLevel: true,
        publishedAt: true,
        curatedBy: true,
        createdAt: true,
      },
      orderBy: [{ publishedAt: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    })
    .catch(() => []);

  // Posts sinalizados da tradição (busca por tags)
  const flaggedPosts = await prisma.post
    .findMany({
      where: {
        group: { slug: tradition },
        status: { not: 'HIDDEN' },
        flags: { some: { status: 'PENDING' } },
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        flags: {
          select: { id: true, reason: true, createdAt: true },
          where: { status: 'PENDING' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    .catch(() => []);

  // Stats rápidas
  const stats = {
    pendingArticles: articles.filter((a) => !a.publishedAt).length,
    approvedThisMonth: articles.filter((a) =>
      a.publishedAt && a.publishedAt.getTime() > Date.now() - 30 * 24 * 3600 * 1000
    ).length,
    flaggedPosts: flaggedPosts.length,
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-violet-400">
          Curadoria · {traditionLabel(tradition)}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-100">
          Olá, {curator.curatorRole.replace('CURATOR_', '').replace('GUEST_CURATOR', 'Convidado(a)')}
        </h1>
        {isCrossTradition && (
          <p className="mt-2 rounded-md border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-200">
            Você está revisando <strong>{traditionLabel(tradition)}</strong> como curador(a) cross-tradição.
            Suas aprovações são registradas com audit trail diferenciado.
          </p>
        )}
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Artigos pendentes" value={stats.pendingArticles} accent="amber" />
        <Stat label="Aprovados nos últimos 30d" value={stats.approvedThisMonth} accent="emerald" />
        <Stat label="Posts sinalizados" value={stats.flaggedPosts} accent="violet" />
      </section>

      <section className="mb-10">
        <header className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Fila de artigos</h2>
          <span className="text-xs text-slate-500">{articles.length} itens</span>
        </header>
        {articles.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum artigo na fila para esta tradição.</p>
        ) : (
          <ul className="space-y-3">
            {articles.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <a
                      href={`/biblioteca/${a.slug}`}
                      className="text-base font-semibold text-slate-100 hover:text-violet-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.title}
                    </a>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.authors.slice(0, 3).join(', ')}
                      {a.authors.length > 3 ? ' et al.' : ''} · {a.year} · {a.evidenceLevel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-300">{a.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    {a.publishedAt ? (
                      <span className="rounded bg-emerald-900/40 px-2 py-0.5 text-emerald-200">
                        Aprovado
                      </span>
                    ) : (
                      <span className="rounded bg-amber-900/40 px-2 py-0.5 text-amber-200">
                        Pendente
                      </span>
                    )}
                    <span className="text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-800 pt-3">
                  <ArticleActions articleId={a.id} tradition={tradition} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <header className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Posts sinalizados</h2>
          <span className="text-xs text-slate-500">{flaggedPosts.length} pendentes</span>
        </header>
        {flaggedPosts.length === 0 ? (
          <p className="text-sm text-slate-500">Sem posts sinalizados nesta tradição.</p>
        ) : (
          <ul className="space-y-3">
            {flaggedPosts.map((p) => (
              <li key={p.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <a
                  href={`/comunidade/post/${p.id}`}
                  className="text-sm font-semibold text-slate-100 hover:text-violet-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  {p.title || '(sem título)'}
                </a>
                <ul className="mt-2 space-y-1 text-xs text-slate-400">
                  {p.flags.map((f) => (
                    <li key={f.id}>• {f.reason}</li>
                  ))}
                </ul>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{p.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Helpers (client components) — minimal client islands
// ---------------------------------------------------------------------------

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'amber' | 'emerald' | 'violet';
}) {
  const tone =
    accent === 'amber'
      ? 'border-amber-800/50 bg-amber-900/20 text-amber-200'
      : accent === 'emerald'
      ? 'border-emerald-800/50 bg-emerald-900/20 text-emerald-200'
      : 'border-violet-800/50 bg-violet-900/20 text-violet-200';
  return (
    <div className={`rounded-lg border p-4 ${tone}`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

async function sp_safe(sp: Promise<{ status?: string; priority?: string }>) {
  try {
    return await sp;
  } catch {
    return {} as { status?: string; priority?: string };
  }
}
