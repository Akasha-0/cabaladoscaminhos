/**
 * /[locale]/(akasha)/discoveries/[id] — Wave 23.2 (UI Cadeia Viva)
 *
 * Página standalone que renderiza o ThoughtChainView para uma
 * DiscoveryChain específica. URL canônica para Zelador/admin acessarem
 * a cadeia de pensamento de uma síntese.
 *
 * Padrão: server component valida auth JWT (mesmo do /mandala, /meu-dia,
 * /admin) e renderiza client island com o ThoughtChainView.
 *
 * Integrações (Wave 22.2 + Wave 21.2):
 *   - /atendimento/[sessionId] (Wave 22.2) — linka aqui com
 *     `?source=attendance&discoveryId=...` para abrir o chain do
 *     discovery ativo da sessão.
 *   - /admin/discoveries (Wave 21.2) — linka com `?source=admin&...`
 *     para auditoria de cadeias.
 */
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ThoughtChainView } from '@/components/akasha/discoveries/ThoughtChainView';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const dynamic = 'force-dynamic';

interface DiscoveryPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ source?: string; sessionId?: string }>;
}

export default async function DiscoveryPage({ params, searchParams }: DiscoveryPageProps) {
  const { locale, id } = await params;
  const sp = await searchParams;

  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;

  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access')) {
    redirect(`/${locale}/login`);
  }

  const sourceLabel =
    sp.source === 'attendance'
      ? 'vindo do atendimento'
      : sp.source === 'admin'
        ? 'vindo do admin'
        : null;

  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6"
      aria-labelledby="discovery-page-title"
    >
      <header className="flex flex-col gap-1">
        <Link
          href={`/${locale}/mandala`}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          ← Voltar pra Mandala
        </Link>
        <h1
          id="discovery-page-title"
          className="text-2xl font-semibold text-slate-50"
        >
          Cadeia de Descoberta
        </h1>
        {sourceLabel ? (
          <p className="text-sm text-slate-400">{sourceLabel}</p>
        ) : null}
        <p className="font-mono text-xs text-slate-500">
          {id}
        </p>
      </header>

      <ThoughtChainView discoveryId={id} locale={locale} />

      {sp.sessionId ? (
        <footer className="mt-2 text-xs text-slate-500">
          Sessão: <span className="font-mono">{sp.sessionId}</span>
        </footer>
      ) : null}
    </main>
  );
}