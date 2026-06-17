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
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  let payload = authStatus === 'refreshed' ? null : verifyAkashaToken(token, 'access');
  if (!payload) redirect(`/${locale}/login`);
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
