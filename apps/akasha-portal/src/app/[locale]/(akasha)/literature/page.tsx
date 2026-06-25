/**
 * Knowledge Browser — Wave 28.6
 *
 * Server shell para /literature. Responsabilidades:
 *   1. Auth (cookie + headers — padrão /meu-dia, /diario, /mentor).
 *   2. Carrega papers + facetas via `loadLiteraturePapers` /
 *      `loadLiteratureFacets` (server-side; LGPD-safe — sem PII no HTML).
 *   3. Renderiza <KnowledgeBrowserClient> (client island) com os
 *      papers já filtrados pelo servidor.
 *
 * Wave 28.6 (ADR-013: consciência viva, papers como evidência universal).
 * Universalista+visceral: papers como diálogo das 5 vozes da sabedoria,
 * com prática Akasha aplicada.
 *
 * Filtros suportados via searchParams:
 *   year (number) | pilar (Pilar|'all') | journal (string|'all') |
 *   hasPractice ('true'|'false'|'all')
 *
 * Drill-down é client-side (usa /api/literature/[id]/discoveries +
 * /api/literature/[id]/sessions quando auth estiver disponível).
 *
 * Layout: server shell + client island (Wave 28.1 pattern, confirmado).
 * LGPD: 0 PII no HTML server-rendered. 0 fetch no client island (props only).
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import type { Pilar } from '@/lib/grimoire/significados-curados';

import {
  loadLiteratureFacets,
  loadLiteraturePapers,
  type LiteratureFilters,
} from '@/components/akasha/literature/LiteraturePapersAdapter';
import { KnowledgeBrowserClient } from '@/components/akasha/literature/KnowledgeBrowserClient';

export const metadata = {
  title: 'Biblioteca Viva — Akasha',
  description:
    'Pesquisa científica revisada por pares, indexada por Pilar. Cada paper ancora uma verdade universal em evidência.',
  openGraph: {
    title: 'Biblioteca Viva — Akasha',
    description: 'Papers revisados por pares em diálogo com os 5 Pilares.',
    type: 'website',
  },
};

/**
 * Parsing defensivo dos searchParams (string | string[] | undefined
 * — Next.js 15+ retorna Promise + tipos permissivos).
 */
function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>
): LiteratureFilters {
  const yearStr = pickFirst(sp.year);
  const year = yearStr ? Number.parseInt(yearStr, 10) : NaN;
  const pilarRaw = pickFirst(sp.pilar) ?? 'all';
  const journalRaw = pickFirst(sp.journal) ?? 'all';
  const hasPracticeRaw = pickFirst(sp.hasPractice) ?? 'all';

  return {
    year: Number.isFinite(year) ? year : undefined,
    pilar:
      pilarRaw === 'cabala' ||
      pilarRaw === 'astrologia' ||
      pilarRaw === 'tantrica' ||
      pilarRaw === 'odu' ||
      pilarRaw === 'iching'
        ? (pilarRaw as Pilar)
        : 'all',
    journal: journalRaw,
    hasPractice:
      hasPracticeRaw === 'true' ? true : hasPracticeRaw === 'false' ? false : undefined,
  };
}

export default async function LiteraturePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const filters = parseFilters(sp);

  // ── Auth (padrão /meu-dia, /diario, /mentor) ────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access'))
    redirect(`/${locale}/login`);

  // ── Data (server-side; LGPD-safe) ──────────────────────────────────────
  const [papers, facets] = await Promise.all([
    loadLiteraturePapers({ filters, locale }),
    loadLiteratureFacets(),
  ]);

  return (
    <KnowledgeBrowserClient
      locale={locale}
      papers={papers}
      facets={facets}
      activeFilters={filters}
    />
  );
}
