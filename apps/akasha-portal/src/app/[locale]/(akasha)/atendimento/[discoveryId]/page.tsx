/**
 * /[locale]/(akasha)/atendimento/[discoveryId] — Wave 27.2 Drill-Down
 *
 * Página standalone que o Zelador acessa quando clica num Discovery no
 * /atendimento. Mostra TUDO sobre aquela síntese:
 *
 *   - ConvergenceView (Wave 25.2) — verdade universal + 5 vozes
 *   - ThoughtChainView (Wave 23.2) — cadeia de pensamento (5 steps)
 *   - Papers cited (Wave 27.3 — adapter stub) — abstracts expansíveis
 *   - Actions bar (Zelador: Cite | Save | Share)
 *
 * Server-side:
 *   1. Auth via cookie (mesmo padrão /atendimento, /discoveries/[id]).
 *   2. Carrega view-model via `loadDiscoveryViewModel` (adapter existente
 *      Wave 23.2 — `USE_REAL_DB=false` hoje, mock determinístico).
 *   3. 404 quando discoveryId não existe.
 *   4. Renderiza `<DiscoveryDetailClient>` com o model carregado.
 *
 * LGPD:
 *   - Adapter filtra PII — view-model tem só contexto derivado.
 *   - Server component não retorna nada de User row.
 *
 * Wave 27.2 constraints (ver plan):
 *   - Mobile-first 360px (DiscoveryDetailClient é stack vertical).
 *   - Universalista+visceral: 5 pilares SEM hierarquia, verdade
 *     universal em destaque.
 *   - i18n pt-BR+en via `discovery.detail.*` namespace (10 chaves).
 *   - LGPD: zero PII na response.
 */

import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DiscoveryDetailClient } from '@/components/akasha/discoveries/DiscoveryDetailClient';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { loadDiscoveryViewModel } from '@/lib/application/discoveries/adapter';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string; discoveryId: string }>;
  searchParams: Promise<{ source?: string; sessionId?: string }>;
}

export const metadata = {
  title: 'Detalhe da Descoberta — Akasha OS',
  description:
    'Cadeia de pensamento completa, papers citados e ações do Zelador para uma síntese da IA. (Wave 27.2, ADR-013).',
};

export default async function AtendimentoDiscoveryPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, discoveryId } = await params;
  const sp = await searchParams;

  // 1. Auth (cookie + header refreshed — mesmo padrão Wave 18+ / 22+ / 26+)
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access')) {
    redirect(`/${locale}/login`);
  }

  // 2. Validar discoveryId (mesmo bound check do /api/discoveries/[id])
  if (
    !discoveryId ||
    typeof discoveryId !== 'string' ||
    discoveryId.length === 0 ||
    discoveryId.length > 128
  ) {
    // ID inválido: redireciona para /atendimento em vez de 500.
    redirect(`/${locale}/atendimento`);
  }

  // 3. Carregar view-model via adapter existente (Wave 23.2).
  //    Mock determinístico hoje (`USE_REAL_DB=false`); quando
  //    Wave 20.2/21.1/21.2 mergearem, virar Prisma real sem mudar UI.
  const model = await loadDiscoveryViewModel(discoveryId, locale);

  // 4. 404 → redireciona para /atendimento com fallback gracioso.
  //    (Wave 22.2 lesson: telas de Zelador devem ser resilientes —
  //     não quebrar com id inexistente durante dev/preview.)
  if (!model) {
    redirect(`/${locale}/atendimento`);
  }

  // 5. Render client island com view-model já carregado.
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-4 sm:py-6"
      aria-labelledby="discovery-detail-title"
    >
      <Link
        href={`/${locale}/atendimento`}
        className="text-xs text-slate-400 hover:text-slate-200"
      >
        {locale === 'en' ? '← Back to attendance' : '← Voltar ao atendimento'}
      </Link>

      <DiscoveryDetailClient model={model} locale={locale} />

      {sp.sessionId ? (
        <footer className="mt-2 text-xs text-slate-500">
          {locale === 'en' ? 'Session' : 'Sessão'}:{' '}
          <span className="font-mono">{sp.sessionId}</span>
        </footer>
      ) : null}
    </main>
  );
}
