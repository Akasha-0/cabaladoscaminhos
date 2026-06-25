/**
 * /[locale]/(akasha)/admin/discoveries/[id] — Wave 27.4 (ADMIN Drill-Down).
 *
 * Página de auditoria ADMIN para uma síntese específica. Mostra TUDO
 * sobre um Discovery (chain of thought + papers + vozes + feedback events).
 *
 * Server-side flow:
 *   1. Verifica auth (cookie JWT — mesmo padrão /conta, /atendimento).
 *   2. Verifica role ADMIN (server-side, independente do layout).
 *   3. Carrega view-model via `loadDiscoveryViewModel` (adapter Wave 23.2).
 *   4. Carrega feedback events via Prisma (try-catch — graceful se
 *      FeedbackEvent não existir no client gerado).
 *   5. Renderiza `<AdminDiscoveryDetailClient>` com tudo.
 *
 * LGPD:
 *   - Adapter filtra PII do view-model (sem birthDate, nome, email).
 *   - Feedback events retornam só {id, rating, createdAt} — SEM userId,
 *     SEM nome, SEM email. Auditoria estritamente técnica.
 *   - Página inteira gated por ADMIN — acesso não-ADMIN = redirect /dashboard.
 *
 * Wave 27.4 constraints (ver plan):
 *   - Mobile-first 360px (AdminDiscoveryDetailClient é stack vertical).
 *   - Universalista+visceral: 5 pilares SEM hierarquia, verdade
 *     universal em destaque (ADR-013).
 *   - i18n pt-BR+en via `admin.discoveries.detail.*` namespace (10 chaves).
 *   - LGPD: zero PII na response (feedback events sem userId).
 *   - Wave 9-26 não regredir: só cria arquivos novos (page.tsx +
 *     AdminDiscoveryDetailClient.tsx + i18n).
 *
 * Diferenças vs /discoveries/[id] (Wave 23.2):
 *   - ADMIN only (gate role !== 'ADMIN' → redirect /dashboard).
 *   - Header com badge AUDIT (visceral — "auditoria completa").
 *   - + Voices section granular (audit per-pilar com symbol).
 *   - + Feedback events table (audit trail real, Wave 22.1).
 *
 * TODO Wave 21.2+ — quando schemas mergearem (DiscoveryChain etc),
 * trocar `loadDiscoveryViewModel` mock por Prisma real + join com
 * `feedbackEvents` direto.
 */
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AdminDiscoveryDetailClient } from '@/components/akasha/admin/AdminDiscoveryDetailClient';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { loadDiscoveryViewModel } from '@/lib/application/discoveries/adapter';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

interface AdminDiscoveryPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ source?: string }>;
}

export const metadata = {
  title: 'Detalhe da Descoberta (ADMIN) — Akasha OS',
  description:
    'Auditoria ADMIN completa da síntese: chain of thought, papers, 5 vozes e feedback events. (Wave 27.4, ADR-013).',
};

export default async function AdminDiscoveryDetailPage({
  params,
  searchParams,
}: AdminDiscoveryPageProps) {
  const { locale, id } = await params;
  const sp = await searchParams;

  // 1. Auth — mesmo padrão /conta, /atendimento, /admin/feedback
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access')) {
    redirect(`/${locale}/login`);
  }

  // 2. Validar id (mesmo bound check do /api/discoveries/[id])
  if (!id || typeof id !== 'string' || id.length === 0 || id.length > 128) {
    redirect(`/${locale}/admin/consciousness`);
  }

  // 3. Role ADMIN — server-side check (mesmo padrão /admin/feedback Wave 18.3)
  if (!token) redirect(`/${locale}/login`);
  const payload = verifyAkashaToken(token, 'access');
  if (!payload || !payload.sub) redirect(`/${locale}/login`);

  let caller: { name: string; email: string; role: string } | null = null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, name: true, email: true },
    });
    if (user?.role !== 'ADMIN') {
      redirect(`/${locale}/dashboard?forbidden=admin`);
    }
    caller = user;
  } catch {
    redirect(`/${locale}/login`);
  }

  // 4. Carregar view-model via adapter existente (Wave 23.2).
  //    Mock determinístico hoje (`USE_REAL_DB=false`).
  const model = await loadDiscoveryViewModel(id, locale);

  // 5. 404 → redireciona para /admin/consciousness com fallback gracioso.
  if (!model) {
    redirect(`/${locale}/admin/consciousness`);
  }

  // 6. Carregar feedback events para este discovery (Wave 22.1).
  //    targetType=DISCOVERY, targetId=discoveryId. Try-catch porque
  //    o model pode não estar gerado no client Prisma (D-054 PROPOSAL).
  let feedbackEvents: Array<{ id: string; rating: number; createdAt: string }> = [];
  try {
    // @ts-expect-error — feedbackEvent pode não existir no client gerado
    const rows = await prisma.feedbackEvent?.findMany({
      where: {
        targetType: 'DISCOVERY',
        targetId: id,
      },
      select: { id: true, rating: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    if (Array.isArray(rows)) {
      feedbackEvents = rows.map((r: { id: string; rating: number; createdAt: Date }) => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch {
    // Silencioso — UI mostra "sem feedback ainda" (FeedbackEvents empty state).
    feedbackEvents = [];
  }

  // 7. Render
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:py-6"
      aria-labelledby="admin-discovery-detail-title"
    >
      <Link
        href={`/${locale}/admin/consciousness`}
        className="text-xs text-violet-400 hover:text-violet-300"
      >
        {locale === 'en'
          ? '← Back to admin dashboard'
          : '← Voltar ao dashboard ADMIN'}
      </Link>

      <AdminDiscoveryDetailClient
        model={model}
        locale={locale}
        feedbackEvents={feedbackEvents}
      />

      <footer className="mt-2 border-t border-slate-800 pt-3 text-xs text-slate-500">
        {locale === 'en' ? 'Auditor' : 'Auditor'}:{' '}
        <span className="font-mono">{caller?.email ?? 'admin'}</span>
        {sp.source ? (
          <span className="ml-2 text-slate-600">· source: {sp.source}</span>
        ) : null}
      </footer>
    </main>
  );
}