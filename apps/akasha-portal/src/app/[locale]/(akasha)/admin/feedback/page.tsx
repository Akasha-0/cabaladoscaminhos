/**
 * /[locale]/(akasha)/admin/feedback — Wave 18.3
 *
 * Dashboard de analytics de FeedbackEntry (Wave 13.5) para ADMIN.
 *
 * Server component:
 *   1. Verifica auth (mesmo padrão /conta)
 *   2. Verifica role ADMIN (server-side, independente do layout)
 *   3. Faz fetch ao /api/admin/feedback/analytics (server-side fetch
 *      reaproveitando o handler — sem duplicar lógica SQL)
 *   4. Renderiza FeedbackAnalyticsClient com os dados
 *
 * LGPD: nunca recebe PII da rota de analytics. Apenas agregados +
 * messageId opaco + snippet truncado.
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import FeedbackAnalyticsClient from '@/components/akasha/admin/FeedbackAnalyticsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Feedback Analytics — Akasha Admin',
  description: 'Aggregated dashboard of user feedback (Wave 13.5).',
};

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ days?: string }>;
};

export default async function AdminFeedbackPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const daysRaw = sp.days;
  const days = clampDays(daysRaw);

  // 1. Auth (mesmo padrão /conta)
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // 2. Role ADMIN — server-side. Lemos direto do User.role.
  if (!token) redirect(`/${locale}/login`);
  const payload = verifyAkashaToken(token, 'access');
  if (!payload?.sub) redirect(`/${locale}/login`);
  const caller = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true, name: true, email: true },
  });
  if (caller?.role !== 'ADMIN') {
    redirect(`/${locale}/dashboard?forbidden=admin`);
  }

  // 3. Fetch server-side à própria rota. Reaproveita a lógica do handler
  //    (single source of truth). Cookies passam para o sub-request.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const requestHeaders = {
    Cookie: token.startsWith('__Host-') ? `${token}` : `__Host-akasha_session=${token}`,
  };

  let payload_:
    | {
        avgRating: { up: number; down: number };
        totalFeedback: number;
        trendLast30Days: Array<{
          date: string;
          upCount: number;
          downCount: number;
          ratio: number;
        }>;
        topDownMessages: Array<{
          messageId: string;
          downCount: number;
          lastOccurredAt: string;
          snippet: string;
        }>;
        byPilar: Record<string, number>;
      }
    | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/admin/feedback/analytics?days=${days}`, {
      headers: requestHeaders,
      cache: 'no-store',
    });
    if (!res.ok) {
      fetchError = `Analytics returned ${res.status}`;
    } else {
      payload_ = await res.json();
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : 'fetch_failed';
  }

  return (
    <FeedbackAnalyticsClient
      locale={locale}
      days={days}
      data={payload_}
      error={fetchError}
      callerName={caller?.name ?? caller?.email ?? 'Admin'}
    />
  );
}

function clampDays(raw: string | undefined): number {
  if (!raw) return 30;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 30;
  return Math.max(1, Math.min(365, n));
}