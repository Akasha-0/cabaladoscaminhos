import { cookies, headers } from 'next/headers';
import { AkashaLayoutClient } from '@/components/akasha/AkashaLayoutClient';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';

/**
 * (akasha) group layout inside the [locale] segment.
 */
export default async function AkashaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Always verify the token. When middleware refreshed an expired token (authStatus='refreshed'),
  // the 303 redirect carries fresh Set-Cookie — the redirect target request arrives with valid
  // cookies. verifyAkashaToken therefore succeeds and user renders correctly.
  // Previous: authStatus === 'refreshed' ? null : ... set payload=null, causing 'Viajante' flash.
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = verifyAkashaToken(token, 'access');

  let user = null;
  if (payload?.sub) {
    user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        name: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
      },
    });
  }

  return (
    <AkashaLayoutClient locale={locale} user={user}>
      {children}
    </AkashaLayoutClient>
  );
}
