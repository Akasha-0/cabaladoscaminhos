/**
 * /meu-dia — Wave 9.1 One-Screen Hub
 *
 * Redesigned from the v0.85.0 redirect (which sent users to /diario).
 * Now: detects emotional state via 1 click and adapts the entire hub.
 *
 * Server-side work:
 *   - Auth check via JWT cookie (same as /dashboard)
 *   - Look up the user's display name from Prisma
 *   - Mount <MeuDiaHub> with `userName` + `locale`
 *
 * The hub itself is a client component because the emotional-state
 * picker reads localStorage and the BreathOrb uses window.matchMedia.
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { MeuDiaHub } from '@/components/akasha/my-day/MeuDiaHub';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Meu Dia — Akasha OS',
  description:
    'A tela que se adapta ao que você precisa hoje. Centro, ansiedade, direção ou exploração — um clique, conteúdo à medida.',
};

interface MeuDiaPageProps {
  params: Promise<{ locale: string }>;
}

function extractSubFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')) as {
      sub?: string;
    };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export default async function MeuDiaPage({ params }: MeuDiaPageProps) {
  const { locale } = await params;

  // Auth — same shape as /dashboard (Option C: middleware as single
  // verification source).
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;

  let userId: string | null = null;
  if (authStatus === 'refreshed') {
    userId = extractSubFromJwt(token);
  } else if (verifyAkashaToken(token, 'access')) {
    userId = extractSubFromJwt(token);
  }

  if (!userId) redirect(`/${locale}/login`);

  // Lazy-load the user record for the greeting. We import prisma at call
  // site so this file doesn't crash builds when the prisma client isn't
  // generated (mirrors how dashboard/page.tsx handles it).
  let userName = 'você';
  try {
    const { prisma } = await import('@/lib/infrastructure/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (user?.name) userName = user.name.split(' ')[0];
    else if (user?.email) userName = user.email.split('@')[0];
  } catch {
    // prisma unavailable in this build; fall back to "você".
  }

  return <MeuDiaHub locale={locale} userName={userName} />;
}