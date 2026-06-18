import { AkashaInputSchema, calcular } from '@akasha/core';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/akasha/dashboard/Dashboard';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';

export const metadata = {
  title: 'Dashboard | Akasha OS',
  description: 'Sua Mandala Akáshica — os 5 pilares da sua existência.',
};

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

function parseHora(time: string | null | undefined): string | undefined {
  if (!time) return undefined;
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!m) return undefined;
  return `${m[1]}:${m[2]}`;
}

export default async function LocalizedDashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;

  // Option C: middleware is the single auth verification source.
  // When authStatus === 'refreshed', middleware just ran /auth/refresh and the
  // new access token is already in the cookie. We do a decode-only (no crypto verify)
  // to extract userId for Prisma queries — trust the refreshed cookie.
  let payload: { sub: string; email?: string } | null = null;
  if (authStatus === 'refreshed') {
    // Lightweight decode: extract sub + email without crypto verification.
    // Middleware already verified this token when setting X-Akasha-Auth: refreshed.
    // Using email prefix for greeting fallback when user.name is null in DB.
    try {
      // atob() is available in Edge Runtime; Buffer is Node.js-only.
      const decoded = JSON.parse(atob(token?.split('.')[1] ?? '')) as {
        sub?: string;
        email?: string;
      };
      payload = decoded?.sub ? { sub: decoded.sub, email: decoded.email } : null;
    } catch {
      payload = null;
    }
  } else {
    const verified = verifyAkashaToken(token, 'access');
    if (verified) {
      payload = { sub: verified.sub, email: verified.email };
    } else {
      payload = null;
    }
  }

  if (!payload) redirect(`/${locale}/login`);

  const [user, birthChart] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.sub },
      select: { name: true, birthDate: true, birthTime: true, birthCity: true },
    }),
    prisma.birthChart.findUnique({
      where: { userId: payload.sub },
    }),
  ]);

  let initialPilares = null;
  if (birthChart && user?.birthDate) {
    const inputParse = AkashaInputSchema.safeParse({
      nome: user.name,
      data_nascimento: user.birthDate.toISOString().split('T')[0],
      hora_nascimento: parseHora(user.birthTime),
      local_nascimento: user.birthCity ?? 'local não informado',
      intencao_inicial: 'buscar clareza para o dia',
    });

    if (inputParse.success) {
      try {
        const leitura = await calcular(inputParse.data);
        initialPilares = JSON.parse(JSON.stringify(leitura.pilares));
      } catch (err) {
        console.error('[DashboardPage] calcular() failed:', err);
      }
    }
  }

  return (
    <Dashboard
      userId={payload.sub}
      userName={user?.name ?? (payload?.email ? payload.email.split('@')[0] : 'Viajante')}
      initialPilares={initialPilares}
      locale={locale}
    />
  );
}
