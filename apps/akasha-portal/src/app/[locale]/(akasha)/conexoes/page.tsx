import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import ConexoesClient from '@/components/akasha/ConexoesClient';
import { prisma } from '@/lib/infrastructure/prisma';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export default async function ConexoesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  // Option C: trust X-Akasha-Auth header instead of re-verifying on every render.
  let userId: string;
  if (authStatus === 'refreshed') {
    try {
      const decoded = JSON.parse(Buffer.from(token?.split('.')[1] ?? '', 'base64').toString('utf8')) as { sub?: string };
      userId = decoded?.sub ?? '';
    } catch {
      userId = '';
    }
  } else {
    const payload = verifyAkashaToken(token, 'access');
    if (!payload) redirect(`/${locale}/login`);
    userId = payload!.sub;
  }
  const userId = payload!.sub;

  let userProfile: {
    name: string;
    birthDate: string | null;
    birthTime: string | null;
    birthCity: string | null;
    birthLatitude: number | null;
    birthLongitude: number | null;
    birthTimezone: string | null;
  };

  let fetchedUser: {
    name: string | null;
    birthDate: Date | null;
    birthTime: string | null;
    birthCity: string | null;
    birthLatitude: number | null;
    birthLongitude: number | null;
    birthTimezone: string | null;
  } | null = null;

  try {
    fetchedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthLatitude: true,
        birthLongitude: true,
        birthTimezone: true,
      },
    });
    if (!fetchedUser) {
      redirect(`/${locale}/login?return=${encodeURIComponent('/' + locale + '/conexoes')}`);
    }
    userProfile = {
      name: fetchedUser.name ?? '',
      birthDate: fetchedUser.birthDate ? fetchedUser.birthDate.toISOString().split('T')[0] : null,
      birthTime: fetchedUser.birthTime ?? null,
      birthCity: fetchedUser.birthCity ?? null,
      birthLatitude: fetchedUser.birthLatitude ?? null,
      birthLongitude: fetchedUser.birthLongitude ?? null,
      birthTimezone: fetchedUser.birthTimezone ?? null,
    };
  } catch {
    redirect(`/${locale}/login?return=${encodeURIComponent('/' + locale + '/conexoes')}`);
  }


  return <ConexoesClient userProfile={userProfile} />;
}
